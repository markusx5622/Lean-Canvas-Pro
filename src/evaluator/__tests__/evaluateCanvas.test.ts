// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · __tests__/evaluateCanvas.test.ts
// ============================================================
import { describe, it, expect } from 'vitest';
import { evaluateCanvas } from '../evaluateCanvas';
import type { CanvasData } from '../types';
import { SCORE_WEIGHTS } from '../scoring';

// ── Empty canvas ──────────────────────────────────────────────

describe('evaluateCanvas — empty canvas', () => {
  it('returns 0 filledBlocks, 0 completionPct, 0 overallScore', () => {
    const result = evaluateCanvas({});
    expect(result.summary.filledBlocks).toBe(0);
    expect(result.summary.completionPct).toBe(0);
    expect(result.summary.overallScore).toBe(0);
  });

  it('returns completenessScore=0 and clarityScore=0', () => {
    const result = evaluateCanvas({});
    expect(result.summary.completenessScore).toBe(0);
    expect(result.summary.clarityScore).toBe(0);
  });

  it('sets verdict to "Incompleto"', () => {
    expect(evaluateCanvas({}).summary.verdict).toBe('Incompleto');
  });

  it('returns exactly 9 block results', () => {
    expect(evaluateCanvas({}).blocks).toHaveLength(9);
  });

  it('returns strategicReadinessScore=0 for empty canvas', () => {
    expect(evaluateCanvas({}).summary.strategicReadinessScore).toBe(0);
  });

  it('returns a non-empty headline for empty canvas', () => {
    expect(evaluateCanvas({}).summary.headline.length).toBeGreaterThan(0);
  });

  it('returns a non-empty nextPriority for empty canvas', () => {
    expect(evaluateCanvas({}).summary.nextPriority.length).toBeGreaterThan(0);
  });
});

// ── Partial canvas ────────────────────────────────────────────

describe('evaluateCanvas — partial canvas', () => {
  const partialCanvas: CanvasData = {
    1: 'El cliente pierde tiempo en procesos manuales lentos y costosos.',
    4: 'App móvil con algoritmo de automatización y notificaciones inteligentes.',
  };

  it('counts filled blocks correctly', () => {
    expect(evaluateCanvas(partialCanvas).summary.filledBlocks).toBe(2);
  });

  it('sets completionPct to ~22 for 2/9 blocks', () => {
    expect(evaluateCanvas(partialCanvas).summary.completionPct).toBe(22);
  });

  it('includes EMPTY_BLOCK issues for the 7 missing blocks', () => {
    const result = evaluateCanvas(partialCanvas);
    const emptyIssues = result.blocks.filter(b => !b.filled);
    expect(emptyIssues).toHaveLength(7);
  });
});

// ── Cross-block issues ────────────────────────────────────────

describe('evaluateCanvas — cross-block coherence', () => {
  it('detects SOLUTION_WITHOUT_PROBLEM when solution is filled but problem is empty', () => {
    const canvas: CanvasData = {
      4: 'Plataforma SaaS con dashboard y módulo de reportes en tiempo real.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues.some(i => i.code === 'SOLUTION_WITHOUT_PROBLEM')).toBe(true);
  });

  it('detects COSTS_WITHOUT_REVENUE when costs are filled but revenue is empty', () => {
    const canvas: CanvasData = {
      7: 'Servidores cloud 1.500 €/mes, salarios 3 desarrolladores, marketing 500 €/mes.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues.some(i => i.code === 'COSTS_WITHOUT_REVENUE')).toBe(true);
  });

  it('detects CHANNELS_WITHOUT_SEGMENT when channels are filled but segment is empty', () => {
    const canvas: CanvasData = {
      1: 'Los equipos de ventas pierden horas en tareas manuales repetitivas.',
      4: 'App de automatización con dashboard e integración CRM.',
      5: 'SEO orgánico, LinkedIn outreach y email marketing dirigido.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues.some(i => i.code === 'CHANNELS_WITHOUT_SEGMENT')).toBe(true);
  });

  it('detects UVP_WITHOUT_SEGMENT when UVP is filled but segment is empty', () => {
    const canvas: CanvasData = {
      1: 'Los equipos de ventas pierden horas en tareas manuales repetitivas.',
      3: 'Automatiza el 80% de las tareas de seguimiento de ventas en minutos.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues.some(i => i.code === 'UVP_WITHOUT_SEGMENT')).toBe(true);
  });

  it('detects METRICS_WITHOUT_REVENUE when metrics are filled but revenue is empty', () => {
    const canvas: CanvasData = {
      1: 'Los equipos de ventas pierden horas en tareas manuales repetitivas.',
      2: 'Equipos de ventas B2B de startups de 10-50 empleados.',
      8: 'CAC, LTV, MRR, tasa de activación y churn mensual.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues.some(i => i.code === 'METRICS_WITHOUT_REVENUE')).toBe(true);
  });

  it('detects UNFAIR_ADVANTAGE_TOO_GENERIC when UFA only has copyable attributes', () => {
    const canvas: CanvasData = {
      1: 'Los equipos pierden horas en tareas manuales costosas.',
      4: 'App con automatización y flujo de trabajo integrado.',
      9: 'Nuestro equipo tiene mucha experiencia, dedicación y pasión por el producto.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues.some(i => i.code === 'UNFAIR_ADVANTAGE_TOO_GENERIC')).toBe(true);
  });

  it('does NOT detect UNFAIR_ADVANTAGE_TOO_GENERIC when UFA mentions a real moat', () => {
    const canvas: CanvasData = {
      9: 'Tenemos una patente registrada y acceso exclusivo a datos únicos del sector.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues.some(i => i.code === 'UNFAIR_ADVANTAGE_TOO_GENERIC')).toBe(false);
  });

  it('does not emit cross-block issues for a coherent partial canvas', () => {
    const canvas: CanvasData = {
      1: 'El cliente pierde tiempo en procesos manuales.',
      4: 'App con automatización y flujo de trabajo integrado.',
      2: 'Pymes de 10-50 empleados del sector contable.',
      5: 'SEO orgánico y LinkedIn outreach directo a gestorías.',
      6: 'Suscripción mensual de 49 €/mes por empresa. LTV estimado 600 €.',
      7: 'Servidores 500 €/mes, soporte 1.000 €/mes.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues).toHaveLength(0);
  });
});

// ── Consistency score ─────────────────────────────────────────

describe('evaluateCanvas — consistencyScore', () => {
  it('returns 0 when fewer than 3 blocks are filled', () => {
    const canvas: CanvasData = {
      4: 'Plataforma SaaS con dashboard.',
    };
    expect(evaluateCanvas(canvas).summary.consistencyScore).toBe(0);
  });

  it('returns 100 for a canvas with no cross-block issues', () => {
    const canvas: CanvasData = {
      1: 'El cliente pierde tiempo en procesos manuales repetitivos.',
      2: 'Pymes de 10-50 empleados del sector contable en España.',
      3: 'Ahorra 5 horas semanales eliminando gestión manual.',
      4: 'App con automatización y flujo de trabajo integrado.',
      5: 'SEO orgánico y LinkedIn outreach directo a gestorías.',
      6: 'Suscripción mensual de 49 €/mes por empresa. LTV estimado 600 €.',
      7: 'Servidores 500 €/mes, soporte 1.000 €/mes.',
    };
    expect(evaluateCanvas(canvas).summary.consistencyScore).toBe(100);
  });

  it('is lower when cross-block issues exist', () => {
    // Canvas with SOLUTION_WITHOUT_PROBLEM (critical) and CHANNELS_WITHOUT_SEGMENT (warning)
    const canvas: CanvasData = {
      2: 'Pymes de 10-50 empleados del sector contable en España.',
      4: 'App con dashboard, automatización y módulo de informes.',
      5: 'SEO, LinkedIn y email marketing mensual.',
      6: 'Suscripción mensual de 49 €/mes por empresa.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.consistencyScore).toBeLessThan(100);
  });
});

// ── Specificity score in summary ──────────────────────────────

describe('evaluateCanvas — specificityScore in summary', () => {
  it('returns 0 for empty canvas', () => {
    expect(evaluateCanvas({}).summary.specificityScore).toBe(0);
  });

  it('is higher for quantified content than for vague content', () => {
    const vagueCanvas: CanvasData = {
      1: 'Hay varios problemas en general para todos los usuarios etc.',
      6: 'Vamos a cobrar dinero de alguna forma por las ventas.',
    };
    const specificCanvas: CanvasData = {
      1: 'El cliente pierde 4 horas semanales en conciliación bancaria manual.',
      6: 'Suscripción SaaS de 49 €/mes por empresa, con plan anual a 490 €/año.',
    };
    expect(evaluateCanvas(specificCanvas).summary.specificityScore)
      .toBeGreaterThan(evaluateCanvas(vagueCanvas).summary.specificityScore);
  });
});

// ── Subscores in summary ──────────────────────────────────────

describe('evaluateCanvas — summary subscores', () => {
  it('completenessScore increases as more blocks are filled', () => {
    const oneBlock   = evaluateCanvas({ 1: 'texto de ejemplo para el primer bloque del canvas lean' });
    const threeBlocks = evaluateCanvas({
      1: 'texto de ejemplo para el primer bloque del canvas lean',
      2: 'pymes medianas con 20 empleados en sector logístico',
      3: 'ahorra 5 horas semanales eliminando gestión manual',
    });
    expect(threeBlocks.summary.completenessScore).toBeGreaterThan(oneBlock.summary.completenessScore);
  });

  it('clarityScore is higher for specific content than for vague content', () => {
    const vagueCanvas: CanvasData = {
      1: 'Hay varios problemas en general para todos los usuarios etc.',
      2: 'Todo el mundo cualquier persona gente en general.',
    };
    const specificCanvas: CanvasData = {
      1: 'El cliente pierde 4 horas semanales en conciliación bancaria manual con riesgo de errores contables.',
      2: 'Contables autónomos en España de 30-50 años con cartera de 20-50 clientes pyme.',
    };
    expect(evaluateCanvas(specificCanvas).summary.clarityScore)
      .toBeGreaterThan(evaluateCanvas(vagueCanvas).summary.clarityScore);
  });

  it('evaluatedAt is a valid ISO timestamp', () => {
    const result = evaluateCanvas({});
    expect(() => new Date(result.evaluatedAt)).not.toThrow();
    expect(new Date(result.evaluatedAt).getFullYear()).toBeGreaterThan(2020);
  });
});

// ── Strategic readiness score ─────────────────────────────────

describe('evaluateCanvas — strategicReadinessScore', () => {
  it('returns 0 when fewer than 3 blocks are filled', () => {
    expect(evaluateCanvas({}).summary.strategicReadinessScore).toBe(0);
    expect(evaluateCanvas({ 1: 'El cliente pierde tiempo en tareas manuales costosas.' }).summary.strategicReadinessScore).toBe(0);
  });

  it('is higher when both costs and revenue are defined', () => {
    const withFinancials: CanvasData = {
      1: 'El cliente pierde horas en procesos manuales.',
      2: 'Pymes del sector contable con 10-50 empleados.',
      3: 'Ahorra 5 horas semanales automatizando flujos.',
      6: 'Suscripción de 49 €/mes por empresa.',
      7: 'Servidores 500 €/mes, salarios 2.000 €/mes.',
    };
    const withoutFinancials: CanvasData = {
      1: 'El cliente pierde horas en procesos manuales.',
      2: 'Pymes del sector contable con 10-50 empleados.',
      3: 'Ahorra 5 horas semanales automatizando flujos.',
    };
    expect(evaluateCanvas(withFinancials).summary.strategicReadinessScore)
      .toBeGreaterThan(evaluateCanvas(withoutFinancials).summary.strategicReadinessScore);
  });

  it('is higher when CAC/LTV are mentioned in metrics', () => {
    const withCacLtv: CanvasData = {
      1: 'El cliente pierde tiempo en procesos manuales.',
      2: 'Pymes B2B de 10-50 empleados.',
      3: 'Ahorra 5 horas semanales.',
      6: 'Suscripción 49 €/mes.',
      7: 'Servidores 500 €/mes.',
      8: 'CAC < 200 €, LTV > 1.000 €, churn mensual < 3%.',
    };
    const withoutCacLtv: CanvasData = {
      1: 'El cliente pierde tiempo en procesos manuales.',
      2: 'Pymes B2B de 10-50 empleados.',
      3: 'Ahorra 5 horas semanales.',
      6: 'Suscripción 49 €/mes.',
      7: 'Servidores 500 €/mes.',
      8: 'Tasa de activación y número de usuarios activos.',
    };
    expect(evaluateCanvas(withCacLtv).summary.strategicReadinessScore)
      .toBeGreaterThan(evaluateCanvas(withoutCacLtv).summary.strategicReadinessScore);
  });

  it('is lower when critical cross-block issues are present', () => {
    // Canvas with COSTS_WITHOUT_REVENUE (critical)
    const withCritical: CanvasData = {
      1: 'El cliente pierde tiempo en procesos manuales.',
      2: 'Pymes B2B de 10-50 empleados.',
      3: 'Ahorra 5 horas semanales.',
      7: 'Servidores 500 €/mes, salarios 2.000 €/mes.',
    };
    // Same canvas but with revenue too (no critical cross-block issue)
    const withoutCritical: CanvasData = {
      ...withCritical,
      6: 'Suscripción 49 €/mes.',
    };
    expect(evaluateCanvas(withCritical).summary.strategicReadinessScore)
      .toBeLessThan(evaluateCanvas(withoutCritical).summary.strategicReadinessScore);
  });
});

// ── Headline ──────────────────────────────────────────────────

describe('evaluateCanvas — headline', () => {
  it('returns a string for all canvas states', () => {
    for (const canvas of [{}, { 1: 'texto' }, { 1: 'texto', 2: 'segmento' }] as CanvasData[]) {
      expect(typeof evaluateCanvas(canvas).summary.headline).toBe('string');
      expect(evaluateCanvas(canvas).summary.headline.length).toBeGreaterThan(0);
    }
  });

  it('mentions canvas state for empty canvas', () => {
    const { headline } = evaluateCanvas({}).summary;
    expect(headline.toLowerCase()).toMatch(/blanco|vac|empieza/);
  });

  it('is positive for a high-scoring full canvas', () => {
    const richCanvas: CanvasData = {
      1: 'El cliente pierde entre 3 y 5 horas semanales gestionando facturas de forma manual. Alternativas actuales (Excel, papel) son propensas a errores y no ofrecen visibilidad en tiempo real.',
      2: 'Contables autónomos en España de 30-50 años con cartera de 20-50 clientes pyme del sector servicios.',
      3: 'Automatiza el 90% de la conciliación bancaria. Ahorra 4 horas semanales a cada contable.',
      4: 'App web con IA para conciliación automática, dashboard en tiempo real e integración con bancos españoles.',
      5: 'SEO orgánico para contables, LinkedIn outreach a gestorías y email marketing mensual a base de datos propia.',
      6: 'Suscripción SaaS de 49 €/mes por contable, plan anual a 490 €/año con descuento.',
      7: 'Servidores AWS 800 €/mes, soporte técnico 1.200 €/mes, marketing 500 €/mes.',
      8: 'CAC < 150 €, LTV > 900 €, MRR crecimiento 15% mensual, churn < 2% mensual.',
      9: 'Dataset exclusivo de 50.000 transacciones anotadas y acuerdo preferente con 3 bancos españoles.',
    };
    const { headline } = evaluateCanvas(richCanvas).summary;
    // Should be a positive headline
    expect(headline.toLowerCase()).toMatch(/sólido|validar|prometedor|preparado/);
  });
});

// ── Next priority ─────────────────────────────────────────────

describe('evaluateCanvas — nextPriority', () => {
  it('returns a string for all canvas states', () => {
    for (const canvas of [{}, { 1: 'texto' }] as CanvasData[]) {
      expect(typeof evaluateCanvas(canvas).summary.nextPriority).toBe('string');
      expect(evaluateCanvas(canvas).summary.nextPriority.length).toBeGreaterThan(0);
    }
  });

  it('mentions completing blocks when canvas is < 50% filled', () => {
    const { nextPriority } = evaluateCanvas({ 1: 'El cliente pierde tiempo en procesos manuales repetitivos.' }).summary;
    expect(nextPriority.toLowerCase()).toMatch(/complet|vac/);
  });

  it('surfaces the critical cross-block fix when it is the top issue', () => {
    // COSTS_WITHOUT_REVENUE is critical
    const canvas: CanvasData = {
      1: 'El cliente pierde tiempo en procesos manuales.',
      2: 'Pymes B2B de 10-50 empleados.',
      3: 'Ahorra 5 horas semanales.',
      4: 'App de automatización con dashboard.',
      5: 'SEO orgánico y LinkedIn.',
      7: 'Servidores 500 €/mes, salarios 2.000 €/mes.',
    };
    const { nextPriority } = evaluateCanvas(canvas).summary;
    // Should reference the critical inconsistency
    expect(nextPriority.toLowerCase()).toMatch(/inconsistencia|ingres|viabilidad/);
  });
});

// ── Issue sorting ─────────────────────────────────────────────

describe('evaluateCanvas — topIssues sorted by severity', () => {
  it('critical issues appear before warning issues in topIssues', () => {
    const canvas: CanvasData = {
      1: 'El cliente pierde tiempo en procesos manuales repetitivos.',
      2: 'Pymes del sector contable.',
      4: 'App de automatización.',
      7: 'Servidores 500 €/mes.',
    };
    const result = evaluateCanvas(canvas);
    const { topIssues } = result.summary;
    const firstWarningIdx = topIssues.findIndex(i => i.severity === 'warning');
    const lastCriticalIdx  = [...topIssues].reverse().findIndex(i => i.severity === 'critical');
    if (firstWarningIdx !== -1 && lastCriticalIdx !== -1) {
      // All criticals must come before all warnings
      expect(firstWarningIdx).toBeGreaterThan(topIssues.length - 1 - lastCriticalIdx);
    }
  });

  it('returns at most 5 items in topIssues', () => {
    const result = evaluateCanvas({});
    expect(result.summary.topIssues.length).toBeLessThanOrEqual(5);
  });

  it('topIssues contains no info-only issues when critical issues exist', () => {
    const result = evaluateCanvas({}); // all 9 blocks empty = 9 critical EMPTY_BLOCK issues
    const hasCritical = result.summary.topIssues.some(i => i.severity === 'critical');
    if (hasCritical) {
      const hasInfo = result.summary.topIssues.every(i => i.severity !== 'info');
      expect(hasInfo).toBe(true);
    }
  });
});

// ── Score weights ─────────────────────────────────────────────

describe('evaluateCanvas — scoreWeights transparency', () => {
  it('exposes scoreWeights in every evaluation result', () => {
    const result = evaluateCanvas({});
    expect(result.summary.scoreWeights).toBeDefined();
    expect(result.summary.scoreWeights.completeness).toBe(SCORE_WEIGHTS.completeness);
    expect(result.summary.scoreWeights.clarity).toBe(SCORE_WEIGHTS.clarity);
    expect(result.summary.scoreWeights.specificity).toBe(SCORE_WEIGHTS.specificity);
    expect(result.summary.scoreWeights.consistency).toBe(SCORE_WEIGHTS.consistency);
    expect(result.summary.scoreWeights.strategicReadiness).toBe(SCORE_WEIGHTS.strategicReadiness);
    expect(result.summary.scoreWeights.marketClarity).toBe(SCORE_WEIGHTS.marketClarity);
    expect(result.summary.scoreWeights.valueProposition).toBe(SCORE_WEIGHTS.valueProposition);
    expect(result.summary.scoreWeights.viability).toBe(SCORE_WEIGHTS.viability);
  });

  it('all weights sum to 1.0', () => {
    const weights = SCORE_WEIGHTS;
    const total = weights.completeness + weights.clarity + weights.specificity +
      weights.consistency + weights.strategicReadiness +
      weights.marketClarity + weights.valueProposition + weights.viability;
    expect(total).toBeCloseTo(1.0);
  });

  it('overallScore matches weighted formula for a known canvas', () => {
    const result = evaluateCanvas({
      1: 'El cliente pierde 4 horas semanales en conciliación bancaria manual.',
      2: 'Pymes B2B de 10-50 empleados del sector contable.',
      6: 'Suscripción SaaS de 49 €/mes por empresa.',
    });
    const {
      completenessScore, clarityScore, specificityScore, consistencyScore,
      strategicReadinessScore, marketClarityScore, valuePropositionScore, viabilityScore,
      overallScore,
    } = result.summary;
    const w = SCORE_WEIGHTS;
    const expected = Math.round(
      completenessScore       * w.completeness +
      clarityScore            * w.clarity +
      specificityScore        * w.specificity +
      consistencyScore        * w.consistency +
      strategicReadinessScore * w.strategicReadiness +
      marketClarityScore      * w.marketClarity +
      valuePropositionScore   * w.valueProposition +
      viabilityScore          * w.viability,
    );
    expect(overallScore).toBe(expected);
  });
});

// ── Strengths in summary ──────────────────────────────────────

describe('evaluateCanvas — topStrengths', () => {
  it('returns strengths for a well-developed canvas', () => {
    const canvas: CanvasData = {
      1: `El cliente pierde entre 3 y 5 horas semanales gestionando facturas de forma manual.
          Las alternativas actuales (Excel, papel) son propensas a errores y no ofrecen visibilidad
          en tiempo real. El coste de los errores contables puede superar los 2.000 € anuales.`,
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.topStrengths.length).toBeGreaterThan(0);
  });

  it('returns an empty topStrengths for empty canvas', () => {
    expect(evaluateCanvas({}).summary.topStrengths).toHaveLength(0);
  });
});

// ── Empty canvas ──────────────────────────────────────────────

describe('evaluateCanvas — empty canvas', () => {
  it('returns 0 filledBlocks, 0 completionPct, 0 overallScore', () => {
    const result = evaluateCanvas({});
    expect(result.summary.filledBlocks).toBe(0);
    expect(result.summary.completionPct).toBe(0);
    expect(result.summary.overallScore).toBe(0);
  });

  it('returns completenessScore=0 and clarityScore=0', () => {
    const result = evaluateCanvas({});
    expect(result.summary.completenessScore).toBe(0);
    expect(result.summary.clarityScore).toBe(0);
  });

  it('sets verdict to "Incompleto"', () => {
    expect(evaluateCanvas({}).summary.verdict).toBe('Incompleto');
  });

  it('returns exactly 9 block results', () => {
    expect(evaluateCanvas({}).blocks).toHaveLength(9);
  });
});

// ── Partial canvas ────────────────────────────────────────────

describe('evaluateCanvas — partial canvas', () => {
  const partialCanvas: CanvasData = {
    1: 'El cliente pierde tiempo en procesos manuales lentos y costosos.',
    4: 'App móvil con algoritmo de automatización y notificaciones inteligentes.',
  };

  it('counts filled blocks correctly', () => {
    expect(evaluateCanvas(partialCanvas).summary.filledBlocks).toBe(2);
  });

  it('sets completionPct to ~22 for 2/9 blocks', () => {
    expect(evaluateCanvas(partialCanvas).summary.completionPct).toBe(22);
  });

  it('includes EMPTY_BLOCK issues for the 7 missing blocks', () => {
    const result = evaluateCanvas(partialCanvas);
    const emptyIssues = result.blocks.filter(b => !b.filled);
    expect(emptyIssues).toHaveLength(7);
  });
});

// ── Cross-block issues ────────────────────────────────────────

describe('evaluateCanvas — cross-block coherence', () => {
  it('detects SOLUTION_WITHOUT_PROBLEM when solution is filled but problem is empty', () => {
    const canvas: CanvasData = {
      4: 'Plataforma SaaS con dashboard y módulo de reportes en tiempo real.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues.some(i => i.code === 'SOLUTION_WITHOUT_PROBLEM')).toBe(true);
  });

  it('detects REVENUE_WITHOUT_SEGMENT when revenue is filled but segment is empty', () => {
    const canvas: CanvasData = {
      1: 'El cliente pierde tiempo gestionando procesos internos de forma manual.',
      4: 'App de automatización con dashboard en tiempo real.',
      6: 'Suscripción SaaS de 49 €/mes por empresa.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues.some(i => i.code === 'REVENUE_WITHOUT_SEGMENT')).toBe(true);
  });

  it('detects COSTS_WITHOUT_REVENUE when costs are filled but revenue is empty', () => {
    const canvas: CanvasData = {
      7: 'Servidores cloud 1.500 €/mes, salarios 3 desarrolladores, marketing 500 €/mes.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues.some(i => i.code === 'COSTS_WITHOUT_REVENUE')).toBe(true);
  });

  it('detects CHANNELS_WITHOUT_SEGMENT when channels are filled but segment is empty', () => {
    const canvas: CanvasData = {
      1: 'Los equipos de ventas pierden horas en tareas manuales repetitivas.',
      4: 'App de automatización con dashboard e integración CRM.',
      5: 'SEO orgánico, LinkedIn outreach y email marketing dirigido.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues.some(i => i.code === 'CHANNELS_WITHOUT_SEGMENT')).toBe(true);
  });

  it('detects UVP_WITHOUT_SEGMENT when UVP is filled but segment is empty', () => {
    const canvas: CanvasData = {
      1: 'Los equipos de ventas pierden horas en tareas manuales repetitivas.',
      3: 'Automatiza el 80% de las tareas de seguimiento de ventas en minutos.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues.some(i => i.code === 'UVP_WITHOUT_SEGMENT')).toBe(true);
  });

  it('detects METRICS_WITHOUT_REVENUE when metrics are filled but revenue is empty', () => {
    const canvas: CanvasData = {
      1: 'Los equipos de ventas pierden horas en tareas manuales repetitivas.',
      2: 'Equipos de ventas B2B de startups de 10-50 empleados.',
      8: 'CAC, LTV, MRR, tasa de activación y churn mensual.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues.some(i => i.code === 'METRICS_WITHOUT_REVENUE')).toBe(true);
  });

  it('detects UNFAIR_ADVANTAGE_TOO_GENERIC when UFA only has copyable attributes', () => {
    const canvas: CanvasData = {
      1: 'Los equipos pierden horas en tareas manuales costosas.',
      4: 'App con automatización y flujo de trabajo integrado.',
      9: 'Nuestro equipo tiene mucha experiencia, dedicación y pasión por el producto.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues.some(i => i.code === 'UNFAIR_ADVANTAGE_TOO_GENERIC')).toBe(true);
  });

  it('does NOT detect UNFAIR_ADVANTAGE_TOO_GENERIC when UFA mentions a real moat', () => {
    const canvas: CanvasData = {
      9: 'Tenemos una patente registrada y acceso exclusivo a datos únicos del sector.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues.some(i => i.code === 'UNFAIR_ADVANTAGE_TOO_GENERIC')).toBe(false);
  });

  it('does not emit cross-block issues for a coherent partial canvas', () => {
    const canvas: CanvasData = {
      1: 'El cliente pierde tiempo en procesos manuales.',
      4: 'App con automatización y flujo de trabajo integrado.',
      2: 'Pymes de 10-50 empleados del sector contable.',
      5: 'SEO orgánico y LinkedIn outreach directo a gestorías.',
      6: 'Suscripción mensual de 49 €/mes por empresa. LTV estimado 600 €.',
      7: 'Servidores 500 €/mes, soporte 1.000 €/mes.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.crossBlockIssues).toHaveLength(0);
  });
});

// ── Consistency score ─────────────────────────────────────────

describe('evaluateCanvas — consistencyScore', () => {
  it('returns 0 when fewer than 3 blocks are filled', () => {
    const canvas: CanvasData = {
      4: 'Plataforma SaaS con dashboard.',
    };
    expect(evaluateCanvas(canvas).summary.consistencyScore).toBe(0);
  });

  it('returns 100 for a canvas with no cross-block issues', () => {
    const canvas: CanvasData = {
      1: 'El cliente pierde tiempo en procesos manuales repetitivos.',
      2: 'Pymes de 10-50 empleados del sector contable en España.',
      3: 'Ahorra 5 horas semanales eliminando gestión manual.',
      4: 'App con automatización y flujo de trabajo integrado.',
      5: 'SEO orgánico y LinkedIn outreach directo a gestorías.',
      6: 'Suscripción mensual de 49 €/mes por empresa. LTV estimado 600 €.',
      7: 'Servidores 500 €/mes, soporte 1.000 €/mes.',
    };
    expect(evaluateCanvas(canvas).summary.consistencyScore).toBe(100);
  });

  it('is lower when cross-block issues exist', () => {
    // Canvas with SOLUTION_WITHOUT_PROBLEM (critical) and CHANNELS_WITHOUT_SEGMENT (warning)
    const canvas: CanvasData = {
      2: 'Pymes de 10-50 empleados del sector contable en España.',
      4: 'App con dashboard, automatización y módulo de informes.',
      5: 'SEO, LinkedIn y email marketing mensual.',
      6: 'Suscripción mensual de 49 €/mes por empresa.',
    };
    const result = evaluateCanvas(canvas);
    expect(result.summary.consistencyScore).toBeLessThan(100);
  });
});

// ── Specificity score in summary ──────────────────────────────

describe('evaluateCanvas — specificityScore in summary', () => {
  it('returns 0 for empty canvas', () => {
    expect(evaluateCanvas({}).summary.specificityScore).toBe(0);
  });

  it('is higher for quantified content than for vague content', () => {
    const vagueCanvas: CanvasData = {
      1: 'Hay varios problemas en general para todos los usuarios etc.',
      6: 'Vamos a cobrar dinero de alguna forma por las ventas.',
    };
    const specificCanvas: CanvasData = {
      1: 'El cliente pierde 4 horas semanales en conciliación bancaria manual.',
      6: 'Suscripción SaaS de 49 €/mes por empresa, con plan anual a 490 €/año.',
    };
    expect(evaluateCanvas(specificCanvas).summary.specificityScore)
      .toBeGreaterThan(evaluateCanvas(vagueCanvas).summary.specificityScore);
  });
});

// ── Subscores in summary ──────────────────────────────────────

describe('evaluateCanvas — summary subscores', () => {
  it('completenessScore increases as more blocks are filled', () => {
    const oneBlock   = evaluateCanvas({ 1: 'texto de ejemplo para el primer bloque del canvas lean' });
    const threeBlocks = evaluateCanvas({
      1: 'texto de ejemplo para el primer bloque del canvas lean',
      2: 'pymes medianas con 20 empleados en sector logístico',
      3: 'ahorra 5 horas semanales eliminando gestión manual',
    });
    expect(threeBlocks.summary.completenessScore).toBeGreaterThan(oneBlock.summary.completenessScore);
  });

  it('clarityScore is higher for specific content than for vague content', () => {
    const vagueCanvas: CanvasData = {
      1: 'Hay varios problemas en general para todos los usuarios etc.',
      2: 'Todo el mundo cualquier persona gente en general.',
    };
    const specificCanvas: CanvasData = {
      1: 'El cliente pierde 4 horas semanales en conciliación bancaria manual con riesgo de errores contables.',
      2: 'Contables autónomos en España de 30-50 años con cartera de 20-50 clientes pyme.',
    };
    expect(evaluateCanvas(specificCanvas).summary.clarityScore)
      .toBeGreaterThan(evaluateCanvas(vagueCanvas).summary.clarityScore);
  });

  it('evaluatedAt is a valid ISO timestamp', () => {
    const result = evaluateCanvas({});
    expect(() => new Date(result.evaluatedAt)).not.toThrow();
    expect(new Date(result.evaluatedAt).getFullYear()).toBeGreaterThan(2020);
  });
});
