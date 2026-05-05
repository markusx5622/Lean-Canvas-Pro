// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · evaluateCanvas.ts
// ============================================================
import type {
  BlockId, CanvasData, EvaluationResult, GlobalSummary,
  CrossBlockIssue, Issue, Strength,
} from './types';
import { evaluateBlock } from './evaluateBlock';
import { clamp, normalise } from './utils/text';
import { aggregateSubscores } from './scoring';
import { COPYABLE_ATTRIBUTES } from './dictionaries/vagueTerms';
import { BLOCK_KEYWORDS } from './dictionaries/keywords';

const ALL_BLOCK_IDS: BlockId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Evaluate a complete Lean Canvas.
 *
 * Runs per-block heuristics for all 9 blocks and then synthesises a
 * global summary that includes cross-block coherence checks.
 *
 * @param canvasData - The full canvas data map (BlockId → text).
 * @returns A complete EvaluationResult ready to display in the UI.
 */
export function evaluateCanvas(canvasData: CanvasData): EvaluationResult {
  const blocks = ALL_BLOCK_IDS.map(id => evaluateBlock(id, canvasData));

  const filledBlocks = blocks.filter(b => b.filled).length;
  const completionPct = Math.round((filledBlocks / 9) * 100);

  // Overall score = weighted average across all 9 blocks.
  // Unfilled blocks contribute 0, so leaving blocks empty lowers the score
  // and incentivises completing the full canvas.
  const totalScore = blocks.reduce((sum, b) => sum + b.score, 0);
  const overallScore = filledBlocks > 0 ? clamp(Math.round(totalScore / 9), 0, 100) : 0;

  const verdict = buildVerdict(overallScore, completionPct);

  // Surface the top 3 strengths and top 3 issues from all blocks.
  const allStrengths: Strength[] = blocks.flatMap(b => b.strengths);
  const allIssues: Issue[] = blocks.flatMap(b => b.issues);

  const criticalIssues = allIssues.filter(i => i.severity === 'critical');
  const warningIssues  = allIssues.filter(i => i.severity === 'warning');
  const topIssues = [...criticalIssues, ...warningIssues].slice(0, 3);
  const topStrengths = allStrengths.slice(0, 3);

  const crossBlockIssues = detectCrossBlockIssues(canvasData);
  const consistencyScore = computeConsistencyScore(crossBlockIssues, filledBlocks);

  // Aggregate completeness, clarity and specificity subscores across all 9 blocks
  const { completenessScore, clarityScore, specificityScore } = aggregateSubscores(blocks);

  const recommendation = buildRecommendation(
    overallScore, completionPct, crossBlockIssues, specificityScore,
  );

  const summary: GlobalSummary = {
    overallScore,
    filledBlocks,
    completionPct,
    completenessScore,
    clarityScore,
    specificityScore,
    consistencyScore,
    verdict,
    topStrengths,
    topIssues,
    crossBlockIssues,
    recommendation,
  };

  return {
    blocks,
    summary,
    evaluatedAt: new Date().toISOString(),
  };
}

// ── Cross-block coherence checks ─────────────────────────────

/**
 * Detect strategic inconsistencies that span two or more blocks.
 * These rules look at the canvas holistically and cannot be caught
 * by evaluating blocks in isolation.
 */
function detectCrossBlockIssues(canvasData: CanvasData): CrossBlockIssue[] {
  const issues: CrossBlockIssue[] = [];

  const problema  = (canvasData[1] ?? '').toLowerCase();
  const solucion  = (canvasData[4] ?? '').toLowerCase();
  const segmentos = (canvasData[2] ?? '').toLowerCase();
  const uvp       = (canvasData[3] ?? '').toLowerCase();
  const canales   = (canvasData[5] ?? '').toLowerCase();
  const ingresos  = (canvasData[6] ?? '').toLowerCase();
  const costes    = (canvasData[7] ?? '').toLowerCase();
  const metricas  = (canvasData[8] ?? '').toLowerCase();
  const ventaja   = (canvasData[9] ?? '').toLowerCase();

  // Rule 1: Solution exists but no Problem defined
  if (solucion.trim().length > 0 && problema.trim().length === 0) {
    issues.push({
      code: 'SOLUTION_WITHOUT_PROBLEM',
      message: 'Tienes una solución definida pero el bloque Problema está vacío.',
      severity: 'critical',
      relatedBlocks: [1, 4],
      hint: 'Define primero el problema que resuelves. Sin problema claro, la solución carece de contexto estratégico.',
    });
  }

  // Rule 2: Revenue model exists but no Customer Segment defined
  if (ingresos.trim().length > 0 && segmentos.trim().length === 0) {
    issues.push({
      code: 'REVENUE_WITHOUT_SEGMENT',
      message: 'Tienes un modelo de ingresos pero no has definido a quién le vas a cobrar.',
      severity: 'warning',
      relatedBlocks: [2, 6],
      hint: 'Define el segmento de clientes para asegurar que el modelo de monetización tiene sentido.',
    });
  }

  // Rule 3: Costs defined but no Revenue model
  if (costes.trim().length > 0 && ingresos.trim().length === 0) {
    issues.push({
      code: 'COSTS_WITHOUT_REVENUE',
      message: 'Defines costes pero no tienes un modelo de ingresos, lo que impide calcular la viabilidad.',
      severity: 'critical',
      relatedBlocks: [6, 7],
      hint: 'Completa el bloque de Flujo de Ingresos para poder evaluar el margen y el punto de equilibrio.',
    });
  }

  // Rule 4: Metrics exist but don't mention CAC/LTV when costs+revenues are both defined
  const hasCosts   = costes.trim().length > 0;
  const hasRevenue = ingresos.trim().length > 0;
  const metricsMentionCacLtv = /cac|ltv|coste de adquisición/.test(metricas);
  if (hasCosts && hasRevenue && metricas.trim().length > 0 && !metricsMentionCacLtv) {
    issues.push({
      code: 'MISSING_CAC_LTV_IN_METRICS',
      message: 'Tienes costes e ingresos definidos pero las métricas no incluyen CAC ni LTV.',
      severity: 'warning',
      relatedBlocks: [6, 7, 8],
      hint: 'CAC y LTV son los dos KPIs más importantes para demostrar la viabilidad económica ante un inversor.',
    });
  }

  // Rule 5: Channels defined but no Customer Segment
  if (canales.trim().length > 0 && segmentos.trim().length === 0) {
    issues.push({
      code: 'CHANNELS_WITHOUT_SEGMENT',
      message: 'Tienes canales definidos pero no has definido a quién te diriges.',
      severity: 'warning',
      relatedBlocks: [2, 5],
      hint: 'Cada canal debe elegirse en función de dónde está y cómo se comporta tu segmento objetivo.',
    });
  }

  // Rule 6: UVP defined but no Customer Segment
  if (uvp.trim().length > 0 && segmentos.trim().length === 0) {
    issues.push({
      code: 'UVP_WITHOUT_SEGMENT',
      message: 'Tienes una propuesta de valor pero no está claro a quién va dirigida.',
      severity: 'info',
      relatedBlocks: [2, 3],
      hint: 'Una buena UVP siempre está orientada a un segmento concreto: "La mejor solución para [quién]".',
    });
  }

  // Rule 7: Metrics defined but no Revenue model
  if (metricas.trim().length > 0 && ingresos.trim().length === 0) {
    issues.push({
      code: 'METRICS_WITHOUT_REVENUE',
      message: 'Defines métricas pero no tienes un modelo de ingresos, lo que dificulta medir la viabilidad económica.',
      severity: 'warning',
      relatedBlocks: [6, 8],
      hint: 'Completa el modelo de ingresos para poder definir métricas financieras relevantes como MRR, ARR o LTV.',
    });
  }

  // Rule 8: Unfair advantage relies only on copyable attributes
  if (ventaja.trim().length > 0) {
    const ventajaNorm = normalise(ventaja);
    const hasCopyableOnly = COPYABLE_ATTRIBUTES.some(t => ventajaNorm.includes(normalise(t)));
    const hasRealMoat = BLOCK_KEYWORDS[9].positive.some(t => ventajaNorm.includes(normalise(t)));
    if (hasCopyableOnly && !hasRealMoat) {
      issues.push({
        code: 'UNFAIR_ADVANTAGE_TOO_GENERIC',
        message: 'La ventaja injusta se basa solo en atributos copiables (experiencia, dedicación, equipo).',
        severity: 'warning',
        relatedBlocks: [9],
        hint: 'Una ventaja injusta real debe ser imposible de comprar o replicar: datos únicos, patentes, acceso exclusivo o comunidad consolidada.',
      });
    }
  }

  return issues;
}

// ── Consistency subscore ──────────────────────────────────────

/**
 * Compute a canvas-level consistency score [0–100] based on the
 * cross-block issues detected.
 *
 * Starts at 100 and is penalised per issue:
 *   critical → -25  |  warning → -15  |  info → -5
 *
 * Returns 0 when the canvas is nearly empty (< 3 blocks filled)
 * since meaningful consistency cannot be assessed.
 */
function computeConsistencyScore(
  crossBlockIssues: CrossBlockIssue[],
  filledBlocks: number,
): number {
  if (filledBlocks < 3) return 0;
  let score = 100;
  for (const issue of crossBlockIssues) {
    if (issue.severity === 'critical')     score -= 25;
    else if (issue.severity === 'warning') score -= 15;
    else                                   score -= 5;
  }
  return Math.max(0, score);
}

// ── Verdict & recommendation helpers ─────────────────────────

function buildVerdict(score: number, completionPct: number): string {
  if (completionPct < 33) return 'Incompleto';
  if (score >= 80) return 'Sólido';
  if (score >= 60) return 'Prometedor';
  if (score >= 40) return 'En desarrollo';
  return 'Necesita trabajo';
}

function buildRecommendation(
  score: number,
  completionPct: number,
  crossBlockIssues: CrossBlockIssue[],
  specificityScore: number,
): string {
  if (completionPct < 50) {
    return 'Completa primero los bloques vacíos antes de extraer conclusiones estratégicas. Un Lean Canvas incompleto no puede revelar inconsistencias clave.';
  }

  const criticalCross = crossBlockIssues.filter(i => i.severity === 'critical');
  if (criticalCross.length > 0) {
    return `Se detectaron ${criticalCross.length} inconsistencia${criticalCross.length > 1 ? 's' : ''} crítica${criticalCross.length > 1 ? 's' : ''} entre bloques. Resuélvelas antes de buscar inversión o salir al mercado.`;
  }

  const totalCross = crossBlockIssues.length;
  if (totalCross > 0) {
    return `Se detectaron ${totalCross} inconsistencia${totalCross > 1 ? 's' : ''} entre bloques. Revísalas para asegurar que el modelo es coherente de extremo a extremo.`;
  }

  if (specificityScore < 40) {
    return 'El canvas está completo pero le falta concreción. Añade números reales: precios, tiempos, porcentajes y nombres de canales específicos para que el modelo sea validable.';
  }

  if (score >= 80) {
    return 'El canvas está bien estructurado. Prioriza la validación con clientes reales para contrastar las hipótesis documentadas.';
  }
  if (score >= 60) {
    return 'Base sólida. Trabaja en profundizar los bloques con puntuación más baja y añade métricas concretas (CAC, LTV, MRR).';
  }
  return 'Revisa los issues críticos de cada bloque. Empieza por definir claramente el Problema y el Segmento de Clientes, ya que son la base de todo el modelo.';
}
