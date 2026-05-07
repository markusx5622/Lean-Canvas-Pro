// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · scoring.ts
//
// Pure functions that compute the two quality subscores for
// a single Lean Canvas block:
//
//   • completenessScore [0–100] — Is the block adequately filled?
//     Driven by word count relative to thresholds and the
//     presence of structural formatting.
//
//   • clarityScore [0–100] — Is the content specific and clear?
//     Driven by the density of domain-relevant keywords and the
//     absence of vague / generic expressions.
//
// Both functions are intentionally stateless and side-effect-free
// so they are trivial to unit-test in isolation.
// ============================================================

import { wordCount, countKeywordMatches, hasAnyKeyword, looksStructured, containsNumbers, containsConcreteQuantity } from './utils/text';
import { SHALLOW_CONTENT_TERMS, HEDGE_WORDS, BROAD_AUDIENCE_TERMS } from './dictionaries/vagueTerms';
import type { Score } from './types';

// ── Completeness subscore ────────────────────────────────────

export interface CompletenessConfig {
  /** Minimum acceptable word count (below → warning tier). */
  minWords: number;
  /** Word count at which the block is considered fully developed. */
  targetWords: number;
  /**
   * Whether the block benefits from structured formatting
   * (bullet lists, numbered steps). Defaults to false.
   */
  rewardsStructure?: boolean;
}

/**
 * Compute a completeness score [0–100] for a single block.
 *
 * Scoring bands:
 *   empty (0 words)           →   0
 *   1 word (placeholder)      →   5
 *   [1, minWords)             →  10–39  (linear)
 *   [minWords, targetWords]   →  40–80  (linear)
 *   > targetWords             →  80–100 (diminishing returns)
 *   +5 bonus for structure when rewardsStructure = true
 *
 * @param text   The raw block text.
 * @param config Thresholds and options for this block type.
 */
export function computeCompletenessScore(
  text: string,
  config: CompletenessConfig,
): Score {
  const { minWords, targetWords, rewardsStructure = false } = config;
  const wc = wordCount(text);

  if (wc === 0) return 0;
  if (wc === 1) return 5;

  let score: number;

  if (wc < minWords) {
    // Linear: 2 words → ~10, (minWords - 1) words → ~39
    score = 10 + Math.round(((wc - 2) / Math.max(minWords - 2, 1)) * 29);
  } else if (wc <= targetWords) {
    // Linear: minWords → 40, targetWords → 80
    score = 40 + Math.round(((wc - minWords) / Math.max(targetWords - minWords, 1)) * 40);
  } else {
    // Diminishing returns above targetWords: max gain of +20 over double the target
    const extra = Math.min(wc - targetWords, targetWords);
    score = 80 + Math.round((extra / targetWords) * 20);
  }

  // Structural bonus: a well-formatted block is easier to review
  if (rewardsStructure && looksStructured(text)) {
    score = Math.min(100, score + 5);
  }

  return Math.max(0, Math.min(100, score)) as Score;
}

// ── Clarity subscore ─────────────────────────────────────────

export interface ClarityConfig {
  /**
   * Domain-relevant keywords whose presence signals specific,
   * knowledgeable content for this block.
   */
  positiveKeywords: string[];
  /**
   * Minimum number of positive keyword matches to reach
   * the "clear" tier (score ≥ 60). Defaults to 2.
   */
  positiveThreshold?: number;
  /**
   * Additional block-specific vague/generic terms to check
   * beyond the shared SHALLOW_CONTENT_TERMS list.
   */
  extraVagueTerms?: string[];
  /**
   * Whether the presence of numeric values (prices, percentages,
   * counts) should boost the clarity score. Defaults to false.
   */
  rewardsNumbers?: boolean;
}

/**
 * Compute a clarity score [0–100] for a single block.
 *
 * Scoring logic:
 *   Base score = 50
 *   + up to +40 for keyword richness (linear up to positiveThreshold × 2 matches)
 *   - 10 per shallow-content term found (capped at -30)
 *   - 5  per extra vague term found (capped at -20)
 *   + 5  if numbers are present and rewardsNumbers = true
 *
 * @param text   The raw block text.
 * @param config Keyword lists and options for this block type.
 */
export function computeClarityScore(
  text: string,
  config: ClarityConfig,
): Score {
  const {
    positiveKeywords,
    positiveThreshold = 2,
    extraVagueTerms = [],
    rewardsNumbers = false,
  } = config;

  if (wordCount(text) === 0) return 0;

  let score = 50;

  // Positive keyword contribution
  const posMatches = countKeywordMatches(text, positiveKeywords);
  const maxGain = 40;
  const gainPerMatch = maxGain / Math.max(positiveThreshold * 2, 1);
  score += Math.min(maxGain, Math.round(posMatches * gainPerMatch));

  // Shared shallow-content penalty
  const shallowMatches = countKeywordMatches(text, SHALLOW_CONTENT_TERMS);
  score -= Math.min(30, shallowMatches * 10);

  // Block-specific vague term penalty
  const extraMatches = countKeywordMatches(text, extraVagueTerms);
  score -= Math.min(20, extraMatches * 5);

  // Numbers boost clarity for financial / metrics blocks
  if (rewardsNumbers && /\d/.test(text)) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score)) as Score;
}

// ── Specificity subscore ──────────────────────────────────────

export interface SpecificityConfig {
  /**
   * Whether numeric values (prices, percentages, time periods) are
   * especially meaningful for this block.  When true and no numbers
   * are present the score is penalised.
   */
  requiresNumbers?: boolean;
  /**
   * Block-specific "concrete signal" keywords — named channels, KPI
   * acronyms, specific role titles, platform names, etc.
   */
  concreteKeywords?: string[];
  /**
   * Minimum concrete keyword matches to reach the "specific" tier
   * (score ≥ 60).  Defaults to 2.
   */
  concreteThreshold?: number;
}

/**
 * Compute a specificity score [0–100] for a single block.
 *
 * Specificity rewards content that is quantified, concrete and
 * actionable — the opposite of hand-wavy or generic.
 *
 * Scoring logic:
 *   Base score = 30  (low — specificity must be earned)
 *   + 25 if containsConcreteQuantity (currency, %, time period, entity count)
 *   + 10 if containsNumbers but no concrete quantity
 *   - 10 if requiresNumbers and no numbers at all
 *   + up to +35 for concrete keyword matches  (linear up to threshold × 2)
 *   - 5 per hedge/broad-audience vague term  (capped at -20)
 *
 * @param text   The raw block text.
 * @param config Keyword lists and options for this block type.
 */
export function computeSpecificityScore(
  text: string,
  config: SpecificityConfig,
): Score {
  const {
    requiresNumbers = false,
    concreteKeywords = [],
    concreteThreshold = 2,
  } = config;

  if (wordCount(text) === 0) return 0;

  let score = 30;

  // Numeric/quantified content
  if (containsConcreteQuantity(text)) {
    score += 25;
  } else if (containsNumbers(text)) {
    score += 10;
  } else if (requiresNumbers) {
    score -= 10;
  }

  // Concrete keyword contribution
  const concreteMatches = countKeywordMatches(text, concreteKeywords);
  const maxGain = 35;
  const gainPerMatch = maxGain / Math.max(concreteThreshold * 2, 1);
  score += Math.min(maxGain, Math.round(concreteMatches * gainPerMatch));

  // Hedge/broad-audience language penalty
  const vagueMatches = countKeywordMatches(text, [...HEDGE_WORDS, ...BROAD_AUDIENCE_TERMS]);
  score -= Math.min(20, vagueMatches * 5);

  return Math.max(0, Math.min(100, score)) as Score;
}

// ── Canvas-level aggregation ─────────────────────────────────

/**
 * Transparent weights used to compute the canvas-level overallScore
 * from the nine quality dimensions.
 *
 *   completeness       15% — Is the canvas fully filled?
 *   clarity            15% — Is the content specific and non-generic?
 *   specificity        10% — Is the content quantified and actionable?
 *   consistency        12% — Are the blocks strategically coherent?
 *   strategicReadiness 10% — Is the canvas ready for pitching / validation?
 *   marketClarity      12% — Is the target market clearly defined?
 *   valueProposition   10% — Is the differentiation claim strong and outcome-focused?
 *   viability           7% — Is the financial model internally sound?
 *   defensibility       9% — Is the competitive moat real and hard to copy?
 *
 * All weights sum to 1.0.
 */
export const SCORE_WEIGHTS = {
  completeness:        0.15,
  clarity:             0.15,
  specificity:         0.10,
  consistency:         0.12,
  strategicReadiness:  0.10,
  marketClarity:       0.12,
  valueProposition:    0.10,
  viability:           0.07,
  defensibility:       0.09,
} as const;

/**
 * Compute the transparent canvas-level overall score [0–100]
 * from the nine quality-dimension subscores using SCORE_WEIGHTS.
 *
 * @param completenessScore      Average completeness across all 9 blocks [0–100].
 * @param clarityScore           Average clarity across all 9 blocks [0–100].
 * @param specificityScore       Average specificity across all 9 blocks [0–100].
 * @param consistencyScore       Cross-block consistency score [0–100].
 * @param strategicReadinessScore Canvas strategic readiness score [0–100].
 * @param marketClarityScore     Market clarity score [0–100].
 * @param valuePropositionScore  Value proposition strength score [0–100].
 * @param viabilityScore         Financial viability score [0–100].
 * @param defensibilityScore     Competitive moat / defensibility score [0–100].
 */
export function computeOverallScore(
  completenessScore: Score,
  clarityScore: Score,
  specificityScore: Score,
  consistencyScore: Score,
  strategicReadinessScore: Score,
  marketClarityScore: Score,
  valuePropositionScore: Score,
  viabilityScore: Score,
  defensibilityScore: Score,
): Score {
  const raw =
    completenessScore       * SCORE_WEIGHTS.completeness +
    clarityScore            * SCORE_WEIGHTS.clarity +
    specificityScore        * SCORE_WEIGHTS.specificity +
    consistencyScore        * SCORE_WEIGHTS.consistency +
    strategicReadinessScore * SCORE_WEIGHTS.strategicReadiness +
    marketClarityScore      * SCORE_WEIGHTS.marketClarity +
    valuePropositionScore   * SCORE_WEIGHTS.valueProposition +
    viabilityScore          * SCORE_WEIGHTS.viability +
    defensibilityScore      * SCORE_WEIGHTS.defensibility;
  return Math.round(Math.max(0, Math.min(100, raw))) as Score;
}

/**
 * Aggregate per-block subscores into a single canvas-level value.
 * Blocks that were not filled contribute 0 to all subscores.
 *
 * @param scores Array of { completenessScore, clarityScore, specificityScore } from all blocks.
 * @returns Average completeness, clarity and specificity scores across all 9 blocks.
 */
export function aggregateSubscores(
  scores: Array<{ completenessScore: Score; clarityScore: Score; specificityScore: Score }>,
): { completenessScore: Score; clarityScore: Score; specificityScore: Score } {
  if (scores.length === 0) {
    return { completenessScore: 0, clarityScore: 0, specificityScore: 0 };
  }
  const totalCompleteness = scores.reduce((s, b) => s + b.completenessScore, 0);
  const totalClarity      = scores.reduce((s, b) => s + b.clarityScore, 0);
  const totalSpecificity  = scores.reduce((s, b) => s + b.specificityScore, 0);
  return {
    completenessScore: Math.round(totalCompleteness / scores.length) as Score,
    clarityScore:      Math.round(totalClarity      / scores.length) as Score,
    specificityScore:  Math.round(totalSpecificity  / scores.length) as Score,
  };
}
