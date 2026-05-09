'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  BookOpen,
  Target,
  Users,
  Zap,
  Shield,
  BarChart3,
  Layers,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'IA Pedagógica',
    description:
      'Não apenas números — a IA explica o propósito de cada lance, planos futuros e conceitos estratégicos em linguagem clara.',
    accent: '#3b82f6',
  },
  {
    icon: BookOpen,
    title: 'Repertório Personalizado',
    description:
      'Construa e organize aberturas alinhadas ao seu estilo. Salve variantes, anote ideias e acesse de qualquer dispositivo.',
    accent: '#6366f1',
  },
  {
    icon: Target,
    title: 'Treino Adaptativo',
    description:
      'Drill inteligente que identifica seus pontos fracos e reforça as linhas que você mais precisa praticar.',
    accent: '#8b5cf6',
  },
  {
    icon: Zap,
    title: 'Análise Stockfish',
    description:
      'Avaliações precisas com a melhor engine do mundo integrada diretamente na plataforma, sem configuração manual.',
    accent: '#f59e0b',
  },
  {
    icon: Users,
    title: 'Preparação de Adversários',
    description:
      'Analise o estilo e as aberturas favoritas de seus oponentes e prepare-se estrategicamente para cada partida.',
    accent: '#22c55e',
  },
  {
    icon: BarChart3,
    title: 'Estatísticas Avançadas',
    description:
      'Acompanhe seu progresso com métricas detalhadas: taxa de acerto, linhas dominadas e evolução ao longo do tempo.',
    accent: '#ef4444',
  },
  {
    icon: Layers,
    title: 'Estruturas de Peões',
    description:
      'Entenda as estruturas típicas de cada abertura, seus planos característicos e como transponar para finais favoráveis.',
    accent: '#14b8a6',
  },
  {
    icon: Shield,
    title: 'Seguro e Privado',
    description:
      'Seus dados e repertórios protegidos com autenticação moderna, RLS e criptografia de ponta a ponta.',
    accent: '#64748b',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="section-padding gradient-section">
      <div className="container-app">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge badge-neutral mb-4">Recursos da plataforma</span>
          <h2 className="text-headline text-neutral-900 mb-4">
            Tudo que você precisa para{' '}
            <span className="gradient-text-accent">dominar aberturas</span>
          </h2>
          <p className="text-body-lg max-w-2xl mx-auto">
            Uma plataforma completa que combina análise técnica rigorosa com
            explicações pedagógicas acessíveis para jogadores de todos os níveis.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="card-surface p-6 group hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 cursor-default"
            >
              <div
                className="feature-icon mb-4 group-hover:scale-105 transition-transform duration-200"
                style={{
                  background: `${feature.accent}10`,
                  borderColor: `${feature.accent}20`,
                  color: feature.accent,
                }}
              >
                <feature.icon size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-neutral-800 mb-2 text-[0.9375rem]">
                {feature.title}
              </h3>
              <p className="text-caption leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
