// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · rules/flujoIngresos.ts
// Block 6 – Flujo de Ingresos
// ============================================================
import type { Issue, Strength } from '../types';
import {
  wordCount, hasAnyKeyword, countKeywordMatches, looksLikePlaceholder,
  containsNumbers,
} from '../utils/text';
import { BLOCK_KEYWORDS } from '../dictionaries/keywords';

const KW = BLOCK_KEYWORDS[6];

export function evaluateFlujoIngresos(text: string): { issues: Issue[]; strengths: Strength[]; score: number } {
  const issues: Issue[] = [];
  const strengths: Strength[] = [];
  let score = 50;

  if (looksLikePlaceholder(text)) {
    return {
      issues: [{
        code: 'PLACEHOLDER',
        message: 'El modelo de ingresos no está definido.',
        severity: 'critical',
        hint: 'Define cómo vas a monetizar: suscripción, freemium, comisión por transacción, etc.',
      }],
      strengths: [],
      score: 5,
    };
  }

  const wc = wordCount(text);
  if (wc < 10) {
    issues.push({
      code: 'TOO_SHORT',
      message: 'Modelo de ingresos insuficientemente descrito.',
      severity: 'warning',
      hint: 'Explica el modelo de monetización, el precio y la frecuencia de pago.',
    });
    score -= 10;
  }

  const posMatches = countKeywordMatches(text, KW.positive);
  if (posMatches >= 2) {
    strengths.push({
      code: 'CLEAR_REVENUE_MODEL',
      message: 'El modelo de ingresos está claramente definido (suscripción, comisión, licencia, etc.).',
    });
    score += 20;
  } else if (posMatches === 0) {
    issues.push({
      code: 'NO_REVENUE_MODEL',
      message: 'No se identifica un modelo de monetización concreto.',
      severity: 'critical',
      hint: 'Define: ¿suscripción mensual/anual, pago por uso, comisión, freemium + premium?',
    });
    score -= 20;
  }

  if (containsNumbers(text)) {
    strengths.push({
      code: 'PRICING_DEFINED',
      message: 'Incluye cifras de precio o ingresos esperados, lo que permite validar la viabilidad financiera.',
    });
    score += 15;
  } else {
    issues.push({
      code: 'NO_PRICING',
      message: 'No se mencionan precios o rangos de precio.',
      severity: 'warning',
      hint: 'Añade al menos un rango de precio o ticket medio estimado.',
    });
    score -= 10;
  }

  if (hasAnyKeyword(text, ['recurrente', 'suscripción', 'mrr', 'arr', 'mensual', 'anual'])) {
    strengths.push({
      code: 'RECURRING_REVENUE',
      message: 'Los ingresos recurrentes (MRR/ARR) aumentan la previsibilidad y el valor de la empresa.',
    });
    score += 10;
  }

  return { issues, strengths, score: Math.max(0, Math.min(100, score)) };
}
