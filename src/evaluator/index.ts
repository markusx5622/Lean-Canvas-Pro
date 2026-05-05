// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · index.ts
//
// Public API of the local heuristic evaluation engine.
// Import from here in application code.
// ============================================================

// ── Entry points ──────────────────────────────────────────────
export { evaluateCanvas } from './evaluateCanvas';
export { evaluateBlock }  from './evaluateBlock';

// ── Scoring utilities ─────────────────────────────────────────
export {
  computeCompletenessScore,
  computeClarityScore,
  aggregateSubscores,
} from './scoring';
export type { CompletenessConfig, ClarityConfig } from './scoring';

// ── Dictionaries (re-exported for consumers and tests) ────────
export {
  ALL_VAGUE_TERMS,
  SHALLOW_CONTENT_TERMS,
  HEDGE_WORDS,
  FILLER_WORDS,
  BROAD_AUDIENCE_TERMS,
  EMPTY_BUZZWORDS,
  GENERIC_PRODUCT_NOUNS,
  COPYABLE_ATTRIBUTES,
} from './dictionaries/vagueTerms';

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
