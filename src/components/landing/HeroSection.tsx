'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import ChessBoardDemo from '@/components/chess/ChessBoardDemo';

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="gradient-hero pt-32 pb-32 md:pt-40 md:pb-48 relative z-20 overflow-visible"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-100/20 blur-3xl" />
        <div className="absolute top-1/4 -left-20 w-[300px] h-[300px] rounded-full bg-indigo-100/20 blur-3xl" />
      </div>

      <div className="container-app relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text Content */}
          <div className="flex flex-col">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 mb-6"
            >
              Domine o Xadrez com <br />
              <span className="text-blue-600">Inteligência Real</span>
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
                className="btn btn-primary btn-lg gap-2"
              >
                Começar gratuitamente
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#how-it-works"
                className="btn btn-ghost btn-lg"
              >
                Ver como funciona
              </Link>
            </motion.div>
          </div>

          {/* Right — Board Demo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[500px]">
              <ChessBoardDemo />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
