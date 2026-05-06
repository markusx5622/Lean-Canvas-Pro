// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * A Lean Canvas template pre-fills one or more of the 9 canvas blocks.
 * Keys correspond to BlockDefinition.id values (1–9):
 *   1 = Problema, 2 = Segmentos, 3 = Propuesta Única, 4 = Solución,
 *   5 = Canales, 6 = Flujo de Ingresos, 7 = Costes, 8 = Métricas Clave,
 *   9 = Ventaja Injusta
 */
export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  /** Pre-filled block content indexed by block ID */
  data: Record<number, string>;
}

// ── Templates ──────────────────────────────────────────────────────────────────

export const TEMPLATES: CanvasTemplate[] = [
  {
    id: 'saas-b2b',
    name: 'SaaS B2B',
    description: 'Software de suscripción para empresas. Ideal para herramientas de productividad, gestión o automatización.',
    category: 'Software',
    emoji: '💼',
    data: {
      1: '1. Gestionar [proceso] manualmente consume demasiado tiempo.\n2. Las soluciones existentes son complejas y demasiado caras para PYMEs.\n3. Falta de visibilidad en tiempo real de los datos del negocio.',
      4: 'Plataforma SaaS con interfaz intuitiva, automatización de flujos clave y dashboard centralizado. Onboarding guiado con resultados visibles en la primera semana.',
      3: 'La herramienta más fácil de adoptar para [industria], con resultados visibles en la primera semana. Sin formación costosa ni migración compleja.',
      9: 'Integraciones nativas con el ecosistema de software que ya usan nuestros clientes. Equipo fundador con 10+ años de experiencia en la industria.',
      2: 'PYMEs de 10–200 empleados en [industria].\nEarly adopters: jefes de operaciones o directores frustrados con hojas de cálculo.',
      8: 'MRR, Churn Rate mensual, CAC, LTV, NPS y tiempo de onboarding (objetivo <30 min).',
      5: 'SEO de contenido + trials gratuitos (inbound). SDRs para cuentas objetivo (outbound). Partnerships con consultoras del sector.',
      7: 'Infraestructura cloud, equipo de ingeniería (≈60 % de costes), marketing de contenidos, soporte al cliente.',
      6: 'Suscripción mensual/anual por usuario o equipo. Planes Starter + Growth + Enterprise. Upsell por módulos adicionales.',
    },
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Plataforma de dos lados que conecta compradores y vendedores. Funciona con efectos de red.',
    category: 'Plataforma',
    emoji: '🛒',
    data: {
      1: '1. Los compradores no encuentran [producto/servicio] de calidad fácilmente.\n2. Los vendedores tienen dificultad para llegar a su mercado objetivo.\n3. Falta de confianza en transacciones entre desconocidos.',
      4: 'Plataforma que conecta compradores y vendedores con búsqueda avanzada, perfiles verificados y pagos seguros integrados.',
      3: 'El marketplace más confiable de [nicho]: cada transacción garantizada y cada vendedor verificado.',
      9: 'Efectos de red: más vendedores atraen a más compradores y viceversa. Base de reseñas verificadas difícil de replicar.',
      2: 'Lado demanda: [perfil comprador] que busca [producto/servicio].\nLado oferta: [perfil vendedor] que quiere escalar ventas online.',
      8: 'GMV (Gross Merchandise Value), tasa de conversión, ratio compradores/vendedores, NPS de ambos lados, take rate.',
      5: 'SEO para compradores (intención de búsqueda alta). Outreach directo a vendedores top. Referidos entre vendedores satisfechos.',
      7: 'Infraestructura de pagos (Stripe), moderación y soporte, marketing para captar ambos lados, desarrollo de producto.',
      6: 'Comisión por transacción (take rate 10–20 %). Suscripción premium para vendedores destacados. Publicidad patrocinada.',
    },
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Tienda online especializada en un nicho. Curación de producto, marca propia y experiencia de compra diferencial.',
    category: 'Retail',
    emoji: '🏪',
    data: {
      1: '1. Los consumidores no encuentran [producto] de calidad a un precio justo.\n2. La experiencia de compra en [nicho] es genérica y sin personalización.\n3. Difícil evaluar la autenticidad y calidad antes de comprar.',
      4: 'Tienda online especializada en [nicho] con curación de productos, fotos de alta calidad, guías de compra y devoluciones sin complicaciones.',
      3: 'La tienda de referencia para [nicho]: selección curada, entrega rápida y garantía de satisfacción o devolución gratuita.',
      9: 'Relaciones directas con proveedores exclusivos. Marca reconocida en [comunidad]. Datos propios de comportamiento de compra.',
      2: '[Perfil demográfico] apasionado por [nicho] con capacidad adquisitiva media-alta.\nEarly adopters: compradores que ya usan alternativas insatisfactorias.',
      8: 'Ticket medio, tasa de conversión, tasa de repetición de compra, CAC, ROAS, NPS post-compra.',
      5: 'Instagram/TikTok (contenido orgánico + ads). Google Shopping. Email marketing a base propia. Influencers de nicho.',
      7: 'Coste de mercancía vendida (COGS), logística y almacenamiento, marketing digital, plataforma de e-commerce, devoluciones.',
      6: 'Venta directa de productos (margen 40–60 %). Suscripción mensual (caja curada). Bundles y packs con mayor margen.',
    },
  },
  {
    id: 'ai-product',
    name: 'Producto de IA',
    description: 'Herramienta impulsada por IA que automatiza tareas complejas con resultados de calidad experta.',
    category: 'Inteligencia Artificial',
    emoji: '🤖',
    data: {
      1: '1. [Tarea] consume horas de trabajo manual especializado.\n2. La calidad del resultado depende de la experiencia individual de cada profesional.\n3. El conocimiento experto es escaso y caro de contratar.',
      4: 'Herramienta de IA que automatiza [tarea] con resultados de calidad experta en segundos. Interfaz simple y flujo de trabajo guiado.',
      3: 'La IA que hace el trabajo de [experto] en segundos: más rápido, más consistente y al alcance de cualquier equipo.',
      9: 'Modelo propio entrenado con datos especializados de [dominio]. Flywheel de datos: más uso → mejores resultados → más usuarios.',
      2: 'Profesionales o equipos que realizan [tarea] con frecuencia.\nEarly adopters: equipos pequeños sin recursos para contratar expertos dedicados.',
      8: 'Tareas procesadas por día, retención D7/D30, NPS, tiempo ahorrado por usuario, tasa de adopción.',
      5: 'Product-led growth: freemium con límite de uso. Comunidades profesionales online. Integraciones en herramientas existentes (plugins).',
      7: 'Coste de inferencia LLM (API o GPU propio), ingeniería de producto, datos de entrenamiento/fine-tuning, marketing.',
      6: 'Freemium + planes de pago por volumen de uso o asientos. API para desarrolladores. Plan Enterprise con SLA y soporte dedicado.',
    },
  },
  {
    id: 'fintech',
    name: 'Fintech',
    description: 'Producto financiero digital: pagos, inversión, crédito o gestión de dinero para consumidores o empresas.',
    category: 'Finanzas',
    emoji: '💳',
    data: {
      1: '1. Acceder a servicios financieros de calidad es complejo, caro o inaccesible para [segmento].\n2. Los incumbentes (bancos) son lentos, opacos y con comisiones abusivas.\n3. Falta de visibilidad y control sobre las finanzas personales o de empresa.',
      4: 'App móvil o web que ofrece [servicio financiero] con onboarding en minutos, comisiones transparentes y UX moderna.',
      3: 'La alternativa al banco tradicional para [segmento]: sin comisiones ocultas, transparente y completamente digital.',
      9: 'Licencia regulatoria obtenida (barrera de entrada). Red de partners bancarios/de pagos. Datos financieros propios que mejoran el scoring.',
      2: '[Perfil: autónomos / PYMEs / millennials] frustrado con la banca tradicional.\nEarly adopters: usuarios tech-savvy dispuestos a probar nuevas apps financieras.',
      8: 'Usuarios activos mensuales (MAU), volumen de transacciones, CAC, LTV, tasa de aprobación, churn.',
      5: 'App stores (orgánico + ASO). Referidos (programa "invita y gana"). Partnerships con empresas que llegan a nuestro segmento.',
      7: 'Costes regulatorios y de compliance, infraestructura de pagos, atención al cliente 24/7, marketing de adquisición.',
      6: 'Comisión por transacción (interchange). Suscripción premium. Margen en cambio de divisa. Intereses por crédito.',
    },
  },
  {
    id: 'edtech',
    name: 'EdTech',
    description: 'Plataforma de aprendizaje online: cursos, bootcamps, microlearning o tutoría para un nicho concreto.',
    category: 'Educación',
    emoji: '🎓',
    data: {
      1: '1. Aprender [habilidad] con métodos tradicionales es lento, caro y desconectado del mercado laboral.\n2. El contenido disponible online es demasiado genérico y sin acompañamiento.\n3. Alta tasa de abandono en cursos online por falta de motivación y comunidad.',
      4: 'Plataforma de aprendizaje de [habilidad] con currículo estructurado, proyectos reales, mentores expertos y comunidad activa.',
      3: 'Aprende [habilidad] con garantía de empleo o te devolvemos el dinero. El método más práctico y acompañado del mercado.',
      9: 'Red de alumni con alto NPS que actúa como canal de referidos. Acuerdos de contratación exclusivos con empresas del sector.',
      2: 'Adultos de 22–40 años que quieren cambiar de carrera o mejorar sus habilidades en [área].\nEarly adopters: perfiles que ya han intentado aprender por su cuenta sin éxito.',
      8: 'Tasa de finalización de cursos, tasa de inserción laboral, NPS, CAC, LTV, ingresos por cohorte.',
      5: 'Contenido SEO/YouTube para captación orgánica. Publicidad en LinkedIn/Instagram. Programa de referidos entre alumni.',
      7: 'Salarios de instructores y mentores, producción de contenido, plataforma tecnológica, marketing de captación.',
      6: 'Pago único por curso o bootcamp. Suscripción mensual (acceso a todo el catálogo). ISA (Income Share Agreement) en programas premium.',
    },
  },
];
