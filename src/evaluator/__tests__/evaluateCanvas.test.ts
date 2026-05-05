// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · __tests__/evaluateCanvas.test.ts
// ============================================================
import { describe, it, expect } from 'vitest';
import { evaluateCanvas } from '../evaluateCanvas';
import type { CanvasData } from '../types';

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
      6: 'Suscripción mensual de 49 €/mes por empresa.',
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
      6: 'Suscripción mensual de 49 €/mes por empresa.',
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
