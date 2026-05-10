'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CtaSection() {
  return (
    <>
      {/* CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-slate-950">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="container-app relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2L11 7H16L12 10.5L13.5 16L9 13L4.5 16L6 10.5L2 7H7L9 2Z" fill="white" opacity="0.9" />
                </svg>
              </div>
            </div>

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
