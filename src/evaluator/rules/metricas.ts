// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · rules/metricas.ts
// Block 8 – Métricas Clave
// ============================================================
import type { Issue, Strength } from '../types';
import {
  wordCount, hasAnyKeyword, countKeywordMatches, looksLikePlaceholder,
  containsNumbers,
} from '../utils/text';
import { BLOCK_KEYWORDS } from '../dictionaries/keywords';

const KW = BLOCK_KEYWORDS[8];

export function evaluateMetricas(text: string): { issues: Issue[]; strengths: Strength[]; score: number } {
  const issues: Issue[] = [];
  const strengths: Strength[] = [];
  let score = 50;

  if (looksLikePlaceholder(text)) {
    return {
      issues: [{
        code: 'PLACEHOLDER',
        message: 'Las métricas clave no están definidas.',
        severity: 'critical',
        hint: 'Define 2–3 KPIs que realmente indican si el negocio funciona (CAC, LTV, MRR, churn…).',
      }],
      strengths: [],
      score: 5,
    };
  }

  const wc = wordCount(text);
  if (wc < 10) {
    issues.push({
      code: 'TOO_SHORT',
      message: 'Métricas insuficientemente descritas.',
      severity: 'warning',
      hint: 'Explica qué mides y por qué es relevante para tu modelo de negocio.',
    });
    score -= 10;
  }

  const posMatches = countKeywordMatches(text, KW.positive);
  if (posMatches >= 3) {
    strengths.push({
      code: 'ACTIONABLE_METRICS',
      message: 'Usa métricas accionables (CAC, LTV, MRR, churn, etc.) que permiten tomar decisiones.',
    });
    score += 25;
  } else if (posMatches === 1) {
    issues.push({
      code: 'FEW_METRICS',
      message: 'Solo se menciona una métrica clave. Define al menos CAC y LTV para poder calcular la viabilidad.',
      severity: 'warning',
      hint: 'Asegúrate de incluir métricas de adquisición (CAC) y retención/valor (LTV o churn).',
    });
    score -= 10;
  } else if (posMatches === 0) {
    issues.push({
      code: 'VANITY_METRICS',
      message: 'No se usan métricas de negocio reconocibles. Las métricas de vanidad (likes, visitas) no bastan.',
      severity: 'critical',
      hint: 'Define KPIs que impactan directamente en caja: CAC, LTV, MRR, tasa de conversión, churn.',
    });
    score -= 20;
  }

  if (containsNumbers(text)) {
    strengths.push({
      code: 'NUMERIC_TARGETS',
      message: 'Incluye valores numéricos u objetivos concretos, lo que da credibilidad al plan.',
    });
    score += 10;
  }

  if (hasAnyKeyword(text, ['cac', 'ltv', 'relación ltv', 'ratio ltv'])) {
    strengths.push({
      code: 'CAC_LTV_PRESENT',
      message: 'Incluye CAC y/o LTV, el dúo fundamental para evaluar la viabilidad económica.',
    });
    score += 10;
  }

  return { issues, strengths, score: Math.max(0, Math.min(100, score)) };
}
