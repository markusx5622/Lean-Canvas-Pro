// ── Local Strategic Tools ─────────────────────────────────────────────────────
// Deterministic, fully local functions that generate strategic content and
// run heuristic analysis from canvas data.
// No external API calls, no AI providers — all logic runs in the browser.

import type { CanvasContext } from './assistantService';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the trimmed content for a block by title, or empty string. */
function block(ctx: CanvasContext, title: string): string {
  return ctx.blocks.find((b) => b.title === title)?.content.trim() ?? '';
}

/** Truncates text to maxChars, appending '…' if truncated. */
function trunc(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).trimEnd() + '…';
}

/** Returns true if text contains at least one numeric character. */
function hasNumbers(text: string): boolean {
  return /\d/.test(text);
}

// ── Content Generators ────────────────────────────────────────────────────────

/**
 * Generates an executive summary paragraph from canvas data using a
 * deterministic template. Missing blocks are omitted gracefully.
 */
export function generateExecutiveSummary(ctx: CanvasContext): string {
  const problem = block(ctx, 'Problema');
  const solution = block(ctx, 'Solución');
  const uvp = block(ctx, 'Propuesta Única');
  const segments = block(ctx, 'Segmentos');
  const revenue = block(ctx, 'Flujo de Ingresos');
  const unfair = block(ctx, 'Ventaja Injusta');
  const channels = block(ctx, 'Canales');

  const lines: string[] = [];

  // Opening line
  if (solution && uvp) {
    lines.push(`${ctx.name} es una solución que ${trunc(solution, 120)}. Su propuesta única de valor: ${trunc(uvp, 120)}.`);
  } else if (solution) {
    lines.push(`${ctx.name} es una solución que ${trunc(solution, 150)}.`);
  } else if (uvp) {
    lines.push(`${ctx.name}: ${trunc(uvp, 180)}.`);
  } else {
    lines.push(`${ctx.name} es un proyecto en fase de definición.`);
  }

  // Problem
  if (problem) {
    lines.push(`Problema que aborda: ${trunc(problem, 160)}.`);
  }

  // Target segment
  if (segments) {
    lines.push(`Dirigido a: ${trunc(segments, 120)}.`);
  }

  // Revenue model
  if (revenue) {
    lines.push(`Modelo de ingresos: ${trunc(revenue, 120)}.`);
  }

  // Channels
  if (channels) {
    lines.push(`Canales de distribución: ${trunc(channels, 100)}.`);
  }

  // Unfair advantage
  if (unfair) {
    lines.push(`Ventaja diferencial: ${trunc(unfair, 120)}.`);
  }

  if (lines.length === 1) {
    lines.push('Completa los bloques del canvas para enriquecer este resumen.');
  }

  return lines.join('\n');
}

/**
 * Generates a short elevator pitch (4–7 sentences) from canvas data.
 */
export function generateElevatorPitch(ctx: CanvasContext): string {
  const problem = block(ctx, 'Problema');
  const solution = block(ctx, 'Solución');
  const uvp = block(ctx, 'Propuesta Única');
  const segments = block(ctx, 'Segmentos');
  const revenue = block(ctx, 'Flujo de Ingresos');
  const unfair = block(ctx, 'Ventaja Injusta');

  const sentences: string[] = [];

  // Opening hook
  if (problem && segments) {
    sentences.push(`¿Conoces el problema de ${trunc(segments, 60)} cuando ${trunc(problem, 80)}?`);
  } else if (problem) {
    sentences.push(`Muchas personas se enfrentan hoy a: ${trunc(problem, 100)}.`);
  }

  // Solution + value prop
  if (solution && uvp) {
    sentences.push(`${ctx.name} es ${trunc(solution, 100)}, con una propuesta única: ${trunc(uvp, 100)}.`);
  } else if (solution) {
    sentences.push(`${ctx.name} resuelve esto mediante ${trunc(solution, 120)}.`);
  } else if (uvp) {
    sentences.push(`${ctx.name} ofrece: ${trunc(uvp, 140)}.`);
  } else {
    sentences.push(`${ctx.name} es la solución a este problema.`);
  }

  // Target segment
  if (segments) {
    sentences.push(`Nuestro cliente objetivo: ${trunc(segments, 100)}.`);
  }

  // Revenue
  if (revenue) {
    sentences.push(`Monetizamos mediante ${trunc(revenue, 100)}.`);
  }

  // Unfair advantage
  if (unfair) {
    sentences.push(`Lo que nos diferencia y hace difícil de copiar: ${trunc(unfair, 100)}.`);
  }

  if (sentences.length < 3) {
    sentences.push('Rellena los bloques de Problema, Solución, Propuesta Única y Segmentos para obtener un pitch más completo.');
  }

  return sentences.join(' ');
}

/**
 * Generates structured landing page copy from canvas data.
 */
export function generateLandingPageText(ctx: CanvasContext): string {
  const problem = block(ctx, 'Problema');
  const solution = block(ctx, 'Solución');
  const uvp = block(ctx, 'Propuesta Única');
  const segments = block(ctx, 'Segmentos');
  const revenue = block(ctx, 'Flujo de Ingresos');
  const unfair = block(ctx, 'Ventaja Injusta');

  const sections: string[] = [];

  // Headline
  const headline = uvp
    ? trunc(uvp, 80)
    : solution
    ? trunc(solution, 80)
    : ctx.name;
  sections.push(`# ${headline}`);

  // Subheadline
  if (solution && uvp) {
    sections.push(`## ${trunc(solution, 100)}`);
  } else if (problem) {
    sections.push(`## La solución definitiva para: ${trunc(problem, 80)}`);
  }

  // Benefits section
  const benefits: string[] = [];
  if (problem) benefits.push(`✔ Resuelve: ${trunc(problem, 80)}`);
  if (unfair) benefits.push(`✔ ${trunc(unfair, 80)}`);
  if (solution) benefits.push(`✔ ${trunc(solution, 80)}`);
  if (benefits.length === 0) benefits.push('✔ Solución pensada para ti');

  sections.push('### ¿Por qué ' + ctx.name + '?');
  sections.push(benefits.join('\n'));

  // Target audience
  if (segments) {
    sections.push('### ¿Para quién?');
    sections.push(trunc(segments, 200));
  }

  // How it works
  if (solution) {
    sections.push('### Cómo funciona');
    sections.push(trunc(solution, 200));
  }

  // Pricing / revenue hint
  if (revenue) {
    sections.push('### Planes y precios');
    sections.push(trunc(revenue, 150));
  }

  // CTA
  sections.push('### Empieza hoy');
  sections.push(`Únete a los primeros usuarios de ${ctx.name} y transforma la forma en que resuelves este problema.`);
  sections.push('[Comenzar gratis →]');

  if (sections.length < 5) {
    sections.push('\n_Completa más bloques del canvas para enriquecer el copy de la landing._');
  }

  return sections.join('\n\n');
}

// ── Strategic Checks ──────────────────────────────────────────────────────────

export type CheckSeverity = 'critical' | 'warning' | 'tip';

export interface StrategicCheck {
  severity: CheckSeverity;
  title: string;
  description: string;
  blockTitle?: string;
}

/** Generic terms that flag a potentially vague UVP. */
const GENERIC_UVP_TERMS = [
  'mejor', 'bueno', 'rápido', 'fácil', 'innovador',
  'revolucionario', 'único', 'simple', 'inteligente',
];

/**
 * Runs a set of heuristic checks on canvas data and returns a prioritised list
 * of strategic issues and tips. All logic is deterministic and fully local.
 */
export function runStrategicChecks(ctx: CanvasContext): StrategicCheck[] {
  const checks: StrategicCheck[] = [];

  const get = (title: string) => block(ctx, title);
  const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

  // ── Critical: missing core blocks ─────────────────────────────────────────
  const criticalBlocks = [
    { title: 'Problema', hint: 'Sin un problema real y definido no hay negocio que validar.' },
    { title: 'Solución', hint: 'Define qué construyes para resolver el problema.' },
    { title: 'Propuesta Única', hint: 'Diferénciate claramente de las alternativas existentes.' },
    { title: 'Segmentos', hint: 'Especifica a quién va dirigido tu producto o servicio.' },
  ];
  for (const { title, hint } of criticalBlocks) {
    if (!get(title)) {
      checks.push({
        severity: 'critical',
        title: `Bloque "${title}" vacío`,
        description: hint,
        blockTitle: title,
      });
    }
  }

  // ── Warning: UVP quality ───────────────────────────────────────────────────
  const uvp = get('Propuesta Única');
  if (uvp) {
    if (wordCount(uvp) < 5) {
      checks.push({
        severity: 'warning',
        title: 'Propuesta Única muy breve',
        description:
          'Tu propuesta única de valor tiene menos de 5 palabras. Amplíala para comunicar el beneficio real que ofreces.',
        blockTitle: 'Propuesta Única',
      });
    } else if (
      GENERIC_UVP_TERMS.some((term) => uvp.toLowerCase().includes(term)) &&
      !hasNumbers(uvp)
    ) {
      checks.push({
        severity: 'warning',
        title: 'Propuesta Única posiblemente genérica',
        description:
          'Tu UVP usa términos comunes sin cifras concretas (ej. %, tiempo ahorrado, €). Cuantificar el beneficio la hace más convincente.',
        blockTitle: 'Propuesta Única',
      });
    }
  }

  // ── Warning: missing revenue model ────────────────────────────────────────
  if (!get('Flujo de Ingresos')) {
    checks.push({
      severity: 'warning',
      title: 'Modelo de ingresos no definido',
      description:
        'Define cómo monetizarás tu solución. Sin un modelo de ingresos claro, el proyecto no es sostenible.',
      blockTitle: 'Flujo de Ingresos',
    });
  }

  // ── Warning: missing unfair advantage ─────────────────────────────────────
  if (!get('Ventaja Injusta')) {
    checks.push({
      severity: 'warning',
      title: 'Ventaja injusta no definida',
      description:
        'Define qué hace que tu proyecto sea difícil de copiar o replicar. Puede ser tecnología propia, datos exclusivos, red de usuarios, etc.',
      blockTitle: 'Ventaja Injusta',
    });
  }

  // ── Tip: missing channels ──────────────────────────────────────────────────
  if (!get('Canales')) {
    checks.push({
      severity: 'tip',
      title: 'Canales de distribución no definidos',
      description:
        'Define cómo llegarás a tus clientes: marketing de contenidos, SEO, partnerships, ventas directas, etc.',
      blockTitle: 'Canales',
    });
  }

  // ── Tip: missing key metrics ───────────────────────────────────────────────
  if (!get('Métricas Clave')) {
    checks.push({
      severity: 'tip',
      title: 'Métricas clave no definidas',
      description:
        'Define qué indicadores usarás para medir el éxito: CAC, LTV, MRR, retención, NPS, etc.',
      blockTitle: 'Métricas Clave',
    });
  }

  // ── Tip: canvas very sparse ────────────────────────────────────────────────
  if (ctx.filledCount < 4 && checks.length < 6) {
    checks.push({
      severity: 'tip',
      title: 'Canvas con poco contenido',
      description:
        `Tienes ${ctx.filledCount} de ${ctx.totalBlocks} bloques completados. Rellena al menos 6 bloques para obtener análisis más precisos y contenido generado de mayor calidad.`,
    });
  }

  return checks;
}
