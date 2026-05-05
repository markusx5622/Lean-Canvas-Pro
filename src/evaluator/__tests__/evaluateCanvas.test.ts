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
