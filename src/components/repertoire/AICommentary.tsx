'use client';

import { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  fen: string;
  history: string[];
  opening: string | null;
  evaluation: string;
  bestLine?: string[];
  turn: 'w' | 'b';
  repertoireName?: string;
  repertoireDescription?: string;
  engineEnabled: boolean;
}

export default function AICommentary({
  fen,
  history,
  opening,
  evaluation,
  bestLine,
  turn,
  repertoireName,
  repertoireDescription,
  engineEnabled
}: Props) {
  const [commentary, setCommentary] = useState<string | null>(null);
  const [historyComments, setHistoryComments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoExplain, setAutoExplain] = useState(false);

  const fetchCommentary = async () => {
    if (history.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/ai/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fen,
          history,
          opening,
          evaluation,
          bestLine,
          turn,
          repertoireName,
          repertoireDescription,
          engineEnabled,
          previousComments: historyComments.slice(-2) // Envia os últimos 2 comentários para contexto
        }),
      });

      const resJson = await response.json();
      
      if (resJson.status === 'error') {
        throw new Error(resJson.message || 'Erro ao gerar análise');
      }

      const text = resJson.data.commentary;
      setCommentary(text);
      setHistoryComments(prev => [...prev, text]);
    } catch (err: any) {
      setError(err.message || 'Não foi possível carregar a explicação da IA.');
      console.error(err);
      
      // Smart pause: if quota error, disable auto-explain for 60s
      if (err.message?.includes('limite de consultas') || err.message?.includes('Quota')) {
        setAutoExplain(false);
        setTimeout(() => {
          setAutoExplain(true);
          setError(null);
        }, 60000); // 60s cooldown
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch commentary after a short delay when move changes
  // to avoid spamming the API while the user is moving fast
  useEffect(() => {
    if (history.length === 0 || !autoExplain) {
      if (history.length === 0) setCommentary(null);
      return;
    }

    const timer = setTimeout(() => {
      fetchCommentary();
    }, 1000); // Reduzido para 1s devido à velocidade da Groq

    return () => clearTimeout(timer);
  }, [fen, autoExplain]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-900 text-white shadow-xl shadow-indigo-500/10">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-300" />
            <h3 className="font-bold text-[0.8125rem] uppercase tracking-wider text-blue-100">OTEN AI</h3>
          </div>
          
          {/* Auto-Explain Toggle */}
          <button 
            onClick={() => setAutoExplain(!autoExplain)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all text-[9px] font-black uppercase tracking-tighter ${
              autoExplain 
                ? 'bg-blue-400/20 border-blue-400/30 text-blue-300' 
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            <div className={`w-1 h-1 rounded-full ${autoExplain ? 'bg-blue-300 animate-pulse' : 'bg-white/20'}`} />
            Auto: {autoExplain ? 'ON' : 'OFF'}
          </button>
        </div>
        <button
          onClick={fetchCommentary}
          disabled={loading || history.length === 0}
          className="p-1.5 rounded-lg hover:bg-white/10 text-blue-300 disabled:opacity-20 transition-all"
          title="Recarregar explicação"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-5 h-[290px] relative overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="flex flex-col items-center justify-center h-full gap-3"
            >
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                    }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full bg-blue-300 shadow-[0_0_8px_rgba(147,197,253,0.5)]"
                  />
                ))}
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center p-4"
            >
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 border border-orange-500/20">
                <AlertCircle size={24} className="text-orange-400" />
              </div>
              <p className="text-[0.8125rem] leading-relaxed text-orange-100 font-medium max-w-[200px]">
                {error.includes('Quota') 
                  ? 'O treinador está descansando um pouco. Tente novamente em 30 segundos.' 
                  : error}
              </p>
              <button 
                onClick={fetchCommentary}
                className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/10"
              >
                Tentar agora
              </button>
            </motion.div>
          ) : commentary ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 flex flex-col justify-between h-full"
            >
              <div className="relative">
                <p className="text-[0.9375rem] leading-relaxed text-blue-50 font-medium pl-1">
                  {commentary}
                </p>
              </div>
              <div className="pt-2 flex justify-between items-center mt-auto">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400/30" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400/10" />
                </div>
                <span className="text-[9px] text-blue-300/40 font-bold uppercase tracking-tighter">Pedagogical Mode</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center opacity-40"
            >
              <MessageSquare size={20} className="mb-2 text-blue-200" />
              <p className="text-xs text-blue-100 font-medium">Faça um lance para receber<br />uma explicação estratégica</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
