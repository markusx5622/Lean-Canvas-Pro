// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · evaluateCanvas.ts
// ============================================================
import type {
  BlockId, CanvasData, EvaluationResult, GlobalSummary,
  CrossBlockIssue, Issue, Strength,
} from './types';
import { evaluateBlock } from './evaluateBlock';
import { clamp } from './utils/text';

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

  // Overall score = average of scores of *filled* blocks only (unfilled count as 0).
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

  const recommendation = buildRecommendation(overallScore, completionPct, crossBlockIssues.length);

  const summary: GlobalSummary = {
    overallScore,
    filledBlocks,
    completionPct,
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
  const ingresos  = (canvasData[6] ?? '').toLowerCase();
  const costes    = (canvasData[7] ?? '').toLowerCase();
  const metricas  = (canvasData[8] ?? '').toLowerCase();

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
  const metricsMentionCacLtv = /cac|ltv|coste de adquisici/.test(metricas);
  if (hasCosts && hasRevenue && metricas.trim().length > 0 && !metricsMentionCacLtv) {
    issues.push({
      code: 'MISSING_CAC_LTV_IN_METRICS',
      message: 'Tienes costes e ingresos definidos pero las métricas no incluyen CAC ni LTV.',
      severity: 'warning',
      relatedBlocks: [6, 7, 8],
      hint: 'CAC y LTV son los dos KPIs más importantes para demostrar la viabilidad económica ante un inversor.',
    });
  }

  return issues;
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
  crossBlockIssueCount: number,
): string {
  if (completionPct < 50) {
    return 'Completa primero los bloques vacíos antes de extraer conclusiones estratégicas. Un Lean Canvas incompleto no puede revelar inconsistencias clave.';
  }
  if (crossBlockIssueCount > 0) {
    return `Se detectaron ${crossBlockIssueCount} inconsistencia${crossBlockIssueCount > 1 ? 's' : ''} entre bloques. Revísalas antes de buscar inversión o salir al mercado.`;
  }
  if (score >= 80) {
    return 'El canvas está bien estructurado. Prioriza la validación con clientes reales para contrastar las hipótesis documentadas.';
  }
  if (score >= 60) {
    return 'Base sólida. Trabaja en profundizar los bloques con puntuación más baja y añade métricas concretas (CAC, LTV, MRR).';
  }
  return 'Revisa los issues críticos de cada bloque. Empieza por definir claramente el Problema y el Segmento de Clientes, ya que son la base de todo el modelo.';
}
