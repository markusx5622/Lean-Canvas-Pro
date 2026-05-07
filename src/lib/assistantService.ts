// ── Assistant Service ─────────────────────────────────────────────────────────
// Thin client that proxies requests through the Express server endpoint so that
// the Gemini API key is never exposed in the browser bundle.

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
  const res = await fetch('/api/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, canvasContext }),
  });

  const data = (await res.json()) as AssistantResponse | AssistantError;

  if (!res.ok || 'error' in data) {
    throw new Error(
      ('error' in data ? data.error : null) ??
        'Error desconocido al contactar con el asistente.'
    );
  }

  return (data as AssistantResponse).reply;
}
