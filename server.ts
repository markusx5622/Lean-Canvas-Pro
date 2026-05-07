import express, { NextFunction, Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import * as Sentry from "@sentry/node";
import { createClient } from "@supabase/supabase-js";

// ── Gemini assistant types ─────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
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

// ── Gemini assistant prompt builder ───────────────────────────────────────────

const MAX_MESSAGES = 40;
/** Maximum characters per block/message content to prevent token overruns. */
const MAX_CONTENT_LENGTH = 2000;
/** Rough cap on the total canvas context text sent to Gemini (chars). */
const MAX_TOTAL_CONTEXT_LENGTH = 12_000;
/** Abort the Gemini fetch if no response arrives within this window. */
const GEMINI_TIMEOUT_MS = 25_000;

function buildSystemInstruction(ctx: CanvasContext): string {
  const filledBlocks = ctx.blocks.filter((b) => b.content.trim().length > 0);
  const emptyBlocks = ctx.blocks.filter((b) => b.content.trim().length === 0);

  const blocksText = filledBlocks
    .map((b) => `## ${b.title}\n${b.content.slice(0, MAX_CONTENT_LENGTH)}`)
    .join("\n\n");

  const emptyText =
    emptyBlocks.length > 0
      ? `\nBloques vacíos (sin contenido aún): ${emptyBlocks.map((b) => b.title).join(", ")}.`
      : "";

  const auditText =
    ctx.auditScore !== undefined
      ? `\nAuditoría heurística reciente: ${ctx.auditScore}/100 (${ctx.auditVerdict ?? ""}).`
      : "";

  const canvasSection =
    filledBlocks.length > 0
      ? `CONTENIDO DEL CANVAS:\n\n${blocksText}`
      : "El canvas está vacío por ahora. Ayuda al usuario a empezar.";

  const base = `Eres un asistente estratégico experto en metodología Lean Canvas y startups. \
Tu rol es ayudar al usuario a mejorar, analizar y fortalecer su Lean Canvas de forma práctica y accionable. \
Responde siempre en el mismo idioma que use el usuario (español por defecto). \
Sé conciso, directo y orientado a la acción. Cuando detectes problemas, ofrece alternativas concretas. \
No inventes datos que no estén en el canvas; trabaja siempre sobre el contenido real.

CANVAS ACTIVO: "${ctx.name}"
Progreso: ${ctx.filledCount}/${ctx.totalBlocks} bloques completados.${auditText}${emptyText}

${canvasSection}`;

  // Hard-cap total context length to prevent unexpected token overruns
  return base.slice(0, MAX_TOTAL_CONTEXT_LENGTH);
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === "production";

// Initialize Sentry as early as possible so that all subsequent errors
// (including startup errors) are captured.  The SDK becomes a no-op when
// SENTRY_DSN is not set, so the server works fine without the variable.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: isProd ? "production" : "development",
    tracesSampleRate: isProd ? 0.1 : 1.0,
    // Never attach request bodies to events – canvas data may be submitted
    // through future API routes and must not be sent to a third-party service.
    sendDefaultPii: false,
  });
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  // Security headers via helmet (production only).
  // In production we enforce a strict Content-Security-Policy suited for a
  // Vite-built SPA (all JS/CSS are external hashed bundles – no inline code).
  // Helmet is skipped in development so that Vite HMR (inline scripts,
  // WebSocket connections) works without any extra configuration.
  if (isProd) {
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            // data: is required for the SVG favicon embedded as a data URI
            // in index.html (<link rel="icon" href="data:image/svg+xml,…">).
            imgSrc: ["'self'", "data:"],
            fontSrc: ["'self'"],
            connectSrc: ["'self'", "https://*.supabase.co"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: [],
          },
        },
      })
    );
  }

  app.use(express.json());

  // Health check (available in all environments)
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // ── AI Assistant endpoint ──────────────────────────────────────────────────
  // The Gemini API key is kept strictly server-side (no VITE_ prefix).
  // The client sends its Supabase session JWT as a Bearer token; we verify it
  // before calling Gemini so the endpoint is not open to anonymous traffic.
  // The canvas context + conversation history are used to build the Gemini
  // request server-side; only the model reply is returned to the client.
  app.post("/api/assistant", async (req: Request, res: Response) => {
    // ── Auth guard ──────────────────────────────────────────────────────────
    const authHeader = req.headers.authorization;
    const token =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!token) {
      res.status(401).json({ error: "No autenticado." });
      return;
    }

    // Verify the JWT against Supabase when credentials are available.
    // The VITE_SUPABASE_* variables are accessible server-side via process.env.
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      const sb = createClient(supabaseUrl, supabaseAnonKey);
      const {
        data: { user },
        error,
      } = await sb.auth.getUser(token);
      if (error || !user) {
        res.status(401).json({ error: "No autenticado." });
        return;
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res
        .status(503)
        .json({ error: "El asistente no está configurado en este entorno." });
      return;
    }

    const body = req.body as AssistantRequestBody;

    // Basic input validation – note: typeof null === "object", so we check
    // for a falsy value explicitly before the type guard.
    if (
      !body ||
      !Array.isArray(body.messages) ||
      body.messages.length === 0 ||
      !body.canvasContext ||
      typeof body.canvasContext !== "object"
    ) {
      res.status(400).json({ error: "Petición inválida." });
      return;
    }

    // Guard against oversized inputs
    if (body.messages.length > MAX_MESSAGES) {
      res.status(400).json({ error: "Demasiados mensajes en el historial." });
      return;
    }

    // Build structured system prompt with canvas context
    const systemInstruction = buildSystemInstruction(body.canvasContext);

    // Map conversation history to Gemini's format
    const contents = body.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
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

    // AbortController ensures the request never hangs indefinitely.
    // The API key is sent as a header (x-goog-api-key) rather than a
    // query-string parameter to keep it out of access logs and Sentry breadcrumbs.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
      const geminiRes = await fetch(
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(geminiPayload),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error("[assistant] Gemini API error:", geminiRes.status, errText);
        res
          .status(502)
          .json({ error: "Error al contactar con el asistente. Inténtalo de nuevo." });
        return;
      }

      const geminiData = (await geminiRes.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };

      const reply =
        geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      if (!reply) {
        res
          .status(502)
          .json({ error: "El asistente no devolvió una respuesta válida." });
        return;
      }

      res.json({ reply });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        console.error("[assistant] Gemini request timed out");
        res
          .status(504)
          .json({ error: "El asistente tardó demasiado en responder. Inténtalo de nuevo." });
      } else {
        console.error("[assistant] Fetch error:", err);
        res
          .status(502)
          .json({ error: "Error de red al contactar con el asistente." });
      }
    }
  });

  // Vite middleware for development
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production the server is compiled to dist/server.cjs, so __dirname IS
    // the dist folder where Vite also outputs the frontend assets.
    const distPath = __dirname;
    app.use(express.static(distPath));

    // SPA fallback – must come after all other routes
    app.get("*", (req, res, next) => {
      const indexFile = path.join(distPath, "index.html");
      res.sendFile(indexFile, (err) => {
        if (err) next(err);
      });
    });
  }

  // 404 handler – catches non-GET requests that didn't match any route.
  // GET requests are already handled by Vite (dev) or the SPA fallback (prod).
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Sentry must be registered as the first error handler so it receives the
  // full error object before any other middleware transforms or swallows it.
  Sentry.setupExpressErrorHandler(app);

  // 500 error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack ?? err.message);
    res.status(500).json({ error: "Internal server error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
