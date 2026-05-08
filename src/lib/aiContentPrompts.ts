import type { CanvasContext } from './assistantService';
import {
  generateExecutiveSummary,
  generateElevatorPitch,
  generateLandingPageText,
} from './localStrategicTools';

export type AiContentType = 'executiveSummary' | 'elevatorPitch' | 'landingPageText';

export interface ContentAction {
  type: AiContentType;
  title: string;
  subtitle: string;
  copyLabel: string;
  /** Generates content deterministically from canvas data. No external API used. */
  generate: (ctx: CanvasContext) => string;
}

export const CONTENT_ACTIONS: ContentAction[] = [
  {
    type: 'executiveSummary',
    title: 'Resumen ejecutivo',
    subtitle: 'Síntesis estratégica clara para presentar el proyecto rápidamente.',
    copyLabel: 'Copiar resumen',
    generate: generateExecutiveSummary,
  },
  {
    type: 'elevatorPitch',
    title: 'Elevator pitch',
    subtitle: 'Pitch corto y convincente listo para usar en conversaciones clave.',
    copyLabel: 'Copiar pitch',
    generate: generateElevatorPitch,
  },
  {
    type: 'landingPageText',
    title: 'Texto para landing page',
    subtitle: 'Texto comercial orientado a conversión para la página principal.',
    copyLabel: 'Copiar texto',
    generate: generateLandingPageText,
  },
];

/** @deprecated Use CONTENT_ACTIONS instead. Kept for backwards compatibility. */
export const AI_CONTENT_ACTIONS = CONTENT_ACTIONS;

