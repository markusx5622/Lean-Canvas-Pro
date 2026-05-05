// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · dictionaries/vagueTerms.ts
//
// Centralized, reusable registry of vague terms and generic
// expressions that weaken any Lean Canvas block.
//
// Design goals:
//   • Organised into named categories so callers can choose
//     which categories to apply per block context.
//   • Accent-insensitive at match time (utils/text.ts normalise()).
//   • Easy to extend: add terms to a category or add new
//     categories without touching rule files.
// ============================================================

// ── Category definitions ─────────────────────────────────────

/**
 * Hedge words that reduce commitment and precision.
 * e.g. "quizás lo usaría alguien"
 */
export const HEDGE_WORDS: string[] = [
  'quizás', 'quizas', 'tal vez', 'a lo mejor', 'puede que',
  'posiblemente', 'probablemente', 'no sé', 'no se',
  'depende', 'en cierta medida', 'de alguna forma',
];

/**
 * Filler words that add length without meaning.
 * e.g. "etc.", "varios", "cosas"
 */
export const FILLER_WORDS: string[] = [
  'etc', 'etcétera', 'etcetera', 'varios', 'varias',
  'muchos', 'muchas', 'algunos', 'algunas', 'cosas',
  'algo', 'ciertos', 'ciertas', 'demás',
];

/**
 * Overly broad or catch-all expressions that signal a lack
 * of focus or customer specificity.
 * e.g. "todo el mundo puede usarlo"
 */
export const BROAD_AUDIENCE_TERMS: string[] = [
  'todos', 'todo el mundo', 'cualquiera', 'cualquier persona',
  'cualquier empresa', 'el mercado en general',
  'personas en general', 'gente en general',
  'todo tipo de', 'todo tipo',
];

/**
 * Empty buzzwords often used as substitutes for real
 * differentiation or concrete functionality.
 * e.g. "solución innovadora disruptiva"
 */
export const EMPTY_BUZZWORDS: string[] = [
  'innovador', 'innovadora', 'disruptivo', 'disruptiva',
  'revolucionario', 'revolucionaria', 'de última generación',
  'estado del arte', 'best-in-class', 'world-class',
  'de clase mundial', 'de vanguardia', 'puntero', 'puntera',
  'cambio de paradigma', 'ecosistema', '360', 'holístico', 'holistico',
];

/**
 * Generic product/category nouns that describe *what* the
 * product is without explaining *how* or *why* it's different.
 * e.g. "plataforma", "herramienta", "app"
 */
export const GENERIC_PRODUCT_NOUNS: string[] = [
  'plataforma', 'herramienta', 'aplicación', 'aplicacion',
  'app', 'software', 'sistema', 'producto', 'servicio',
  'solución', 'solucion', 'tecnología', 'tecnologia',
];

/**
 * Motivation-only statements that are common as "Ventaja Injusta"
 * but describe attributes that any competitor can also claim.
 * e.g. "tenemos pasión por el producto"
 */
export const COPYABLE_ATTRIBUTES: string[] = [
  'pasión', 'pasion', 'dedicación', 'dedicacion',
  'compromiso', 'experiencia', 'conocimiento', 'equipo',
  'motivación', 'motivacion', 'entusiasmo', 'ganas',
];

// ── Convenience bundles ──────────────────────────────────────

/**
 * All vague term categories merged into one flat list.
 * Useful when you want to scan a block for any type of vagueness.
 */
export const ALL_VAGUE_TERMS: string[] = [
  ...HEDGE_WORDS,
  ...FILLER_WORDS,
  ...BROAD_AUDIENCE_TERMS,
  ...EMPTY_BUZZWORDS,
  ...GENERIC_PRODUCT_NOUNS,
  ...COPYABLE_ATTRIBUTES,
];

/**
 * Subset of terms most likely to indicate shallow content:
 * fillers + broad-audience terms.
 * Suitable for quick completeness checks.
 */
export const SHALLOW_CONTENT_TERMS: string[] = [
  ...FILLER_WORDS,
  ...BROAD_AUDIENCE_TERMS,
];
