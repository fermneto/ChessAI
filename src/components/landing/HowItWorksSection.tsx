'use client';

import { motion } from 'framer-motion';
import { Search, Cpu, MessageSquare, Trophy } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Escolha sua abertura',
    description:
      'Selecione de nossa biblioteca de aberturas classificadas por ECO, estilo e nível de complexidade. Ou importe uma posição via FEN ou PGN.',
  },
  {
    number: '02',
    icon: Cpu,
    title: 'Engine analisa a posição',
    description:
      'O Stockfish avalia cada variante com profundidade configurable, identificando as linhas principais, alternativas e armadilhas da abertura.',
  },
  {
    number: '03',
    icon: MessageSquare,
    title: 'IA explica os conceitos',
    description:
      'Nossa IA pedagógica traduz a análise técnica em explicações claras: propósito dos lances, planos futuros, estruturas de peões e ideias estratégicas.',
  },
  {
    number: '04',
    icon: Trophy,
    title: 'Treine e memorize',
    description:
      'Pratique com drills adaptativos que reforçam as linhas do seu repertório. Acompanhe seu progresso e evolua sistematicamente.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-padding bg-white">
      <div className="container-app">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge badge-neutral mb-4">Como funciona</span>
          <h2 className="text-headline text-neutral-900 mb-4">
            Quatro passos para um{' '}
            <span className="gradient-text-accent">repertório sólido</span>
          </h2>
          <p className="text-body-lg max-w-xl mx-auto">
            Um processo estruturado que transforma o estudo de aberturas em uma
            experiência eficiente e prazerosa.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-6 top-12 bottom-12 w-px bg-neutral-100 hidden lg:block" style={{ left: 'calc(50% - 0.5px)' }} />

          <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-16 lg:gap-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`flex gap-6 ${index % 2 === 1 ? 'lg:flex-row' : 'lg:flex-row'}`}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center shadow-medium">
                    <step.icon size={22} className="text-white" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-label text-neutral-300">{step.number}</span>
                    <h3 className="font-semibold text-neutral-900 text-[1.0625rem]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-body leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
