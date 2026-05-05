// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · evaluateBlock.ts
// ============================================================
import type { BlockId, BlockFeedback, CanvasData } from './types';
import { BLOCK_NAMES, BLOCK_KEYWORDS } from './dictionaries/keywords';
import {
  evaluateProblema,
  evaluateSolucion,
  evaluatePropuestaUnica,
  evaluateVentajaInjusta,
  evaluateSegmentos,
  evaluateMetricas,
  evaluateCanales,
  evaluateCostes,
  evaluateFlujoIngresos,
} from './rules/index';
import { wordCount } from './utils/text';
import {
  computeCompletenessScore,
  computeClarityScore,
  computeSpecificityScore,
  type CompletenessConfig,
  type ClarityConfig,
  type SpecificityConfig,
} from './scoring';

type BlockRuleFn = (text: string) => {
  issues: BlockFeedback['issues'];
  strengths: BlockFeedback['strengths'];
  score: number;
};

const BLOCK_RULES: Record<BlockId, BlockRuleFn> = {
  1: evaluateProblema,
  2: evaluateSegmentos,
  3: evaluatePropuestaUnica,
  4: evaluateSolucion,
  5: evaluateCanales,
  6: evaluateFlujoIngresos,
  7: evaluateCostes,
  8: evaluateMetricas,
  9: evaluateVentajaInjusta,
};

// ── Per-block subscore configuration ─────────────────────────

/** Completeness config for each block (word-count thresholds). */
const COMPLETENESS_CONFIGS: Record<BlockId, CompletenessConfig> = {
  1: { minWords: 20, targetWords: 50, rewardsStructure: true },
  2: { minWords: 15, targetWords: 40 },
  3: { minWords:  8, targetWords: 30 },  // UVP should be concise
  4: { minWords: 15, targetWords: 40, rewardsStructure: true },
  5: { minWords: 10, targetWords: 35, rewardsStructure: true },
  6: { minWords: 10, targetWords: 35 },
  7: { minWords: 10, targetWords: 40, rewardsStructure: true },
  8: { minWords: 10, targetWords: 35 },
  9: { minWords: 10, targetWords: 30 },
};

/** Clarity config for each block (keyword lists and options). */
const CLARITY_CONFIGS: Record<BlockId, ClarityConfig> = {
  1: { positiveKeywords: BLOCK_KEYWORDS[1].positive, positiveThreshold: 3, extraVagueTerms: BLOCK_KEYWORDS[1].generic },
  2: { positiveKeywords: BLOCK_KEYWORDS[2].positive, positiveThreshold: 3, extraVagueTerms: BLOCK_KEYWORDS[2].generic },
  3: { positiveKeywords: BLOCK_KEYWORDS[3].positive, positiveThreshold: 2, extraVagueTerms: BLOCK_KEYWORDS[3].generic },
  4: { positiveKeywords: BLOCK_KEYWORDS[4].positive, positiveThreshold: 2, extraVagueTerms: BLOCK_KEYWORDS[4].generic },
  5: { positiveKeywords: BLOCK_KEYWORDS[5].positive, positiveThreshold: 3, extraVagueTerms: BLOCK_KEYWORDS[5].generic },
  6: { positiveKeywords: BLOCK_KEYWORDS[6].positive, positiveThreshold: 2, extraVagueTerms: BLOCK_KEYWORDS[6].generic, rewardsNumbers: true },
  7: { positiveKeywords: BLOCK_KEYWORDS[7].positive, positiveThreshold: 3, extraVagueTerms: BLOCK_KEYWORDS[7].generic, rewardsNumbers: true },
  8: { positiveKeywords: BLOCK_KEYWORDS[8].positive, positiveThreshold: 3, extraVagueTerms: BLOCK_KEYWORDS[8].generic, rewardsNumbers: true },
  9: { positiveKeywords: BLOCK_KEYWORDS[9].positive, positiveThreshold: 2, extraVagueTerms: BLOCK_KEYWORDS[9].generic },
};

/** Specificity config for each block (concrete signals and number expectations). */
const SPECIFICITY_CONFIGS: Record<BlockId, SpecificityConfig> = {
  1: { requiresNumbers: true,  concreteKeywords: BLOCK_KEYWORDS[1].concrete, concreteThreshold: 2 },
  2: { requiresNumbers: false, concreteKeywords: BLOCK_KEYWORDS[2].concrete, concreteThreshold: 2 },
  3: { requiresNumbers: false, concreteKeywords: BLOCK_KEYWORDS[3].concrete, concreteThreshold: 2 },
  4: { requiresNumbers: false, concreteKeywords: BLOCK_KEYWORDS[4].concrete, concreteThreshold: 2 },
  5: { requiresNumbers: false, concreteKeywords: BLOCK_KEYWORDS[5].concrete, concreteThreshold: 2 },
  6: { requiresNumbers: true,  concreteKeywords: BLOCK_KEYWORDS[6].concrete, concreteThreshold: 2 },
  7: { requiresNumbers: true,  concreteKeywords: BLOCK_KEYWORDS[7].concrete, concreteThreshold: 2 },
  8: { requiresNumbers: true,  concreteKeywords: BLOCK_KEYWORDS[8].concrete, concreteThreshold: 2 },
  9: { requiresNumbers: false, concreteKeywords: BLOCK_KEYWORDS[9].concrete, concreteThreshold: 2 },
};

/**
 * Evaluate a single Lean Canvas block.
 *
 * @param blockId - The numeric id of the block (1–9).
 * @param canvasData - The full canvas data map (used for cross-block context in
 *                     future extensions; currently only the target block text is used).
 * @returns A complete BlockFeedback object including completenessScore and clarityScore.
 */
export function evaluateBlock(blockId: BlockId, canvasData: CanvasData): BlockFeedback {
  const text = canvasData[blockId] ?? '';
  const filled = wordCount(text) > 0;

  if (!filled) {
    return {
      blockId,
      blockName: BLOCK_NAMES[blockId],
      filled: false,
      score: 0,
      completenessScore: 0,
      clarityScore: 0,
      specificityScore: 0,
      issues: [{
        code: 'EMPTY_BLOCK',
        message: `El bloque "${BLOCK_NAMES[blockId]}" está vacío.`,
        severity: 'critical',
        hint: 'Completa este bloque para obtener un análisis estratégico completo.',
      }],
      strengths: [],
      summary: `${BLOCK_NAMES[blockId]}: pendiente de completar.`,
    };
  }

  const ruleFn = BLOCK_RULES[blockId];
  const { issues, strengths, score } = ruleFn(text);

  const completenessScore = computeCompletenessScore(text, COMPLETENESS_CONFIGS[blockId]);
  const clarityScore      = computeClarityScore(text, CLARITY_CONFIGS[blockId]);
  const specificityScore  = computeSpecificityScore(text, SPECIFICITY_CONFIGS[blockId]);

  const summary = buildBlockSummary(blockId, score, issues.length, strengths.length);

  return {
    blockId,
    blockName: BLOCK_NAMES[blockId],
    filled: true,
    score,
    completenessScore,
    clarityScore,
    specificityScore,
    issues,
    strengths,
    summary,
  };
}

// ── Helpers ──────────────────────────────────────────────────

function buildBlockSummary(
  blockId: BlockId,
  score: number,
  issueCount: number,
  strengthCount: number,
): string {
  const name = BLOCK_NAMES[blockId];
  if (score >= 80) return `${name}: sólido (${score}/100). ${strengthCount} fortaleza${strengthCount !== 1 ? 's' : ''} detectada${strengthCount !== 1 ? 's' : ''}.`;
  if (score >= 60) return `${name}: prometedor (${score}/100) con ${issueCount} punto${issueCount !== 1 ? 's' : ''} de mejora.`;
  if (score >= 40) return `${name}: en desarrollo (${score}/100). Revisa los ${issueCount} issue${issueCount !== 1 ? 's' : ''} detectados.`;
  return `${name}: necesita trabajo (${score}/100). Aborda los ${issueCount} issue${issueCount !== 1 ? 's' : ''} críticos antes de seguir.`;
}

