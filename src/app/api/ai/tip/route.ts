import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function GET() {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // 1. Verificar se já existe uma dica para hoje no cache do banco
    const { data: existingTip } = await supabase
      .from('daily_tips')
      .select('*')
      .eq('date', today)
      .single();

    if (existingTip) {
      return NextResponse.json(existingTip);
    }

    // 2. Se não existir, consultar a IA
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `
      Você é um mestre de xadrez pedagógico. Gere uma "Dica de Abertura do Dia" para um aplicativo de estudo.
      A dica deve ser curta, profissional e instrutiva.
      
      Retorne APENAS um objeto JSON no seguinte formato (sem markdown):
      {
        "title": "Nome da Abertura ou Conceito",
        "content": "Uma explicação concisa de 2-3 frases sobre a ideia principal, lances chave ou uma armadilha comum."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpar o texto caso a IA retorne markdown
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiTip = JSON.parse(jsonStr);

    // 3. Salvar no banco para os próximos acessos do dia
    const { data: newTip, error: saveError } = await supabase
      .from('daily_tips')
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
