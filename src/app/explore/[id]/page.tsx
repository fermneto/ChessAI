import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Globe, Crown, CircleDot, ChevronLeft, Calendar, BarChart3, Tag, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import ExploreDetailClient from '@/components/explore/ExploreDetailClient';
import { isValidUUID } from '@/lib/utils/security';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isValidUUID(id)) return { title: 'ID Inválido' };

  const supabase = await createClient();
  const { data } = await (supabase.from('repertoires') as any)
    .select('name, opening_name')
    .eq('id', id)
    .eq('is_public', true)
    .single();

  if (!data) return { title: 'Repertório não encontrado' };
  return {
    title: `${data.name} | Explorador ChessAI`,
    description: `Explore o repertório de abertura: ${data.opening_name || data.name}`,
  };
}

export const dynamic = 'force-dynamic';

export default async function ExploreDetailPage({ params }: Props) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data, error } = await (supabase.from('repertoires') as any)
    .select(`
      *,
      profiles:user_id (
        full_name,
        username
      )
    `)
    .eq('id', id)
    .eq('is_public', true)
    .single();

  if (error || !data) notFound();

  const repertoire = data as any;
  const authorName = repertoire.profiles?.full_name || repertoire.profiles?.username || 'Anônimo';

  return <ExploreDetailClient repertoire={repertoire} authorName={authorName} />;
}

