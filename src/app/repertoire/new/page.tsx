'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Crown, CircleDot } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type RepertoireInsert = Database['public']['Tables']['repertoires']['Insert'];

const colorOptions = [
  {
    value: 'white' as const,
    label: 'Brancas',
    icon: Crown,
    description: 'Repertório para jogar com as peças brancas',
    gradient: 'from-slate-50 to-white',
    border: 'border-neutral-200',
    activeBorder: 'border-neutral-900',
    activeRing: 'ring-neutral-900/10',
  },
  {
    value: 'black' as const,
    label: 'Pretas',
    icon: CircleDot,
    description: 'Repertório para jogar com as peças pretas',
    gradient: 'from-neutral-800 to-neutral-900',
    border: 'border-neutral-300',
    activeBorder: 'border-neutral-900',
    activeRing: 'ring-neutral-900/10',
  },
];

export default function NewRepertoirePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<'white' | 'black'>('white');
  const [openingName, setOpeningName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Você precisa estar logado.');
      setLoading(false);
      return;
    }

    const insertData: RepertoireInsert = {
      user_id: user.id,
      name: name.trim(),
      description: description.trim() || null,
      color,
      opening_name: openingName.trim() || null,
      moves: {},
      is_public: false,
      tags: [],
    };

    const { data, error: insertError } = await supabase
      .from('repertoires')
      .insert(insertData as any) // Cast to any to bypass the never error if inference still fails
      .select('*')
      .single();

    const insertedData = data as Database['public']['Tables']['repertoires']['Row'] | null;

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else if (insertedData) {
      router.push(`/repertoire/${insertedData.id}`);
    } else {
      setError('Ocorreu um erro ao criar o repertório.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-20">
        <div className="container-app h-14 flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>
      </header>

      <div className="container-app py-10 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-headline text-neutral-900 mb-2">
            Novo Repertório
          </h1>
          <p className="text-body mb-10">
            Defina o nome e a cor do seu novo estudo de abertura.
          </p>

          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Color selection */}
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-3">
                Cor das peças
              </label>
              <div className="grid grid-cols-2 gap-3">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setColor(opt.value)}
                    className={`
                      relative p-5 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer
                      ${color === opt.value
                        ? `${opt.activeBorder} ring-4 ${opt.activeRing}`
                        : `${opt.border} hover:border-neutral-400`
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-lg bg-gradient-to-br ${opt.gradient}
                      flex items-center justify-center mb-3 border border-neutral-200
                    `}>
                      <opt.icon
                        size={20}
                        className={opt.value === 'white' ? 'text-neutral-700' : 'text-white'}
                      />
                    </div>
                    <p className="font-semibold text-neutral-900 text-sm">{opt.label}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{opt.description}</p>
                    {color === opt.value && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="rep-name" className="block text-sm font-semibold text-neutral-800 mb-1.5">
                Nome do repertório <span className="text-red-400">*</span>
              </label>
              <input
                id="rep-name"
                type="text"
                required
                maxLength={100}
                placeholder="Ex: Siciliana Najdorf, Gambito da Dama..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Opening name */}
            <div>
              <label htmlFor="rep-opening" className="block text-sm font-semibold text-neutral-800 mb-1.5">
                Abertura principal
                <span className="text-neutral-400 font-normal ml-1">(opcional)</span>
              </label>
              <input
                id="rep-opening"
                type="text"
                maxLength={100}
                placeholder="Ex: Defesa Siciliana, Ruy Lopez..."
                value={openingName}
                onChange={(e) => setOpeningName(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="rep-description" className="block text-sm font-semibold text-neutral-800 mb-1.5">
                Descrição
                <span className="text-neutral-400 font-normal ml-1">(opcional)</span>
              </label>
              <textarea
                id="rep-description"
                rows={3}
                maxLength={500}
                placeholder="Anotações sobre o repertório, objetivos, variantes que quer estudar..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                id="create-repertoire-submit"
                type="submit"
                disabled={loading || !name.trim()}
                className="btn btn-primary btn-lg"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  'Criar repertório'
                )}
              </button>
              <Link href="/dashboard" className="btn btn-ghost btn-lg">
                Cancelar
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
