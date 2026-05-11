'use client';

import { useState, useCallback } from 'react';
import { Globe, Crown, CircleDot, ChevronLeft, Calendar, BarChart3, Tag, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import ExploreViewer, { type ExploreStudyState } from '@/components/explore/ExploreViewer';
import AICommentary from '@/components/repertoire/AICommentary';

interface Props {
  repertoire: any;
  authorName: string;
}

export default function ExploreDetailClient({ repertoire, authorName }: Props) {
  const [studyState, setStudyState] = useState<ExploreStudyState | null>(null);

  const handleStateChange = useCallback((state: ExploreStudyState) => {
    setStudyState(state);
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-50">
        <div className="container-app h-14 flex items-center justify-between">
          <Link
            href="/explore"
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <ChevronLeft size={16} />
            Explorador
          </Link>
          <div className="flex items-center gap-2">
            <Globe size={15} className="text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Repertório Público</span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <div className="container-app py-8 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Board */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="card-surface p-6">
              <div className="flex items-start gap-4">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                  ${repertoire.color === 'white'
                    ? 'bg-gradient-to-br from-slate-50 to-white border border-neutral-200'
                    : 'bg-gradient-to-br from-neutral-800 to-neutral-900'
                  }
                `}>
                  {repertoire.color === 'white'
                    ? <Crown size={22} className="text-neutral-700" />
                    : <CircleDot size={22} className="text-white" />
                  }
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-neutral-900 mb-1">{repertoire.name}</h1>
                  {repertoire.opening_name && (
                    <p className="text-sm text-neutral-500 font-medium">{repertoire.opening_name}</p>
                  )}
                  <p className="text-xs text-neutral-400 mt-1">
                    por <span className="font-semibold text-neutral-600">{authorName}</span>
                  </p>
                  {repertoire.description && (
                    <p className="text-sm text-neutral-600 mt-3 pt-3 border-t border-neutral-100 leading-relaxed">
                      {repertoire.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Board (read-only) */}
            <div className="card-surface p-6 relative z-0 overflow-hidden">
              <h2 className="font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Explorar Linhas
              </h2>
              <ExploreViewer repertoire={repertoire} onStateChange={handleStateChange} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Info */}
            <div className="card-surface p-5">
              <h3 className="font-semibold text-neutral-900 mb-4 text-sm">Informações</h3>
              <div className="space-y-3.5">
                <div className="flex items-center gap-3 text-sm">
                  {repertoire.color === 'white'
                    ? <Crown size={15} className="text-neutral-400 flex-shrink-0" />
                    : <CircleDot size={15} className="text-neutral-400 flex-shrink-0" />
                  }
                  <span className="text-neutral-500">Cor:</span>
                  <span className="text-neutral-800 font-medium ml-auto">
                    {repertoire.color === 'white' ? 'Brancas' : 'Pretas'}
                  </span>
                </div>

                {repertoire.eco_code && (
                  <div className="flex items-center gap-3 text-sm">
                    <Tag size={15} className="text-neutral-400 flex-shrink-0" />
                    <span className="text-neutral-500">ECO:</span>
                    <span className="text-neutral-800 font-medium ml-auto font-mono">
                      {repertoire.eco_code}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <BookOpen size={15} className="text-neutral-400 flex-shrink-0" />
                  <span className="text-neutral-500">Autor:</span>
                  <span className="text-neutral-800 font-medium ml-auto">{authorName}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={15} className="text-neutral-400 flex-shrink-0" />
                  <span className="text-neutral-500">Publicado:</span>
                  <span className="text-neutral-800 font-medium ml-auto">
                    {formatDate(repertoire.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Clock size={15} className="text-blue-400 flex-shrink-0" />
                  <span className="text-neutral-500">Tempo de estudo:</span>
                  <span className="text-blue-600 font-bold ml-auto">
                    {formatTime(repertoire.total_study_time || 0)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <BarChart3 size={15} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-neutral-500">Lances estudados:</span>
                  <span className="text-emerald-600 font-bold ml-auto">
                    {repertoire.total_moves_studied || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {repertoire.tags && repertoire.tags.length > 0 && (
              <div className="card-surface p-5">
                <h3 className="font-semibold text-neutral-900 mb-3 text-sm">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {repertoire.tags.map((tag: string) => (
                    <span key={tag} className="badge badge-neutral text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Commentary */}
            {studyState && (
              <AICommentary
                fen={studyState.fen}
                history={studyState.history}
                opening={studyState.opening}
                evaluation="0.0"
                turn={studyState.turn}
                repertoireName={repertoire.name}
                repertoireDescription={repertoire.description ?? undefined}
                engineEnabled={false}
              />
            )}

            {/* Notice: read-only */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium leading-relaxed">
                Este é um repertório público. Você pode navegar pelas linhas, mas não pode editá-lo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
