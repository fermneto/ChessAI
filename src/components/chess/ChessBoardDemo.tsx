'use client';

import { useEffect, useState, useRef } from 'react';
import { Chess } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Info, RefreshCw, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import CustomChessBoard from './CustomChessBoard';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const DEMO_SEQUENCE = [
  { move: 'e4', analysis: 'Controle central e liberação do bispo e dama.', evaluation: '+0.3', label: '1. e4' },
  { move: 'e5', analysis: 'Resposta clássica, disputando o centro.', evaluation: '+0.2', label: '1... e5' },
  { move: 'Nf3', analysis: 'Desenvolvimento com ataque ao peão de e5.', evaluation: '+0.4', label: '2. Nf3' },
  { move: 'Nc6', analysis: 'Defesa sólida desenvolvendo uma peça menor.', evaluation: '+0.3', label: '2... Nc6' },
  { move: 'Bc4', analysis: 'Abertura Italiana. Pressão imediata em f7.', evaluation: '+0.5', label: '3. Bc4' },
];



export default function ChessBoardDemo() {
  const [isMounted, setIsMounted] = useState(false);
  const [, setTick] = useState(0);
  const [index, setIndex] = useState(-1);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const gameRef = useRef(new Chess());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [lastMove, setLastMove] = useState<string | null>(null);

  useEffect(() => {
    if (!isMounted || showFinalModal || index >= DEMO_SEQUENCE.length - 1) {
      if (index === DEMO_SEQUENCE.length - 1 && !showFinalModal) {
        const modalTimer = setTimeout(() => setShowFinalModal(true), 1000);
        return () => clearTimeout(modalTimer);
      }
      return;
    }

    const timer = setTimeout(() => {
      const nextIndex = index + 1;
      try {
        const moveResult = gameRef.current.move(DEMO_SEQUENCE[nextIndex].move);
        if (moveResult) {
          setIndex(nextIndex);
          setLastMove(moveResult.from + moveResult.to);
          setTick(t => t + 1);
        }
      } catch (e) {
        console.error("Erro ao mover:", e);
        resetDemo();
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [index, showFinalModal, isMounted]);

  const resetDemo = () => {
    gameRef.current = new Chess();
    setIndex(-1);
    setLastMove(null);
    setTick(t => t + 1);
    setShowFinalModal(false);
  };

  return (
    <div className="relative w-full max-w-[500px] mx-auto">
      {/* ... (Analysis and Info cards) ... */}
      <AnimatePresence mode="wait">
        {isMounted && !showFinalModal && index !== -1 && (
          <motion.div
            key={`analysis-${index}`}
            initial={{ opacity: 0, x: -20, y: 5 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute -top-16 -left-24 z-20 p-5 w-[260px] hidden xl:block pointer-events-none bg-white/70 backdrop-blur-lg rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/80"
          >
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} className="text-blue-500" />
              <span className="text-xs font-semibold text-neutral-700">Análise IA</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed min-h-[32px]">
              <strong className="text-neutral-800">{DEMO_SEQUENCE[index].label}</strong> — {DEMO_SEQUENCE[index].analysis}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-neutral-100/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '50%' }}
                  animate={{ width: `${50 + (parseFloat(DEMO_SEQUENCE[index].evaluation) * 20)}%` }}
                  className="h-full bg-blue-400 rounded-full"
                />
              </div>
              <span className="text-[10px] font-mono text-neutral-400 font-bold">{DEMO_SEQUENCE[index].evaluation}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMounted && showFinalModal && (
          <motion.div
            key="final-info"
            initial={{ opacity: 0, x: 30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: 10 }}
            className="absolute -bottom-16 -right-24 z-30 p-7 w-[340px] hidden xl:block bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_40px_80px_rgba(15,23,42,0.15)] border border-white/50"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200/50">
                <Info size={26} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">Abertura Italiana</h3>
                <p className="text-[10px] text-blue-600 font-extrabold tracking-[0.2em] uppercase">Giuoco Piano</p>
              </div>
            </div>

            <p className="text-sm text-slate-600/90 leading-relaxed mb-6 font-medium">
              Focada no controle do centro e ataque rápido ao ponto vulnerável de f7. Uma base essencial para dominar o jogo posicional.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/auth/login"
                className="btn btn-primary w-full py-3.5 text-sm shadow-xl shadow-blue-500/20 font-bold flex items-center justify-center gap-2 group bg-blue-600 hover:bg-blue-700 border-none"
              >
                Estudar Repertório
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={resetDemo}
                className="flex items-center justify-center gap-2 w-full text-[11px] text-slate-500 hover:text-slate-800 py-2 transition-colors font-bold uppercase tracking-widest"
              >
                <RefreshCw size={13} />
                Reiniciar Demonstração
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="chess-board-wrapper relative z-10 bg-white p-2.5 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
        {!isMounted ? (
           <div className="w-full aspect-square bg-neutral-100 animate-pulse rounded-xl" />
        ) : (
          <CustomChessBoard
            position={gameRef.current.fen()}
            boardOrientation="white"
            lastMove={lastMove}
          />
        )}

        {isMounted && !showFinalModal && (
          <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/5 cursor-default group">
            <span className="bg-white/90 backdrop-blur px-5 py-2.5 rounded-full text-xs font-bold text-neutral-800 shadow-xl border border-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
              Modo demonstração
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
