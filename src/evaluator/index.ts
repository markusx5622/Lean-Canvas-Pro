// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · index.ts
//
// Public API of the local heuristic evaluation engine.
// Import from here in application code.
// ============================================================

// ── Entry points ──────────────────────────────────────────────
export { evaluateCanvas } from './evaluateCanvas';
export { evaluateBlock }  from './evaluateBlock';

// ── Types (re-exported for consumer convenience) ──────────────
export type {
  BlockId,
  CanvasData,
  Severity,
  Issue,
  Strength,
  Score,
  BlockFeedback,
  CrossBlockIssue,
  GlobalSummary,
  EvaluationResult,
} from './types';
