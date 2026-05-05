// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · dictionaries/keywords.ts
// ============================================================
// Keyword lists drive the content-quality signal for each block.
// They are accent-normalised at match time (see utils/text.ts).
//
// Block-level `generic` arrays use terms specific to each block's
// context. Cross-cutting vague/generic patterns live in vagueTerms.ts.

import type { BlockId } from '../types';

export interface BlockKeywords {
  /** Words whose presence signals good, relevant content */
  positive: string[];
  /** Words that suggest the block may be misunderstood or too generic */
  generic: string[];
  /**
   * Terms that signal quantified, actionable, concrete content
   * (e.g. specific channel names, metric acronyms, role titles, units).
   * Used by computeSpecificityScore to reward precision.
   */
  concrete: string[];
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
    concrete: [
      'hora', 'horas', 'minuto', 'día', 'dia', 'semana', 'mes',
      '%', 'euros', '€', '$', 'veces', 'coste', 'empleado', 'empresa',
      'promedio', 'al mes', 'a la semana', 'por usuario',
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
    concrete: [
      'pyme', 'startup', 'b2b', 'b2c', 'autónomo', 'freelance',
      'profesional', 'director', 'gerente', 'cto', 'ceo', 'sector',
      'industria', 'empleados', 'años', 'facturación',
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
    concrete: [
      '%', 'veces', 'horas', 'minutos', 'euros', '€', '$',
      'automáticamente', 'automaticamente', 'sin fricción', 'sin friccion',
      'más rápido', 'mas rapido', 'reducción', 'reduccion', 'ahorro de',
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
    concrete: [
      'api', 'dashboard', 'algoritmo', 'módulo', 'modulo',
      'automatización', 'automatizacion', 'integración', 'integracion',
      'notificación', 'notificacion', 'informe', 'reporte', 'panel',
      'flujo de trabajo', 'sincronización', 'sincronizacion',
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
    concrete: [
      'seo', 'sem', 'google ads', 'facebook ads', 'linkedin', 'twitter',
      'instagram', 'youtube', 'email marketing', 'newsletter', 'appstore',
      'play store', 'blog', 'webinar', 'outreach', 'cold email',
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
    concrete: [
      '€', '$', '%', 'precio', 'ticket medio', 'mensual', 'anual',
      'por usuario', 'por empresa', 'tarifa', 'plan', 'tier',
      'freemium', 'mrr', 'arpu', '/mes', '/año', '/ano',
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
    concrete: [
      '€', '$', 'salario', 'servidor', 'cloud', 'aws', 'gcp', 'azure',
      'hosting', 'burn rate', 'runway', 'mensual', '/mes', 'infraestructura',
      'contratación', 'contratacion',
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
    concrete: [
      'cac', 'ltv', 'mrr', 'arr', 'churn', 'nps', 'dau', 'mau',
      '%', 'conversion', 'retención', 'retencion', 'activación', 'activacion',
      'objetivo', 'target', 'tasa de',
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
    concrete: [
      'patente', 'propiedad intelectual', 'exclusivo', 'contrato exclusivo',
      'datos únicos', 'datos unicos', 'comunidad', 'algoritmo',
      'regulación', 'regulacion', 'barrera', 'red de contactos', 'moat',
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
