import { describe, expect, it } from 'vitest';
import { generateReadinessReport, runStrategicChecks } from './localStrategicTools';
import type { CanvasContext } from './assistantService';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_CTX: CanvasContext = {
  name: 'Canvas vacío',
  blocks: [
    { id: 1, title: 'Problema', content: '' },
    { id: 2, title: 'Segmentos', content: '' },
    { id: 3, title: 'Propuesta Única', content: '' },
    { id: 4, title: 'Solución', content: '' },
    { id: 5, title: 'Canales', content: '' },
    { id: 6, title: 'Flujo de Ingresos', content: '' },
    { id: 7, title: 'Costes', content: '' },
    { id: 8, title: 'Métricas Clave', content: '' },
    { id: 9, title: 'Ventaja Injusta', content: '' },
  ],
  filledCount: 0,
  totalBlocks: 9,
};

const PARTIAL_CTX: CanvasContext = {
  name: 'Canvas parcial',
  blocks: [
    { id: 1, title: 'Problema', content: 'Falta de visibilidad de proyectos' },
    { id: 4, title: 'Solución', content: 'Plataforma de gestión visual' },
    { id: 3, title: 'Propuesta Única', content: 'Todo en un solo lugar' },
    { id: 2, title: 'Segmentos', content: 'Equipos de software' },
    { id: 6, title: 'Flujo de Ingresos', content: 'Suscripción mensual' },
    { id: 9, title: 'Ventaja Injusta', content: '' },
    { id: 8, title: 'Métricas Clave', content: '' },
    { id: 5, title: 'Canales', content: '' },
    { id: 7, title: 'Costes', content: '' },
  ],
  filledCount: 5,
  totalBlocks: 9,
};

const FULL_CTX: CanvasContext = {
  name: 'Canvas completo',
  blocks: [
    { id: 1, title: 'Problema', content: 'Gestión ineficiente del tiempo en equipos remotos' },
    { id: 2, title: 'Segmentos', content: 'Desarrolladores de software en empresas medianas' },
    { id: 3, title: 'Propuesta Única', content: 'Reduce el tiempo de gestión un 40% con IA integrada' },
    { id: 4, title: 'Solución', content: 'Tablero inteligente con automatización de tareas repetitivas' },
    { id: 5, title: 'Canales', content: 'SEO, Product Hunt, partnerships con tools de desarrollo' },
    { id: 6, title: 'Flujo de Ingresos', content: 'SaaS mensual: 29€/usuario/mes, plan enterprise disponible' },
    { id: 7, title: 'Costes', content: 'Infraestructura cloud, equipo de 4 ingenieros, marketing' },
    { id: 8, title: 'Métricas Clave', content: 'MRR, churn mensual, NPS, tiempo de onboarding' },
    { id: 9, title: 'Ventaja Injusta', content: 'Algoritmo propietario de priorización + datos exclusivos de uso' },
  ],
  filledCount: 9,
  totalBlocks: 9,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('generateReadinessReport', () => {
  it('returns a valid report structure for any canvas state', () => {
    for (const ctx of [EMPTY_CTX, PARTIAL_CTX, FULL_CTX]) {
      const report = generateReadinessReport(ctx);
      expect(report).toHaveProperty('status');
      expect(report).toHaveProperty('completenessScore');
      expect(report).toHaveProperty('clarityScore');
      expect(report).toHaveProperty('overallScore');
      expect(report).toHaveProperty('reasons');
      expect(report).toHaveProperty('nextSteps');
      expect(report).toHaveProperty('recommendations');
    }
  });

  it('returns "inicial" status for an empty canvas', () => {
    const report = generateReadinessReport(EMPTY_CTX);
    expect(report.status).toBe('inicial');
    expect(report.completenessScore).toBe(0);
  });

  it('returns "refinamiento" status for a partially filled canvas', () => {
    const report = generateReadinessReport(PARTIAL_CTX);
    expect(report.status).toBe('refinamiento');
    expect(report.completenessScore).toBeGreaterThan(0);
    expect(report.completenessScore).toBeLessThan(100);
  });

  it('returns "listo" status for a fully filled, high-quality canvas', () => {
    const report = generateReadinessReport(FULL_CTX);
    expect(report.status).toBe('listo');
    expect(report.completenessScore).toBe(100);
  });

  it('scores are in [0, 100] range', () => {
    for (const ctx of [EMPTY_CTX, PARTIAL_CTX, FULL_CTX]) {
      const r = generateReadinessReport(ctx);
      expect(r.completenessScore).toBeGreaterThanOrEqual(0);
      expect(r.completenessScore).toBeLessThanOrEqual(100);
      expect(r.clarityScore).toBeGreaterThanOrEqual(0);
      expect(r.clarityScore).toBeLessThanOrEqual(100);
      expect(r.overallScore).toBeGreaterThanOrEqual(0);
      expect(r.overallScore).toBeLessThanOrEqual(100);
    }
  });

  it('includes at least one reason', () => {
    const report = generateReadinessReport(PARTIAL_CTX);
    expect(report.reasons.length).toBeGreaterThan(0);
  });

  it('includes next steps when canvas is not complete', () => {
    const report = generateReadinessReport(PARTIAL_CTX);
    expect(report.nextSteps.length).toBeGreaterThan(0);
  });

  it('includes recommendations aligned with strategic checks', () => {
    const report = generateReadinessReport(PARTIAL_CTX);
    const checks = runStrategicChecks(PARTIAL_CTX);
    expect(report.recommendations.length).toBe(checks.length);
  });

  it('recommendation priorities are only alta, media, or baja', () => {
    const report = generateReadinessReport(PARTIAL_CTX);
    const validPriorities = new Set(['alta', 'media', 'baja']);
    for (const rec of report.recommendations) {
      expect(validPriorities.has(rec.priority)).toBe(true);
    }
  });

  it('does not throw for a canvas with 0 blocks', () => {
    const ctx: CanvasContext = { name: 'Empty', blocks: [], filledCount: 0, totalBlocks: 9 };
    expect(() => generateReadinessReport(ctx)).not.toThrow();
  });

  it('full canvas has next steps that suggest presenting or generating content', () => {
    const fullReport = generateReadinessReport(FULL_CTX);
    expect(fullReport.nextSteps.length).toBeGreaterThan(0);
    const combined = fullReport.nextSteps.join(' ');
    expect(combined.toLowerCase()).toMatch(/comparte|genera|contenido|resumen|pitch/i);
  });
});
