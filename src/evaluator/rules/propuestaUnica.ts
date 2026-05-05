// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · rules/propuestaUnica.ts
// Block 3 – Propuesta de Valor Única
// ============================================================
import type { Issue, Strength } from '../types';
import {
  wordCount, hasAnyKeyword, countKeywordMatches, looksLikePlaceholder,
} from '../utils/text';
import { BLOCK_KEYWORDS } from '../dictionaries/keywords';

const KW = BLOCK_KEYWORDS[3];

const IDEAL_MAX_WORDS = 30; // A UVP should be concise

export function evaluatePropuestaUnica(text: string): { issues: Issue[]; strengths: Strength[]; score: number } {
  const issues: Issue[] = [];
  const strengths: Strength[] = [];
  let score = 50;

  if (looksLikePlaceholder(text)) {
    return {
      issues: [{
        code: 'PLACEHOLDER',
        message: 'La propuesta de valor única no está definida.',
        severity: 'critical',
        hint: 'Escribe una frase clara que responda: ¿qué haces y por qué eres diferente?',
      }],
      strengths: [],
      score: 5,
    };
  }

  const wc = wordCount(text);
  if (wc <= IDEAL_MAX_WORDS) {
    strengths.push({
      code: 'CONCISE_UVP',
      message: `Propuesta concisa (${wc} palabras), fácil de comunicar a clientes e inversores.`,
    });
    score += 15;
  } else {
    issues.push({
      code: 'UVP_TOO_LONG',
      message: `La propuesta es extensa (${wc} palabras). Una buena UVP debería caber en un tuit.`,
      severity: 'info',
      hint: 'Intenta condensarla a 1–2 frases impactantes.',
    });
    score -= 5;
  }

  const posMatches = countKeywordMatches(text, KW.positive);
  if (posMatches >= 2) {
    strengths.push({
      code: 'VALUE_LANGUAGE',
      message: 'Usa lenguaje de valor y diferenciación ("único", "beneficio", "mejor", etc.).',
    });
    score += 15;
  } else if (posMatches === 0) {
    issues.push({
      code: 'NO_DIFFERENTIATION',
      message: 'No se aprecia diferenciación ni propuesta de valor clara.',
      severity: 'warning',
      hint: 'Responde: ¿por qué elegiría alguien tu solución frente a las alternativas?',
    });
    score -= 15;
  }

  if (hasAnyKeyword(text, KW.generic) && posMatches < 2) {
    issues.push({
      code: 'GENERIC_PRODUCT_DESC',
      message: 'Suena a descripción genérica del producto, no a propuesta de valor única.',
      severity: 'warning',
      hint: 'Evita términos vacíos. En su lugar, describe el beneficio tangible que obtendrá el cliente.',
    });
    score -= 10;
  }

  if (hasAnyKeyword(text, ['más rápido', 'ahorra', 'reduce', 'elimina', 'automatiza', 'sin fricción'])) {
    strengths.push({
      code: 'OUTCOME_FOCUSED',
      message: 'La propuesta describe un resultado tangible para el cliente.',
    });
    score += 10;
  }

  return { issues, strengths, score: Math.max(0, Math.min(100, score)) };
}
