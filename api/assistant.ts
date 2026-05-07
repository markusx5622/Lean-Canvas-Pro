// ── Vercel Serverless Function: /api/assistant ────────────────────────────────
// This file is the Vercel-compatible twin of the Express route in server.ts.
// Vercel automatically compiles files under api/ into serverless functions.
// The Express route in server.ts continues to serve self-hosted deployments
// (Railway, Fly.io, VPS) and local development.
//
// Auth model: the client sends the active Supabase session JWT in the
// Authorization header.  The function verifies it server-side using the same
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars that are already
// required for the rest of the app (no new variables needed).
//
// The Gemini API key (GEMINI_API_KEY) is kept strictly server-side – it has no
// VITE_ prefix so it is never bundled into the browser build.

import { createClient } from '@supabase/supabase-js';
import type { Request, Response } from 'express';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface BlockContext {
  id: number;
  title: string;
  content: string;
}

interface CanvasContext {
  name: string;
  blocks: BlockContext[];
  filledCount: number;
  totalBlocks: number;
  auditScore?: number;
  auditVerdict?: string;
}

interface AssistantRequestBody {
  messages: ChatMessage[];
  canvasContext: CanvasContext;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_MESSAGES = 40;
const MAX_CONTENT_LENGTH = 2000;
const MAX_TOTAL_CONTEXT_LENGTH = 12_000;
/** Abort the Gemini fetch if no response arrives within this window. */
const GEMINI_TIMEOUT_MS = 25_000;

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildSystemInstruction(ctx: CanvasContext): string {
  const filledBlocks = ctx.blocks.filter((b) => b.content.trim().length > 0);
  const emptyBlocks = ctx.blocks.filter((b) => b.content.trim().length === 0);

  const blocksText = filledBlocks
    .map((b) => `## ${b.title}\n${b.content.slice(0, MAX_CONTENT_LENGTH)}`)
    .join('\n\n');

  const emptyText =
    emptyBlocks.length > 0
      ? `\nBloques vacíos (sin contenido aún): ${emptyBlocks.map((b) => b.title).join(', ')}.`
      : '';

  const auditText =
    ctx.auditScore !== undefined
      ? `\nAuditoría heurística reciente: ${ctx.auditScore}/100 (${ctx.auditVerdict ?? ''}).`
      : '';

  const canvasSection =
    filledBlocks.length > 0
      ? `CONTENIDO DEL CANVAS:\n\n${blocksText}`
      : 'El canvas está vacío por ahora. Ayuda al usuario a empezar.';

  const base = `Eres un asistente estratégico experto en metodología Lean Canvas y startups. \
Tu rol es ayudar al usuario a mejorar, analizar y fortalecer su Lean Canvas de forma práctica y accionable. \
Responde siempre en el mismo idioma que use el usuario (español por defecto). \
Sé conciso, directo y orientado a la acción. Cuando detectes problemas, ofrece alternativas concretas. \
No inventes datos que no estén en el canvas; trabaja siempre sobre el contenido real.

CANVAS ACTIVO: "${ctx.name}"
Progreso: ${ctx.filledCount}/${ctx.totalBlocks} bloques completados.${auditText}${emptyText}

${canvasSection}`;

  return base.slice(0, MAX_TOTAL_CONTEXT_LENGTH);
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req: Request, res: Response) {
  // Only POST is accepted.
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido.' });
    return;
  }

  // ── Auth guard ───────────────────────────────────────────────────────────────
  // The client attaches the active Supabase session JWT as a Bearer token.
  // We verify it against the same Supabase project used by the frontend,
  // reusing the VITE_SUPABASE_* variables that are already required for the app.
  const authHeader = req.headers.authorization as string | undefined;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'No autenticado.' });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const sb = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user },
      error,
    } = await sb.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({ error: 'No autenticado.' });
      return;
    }
  }
  // If Supabase is not configured (local dev without env vars) the token
  // presence check above is still enforced – callers must always send a header.

  // ── API key check ────────────────────────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'El asistente no está configurado en este entorno.' });
    return;
  }

  // ── Input validation ─────────────────────────────────────────────────────────
  const body = req.body as AssistantRequestBody;

  if (
    !body ||
    !Array.isArray(body.messages) ||
    body.messages.length === 0 ||
    !body.canvasContext ||
    typeof body.canvasContext !== 'object'
  ) {
    res.status(400).json({ error: 'Petición inválida.' });
    return;
  }

  if (body.messages.length > MAX_MESSAGES) {
    res.status(400).json({ error: 'Demasiados mensajes en el historial.' });
    return;
  }

  // ── Build Gemini request ─────────────────────────────────────────────────────
  const systemInstruction = buildSystemInstruction(body.canvasContext);

  const contents = body.messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content.slice(0, MAX_CONTENT_LENGTH) }],
  }));

  const geminiPayload = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  };

  // ── Call Gemini with timeout ─────────────────────────────────────────────────
  // AbortController ensures the serverless function never hangs indefinitely.
  // The API key is sent as a request header (x-goog-api-key) instead of a
  // query-string parameter so it does not appear in access logs or Sentry breadcrumbs.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  const geminiEndpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  console.log(
    `[assistant] Sending request to Gemini — messages: ${body.messages.length}, endpoint: ${geminiEndpoint}`
  );

  try {
    const geminiRes = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(geminiPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();

      // Classify the error to make the root cause immediately visible in logs.
      let category: string;
      let clientHint: string;
      if (geminiRes.status === 400) {
        category = 'INVALID_REQUEST (400) — bad payload or unrecognized field (e.g. system_instruction on v1 endpoint)';
        clientHint = 'Payload rechazado por Gemini (400). Revisa los logs del servidor.';
      } else if (geminiRes.status === 401) {
        category = 'UNAUTHENTICATED (401) — API key missing or malformed';
        clientHint = 'API key de Gemini no válida o ausente (401).';
      } else if (geminiRes.status === 403) {
        category = 'PERMISSION_DENIED (403) — API key invalid/revoked or Generative Language API not enabled in GCP';
        clientHint = 'Acceso denegado por Gemini (403). Verifica la API key y que la Generative Language API esté habilitada.';
      } else if (geminiRes.status === 429) {
        category = 'RESOURCE_EXHAUSTED (429) — quota or rate limit exceeded';
        clientHint = 'Cuota de Gemini agotada (429). Inténtalo más tarde.';
      } else if (geminiRes.status >= 500) {
        category = `SERVER_ERROR (${geminiRes.status}) — Gemini-side problem`;
        clientHint = `Error interno de Gemini (${geminiRes.status}). Inténtalo de nuevo.`;
      } else {
        category = `UNEXPECTED (${geminiRes.status})`;
        clientHint = `Error inesperado de Gemini (${geminiRes.status}). Inténtalo de nuevo.`;
      }

      console.error('[assistant] Gemini error — category:', category);
      console.error('[assistant] Gemini error — status:', geminiRes.status);
      console.error('[assistant] Gemini error — body:', errText);

      res.status(502).json({ error: clientHint });
      return;
    }

    const geminiData = (await geminiRes.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!reply) {
      res.status(502).json({ error: 'El asistente no devolvió una respuesta válida.' });
      return;
    }

    res.json({ reply });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('[assistant] Gemini request timed out');
      res.status(504).json({ error: 'El asistente tardó demasiado en responder. Inténtalo de nuevo.' });
    } else {
      console.error('[assistant] Fetch error:', err);
      res.status(502).json({ error: 'Error de red al contactar con el asistente.' });
    }
  }
}
