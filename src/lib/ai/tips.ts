import { aiService } from './service';
import { createClient } from '@/lib/supabase/server';

export interface DailyTip {
  title: string;
  content: string;
}

export async function getDailyTip(): Promise<DailyTip> {
  const today = new Date().toISOString().split('T')[0];

  try {
    const supabase = await createClient();

    // 1. Try to get from database first
    const { data: existingTip, error: fetchError } = await (supabase.from('daily_tips') as any)
      .select('title, content')
      .eq('date', today)
      .maybeSingle();

    if (existingTip) {
      return existingTip as DailyTip;
    }

    if (fetchError) {
      console.error('[DailyTip] Erro ao buscar dica do dia:', fetchError);
    }

    // 2. Fetch recent tips for variety context
    const { data: recentTips } = await (supabase.from('daily_tips') as any)
      .select('title')
      .order('date', { ascending: false })
      .limit(7);

    const avoidList = recentTips?.map((t: any) => t.title).join(', ') || 'Nenhuma';

    const prompt = `
      Você é um mestre de xadrez pedagógico e criativo. Gere uma "Dica de Xadrez do Dia" única e instrutiva.
      
      IMPORTANTE: Já falamos recentemente sobre os seguintes temas, então NÃO os repita: [${avoidList}].
      Tente variar entre tática, estratégia, aberturas, finais e psicologia do jogo.
      
      A dica deve ser curta, profissional, instrutiva e em Português Brasileiro.
      
      Retorne um objeto JSON exatamente neste formato:
      {
        "title": "Título Curto e Original",
        "content": "Explicação concisa de 2 a 3 frases com um ensinamento prático."
      }
    `;

    // 3. Generate with AI
    console.log('[DailyTip] Gerando nova dica com Groq IA...');
    const aiTip = await aiService.generateJSON<DailyTip>(prompt);

    // 4. Try to persist in background (don't block if DB fails)
    try {
      const { error: upsertError } = await (supabase.from('daily_tips') as any)
        .upsert({
          date: today,
          title: aiTip.title,
          content: aiTip.content
        }, { onConflict: 'date' });

      if (upsertError) throw upsertError;
      //after console.log('[DailyTip] Dica salva com sucesso no banco.');
    } catch (dbError) {
      //log but don't fail, because we have the AI tip ready to show
      //after console.error('[DailyTip] Erro ao salvar dica no banco (IA OK):', dbError);
    }

    return aiTip;

  } catch (error) {
    console.error('[DailyTip Critical Fallback]:', error);
    return {
      title: "Exploração de Casas Fracas",
      content: "Identifique casas que não podem mais ser defendidas por peões e tente posicionar suas peças nelas, especialmente cavalos."
    };
  }
}
