// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · evaluateCanvas.ts
// ============================================================
import type {
  BlockId, CanvasData, EvaluationResult, GlobalSummary,
  CrossBlockIssue, Issue, Strength,
} from './types';
import { evaluateBlock } from './evaluateBlock';
import { normalise, hasAnyKeyword } from './utils/text';
import { aggregateSubscores, computeOverallScore, SCORE_WEIGHTS } from './scoring';
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

  const crossBlockIssues = detectCrossBlockIssues(canvasData);
  const consistencyScore = computeConsistencyScore(crossBlockIssues, filledBlocks);

  // Aggregate completeness, clarity and specificity subscores across all 9 blocks
  const { completenessScore, clarityScore, specificityScore } = aggregateSubscores(blocks);

  // 5th dimension: strategic readiness
  const strategicReadinessScore = computeStrategicReadinessScore(
    canvasData, filledBlocks, crossBlockIssues,
  );

  // 6th dimension: market clarity
  const marketClarityScore = computeMarketClarityScore(canvasData);

  // 7th dimension: value proposition strength
  const valuePropositionScore = computeValuePropositionScore(canvasData);

  // 8th dimension: financial viability
  const viabilityScore = computeViabilityScore(canvasData, filledBlocks, crossBlockIssues);

  // Overall score = transparent weighted combination of the 8 dimensions.
  // Empty canvas → 0; otherwise the formula drives the score.
  const overallScore: number = filledBlocks > 0
    ? computeOverallScore(
        completenessScore, clarityScore, specificityScore,
        consistencyScore, strategicReadinessScore,
        marketClarityScore, valuePropositionScore, viabilityScore,
      )
    : 0;

  const verdict = buildVerdict(overallScore, completionPct);

  // Surface top 5 issues from all blocks, sorted by severity then impact.
  const allStrengths: Strength[] = blocks.flatMap(b => b.strengths);
  const allIssues: Issue[] = blocks.flatMap(b => b.issues);

  const topIssues = sortIssuesByPriority(allIssues).slice(0, 5);
  const topStrengths = allStrengths.slice(0, 3);

  const recommendation = buildRecommendation(
    overallScore, completionPct, crossBlockIssues, specificityScore,
  );

  const headline = buildHeadline(overallScore, completionPct, crossBlockIssues, strategicReadinessScore);
  const nextPriority = buildNextPriority(
    completionPct, crossBlockIssues, specificityScore, strategicReadinessScore,
    marketClarityScore, valuePropositionScore, viabilityScore, blocks,
  );

  const summary: GlobalSummary = {
    overallScore,
    filledBlocks,
    completionPct,
    completenessScore,
    clarityScore,
    specificityScore,
    consistencyScore,
    strategicReadinessScore,
    marketClarityScore,
    valuePropositionScore,
    viabilityScore,
    verdict,
    headline,
    nextPriority,
    topStrengths,
    topIssues,
    crossBlockIssues,
    recommendation,
    scoreWeights: { ...SCORE_WEIGHTS },
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

  // Rule 9: Costs + Revenue defined but no CAC/LTV anywhere (stronger than Rule 4)
  const cacLtvPattern = /cac|ltv|coste de adquisición|valor de vida|valor del cliente/i;
  const hasCacLtvAnywhere = cacLtvPattern.test(ingresos) || cacLtvPattern.test(costes) || cacLtvPattern.test(metricas);
  if (hasCosts && hasRevenue && !hasCacLtvAnywhere) {
    // Only flag when metrics is empty (Rule 4 covers the case where metrics IS filled)
    if (metricas.trim().length === 0) {
      issues.push({
        code: 'NO_UNIT_ECONOMICS',
        message: 'Tienes costes e ingresos pero no hay métricas de unit economics (CAC, LTV).',
        severity: 'warning',
        relatedBlocks: [6, 7, 8],
        hint: 'Define el Coste de Adquisición (CAC) y el Valor de Vida del Cliente (LTV). Su ratio es el indicador financiero más importante para inversores.',
      });
    }
  }

  // Rule 10: Revenue model defined but no acquisition channels
  if (ingresos.trim().length > 0 && canales.trim().length === 0 && segmentos.trim().length > 0) {
    issues.push({
      code: 'REVENUE_WITHOUT_CHANNELS',
      message: 'Tienes un modelo de ingresos pero no has definido cómo vas a llegar a tus clientes.',
      severity: 'warning',
      relatedBlocks: [5, 6],
      hint: 'Define al menos 2–3 canales de adquisición específicos (SEO, outbound, partnerships, etc.) para que el modelo de monetización sea ejecutable.',
    });
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

// ── Market clarity subscore ───────────────────────────────────

/**
 * Compute a market clarity score [0–100].
 *
 * Rewards signals that indicate a well-defined, scoped target market:
 *   • Specific customer segment (B2B/B2C, industry, role, size)
 *   • Early-adopter definition
 *   • Market scope indication (TAM/SAM/SOM or numeric market size)
 *   • Absence of "everyone" broad-audience language
 *
 * Returns 0 when neither block 1 nor block 2 is filled.
 */
function computeMarketClarityScore(canvasData: CanvasData): number {
  const segmentos = canvasData[2] ?? '';
  const problema  = canvasData[1] ?? '';

  if (segmentos.trim().length === 0 && problema.trim().length === 0) return 0;

  let score = 30; // baseline — clarity must be earned

  const segNorm = normalise(segmentos);
  const probNorm = normalise(problema);

  // Specific segment descriptors
  const specificTerms = ['b2b', 'b2c', 'pyme', 'startup', 'freelance', 'autonomo', 'director',
    'sector', 'industria', 'empleados', 'facturacion', 'profesional', 'gerente', 'cto', 'ceo'];
  const specificMatches = specificTerms.filter(t => segNorm.includes(t) || probNorm.includes(t)).length;
  if (specificMatches >= 3) score += 20;
  else if (specificMatches >= 1) score += 10;

  // Early adopter defined
  if (/early adopter|adopter|primer cliente|pionero|nicho/.test(segNorm)) score += 15;

  // Market size signals (TAM/SAM/SOM or size estimate)
  const hasSizeSignal = /\btam\b|\bsam\b|\bsom\b|tama[ñn]o de mercado|mercado de|millones de|miles de/.test(segNorm + ' ' + probNorm);
  if (hasSizeSignal) score += 10;

  // Penalise broad-audience language
  const broadTerms = ['todos', 'todo el mundo', 'cualquiera', 'personas en general', 'gente'];
  const hasBroad = broadTerms.some(t => segNorm.includes(normalise(t)));
  if (hasBroad) score -= 20;

  // Bonus if segment has a reasonable word count
  const segWc = segmentos.trim().split(/\s+/).length;
  if (segWc >= 15) score += 10;
  else if (segWc < 5 && segmentos.trim().length > 0) score -= 5;

  return Math.max(0, Math.min(100, score));
}

// ── Value proposition subscore ────────────────────────────────

/**
 * Compute a value proposition strength score [0–100].
 *
 * Rewards signals that indicate a compelling, outcome-focused,
 * clearly-differentiated value proposition:
 *   • Outcome-focused language (ahorra, reduce, elimina, automatiza)
 *   • Quantified benefit (%, €, horas, veces)
 *   • Conciseness (≤ 30 words)
 *   • Explicit comparison with alternatives
 *   • Absence of generic product descriptions
 *
 * Returns 0 when block 3 (UVP) is empty.
 */
function computeValuePropositionScore(canvasData: CanvasData): number {
  const uvp = canvasData[3] ?? '';
  if (uvp.trim().length === 0) return 0;

  let score = 30; // baseline — strength must be earned

  const uvpLower = normalise(uvp);

  // Outcome-focused language
  const outcomeTerms = ['ahorra', 'reduce', 'elimina', 'automatiza', 'simplifica',
    'mas rapido', 'sin friccion', 'ahorro de', 'reduccion'];
  const hasOutcome = outcomeTerms.some(t => uvpLower.includes(t));
  if (hasOutcome) score += 20;

  // Quantified benefit
  const hasQuantified = /\d[\d.,]*\s*(%|€|\$|hora|horas|veces|minuto|minutos)/.test(uvp);
  if (hasQuantified) score += 15;

  // Conciseness bonus (a good UVP fits in 1–2 sentences)
  const wc = uvp.trim().split(/\s+/).length;
  if (wc <= 30) score += 10;
  else if (wc > 60) score -= 10;

  // Comparison/differentiation language
  const comparisonTerms = ['a diferencia de', 'frente a', 'en lugar de', 'mejor que',
    'sin necesidad de', 'a diferencia', 'alternativas', 'unico', 'diferente'];
  const hasComparison = comparisonTerms.some(t => uvpLower.includes(t));
  if (hasComparison) score += 10;

  // Positive value keywords
  const valueTerms = BLOCK_KEYWORDS[3].positive;
  const posMatches = valueTerms.filter(t => uvpLower.includes(normalise(t))).length;
  if (posMatches >= 2) score += 10;

  // Penalise generic product descriptions without value language
  const genericTerms = BLOCK_KEYWORDS[3].generic;
  const hasGeneric = genericTerms.some(t => uvpLower.includes(normalise(t)));
  if (hasGeneric && !hasOutcome && posMatches === 0) score -= 15;

  return Math.max(0, Math.min(100, score));
}

// ── Viability subscore ────────────────────────────────────────

/**
 * Compute a financial viability score [0–100].
 *
 * Rewards signals that together form a coherent unit-economics story:
 *   • Revenue model defined with pricing
 *   • Cost structure defined with numbers
 *   • Unit economics: CAC and LTV mentioned (anywhere across blocks 6–8)
 *   • Recurring revenue (MRR/ARR)
 *   • Retention/churn awareness
 *
 * Penalises structural viability gaps (critical cross-block issues).
 *
 * Returns 0 when fewer than 2 of blocks 6, 7, 8 are filled.
 */
function computeViabilityScore(
  canvasData: CanvasData,
  filledBlocks: number,
  crossBlockIssues: CrossBlockIssue[],
): number {
  const ingresos = canvasData[6] ?? '';
  const costes   = canvasData[7] ?? '';
  const metricas = canvasData[8] ?? '';

  const financialBlocksFilled = [ingresos, costes, metricas].filter(b => b.trim().length > 0).length;
  if (financialBlocksFilled < 2 || filledBlocks < 3) return 0;

  let score = 20; // baseline

  // Revenue model defined
  const revenueTerms = ['suscripcion', 'freemium', 'transaccion', 'comision', 'licencia',
    'saas', 'pago', 'tarifa', 'precio', 'mensual', 'anual', 'modelo', 'revenue'];
  const hasRevenueModel = revenueTerms.some(t => normalise(ingresos).includes(t));
  if (hasRevenueModel) score += 15;

  // Pricing defined (numbers in revenue block)
  if (/\d/.test(ingresos)) score += 10;

  // Cost structure defined
  const costTerms = ['salario', 'infraestructura', 'servidor', 'cloud', 'hosting',
    'marketing', 'cac', 'operativo', 'fijo', 'variable', 'burn'];
  const hasCostModel = costTerms.some(t => normalise(costes).includes(t));
  if (hasCostModel) score += 10;

  // Cost numbers (burn rate calculable)
  if (/\d/.test(costes)) score += 5;

  // Unit economics: CAC + LTV present anywhere across financial blocks
  const combined = normalise(ingresos + ' ' + costes + ' ' + metricas);
  const hasCac = /cac|coste de adquisicion/.test(combined);
  const hasLtv = /ltv|valor de vida|valor del cliente/.test(combined);
  if (hasCac && hasLtv) score += 15;
  else if (hasCac || hasLtv) score += 7;

  // Recurring revenue signal
  if (/recurrente|suscripcion|mrr|arr/.test(combined)) score += 5;

  // Retention/churn awareness
  if (/churn|retencion|retention/.test(combined)) score += 5;

  // Penalise critical viability cross-block issues
  const criticalViabilityIssues = crossBlockIssues.filter(
    i => i.severity === 'critical' && (i.relatedBlocks.includes(6) || i.relatedBlocks.includes(7)),
  );
  score -= Math.min(25, criticalViabilityIssues.length * 15);

  return Math.max(0, Math.min(100, score));
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

// ── Strategic readiness subscore ─────────────────────────────

/**
 * Compute a canvas-level strategic readiness score [0–100].
 *
 * Rewards signals that indicate the canvas is ready for investor
 * pitches or customer validation:
 *   • Full canvas coverage (all 9 blocks filled)
 *   • Financial viability (both costs and revenue defined)
 *   • CAC / LTV awareness in the Metrics block
 *   • Competitive awareness in the Problem block (alternatives mentioned)
 *   • Defensible moat in the Unfair Advantage block
 *
 * Penalises:
 *   • Critical cross-block issues (-15 each, capped at -30)
 *   • Warning cross-block issues  (-5  each, capped at -15)
 *
 * Returns 0 when fewer than 3 blocks are filled since strategic
 * readiness cannot be meaningfully assessed on a skeleton canvas.
 */
function computeStrategicReadinessScore(
  canvasData: CanvasData,
  filledBlocks: number,
  crossBlockIssues: CrossBlockIssue[],
): number {
  if (filledBlocks < 3) return 0;

  let score = 40; // baseline — readiness must be earned

  const problema  = canvasData[1] ?? '';
  const ingresos  = canvasData[6] ?? '';
  const costes    = canvasData[7] ?? '';
  const metricas  = canvasData[8] ?? '';
  const ventaja   = canvasData[9] ?? '';

  // Canvas coverage
  if (filledBlocks === 9)      score += 15;
  else if (filledBlocks >= 7)  score += 8;
  else if (filledBlocks >= 5)  score += 4;

  // Financial viability: both costs and revenue defined
  if (ingresos.trim().length > 0 && costes.trim().length > 0) score += 10;

  // CAC / LTV awareness in metrics
  if (/cac|ltv/i.test(metricas)) score += 10;

  // Competitive awareness in Problem block
  if (hasAnyKeyword(problema, ['alternativas', 'workaround', 'cómo resuelven', 'competidores', 'solución actual'])) {
    score += 8;
  }

  // Defensible moat in Unfair Advantage block
  const ventajaNorm = normalise(ventaja);
  const hasRealMoat = ventaja.trim().length > 0 &&
    BLOCK_KEYWORDS[9].positive.some(t => ventajaNorm.includes(normalise(t)));
  if (hasRealMoat) score += 7;

  // Penalise structural cross-block gaps
  const criticalCount = crossBlockIssues.filter(i => i.severity === 'critical').length;
  const warningCount  = crossBlockIssues.filter(i => i.severity === 'warning').length;
  score -= Math.min(30, criticalCount * 15);
  score -= Math.min(15, warningCount  * 5);

  return Math.max(0, Math.min(100, score));
}

// ── Issue prioritisation ──────────────────────────────────────

/**
 * Sort a list of issues by severity (critical → warning → info) and then
 * by impact (high → medium → low). When impact is not explicitly set,
 * it is derived from severity as a sensible default.
 *
 * Issues with an actionable hint are ranked above those without when
 * all other criteria are equal, since they give the user a concrete next step.
 */
function sortIssuesByPriority(issues: Issue[]): Issue[] {
  const severityRank: Record<string, number> = { critical: 3, warning: 2, info: 1 };
  const impactRank:   Record<string, number> = { high: 3, medium: 2, low: 1 };

  const effectiveImpact = (issue: Issue): number => {
    if (issue.impact) return impactRank[issue.impact];
    // Derive from severity when not explicit
    return severityRank[issue.severity] ?? 1;
  };

  return [...issues].sort((a, b) => {
    const severityDiff = (severityRank[b.severity] ?? 0) - (severityRank[a.severity] ?? 0);
    if (severityDiff !== 0) return severityDiff;

    const impactDiff = effectiveImpact(b) - effectiveImpact(a);
    if (impactDiff !== 0) return impactDiff;

    // Tie-break: issues with an actionable hint come first
    return (b.hint ? 1 : 0) - (a.hint ? 1 : 0);
  });
}

// ── Headline & next-priority helpers ─────────────────────────

/**
 * Generate a short, personalised narrative headline for the evaluation results.
 * More descriptive than verdict and intended for display at the top of the UI.
 */
function buildHeadline(
  score: number,
  completionPct: number,
  crossBlockIssues: CrossBlockIssue[],
  strategicReadinessScore: number,
): string {
  if (completionPct === 0) {
    return 'Tu canvas está en blanco — empieza por el Problema y el Segmento de Clientes.';
  }
  if (completionPct < 33) {
    return 'Canvas incipiente: completa los bloques fundamentales antes de evaluar la estrategia.';
  }

  const hasCritical = crossBlockIssues.some(i => i.severity === 'critical');

  if (completionPct < 70) {
    return hasCritical
      ? 'Canvas parcial con inconsistencias críticas: resuelve los conflictos estructurales primero.'
      : 'Canvas en construcción — llena los bloques restantes para obtener una evaluación completa.';
  }

  // Canvas ≥ 70% filled
  if (hasCritical) {
    return 'Modelo casi completo pero con inconsistencias críticas que bloquean la viabilidad estratégica.';
  }

  if (score >= 80 && strategicReadinessScore >= 60) {
    return 'Canvas sólido y estratégicamente preparado — listo para validar con clientes reales.';
  }
  if (score >= 80) {
    return 'Canvas sólido en calidad de contenido; refuerza los indicadores estratégicos (CAC, LTV, moat).';
  }
  if (score >= 60) {
    return 'Base prometedora — profundiza en los bloques más débiles y añade métricas concretas.';
  }
  if (score >= 40) {
    return 'Modelo en desarrollo: el contenido necesita más concreción y coherencia estratégica.';
  }
  return 'Canvas incompleto en calidad — aborda los issues críticos bloque a bloque.';
}

/**
 * Determine the single most important next action for the user.
 * Follows a strict priority order so the user always gets one clear,
 * actionable instruction rather than a list of suggestions.
 */
function buildNextPriority(
  completionPct: number,
  crossBlockIssues: CrossBlockIssue[],
  specificityScore: number,
  strategicReadinessScore: number,
  marketClarityScore: number,
  valuePropositionScore: number,
  viabilityScore: number,
  blocks: Array<{ filled: boolean; blockName: string }>,
): string {
  // 1. Completion gaps take absolute priority
  if (completionPct < 50) {
    const firstEmpty = blocks.find(b => !b.filled);
    const blockLabel = firstEmpty ? `"${firstEmpty.blockName}"` : 'los bloques vacíos';
    return `Completa ${blockLabel} — sin un canvas ≥ 50% lleno no pueden detectarse inconsistencias clave.`;
  }

  // 2. Critical cross-block issues block strategic progress
  const firstCritical = crossBlockIssues.find(i => i.severity === 'critical');
  if (firstCritical) {
    return firstCritical.hint
      ? `Resuelve inconsistencia crítica: ${firstCritical.hint}`
      : `Resuelve inconsistencia crítica entre bloques: ${firstCritical.message}`;
  }

  // 3. Warning cross-block issues
  const firstWarning = crossBlockIssues.find(i => i.severity === 'warning');
  if (firstWarning) {
    return firstWarning.hint
      ? `Corrige alerta estratégica: ${firstWarning.hint}`
      : `Corrige alerta entre bloques: ${firstWarning.message}`;
  }

  // 4. Low specificity: content is too vague to be actionable
  if (specificityScore < 40) {
    return 'Añade cifras concretas al canvas: precios (€), porcentajes (%), plazos y nombres de canales específicos.';
  }

  // 5. Weak market clarity: the target customer is not well-defined
  if (marketClarityScore < 40) {
    return 'Define mejor tu segmento objetivo: ¿quién es tu early adopter? ¿qué rol, sector e industria tiene? Un segmento vago lleva a mensajes que no conectan.';
  }

  // 6. Weak value proposition: the differentiation claim is not compelling
  if (valuePropositionScore < 40) {
    return 'Refuerza tu propuesta de valor: describe el resultado concreto que obtiene el cliente (ahorra X horas, reduce Y%) y en qué se diferencia de las alternativas actuales.';
  }

  // 7. Weak viability: financial model is incomplete
  if (viabilityScore < 40) {
    return 'Completa el modelo financiero: define precios concretos, estructura de costes con cifras y calcula CAC y LTV para demostrar la viabilidad económica.';
  }

  // 8. Low strategic readiness: missing investment-ready signals
  if (strategicReadinessScore < 50) {
    return 'Completa el modelo financiero (costes + ingresos + CAC/LTV) y define tu ventaja injusta para aumentar la preparación estratégica.';
  }

  // 9. Canvas is solid — move to validation
  return 'Realiza al menos 5 entrevistas con clientes potenciales para contrastar las hipótesis del canvas.';
}
