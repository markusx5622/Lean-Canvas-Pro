import { describe, expect, it } from 'vitest';
import { CONTENT_ACTIONS, AI_CONTENT_ACTIONS } from './aiContentPrompts';
import type { CanvasContext } from './assistantService';

const MOCK_CONTEXT: CanvasContext = {
  name: 'Test Canvas',
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

describe('CONTENT_ACTIONS', () => {
  it('includes the required content generation actions', () => {
    const titles = CONTENT_ACTIONS.map((action) => action.title);
    expect(titles).toContain('Resumen ejecutivo');
    expect(titles).toContain('Elevator pitch');
    expect(titles).toContain('Texto para landing page');
  });

  it('has a generate function for every action', () => {
    for (const action of CONTENT_ACTIONS) {
      expect(typeof action.generate).toBe('function');
    }
  });

  it('generates non-empty content for each action', () => {
    for (const action of CONTENT_ACTIONS) {
      const result = action.generate(MOCK_CONTEXT);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(20);
    }
  });

  it('includes canvas name in generated executive summary', () => {
    const summary = CONTENT_ACTIONS.find((a) => a.type === 'executiveSummary')!;
    const result = summary.generate(MOCK_CONTEXT);
    expect(result).toContain('Test Canvas');
  });

  it('generates different content for each action type', () => {
    const results = CONTENT_ACTIONS.map((a) => a.generate(MOCK_CONTEXT));
    const unique = new Set(results);
    expect(unique.size).toBe(CONTENT_ACTIONS.length);
  });
});

describe('AI_CONTENT_ACTIONS (backwards compat alias)', () => {
  it('is the same as CONTENT_ACTIONS', () => {
    expect(AI_CONTENT_ACTIONS).toBe(CONTENT_ACTIONS);
  });
});

