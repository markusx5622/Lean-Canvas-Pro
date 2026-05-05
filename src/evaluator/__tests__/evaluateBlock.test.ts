// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · __tests__/evaluateBlock.test.ts
// ============================================================
import { describe, it, expect } from 'vitest';
import { evaluateBlock } from '../evaluateBlock';
import type { CanvasData } from '../types';

// ── Empty block ───────────────────────────────────────────────

describe('evaluateBlock — empty block', () => {
  it('returns filled=false and score=0 when block is missing', () => {
    const canvas: CanvasData = {};
    const result = evaluateBlock(1, canvas);
    expect(result.filled).toBe(false);
    expect(result.score).toBe(0);
    expect(result.completenessScore).toBe(0);
    expect(result.clarityScore).toBe(0);
  });

  it('emits an EMPTY_BLOCK critical issue', () => {
    const result = evaluateBlock(2, {});
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].code).toBe('EMPTY_BLOCK');
    expect(result.issues[0].severity).toBe('critical');
  });

  it('returns no strengths for empty block', () => {
    expect(evaluateBlock(3, {}).strengths).toHaveLength(0);
  });
});

// ── Placeholder / too-short block ────────────────────────────

describe('evaluateBlock — too-short content', () => {
  it('reports PLACEHOLDER for single-word text', () => {
    const canvas: CanvasData = { 1: 'pain' };
    const result = evaluateBlock(1, canvas);
    expect(result.issues.some(i => i.code === 'PLACEHOLDER')).toBe(true);
  });

  it('scores completenessScore very low for placeholder text', () => {
    const canvas: CanvasData = { 4: 'app' };
    const result = evaluateBlock(4, canvas);
    expect(result.completenessScore).toBeLessThanOrEqual(10);
  });
});

// ── Well-developed block ──────────────────────────────────────

describe('evaluateBlock — well-developed Problema block', () => {
  const richText = `
    El cliente pierde entre 3 y 5 horas semanales gestionando facturas de forma manual.
    Las alternativas actuales (Excel, papel) son propensas a errores y no ofrecen visibilidad
    en tiempo real. El coste de los errores contables puede superar los 2.000 € anuales por empresa.
    Además, el proceso de conciliación bancaria es tedioso y consume recursos del equipo de contabilidad.
  `;

  it('sets filled=true', () => {
    expect(evaluateBlock(1, { 1: richText }).filled).toBe(true);
  });

  it('has a completenessScore ≥ 60 for rich text', () => {
    expect(evaluateBlock(1, { 1: richText }).completenessScore).toBeGreaterThanOrEqual(60);
  });

  it('has a clarityScore ≥ 60 for domain-specific text', () => {
    expect(evaluateBlock(1, { 1: richText }).clarityScore).toBeGreaterThanOrEqual(60);
  });

  it('detects MENTIONS_ALTERNATIVES strength', () => {
    const result = evaluateBlock(1, { 1: richText });
    expect(result.strengths.some(s => s.code === 'MENTIONS_ALTERNATIVES')).toBe(true);
  });
});

// ── Generic / vague content ───────────────────────────────────

describe('evaluateBlock — vague content (Segmentos)', () => {
  it('penalises SEGMENT_TOO_BROAD when broad audience terms appear', () => {
    const canvas: CanvasData = { 2: 'Todo el mundo puede usarlo, cualquier persona interesada.' };
    const result = evaluateBlock(2, canvas);
    expect(result.issues.some(i => i.code === 'SEGMENT_TOO_BROAD')).toBe(true);
  });

  it('has a clarityScore below 50 for very vague segment text', () => {
    const canvas: CanvasData = { 2: 'Todos los usuarios en general, cualquier persona, gente en general.' };
    expect(evaluateBlock(2, canvas).clarityScore).toBeLessThan(50);
  });
});

// ── Subscores are always present ─────────────────────────────

describe('evaluateBlock — subscores shape', () => {
  const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

  for (const id of ids) {
    it(`block ${id} always returns numeric completenessScore and clarityScore`, () => {
      const canvas: CanvasData = { [id]: 'texto de ejemplo para evaluar este bloque del canvas lean' };
      const result = evaluateBlock(id, canvas as CanvasData);
      expect(typeof result.completenessScore).toBe('number');
      expect(typeof result.clarityScore).toBe('number');
      expect(result.completenessScore).toBeGreaterThanOrEqual(0);
      expect(result.completenessScore).toBeLessThanOrEqual(100);
      expect(result.clarityScore).toBeGreaterThanOrEqual(0);
      expect(result.clarityScore).toBeLessThanOrEqual(100);
    });
  }
});
