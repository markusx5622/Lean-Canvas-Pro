// ============================================================
// Lean Canvas Pro — Heuristic Evaluator  · __tests__/rules.test.ts
//
// Direct unit tests for the 9 per-block rule functions.
// Each describe block covers one rule function and focuses on:
//   • placeholder / empty input
//   • content that is too short
//   • vague / generic language
//   • concrete signals (numbers, specific terms, metrics)
//   • positive path (rich, well-written content)
// ============================================================
import { describe, it, expect } from 'vitest';
import { evaluateProblema }      from '../rules/problema';
import { evaluateSegmentos }     from '../rules/segmentos';
import { evaluatePropuestaUnica } from '../rules/propuestaUnica';
import { evaluateSolucion }      from '../rules/solucion';
import { evaluateCanales }       from '../rules/canales';
import { evaluateFlujoIngresos } from '../rules/flujoIngresos';
import { evaluateCostes }        from '../rules/costes';
import { evaluateMetricas }      from '../rules/metricas';
import { evaluateVentajaInjusta } from '../rules/ventajaInjusta';

// ── Shared helpers ────────────────────────────────────────────

/** Returns true when any issue in the list has the given code. */
function hasIssue(issues: Array<{ code: string }>, code: string): boolean {
  return issues.some(i => i.code === code);
}

/** Returns true when any strength in the list has the given code. */
function hasStrength(strengths: Array<{ code: string }>, code: string): boolean {
  return strengths.some(s => s.code === code);
}

// ── evaluateProblema (block 1) ────────────────────────────────

describe('evaluateProblema', () => {
  it('returns PLACEHOLDER issue and score=5 for single-word text', () => {
    const { issues, score } = evaluateProblema('dolor');
    expect(hasIssue(issues, 'PLACEHOLDER')).toBe(true);
    expect(score).toBe(5);
  });

  it('returns TOO_SHORT for brief but non-placeholder text', () => {
    const { issues } = evaluateProblema('El cliente sufre retrasos en los procesos internos.');
    expect(hasIssue(issues, 'TOO_SHORT')).toBe(true);
  });

  it('returns VAGUE_LANGUAGE when no domain keywords are present', () => {
    const generic = Array(25).fill('palabra').join(' '); // 25 words, no domain terms
    const { issues } = evaluateProblema(generic);
    expect(hasIssue(issues, 'VAGUE_LANGUAGE')).toBe(true);
  });

  it('returns MISSING_ALTERNATIVES when alternatives are not mentioned', () => {
    const text = 'El cliente pierde horas gestionando facturas de forma manual cada semana. ' +
      'El proceso es tedioso, propenso a errores y costoso para el departamento contable.';
    const { issues } = evaluateProblema(text);
    expect(hasIssue(issues, 'MISSING_ALTERNATIVES')).toBe(true);
  });

  it('detects MENTIONS_ALTERNATIVES strength when present', () => {
    const text = 'El cliente pierde 3 horas semanales con facturas manuales. ' +
      'Las alternativas actuales como Excel son propensas a errores costosos.';
    const { strengths } = evaluateProblema(text);
    expect(hasStrength(strengths, 'MENTIONS_ALTERNATIVES')).toBe(true);
  });

  it('score is higher with rich, quantified content than with vague content', () => {
    const rich = 'El cliente pierde entre 3 y 5 horas semanales gestionando facturas de forma manual. ' +
      'Las alternativas actuales (Excel, papel) son propensas a errores y no ofrecen visibilidad ' +
      'en tiempo real. El coste de los errores contables puede superar los 2.000 € anuales por empresa.';
    const vague = Array(22).fill('cosas').join(' ');
    expect(evaluateProblema(rich).score).toBeGreaterThan(evaluateProblema(vague).score);
  });

  it('score is always in [0, 100]', () => {
    for (const text of ['', 'x', Array(200).fill('dolor coste tiempo').join(' ')]) {
      const { score } = evaluateProblema(text);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

// ── evaluateSegmentos (block 2) ───────────────────────────────

describe('evaluateSegmentos', () => {
  it('returns PLACEHOLDER issue and score=5 for single-word text', () => {
    const { issues, score } = evaluateSegmentos('usuarios');
    expect(hasIssue(issues, 'PLACEHOLDER')).toBe(true);
    expect(score).toBe(5);
  });

  it('returns TOO_SHORT for brief but non-placeholder text', () => {
    const { issues } = evaluateSegmentos('Pequeñas empresas del sector retail interesadas.');
    expect(hasIssue(issues, 'TOO_SHORT')).toBe(true);
  });

  it('returns SEGMENT_TOO_BROAD for broad audience terms', () => {
    const { issues } = evaluateSegmentos('Todo el mundo puede usarlo, cualquier persona interesada en el mercado.');
    expect(hasIssue(issues, 'SEGMENT_TOO_BROAD')).toBe(true);
  });

  it('returns VAGUE_SEGMENT when no positive keywords are present', () => {
    // Uses neutral words not in block 2 positive or generic dictionaries
    const { issues } = evaluateSegmentos(Array(20).fill('comprador potencial interesado').join(' '));
    expect(hasIssue(issues, 'VAGUE_SEGMENT')).toBe(true);
  });

  it('detects WELL_DEFINED_SEGMENT for specific segment description', () => {
    const text = 'Contables autónomos en España de 30-50 años con cartera de 20-50 clientes pyme ' +
      'del sector servicios. Perfil B2B con facturación anual entre 50.000 y 200.000 €.';
    const { strengths } = evaluateSegmentos(text);
    expect(hasStrength(strengths, 'WELL_DEFINED_SEGMENT')).toBe(true);
  });

  it('detects EARLY_ADOPTER_DEFINED when early adopter is mentioned', () => {
    const text = 'Pymes B2B de 10-50 empleados del sector logístico en España. ' +
      'Early adopter: responsable de operaciones frustrado con Excel y procesos manuales.';
    const { strengths } = evaluateSegmentos(text);
    expect(hasStrength(strengths, 'EARLY_ADOPTER_DEFINED')).toBe(true);
  });

  it('score is always in [0, 100]', () => {
    for (const text of ['', 'x', Array(100).fill('cliente empresa sector nicho').join(' ')]) {
      const { score } = evaluateSegmentos(text);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

// ── evaluatePropuestaUnica (block 3) ──────────────────────────

describe('evaluatePropuestaUnica', () => {
  it('returns PLACEHOLDER issue and score=5 for single-word text', () => {
    const { issues, score } = evaluatePropuestaUnica('valor');
    expect(hasIssue(issues, 'PLACEHOLDER')).toBe(true);
    expect(score).toBe(5);
  });

  it('returns CONCISE_UVP strength for short, impactful text', () => {
    const { strengths } = evaluatePropuestaUnica('Automatiza el 90% de la conciliación bancaria. Ahorra 4 horas semanales.');
    expect(hasStrength(strengths, 'CONCISE_UVP')).toBe(true);
  });

  it('returns UVP_TOO_LONG for a very long text', () => {
    const long = Array(40).fill('gran beneficio para los clientes específicos').join(' ');
    const { issues } = evaluatePropuestaUnica(long);
    expect(hasIssue(issues, 'UVP_TOO_LONG')).toBe(true);
  });

  it('returns NO_DIFFERENTIATION when no value keywords are present', () => {
    const { issues } = evaluatePropuestaUnica('Una herramienta para gestionar procesos empresariales internos.');
    expect(hasIssue(issues, 'NO_DIFFERENTIATION')).toBe(true);
  });

  it('detects OUTCOME_FOCUSED strength when outcome verbs are present', () => {
    const { strengths } = evaluatePropuestaUnica('Automatiza el proceso y ahorra tiempo al equipo de contabilidad.');
    expect(hasStrength(strengths, 'OUTCOME_FOCUSED')).toBe(true);
  });

  it('score is always in [0, 100]', () => {
    for (const text of ['', 'x', Array(100).fill('único beneficio').join(' ')]) {
      const { score } = evaluatePropuestaUnica(text);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

// ── evaluateSolucion (block 4) ────────────────────────────────

describe('evaluateSolucion', () => {
  it('returns PLACEHOLDER issue and score=5 for single-word text', () => {
    const { issues, score } = evaluateSolucion('app');
    expect(hasIssue(issues, 'PLACEHOLDER')).toBe(true);
    expect(score).toBe(5);
  });

  it('returns TOO_SHORT for brief but non-placeholder text', () => {
    const { issues } = evaluateSolucion('Una plataforma web para gestionar facturas online de forma sencilla.');
    expect(hasIssue(issues, 'TOO_SHORT')).toBe(true);
  });

  it('returns SOLUTION_TOO_VAGUE for generic platform description without features', () => {
    const text = 'Una plataforma innovadora que permite a los usuarios gestionar sus cosas de forma eficiente ' +
      'y efectiva usando tecnología de última generación para el mercado digital.';
    const { issues } = evaluateSolucion(text);
    expect(hasIssue(issues, 'SOLUTION_TOO_VAGUE')).toBe(true);
  });

  it('detects FEATURE_FOCUSED strength for concrete feature descriptions', () => {
    const text = 'Dashboard en tiempo real con módulo de automatización de flujos, ' +
      'algoritmo de recomendación de acciones e integración vía API con herramientas CRM existentes.';
    const { strengths } = evaluateSolucion(text);
    expect(hasStrength(strengths, 'FEATURE_FOCUSED')).toBe(true);
  });

  it('detects MVP_MINDSET strength when MVP/prototype is mentioned', () => {
    const text = 'MVP web con las 3 funcionalidades clave: automatización, dashboard y alertas. ' +
      'El prototipo se validará con los primeros 10 clientes piloto.';
    const { strengths } = evaluateSolucion(text);
    expect(hasStrength(strengths, 'MVP_MINDSET')).toBe(true);
  });

  it('score is always in [0, 100]', () => {
    for (const text of ['', 'x', Array(100).fill('automatización integración api').join(' ')]) {
      const { score } = evaluateSolucion(text);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

// ── evaluateCanales (block 5) ─────────────────────────────────

describe('evaluateCanales', () => {
  it('returns PLACEHOLDER issue and score=5 for single-word text', () => {
    const { issues, score } = evaluateCanales('web');
    expect(hasIssue(issues, 'PLACEHOLDER')).toBe(true);
    expect(score).toBe(5);
  });

  it('returns TOO_SHORT for brief text', () => {
    const { issues } = evaluateCanales('Redes sociales y marketing digital.');
    expect(hasIssue(issues, 'TOO_SHORT')).toBe(true);
  });

  it('returns VAGUE_CHANNELS when no specific channel keywords are present', () => {
    const text = Array(12).fill('marketing').join(' ') + ' digital online general';
    const { issues } = evaluateCanales(text);
    expect(hasIssue(issues, 'VAGUE_CHANNELS')).toBe(true);
  });

  it('detects MULTI_CHANNEL strength for concrete multi-channel strategy', () => {
    const text = 'SEO orgánico para contables, LinkedIn outreach a gestorías, email marketing mensual ' +
      'a base de datos propia y partnerships con software de contabilidad.';
    const { strengths } = evaluateCanales(text);
    expect(hasStrength(strengths, 'MULTI_CHANNEL')).toBe(true);
  });

  it('detects ORGANIC_GROWTH strength when organic/referral channels are mentioned', () => {
    const text = 'Crecimiento orgánico vía SEO posicionado en términos de contabilidad para pymes, ' +
      'complementado con referral program e inbound marketing de contenido.';
    const { strengths } = evaluateCanales(text);
    expect(hasStrength(strengths, 'ORGANIC_GROWTH')).toBe(true);
  });

  it('score is always in [0, 100]', () => {
    for (const text of ['', 'x', Array(100).fill('seo linkedin email partnership').join(' ')]) {
      const { score } = evaluateCanales(text);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

// ── evaluateFlujoIngresos (block 6) ───────────────────────────

describe('evaluateFlujoIngresos', () => {
  it('returns PLACEHOLDER issue and score=5 for single-word text', () => {
    const { issues, score } = evaluateFlujoIngresos('ventas');
    expect(hasIssue(issues, 'PLACEHOLDER')).toBe(true);
    expect(score).toBe(5);
  });

  it('returns TOO_SHORT for brief text', () => {
    const { issues } = evaluateFlujoIngresos('Cobraremos por el servicio mensualmente.');
    expect(hasIssue(issues, 'TOO_SHORT')).toBe(true);
  });

  it('returns NO_REVENUE_MODEL when no model keywords are present', () => {
    const text = Array(12).fill('dinero').join(' ') + ' ingresos ventas clientes ganancias cobro';
    const { issues } = evaluateFlujoIngresos(text);
    expect(hasIssue(issues, 'NO_REVENUE_MODEL')).toBe(true);
  });

  it('returns NO_PRICING when no numbers are present', () => {
    const text = 'Modelo de suscripción mensual con plan básico y plan premium para empresas medianas.';
    const { issues } = evaluateFlujoIngresos(text);
    expect(hasIssue(issues, 'NO_PRICING')).toBe(true);
  });

  it('detects PRICING_DEFINED strength when numbers are present', () => {
    const text = 'Suscripción SaaS de 49 €/mes por empresa, plan anual a 490 €/año con descuento.';
    const { strengths } = evaluateFlujoIngresos(text);
    expect(hasStrength(strengths, 'PRICING_DEFINED')).toBe(true);
  });

  it('detects CLEAR_REVENUE_MODEL strength for well-defined model', () => {
    const text = 'Suscripción mensual recurrente de 49 €/mes por empresa. Plan freemium con límite de ' +
      '5 usuarios y upgrade a plan premium. Comisión del 2% en transacciones avanzadas.';
    const { strengths } = evaluateFlujoIngresos(text);
    expect(hasStrength(strengths, 'CLEAR_REVENUE_MODEL')).toBe(true);
  });

  it('detects RECURRING_REVENUE when MRR/subscription terms are present', () => {
    const text = 'Suscripción mensual recurrente de 99 €/mes, con MRR creciente según el plan contratado.';
    const { strengths } = evaluateFlujoIngresos(text);
    expect(hasStrength(strengths, 'RECURRING_REVENUE')).toBe(true);
  });

  it('score is always in [0, 100]', () => {
    for (const text of ['', 'x', Array(100).fill('suscripción 49 euros mes mrr arr').join(' ')]) {
      const { score } = evaluateFlujoIngresos(text);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

// ── evaluateCostes (block 7) ──────────────────────────────────

describe('evaluateCostes', () => {
  it('returns PLACEHOLDER issue and score=5 for single-word text', () => {
    const { issues, score } = evaluateCostes('servidores');
    expect(hasIssue(issues, 'PLACEHOLDER')).toBe(true);
    expect(score).toBe(5);
  });

  it('returns TOO_SHORT for brief text', () => {
    const { issues } = evaluateCostes('Servidores y salarios del equipo.');
    expect(hasIssue(issues, 'TOO_SHORT')).toBe(true);
  });

  it('returns NO_NUMBERS when no figures are present', () => {
    const text = 'Servidores cloud, salarios de tres desarrolladores, marketing y gastos legales varios.';
    const { issues } = evaluateCostes(text);
    expect(hasIssue(issues, 'NO_NUMBERS')).toBe(true);
  });

  it('detects QUANTIFIED_COSTS strength when numbers are present', () => {
    const text = 'Servidores AWS 800 €/mes, soporte técnico 1.200 €/mes, marketing 500 €/mes.';
    const { strengths } = evaluateCostes(text);
    expect(hasStrength(strengths, 'QUANTIFIED_COSTS')).toBe(true);
  });

  it('detects FIXED_VARIABLE_SPLIT strength when fixed/variable or burn-rate terms appear', () => {
    const text = 'Costes fijos: servidores 800 €/mes, salarios 3.000 €/mes. ' +
      'Costes variables: comisiones 5% por venta. Burn rate mensual estimado: 5.000 €.';
    const { strengths } = evaluateCostes(text);
    expect(hasStrength(strengths, 'FIXED_VARIABLE_SPLIT')).toBe(true);
  });

  it('score is always in [0, 100]', () => {
    for (const text of ['', 'x', Array(100).fill('salarios servidor marketing 1000 euros').join(' ')]) {
      const { score } = evaluateCostes(text);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

// ── evaluateMetricas (block 8) ────────────────────────────────

describe('evaluateMetricas', () => {
  it('returns PLACEHOLDER issue and score=5 for single-word text', () => {
    const { issues, score } = evaluateMetricas('métricas');
    expect(hasIssue(issues, 'PLACEHOLDER')).toBe(true);
    expect(score).toBe(5);
  });

  it('returns TOO_SHORT for brief text', () => {
    const { issues } = evaluateMetricas('Usuarios activos y conversión de ventas.');
    expect(hasIssue(issues, 'TOO_SHORT')).toBe(true);
  });

  it('returns VANITY_METRICS when no recognised KPI keywords are present', () => {
    const text = Array(12).fill('visitas').join(' ') + ' likes seguidores engagement alcance shares';
    const { issues } = evaluateMetricas(text);
    expect(hasIssue(issues, 'VANITY_METRICS')).toBe(true);
  });

  it('detects ACTIONABLE_METRICS strength for CAC + LTV + MRR', () => {
    const text = 'CAC < 150 €, LTV > 900 €, MRR con crecimiento del 15% mensual y churn < 2%.';
    const { strengths } = evaluateMetricas(text);
    expect(hasStrength(strengths, 'ACTIONABLE_METRICS')).toBe(true);
  });

  it('detects NUMERIC_TARGETS strength when numbers are present', () => {
    const text = 'CAC objetivo 100 €, tasa de conversión del 3%, churn mensual inferior al 2%.';
    const { strengths } = evaluateMetricas(text);
    expect(hasStrength(strengths, 'NUMERIC_TARGETS')).toBe(true);
  });

  it('detects CAC_LTV_PRESENT strength when both are mentioned', () => {
    const text = 'Seguimiento de CAC y LTV para calcular la viabilidad económica del modelo de negocio.';
    const { strengths } = evaluateMetricas(text);
    expect(hasStrength(strengths, 'CAC_LTV_PRESENT')).toBe(true);
  });

  it('score is higher with concrete KPIs than with vanity metrics', () => {
    const concrete = 'CAC < 150 €, LTV > 900 €, MRR, churn mensual, tasa de activación.';
    const vanity   = Array(14).fill('visitas likes seguidores').join(' ');
    expect(evaluateMetricas(concrete).score).toBeGreaterThan(evaluateMetricas(vanity).score);
  });

  it('score is always in [0, 100]', () => {
    for (const text of ['', 'x', Array(100).fill('cac ltv mrr churn conversion 5%').join(' ')]) {
      const { score } = evaluateMetricas(text);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

// ── evaluateVentajaInjusta (block 9) ──────────────────────────

describe('evaluateVentajaInjusta', () => {
  it('returns PLACEHOLDER issue and score=5 for single-word text', () => {
    const { issues, score } = evaluateVentajaInjusta('experiencia');
    expect(hasIssue(issues, 'PLACEHOLDER')).toBe(true);
    expect(score).toBe(5);
  });

  it('returns TOO_SHORT for brief text', () => {
    const { issues } = evaluateVentajaInjusta('Tenemos mucha experiencia en el sector.');
    expect(hasIssue(issues, 'TOO_SHORT')).toBe(true);
  });

  it('returns COPYABLE_ADVANTAGE for soft attributes like experience or passion', () => {
    const text = 'Nuestro equipo tiene mucha experiencia, dedicación y pasión por el producto. ' +
      'Trabajamos muy duro y tenemos un gran equipo comprometido con la misión.';
    const { issues } = evaluateVentajaInjusta(text);
    expect(hasIssue(issues, 'COPYABLE_ADVANTAGE')).toBe(true);
  });

  it('returns NO_REAL_ADVANTAGE when no defensible moat keyword is present', () => {
    const text = Array(12).fill('equipo').join(' ') + ' trabajo duro compromiso cultura empresa';
    const { issues } = evaluateVentajaInjusta(text);
    expect(hasIssue(issues, 'NO_REAL_ADVANTAGE')).toBe(true);
  });

  it('detects REAL_MOAT strength for defensible moat keywords', () => {
    const text = 'Dataset exclusivo de 50.000 transacciones anotadas y acuerdo preferente con 3 bancos. ' +
      'Patente registrada sobre el algoritmo de conciliación.';
    const { strengths } = evaluateVentajaInjusta(text);
    expect(hasStrength(strengths, 'REAL_MOAT')).toBe(true);
  });

  it('detects IP_PROTECTED strength when patent or exclusive contract is mentioned', () => {
    const text = 'Patente registrada sobre el algoritmo de procesamiento. ' +
      'Contrato exclusivo con los 3 principales distribuidores del sector.';
    const { strengths } = evaluateVentajaInjusta(text);
    expect(hasStrength(strengths, 'IP_PROTECTED')).toBe(true);
  });

  it('score is always in [0, 100]', () => {
    for (const text of ['', 'x', Array(100).fill('patente datos exclusivos comunidad').join(' ')]) {
      const { score } = evaluateVentajaInjusta(text);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});
