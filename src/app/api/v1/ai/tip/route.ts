import { aiService } from '@/lib/ai/service';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * @api {get} /api/v1/ai/tip Obter dica diária
 * @apiVersion 1.0.0
 * @apiGroup AI
 * @apiPermission Authenticated
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'Não autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // 1. Verificar cache do banco
    const { data: existingTip } = await (supabase
      .from('daily_tips') as any)
      .select('*')
      .eq('date', today)
      .single();

    if (existingTip) {
      return NextResponse.json({ status: 'success', data: existingTip });
    }

    // 2. Consultar IA
    const prompt = `
      Você é um mestre de xadrez pedagógico. Gere uma "Dica de Abertura do Dia".
      A dica deve ser curta, profissional e instrutiva.
      
      Retorne um objeto JSON:
      {
        "title": "Nome da Abertura ou Conceito",
        "content": "Uma explicação concisa de 2-3 frases."
      }
    `;

    interface Tip { title: string; content: string; }
    const aiTip = await aiService.generateJSON<Tip>(prompt);

    // 3. Salvar cache
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

    return NextResponse.json({ status: 'success', data: newTip });

  } catch (error: any) {
    console.error('[API v1 AI Tip Error]:', error);
    return NextResponse.json({
      status: 'success', // Fallback amigável
      data: {
        title: "Abertura Italiana",
        content: "Desenvolva o bispo para c4 visando o ponto fraco f7. É uma das aberturas mais sólidas para iniciantes e mestres."
      }
    });
  }
}
