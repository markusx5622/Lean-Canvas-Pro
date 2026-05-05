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

import { wordCount, countKeywordMatches, hasAnyKeyword, looksStructured } from './utils/text';
import { SHALLOW_CONTENT_TERMS } from './dictionaries/vagueTerms';
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

// ── Canvas-level aggregation ─────────────────────────────────

/**
 * Aggregate per-block subscores into a single canvas-level value.
 * Blocks that were not filled contribute 0 to both subscores.
 *
 * @param scores Array of { completenessScore, clarityScore } from all blocks.
 * @returns Average completeness and clarity scores across all 9 blocks.
 */
export function aggregateSubscores(
  scores: Array<{ completenessScore: Score; clarityScore: Score }>,
): { completenessScore: Score; clarityScore: Score } {
  if (scores.length === 0) {
    return { completenessScore: 0, clarityScore: 0 };
  }
  const totalCompleteness = scores.reduce((s, b) => s + b.completenessScore, 0);
  const totalClarity      = scores.reduce((s, b) => s + b.clarityScore, 0);
  return {
    completenessScore: Math.round(totalCompleteness / scores.length) as Score,
    clarityScore:      Math.round(totalClarity      / scores.length) as Score,
  };
}
