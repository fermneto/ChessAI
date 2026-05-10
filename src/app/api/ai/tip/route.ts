import { aiService } from '@/lib/ai/service';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // 1. Verificar se já existe uma dica para hoje no cache do banco
    const { data: existingTip } = await (supabase
      .from('daily_tips') as any)
      .select('*')
      .eq('date', today)
      .single();

    if (existingTip) {
      return NextResponse.json(existingTip);
    }

    // 2. Se não existir, consultar a IA (Groq via Central Service)
    const prompt = `
      Você é um mestre de xadrez pedagógico. Gere uma "Dica de Abertura do Dia" para um aplicativo de estudo.
      A dica deve ser curta, profissional e instrutiva.
      
      Retorne um objeto JSON no formato:
      {
        "title": "Nome da Abertura ou Conceito",
        "content": "Uma explicação concisa de 2-3 frases sobre a ideia principal, lances chave ou uma armadilha comum."
      }
    `;

    interface Tip { title: string; content: string; }
    const aiTip = await aiService.generateJSON<Tip>(prompt);

    // 3. Salvar no banco para os próximos acessos do dia
    const { data: newTip, error: saveError } = await (supabase
      .from('daily_tips') as any)
      .insert({
        date: today,
        title: aiTip.title,
        content: aiTip.content
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return NextResponse.json(newTip);
  } catch (error) {
    console.error('Erro ao gerar dica do dia:', error);
    // Retorno de fallback caso a IA falhe
    return NextResponse.json({
      title: "Abertura Italiana",
      content: "Desenvolva o bispo para c4 visando o ponto fraco f7. É uma das aberturas mais sólidas para iniciantes e mestres."
    });
  }
}
