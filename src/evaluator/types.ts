// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · types.ts
// ============================================================

/** Identifiers for each of the 9 Lean Canvas blocks. */
export type BlockId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * The raw canvas data: a map from BlockId to the user-written text.
 * Absent keys mean the block has not been filled in.
 */
export type CanvasData = Partial<Record<BlockId, string>>;

// ── Severity ────────────────────────────────────────────────

export type Severity = 'critical' | 'warning' | 'info';

// ── Issue ───────────────────────────────────────────────────

export interface Issue {
  /** Short machine-readable code, e.g. "TOO_SHORT" */
  code: string;
  /** Human-readable explanation (Spanish) */
  message: string;
  severity: Severity;
  /** Optional actionable hint to fix the issue */
  hint?: string;
}

// ── Strength ────────────────────────────────────────────────

export interface Strength {
  /** Short machine-readable code, e.g. "CLEAR_PROBLEM" */
  code: string;
  /** Human-readable explanation (Spanish) */
  message: string;
}

// ── Score ───────────────────────────────────────────────────

/** Score in the range [0, 100]. */
export type Score = number;

// ── BlockFeedback ───────────────────────────────────────────

export interface BlockFeedback {
  blockId: BlockId;
  /** Display name of the block */
  blockName: string;
  /** Whether the block contains any text at all */
  filled: boolean;
  score: Score;
  issues: Issue[];
  strengths: Strength[];
  /** One-line summary for this block */
  summary: string;
}

// ── CrossBlockIssue ─────────────────────────────────────────

/** An issue that spans two or more blocks (e.g. misaligned Problem ↔ Solution). */
export interface CrossBlockIssue {
  code: string;
  message: string;
  severity: Severity;
  relatedBlocks: BlockId[];
  hint?: string;
}

// ── GlobalSummary ───────────────────────────────────────────

export interface GlobalSummary {
  /** Average score across all filled blocks [0–100] */
  overallScore: Score;
  /** How many of the 9 blocks are filled */
  filledBlocks: number;
  /** Completion percentage [0–100] */
  completionPct: number;
  /**
   * One-line VC-style verdict based on overallScore:
   *   ≥ 80 → "Sólido"  |  60–79 → "Prometedor"  |  40–59 → "En desarrollo"  |  < 40 → "Necesita trabajo"
   */
  verdict: string;
  /** Top-level strengths extracted from block results */
  topStrengths: Strength[];
  /** Top-level issues extracted from block results */
  topIssues: Issue[];
  /** Issues that arise from the interaction between blocks */
  crossBlockIssues: CrossBlockIssue[];
  /** Free-text overall recommendation */
  recommendation: string;
}

// ── EvaluationResult ────────────────────────────────────────

/** Full result returned by evaluateCanvas(). */
export interface EvaluationResult {
  blocks: BlockFeedback[];
  summary: GlobalSummary;
  /** ISO timestamp when the evaluation was produced */
  evaluatedAt: string;
}
