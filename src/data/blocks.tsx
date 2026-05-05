import React from 'react';
import {
  Users, AlertCircle, Lightbulb, Rocket, TrendingUp, Share2, ShieldCheck, DollarSign, CreditCard,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface BlockExample {
  company: string;
  text: string;
}

export interface BlockDefinition {
  id: number;
  order: number;
  title: string;
  /** Tailwind gradient classes for background blobs */
  color: string;
  /** Tailwind text-color class for the icon */
  iconColor: string;
  /** Tailwind ring-color class used when the block is active */
  ringColor: string;
  icon: React.ReactNode;
  /** Short placeholder shown when the block is empty */
  description: string;
  /** Longer guidance text displayed in the editor panel guide tab */
  details: string;
  questions: string[];
  examples: BlockExample[];
}

/** Compact subset used by read-only / shared views */
export type BlockMeta = Pick<BlockDefinition, 'title' | 'icon' | 'color' | 'iconColor'>;

// ── Static block definitions ─────────────────────────────────────────────────

export const BLOCKS: BlockDefinition[] = [
  {
    id: 1, order: 1, title: 'Problema',
    color: 'from-rose-50 to-white dark:from-rose-950/30 dark:to-slate-900',
    iconColor: 'text-rose-500 dark:text-rose-400',
    ringColor: 'ring-rose-500/50 dark:ring-rose-500/40',
    icon: <AlertCircle size={22} strokeWidth={2.5} />,
    description: 'Identifica los 3 problemas principales. Sin un problema real, no hay negocio.',
    details: 'Sin un problema real, no hay negocio. Aquí también incluyes \'Alternativas existentes\' (cómo resuelven el problema hoy).',
    questions: ['¿Qué duele más a tu cliente hoy?', '¿Cómo lo solucionan ahora sin tu ayuda?', '¿Cuánto gastan en resolverlo?', '¿Con qué frecuencia ocurre el problema?'],
    examples: [
      { company: 'Cabify', text: '1. Conseguir taxi u VTC de forma rápida y segura.\n2. Evitar sorpresas en la tarifa final.\n3. Pagos automatizados y servicio corporativo para empresas.' },
      { company: 'Wallapop', text: '1. Vender cosas usadas es un proceso complejo y da poca confianza.\n2. Comprar artículos de segunda mano cerca de ti no es fácil ni inmediato.' },
    ],
  },
  {
    id: 4, order: 2, title: 'Solución',
    color: 'from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900',
    iconColor: 'text-amber-500 dark:text-amber-400',
    ringColor: 'ring-amber-500/50 dark:ring-amber-500/40',
    icon: <Lightbulb size={22} strokeWidth={2.5} />,
    description: 'Define las características clave que resuelven los problemas principales.',
    details: 'No intentes construir todo a la vez. Enfócate en las 3 funciones principales.',
    questions: ['¿Es esta la forma más simple de resolverlo?', '¿Puedes construirlo rápidamente?', '¿Requiere mucho esfuerzo del cliente?'],
    examples: [
      { company: 'Glovo', text: 'App móvil para pedir cualquier cosa recadera en tu ciudad en menos de 30 min. Sistema de riders autónomos y geolocalización en tiempo real.' },
    ],
  },
  {
    id: 3, order: 3, title: 'Propuesta Única',
    color: 'from-violet-50 to-white dark:from-violet-950/30 dark:to-slate-900',
    iconColor: 'text-violet-500 dark:text-violet-400',
    ringColor: 'ring-violet-500/50 dark:ring-violet-500/40',
    icon: <Rocket size={22} strokeWidth={2.5} />,
    description: 'Mensaje claro: qué haces y por qué eres diferente. El corazón del lienzo.',
    details: 'Debe ser un mensaje de alto nivel que condense el valor. Describe beneficios tangibles, no funciones.',
    questions: ['¿Cómo resumirías tu valor en un tuit...', '¿Qué te hace diferente?', '¿Por qué pagarían por esto hoy?'],
    examples: [
      { company: 'Mercadona', text: '\'Siempre Precios Bajos\' (SPB). Calidad altísima en marca blanca (Hacendado) sin depender de ofertas temporales o cupones.' },
    ],
  },
  {
    id: 9, order: 4, title: 'Ventaja Injusta',
    color: 'from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900',
    iconColor: 'text-blue-500 dark:text-blue-400',
    ringColor: 'ring-blue-500/50 dark:ring-blue-500/40',
    icon: <ShieldCheck size={22} strokeWidth={2.5} />,
    description: 'Algo que no se puede copiar o comprar fácilmente por la competencia.',
    details: 'Puede ser un equipo de expertos, patentes, una comunidad exclusiva o datos únicos que solo tú posees.',
    questions: ['¿Tienes información exclusiva?', '¿Tu comunidad es un foso defensivo?', '¿Tienes canales preferentes?'],
    examples: [
      { company: 'Hawkers', text: 'Comunidad inicial masiva en redes sociales y modelo de influencers de micro-nichos que abarató su CAC frente a gigantes.' },
    ],
  },
  {
    id: 2, order: 5, title: 'Segmentos',
    color: 'from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    ringColor: 'ring-emerald-500/50 dark:ring-emerald-500/40',
    icon: <Users size={22} strokeWidth={2.5} />,
    description: '¿Quiénes son tus clientes? Identifica a tus Early Adopters iniciales.',
    details: 'Los \'Early Adopters\' son los que necesitan tu solución ahora mismo, aunque no sea perfecta. Encuéntralos primero.',
    questions: ['¿Quién pagaría por esto hoy mismo?', '¿Cómo es el perfil demográfico?', '¿Hay un nicho más accesible?'],
    examples: [
      { company: 'Typeform', text: 'Diseñadores web y marketers que querían formularios hermosos y conversacionales que no parecieran una base de datos.' },
    ],
  },
  {
    id: 8, order: 6, title: 'Métricas Clave',
    color: 'from-orange-50 to-white dark:from-orange-950/30 dark:to-slate-900',
    iconColor: 'text-orange-500 dark:text-orange-400',
    ringColor: 'ring-orange-500/50 dark:ring-orange-500/40',
    icon: <TrendingUp size={22} strokeWidth={2.5} />,
    description: 'Los números críticos que indican si el negocio está realmente funcionando.',
    details: 'Elige métricas procesables como el CAC, LTV o tasas de retención.',
    questions: ['¿Qué dato define el éxito?', '¿Estás midiendo la retención?', '¿Cuál es el costo de adquisición?'],
    examples: [
      { company: 'Holded', text: 'Ingresos Recurrentes (MRR), Costo de Adquisición de un PYME/Autónomo (CAC) y Lifetime Value (LTV).' },
    ],
  },
  {
    id: 5, order: 7, title: 'Canales',
    color: 'from-teal-50 to-white dark:from-teal-950/30 dark:to-slate-900',
    iconColor: 'text-teal-500 dark:text-teal-400',
    ringColor: 'ring-teal-500/50 dark:ring-teal-500/40',
    icon: <Share2 size={22} strokeWidth={2.5} />,
    description: 'Tu ruta al mercado. Cómo vas a captar y retener a tus clientes.',
    details: 'Define tu estrategia de adquisición y distribución: inbound, outbound, o partners.',
    questions: ['¿Dónde buscan soluciones hoy?', '¿Cómo te descubrirán por primera vez?', '¿Es escalable a largo plazo?'],
    examples: [
      { company: 'Idealista', text: 'SEO orgánico dominando palabras clave inmobiliarias locales, campañas masivas offline (TV/Metro) para construir marca de confianza.' },
    ],
  },
  {
    id: 7, order: 8, title: 'Costes',
    color: 'from-slate-100 to-white dark:from-slate-800/50 dark:to-slate-900',
    iconColor: 'text-slate-600 dark:text-slate-400',
    ringColor: 'ring-slate-500/50 dark:ring-slate-500/40',
    icon: <CreditCard size={22} strokeWidth={2.5} />,
    description: 'Tus gastos principales para operar: servidores, marketing, salarios, etc.',
    details: 'Clasifica en costos fijos y variables para calcular el punto de equilibrio.',
    questions: ['¿Cuál es el burn-rate mensual?', '¿Qué costo puedes reducir hoy?', '¿Cuál es el costo de desarrollo?'],
    examples: [
      { company: 'Cabify', text: 'Marketing y captación, salarios del equipo tech/operaciones, infraestructura cloud y seguros de responsabilidad civil.' },
    ],
  },
  {
    id: 6, order: 9, title: 'Flujo de Ingresos',
    color: 'from-cyan-50 to-white dark:from-cyan-950/30 dark:to-slate-900',
    iconColor: 'text-cyan-500 dark:text-cyan-400',
    ringColor: 'ring-cyan-500/50 dark:ring-cyan-500/40',
    icon: <DollarSign size={22} strokeWidth={2.5} />,
    description: 'Cómo vas a ganar dinero: suscripciones, pago por uso o márgenes de venta.',
    details: 'Define tu modelo de monetización. La forma más directa de validar una startup es lograr que alguien pague.',
    questions: ['¿Cómo prefiere pagar tu cliente?', '¿Ofreces pagos recurrentes?', '¿Cuál es tu margen de beneficio?'],
    examples: [
      { company: 'Flywire', text: 'Modelo híbrido B2B2C: Tasa de transacción por transferencia internacional (ganancia de Forex) + fee directo a instituciones.' },
    ],
  },
];

/** Lookup map used by read-only canvas views (e.g. SharedCanvasView) */
export const BLOCK_META: Record<number, BlockMeta> = Object.fromEntries(
  BLOCKS.map((b) => [b.id, { title: b.title, icon: b.icon, color: b.color, iconColor: b.iconColor }])
);
