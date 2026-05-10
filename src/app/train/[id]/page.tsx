import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ChevronLeft, Target } from 'lucide-react';
import Link from 'next/link';
import TrainingSession from '../../../components/training/TrainingSession';
import { isValidUUID } from '@/lib/utils/security';

type Props = { params: Promise<{ id: string }> };

export default async function TrainingPage({ params }: Props) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data, error } = await supabase
    .from('repertoires')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) notFound();
  const repertoire = data as any; // Cast to bypass strict inference issues in build worker

  return (
    <div className="min-h-screen bg-neutral-900 text-white overflow-hidden flex flex-col">
      {/* Dark Minimalist Header */}
      <header className="bg-neutral-900 border-b border-white/5 h-14 flex items-center shrink-0">
        <div className="container-app flex items-center justify-between">
          <Link
            href="/train"
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            Sair do Treino
          </Link>
          
          <div className="flex items-center gap-2">
            <Target size={16} className="text-orange-500 animate-pulse" />
            <span className="font-bold text-xs uppercase tracking-[0.2em] text-neutral-400">
              Training Mode: <span className="text-white">{repertoire.name}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-tighter">Powered by</span>
                <span className="text-[10px] font-black text-orange-500 tracking-wider">OTEN AI</span>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <TrainingSession repertoire={repertoire as any} />
      </main>
    </div>
  );
}
