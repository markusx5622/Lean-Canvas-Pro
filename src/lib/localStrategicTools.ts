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
    lines.push(`${ctx.name} es una solución que ${trunc(solution, 160)}. Su propuesta única de valor: ${trunc(uvp, 160)}.`);
  } else if (solution) {
    lines.push(`${ctx.name} es una solución que ${trunc(solution, 180)}.`);
  } else if (uvp) {
    lines.push(`${ctx.name}: ${trunc(uvp, 200)}.`);
  } else {
    lines.push(`${ctx.name} es un proyecto en fase de definición.`);
  }

  // Problem
  if (problem) {
    lines.push(`Problema que aborda: ${trunc(problem, 200)}.`);
  }

  // Target segment
  if (segments) {
    lines.push(`Dirigido a: ${trunc(segments, 160)}.`);
  }

  // Revenue model
  if (revenue) {
    lines.push(`Modelo de ingresos: ${trunc(revenue, 160)}.`);
  }

  // Channels
  if (channels) {
    lines.push(`Canales de distribución: ${trunc(channels, 140)}.`);
  }

  // Unfair advantage
  if (unfair) {
    lines.push(`Ventaja diferencial: ${trunc(unfair, 160)}.`);
  }

  if (lines.length === 1) {
    lines.push('Completa los bloques del canvas para enriquecer este resumen.');
  }

  return lines.join('\n\n');
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

  // ── Paragraph 1: hook + solution ─────────────────────────────────────────────
  const hookPart: string[] = [];

  // Opening hook
  if (problem && segments) {
    hookPart.push(`¿Conoces el problema de ${trunc(segments, 80)} cuando ${trunc(problem, 100)}?`);
  } else if (problem) {
    hookPart.push(`Muchas personas se enfrentan hoy a: ${trunc(problem, 120)}.`);
  }

  // Solution + value prop
  if (solution && uvp) {
    hookPart.push(`${ctx.name} es ${trunc(solution, 120)}, con una propuesta única: ${trunc(uvp, 120)}.`);
  } else if (solution) {
    hookPart.push(`${ctx.name} resuelve esto mediante ${trunc(solution, 150)}.`);
  } else if (uvp) {
    hookPart.push(`${ctx.name} ofrece: ${trunc(uvp, 160)}.`);
  } else {
    hookPart.push(`${ctx.name} es la solución a este problema.`);
  }

  // ── Paragraph 2: business context ────────────────────────────────────────────
  const businessPart: string[] = [];

  // Target segment
  if (segments) {
    businessPart.push(`Nuestro cliente objetivo: ${trunc(segments, 120)}.`);
  }

  // Revenue
  if (revenue) {
    businessPart.push(`Monetizamos mediante ${trunc(revenue, 120)}.`);
  }

  // Unfair advantage
  if (unfair) {
    businessPart.push(`Lo que nos diferencia y hace difícil de copiar: ${trunc(unfair, 120)}.`);
  }

  if (hookPart.length + businessPart.length < 3) {
    businessPart.push('Rellena los bloques de Problema, Solución, Propuesta Única y Segmentos para obtener un pitch más completo.');
  }

  const parts: string[] = [];
  if (hookPart.length > 0) parts.push(hookPart.join(' '));
  if (businessPart.length > 0) parts.push(businessPart.join(' '));
  return parts.join('\n\n');
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
    ? trunc(uvp, 110)
    : solution
    ? trunc(solution, 110)
    : ctx.name;
  sections.push(`# ${headline}`);

  // Subheadline
  if (solution && uvp) {
    sections.push(`## ${trunc(solution, 130)}`);
  } else if (problem) {
    sections.push(`## La solución definitiva para: ${trunc(problem, 110)}`);
  }

  // Benefits section
  const benefits: string[] = [];
  if (problem) benefits.push(`✔ Resuelve: ${trunc(problem, 110)}`);
  if (unfair) benefits.push(`✔ ${trunc(unfair, 110)}`);
  if (solution) benefits.push(`✔ ${trunc(solution, 110)}`);
  if (benefits.length === 0) benefits.push('✔ Solución pensada para ti');

  sections.push('### ¿Por qué ' + ctx.name + '?');
  sections.push(benefits.join('\n'));

  // Target audience
  if (segments) {
    sections.push('### ¿Para quién?');
    sections.push(trunc(segments, 250));
  }

  // How it works
  if (solution) {
    sections.push('### Cómo funciona');
    sections.push(trunc(solution, 250));
  }

  // Pricing / revenue hint
  if (revenue) {
    sections.push('### Planes y precios');
    sections.push(trunc(revenue, 200));
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

// ── Readiness Report ──────────────────────────────────────────────────────────

export type ReadinessStatus = 'listo' | 'refinamiento' | 'inicial';

export interface ReadinessRecommendation {
  priority: 'alta' | 'media' | 'baja';
  text: string;
}

export interface ReadinessReport {
  status: ReadinessStatus;
  completenessScore: number;
  clarityScore: number;
  overallScore: number;
  reasons: string[];
  nextSteps: string[];
  recommendations: ReadinessRecommendation[];
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

// ── Readiness Report Generator ────────────────────────────────────────────────

// ── Readiness scoring constants ───────────────────────────────────────────────

const CRITICAL_CLARITY_PENALTY = 25;
const WARNING_CLARITY_PENALTY = 10;
const TIP_CLARITY_PENALTY = 3;

const COMPLETENESS_WEIGHT = 0.4;
const CLARITY_WEIGHT = 0.6;

const READY_SCORE_THRESHOLD = 75;
const READY_FILLED_THRESHOLD = 7;
const REFINEMENT_SCORE_THRESHOLD = 40;
const REFINEMENT_FILLED_THRESHOLD = 4;

const MAX_CRITICAL_REASONS = 3;
const MAX_WARNING_REASONS = 2;

/**
 * Evaluates whether the canvas is ready to be shared or presented.
 * Returns a structured readiness report with scores, status, reasons, and
 * prioritised recommendations. All logic is deterministic and fully local.
 */
export function generateReadinessReport(ctx: CanvasContext): ReadinessReport {
  const checks = runStrategicChecks(ctx);

  // ── Completeness score (0–100) ─────────────────────────────────────────────
  const completenessScore = Math.round((ctx.filledCount / ctx.totalBlocks) * 100);

  // ── Clarity score (0–100) ──────────────────────────────────────────────────
  // Penalise critical and warning checks; tips have minimal impact.
  const criticalCount = checks.filter((c) => c.severity === 'critical').length;
  const warningCount = checks.filter((c) => c.severity === 'warning').length;
  const tipCount = checks.filter((c) => c.severity === 'tip').length;
  const clarityScore = Math.max(
    0,
    100
      - criticalCount * CRITICAL_CLARITY_PENALTY
      - warningCount * WARNING_CLARITY_PENALTY
      - tipCount * TIP_CLARITY_PENALTY,
  );

  // ── Overall score ──────────────────────────────────────────────────────────
  const overallScore = Math.round(
    completenessScore * COMPLETENESS_WEIGHT + clarityScore * CLARITY_WEIGHT,
  );

  // ── Status ─────────────────────────────────────────────────────────────────
  let status: ReadinessStatus;
  if (overallScore >= READY_SCORE_THRESHOLD && criticalCount === 0 && ctx.filledCount >= READY_FILLED_THRESHOLD) {
    status = 'listo';
  } else if (overallScore >= REFINEMENT_SCORE_THRESHOLD || ctx.filledCount >= REFINEMENT_FILLED_THRESHOLD) {
    status = 'refinamiento';
  } else {
    status = 'inicial';
  }

  // ── Reasons ────────────────────────────────────────────────────────────────
  const reasons: string[] = [];
  if (ctx.filledCount < ctx.totalBlocks) {
    reasons.push(`${ctx.filledCount} de ${ctx.totalBlocks} bloques completados (${completenessScore}%).`);
  }
  for (const c of checks.filter((c) => c.severity === 'critical').slice(0, MAX_CRITICAL_REASONS)) {
    reasons.push(c.title);
  }
  for (const c of checks.filter((c) => c.severity === 'warning').slice(0, MAX_WARNING_REASONS)) {
    reasons.push(c.title);
  }
  if (reasons.length === 0) {
    reasons.push('El canvas está completo y sin problemas detectados.');
  }

  // ── Next steps ─────────────────────────────────────────────────────────────
  const NEXT_STEP_MAP: Record<string, string> = {
    Problema: 'Describe el problema real que estás resolviendo y su impacto en el cliente.',
    Solución: 'Define qué construyes exactamente para resolver el problema.',
    'Propuesta Única': 'Articula tu propuesta única de valor con beneficios concretos y cuantificables.',
    Segmentos: 'Identifica un perfil de cliente ideal específico (no "todos").',
    'Flujo de Ingresos': 'Define tu modelo de monetización: precio, frecuencia y forma de cobro.',
    'Ventaja Injusta': 'Explica qué hace tu proyecto difícil de copiar: tecnología, datos, red, etc.',
    Canales: 'Especifica los canales de adquisición y distribución más relevantes para tu segmento.',
    'Métricas Clave': 'Elige 2–3 métricas accionables que midan el éxito real del negocio.',
  };

  const nextSteps: string[] = [];
  // Add next steps from critical blocks first
  for (const c of checks.filter((c) => c.severity === 'critical')) {
    const step = c.blockTitle ? NEXT_STEP_MAP[c.blockTitle] : null;
    if (step && !nextSteps.includes(step)) nextSteps.push(step);
  }
  // Then warnings
  for (const c of checks.filter((c) => c.severity === 'warning')) {
    const step = c.blockTitle ? NEXT_STEP_MAP[c.blockTitle] : null;
    if (step && !nextSteps.includes(step)) nextSteps.push(step);
  }
  if (nextSteps.length === 0 && status !== 'listo') {
    nextSteps.push('Revisa los bloques existentes para aumentar la especificidad y claridad.');
  }
  if (status === 'listo') {
    nextSteps.push('Comparte el canvas con tu equipo o inversores.');
    nextSteps.push('Usa "Generar contenido" para crear el resumen ejecutivo o el pitch.');
  }

  // ── Recommendations ────────────────────────────────────────────────────────
  const recommendations: ReadinessRecommendation[] = checks.map((c) => ({
    priority: c.severity === 'critical' ? 'alta' : c.severity === 'warning' ? 'media' : 'baja',
    text: c.description,
  }));

  return {
    status,
    completenessScore,
    clarityScore,
    overallScore,
    reasons,
    nextSteps,
    recommendations,
  };
}
