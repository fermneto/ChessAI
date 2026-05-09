'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Zap } from 'lucide-react';
import clsx from 'clsx';

const navLinks = [
  { label: 'Recursos', href: '#features' },
  { label: 'Como funciona', href: '#how-it-works' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 inset-x-0 z-[100] transition-all duration-300',
          scrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-neutral-100 shadow-soft'
            : 'bg-transparent'
        )}
      >
        <div className="container-app">
            <nav className="flex items-center h-16">
              {/* Logo - Column 1 */}
              <div className="flex-1 flex justify-start">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 group"
                  aria-label="ChessAI Home"
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9 2L11 7H16L12 10.5L13.5 16L9 13L4.5 16L6 10.5L2 7H7L9 2Z" fill="white" opacity="0.9"/>
                    </svg>
                  </div>
                  <span className="font-semibold text-neutral-900 tracking-tight text-lg">
                    Chess<span className="text-brand-500">AI</span>
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation - Column 2 (Centered) */}
              <div className="hidden md:flex items-center gap-8 px-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="nav-link"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* CTA Buttons - Column 3 */}
              <div className="hidden md:flex-1 md:flex items-center justify-end gap-3">
                <Link href="/auth/login" className="btn btn-ghost btn-sm">
                  Entrar
                </Link>
                <Link href="/auth/signup" className="btn btn-primary btn-sm gap-1.5 font-bold">
                  Começar grátis
                  <ChevronRight size={14} strokeWidth={2.5} />
                </Link>
              </div>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle"
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 inset-x-0 z-[90] bg-white border-b border-neutral-100 shadow-large md:hidden"
          >
            <div className="container-app py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 rounded-lg text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 font-medium transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-col gap-2">
                <Link href="/auth/login" className="btn btn-ghost btn-md w-full">
                  Entrar
                </Link>
                <Link href="/auth/signup" className="btn btn-primary btn-md w-full">
                  <Zap size={16} />
                  Começar grátis
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
