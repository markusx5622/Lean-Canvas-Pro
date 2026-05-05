// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · dictionaries/keywords.ts
// ============================================================
// Keyword lists drive the content-quality signal for each block.
// They are accent-normalised at match time (see utils/text.ts).

import type { BlockId } from '../types';

export interface BlockKeywords {
  /** Words whose presence signals good, relevant content */
  positive: string[];
  /** Words that suggest the block may be misunderstood or too generic */
  generic: string[];
}

export const BLOCK_KEYWORDS: Record<BlockId, BlockKeywords> = {
  // 1 – Problema
  1: {
    positive: [
      'problema', 'dolor', 'necesidad', 'frustración', 'ineficiencia',
      'dificultad', 'coste', 'tiempo', 'fallo', 'brecha', 'riesgo',
      'alternativas', 'workaround', 'manual', 'proceso', 'tedioso',
    ],
    generic: [
      'algo', 'cosas', 'etc', 'varios', 'muchos', 'general',
    ],
  },

  // 2 – Segmentos de Clientes
  2: {
    positive: [
      'cliente', 'usuario', 'segmento', 'empresa', 'pyme', 'startup',
      'edad', 'perfil', 'nicho', 'b2b', 'b2c', 'demográfico',
      'early adopter', 'adopter', 'persona', 'mercado objetivo',
      'profesional', 'freelance', 'autónomo', 'corporativo',
    ],
    generic: [
      'todos', 'cualquiera', 'todo el mundo', 'gente', 'personas en general',
    ],
  },

  // 3 – Propuesta de Valor Única
  3: {
    positive: [
      'único', 'diferente', 'mejor', 'valor', 'beneficio', 'ventaja',
      'rápido', 'fácil', 'ahorro', 'resultado', 'transformación',
      'solución', 'sencillo', 'eficiente', 'automatiza', 'simplifica',
    ],
    generic: [
      'plataforma', 'herramienta', 'aplicación', 'servicio', 'producto',
      'bueno', 'mejorar', 'innovador',
    ],
  },

  // 4 – Solución
  4: {
    positive: [
      'funcionalidad', 'característica', 'feature', 'mvp', 'módulo',
      'automatización', 'integración', 'api', 'dashboard', 'notificación',
      'algoritmo', 'flujo', 'proceso', 'paso', 'acción',
    ],
    generic: [
      'plataforma', 'app', 'software', 'sistema', 'herramienta',
    ],
  },

  // 5 – Canales
  5: {
    positive: [
      'seo', 'sem', 'redes sociales', 'email', 'contenido', 'blog',
      'partnership', 'canal', 'distribuidor', 'evento', 'comunidad',
      'referral', 'boca a boca', 'influencer', 'publicidad', 'outbound',
      'inbound', 'landing', 'webinar', 'appstore', 'tienda',
    ],
    generic: [
      'marketing', 'redes', 'internet', 'online',
    ],
  },

  // 6 – Flujo de Ingresos
  6: {
    positive: [
      'suscripción', 'freemium', 'transacción', 'comisión', 'licencia',
      'saas', 'pago', 'tarifa', 'precio', 'mensual', 'anual',
      'modelo', 'margen', 'revenue', 'ltv', 'arpu',
    ],
    generic: [
      'cobrar', 'dinero', 'ganar', 'ventas',
    ],
  },

  // 7 – Estructura de Costes
  7: {
    positive: [
      'salario', 'infraestructura', 'servidor', 'cloud', 'hosting',
      'marketing', 'cac', 'operativo', 'fijo', 'variable', 'burn rate',
      'renta', 'legal', 'soporte', 'licencia', 'herramienta', 'suscripción',
    ],
    generic: [
      'costes', 'gastos', 'dinero', 'presupuesto',
    ],
  },

  // 8 – Métricas Clave
  8: {
    positive: [
      'kpi', 'métrica', 'retention', 'retención', 'churn', 'cac', 'ltv',
      'mrr', 'arr', 'nps', 'dau', 'mau', 'conversion', 'tasa',
      'activación', 'adquisición', 'ingreso', 'crecimiento', 'objetivo',
    ],
    generic: [
      'ventas', 'clientes', 'usuarios', 'satisfacción',
    ],
  },

  // 9 – Ventaja Injusta
  9: {
    positive: [
      'patente', 'propiedad intelectual', 'exclusivo', 'comunidad',
      'dato', 'red', 'marca', 'reputación', 'acceso', 'talento',
      'tecnología propia', 'algoritmo', 'regulación', 'barrera',
      'foso', 'moat', 'contrato', 'partnership exclusivo',
    ],
    generic: [
      'experiencia', 'conocimiento', 'pasión', 'dedicación', 'equipo',
    ],
  },
};

/** Human-readable name for each block (matches UI labels). */
export const BLOCK_NAMES: Record<BlockId, string> = {
  1: 'Problema',
  2: 'Segmentos',
  3: 'Propuesta Única',
  4: 'Solución',
  5: 'Canales',
  6: 'Flujo de Ingresos',
  7: 'Costes',
  8: 'Métricas Clave',
  9: 'Ventaja Injusta',
};
