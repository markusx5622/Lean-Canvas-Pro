// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · rules/canales.ts
// Block 5 – Canales
// ============================================================
import type { Issue, Strength } from '../types';
import {
  wordCount, hasAnyKeyword, countKeywordMatches, looksLikePlaceholder,
} from '../utils/text';
import { BLOCK_KEYWORDS } from '../dictionaries/keywords';

const KW = BLOCK_KEYWORDS[5];

export function evaluateCanales(text: string): { issues: Issue[]; strengths: Strength[]; score: number } {
  const issues: Issue[] = [];
  const strengths: Strength[] = [];
  let score = 50;

  if (looksLikePlaceholder(text)) {
    return {
      issues: [{
        code: 'PLACEHOLDER',
        message: 'Los canales de distribución no están definidos.',
        severity: 'critical',
        hint: 'Describe cómo vas a captar y llegar a tus primeros clientes.',
      }],
      strengths: [],
      score: 5,
    };
  }

  const wc = wordCount(text);
  if (wc < 10) {
    issues.push({
      code: 'TOO_SHORT',
      message: 'Estrategia de canales demasiado breve.',
      severity: 'warning',
      hint: 'Describe al menos 2 canales específicos con el razonamiento detrás.',
    });
    score -= 10;
  }

  const posMatches = countKeywordMatches(text, KW.positive);
  if (posMatches >= 3) {
    strengths.push({
      code: 'MULTI_CHANNEL',
      message: 'Estrategia multicanal bien definida que reduce la dependencia de una sola fuente de tráfico.',
    });
    score += 20;
  } else if (posMatches === 0) {
    issues.push({
      code: 'VAGUE_CHANNELS',
      message: 'Los canales son demasiado genéricos.',
      severity: 'warning',
      hint: 'Especifica: ¿SEO orgánico? ¿Campañas de pago? ¿Partnerships? ¿Comunidades?',
    });
    score -= 15;
  }

  if (hasAnyKeyword(text, KW.generic) && posMatches < 2) {
    issues.push({
      code: 'GENERIC_CHANNELS',
      message: '"Marketing" o "redes sociales" sin más detalle no constituye una estrategia de canales.',
      severity: 'warning',
      hint: 'Concreta: ¿qué red social? ¿qué tipo de contenido? ¿cuál es el embudo?',
    });
    score -= 10;
  }

  if (hasAnyKeyword(text, ['orgánico', 'seo', 'inbound', 'referral', 'boca a boca', 'comunidad'])) {
    strengths.push({
      code: 'ORGANIC_GROWTH',
      message: 'Contempla canales orgánicos o de referral, que tienen un CAC estructuralmente más bajo.',
    });
    score += 10;
  }

  return { issues, strengths, score: Math.max(0, Math.min(100, score)) };
}
