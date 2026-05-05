// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · evaluateBlock.ts
// ============================================================
import type { BlockId, BlockFeedback, CanvasData } from './types';
import { BLOCK_NAMES } from './dictionaries/keywords';
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

/**
 * Evaluate a single Lean Canvas block.
 *
 * @param blockId - The numeric id of the block (1–9).
 * @param canvasData - The full canvas data map (used for cross-block context in
 *                     future extensions; currently only the target block text is used).
 * @returns A complete BlockFeedback object.
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

  const summary = buildBlockSummary(blockId, score, issues.length, strengths.length);

  return {
    blockId,
    blockName: BLOCK_NAMES[blockId],
    filled: true,
    score,
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
