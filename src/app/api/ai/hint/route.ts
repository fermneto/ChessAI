import { aiService } from '@/lib/ai/service';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const {
      fen,
      expectedMove,
      history,
      opening,
      repertoireName,
      turn
    } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        hint: "Dica: Tente focar no controle do centro e desenvolvimento das peças."
      });
    }

    const prompt = `
      Você é um mentor de xadrez que ajuda o aluno a lembrar seu próprio repertório.
      O aluno está treinando o repertório "${repertoireName}".
      
      POSIÇÃO ATUAL:
      - FEN: ${fen}
      - Histórico: ${history.join(', ')}
      - Abertura: ${opening || 'Desconhecida'}
      - Vez de jogar: ${turn === 'w' ? 'Brancas' : 'Pretas'}
      
      O lance correto que o aluno deve fazer é: ${expectedMove}
      
      SUA TAREFA:
      Forneça uma DICA SUTIL que ajude o aluno a encontrar o lance "${expectedMove}" sem dizer o lance diretamente (se possível, ou dê apenas a primeira letra/peça).
      Explique a IDEIA ESTRATÉGICA por trás desse lance.
      
      Exemplo: Se o lance for "e4", diga "Tente controlar o centro com seu peão de rei para abrir caminhos para o bispo e a dama."
      
      INSTRUÇÕES:
      1. Seja encorajador e conciso (máximo 2 frases).
      2. Responda em Português do Brasil.
      3. Não seja óbvio demais, instigue o pensamento.
      
      Responda apenas com o texto da dica.
    `;

    const text = await aiService.generateText(prompt);

    return NextResponse.json({ hint: text });
  } catch (error: any) {
    console.error('AI Hint Error:', error);
    return NextResponse.json({
      hint: "Não consegui gerar uma dica agora, mas foque nos princípios básicos da abertura!"
    });
  }
}
