// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · __tests__/vagueTerms.test.ts
// ============================================================
import { describe, it, expect } from 'vitest';
import {
  HEDGE_WORDS,
  FILLER_WORDS,
  BROAD_AUDIENCE_TERMS,
  EMPTY_BUZZWORDS,
  GENERIC_PRODUCT_NOUNS,
  COPYABLE_ATTRIBUTES,
  ALL_VAGUE_TERMS,
  SHALLOW_CONTENT_TERMS,
} from '../dictionaries/vagueTerms';
import { hasAnyKeyword } from '../utils/text';

describe('vagueTerms dictionaries', () => {
  it('each category is a non-empty array of strings', () => {
    const categories = [
      HEDGE_WORDS, FILLER_WORDS, BROAD_AUDIENCE_TERMS,
      EMPTY_BUZZWORDS, GENERIC_PRODUCT_NOUNS, COPYABLE_ATTRIBUTES,
    ];
    for (const cat of categories) {
      expect(Array.isArray(cat)).toBe(true);
      expect(cat.length).toBeGreaterThan(0);
      for (const term of cat) {
        expect(typeof term).toBe('string');
        expect(term.length).toBeGreaterThan(0);
      }
    }
  });

  it('ALL_VAGUE_TERMS contains all category terms', () => {
    const allSources = [
      ...HEDGE_WORDS,
      ...FILLER_WORDS,
      ...BROAD_AUDIENCE_TERMS,
      ...EMPTY_BUZZWORDS,
      ...GENERIC_PRODUCT_NOUNS,
      ...COPYABLE_ATTRIBUTES,
    ];
    for (const term of allSources) {
      expect(ALL_VAGUE_TERMS).toContain(term);
    }
  });

  it('SHALLOW_CONTENT_TERMS is a subset of ALL_VAGUE_TERMS', () => {
    for (const term of SHALLOW_CONTENT_TERMS) {
      expect(ALL_VAGUE_TERMS).toContain(term);
    }
  });

  describe('hasAnyKeyword integration', () => {
    it('detects hedge words in text', () => {
      expect(hasAnyKeyword('quizás lo usaría alguien', HEDGE_WORDS)).toBe(true);
    });

    it('detects filler words', () => {
      expect(hasAnyKeyword('hay varios problemas etc', FILLER_WORDS)).toBe(true);
    });

    it('detects broad audience terms', () => {
      expect(hasAnyKeyword('cualquier persona puede usarlo', BROAD_AUDIENCE_TERMS)).toBe(true);
    });

    it('detects empty buzzwords (accent-insensitive)', () => {
      expect(hasAnyKeyword('es una solución innovadora y disruptiva', EMPTY_BUZZWORDS)).toBe(true);
      // accent-normalised: "innovador" should still match "innovadora"
    });

    it('detects generic product nouns', () => {
      expect(hasAnyKeyword('es una plataforma SaaS', GENERIC_PRODUCT_NOUNS)).toBe(true);
    });

    it('detects copyable attributes', () => {
      expect(hasAnyKeyword('tenemos mucha pasión y dedicación', COPYABLE_ATTRIBUTES)).toBe(true);
    });

    it('returns false for specific, high-quality content', () => {
      const specificText = 'Algoritmo propietario con 5 patentes registradas y acceso exclusivo a datos de 50 hospitales.';
      expect(hasAnyKeyword(specificText, COPYABLE_ATTRIBUTES)).toBe(false);
      expect(hasAnyKeyword(specificText, BROAD_AUDIENCE_TERMS)).toBe(false);
    });
  });
});
