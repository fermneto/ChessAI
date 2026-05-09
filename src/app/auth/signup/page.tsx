'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, Chrome, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const passwordRequirements = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Um número', test: (p: string) => /\d/.test(p) },
];

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 max-w-md w-full text-center"
        >
          <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
            <Check size={24} className="text-green-500" strokeWidth={2.5} />
          </div>
          <h2 className="text-title text-neutral-900 mb-3">Verifique seu email</h2>
          <p className="text-body mb-6">
            Enviamos um link de confirmação para <strong className="text-neutral-800">{email}</strong>.
            Clique no link para ativar sua conta.
          </p>
          <Link href="/auth/login" className="btn btn-primary btn-md">
            Ir para o login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-indigo-100/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative"
      >
        <div className="glass-card p-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Voltar ao início
          </Link>

          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L11 7H16L12 10.5L13.5 16L9 13L4.5 16L6 10.5L2 7H7L9 2Z" fill="white"/>
              </svg>
            </div>
            <span className="font-semibold text-neutral-900">ChessAI</span>
          </div>

          <h1 className="text-title text-neutral-900 mb-1.5">Criar conta grátis</h1>
          <p className="text-body mb-8">Comece a construir seus repertórios hoje.</p>

          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            id="signup-google"
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="btn btn-ghost btn-md w-full mb-5 gap-3"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
            ) : (
              <Chrome size={18} className="text-neutral-600" />
            )}
            Continuar com Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-caption">ou</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Nome completo
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" />
                <input
                  id="signup-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" />
                <input
                  id="signup-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password requirements */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req) => (
                    <div key={req.label} className="flex items-center gap-1.5">
                      <div
                        className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${
                          req.test(password) ? 'bg-green-400' : 'bg-neutral-200'
                        }`}
                      >
                        {req.test(password) && <Check size={8} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-xs transition-colors ${req.test(password) ? 'text-green-600' : 'text-neutral-400'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading || googleLoading}
              className="btn btn-primary btn-md w-full mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                'Criar minha conta'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-neutral-400 mt-4">
            Ao criar uma conta, você concorda com os{' '}
            <Link href="/terms" className="underline hover:text-neutral-600">Termos de uso</Link>
            {' '}e a{' '}
            <Link href="/privacy" className="underline hover:text-neutral-600">Política de privacidade</Link>.
          </p>

          <p className="text-center text-sm text-neutral-400 mt-5">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="text-neutral-800 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
