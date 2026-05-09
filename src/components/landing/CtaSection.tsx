'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

const testimonials = [
  {
    quote:
      'Finalmente entendo o porquê de cada lance. A IA explica o que nenhum livro consegue — de forma rápida e personalizada para o meu nível.',
    author: 'Rafael M.',
    rating: 1900,
    elo: 'ELO 1.900',
    initials: 'RM',
  },
  {
    quote:
      'Usei por um mês e meu repertório de abertura ficou muito mais sólido. Os drills adaptativos são excelentes para fixar as variantes.',
    author: 'Ana Clara P.',
    rating: 1650,
    elo: 'ELO 1.650',
    initials: 'AC',
  },
  {
    quote:
      'Como treinador, recomendo para meus alunos. A plataforma explica conceitos estratégicos de forma clara e acessível.',
    author: 'FM Rodrigo S.',
    rating: 2280,
    elo: 'FM • ELO 2.280',
    initials: 'FM',
  },
];

export default function CtaSection() {
  return (
    <>
      {/* Testimonials */}
      <section className="section-padding bg-white">
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="badge badge-neutral mb-4">Depoimentos</span>
            <h2 className="text-headline text-neutral-900">
              O que os jogadores dizem
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-surface p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill="#f59e0b"
                      className="text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-body mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{t.initials}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800 text-sm">{t.author}</p>
                    <p className="text-caption">{t.elo}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding gradient-dark overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="container-app relative">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="text-6xl mb-6">♟</div>
            <h2 className="text-headline text-white mb-4">
              Pronto para dominar as aberturas?
            </h2>
            <p className="text-body-lg text-neutral-400 mb-8">
              Junte-se a mais de 2.400 jogadores que já estão construindo
              repertórios mais sólidos com IA. Grátis para começar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/signup"
                id="bottom-cta-primary"
                className="btn btn-accent btn-xl gap-2"
              >
                Criar conta gratuitamente
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#features"
                className="btn btn-ghost btn-xl"
                style={{ color: '#9ca3af', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                Explorar recursos
              </Link>
            </div>
            <p className="text-sm text-neutral-500 mt-6">
              Sem cartão de crédito • Cancele quando quiser • Suporte em português
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
