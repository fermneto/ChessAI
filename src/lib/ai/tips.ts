import { aiService } from './service';
import { createClient } from '@/lib/supabase/server';

export interface DailyTip {
  title: string;
  content: string;
}

export async function getDailyTip(): Promise<DailyTip> {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // 1. Tentar buscar do banco de dados primeiro
    const { data: existingTip } = await (supabase.from('daily_tips') as any)
      .select('title, content')
      .eq('date', today)
      .maybeSingle();

    if (existingTip) {
      return existingTip as DailyTip;
    }

    // 2. Se não existir, gerar com IA
    const prompt = `
      Você é um mestre de xadrez pedagógico. Gere uma "Dica de Xadrez do Dia".
      Pode ser sobre uma abertura, um conceito tático, estratégia de meio-jogo ou final.
      A dica deve ser curta, profissional, instrutiva e em Português Brasileiro.
      
      Retorne um objeto JSON exatamente neste formato:
      {
        "title": "Título Curto",
        "content": "Explicação concisa de 2 a 3 frases."
      }
    `;

    const aiTip = await aiService.generateJSON<DailyTip>(prompt);

    // 3. Salvar no banco para cache (usando upsert para evitar erros de duplicidade)
    await (supabase.from('daily_tips') as any)
      .upsert({
        date: today,
        title: aiTip.title,
        content: aiTip.content
      }, { onConflict: 'date' });

    return aiTip;

  } catch (error) {
    console.error('[Tip Service Critical Error]:', error);
    return {
      title: "Desenvolvimento de Peças",
      content: "Priorize o desenvolvimento das suas peças menores (bispos e cavalos) para o centro no início da partida."
    };
  }
}
