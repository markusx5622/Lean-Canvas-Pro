// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · rules/ventajaInjusta.ts
// Block 9 – Ventaja Injusta
// ============================================================
import type { Issue, Strength } from '../types';
import {
  wordCount, hasAnyKeyword, countKeywordMatches, looksLikePlaceholder,
} from '../utils/text';
import { BLOCK_KEYWORDS } from '../dictionaries/keywords';

const KW = BLOCK_KEYWORDS[9];

export function evaluateVentajaInjusta(text: string): { issues: Issue[]; strengths: Strength[]; score: number } {
  const issues: Issue[] = [];
  const strengths: Strength[] = [];
  let score = 50;

  if (looksLikePlaceholder(text)) {
    return {
      issues: [{
        code: 'PLACEHOLDER',
        message: 'La ventaja injusta no está definida.',
        severity: 'critical',
        hint: 'Describe qué tienes que la competencia no puede copiar fácilmente.',
      }],
      strengths: [],
      score: 5,
    };
  }

  const wc = wordCount(text);
  if (wc < 10) {
    issues.push({
      code: 'TOO_SHORT',
      message: 'Descripción demasiado breve para transmitir una ventaja competitiva real.',
      severity: 'warning',
      hint: 'Explica por qué esa ventaja es difícil de replicar.',
    });
    score -= 15;
  }

  const posMatches = countKeywordMatches(text, KW.positive);
  if (posMatches >= 2) {
    strengths.push({
      code: 'REAL_MOAT',
      message: 'La ventaja menciona activos defensivos concretos (patente, datos, comunidad, etc.).',
    });
    score += 20;
  } else if (posMatches === 0) {
    issues.push({
      code: 'NO_REAL_ADVANTAGE',
      message: 'No se identifica una ventaja difícil de copiar.',
      severity: 'critical',
      hint: 'Piensa en: acceso exclusivo, datos únicos, comunidad, patentes o barreras regulatorias.',
    });
    score -= 20;
  }

  if (hasAnyKeyword(text, KW.generic)) {
    issues.push({
      code: 'COPYABLE_ADVANTAGE',
      message: 'Elementos como "experiencia" o "pasión" son fácilmente copiables y no constituyen una ventaja injusta real.',
      severity: 'warning',
      hint: 'Una ventaja injusta real es algo que la competencia no puede comprar ni replicar fácilmente.',
    });
    score -= 12;
  }

  if (hasAnyKeyword(text, ['patente', 'propiedad intelectual', 'exclusivo', 'contrato exclusivo'])) {
    strengths.push({
      code: 'IP_PROTECTED',
      message: 'Menciona propiedad intelectual o acceso exclusivo, un moat muy difícil de replicar.',
    });
    score += 10;
  }

  // Reward network effects
  if (hasAnyKeyword(text, ['efecto red', 'network effect', 'efectos de red', 'red de usuarios', 'efectos de red'])) {
    strengths.push({
      code: 'NETWORK_EFFECT',
      message: 'Menciona efectos de red — una barrera de entrada que crece con cada usuario añadido.',
    });
    score += 10;
  }

  // Reward data flywheel / proprietary data
  if (hasAnyKeyword(text, ['datos propios', 'datos únicos', 'datos unicos', 'flywheel', 'volante de datos', 'dataset exclusivo', 'dataset propio'])) {
    strengths.push({
      code: 'DATA_FLYWHEEL',
      message: 'Los datos propios o exclusivos son un activo estratégico difícil de replicar que mejora con el uso.',
    });
    score += 10;
  }

  return { issues, strengths, score: Math.max(0, Math.min(100, score)) };
}
