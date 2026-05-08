// ── /api/assistant — DISABLED ─────────────────────────────────────────────────
// The AI assistant endpoint that previously called the Gemini API has been
// removed as part of the local-first redesign.
// All strategic analysis and content generation is now handled fully in the
// browser using deterministic heuristics (see src/lib/localStrategicTools.ts).
// This file returns 410 Gone to any remaining callers.

import type { Request, Response } from 'express';

export default function handler(_req: Request, res: Response) {
  res.status(410).json({
    error:
      'El asistente IA externo ha sido eliminado. ' +
      'Las herramientas estratégicas ahora funcionan de forma completamente local.',
  });
}
