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
  /**
   * Relative business impact of fixing this issue.
   * When omitted, impact is derived from severity at sort time.
   */
  impact?: 'high' | 'medium' | 'low';
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
  /** Combined heuristic score [0–100] */
  score: Score;
  /**
   * How well the block is filled: considers word count and structure.
   * 0 = empty, 100 = thoroughly developed.
   */
  completenessScore: Score;
  /**
   * How specific and clear the content is: considers domain keyword
   * density and absence of vague / generic language.
   * 0 = very vague, 100 = highly specific.
   */
  clarityScore: Score;
  /**
   * How quantified and concrete the content is: rewards numbers,
   * concrete units, named channels/tools, specific role titles, etc.
   * 0 = entirely abstract, 100 = highly actionable and measurable.
   */
  specificityScore: Score;
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
   * Average completeness subscore across all 9 blocks [0–100].
   * Unfilled blocks contribute 0, so this rewards filling everything.
   */
  completenessScore: Score;
  /**
   * Average clarity subscore across all 9 blocks [0–100].
   * Reflects how specific and non-generic the content is overall.
   */
  clarityScore: Score;
  /**
   * Average specificity subscore across all 9 blocks [0–100].
   * Reflects how quantified and actionable the content is (numbers,
   * concrete channel names, specific segment descriptors, etc.).
   */
  specificityScore: Score;
  /**
   * Internal consistency of the canvas [0–100].
   * Starts at 100 and is reduced by each cross-block issue found.
   * A score below 60 signals important strategic misalignments.
   */
  consistencyScore: Score;
  /**
   * Strategic readiness of the canvas [0–100].
   * Measures investment/go-to-market preparation signals: financial
   * viability indicators, competitive awareness, defensible moat,
   * and absence of critical structural gaps.
   * 0 = not ready  |  100 = highly investment-ready.
   */
  strategicReadinessScore: Score;
  /**
   * Market clarity score [0–100].
   * Measures how well the target market is defined: specificity of the
   * customer segment, early-adopter identification, and any indication
   * of market scope (TAM/SAM/SOM or size signals).
   * 0 = market undefined  |  100 = clearly scoped, named segment.
   */
  marketClarityScore: Score;
  /**
   * Value proposition score [0–100].
   * Measures the strength of the differentiation claim: outcome-focused
   * language, quantified benefit, conciseness, and explicit comparison
   * with existing alternatives.
   * 0 = generic description  |  100 = compelling, customer-centred UVP.
   */
  valuePropositionScore: Score;
  /**
   * Financial viability score [0–100].
   * Measures the integrity of the unit-economics story: revenue model
   * definition, pricing, cost structure, and CAC/LTV awareness.
   * 0 = no financial model  |  100 = fully specified unit economics.
   */
  viabilityScore: Score;
  /**
   * One-line VC-style verdict based on overallScore:
   *   ≥ 80 → "Sólido"  |  60–79 → "Prometedor"  |  40–59 → "En desarrollo"  |  < 40 → "Necesita trabajo"
   */
  verdict: string;
  /**
   * Personalized narrative headline summarising the canvas state.
   * More descriptive than verdict; intended for display at the top of the results panel.
   */
  headline: string;
  /**
   * The single most important next action the user should take.
   * Derived from the most critical gap found (completion, cross-block issues,
   * specificity or strategic readiness).
   */
  nextPriority: string;
  /** Top-level strengths extracted from block results */
  topStrengths: Strength[];
  /** Top-level issues extracted from block results, sorted by severity then impact */
  topIssues: Issue[];
  /** Issues that arise from the interaction between blocks */
  crossBlockIssues: CrossBlockIssue[];
  /** Free-text overall recommendation */
  recommendation: string;
  /**
   * Explicit weights used to compute overallScore.
   * Exposed for UI transparency so users understand how the score is calculated.
   */
  scoreWeights: {
    completeness: number;
    clarity: number;
    specificity: number;
    consistency: number;
    strategicReadiness: number;
    marketClarity: number;
    valueProposition: number;
    viability: number;
  };
}

// ── EvaluationResult ────────────────────────────────────────

/** Full result returned by evaluateCanvas(). */
export interface EvaluationResult {
  blocks: BlockFeedback[];
  summary: GlobalSummary;
  /** ISO timestamp when the evaluation was produced */
  evaluatedAt: string;
}
