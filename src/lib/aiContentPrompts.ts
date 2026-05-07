export type AiContentType = 'executiveSummary' | 'elevatorPitch' | 'landingPageText';

export interface AiContentAction {
  type: AiContentType;
  title: string;
  subtitle: string;
  copyLabel: string;
  prompt: string;
}

export const AI_CONTENT_ACTIONS: AiContentAction[] = [
  {
    type: 'executiveSummary',
    title: 'Resumen ejecutivo',
    subtitle: 'Síntesis estratégica clara para presentar el proyecto rápidamente.',
    copyLabel: 'Copiar resumen',
    prompt:
      'Genera un resumen ejecutivo breve y profesional de este Lean Canvas en español. ' +
      'El texto debe tener entre 5 y 8 líneas y sintetizar: el problema que se resuelve, ' +
      'la solución propuesta, la propuesta de valor, el segmento de clientes objetivo, ' +
      'el modelo de ingresos o monetización, y —si hay información disponible— la ventaja ' +
      'diferencial o competitiva. Si algún bloque está vacío, omite esa parte con naturalidad ' +
      'sin inventar datos. Redacta como un párrafo ejecutivo corrido, claro y sin listas ni subtítulos.',
  },
  {
    type: 'elevatorPitch',
    title: 'Elevator pitch',
    subtitle: 'Pitch corto, convincente y listo para usar en conversaciones clave.',
    copyLabel: 'Copiar pitch',
    prompt:
      'Genera un elevator pitch en español para este Lean Canvas. Debe ser claro, persuasivo y breve ' +
      '(entre 4 y 7 frases), incluyendo: problema principal, solución, propuesta de valor única, ' +
      'cliente objetivo y por qué ahora. Si faltan datos, adapta el pitch sin inventar información.',
  },
  {
    type: 'landingPageText',
    title: 'Texto para landing page',
    subtitle: 'Texto comercial orientado a conversión para la página principal.',
    copyLabel: 'Copiar texto',
    prompt:
      'Genera texto para una landing page en español a partir de este Lean Canvas. Incluye en formato claro: ' +
      'headline principal, subheadline, 3 beneficios clave, una breve sección de prueba social o credibilidad ' +
      '(si procede según el canvas), y un CTA final potente. Mantén tono profesional y orientado a conversión. ' +
      'Si faltan datos, no inventes; adapta el copy con lo disponible.',
  },
];

