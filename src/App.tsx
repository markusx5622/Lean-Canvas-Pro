import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, AlertCircle, Lightbulb, Rocket, TrendingUp, Share2, ShieldCheck, DollarSign, CreditCard,
  Printer, Trash2, MessageSquare, BookOpen, CheckCircle2, Download, Upload, Plus, Edit2, FolderOpen
} from 'lucide-react';

// === Tipos & utilidades ===
interface CanvasData {
  [blockId: number]: string;
}

interface Project {
  id: string;
  name: string;
  lastModified: number;
  data: CanvasData;
}

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

// === Datos Estáticos de los Bloques ===
const BLOCKS = [
  {
    id: 1, order: 1, title: "Problema", color: "from-rose-50 to-white", iconColor: "text-rose-500", ringColor: "ring-rose-500/50",
    icon: <AlertCircle size={22} strokeWidth={2.5} />,
    description: "Identifica los 3 problemas principales. Sin un problema real, no hay negocio.",
    details: "Sin un problema real, no hay negocio. Aquí también incluyes 'Alternativas existentes' (cómo resuelven el problema hoy).",
    questions: ["¿Qué duele más a tu cliente hoy?", "¿Cómo lo solucionan ahora sin tu ayuda?", "¿Cuánto gastan en resolverlo?", "¿Con qué frecuencia ocurre el problema?"],
    examples: [
      { company: "Airbnb", text: "1. Los hoteles son caros y carecen de autenticidad local.\n2. Los anfitriones no tienen forma fácil de alquilar sus espacios libres.\n3. Interfaz de reserva compleja." },
      { company: "Uber", text: "1. Conseguir taxi es difícil y frustrante.\n2. No saber cuánto va a costar ni cuándo llegará.\n3. Coches de mala calidad y sin opciones de pago." }
    ]
  },
  {
    id: 4, order: 4, title: "Solución", color: "from-amber-50 to-white", iconColor: "text-amber-500", ringColor: "ring-amber-500/50",
    icon: <Lightbulb size={22} strokeWidth={2.5} />,
    description: "Define las características clave que resuelven los problemas principales.",
    details: "No intentes construir todo a la vez. Enfócate en las 3 funciones principales.",
    questions: ["¿Es esta la forma más simple de resolverlo?", "¿Puedes construirlo rápidamente?", "¿Requiere mucho esfuerzo del cliente?"],
    examples: [
      { company: "Uber", text: "App móvil para solicitar viajes con 1 clic. Rastreo por GPS, estimación de tarifa anticipada y pago automático." }
    ]
  },
  {
    id: 3, order: 3, title: "Propuesta Única", color: "from-violet-50 to-white", iconColor: "text-violet-500", ringColor: "ring-violet-500/50",
    icon: <Rocket size={22} strokeWidth={2.5} />,
    description: "Mensaje claro: qué haces y por qué eres diferente. El corazón del lienzo.",
    details: "Debe ser un mensaje de alto nivel que condense el valor. Describe beneficios tangibles, no funciones.",
    questions: ["¿Cómo resumirías tu valor en un tuit...", "¿Qué te hace diferente?", "¿Por qué pagarían por esto hoy?"],
    examples: [
      { company: "Airbnb", text: "Reserva casas de personas locales, en lugar de hoteles. Siéntete como en casa en cualquier lugar del mundo." }
    ]
  },
  {
    id: 9, order: 9, title: "Ventaja Injusta", color: "from-blue-50 to-white", iconColor: "text-blue-500", ringColor: "ring-blue-500/50",
    icon: <ShieldCheck size={22} strokeWidth={2.5} />,
    description: "Algo que no se puede copiar o comprar fácilmente por la competencia.",
    details: "Puede ser un equipo de expertos, patentes, una comunidad exclusiva o datos únicos que solo tú posees.",
    questions: ["¿Tienes información exclusiva?", "¿Tu comunidad es un foso defensivo?", "¿Tienes canales preferentes?"],
    examples: [
      { company: "Google", text: "Algoritmo de búsqueda PageRank. Infraestructura de datos gigantesca y marca genérica ('googlearlo')." }
    ]
  },
  {
    id: 2, order: 2, title: "Segmentos", color: "from-emerald-50 to-white", iconColor: "text-emerald-500", ringColor: "ring-emerald-500/50",
    icon: <Users size={22} strokeWidth={2.5} />,
    description: "¿Quiénes son tus clientes? Identifica a tus Early Adopters iniciales.",
    details: "Los 'Early Adopters' son los que necesitan tu solución ahora mismo, aunque no sea perfecta. Encuéntralos primero.",
    questions: ["¿Quién pagaría por esto hoy mismo?", "¿Cómo es el perfil demográfico?", "¿Hay un nicho más accesible?"],
    examples: [
      { company: "Uber", text: "Profesionales urbanos que necesitan ir de punto A a punto B de forma fiable." }
    ]
  },
  {
    id: 8, order: 8, title: "Métricas Clave", color: "from-orange-50 to-white", iconColor: "text-orange-500", ringColor: "ring-orange-500/50",
    icon: <TrendingUp size={22} strokeWidth={2.5} />,
    description: "Los números críticos que indican si el negocio está realmente funcionando.",
    details: "Elige métricas procesables como el CAC, LTV o tasas de retención.",
    questions: ["¿Qué dato define el éxito?", "¿Estás midiendo la retención?", "¿Cuál es el costo de adquisición?"],
    examples: [
      { company: "SaaS General", text: "MRR, Costo de Adquisición (CAC), Tasa de abandono (Churn rate) y Lifetime Value (LTV)." }
    ]
  },
  {
    id: 5, order: 5, title: "Canales", color: "from-teal-50 to-white", iconColor: "text-teal-500", ringColor: "ring-teal-500/50",
    icon: <Share2 size={22} strokeWidth={2.5} />,
    description: "Tu ruta al mercado. Cómo vas a captar y retener a tus clientes.",
    details: "Define tu estrategia de adquisición y distribución: inbound, outbound, o partners.",
    questions: ["¿Dónde buscan soluciones hoy?", "¿Cómo te descubrirán por primera vez?", "¿Es escalable a largo plazo?"],
    examples: [
      { company: "Netflix", text: "Directo, Apps integradas en Smart TVs, Alianzas con proveedores de internet." }
    ]
  },
  {
    id: 7, order: 7, title: "Costes", color: "from-slate-100 to-white", iconColor: "text-slate-600", ringColor: "ring-slate-500/50",
    icon: <CreditCard size={22} strokeWidth={2.5} />,
    description: "Tus gastos principales para operar: servidores, marketing, salarios, etc.",
    details: "Clasifica en costos fijos y variables para calcular el punto de equilibrio.",
    questions: ["¿Cuál es el burn-rate mensual?", "¿Qué costo puedes reducir hoy?", "¿Cuál es el costo de desarrollo?"],
    examples: [
      { company: "Uber", text: "Pagos a conductores, Seguros, Operaciones locales (City Managers), Desarrollo de software, Publicidad." }
    ]
  },
  {
    id: 6, order: 6, title: "Flujo de Ingresos", color: "from-cyan-50 to-white", iconColor: "text-cyan-500", ringColor: "ring-cyan-500/50",
    icon: <DollarSign size={22} strokeWidth={2.5} />,
    description: "Cómo vas a ganar dinero: suscripciones, pago por uso o márgenes de venta.",
    details: "Define tu modelo de monetización. La forma más directa de validar una startup es lograr que alguien pague.",
    questions: ["¿Cómo prefiere pagar tu cliente?", "¿Ofreces pagos recurrentes?", "¿Cuál es tu margen de beneficio?"],
    examples: [
      { company: "Spotify", text: "Suscripciones mensuales Premium y modelo publicitario para usuarios gratuitos." }
    ]
  }
];

const LeanCanvasApp = () => {
  const defaultProjectId = `project-${Date.now()}`;
  const [projects, setProjects] = useLocalStorage<Project[]>('lean-canvas-pro-projects', [{
    id: defaultProjectId,
    name: 'Mi Primer Canvas',
    lastModified: Date.now(),
    data: {}
  }]);
  
  const [activeProjectId, setActiveProjectId] = useLocalStorage<string>('lean-canvas-pro-active', defaultProjectId);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'guide' | 'examples'>('guide');
  const [editorText, setEditorText] = useState("");
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const canvasData = activeProject?.data || {};

  const filledBlocks = Object.values(canvasData).filter(val => typeof val === 'string' && val.trim().length > 0).length;
  const progressPercentage = Math.round((filledBlocks / 9) * 100);

  useEffect(() => {
    if (selectedBlockId) {
      setEditorText(canvasData[selectedBlockId] || "");
      setActiveTab('guide');
      setSaveStatus('idle');
    }
  }, [selectedBlockId, activeProjectId]);

  useEffect(() => {
    if (!selectedBlockId) return;
    const currentData = canvasData[selectedBlockId] || "";
    if (editorText === currentData) return;

    setSaveStatus('saving');
    const timerId = setTimeout(() => {
      setProjects(prev => prev.map(p => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            lastModified: Date.now(),
            data: { ...p.data, [selectedBlockId]: editorText }
          };
        }
        return p;
      }));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600);

    return () => clearTimeout(timerId);
  }, [editorText, selectedBlockId, activeProjectId]);

  // == Funciones de Gestión ==
  const handleCreateProject = () => {
    const newId = `project-${Date.now()}`;
    setProjects(prev => [...prev, { id: newId, name: `Lienzo ${prev.length + 1}`, lastModified: Date.now(), data: {} }]);
    setActiveProjectId(newId);
    setSelectedBlockId(null);
  };

  const handleRenameProject = () => {
    const newName = window.prompt("Nombre del proyecto:", activeProject.name);
    if (newName && newName.trim()) {
      setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, name: newName.trim(), lastModified: Date.now() } : p));
    }
  };

  const handleDeleteProject = () => {
    if (projects.length <= 1) {
      alert("No puedes borrar tu único lienzo."); return;
    }
    if (window.confirm(`¿Eliminar '${activeProject.name}'?`)) {
      const filtered = projects.filter(p => p.id !== activeProjectId);
      setProjects(filtered);
      setActiveProjectId(filtered[0].id);
      setSelectedBlockId(null);
    }
  };

  const handleClearCanvas = () => {
    if (window.confirm("¿Seguro que quieres borrar este lienzo? Se perderá todo el texto actual.")) {
      setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, data: {}, lastModified: Date.now() } : p));
      if (selectedBlockId) setEditorText("");
    }
  };

  const handleExportJson = () => {
    if (!activeProject) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeProject, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `canvas-${activeProject.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData && typeof importedData === 'object' && importedData.data) {
          const newId = `project-${Date.now()}`;
          setProjects(prev => [...prev, { id: newId, name: `${importedData.name || 'Importado'}`, lastModified: Date.now(), data: importedData.data }]);
          setActiveProjectId(newId);
          setSelectedBlockId(null);
        }
      } catch (err) { alert("Error al leer el archivo JSON."); }
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  // == Ui Block Component ==
  const Block = ({ data, additionalClasses = "", index }: { data: any, additionalClasses?: string, index: number }) => {
    const isActive = selectedBlockId === data.id;
    const hasContent = !!canvasData[data.id] && canvasData[data.id].trim() !== "";
    
    return (
      <motion.div 
        layoutId={`block-${data.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
        whileHover={!isActive ? { y: -2, scale: 1.01 } : {}}
        onClick={() => setSelectedBlockId(data.id)}
        className={`relative flex flex-col cursor-pointer overflow-hidden rounded-[20px] transition-all duration-300
          ${isActive 
            ? `bg-white shadow-[0_15px_40px_-5px_rgba(0,0,0,0.12)] ring-2 ring-offset-2 ${data.ringColor} z-20` 
            : 'bg-white shadow-[0_4px_16px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80'
          } ${additionalClasses}`}
      >
        <div className={`absolute top-0 left-0 w-48 h-48 bg-gradient-to-br ${data.color} opacity-60 rounded-full blur-3xl -translate-x-12 -translate-y-12 pointer-events-none no-print border-none transition-all duration-500`} />

        <div className="p-5 relative h-full flex flex-col z-10 w-full">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100 ${data.iconColor}`}>
               {data.icon}
            </div>
            <span className="bg-slate-100/80 text-slate-400 font-bold text-[10px] w-6 h-6 flex items-center justify-center rounded-full no-print border border-slate-200/50 shadow-inner">
              {data.order}
            </span>
          </div>

          <h3 className="font-display text-[16px] font-extrabold text-slate-900 tracking-tight mb-2.5">{data.title}</h3>

          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {hasContent ? (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap font-medium h-full pr-1"
                >
                  {canvasData[data.id]}
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="group h-full flex flex-col relative"
                >
                  <p className="text-[12.5px] text-slate-400 leading-snug line-clamp-4 group-hover:opacity-0 transition-opacity duration-300 print:hidden font-medium">
                    {data.description}
                  </p>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 no-print">
                     <span className="flex items-center gap-1.5 bg-slate-900 text-white shadow-lg py-1.5 px-3.5 rounded-full text-[11px] font-bold tracking-wide transition-transform group-hover:scale-105 duration-300">
                        <Edit2 size={12} strokeWidth={2.5} /> Escribir
                     </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  };

  const selectedBlock = BLOCKS.find(b => b.id === selectedBlockId);

  return (
    <div className="min-h-screen bg-[#F4F5F8] font-sans text-slate-900 flex justify-center pb-16 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-500">
      <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportJson} />

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-full-width { max-width: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .ring-2 { box-shadow: none !important; border: 1px solid #cbd5e1 !important; }
          .shadow-sm, .shadow-lg, .shadow-xl { box-shadow: none !important; border: 1px solid #cbd5e1 !important; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}} />

      <div className="w-full max-w-[1360px] px-4 md:px-8 py-5 flex flex-col gap-6 print-full-width relative">
        
        {/* === TOP TOOLBAR === */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }} autoFocus animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white/90 backdrop-blur-xl border text-sm border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-[20px] p-3 px-5 flex flex-col md:flex-row items-center justify-between gap-4 no-print sticky top-4 z-[100]"
        >
          {/* Logo & Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-slate-900 text-white p-2 rounded-[14px] shadow-sm shrink-0 relative overflow-hidden">
               <Rocket size={18} strokeWidth={2.5} className="relative z-10" />
            </div>
            <div className="flex flex-col relative w-full group">
               <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-[2px] ml-[5px]">
                 Workspace
               </div>
               <div className="flex items-center gap-1 bg-transparent hover:bg-slate-50 rounded-xl p-0.5 transition-all border border-transparent hover:border-slate-200/80">
                 <select 
                   value={activeProjectId} 
                   onChange={(e) => { setActiveProjectId(e.target.value); setSelectedBlockId(null); }}
                   className="font-display appearance-none bg-transparent text-slate-800 font-extrabold text-[15px] py-1 pl-2 pr-8 focus:outline-none min-w-[180px] cursor-pointer tracking-tight"
                 >
                   {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
                 <div className="pointer-events-none absolute left-[175px] top-[18px] text-slate-400 transition-colors group-hover:text-slate-600">
                    <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
                 <button onClick={handleRenameProject} className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent hover:border-slate-200"><Edit2 size={13} strokeWidth={2.5} /></button>
                 <button onClick={handleDeleteProject} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent hover:border-slate-200"><Trash2 size={13} strokeWidth={2.5} /></button>
               </div>
            </div>
            
            <div className="h-8 w-px bg-slate-200/60 mx-1 hidden lg:block"></div>
            
            <button onClick={handleCreateProject} className="hidden lg:flex items-center gap-2 px-3 py-[7px] bg-slate-50 text-slate-700 font-bold rounded-[10px] hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap text-[13px] tracking-tight border border-slate-200/80 shadow-sm">
               <Plus size={15} strokeWidth={2.5} /> Nuevo
            </button>
          </div>

          {/* Progreso del Lienzo */}
          <div className="hidden md:flex flex-col items-center flex-1 max-w-[280px]">
            <div className="flex w-full justify-between mb-[6px] text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              <span>Validación de la Startup</span>
              <span className={progressPercentage === 100 ? 'text-emerald-500' : 'text-slate-800'}>{progressPercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full ${progressPercentage === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgb(16,185,129,0.5)]' : 'bg-slate-900'}`} 
              />
            </div>
          </div>

          {/* Acciones Globales */}
          <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
            <button title="Exportar JSON" onClick={handleExportJson} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors border border-transparent">
              <Download size={18} strokeWidth={2.5} />
            </button>
            <button title="Importar JSON" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors border border-transparent">
              <Upload size={18} strokeWidth={2.5} />
            </button>
            <div className="h-6 w-px bg-slate-200/60 mx-1"></div>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-[7px] bg-indigo-600 text-white font-bold rounded-[10px] hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap text-[13px] tracking-tight">
              <Printer size={15} strokeWidth={2.5} /> <span className="hidden sm:inline">Exportar PDF</span>
            </button>
          </div>
        </motion.div>

        <div className="hidden print:block mb-6 text-center border-b pb-4 mt-6">
            <h1 className="font-display text-4xl font-extrabold text-slate-900 uppercase tracking-widest mb-2">{activeProject.name}</h1>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Lienzo Lean Startups</p>
        </div>

        {/* === MAIN LAYOUT === */}
        <div className="flex flex-col lg:flex-row gap-5 items-stretch relative md:px-2 pt-2">
          
          {/* El Lienzo (10 Columns Perfect Harmony) */}
          <div className="flex-[1.5] xl:flex-[2] w-full flex flex-col gap-5">
            
            <div className="grid grid-cols-1 md:grid-cols-10 md:grid-rows-[minmax(190px,auto)_minmax(190px,auto)] print:grid-cols-10 print:grid-rows-[250px_250px] gap-5">
              <Block index={0} data={BLOCKS.find(b => b.id === 1)} additionalClasses="md:col-span-2 md:row-span-2 print:col-span-2 print:row-span-2" />
              <Block index={1} data={BLOCKS.find(b => b.id === 4)} additionalClasses="md:col-span-2 md:col-start-3 md:row-start-1 print:col-span-2 print:col-start-3 print:row-start-1" />
              <Block index={2} data={BLOCKS.find(b => b.id === 8)} additionalClasses="md:col-span-2 md:col-start-3 md:row-start-2 print:col-span-2 print:col-start-3 print:row-start-2" />
              <Block index={3} data={BLOCKS.find(b => b.id === 3)} additionalClasses="md:col-span-2 md:col-start-5 md:row-span-2 print:col-span-2 print:col-start-5 print:row-span-2" />
              <Block index={4} data={BLOCKS.find(b => b.id === 9)} additionalClasses="md:col-span-2 md:col-start-7 md:row-start-1 print:col-span-2 print:col-start-7 print:row-start-1" />
              <Block index={5} data={BLOCKS.find(b => b.id === 5)} additionalClasses="md:col-span-2 md:col-start-7 md:row-start-2 print:col-span-2 print:col-start-7 print:row-start-2" />
              <Block index={6} data={BLOCKS.find(b => b.id === 2)} additionalClasses="md:col-span-2 md:col-start-9 md:row-span-2 print:col-span-2 print:col-start-9 print:row-span-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-10 print:grid-cols-10 gap-5">
              <Block index={7} data={BLOCKS.find(b => b.id === 7)} additionalClasses="md:col-span-5 md:h-[160px] print:h-[150px]" />
              <Block index={8} data={BLOCKS.find(b => b.id === 6)} additionalClasses="md:col-span-5 md:h-[160px] print:h-[150px]" />
            </div>

          </div>

          {/* Panel Lateral Animado del Editor (Desktop) */}
          <div className="no-print lg:w-[440px] shrink-0 sticky top-[100px] h-[calc(100vh-130px)] hidden md:block overflow-hidden relative rounded-[28px]">
            <AnimatePresence mode="wait">
              {selectedBlock ? (
                <motion.div 
                  key="editor"
                  initial={{ opacity: 0, x: 200, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 200, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="bg-white border rounded-[28px] border-slate-200/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] p-7 flex flex-col h-full w-full relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${selectedBlock.color}`}></div>

                  <div className="flex items-start gap-4 mb-6 shrink-0 pt-2">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${selectedBlock.color} ${selectedBlock.iconColor} shadow-inner border border-stone-50 relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white opacity-40 blur-md rounded-full scale-150"></div>
                      <div className="relative z-10">{selectedBlock.icon}</div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="text-[10px] uppercase tracking-[2px] text-slate-400 font-extrabold mb-1">
                        BLOQUE 0{selectedBlock.order}
                      </div>
                      <h2 className="font-display text-[26px] font-extrabold text-slate-900 leading-tight tracking-tight">
                        {selectedBlock.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex bg-slate-50 p-1.5 rounded-xl mb-6 shrink-0 border border-slate-200/60 shadow-inner">
                    <button onClick={() => setActiveTab('guide')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold rounded-lg transition-all duration-300 ${activeTab === 'guide' ? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.04)]' : 'text-slate-500 hover:text-slate-700'}`}> 
                      <BookOpen size={16} strokeWidth={2.5} /> Guía
                    </button>
                    <button onClick={() => setActiveTab('examples')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold rounded-lg transition-all duration-300 ${activeTab === 'examples' ? 'bg-white text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.04)]' : 'text-slate-500 hover:text-slate-700'}`}> 
                      <MessageSquare size={16} strokeWidth={2.5} /> Ejemplos
                    </button>
                  </div>

                  <div className="mb-6 overflow-y-auto shrink-0 max-h-[170px] custom-scrollbar pr-3">
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                        className="text-[13px]"
                      >
                        {activeTab === 'guide' && (
                          <>
                            <p className="text-slate-600 mb-5 font-medium leading-relaxed">{selectedBlock.details}</p>
                            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Preguntas clave</h4>
                            <ul className="flex flex-col gap-2.5">
                              {selectedBlock.questions.map((q, idx) => (
                                <li key={idx} className="text-slate-700 flex items-start gap-2.5 font-medium">
                                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-slate-300`} /> {q}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        {activeTab === 'examples' && (
                          <div className="flex flex-col gap-3">
                            {selectedBlock.examples.map((ex, idx) => (
                              <div key={idx} className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 shadow-sm">
                                 <div className="font-extrabold text-slate-900 text-[11px] mb-2 flex items-center gap-1.5 tracking-wider uppercase">
                                   <Rocket size={14} className="text-slate-400" /> CASO DE ÉXITO: {ex.company}
                                 </div>
                                 <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{ex.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Redacción */}
                  <div className="flex flex-col flex-1 relative border-t border-slate-100 pt-6 mt-auto">
                    <div className="flex justify-between items-center mb-3 shrink-0">
                      <label htmlFor="editorCanvas" className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        Tus notas estratégicas
                      </label>
                      <div className="h-5 flex items-center justify-end">
                        {saveStatus === 'saving' && <span className="text-[10px] font-bold text-slate-400 animate-pulse uppercase tracking-wider">Guardando...</span>}
                        {saveStatus === 'saved' && <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100"><CheckCircle2 size={12} strokeWidth={2.5}/> Listo</span>}
                      </div>
                    </div>
                    
                    <textarea
                      id="editorCanvas"
                      className={`flex-1 w-full p-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-[14px] font-medium text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${selectedBlock.ringColor} focus:border-transparent transition-all resize-none placeholder-slate-400 shadow-inner`}
                      placeholder="Escribe tus ideas aquí...&#10;Se validarán automáticamente."
                      value={editorText}
                      onChange={(e) => setEditorText(e.target.value)}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full bg-white/60 backdrop-blur-xl border-2 border-slate-200 border-dashed rounded-[28px] p-10 flex flex-col items-center justify-center text-center text-slate-400 transition-all duration-300 hover:border-slate-300 relative overflow-hidden"
                >
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex flex-col items-center z-10"
                  >
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                      <FolderOpen size={36} strokeWidth={2.5} className="text-slate-300" />
                    </div>
                    <h3 className="font-display text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">Focus Mode</h3>
                    <p className="text-[14px] max-w-[280px] leading-relaxed font-medium text-slate-500">
                      Haz clic en cualquier bloque a tu izquierda para descubrir guías, ver referencias y redactar tus hipótesis.
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Panel Modal Editor para Mobile */}
        <AnimatePresence>
          {selectedBlockId && selectedBlock && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex flex-col justify-end no-print cursor-pointer" 
              onClick={() => setSelectedBlockId(null)}
            >
                <motion.div 
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="bg-white rounded-t-[32px] h-[85vh] w-full flex flex-col shadow-2xl p-6 cursor-auto relative" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full mb-4"></div>
                  
                  <div className="mt-5 flex items-center gap-4 mb-6 shrink-0">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${selectedBlock.color} ${selectedBlock.iconColor} shadow-inner border border-white`}>
                        {selectedBlock.icon}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[1.5px] text-slate-400 font-extrabold mb-0.5">
                          BLOQUE 0{selectedBlock.order}
                        </div>
                        <h2 className="font-display text-[22px] font-extrabold text-slate-900 leading-none tracking-tight">
                          {selectedBlock.title}
                        </h2>
                      </div>
                  </div>

                  <textarea
                      className={`flex-1 w-full p-4 mb-5 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${selectedBlock.ringColor} resize-none shadow-inner`}
                      placeholder="Escribe tus ideas..."
                      value={editorText}
                      onChange={(e) => setEditorText(e.target.value)}
                    />

                    <button 
                      onClick={() => setSelectedBlockId(null)}
                      className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl active:scale-95 transition-all text-[15px] flex items-center justify-center gap-2 shadow-lg tracking-tight"
                    >
                      <CheckCircle2 size={20} strokeWidth={2.5} /> Guardar y Cerrar
                    </button>
                </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default LeanCanvasApp;
