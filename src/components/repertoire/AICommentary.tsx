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
}

export default function AICommentary({
  fen,
  history,
  opening,
  evaluation,
  bestLine,
  turn,
  repertoireName,
  repertoireDescription
}: Props) {
  const [commentary, setCommentary] = useState<string | null>(null);
  const [historyComments, setHistoryComments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommentary = async () => {
    if (history.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/comment', {
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
          previousComments: historyComments.slice(-2) // Envia os últimos 2 comentários para contexto
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setCommentary(data.commentary);
      setHistoryComments(prev => [...prev, data.commentary]);
    } catch (err: any) {
      setError(err.message || 'Não foi possível carregar a explicação da IA.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch commentary after a short delay when move changes
  // to avoid spamming the API while the user is moving fast
  useEffect(() => {
    if (history.length === 0) {
      setCommentary(null);
      return;
    }

    const timer = setTimeout(() => {
      fetchCommentary();
    }, 1500); // 1.5s delay

    return () => clearTimeout(timer);
  }, [fen]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-900 text-white shadow-xl shadow-indigo-500/10">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-300" />
          <h3 className="font-bold text-[0.8125rem] uppercase tracking-wider text-blue-100">OTEN AI</h3>
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
              className="flex items-start gap-3 text-xs text-blue-100 bg-red-500/10 p-3 rounded-xl border border-red-500/20"
            >
              <AlertCircle size={14} className="text-red-300 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
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
