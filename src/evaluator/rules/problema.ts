// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · rules/problema.ts
// Block 1 – Problema
// ============================================================
import type { Issue, Strength } from '../types';
import {
  wordCount, sentenceCount, hasAnyKeyword, countKeywordMatches,
  looksLikePlaceholder, containsConcreteQuantity,
} from '../utils/text';
import { BLOCK_KEYWORDS } from '../dictionaries/keywords';

const KW = BLOCK_KEYWORDS[1];

const MIN_WORDS = 20;
const GOOD_WORDS = 50;
const MIN_PROBLEMS = 2; // A good Problema section mentions ≥ 2 distinct pains

export function evaluateProblema(text: string): { issues: Issue[]; strengths: Strength[]; score: number } {
  const issues: Issue[] = [];
  const strengths: Strength[] = [];
  let score = 50;

  if (looksLikePlaceholder(text)) {
    return {
      issues: [{
        code: 'PLACEHOLDER',
        message: 'El contenido es demasiado corto para evaluarlo.',
        severity: 'critical',
        hint: 'Describe al menos 2–3 problemas concretos que sufre tu cliente.',
      }],
      strengths: [],
      score: 5,
    };
  }

  const wc = wordCount(text);
  if (wc < MIN_WORDS) {
    issues.push({
      code: 'TOO_SHORT',
      message: `Contenido muy breve (${wc} palabras). Los problemas más convincentes se explican con detalle.`,
      severity: 'warning',
      hint: `Amplía hasta al menos ${MIN_WORDS} palabras describiendo el dolor real del cliente.`,
    });
    score -= 15;
  } else if (wc >= GOOD_WORDS) {
    strengths.push({
      code: 'WELL_DEVELOPED',
      message: 'Descripción extensa que demuestra conocimiento profundo del problema.',
    });
    score += 10;
  }

  const posMatches = countKeywordMatches(text, KW.positive);
  if (posMatches >= 3) {
    strengths.push({
      code: 'RICH_VOCABULARY',
      message: 'Usa vocabulario específico del dominio del problema (dolor, coste, tiempo, alternativas…).',
    });
    score += 15;
  } else if (posMatches === 0) {
    issues.push({
      code: 'VAGUE_LANGUAGE',
      message: 'El texto no describe claramente el dolor del cliente.',
      severity: 'warning',
      hint: 'Menciona palabras como "dolor", "coste", "tiempo perdido", "alternativas existentes".',
    });
    score -= 10;
  }

  if (hasAnyKeyword(text, KW.generic)) {
    issues.push({
      code: 'TOO_GENERIC',
      message: 'El problema parece genérico. Evita términos como "etc.", "varios" o "muchos".',
      severity: 'info',
      hint: 'Sé específico: ¿cuánto tiempo pierde el cliente? ¿Cuánto le cuesta hoy?',
    });
    score -= 8;
  }

  // Reward mention of multiple problems or alternatives
  const sc = sentenceCount(text);
  if (sc >= MIN_PROBLEMS) {
    strengths.push({
      code: 'MULTIPLE_PROBLEMS',
      message: 'Identifica múltiples problemas o matices, lo que da más riqueza al análisis.',
    });
    score += 10;
  }

  if (hasAnyKeyword(text, ['alternativas', 'workaround', 'como resuelven', 'solución actual'])) {
    strengths.push({
      code: 'MENTIONS_ALTERNATIVES',
      message: 'Menciona cómo los clientes resuelven el problema hoy, un dato clave para inversores.',
    });
    score += 10;
  } else {
    issues.push({
      code: 'MISSING_ALTERNATIVES',
      message: 'No se mencionan las alternativas existentes.',
      severity: 'warning',
      hint: 'Añade cómo resuelven el problema hoy tus clientes potenciales.',
    });
  }

  // Reward quantified pain (numbers make the problem tangible for investors)
  if (containsConcreteQuantity(text)) {
    strengths.push({
      code: 'QUANTIFIED_PAIN',
      message: 'El problema está cuantificado (tiempo, coste, frecuencia), lo que lo hace más convincente para inversores.',
    });
    score += 10;
  }

  return { issues, strengths, score: Math.max(0, Math.min(100, score)) };
}
