import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  Users, AlertCircle, Lightbulb, Rocket, TrendingUp, Share2, ShieldCheck, DollarSign, CreditCard,
  Printer, Trash2, MessageSquare, BookOpen, CheckCircle2, Download, Upload, Plus, Edit2, FolderOpen, Sun, Moon,
  Sparkles, Loader2, Bot, Info, Code, Linkedin
} from 'lucide-react';
import { ParticleBackground } from './ParticleBackground';

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
    id: 1, order: 1, title: "Problema", color: "from-rose-50 to-white dark:from-rose-950/30 dark:to-slate-900", iconColor: "text-rose-500 dark:text-rose-400", ringColor: "ring-rose-500/50 dark:ring-rose-500/40",
    icon: <AlertCircle size={22} strokeWidth={2.5} />,
    description: "Identifica los 3 problemas principales. Sin un problema real, no hay negocio.",
    details: "Sin un problema real, no hay negocio. Aquí también incluyes 'Alternativas existentes' (cómo resuelven el problema hoy).",
    questions: ["¿Qué duele más a tu cliente hoy?", "¿Cómo lo solucionan ahora sin tu ayuda?", "¿Cuánto gastan en resolverlo?", "¿Con qué frecuencia ocurre el problema?"],
    examples: [
      { company: "Cabify", text: "1. Conseguir taxi u VTC de forma rápida y segura.\n2. Evitar sorpresas en la tarifa final.\n3. Pagos automatizados y servicio corporativo para empresas." },
      { company: "Wallapop", text: "1. Vender cosas usadas es un proceso complejo y da poca confianza.\n2. Comprar artículos de segunda mano cerca de ti no es fácil ni inmediato." }
    ]
  },
  {
    id: 4, order: 4, title: "Solución", color: "from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900", iconColor: "text-amber-500 dark:text-amber-400", ringColor: "ring-amber-500/50 dark:ring-amber-500/40",
    icon: <Lightbulb size={22} strokeWidth={2.5} />,
    description: "Define las características clave que resuelven los problemas principales.",
    details: "No intentes construir todo a la vez. Enfócate en las 3 funciones principales.",
    questions: ["¿Es esta la forma más simple de resolverlo?", "¿Puedes construirlo rápidamente?", "¿Requiere mucho esfuerzo del cliente?"],
    examples: [
      { company: "Glovo", text: "App móvil para pedir cualquier cosa recadera en tu ciudad en menos de 30 min. Sistema de riders autónomos y geolocalización en tiempo real." }
    ]
  },
  {
    id: 3, order: 3, title: "Propuesta Única", color: "from-violet-50 to-white dark:from-violet-950/30 dark:to-slate-900", iconColor: "text-violet-500 dark:text-violet-400", ringColor: "ring-violet-500/50 dark:ring-violet-500/40",
    icon: <Rocket size={22} strokeWidth={2.5} />,
    description: "Mensaje claro: qué haces y por qué eres diferente. El corazón del lienzo.",
    details: "Debe ser un mensaje de alto nivel que condense el valor. Describe beneficios tangibles, no funciones.",
    questions: ["¿Cómo resumirías tu valor en un tuit...", "¿Qué te hace diferente?", "¿Por qué pagarían por esto hoy?"],
    examples: [
      { company: "Mercadona", text: "'Siempre Precios Bajos' (SPB). Calidad altísima en marca blanca (Hacendado) sin depender de ofertas temporales o cupones." }
    ]
  },
  {
    id: 9, order: 9, title: "Ventaja Injusta", color: "from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900", iconColor: "text-blue-500 dark:text-blue-400", ringColor: "ring-blue-500/50 dark:ring-blue-500/40",
    icon: <ShieldCheck size={22} strokeWidth={2.5} />,
    description: "Algo que no se puede copiar o comprar fácilmente por la competencia.",
    details: "Puede ser un equipo de expertos, patentes, una comunidad exclusiva o datos únicos que solo tú posees.",
    questions: ["¿Tienes información exclusiva?", "¿Tu comunidad es un foso defensivo?", "¿Tienes canales preferentes?"],
    examples: [
      { company: "Hawkers", text: "Comunidad inicial masiva en redes sociales y modelo de influencers de micro-nichos que abarató su CAC frente a gigantes." }
    ]
  },
  {
    id: 2, order: 2, title: "Segmentos", color: "from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900", iconColor: "text-emerald-500 dark:text-emerald-400", ringColor: "ring-emerald-500/50 dark:ring-emerald-500/40",
    icon: <Users size={22} strokeWidth={2.5} />,
    description: "¿Quiénes son tus clientes? Identifica a tus Early Adopters iniciales.",
    details: "Los 'Early Adopters' son los que necesitan tu solución ahora mismo, aunque no sea perfecta. Encuéntralos primero.",
    questions: ["¿Quién pagaría por esto hoy mismo?", "¿Cómo es el perfil demográfico?", "¿Hay un nicho más accesible?"],
    examples: [
      { company: "Typeform", text: "Diseñadores web y marketers que querían formularios hermosos y conversacionales que no parecieran una base de datos." }
    ]
  },
  {
    id: 8, order: 8, title: "Métricas Clave", color: "from-orange-50 to-white dark:from-orange-950/30 dark:to-slate-900", iconColor: "text-orange-500 dark:text-orange-400", ringColor: "ring-orange-500/50 dark:ring-orange-500/40",
    icon: <TrendingUp size={22} strokeWidth={2.5} />,
    description: "Los números críticos que indican si el negocio está realmente funcionando.",
    details: "Elige métricas procesables como el CAC, LTV o tasas de retención.",
    questions: ["¿Qué dato define el éxito?", "¿Estás midiendo la retención?", "¿Cuál es el costo de adquisición?"],
    examples: [
      { company: "Holded", text: "Ingresos Recurrentes (MRR), Costo de Adquisición de un PYME/Autónomo (CAC) y Lifetime Value (LTV)." }
    ]
  },
  {
    id: 5, order: 5, title: "Canales", color: "from-teal-50 to-white dark:from-teal-950/30 dark:to-slate-900", iconColor: "text-teal-500 dark:text-teal-400", ringColor: "ring-teal-500/50 dark:ring-teal-500/40",
    icon: <Share2 size={22} strokeWidth={2.5} />,
    description: "Tu ruta al mercado. Cómo vas a captar y retener a tus clientes.",
    details: "Define tu estrategia de adquisición y distribución: inbound, outbound, o partners.",
    questions: ["¿Dónde buscan soluciones hoy?", "¿Cómo te descubrirán por primera vez?", "¿Es escalable a largo plazo?"],
    examples: [
      { company: "Idealista", text: "SEO orgánico dominando palabras clave inmobiliarias locales, campañas masivas offline (TV/Metro) para construir marca de confianza." }
    ]
  },
  {
    id: 7, order: 7, title: "Costes", color: "from-slate-100 to-white dark:from-slate-800/50 dark:to-slate-900", iconColor: "text-slate-600 dark:text-slate-400", ringColor: "ring-slate-500/50 dark:ring-slate-500/40",
    icon: <CreditCard size={22} strokeWidth={2.5} />,
    description: "Tus gastos principales para operar: servidores, marketing, salarios, etc.",
    details: "Clasifica en costos fijos y variables para calcular el punto de equilibrio.",
    questions: ["¿Cuál es el burn-rate mensual?", "¿Qué costo puedes reducir hoy?", "¿Cuál es el costo de desarrollo?"],
    examples: [
      { company: "Cabify", text: "Marketing y captación, salarios del equipo tech/operaciones, infraestructura cloud y seguros de responsabilidad civil." }
    ]
  },
  {
    id: 6, order: 6, title: "Flujo de Ingresos", color: "from-cyan-50 to-white dark:from-cyan-950/30 dark:to-slate-900", iconColor: "text-cyan-500 dark:text-cyan-400", ringColor: "ring-cyan-500/50 dark:ring-cyan-500/40",
    icon: <DollarSign size={22} strokeWidth={2.5} />,
    description: "Cómo vas a ganar dinero: suscripciones, pago por uso o márgenes de venta.",
    details: "Define tu modelo de monetización. La forma más directa de validar una startup es lograr que alguien pague.",
    questions: ["¿Cómo prefiere pagar tu cliente?", "¿Ofreces pagos recurrentes?", "¿Cuál es tu margen de beneficio?"],
    examples: [
      { company: "Flywire", text: "Modelo híbrido B2B2C: Tasa de transacción por transferencia internacional (ganancia de Forex) + fee directo a instituciones." }
    ]
  }
];

// == Ui Block Component ==
const Block = ({ data, additionalClasses = "", index, isActive, hasContent, canvasDataValue, onClick }: { data: any, additionalClasses?: string, index: number, isActive: boolean, hasContent: boolean, canvasDataValue: string, onClick: () => void }) => {
  return (
    <motion.div 
      layoutId={`block-${data.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={!isActive ? { y: -2, scale: 1.01 } : {}}
      onClick={onClick}
      className={`relative flex flex-col cursor-pointer overflow-hidden rounded-[20px] transition-all duration-300
        ${isActive 
          ? `bg-white dark:bg-slate-800 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_40px_-5px_rgba(0,0,0,0.4)] ring-2 ring-offset-2 dark:ring-offset-slate-900 ${data.ringColor} z-20` 
          : 'bg-white dark:bg-slate-800 shadow-[0_4px_16px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-slate-200/80 dark:border-slate-700'
        } ${additionalClasses}`}
    >
      <div className={`absolute top-0 left-0 w-48 h-48 bg-gradient-to-br ${data.color} opacity-60 rounded-full blur-3xl -translate-x-12 -translate-y-12 pointer-events-none no-print border-none transition-all duration-500`} />

      <div className="p-5 relative h-full flex flex-col z-10 w-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 ${data.iconColor}`}>
             {data.icon}
          </div>
          <span className="bg-slate-100/80 dark:bg-slate-700/80 text-slate-400 dark:text-slate-500 font-bold text-[10px] w-6 h-6 flex items-center justify-center rounded-full no-print border border-slate-200/50 dark:border-slate-700 shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
            {data.order}
          </span>
        </div>

        <h3 className="font-display text-[16px] font-extrabold text-slate-900 dark:text-white tracking-tight mb-2.5">{data.title}</h3>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {hasContent ? (
              <motion.div 
                key="content"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[13.5px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium h-full pr-1"
              >
                {canvasDataValue}
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="group h-full flex flex-col relative"
              >
                <p className="text-[12.5px] text-slate-400 dark:text-slate-500 leading-snug line-clamp-4 group-hover:opacity-0 transition-opacity duration-300 print:hidden font-medium">
                  {data.description}
                </p>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 no-print">
                   <span className="flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg py-1.5 px-3.5 rounded-full text-[11px] font-bold tracking-wide transition-transform group-hover:scale-105 duration-300">
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
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('lean-canvas-pro-theme', 'light');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [globalAiLoading, setGlobalAiLoading] = useState(false);
  const [globalAiFeedback, setGlobalAiFeedback] = useState<string | null>(null);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const canvasData = activeProject?.data || {};

  const filledBlocks = Object.values(canvasData).filter(val => typeof val === 'string' && val.trim().length > 0).length;
  const progressPercentage = Math.round((filledBlocks / 9) * 100);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const shouldLock = showSplash || showAboutDialog || !!globalAiFeedback;
    if (!shouldLock) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [showSplash, showAboutDialog, globalAiFeedback]);

  const evaluateGlobalContext = async () => {
    if (filledBlocks === 0) return;
    setGlobalAiLoading(true);
    setGlobalAiFeedback(null);
    try {
      const resp = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canvasData, blockId: null })
      });
      const data = await resp.json();
      if (data.result) {
        setGlobalAiFeedback(data.result);
      } else {
        setGlobalAiFeedback("Error: " + (data.error || "Algo salió mal"));
      }
    } catch (e) {
      setGlobalAiFeedback("Error de conexión");
    } finally {
      setGlobalAiLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBlockId) {
      setEditorText(canvasData[selectedBlockId] || "");
      setActiveTab('guide');
      setSaveStatus('idle');
      setAiFeedback(null);
    }
  }, [selectedBlockId, activeProjectId]);

  const evaluateBlock = async () => {
    if (!editorText.trim() || !selectedBlockId) return;
    setAiLoading(true);
    setAiFeedback(null);
    try {
      const resp = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canvasData: editorText, blockId: selectedBlockId })
      });
      const data = await resp.json();
      if (data.result) {
        setAiFeedback(data.result);
      } else {
        setAiFeedback("Error: " + (data.error || "Algo salió mal"));
      }
    } catch (e) {
      setAiFeedback("Error de conexión con el AI Copilot");
    } finally {
      setAiLoading(false);
    }
  };

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

  const selectedBlock = BLOCKS.find(b => b.id === selectedBlockId);

  return (
    <div className="min-h-screen bg-[#F4F5F8] dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 flex justify-center pb-16 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-500">
      
      <ParticleBackground theme={theme} />

      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[500] flex flex-col pt-16 md:pt-24 items-center bg-[#F4F5F8] dark:bg-slate-950 overflow-y-auto overflow-x-hidden overscroll-contain hide-scrollbar"
          >
             {/* Background decorative elements */}
             <ParticleBackground theme={theme} />
             <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
               <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px]"></div>
               <div className="absolute top-[30%] -right-[15%] w-[40%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px]"></div>
               <div className="absolute bottom-[0%] left-[20%] w-[60%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[120px]"></div>
             </div>

            <div className="max-w-5xl w-full px-6 flex flex-col items-center relative z-10 pb-20">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.7, type: "spring", bounce: 0.4 }}
                whileHover={{ scale: 1.12, rotate: 10 }}
                className="relative mb-8 cursor-pointer"
              >
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 dark:opacity-30 rounded-[28px]"></div>
                <div className="relative bg-white dark:bg-slate-800/80 backdrop-blur-xl p-5 rounded-[28px] shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center">
                    <motion.div
                      animate={prefersReducedMotion ? {} : { y: [0, -7, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    >
                      <Rocket size={44} className="text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
                    </motion.div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-center w-full"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold text-xs tracking-wide uppercase mb-6 border border-indigo-100 dark:border-indigo-500/20">
                  <Sparkles size={14} /> Nueva Generación de Lean Canvas
                </div>
                <h1 className="font-display text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
                  Lean Canvas{' '}
                  <motion.span
                    className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 inline-block"
                    initial={{ opacity: 0, scale: 0.5, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.6, type: "spring", bounce: 0.6 }}
                    whileHover={{ scale: 1.1 }}
                  >Pro</motion.span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed mb-12">
                  La suite definitiva para startups en etapas tempranas. Modela tu negocio, pivota rápido y <strong className="text-slate-900 dark:text-white">valida tu modelo con Inteligencia Artificial</strong> mediante nuestra exclusiva "Auditoría VC".
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                  <div className="relative w-full sm:w-auto">
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-indigo-500"
                      animate={prefersReducedMotion ? {} : { scale: [1, 1.12, 1], opacity: [0.35, 0, 0.35] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      style={{ pointerEvents: 'none' }}
                    />
                    <motion.button 
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55, duration: 0.5, type: "spring" }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowSplash(false)}
                      className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors shadow-[0_10px_30px_-5px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_40px_-5px_rgba(79,70,229,0.5)] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                      <span className="relative">Entrar al Espacio de Trabajo</span>
                      <svg className="relative w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </motion.button>
                  </div>
                  <motion.a 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    href="https://github.com/markusx5622/Lean-Canvas-Pro" 
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md"
                  >
                    <Code size={20} className="text-slate-400 dark:text-slate-500" />
                    <span>Ver Repositorio</span>
                  </motion.a>
                </div>
              </motion.div>

              {/* Grid of Features Below */}
              <motion.div
                 initial={{ y: 30, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.4, duration: 0.7 }}
                 className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
              >
                  {/* Card 1 */}
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-xl dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-shadow duration-300"
                  >
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 dark:to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20">
                       <CheckCircle2 size={24} strokeWidth={2.5} />
                     </div>
                     <h3 className="font-bold text-slate-900 dark:text-white text-[17px] mb-3 relative z-10">9 Bloques Estratégicos</h3>
                     <p className="text-slate-600 dark:text-slate-400 text-[14px] leading-relaxed font-medium relative z-10">
                       Estructura completa para desglosar tu modelo de negocio de manera visual e iterativa en una sola pantalla interactiva.
                     </p>
                  </motion.div>
                  {/* Card 2 */}
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-xl dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-shadow duration-300"
                  >
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 dark:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20">
                       <Bot size={24} strokeWidth={2.5} />
                     </div>
                     <h3 className="font-bold text-slate-900 dark:text-white text-[17px] mb-3 relative z-10">Auditoría de IA y Venture Capital</h3>
                     <p className="text-slate-600 dark:text-slate-400 text-[14px] leading-relaxed font-medium relative z-10">
                       Sube de nivel con un asistente experto que analizará tus hipótesis, sugiriendo mejoras críticas como un inversor real.
                     </p>
                  </motion.div>
                  {/* Card 3 */}
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-xl dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-shadow duration-300"
                  >
                     <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 dark:to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20">
                       <ShieldCheck size={24} strokeWidth={2.5} />
                     </div>
                     <h3 className="font-bold text-slate-900 dark:text-white text-[17px] mb-3 relative z-10">Privacidad Garantizada</h3>
                     <p className="text-slate-600 dark:text-slate-400 text-[14px] leading-relaxed font-medium relative z-10">
                       Tu propiedad intelectual es vital. Los lienzos se encriptan y guardan localmente para tu total tranquilidad.
                     </p>
                  </motion.div>
              </motion.div>
              
              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="mt-20 pt-8 border-t border-slate-200/60 dark:border-slate-800 w-full flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 dark:text-slate-500 text-[13px] font-medium"
              >
                 <div className="flex items-center gap-1.5">
                   <Rocket size={14} className="text-slate-400 dark:text-slate-600" />
                   <span>Lean Canvas Pro © {new Date().getFullYear()}</span>
                 </div>
                 <div className="flex items-center gap-6">
                    <a href="https://github.com/markusx5622/Lean-Canvas-Pro" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">GitHub</a>
                    <a href="https://www.linkedin.com/in/marc-cubero-cantavella-bb04542a7" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">LinkedIn</a>
                 </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border text-sm border-slate-200/60 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] rounded-[20px] p-3 px-5 flex flex-col md:flex-row items-center justify-between gap-4 no-print sticky top-4 z-[100]"
        >
          {/* Logo & Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <motion.button 
              onClick={() => setShowSplash(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-900 dark:bg-slate-700 text-white p-2 rounded-[14px] shadow-sm shrink-0 relative overflow-hidden group cursor-pointer"
            >
               <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
               <Rocket size={18} strokeWidth={2.5} className="relative z-10 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-indigo-300 transition-all duration-300" />
            </motion.button>
            <div className="flex flex-col relative w-full group">
               <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-[2px] ml-[5px]">
                 Workspace
               </div>
               <div className="flex items-center gap-1 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl p-0.5 transition-all border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700">
                 <div className="relative flex items-center">
                   <select 
                     value={activeProjectId} 
                     onChange={(e) => { setActiveProjectId(e.target.value); setSelectedBlockId(null); }}
                     className="font-display appearance-none bg-transparent text-slate-800 dark:text-slate-200 font-extrabold text-[15px] py-1 pl-2 pr-8 focus:outline-none min-w-[150px] cursor-pointer tracking-tight"
                   >
                     {projects.map(p => <option key={p.id} value={p.id} className="dark:bg-slate-800 dark:text-slate-200">{p.name}</option>)}
                   </select>
                   <div className="pointer-events-none absolute right-2 text-slate-400 dark:text-slate-500 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-400">
                      <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                   </div>
                 </div>
                 
                 <div className="flex items-center">
                   <button onClick={handleRenameProject} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm shadow-transparent hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent hover:border-slate-200 dark:hover:border-slate-700"><Edit2 size={13} strokeWidth={2.5} /></button>
                   <button onClick={handleDeleteProject} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm shadow-transparent hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent hover:border-slate-200 dark:hover:border-slate-700"><Trash2 size={13} strokeWidth={2.5} /></button>
                 </div>
               </div>
            </div>
            
            <div className="h-8 w-px bg-slate-200/60 dark:bg-slate-700 mx-1 hidden lg:block"></div>
            
            <button onClick={handleCreateProject} className="hidden lg:flex items-center gap-2 px-3 py-[7px] bg-slate-50 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-bold rounded-[10px] hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap text-[13px] tracking-tight border border-slate-200/80 dark:border-slate-700 shadow-sm">
               <Plus size={15} strokeWidth={2.5} /> Nuevo
            </button>
          </div>

          {/* Progreso del Lienzo */}
          <div className="hidden md:flex flex-col items-center flex-1 max-w-[280px]">
            <div className="flex w-full justify-between mb-[6px] text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <span>Validación de la Startup</span>
              <span className={progressPercentage === 100 ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-300'}>{progressPercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full ${progressPercentage === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgb(16,185,129,0.5)]' : 'bg-slate-900'}`} 
              />
            </div>
          </div>

          {/* Acciones Globales */}
          <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
            <button 
              onClick={evaluateGlobalContext} 
              disabled={globalAiLoading || filledBlocks === 0}
              title="Analizar Modelo Completo con AI VC"
              className="flex items-center gap-2 p-2 px-3 text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 rounded-lg transition-all border border-indigo-100 dark:border-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-[13px] font-bold"
            >
              {globalAiLoading ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> : <Bot size={16} strokeWidth={2.5} />}
              <span className="hidden lg:inline">Auditoría Startup IA</span>
            </button>
            <div className="h-6 w-px bg-slate-200/60 dark:bg-slate-700 mx-1"></div>
            <button onClick={() => setShowAboutDialog(true)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors border border-transparent">
              <Info size={18} strokeWidth={2.5} />
            </button>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors border border-transparent">
              {theme === 'dark' ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
            </button>
            <div className="h-6 w-px bg-slate-200/60 dark:bg-slate-700 mx-1"></div>
            <button title="Exportar JSON" onClick={handleExportJson} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors border border-transparent">
              <Download size={18} strokeWidth={2.5} />
            </button>
            <button title="Importar JSON" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors border border-transparent">
              <Upload size={18} strokeWidth={2.5} />
            </button>
            <div className="h-6 w-px bg-slate-200/60 dark:bg-slate-700 mx-1"></div>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-[7px] bg-indigo-600 text-white font-bold rounded-[10px] hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap text-[13px] tracking-tight">
              <Printer size={15} strokeWidth={2.5} /> <span className="hidden sm:inline">Exportar PDF</span>
            </button>
          </div>
        </motion.div>

        <div className="hidden print:block mb-6 text-center border-b pb-4 mt-6 border-slate-200 dark:border-slate-700">
            <h1 className="font-display text-4xl font-extrabold text-slate-900 dark:text-white uppercase tracking-widest mb-2">{activeProject.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Lienzo Lean Startups</p>
        </div>

        <AnimatePresence>
          {showAboutDialog && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setShowAboutDialog(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 w-full max-w-[800px] rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800 relative flex flex-col md:flex-row gap-6 p-8 md:p-12 items-center"
              >
                <div className="flex-1">
                    <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Sobre este proyecto</h2>
                    
                    <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-4">
                      Lean Canvas Pro es una poderosa plataforma de modelado de negocio y validación temprana de ideas. Permite construir lienzos estratégicos, auditar hipótesis con Inteligencia Artificial como si de un "venture capital" se tratase y exportar la información del modelo rápidamente.
                    </p>

                    <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Desarrollado por <strong className="text-slate-900 dark:text-white">Marc Cubero</strong> en el ecosistema emprendedor y de innovación de la <strong className="text-slate-900 dark:text-white">Universidad Europea de Valencia</strong>. El enfoque es práctico y profesional: una herramienta pensada para acompañar a directivos, CEOs y founders desde su "Early stage" al éxito en España. Aporta verdadero valor al ecosistema aportando métricas y validación basadas en Inteligencia Artificial; todo ello respaldando la toma de decisiones con datos sólidos de mercado, en vez de sustituirla.
                    </p>
                </div>
                
                <div className="w-full md:w-[280px] flex flex-col gap-3 shrink-0">
                   <a href="https://github.com/markusx5622/Lean-Canvas-Pro" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-3.5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group font-medium text-[13px] text-slate-700 dark:text-slate-300 shadow-sm">
                     <Code size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                     <span>Ver repositorio</span>
                   </a>
                   <a href="https://www.linkedin.com/in/marc-cubero-cantavella-bb04542a7" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-3.5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group font-medium text-[13px] text-slate-700 dark:text-slate-300 shadow-sm">
                     <Linkedin size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                     <span>Perfil de LinkedIn</span>
                   </a>
                </div>

                {/* Close Button */}
                <button onClick={() => setShowAboutDialog(false)} title="Cerrar" className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {globalAiFeedback && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setGlobalAiFeedback(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700"
              >
                <div className="bg-indigo-600 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Bot className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
                        Auditoría AI de VC <Sparkles size={16} className="text-indigo-200" />
                      </h3>
                      <p className="text-indigo-100 text-[13px] font-medium">Revisión integral de tu modelo de negocio</p>
                    </div>
                  </div>
                  <button onClick={() => setGlobalAiFeedback(null)} className="text-white/70 hover:text-white p-2 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto overscroll-contain custom-scrollbar">
                  <div className="prose prose-slate dark:prose-invert prose-indigo max-w-none text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                    {globalAiFeedback}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 px-8 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                  <button 
                    onClick={() => setGlobalAiFeedback(null)} 
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-[14px]"
                  >
                    Entendido
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === MAIN LAYOUT === */}
        <div className="flex flex-col lg:flex-row gap-5 items-stretch relative md:px-2 pt-2">
          
          {/* El Lienzo (10 Columns Perfect Harmony) */}
          <div className="flex-[1.5] xl:flex-[2] w-full flex flex-col gap-5">
            
            <div className="grid grid-cols-1 md:grid-cols-10 md:grid-rows-[minmax(190px,auto)_minmax(190px,auto)] print:grid-cols-10 print:grid-rows-[250px_250px] gap-5">
              <Block index={0} data={BLOCKS.find(b => b.id === 1)} additionalClasses="md:col-span-2 md:row-span-2 print:col-span-2 print:row-span-2" isActive={selectedBlockId === 1} hasContent={!!canvasData[1] && canvasData[1].trim() !== ""} canvasDataValue={canvasData[1] || ""} onClick={() => setSelectedBlockId(1)} />
              <Block index={1} data={BLOCKS.find(b => b.id === 4)} additionalClasses="md:col-span-2 md:col-start-3 md:row-start-1 print:col-span-2 print:col-start-3 print:row-start-1" isActive={selectedBlockId === 4} hasContent={!!canvasData[4] && canvasData[4].trim() !== ""} canvasDataValue={canvasData[4] || ""} onClick={() => setSelectedBlockId(4)} />
              <Block index={2} data={BLOCKS.find(b => b.id === 8)} additionalClasses="md:col-span-2 md:col-start-3 md:row-start-2 print:col-span-2 print:col-start-3 print:row-start-2" isActive={selectedBlockId === 8} hasContent={!!canvasData[8] && canvasData[8].trim() !== ""} canvasDataValue={canvasData[8] || ""} onClick={() => setSelectedBlockId(8)} />
              <Block index={3} data={BLOCKS.find(b => b.id === 3)} additionalClasses="md:col-span-2 md:col-start-5 md:row-span-2 print:col-span-2 print:col-start-5 print:row-span-2" isActive={selectedBlockId === 3} hasContent={!!canvasData[3] && canvasData[3].trim() !== ""} canvasDataValue={canvasData[3] || ""} onClick={() => setSelectedBlockId(3)} />
              <Block index={4} data={BLOCKS.find(b => b.id === 9)} additionalClasses="md:col-span-2 md:col-start-7 md:row-start-1 print:col-span-2 print:col-start-7 print:row-start-1" isActive={selectedBlockId === 9} hasContent={!!canvasData[9] && canvasData[9].trim() !== ""} canvasDataValue={canvasData[9] || ""} onClick={() => setSelectedBlockId(9)} />
              <Block index={5} data={BLOCKS.find(b => b.id === 5)} additionalClasses="md:col-span-2 md:col-start-7 md:row-start-2 print:col-span-2 print:col-start-7 print:row-start-2" isActive={selectedBlockId === 5} hasContent={!!canvasData[5] && canvasData[5].trim() !== ""} canvasDataValue={canvasData[5] || ""} onClick={() => setSelectedBlockId(5)} />
              <Block index={6} data={BLOCKS.find(b => b.id === 2)} additionalClasses="md:col-span-2 md:col-start-9 md:row-span-2 print:col-span-2 print:col-start-9 print:row-span-2" isActive={selectedBlockId === 2} hasContent={!!canvasData[2] && canvasData[2].trim() !== ""} canvasDataValue={canvasData[2] || ""} onClick={() => setSelectedBlockId(2)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-10 print:grid-cols-10 gap-5">
              <Block index={7} data={BLOCKS.find(b => b.id === 7)} additionalClasses="md:col-span-5 md:h-[160px] print:h-[150px]" isActive={selectedBlockId === 7} hasContent={!!canvasData[7] && canvasData[7].trim() !== ""} canvasDataValue={canvasData[7] || ""} onClick={() => setSelectedBlockId(7)} />
              <Block index={8} data={BLOCKS.find(b => b.id === 6)} additionalClasses="md:col-span-5 md:h-[160px] print:h-[150px]" isActive={selectedBlockId === 6} hasContent={!!canvasData[6] && canvasData[6].trim() !== ""} canvasDataValue={canvasData[6] || ""} onClick={() => setSelectedBlockId(6)} />
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
                  className="bg-white dark:bg-slate-800 border rounded-[28px] border-slate-200/80 dark:border-slate-700 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-7 flex flex-col h-full w-full relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${selectedBlock.color}`}></div>

                  <div className="flex items-start gap-4 mb-6 shrink-0 pt-2">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${selectedBlock.color} ${selectedBlock.iconColor} shadow-inner border border-stone-50 dark:border-slate-700 relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white dark:bg-slate-800 opacity-40 blur-md rounded-full scale-150"></div>
                      <div className="relative z-10">{selectedBlock.icon}</div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="text-[10px] uppercase tracking-[2px] text-slate-400 font-extrabold mb-1">
                        BLOQUE 0{selectedBlock.order}
                      </div>
                      <h2 className="font-display text-[26px] font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                        {selectedBlock.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex bg-slate-50 dark:bg-slate-700/80 p-1.5 rounded-xl mb-6 shrink-0 border border-slate-200/60 dark:border-slate-700 shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                    <button onClick={() => setActiveTab('guide')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold rounded-lg transition-all duration-300 ${activeTab === 'guide' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}> 
                      <BookOpen size={16} strokeWidth={2.5} /> Guía
                    </button>
                    <button onClick={() => setActiveTab('examples')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold rounded-lg transition-all duration-300 ${activeTab === 'examples' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}> 
                      <MessageSquare size={16} strokeWidth={2.5} /> Ejemplos
                    </button>
                  </div>

                  <div className="mb-6 overflow-y-auto shrink-0 max-h-[170px] custom-scrollbar overscroll-contain pr-3">
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                        className="text-[13px]"
                      >
                        {activeTab === 'guide' && (
                          <>
                            <p className="text-slate-600 dark:text-slate-300 mb-5 font-medium leading-relaxed">{selectedBlock.details}</p>
                            <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Preguntas clave</h4>
                            <ul className="flex flex-col gap-2.5">
                              {selectedBlock.questions.map((q, idx) => (
                                <li key={idx} className="text-slate-700 dark:text-slate-300 flex items-start gap-2.5 font-medium">
                                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-slate-300 dark:bg-slate-600`} /> {q}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        {activeTab === 'examples' && (
                          <div className="flex flex-col gap-3">
                            {selectedBlock.examples.map((ex, idx) => (
                              <div key={idx} className="bg-slate-50 dark:bg-slate-700/80 border border-slate-200/70 dark:border-slate-700 rounded-xl p-4 shadow-sm dark:shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                                 <div className="font-extrabold text-slate-900 dark:text-white text-[11px] mb-2 flex items-center gap-1.5 tracking-wider uppercase">
                                   <Rocket size={14} className="text-slate-400 dark:text-slate-500" /> CASO DE ÉXITO: {ex.company}
                                 </div>
                                 <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap font-medium">{ex.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Redacción */}
                  <div className="flex flex-col flex-1 relative border-t border-slate-100 dark:border-slate-700 pt-6 mt-auto">
                    <div className="flex justify-between items-center mb-3 shrink-0">
                      <label htmlFor="editorCanvas" className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                        Tus notas estratégicas
                      </label>
                      <div className="h-5 flex items-center justify-end gap-3">
                        <button 
                          onClick={evaluateBlock}
                          disabled={aiLoading || !editorText.trim()}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                          Validar con IA
                        </button>
                        {saveStatus === 'saving' && <span className="text-[10px] font-bold text-slate-400 animate-pulse uppercase tracking-wider">Guardando...</span>}
                        {saveStatus === 'saved' && <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100"><CheckCircle2 size={12} strokeWidth={2.5}/> Listo</span>}
                      </div>
                    </div>
                    
                    <textarea
                      id="editorCanvas"
                      className={`flex-1 w-full p-4 bg-slate-50/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-[14px] font-medium text-slate-800 dark:text-slate-200 leading-relaxed focus:bg-white focus:dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:dark:ring-offset-slate-900 ${selectedBlock.ringColor} focus:border-transparent transition-all resize-none placeholder-slate-400 dark:placeholder-slate-500 shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]`}
                      placeholder="Escribe tus ideas aquí...&#10;Haz clic en 'Validar con IA' para recibir feedback al instante."
                      value={editorText}
                      onChange={(e) => setEditorText(e.target.value)}
                    />

                    <AnimatePresence>
                      {aiFeedback && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: 10, height: 0 }}
                          className="mt-4 p-4 bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-500/30 rounded-xl"
                        >
                          <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-bold text-[11px] uppercase tracking-wider">
                            <Bot size={14} /> AI Copilot Feedback
                          </div>
                          <div className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                            {aiFeedback}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-[28px] p-10 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700 relative overflow-hidden"
                >
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex flex-col items-center z-10"
                  >
                    <div className="w-20 h-20 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                      <FolderOpen size={36} strokeWidth={2.5} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="font-display text-2xl font-extrabold text-slate-800 dark:text-slate-200 mb-3 tracking-tight">Focus Mode</h3>
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
                  className="bg-white dark:bg-slate-800 rounded-t-[32px] h-[85vh] w-full flex flex-col shadow-2xl p-6 cursor-auto relative" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-4"></div>
                  
                  <div className="mt-5 flex items-center gap-4 mb-6 shrink-0">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${selectedBlock.color} ${selectedBlock.iconColor} shadow-inner border border-white dark:border-slate-700`}>
                        {selectedBlock.icon}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500 font-extrabold mb-0.5">
                          BLOQUE 0{selectedBlock.order}
                        </div>
                        <h2 className="font-display text-[22px] font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">
                          {selectedBlock.title}
                        </h2>
                      </div>
                  </div>

                  <textarea
                      className={`flex-1 w-full p-4 mb-5 bg-slate-50 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-[15px] font-medium text-slate-800 dark:text-slate-200 leading-relaxed focus:bg-white focus:dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:dark:ring-offset-slate-900 ${selectedBlock.ringColor} resize-none shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]`}
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
