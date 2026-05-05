import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertCircle, 
  Lightbulb, 
  Rocket, 
  TrendingUp, 
  Share2, 
  ShieldCheck, 
  DollarSign, 
  CreditCard,
  Printer,
  Trash2,
  Save,
  MessageSquare,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

// Custom hook for localStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue] as const;
}

const LeanCanvasApp = () => {
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [canvasData, setCanvasData] = useLocalStorage<Record<number, string>>('lean-canvas-data', {});
  const [activeTab, setActiveTab] = useState<'guide' | 'examples'>('guide');
  const [isSaved, setIsSaved] = useState(false);

  // Temporary state for the editor
  const [editorText, setEditorText] = useState("");

  const blocks = [
    {
      id: 1, order: 1, title: "Problema", color: "bg-red-50", iconColor: "text-red-500", borderColor: "border-red-500",
      icon: <AlertCircle size={24} strokeWidth={2.5} />,
      description: "Identifica los 3 problemas principales. Sin un problema real, no hay negocio.",
      details: "Sin un problema real, no hay negocio. Aquí también incluyes 'Alternativas existentes' (cómo resuelven el problema hoy).",
      questions: ["¿Qué duele más a tu cliente hoy?", "¿Cómo lo solucionan ahora sin tu ayuda?", "¿Cuánto gastan en resolverlo?", "¿Con qué frecuencia ocurre el problema?"],
      examples: [
        { company: "Airbnb", text: "1. Los hoteles son caros y carecen de autenticidad local. 2. Los anfitriones no tienen forma fácił de alquilar sus espacios libres. 3. Interfaz de reserva compleja." },
        { company: "Uber", text: "1. Conseguir taxi es difícil y frustrante. 2. No saber cuánto va a costar ni cuándo llegará. 3. Coches de mala calidad y sin opciones de pago." }
      ]
    },
    {
      id: 4, order: 4, title: "Solución", color: "bg-yellow-50", iconColor: "text-amber-500", borderColor: "border-amber-500",
      icon: <Lightbulb size={24} strokeWidth={2.5} />,
      description: "Define las características clave que resuelven los problemas principales.",
      details: "No intentes construir todo a la vez. Enfócate en las 3 funciones principales que resuelven los problemas del bloque 1.",
      questions: ["¿Es esta la forma más simple de resolverlo?", "¿Puedes construirlo rápidamente?", "¿Requiere mucho esfuerzo del cliente?", "¿Qué puedes quitar sin perder valor?"],
      examples: [
        { company: "Airbnb", text: "Plataforma web donde usuarios pueden listar sus espacios extra y viajeros pueden reservar alojamiento local y asequible." },
        { company: "Uber", text: "App móvil para solicitar viajes con 1 clic. Rastreo por GPS, estimación de tarifa anticipada y pago automático." }
      ]
    },
    {
      id: 3, order: 3, title: "Propuesta Única", color: "bg-purple-50", iconColor: "text-purple-500", borderColor: "border-purple-500",
      icon: <Rocket size={24} strokeWidth={2.5} />,
      description: "Mensaje claro: qué haces y por qué eres diferente. El corazón del lienzo.",
      details: "Es el componente más importante del lienzo. Debe ser un mensaje de alto nivel que condense el valor. No describas características; describe beneficios tangibles.",
      questions: ["¿Cómo resumirías tu valor en un tuit?", "¿Qué te hace diferente de la competencia?", "¿Quién es tu cliente ideal exacto?", "¿Por qué pagarían por esto hoy?"],
      examples: [
        { company: "Airbnb", text: "Reserva casas de personas locales, en lugar de hoteles. Siéntete como en casa en cualquier lugar del mundo." },
        { company: "Uber", text: "Tu chófer privado. Solicitud de viaje rápida, pago sin efectivo y conductores calificados." }
      ]
    },
    {
      id: 9, order: 9, title: "Ventaja Injusta", color: "bg-blue-50", iconColor: "text-blue-500", borderColor: "border-blue-500",
      icon: <ShieldCheck size={24} strokeWidth={2.5} />,
      description: "Algo que no se puede copiar o comprar fácilmente por la competencia.",
      details: "A veces llamada 'Unfair Advantage'. Puede ser un equipo de expertos, patentes, una comunidad exclusiva o datos únicos que solo tú posees.",
      questions: ["¿Tienes información exclusiva?", "¿Cuentas con talento irremplazable?", "¿Tu comunidad es un foso defensivo?", "¿Tienes canales preferentes?"],
      examples: [
        { company: "Airbnb", text: "El efecto de red: Cuantos más anfitriones, más viajeros; lo que atrae a más anfitriones. Una vez establecido, es difícil de replicar." },
        { company: "Google", text: "Algoritmo de búsqueda PageRank. Infraestructura de datos gigantesca y marca genérica ('googlearlo')." }
      ]
    },
    {
      id: 2, order: 2, title: "Segmentos", color: "bg-green-50", iconColor: "text-green-500", borderColor: "border-green-500",
      icon: <Users size={24} strokeWidth={2.5} />,
      description: "¿Quiénes son tus clientes? Identifica a tus Early Adopters iniciales.",
      details: "Divide a tu público. Los 'Early Adopters' son los que necesitan tu solución ahora mismo, aunque no sea perfecta. Encuéntralos primero.",
      questions: ["¿Quién pagaría por esto hoy mismo?", "¿Cómo es el perfil demográfico?", "¿Dónde pasan su tiempo online?", "¿Hay un nicho más accesible?"],
      examples: [
        { company: "Airbnb", text: "Viajeros con presupuesto limitado que buscan opciones auténticas. Anfitriones que quieren ganar dinero extra con cuartos vacíos." },
        { company: "Uber", text: "Profesionales urbanos que necesitan ir de punto A a punto B de forma fiable." }
      ]
    },
    {
      id: 8, order: 8, title: "Métricas Clave", color: "bg-orange-50", iconColor: "text-orange-500", borderColor: "border-orange-500",
      icon: <TrendingUp size={24} strokeWidth={2.5} />,
      description: "Los números críticos que indican si el negocio está realmente funcionando.",
      details: "No midas todo. Elige métricas procesables como el Costo de Adquisición de Cliente (CAC), Lifetime Value (LTV) o tasas de activación.",
      questions: ["¿Qué dato define el éxito?", "¿Cómo sabes si el usuario está feliz?", "¿Estás midiendo la retención?", "¿Cuál es el costo de adquisición?"],
      examples: [
        { company: "SaaS General", text: "Ingreso Recurrente Mensual (MRR), Costo de Adquisición (CAC), Tasa de abandono (Churn rate) y Lifetime Value (LTV)." },
        { company: "Airbnb", text: "Noches reservadas. Nuevos anfitriones activos mensuales." }
      ]
    },
    {
      id: 5, order: 5, title: "Canales", color: "bg-teal-50", iconColor: "text-teal-500", borderColor: "border-teal-500",
      icon: <Share2 size={24} strokeWidth={2.5} />,
      description: "Tu ruta al mercado. Cómo vas a captar y retener a tus clientes.",
      details: "Define tu estrategia de adquisición y distribución: inbound marketing (SEO, contenido), outbound (ventas en frío), o canales de partners/afiliados.",
      questions: ["¿Dónde buscan soluciones hoy?", "¿Cómo te descubrirán por primera vez?", "¿Cuál canal tiene menor costo?", "¿Es escalable a largo plazo?"],
      examples: [
        { company: "Airbnb", text: "Inicialmente: CraigsList integraciones manuales. Después: Referidos (Word of mouth), PR, alianzas con eventos." },
        { company: "Netflix", text: "Directo, Apps integradas en Smart TVs, Alianzas con proveedores de internet." }
      ]
    },
    {
      id: 7, order: 7, title: "Estructura de Costes", color: "bg-slate-50", iconColor: "text-slate-600", borderColor: "border-slate-600",
      icon: <CreditCard size={24} strokeWidth={2.5} />,
      description: "Tus gastos principales para operar el negocio: servidores, marketing, salarios, etc.",
      details: "Clasifica en costos fijos y variables. Es crucial para calcular el punto de equilibrio y saber cuánta inversión o ingresos necesitas al principio.",
      questions: ["¿Cuál es el burn-rate mensual?", "¿Qué costo puedes reducir hoy?", "¿Cuál es el costo de desarrollo?", "¿Estás considerando tu propio salario?"],
      examples: [
        { company: "SaaS General", text: "Costos de Servidor (AWS), Costos de Personal (Desarrollo, Ventas, Soporte), Marketing digital, Oficinas y Herramientas." },
        { company: "Uber", text: "Pagos a conductores, Seguros, Operaciones locales (City Managers), Desarrollo de software, Publicidad." }
      ]
    },
    {
      id: 6, order: 6, title: "Flujos de Ingreso", color: "bg-emerald-50", iconColor: "text-emerald-500", borderColor: "border-emerald-500",
      icon: <DollarSign size={24} strokeWidth={2.5} />,
      description: "Cómo vas a ganar dinero: suscripciones, pago por uso o márgenes de venta.",
      details: "Define tu modelo de monetización (SaaS, marketplace, e-commerce, freemium). La forma más directa de validar una startup es que alguien te pague.",
      questions: ["¿Cómo prefiere pagar tu cliente?", "¿Cuál es el valor percibido?", "¿Ofreces pagos recurrentes?", "¿Cuál es tu margen de beneficio?"],
      examples: [
        { company: "Airbnb", text: "Tarifa de servicio al huésped (6-12%), Tarifa de servicio al anfitrión (3%)." },
        { company: "Spotify", text: "Suscripciones mensuales Premium y modelo publicitario para usuarios gratuitos." }
      ]
    }
  ];

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  useEffect(() => {
    if (selectedBlockId) {
      setEditorText(canvasData[selectedBlockId] || "");
      setActiveTab('guide');
    }
  }, [selectedBlockId]);

  const handleSaveText = () => {
    if (selectedBlockId) {
      setCanvasData(prev => ({ ...prev, [selectedBlockId]: editorText }));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleClearAll = () => {
    if(window.confirm("¿Estás seguro de que quieres borrar todo el lienzo? Esta acción no se puede deshacer.")) {
      setCanvasData({});
      setEditorText("");
      setSelectedBlockId(null);
    }
  };

  const Block = ({ data, additionalClasses = "" }: { data: any, additionalClasses?: string }) => {
    const isActive = selectedBlockId === data.id;
    const hasContent = !!canvasData[data.id] && canvasData[data.id].trim() !== "";
    
    return (
      <div 
        onClick={() => setSelectedBlockId(data.id)}
        className={`bg-white border-2 rounded-2xl p-4 relative flex flex-col transition-transform duration-200 cursor-pointer 
          ${data.color} 
          ${isActive ? `shadow-[0_10px_15px_-3px_rgba(59,130,246,0.1)] scale-[1.02] z-10 ${data.borderColor}` : 'border-slate-200 hover:scale-[1.02]'} 
          ${additionalClasses}`}
      >
        <span className="absolute top-3 right-3 bg-slate-800 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full no-print">
          {data.order}
        </span>
        
        <div className="flex-none">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${data.iconColor}`}>
             {data.icon}
          </div>
          <h3 className="text-[14px] font-bold text-slate-900 mb-2">{data.title}</h3>
        </div>

        <div className="flex-1 overflow-hidden min-h-[50px]">
          {hasContent ? (
            <div className="text-[12px] text-slate-800 leading-relaxed whitespace-pre-wrap font-medium h-full print:text-[14px]">
              {canvasData[data.id]}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 leading-snug line-clamp-4 italic print:hidden">
              {data.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-6 font-sans text-slate-900 flex justify-center">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-full-width { max-w-none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .bg-white { background: white !important; }
          .border-slate-200 { border-color: #cbd5e1 !important; }
          .print\\:hidden { display: none !important; }
          .print\\:text-\\[14px\\] { font-size: 14px !important; }
          
          /* Simplify background colors for print to save ink but keep layout */
          .bg-red-50, .bg-yellow-50, .bg-purple-50, .bg-blue-50, .bg-green-50, .bg-orange-50, .bg-teal-50, .bg-slate-50, .bg-emerald-50 {
            background-color: transparent !important;
          }
        }
      `}} />
      <div className="w-full max-w-[1024px] flex flex-col gap-5 print-full-width">
        
        {/* Header toolbar */}
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-300 no-print">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight uppercase text-slate-900 m-0">Lean Canvas Pro</h1>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 bg-white border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
             >
                <Trash2 size={16} /> Limpiar
             </button>
             <button 
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-1.5 text-white bg-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors shadow-sm"
             >
                <Printer size={16} /> Exportar
             </button>
          </div>
        </div>

        {/* Print Only Header */}
        <div className="hidden print:block mb-4 text-center">
            <h1 className="text-2xl font-extrabold text-slate-900 uppercase">Lean Canvas</h1>
            <p className="text-sm text-slate-500 border-b pb-4">Generado por Lean Canvas Pro</p>
        </div>

        {/* The Grid / Canvas Layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 md:grid-rows-[180px_180px] print:grid-cols-5 print:grid-rows-[250px_250px] gap-3">
          <Block data={blocks.find(b => b.id === 1)} additionalClasses="md:col-start-1 md:row-span-2 print:col-start-1 print:row-span-2" />
          <Block data={blocks.find(b => b.id === 4)} additionalClasses="md:col-start-2 md:row-start-1 print:col-start-2 print:row-start-1" />
          <Block data={blocks.find(b => b.id === 3)} additionalClasses="md:col-start-3 md:row-span-2 print:col-start-3 print:row-span-2" />
          <Block data={blocks.find(b => b.id === 9)} additionalClasses="md:col-start-4 md:row-start-1 print:col-start-4 print:row-start-1" />
          <Block data={blocks.find(b => b.id === 2)} additionalClasses="md:col-start-5 md:row-span-2 print:col-start-5 print:row-span-2" />
          <Block data={blocks.find(b => b.id === 8)} additionalClasses="md:col-start-2 md:row-start-2 print:col-start-2 print:row-start-2" />
          <Block data={blocks.find(b => b.id === 5)} additionalClasses="md:col-start-4 md:row-start-2 print:col-start-4 print:row-start-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-3 mt-1 md:mt-0 print:mt-1">
          <Block data={blocks.find(b => b.id === 7)} additionalClasses="h-[120px] print:h-[150px]" />
          <Block data={blocks.find(b => b.id === 6)} additionalClasses="h-[120px] print:h-[150px]" />
        </div>

        {/* Editor & Info Panel */}
        <div className="no-print">
          {selectedBlock ? (
            <div className={`mt-2 bg-white border-2 rounded-2xl p-5 md:p-6 flex flex-col lg:flex-row gap-6 lg:gap-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] animate-in fade-in duration-300 flex-grow ${selectedBlock.borderColor}`}>
              
              {/* Left Side: Context & Guide */}
              <div className="flex-1 lg:max-w-[40%] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedBlock.color} ${selectedBlock.iconColor}`}>
                      {selectedBlock.icon}
                    </div>
                    <div>
                      <h2 className="text-[20px] font-extrabold text-slate-900 leading-none">
                        {selectedBlock.title}
                      </h2>
                      <div className="text-[12px] uppercase tracking-[1px] text-slate-500 font-bold mt-1">
                        Paso {selectedBlock.order}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 rounded-lg p-1 mb-4">
                  <button 
                    onClick={() => setActiveTab('guide')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'guide' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <BookOpen size={16} /> Guía
                  </button>
                  <button 
                    onClick={() => setActiveTab('examples')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'examples' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <MessageSquare size={16} /> Ejemplos
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {activeTab === 'guide' && (
                    <div className="animate-in slide-in-from-left-2 duration-200">
                      <p className="text-[14px] leading-[1.6] text-slate-700 mb-5">
                        {selectedBlock.details}
                      </p>
                      
                      <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                        Hazte estas preguntas
                      </h4>
                      <div className="flex flex-col gap-2">
                        {selectedBlock.questions.map((q: string, idx: number) => (
                          <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[13px] text-slate-700 flex items-start gap-2">
                            <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${selectedBlock.color.replace('50', '500')}`}></div>
                            {q}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'examples' && (
                    <div className="animate-in slide-in-from-right-2 duration-200 flex flex-col gap-4">
                      {selectedBlock.examples.map((ex, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                           <div className="font-bold text-slate-900 text-sm mb-2">{ex.company}</div>
                           <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">{ex.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Vertical Divider */}
              <div className="hidden lg:block w-px bg-slate-200"></div>
              <div className="block lg:hidden h-px bg-slate-200 my-2"></div>
              
              {/* Right Side: Editor */}
              <div className="flex-[1.5] flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="editorCanvas" className="text-[14px] font-bold text-slate-800 uppercase tracking-widest">
                    Tu Hipótesis
                  </label>
                  {isSaved && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full animate-in fade-in zoom-in duration-300">
                      <CheckCircle2 size={14} /> Guardado
                    </span>
                  )}
                </div>
                
                <textarea
                  id="editorCanvas"
                  className={`w-full flex-1 min-h-[250px] p-4 bg-slate-50 border-2 rounded-xl text-[14px] text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-4 transition-all resize-none shadow-inner placeholder-slate-400
                    ${selectedBlock.borderColor} focus:ring-${selectedBlock.color.replace('bg-', '').replace('-50', '')}-100`}
                  placeholder="Escribe aquí tus ideas. Usa guiones (-) o números para listar.&#10;&#10;Por ejemplo:&#10;1. Cliente no encuentra rápido X.&#10;2. El costo de Y es muy alto."
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                />

                <div className="mt-4 flex justify-end gap-3">
                  <button 
                    onClick={() => {
                      setEditorText(canvasData[selectedBlockId] || "");
                    }}
                    disabled={editorText === (canvasData[selectedBlockId] || "")}
                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Descartar
                  </button>
                  <button 
                    onClick={handleSaveText}
                    className={`flex items-center gap-2 px-6 py-2 text-sm font-bold text-white rounded-lg transition-all shadow-md hover:shadow-lg
                      ${selectedBlock.borderColor.replace('border-', 'bg-')} hover:brightness-110`}
                  >
                    <Save size={16} /> Guardar Bloque
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="mt-2 bg-white border-2 border-slate-200 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-slate-400 flex-grow min-h-[200px]">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200 text-slate-300">
                <Rocket size={32} />
              </div>
              <p className="text-lg font-medium text-slate-500 mb-2">Comienza tu validación</p>
              <p className="text-sm">Selecciona un bloque en el lienzo superior para editar su contenido.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LeanCanvasApp;

