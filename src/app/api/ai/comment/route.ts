import { aiService } from '@/lib/ai/service';
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
      engineEnabled,
      previousComments
    } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        commentary: "A chave de API da Groq não foi configurada. Por favor, adicione GROQ_API_KEY ao seu arquivo .env.local para habilitar as explicações pedagógicas ultrarrápidas."
      });
    }

    const prompt = `
      Você é um treinador de xadrez de elite e mentor pedagógico. Sua tarefa é fornecer uma explicação estratégica brilhante sobre a posição atual.

      ESTUDO ATUAL:
      - Nome do Repertório: ${repertoireName || 'Estudo Geral'}
      - Descrição do Objetivo: ${repertoireDescription || 'Melhorar a compreensão da abertura'}

      CONTEXTO TÉCNICO:
      - Motor de Análise: ${engineEnabled ? 'LIGADO (Confie nos dados abaixo)' : 'DESLIGADO (Foque apenas em conceitos gerais da posição)'}
      - Posição (FEN): ${fen}
      - Histórico de lances: ${history.join(', ')}
      - Abertura identificada: ${opening || 'Desconhecida'}
      - Avaliação da Engine: ${engineEnabled ? evaluation : 'N/A'}
      - Linha Recomendada (Stockfish): ${engineEnabled && bestLine ? bestLine.join(' ') : 'N/A'}
      - Vez de jogar: ${turn === 'w' ? 'Brancas' : 'Pretas'}

      HISTÓRICO DA CONVERSA (Seus comentários anteriores):
      ${previousComments && previousComments.length > 0 ? previousComments.map((c: string, i: number) => `Comentário ${i + 1}: ${c}`).join('\n') : 'Nenhum comentário anterior.'}

      INSTRUÇÕES CRÍTICAS:
      ${engineEnabled 
        ? `1. ANALISE PROFUNDAMENTE a "Linha Recomendada" (${bestLine ? bestLine.join(' ') : 'N/A'}). Explique o MOTIVO tático/estratégico desses lances.
           2. Explique o PORQUÊ de a avaliação ser ${evaluation}. Se estiver vantajoso, diga como converter; se estiver pior, diga como lutar.`
        : `1. FOQUE EM CONCEITOS GERAIS: estrutura de peões, segurança do rei, desenvolvimento e controle do centro.
           2. Não mencione números ou linhas específicas da engine, aja como um mestre observando o tabuleiro.`
      }
      3. Seja conciso (máximo 3-4 frases), com retornos claros.
      4. Conecte sua explicação ao objetivo do estudo ("${repertoireName}") se possível.
      5. NÃO se repita em relação aos comentários anteriores.
      6. Responda em Português do Brasil com um tom profissional e inspirador.

      Responda apenas com o texto do comentário.
    `;

    const text = await aiService.generateText(prompt);

    if (!text) throw new Error('A IA não retornou uma resposta válida.');

    return NextResponse.json({ commentary: text });
  } catch (error: any) {
    const isRateLimit = error.message?.includes('429') || error.status === 429;

    if (isRateLimit) {
      return NextResponse.json({
        error: "O treinador OTEN AI (Groq) atingiu o limite de consultas gratuitas. Por favor, aguarde alguns segundos antes de solicitar uma nova análise estratégica.",
        isQuotaError: true
      }, { status: 429 });
    }

    console.error('AI Commentary Error Detail:', error);
    return NextResponse.json({
      error: `Erro na IA (Groq): ${error.message || 'Falha desconhecida'}`
    }, { status: 500 });
  }
}
