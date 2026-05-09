'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Brain, ChevronDown } from 'lucide-react';
import ChessBoardDemo from '@/components/chess/ChessBoardDemo';

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="gradient-hero min-h-screen flex flex-col justify-center pt-16 pb-8 relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-indigo-100/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-slate-100/20 blur-3xl" />
      </div>

      <div className="container-app relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
          {/* Left — Text Content */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="badge badge-accent">
                <Sparkles size={12} />
                Powered by Stockfish + IA Pedagógica
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-display text-neutral-900 mb-6"
            >
              Domine as{' '}
              <span className="gradient-text-accent">aberturas</span>
              {' '}com inteligência real
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-body-lg mb-8 max-w-lg"
            >
              Construa repertórios personalizados com análise precisa de engine
              e explicações claras sobre estratégia, planos típicos e conceitos
              posicionais. Aprenda xadrez do jeito certo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/auth/signup"
                id="hero-cta-primary"
                className="btn btn-primary btn-lg gap-2"
              >
                Começar gratuitamente
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#how-it-works"
                id="hero-cta-secondary"
                className="btn btn-ghost btn-lg"
              >
                Ver como funciona
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-10 flex items-center gap-6"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center"
                    style={{ zIndex: 6 - i }}
                  >
                    <span className="text-[9px] font-bold text-white">
                      {['GM', 'IM', 'FM', '⭐', '♟'][i - 1]}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-800">+2.400 jogadores</p>
                <p className="text-caption">já constroem repertórios com IA</p>
              </div>
            </motion.div>
          </div>

          {/* Right — Board Demo */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[520px]">
              {/* Analysis overlay card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="absolute -top-4 -left-4 z-10 glass-card p-4 max-w-[220px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={16} className="text-blue-500" />
                  <span className="text-xs font-semibold text-neutral-700">Análise IA</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  <strong className="text-neutral-800">e4 e5</strong> — Abertura italiana.
                  Brancas controlam o centro e preparam Bc4 para atacar f7.
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full w-[58%] bg-blue-400 rounded-full" />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">+0.32</span>
                </div>
              </motion.div>

              {/* Repertoire move card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="absolute -bottom-4 -right-4 z-10 glass-card p-4 max-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-semibold text-neutral-700">Seu repertório</span>
                </div>
                <div className="space-y-1">
                  {['1. e4', '1... e5', '2. Nf3', '2... Nc6', '3. Bc4'].map((move, i) => (
                    <div
                      key={move}
                      className="text-[11px] font-mono text-neutral-500 flex items-center gap-1.5"
                    >
                      <div
                        className="w-1 h-1 rounded-full flex-shrink-0"
                        style={{ background: i === 4 ? '#3b82f6' : '#d1d5db' }}
                      />
                      {move}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Chessboard */}
              <div className="chess-board-wrapper">
                <ChessBoardDemo />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <span className="text-caption">Deslize para explorar</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} className="text-neutral-300" />
        </motion.div>
      </motion.div>
    </section>
  );
}
