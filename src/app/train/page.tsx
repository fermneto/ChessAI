import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Target, ChevronLeft, Crown, CircleDot, ChevronRight, Play } from 'lucide-react';
import Link from 'next/link';
import type { Database } from '@/types/database';

type Repertoire = Database['public']['Tables']['repertoires']['Row'];

export default async function TrainSelectionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data } = await supabase
    .from('repertoires')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  const repertoires = (data as any[]) || [];

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-20">
        <div className="container-app h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <ChevronLeft size={16} />
            Voltar
          </Link>
          <div className="flex items-center gap-2">
            <Target size={18} className="text-orange-500" />
            <h1 className="font-bold text-neutral-900 text-sm uppercase tracking-wider">Treinamento</h1>
          </div>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      <div className="container-app py-10 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Escolha seu Repertório</h2>
          <p className="text-neutral-500">
            Selecione uma abertura para praticar seus lances contra a IA.
          </p>
        </div>

        {!repertoires || repertoires.length === 0 ? (
          <div className="card-surface p-12 text-center">
            <div className="text-4xl mb-4 text-neutral-200">♟️</div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Sem repertórios salvos</h3>
            <p className="text-neutral-500 mb-6">Você precisa criar um repertório antes de começar a treinar.</p>
            <Link href="/repertoire/new" className="btn btn-primary">
              Criar Repertório
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {repertoires.map((rep) => (
              <Link
                key={rep.id}
                href={`/train/${rep.id}`}
                className="group card-surface p-6 hover:border-orange-200 hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110
                    ${rep.color === 'white'
                      ? 'bg-gradient-to-br from-slate-50 to-white border border-neutral-200'
                      : 'bg-gradient-to-br from-neutral-800 to-neutral-900'
                    }
                  `}>
                    {rep.color === 'white'
                      ? <Crown size={24} className="text-neutral-700" />
                      : <CircleDot size={24} className="text-white" />
                    }
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-neutral-900 group-hover:text-orange-600 transition-colors">
                      {rep.name}
                    </h3>
                    <p className="text-sm text-neutral-500 mb-1">
                      {rep.opening_name || 'Personalizado'}
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">Lances</span>
                        <span className="text-sm font-bold text-neutral-700">{rep.total_moves_studied || 0}</span>
                      </div>
                      <div className="w-px h-6 bg-neutral-100" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">Cor</span>
                        <span className="text-sm font-bold text-neutral-700">{rep.color === 'white' ? 'Brancas' : 'Pretas'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute right-4 bottom-4 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-sm border border-orange-100">
                  <Play size={16} fill="currentColor" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
