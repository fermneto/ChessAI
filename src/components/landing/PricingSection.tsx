'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Crown } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

const plans = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: 'para sempre',
    description: 'Para começar a construir seu repertório.',
    icon: null,
    featured: false,
    cta: 'Criar conta grátis',
    href: '/auth/signup',
    features: [
      '3 repertórios ativos',
      'Análise básica de posições',
      'Explicações IA (10/dia)',
      'Drills de treino básicos',
      'Exportar PGN',
    ],
  },
  {
    name: 'Pro',
    price: 'R$ 39',
    period: 'por mês',
    description: 'Para jogadores sérios que querem evoluir rápido.',
    icon: Zap,
    featured: true,
    cta: 'Começar Pro',
    href: '/auth/signup?plan=pro',
    features: [
      'Repertórios ilimitados',
      'Análise Stockfish profunda',
      'Explicações IA ilimitadas',
      'Drills adaptativos avançados',
      'Preparação de adversários',
      'Estatísticas detalhadas',
      'Exportar/importar PGN & FEN',
      'Suporte prioritário',
    ],
  },
  {
    name: 'Elite',
    price: 'R$ 89',
    period: 'por mês',
    description: 'Para competidores e treinadores profissionais.',
    icon: Crown,
    featured: false,
    cta: 'Assinar Elite',
    href: '/auth/signup?plan=elite',
    features: [
      'Tudo do Pro',
      'API de análise',
      'Múltiplos perfis/alunos',
      'Relatórios PDF exportáveis',
      'Engine personalizada',
      'Suporte VIP 24/7',
      'Acesso antecipado a novidades',
    ],
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="section-padding gradient-section">
      <div className="container-app">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge badge-neutral mb-4">Planos e preços</span>
          <h2 className="text-headline text-neutral-900 mb-4">
            Invista no seu{' '}
            <span className="gradient-text-accent">nível de xadrez</span>
          </h2>
          <p className="text-body-lg max-w-xl mx-auto">
            Comece gratuitamente. Faça upgrade quando quiser acelerar sua evolução.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={clsx(
                'relative rounded-2xl p-8',
                plan.featured
                  ? 'bg-neutral-900 text-white shadow-xl scale-[1.02] border border-neutral-700'
                  : 'card-surface'
              )}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge badge-accent text-[10px] font-bold shadow-soft bg-blue-500 text-white border-blue-400">
                    MAIS POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {plan.icon && (
                    <plan.icon
                      size={16}
                      className={plan.featured ? 'text-blue-400' : 'text-neutral-500'}
                    />
                  )}
                  <h3
                    className={clsx(
                      'font-semibold text-lg',
                      plan.featured ? 'text-white' : 'text-neutral-900'
                    )}
                  >
                    {plan.name}
                  </h3>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className={clsx(
                      'text-4xl font-bold tracking-tight',
                      plan.featured ? 'text-white' : 'text-neutral-900'
                    )}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={clsx(
                      'text-sm',
                      plan.featured ? 'text-neutral-400' : 'text-neutral-400'
                    )}
                  >
                    /{plan.period}
                  </span>
                </div>
                <p
                  className={clsx(
                    'text-sm',
                    plan.featured ? 'text-neutral-400' : 'text-neutral-400'
                  )}
                >
                  {plan.description}
                </p>
              </div>

              <Link
                href={plan.href}
                className={clsx(
                  'btn btn-md w-full mb-6',
                  plan.featured ? 'btn-accent' : 'btn-outline'
                )}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      size={15}
                      strokeWidth={2.5}
                      className={clsx(
                        'mt-0.5 flex-shrink-0',
                        plan.featured ? 'text-blue-400' : 'text-neutral-400'
                      )}
                    />
                    <span
                      className={clsx(
                        'text-sm',
                        plan.featured ? 'text-neutral-300' : 'text-neutral-500'
                      )}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
