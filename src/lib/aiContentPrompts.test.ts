import { describe, expect, it } from 'vitest';
import { AI_CONTENT_ACTIONS } from './aiContentPrompts';

describe('AI_CONTENT_ACTIONS', () => {
  it('includes the required content generation actions', () => {
    const titles = AI_CONTENT_ACTIONS.map((action) => action.title);
    expect(titles).toContain('Resumen ejecutivo');
    expect(titles).toContain('Elevator pitch');
    expect(titles).toContain('Texto para landing page');
  });

  it('defines a prompt for every action', () => {
    for (const action of AI_CONTENT_ACTIONS) {
      expect(action.prompt.length).toBeGreaterThan(50);
    }
  });
});

