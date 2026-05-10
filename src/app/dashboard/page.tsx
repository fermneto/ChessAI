import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BookOpen, Target, BarChart3, Plus, ChevronRight, Clock, TrendingUp, Crown, CircleDot } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { Database } from '@/types/database';

type Repertoire = Database['public']['Tables']['repertoires']['Row'];

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Seu painel de controle de repertórios e treinos.',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const userName = user.user_metadata?.full_name?.split(' ')[0] ?? 'Jogador';

  // 1. Fetch repertoires
  const { data, error } = await supabase
    .from('repertoires')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching repertoires:', error);
  }

  const repertoires = (data as Repertoire[] | null) ?? [];
  const repCount = repertoires.length;

  // 2. Fetch Daily Tip (Server Side)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  let dailyTip = { title: "Abertura Italiana", content: "Desenvolva o bispo para c4 visando o ponto fraco f7. É uma das aberturas mais sólidas para iniciantes e mestres." };
  
  try {
    const tipRes = await fetch(`${baseUrl}/api/ai/tip`, { next: { revalidate: 3600 } });
    if (tipRes.ok) {
      dailyTip = await tipRes.json();
    }
  } catch (err) {
    console.error("Erro ao buscar dica:", err);
  }

  // 3. Calculate total study stats
  const totalSeconds = repertoires.reduce((acc, rep) => acc + (rep.total_study_time || 0), 0);
  const totalMoves = repertoires.reduce((acc, rep) => acc + (rep.total_moves_studied || 0), 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = (totalSeconds / 3600).toFixed(1);

  const stats = [
    { label: 'Repertórios', value: String(repCount), icon: BookOpen, trend: null },
    { label: 'Treinos realizados', value: '0', icon: Target, trend: null },
    { label: 'Lances estudados', value: String(totalMoves), icon: BarChart3, trend: null },
    { label: 'Tempo total', value: totalSeconds > 3600 ? `${totalHours}h` : `${totalMinutes}m`, icon: Clock, trend: null },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const formatStudyTime = (seconds: number) => {
    if (!seconds) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-20">
        <div className="container-app h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L11 7H16L12 10.5L13.5 16L9 13L4.5 16L6 10.5L2 7H7L9 2Z" fill="white"/>
              </svg>
            </div>
            <span className="font-semibold text-neutral-900 text-sm">ChessAI</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500 hidden sm:block">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button
                id="dashboard-signout"
                type="submit"
                className="btn btn-ghost btn-sm text-sm"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="container-app py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-headline text-neutral-900 mb-1">
            Olá, {userName} ♟
          </h1>
          <p className="text-body">
            Pronto para construir seu repertório de aberturas hoje?
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card-surface p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-caption">{stat.label}</span>
                <stat.icon size={16} className="text-neutral-300" />
              </div>
              <div className="text-2xl font-bold text-neutral-900 tabular-nums">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Repertoires */}
          <div className="lg:col-span-2 card-surface p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-neutral-900">Meus Repertórios</h2>
              <Link
                href="/repertoire/new"
                id="new-repertoire-btn"
                className="btn btn-primary btn-sm gap-1.5"
              >
                <Plus size={14} />
                Novo repertório
              </Link>
            </div>

            {repCount === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="text-4xl mb-4">♜</div>
                <h3 className="font-semibold text-neutral-800 mb-2">
                  Nenhum repertório ainda
                </h3>
                <p className="text-body text-sm max-w-xs mb-5">
                  Crie seu primeiro repertório de abertura e comece a estudar com análise de IA.
                </p>
                <Link
                  href="/repertoire/new"
                  className="btn btn-outline btn-sm gap-1.5"
                >
                  <Plus size={14} />
                  Criar primeiro repertório
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {repertoires.map((rep: Repertoire) => (
                  <Link
                    key={rep.id}
                    href={`/repertoire/${rep.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-neutral-50 transition-all group border border-transparent hover:border-neutral-100"
                  >
                    {/* Color icon */}
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                      ${rep.color === 'white'
                        ? 'bg-gradient-to-br from-slate-50 to-white border border-neutral-200'
                        : 'bg-gradient-to-br from-neutral-800 to-neutral-900'
                      }
                    `}>
                      {rep.color === 'white'
                        ? <Crown size={18} className="text-neutral-700" />
                        : <CircleDot size={18} className="text-white" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                        {rep.name}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5 truncate">
                        {rep.opening_name
                          ? `${rep.opening_name} · ${rep.color === 'white' ? 'Brancas' : 'Pretas'}`
                          : rep.color === 'white' ? 'Brancas' : 'Pretas'
                        }
                      </p>
                    </div>

                    {/* Date + time + arrow */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="hidden sm:flex flex-col items-end gap-0.5">
                        <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                          {formatDate(rep.updated_at)}
                        </span>
                        <div className="flex items-center gap-1 text-blue-500/50">
                          <Clock size={10} />
                          <span className="text-[10px] font-bold">
                            {formatStudyTime(rep.total_study_time || 0)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <div className="card-surface p-5">
              <h2 className="font-semibold text-neutral-900 mb-4 text-sm uppercase tracking-wider opacity-60">Ações rápidas</h2>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: 'Novo repertório', href: '/repertoire/new', icon: Plus, color: 'text-blue-500' },
                  { label: 'Explorar aberturas', href: '/openings', icon: BookOpen, color: 'text-emerald-500' },
                  { label: 'Iniciar treino', href: '/train', icon: Target, color: 'text-orange-500' },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-all group border border-transparent hover:border-neutral-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                      <action.icon size={15} className={action.color} />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">{action.label}</span>
                    <ChevronRight size={14} className="text-neutral-300 ml-auto group-hover:text-neutral-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="card-surface p-5 flex flex-col justify-between min-h-[160px]">
              <div>
                <h2 className="font-semibold text-neutral-900 mb-3 text-sm uppercase tracking-wider opacity-60">Dica do dia</h2>
                <p className="text-neutral-600 text-sm leading-relaxed italic">
                  <strong className="text-neutral-900 not-italic">{dailyTip.title}:</strong>{' '}
                  {dailyTip.content}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                    IA Ativa
                  </span>
                </div>
                <TrendingUp size={12} className="text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
