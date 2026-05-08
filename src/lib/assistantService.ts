// ── Assistant Service (types only) ────────────────────────────────────────────
// The external AI assistant functionality has been removed in favour of fully
// local, deterministic strategic tools (see src/lib/localStrategicTools.ts).
// This file is kept to preserve the CanvasContext / ChatMessage type definitions
// that are used in other parts of the codebase.

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

