import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const {
      fen,
      history,
      opening,
      evaluation,
      bestLine,
      turn,
      repertoireName,
      repertoireDescription,
      previousComments
    } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        commentary: "A chave de API da IA não foi configurada. Por favor, adicione GOOGLE_GENERATIVE_AI_API_KEY ao seu arquivo .env.local para habilitar as explicações pedagógicas."
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `
      Você é um treinador de xadrez de elite e mentor pedagógico. Sua tarefa é fornecer uma explicação estratégica brilhante sobre a posição atual.

      ESTUDO ATUAL:
      - Nome do Repertório: ${repertoireName || 'Estudo Geral'}
      - Descrição do Objetivo: ${repertoireDescription || 'Melhorar a compreensão da abertura'}

      CONTEXTO TÉCNICO:
      - Posição (FEN): ${fen}
      - Histórico de lances: ${history.join(', ')}
      - Abertura identificada: ${opening || 'Desconhecida'}
      - Avaliação da Engine: ${evaluation}
      - Linha Recomendada (Stockfish): ${bestLine ? bestLine.join(' ') : 'Calculando...'}
      - Vez de jogar: ${turn === 'w' ? 'Brancas' : 'Pretas'}

      HISTÓRICO DA CONVERSA (Seus comentários anteriores):
      ${previousComments && previousComments.length > 0 ? previousComments.map((c: string, i: number) => `Comentário ${i + 1}: ${c}`).join('\n') : 'Nenhum comentário anterior.'}

      INSTRUÇÕES:
      1. Seja conciso (máximo 3-4 frases), com retornos claros, sem muita enrolação.
      2. Use a "Linha Recomendada" para explicar o plano tático ou estratégico imediato.
      3. Explique o PORQUÊ de o Stockfish sugerir esses lances, focando em conceitos (par de bispos, coluna aberta, segurança do rei, etc).
      4. Conecte sua explicação ao objetivo do estudo ("${repertoireName}") se possível.
      5. NÃO se repita em relação aos comentários anteriores. Use-os para dar CONTINUIDADE ao raciocínio.
      6. Responda em Português do Brasil com um tom profissional e inspirador.

      Responda apenas com o texto do comentário.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let text = '';
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    } catch (err: any) {
      console.warn('Falha no modelo gemini-2.5-flash, tentando gemini-2.0-flash...', err.message);
      const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await fallbackModel.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    }

    if (!text) throw new Error('A IA não retornou uma resposta válida.');

    return NextResponse.json({ commentary: text });
  } catch (error: any) {
    const isRateLimit = error.message?.includes('429') || error.status === 429;

    if (isRateLimit) {
      return NextResponse.json({
        error: "O treinador OTEN AI atingiu o limite de consultas gratuitas (Quota Exceeded). Por favor, aguarde um minuto antes de solicitar uma nova análise estratégica.",
        isQuotaError: true
      }, { status: 429 });
    }

    console.error('AI Commentary Error Detail:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({
      error: `Erro na IA: ${error.message || 'Falha desconhecida'}`,
      detail: error.stack
    }, { status: 500 });
  }
}
