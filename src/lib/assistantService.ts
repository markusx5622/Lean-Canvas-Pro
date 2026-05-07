// ── Assistant Service ─────────────────────────────────────────────────────────
// Thin client that proxies requests through the server-side assistant endpoint
// so that the Gemini API key is never exposed in the browser bundle.
// The active Supabase session JWT is attached to every request so the endpoint
// can reject unauthenticated callers before touching the Gemini API.

import { supabase } from './supabase';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface BlockContext {
  id: number;
  title: string;
  content: string;
}

export interface CanvasContext {
  name: string;
  blocks: BlockContext[];
  filledCount: number;
  totalBlocks: number;
  /** Optional heuristic audit score [0–100] */
  auditScore?: number;
  /** Optional audit verdict string */
  auditVerdict?: string;
}

export interface AssistantResponse {
  reply: string;
}

export interface AssistantError {
  error: string;
}

/**
 * Sends a conversation turn to the server-side assistant endpoint.
 * Throws an Error with a user-facing message if the call fails.
 */
export async function sendAssistantMessage(
  messages: ChatMessage[],
  canvasContext: CanvasContext
): Promise<string> {
  // Retrieve the current session token to authenticate the request.
  const sessionResult = supabase ? await supabase.auth.getSession() : null;
  const token = sessionResult?.data.session?.access_token ?? null;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/assistant', {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages, canvasContext }),
  });

  // Guard against non-JSON responses (e.g. an HTML fallback page on a
  // misconfigured deployment) to avoid cryptic SyntaxError exceptions.
  let data: AssistantResponse | AssistantError;
  try {
    data = (await res.json()) as AssistantResponse | AssistantError;
  } catch {
    throw new Error('Respuesta inesperada del servidor. Comprueba la configuración del despliegue.');
  }

  if (!res.ok || 'error' in data) {
    throw new Error(
      ('error' in data ? data.error : null) ??
        'Error desconocido al contactar con el asistente.'
    );
  }

  return (data as AssistantResponse).reply;
}

