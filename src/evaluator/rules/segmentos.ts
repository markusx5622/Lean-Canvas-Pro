// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · rules/segmentos.ts
// Block 2 – Segmentos de Clientes
// ============================================================
import type { Issue, Strength } from '../types';
import {
  wordCount, hasAnyKeyword, countKeywordMatches, looksLikePlaceholder,
} from '../utils/text';
import { BLOCK_KEYWORDS } from '../dictionaries/keywords';

const KW = BLOCK_KEYWORDS[2];

export function evaluateSegmentos(text: string): { issues: Issue[]; strengths: Strength[]; score: number } {
  const issues: Issue[] = [];
  const strengths: Strength[] = [];
  let score = 50;

  if (looksLikePlaceholder(text)) {
    return {
      issues: [{
        code: 'PLACEHOLDER',
        message: 'Los segmentos de clientes no están definidos.',
        severity: 'critical',
        hint: 'Define quién es tu cliente ideal y cuál sería tu early adopter.',
      }],
      strengths: [],
      score: 5,
    };
  }

  const wc = wordCount(text);
  if (wc < 15) {
    issues.push({
      code: 'TOO_SHORT',
      message: 'Descripción de segmento demasiado breve.',
      severity: 'warning',
      hint: 'Incluye perfil demográfico, comportamiento y motivación del cliente.',
    });
    score -= 10;
  }

  const posMatches = countKeywordMatches(text, KW.positive);
  if (posMatches >= 3) {
    strengths.push({
      code: 'WELL_DEFINED_SEGMENT',
      message: 'El segmento está bien definido con atributos específicos (perfil, industria, comportamiento).',
    });
    score += 20;
  } else if (posMatches === 0) {
    issues.push({
      code: 'VAGUE_SEGMENT',
      message: 'El segmento de clientes es impreciso.',
      severity: 'warning',
      hint: 'Define edad, profesión, tipo de empresa o comportamiento específico del cliente.',
    });
    score -= 15;
  }

  if (hasAnyKeyword(text, KW.generic)) {
    issues.push({
      code: 'SEGMENT_TOO_BROAD',
      message: 'El segmento parece demasiado amplio ("todos", "todo el mundo", "personas en general").',
      severity: 'critical',
      hint: 'Un segmento mal definido lleva a un CAC altísimo y mensajes que no conectan. Elige un nicho.',
    });
    score -= 20;
  }

  if (hasAnyKeyword(text, ['early adopter', 'adopter', 'primer cliente', 'pionero', 'nicho'])) {
    strengths.push({
      code: 'EARLY_ADOPTER_DEFINED',
      message: 'Identifica el perfil de early adopter, clave para validar el modelo con menos recursos.',
    });
    score += 10;
  } else {
    issues.push({
      code: 'NO_EARLY_ADOPTER',
      message: 'No se menciona el perfil de early adopter.',
      severity: 'info',
      hint: '¿Quién pagaría por tu solución hoy mismo, aunque no sea perfecta?',
    });
  }

  return { issues, strengths, score: Math.max(0, Math.min(100, score)) };
}
