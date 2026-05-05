// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · rules/solucion.ts
// Block 4 – Solución
// ============================================================
import type { Issue, Strength } from '../types';
import {
  wordCount, hasAnyKeyword, countKeywordMatches, looksLikePlaceholder,
  looksStructured,
} from '../utils/text';
import { BLOCK_KEYWORDS } from '../dictionaries/keywords';

const KW = BLOCK_KEYWORDS[4];

const MIN_WORDS = 15;

export function evaluateSolucion(text: string): { issues: Issue[]; strengths: Strength[]; score: number } {
  const issues: Issue[] = [];
  const strengths: Strength[] = [];
  let score = 50;

  if (looksLikePlaceholder(text)) {
    return {
      issues: [{
        code: 'PLACEHOLDER',
        message: 'La solución no está definida.',
        severity: 'critical',
        hint: 'Describe las 3 funcionalidades clave que resuelven el problema principal.',
      }],
      strengths: [],
      score: 5,
    };
  }

  const wc = wordCount(text);
  if (wc < MIN_WORDS) {
    issues.push({
      code: 'TOO_SHORT',
      message: `Solución muy resumida (${wc} palabras).`,
      severity: 'warning',
      hint: 'Describe al menos 2–3 características principales con algo más de detalle.',
    });
    score -= 15;
  }

  const posMatches = countKeywordMatches(text, KW.positive);
  if (posMatches >= 2) {
    strengths.push({
      code: 'FEATURE_FOCUSED',
      message: 'La solución está orientada a características concretas y accionables.',
    });
    score += 15;
  }

  if (hasAnyKeyword(text, ['mvp', 'mínimo viable', 'prototipo', 'piloto', 'v1'])) {
    strengths.push({
      code: 'MVP_MINDSET',
      message: 'Adopta una mentalidad MVP, lo que reduce riesgo y acelera la validación.',
    });
    score += 10;
  }

  if (looksStructured(text)) {
    strengths.push({
      code: 'STRUCTURED',
      message: 'La solución está presentada de forma estructurada (lista o pasos), lo que facilita la lectura.',
    });
    score += 10;
  }

  if (hasAnyKeyword(text, KW.generic) && posMatches < 2) {
    issues.push({
      code: 'SOLUTION_TOO_VAGUE',
      message: 'La solución parece una descripción genérica del producto, no de sus funcionalidades clave.',
      severity: 'warning',
      hint: 'En lugar de "plataforma", describe qué hace exactamente: "algoritmo de recomendación", "panel de control en tiempo real", etc.',
    });
    score -= 10;
  }

  return { issues, strengths, score: Math.max(0, Math.min(100, score)) };
}
