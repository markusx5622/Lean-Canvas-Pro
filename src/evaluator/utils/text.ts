// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · utils/text.ts
// ============================================================

/** Normalise to lowercase, remove accents, collapse whitespace. */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Count words in a string (splits on any whitespace). */
export function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Count meaningful sentences (splits on . ! ?). */
export function sentenceCount(text: string): number {
  const parts = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return parts.length;
}

/**
 * Return how many of the provided keyword strings appear in `text`.
 * Matching is accent-insensitive and case-insensitive.
 */
export function countKeywordMatches(text: string, keywords: string[]): number {
  const norm = normalise(text);
  return keywords.filter(kw => norm.includes(normalise(kw))).length;
}

/**
 * Check whether `text` contains **at least one** of the given keywords.
 */
export function hasAnyKeyword(text: string, keywords: string[]): boolean {
  return countKeywordMatches(text, keywords) > 0;
}

/**
 * Clamp a number to [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation: map `value` from [inMin, inMax] to [outMin, outMax].
 * Result is clamped to [outMin, outMax].
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) return outMin;
  const ratio = (value - inMin) / (inMax - inMin);
  return clamp(outMin + ratio * (outMax - outMin), outMin, outMax);
}

/**
 * Check whether the text looks like a simple copy-paste of the placeholder
 * (very generic, one-word, or single-character content).
 */
export function looksLikePlaceholder(text: string): boolean {
  const wc = wordCount(text);
  return wc <= 1;
}

/**
 * Detect whether numbers appear in the text (e.g. prices, percentages).
 * Useful for Flujo de Ingresos / Métricas blocks.
 */
export function containsNumbers(text: string): boolean {
  return /\d/.test(text);
}

/**
 * Detect whether the text contains a concrete, quantified value:
 * a number paired with a meaningful unit (currency, %, time period,
 * or count of real-world entities).
 *
 * Examples that match: "3 horas", "50 €", "20%", "500 usuarios",
 *                      "$99/mes", "2 000 €/año", "3k €"
 */
export function containsConcreteQuantity(text: string): boolean {
  // Currency symbols or codes (with optional thousands separator)
  const hasCurrency = /\d[\d.,\s]*(€|\$|£|eur|usd|gbp|k€|m€)/i.test(text);
  // Percentage values
  const hasPct = /\d[\d.,]*\s*%/.test(text);
  // Time-denominated quantities
  const hasTime = /\d+\s*(hora|horas|día|días|semana|semanas|mes|meses|año|años)s?\b/i.test(text);
  // Counts of real-world entities
  const hasCount = /\d+\s*(usuario|usuarios|cliente|clientes|empresa|empresas|persona|personas|empleado|empleados)\b/i.test(text);
  // Rate notation: e.g. "99€/mes", "$49/year"
  const hasRate = /\d[\d.,]*\s*(€|\$|£)?\s*\/\s*(mes|año|semana|dia|day|month|year)/i.test(text);

  return hasCurrency || hasPct || hasTime || hasCount || hasRate;
}

/**
 * Detect typical list formatting (bullet points, numbered lists, line breaks
 * with text). Useful to reward structured content.
 */
export function looksStructured(text: string): boolean {
  return /(\n|•|^\s*-\s+|^\s*\d+\.\s+)/m.test(text);
}
