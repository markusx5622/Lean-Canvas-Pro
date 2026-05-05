// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · __tests__/scoring.test.ts
// ============================================================
import { describe, it, expect } from 'vitest';
import { computeCompletenessScore, computeClarityScore, aggregateSubscores } from '../scoring';

// ── computeCompletenessScore ──────────────────────────────────

describe('computeCompletenessScore', () => {
  const config = { minWords: 10, targetWords: 30 };

  it('returns 0 for empty text', () => {
    expect(computeCompletenessScore('', config)).toBe(0);
  });

  it('returns 5 for a single word', () => {
    expect(computeCompletenessScore('hola', config)).toBe(5);
  });

  it('returns a low score below minWords', () => {
    const score = computeCompletenessScore('uno dos tres cuatro cinco', config); // 5 words
    expect(score).toBeGreaterThan(5);
    expect(score).toBeLessThan(40);
  });

  it('returns ≥ 40 at exactly minWords', () => {
    const text = Array(10).fill('palabra').join(' ');
    expect(computeCompletenessScore(text, config)).toBeGreaterThanOrEqual(40);
  });

  it('returns 80 at targetWords', () => {
    const text = Array(30).fill('palabra').join(' ');
    expect(computeCompletenessScore(text, config)).toBe(80);
  });

  it('returns > 80 beyond targetWords', () => {
    const text = Array(50).fill('palabra').join(' ');
    expect(computeCompletenessScore(text, config)).toBeGreaterThan(80);
  });

  it('caps at 100', () => {
    const text = Array(500).fill('palabra').join(' ');
    expect(computeCompletenessScore(text, config)).toBeLessThanOrEqual(100);
  });

  it('adds structure bonus when rewardsStructure=true and text is structured', () => {
    const plain = Array(30).fill('palabra').join(' ');
    const structured = '- punto uno\n- punto dos\n- punto tres\n' + Array(27).fill('x').join(' ');
    const configWithStructure = { ...config, rewardsStructure: true };
    expect(computeCompletenessScore(structured, configWithStructure))
      .toBeGreaterThanOrEqual(computeCompletenessScore(plain, configWithStructure));
  });
});

// ── computeClarityScore ───────────────────────────────────────

describe('computeClarityScore', () => {
  const config = {
    positiveKeywords: ['problema', 'dolor', 'coste', 'tiempo', 'necesidad'],
    positiveThreshold: 2,
  };

  it('returns 0 for empty text', () => {
    expect(computeClarityScore('', config)).toBe(0);
  });

  it('starts at 50 for neutral text with no matches', () => {
    // No positive or vague matches
    const score = computeClarityScore('texto sin ninguna palabra clave relevante aquí', config);
    expect(score).toBe(50);
  });

  it('increases score when positive keywords are present', () => {
    const text = 'El cliente sufre un gran problema de coste y tiempo perdido.';
    const score = computeClarityScore(text, config);
    expect(score).toBeGreaterThan(50);
  });

  it('decreases score when shallow/vague terms appear', () => {
    const text = 'Todos pueden usarlo, hay varios cosas etc.';
    const score = computeClarityScore(text, config);
    expect(score).toBeLessThan(50);
  });

  it('boosts score when numbers present and rewardsNumbers=true', () => {
    const text = 'El problema cuesta 500 euros al mes al cliente.';
    const withNumbers   = computeClarityScore(text, { ...config, rewardsNumbers: true });
    const withoutNumbers = computeClarityScore(text, { ...config, rewardsNumbers: false });
    expect(withNumbers).toBeGreaterThanOrEqual(withoutNumbers);
  });

  it('penalises extra vague terms', () => {
    const base  = computeClarityScore('texto normal sin vaguedad', config);
    const vague = computeClarityScore('plataforma innovadora de última generación', {
      ...config,
      extraVagueTerms: ['innovadora', 'plataforma'],
    });
    expect(vague).toBeLessThanOrEqual(base);
  });

  it('never returns below 0', () => {
    const text = 'todos cualquiera etc varios muchos algo cosas';
    expect(computeClarityScore(text, config)).toBeGreaterThanOrEqual(0);
  });

  it('never returns above 100', () => {
    const text = 'problema dolor coste tiempo necesidad urgente cliente específico ahorra elimina';
    expect(computeClarityScore(text, config)).toBeLessThanOrEqual(100);
  });
});

// ── aggregateSubscores ────────────────────────────────────────

describe('aggregateSubscores', () => {
  it('returns 0/0 for empty input', () => {
    expect(aggregateSubscores([])).toEqual({ completenessScore: 0, clarityScore: 0 });
  });

  it('returns exact values for single item', () => {
    expect(aggregateSubscores([{ completenessScore: 80, clarityScore: 60 }]))
      .toEqual({ completenessScore: 80, clarityScore: 60 });
  });

  it('averages correctly across multiple blocks', () => {
    const blocks = [
      { completenessScore: 100, clarityScore: 80 },
      { completenessScore: 60,  clarityScore: 40 },
    ];
    expect(aggregateSubscores(blocks)).toEqual({ completenessScore: 80, clarityScore: 60 });
  });

  it('includes zero-score (unfilled) blocks in the average', () => {
    const blocks = [
      { completenessScore: 90, clarityScore: 90 },
      { completenessScore: 0,  clarityScore: 0 },
    ];
    const result = aggregateSubscores(blocks);
    expect(result.completenessScore).toBe(45);
    expect(result.clarityScore).toBe(45);
  });
});
