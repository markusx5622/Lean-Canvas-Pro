// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · rules/costes.ts
// Block 7 – Estructura de Costes
// ============================================================
import type { Issue, Strength } from '../types';
import {
  wordCount, hasAnyKeyword, countKeywordMatches, looksLikePlaceholder,
  containsNumbers, looksStructured,
} from '../utils/text';
import { BLOCK_KEYWORDS } from '../dictionaries/keywords';

const KW = BLOCK_KEYWORDS[7];

export function evaluateCostes(text: string): { issues: Issue[]; strengths: Strength[]; score: number } {
  const issues: Issue[] = [];
  const strengths: Strength[] = [];
  let score = 50;

  if (looksLikePlaceholder(text)) {
    return {
      issues: [{
        code: 'PLACEHOLDER',
        message: 'La estructura de costes no está definida.',
        severity: 'critical',
        hint: 'Enumera los costes fijos y variables más importantes para operar el negocio.',
      }],
      strengths: [],
      score: 5,
    };
  }

  const wc = wordCount(text);
  if (wc < 10) {
    issues.push({
      code: 'TOO_SHORT',
      message: 'Descripción de costes demasiado breve.',
      severity: 'warning',
      hint: 'Enumera los principales costes: salarios, infraestructura, marketing, legales, etc.',
    });
    score -= 10;
  }

  const posMatches = countKeywordMatches(text, KW.positive);
  if (posMatches >= 3) {
    strengths.push({
      code: 'DETAILED_COSTS',
      message: 'Estructura de costes detallada con categorías concretas.',
    });
    score += 20;
  } else if (posMatches < 2) {
    issues.push({
      code: 'VAGUE_COSTS',
      message: 'Los costes son demasiado genéricos.',
      severity: 'warning',
      hint: 'Detalla categorías: salarios, servidores/cloud, adquisición de clientes (CAC), legal, etc.',
    });
    score -= 10;
  }

  if (containsNumbers(text)) {
    strengths.push({
      code: 'QUANTIFIED_COSTS',
      message: 'Los costes incluyen valores numéricos, lo que permite calcular el burn rate y el punto de equilibrio.',
    });
    score += 15;
  } else {
    issues.push({
      code: 'NO_NUMBERS',
      message: 'Sin cifras es difícil calcular el punto de equilibrio o el runway.',
      severity: 'info',
      hint: 'Añade estimaciones aunque sean aproximadas (p.ej. "~3.000 €/mes en servidores").',
    });
  }

  if (hasAnyKeyword(text, ['fijo', 'variable', 'burn', 'runway', 'break even', 'punto de equilibrio'])) {
    strengths.push({
      code: 'FIXED_VARIABLE_SPLIT',
      message: 'Distingue entre costes fijos y variables o menciona indicadores de sostenibilidad (burn rate, break even).',
    });
    score += 10;
  }

  if (looksStructured(text)) {
    strengths.push({
      code: 'STRUCTURED_COSTS',
      message: 'Costes presentados en formato de lista, fácil de revisar y actualizar.',
    });
    score += 5;
  }

  return { issues, strengths, score: Math.max(0, Math.min(100, score)) };
}
