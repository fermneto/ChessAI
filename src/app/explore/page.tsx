import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Globe, Search, Crown, CircleDot, ChevronRight, BookOpen, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explorador de Aberturas | ChessAI',
  description: 'Explore repertórios de abertura publicados pela comunidade.',
};

export const dynamic = 'force-dynamic';

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; color?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { q, color } = await searchParams;

  let query = (supabase.from('repertoires') as any)
    .select('id, name, description, color, opening_name, total_moves_studied, created_at, user_id')
    .eq('is_public', true);

  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  if (color && (color === 'white' || color === 'black')) {
    query = query.eq('color', color);
  }

  const { data: repertoires } = await query
    .order('created_at', { ascending: false })
    .limit(60);


  const items = (repertoires || []) as any[];

  // Fetch author profiles separately to avoid JOIN errors
  const userIds = [...new Set(items.map((r) => r.user_id))];
  const { data: profiles } = await (supabase.from('profiles') as any)
    .select('id, full_name, username')
    .in('id', userIds);

  const profileMap: Record<string, any> = {};
  (profiles || []).forEach((p: any) => {
    profileMap[p.id] = p;
  });



  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-20">
        <div className="container-app h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-blue-500" />
            <h1 className="font-bold text-neutral-900 text-sm uppercase tracking-wider">
              Explorador de Aberturas
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="container-app py-10 max-w-5xl">
        {/* Hero */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Repertórios da Comunidade</h2>
          <p className="text-neutral-500">
            Explore e analise repertórios publicados por outros jogadores.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <form method="GET" className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              name="q"
              defaultValue={q}
              type="text"
              placeholder="Buscar por nome da abertura..."
              className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
            />
          </div>
          <select
            name="color"
            defaultValue={color || ''}
            className="px-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-neutral-700"
          >
            <option value="">Todas as cores</option>
            <option value="white">Brancas</option>
            <option value="black">Pretas</option>
          </select>
          <button
            type="submit"
            className="btn btn-primary btn-md px-6"
          >
            Buscar
          </button>
        </form>

        {/* Results Count */}
        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-4">
          {items.length} repertório{items.length !== 1 ? 's' : ''} encontrado{items.length !== 1 ? 's' : ''}
        </p>

        {items.length === 0 ? (
          <div className="card-surface p-12 text-center">
            <div className="text-4xl mb-4 text-neutral-200">♟️</div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Nenhum repertório encontrado</h3>
            <p className="text-neutral-500">Tente outros termos de busca ou seja o primeiro a publicar!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((rep: any) => (
              <Link
                key={rep.id}
                href={`/explore/${rep.id}`}
                className="group card-surface p-6 hover:border-blue-200 hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110
                    ${rep.color === 'white'
                      ? 'bg-gradient-to-br from-slate-50 to-white border border-neutral-200'
                      : 'bg-gradient-to-br from-neutral-800 to-neutral-900'
                    }
                  `}>
                    {rep.color === 'white'
                      ? <Crown size={20} className="text-neutral-700" />
                      : <CircleDot size={20} className="text-white" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-neutral-900 group-hover:text-blue-600 transition-colors truncate">
                      {rep.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {rep.opening_name || 'Abertura personalizada'}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      {/* Author name, anonimous yet
                      <span className="flex items-center gap-1 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                        <BookOpen size={11} />
                        por {(() => {
                          const p = profileMap[rep.user_id];
                          return p?.full_name || p?.username || 'Anônimo';
                        })()}
                      </span>*/}
                      <span className="flex items-center gap-1 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                        <BarChart3 size={11} />
                        {rep.total_moves_studied || 0} lances
                      </span>
                    </div>
                    {rep.tags && rep.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {rep.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="badge badge-neutral text-[10px] px-1.5 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 group-hover:text-blue-400 transition-colors"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
