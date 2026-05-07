import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Loader2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { sendAssistantMessage } from '../../lib/assistantService';
import type { ChatMessage, CanvasContext } from '../../lib/assistantService';

// ── Quick-action prompts ───────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: '🔍 Detectar debilidades', prompt: 'Analiza mi canvas y dime cuáles son las principales debilidades estratégicas.' },
  { label: '✍️ Mejorar propuesta única', prompt: 'Ayúdame a mejorar y hacer más atractiva mi Propuesta Única de Valor.' },
  { label: '💡 Sugerir hipótesis', prompt: 'Sugiere 3 hipótesis clave que debería validar antes de seguir adelante.' },
  { label: '📋 Resumir el canvas', prompt: 'Hazme un resumen ejecutivo de mi canvas en 5 líneas.' },
  { label: '📈 Feedback estratégico', prompt: 'Dame feedback estratégico general sobre mi canvas como si fueras un inversor.' },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface AssistantPanelProps {
  canvasContext: CanvasContext;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AssistantPanel({ canvasContext, onClose }: AssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const nextMessages: ChatMessage[] = [...messages, userMessage];

    setMessages(nextMessages);
    setInputValue('');
    setError(null);
    setLoading(true);

    try {
      const reply = await sendAssistantMessage(nextMessages, canvasContext);
      setMessages([...nextMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido.');
    } finally {
      setLoading(false);
      // Restore focus to textarea after response
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleReset = () => {
    setMessages([]);
    setError(null);
    textareaRef.current?.focus();
  };

  const isEmpty = messages.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-end p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 32 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-panel-title"
        className="bg-slate-900 dark:bg-slate-950 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-700/60 dark:border-slate-800 flex flex-col h-[85vh] max-h-[700px]"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-slate-700/60 dark:border-slate-800 bg-slate-900 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500/15 rounded-xl flex items-center justify-center shrink-0">
              <Bot size={19} className="text-indigo-400" strokeWidth={2.5} />
            </div>
            <div>
              <h3
                id="assistant-panel-title"
                className="font-display text-[15px] font-extrabold text-white tracking-tight leading-tight"
              >
                Asistente estratégico
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate max-w-[220px]">
                {canvasContext.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleReset}
                aria-label="Nueva conversación"
                title="Nueva conversación"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
              >
                <RefreshCw size={15} strokeWidth={2.5} />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Cerrar asistente"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
            >
              <X size={17} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ── Messages area ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {/* Empty state */}
          <AnimatePresence>
            {isEmpty && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center justify-center h-full gap-5 text-center py-6"
              >
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                  <Sparkles size={28} className="text-indigo-400" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-slate-200 font-bold text-[15px] leading-tight">
                    ¿En qué puedo ayudarte?
                  </p>
                  <p className="text-slate-500 text-[12px] mt-1.5 max-w-[260px]">
                    Soy tu asistente estratégico para este canvas. Pregunta lo que necesites o usa una acción rápida.
                  </p>
                </div>
                {/* Quick actions */}
                <div className="flex flex-col gap-2 w-full max-w-[300px]">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="w-full text-left px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 hover:border-indigo-500/40 rounded-2xl text-[13px] text-slate-300 font-medium transition-all"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message bubbles */}
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 bg-indigo-500/15 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={14} className="text-indigo-400" strokeWidth={2.5} />
                </div>
              )}
              <div
                className={
                  msg.role === 'user'
                    ? 'max-w-[78%] px-4 py-3 bg-indigo-600 text-white text-[13px] font-medium rounded-2xl rounded-br-md leading-relaxed'
                    : 'max-w-[82%] px-4 py-3 bg-slate-800 text-slate-200 text-[13px] rounded-2xl rounded-bl-md leading-relaxed border border-slate-700/60 whitespace-pre-wrap'
                }
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-7 h-7 bg-indigo-500/15 rounded-xl flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-indigo-400" strokeWidth={2.5} />
                </div>
                <div className="px-4 py-3 bg-slate-800 rounded-2xl rounded-bl-md border border-slate-700/60 flex items-center gap-2">
                  <Loader2 size={14} className="text-indigo-400 animate-spin" />
                  <span className="text-slate-400 text-[12px]">Pensando…</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 px-4 py-3 bg-rose-950/40 border border-rose-700/40 rounded-2xl text-rose-300 text-[12px]"
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input area ──────────────────────────────────────────────────── */}
        <div className="px-4 pb-4 pt-3 shrink-0 border-t border-slate-700/60 dark:border-slate-800 bg-slate-900 dark:bg-slate-950">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje… (Enter para enviar)"
              rows={1}
              disabled={loading}
              aria-label="Mensaje para el asistente"
              className="flex-1 resize-none bg-slate-800 text-slate-200 placeholder-slate-500 text-[13px] font-medium px-4 py-3 rounded-2xl border border-slate-700/60 focus:outline-none focus:border-indigo-500/60 transition-colors min-h-[44px] max-h-[120px] overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ height: 'auto' }}
              onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              aria-label="Enviar mensaje"
              className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shrink-0 mb-0.5"
            >
              <Send size={16} strokeWidth={2.5} />
            </button>
          </form>
          <p className="text-[10px] text-slate-600 mt-2 text-center">
            Shift+Enter para nueva línea · Las respuestas se generan con Gemini AI
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
