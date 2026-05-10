import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import RepertoireDetail from '@/components/repertoire/RepertoireDetail';
import type { Database } from '@/types/database';
import { isValidUUID } from '@/lib/utils/security';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isValidUUID(id)) return { title: 'ID Inválido' };
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from('repertoires')
    .select('*')
    .eq('id', id)
    .eq('user_id', user?.id ?? '')
    .single();

  const name = (data as Database['public']['Tables']['repertoires']['Row'] | null)?.name;

  return {
    title: name ?? 'Repertório',
    description: `Estudo de abertura: ${name ?? ''}`,
  };
}

export default async function RepertoirePage({ params }: Props) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: repertoire, error } = await supabase
    .from('repertoires')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !repertoire) notFound();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-20">
        <div className="container-app h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L11 7H16L12 10.5L13.5 16L9 13L4.5 16L6 10.5L2 7H7L9 2Z" fill="white"/>
              </svg>
            </div>
            <span className="font-semibold text-neutral-900 text-sm">ChessAI</span>
          </div>
        </div>
      </header>

      <RepertoireDetail repertoire={repertoire} />
    </div>
  );
}
