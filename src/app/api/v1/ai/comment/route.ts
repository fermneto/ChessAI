import { aiService } from '@/lib/ai/service';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * @api {post} /api/v1/ai/coment
 * @apiVersion 1.0.0
 * @apiGroup AI
 * @apiPermission Authenticated
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'Não autorizado', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Context
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
      lastMoveSan,
      isMoveAnalysis,
      previousComments
    } = body;

    if (!fen || typeof fen !== 'string') {
      return NextResponse.json(
        { status: 'error', message: 'FEN inválida ou ausente', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    if (!Array.isArray(history)) {
      return NextResponse.json(
        { status: 'error', message: 'Histórico deve ser um array', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { status: 'error', message: 'Configuração de IA pendente', code: 'CONFIG_MISSING' },
        { status: 503 }
      );
    }

    const prompt = `
      Você é um treinador de xadrez de elite e mentor pedagógico. Sua tarefa é fornecer uma explicação estratégica brilhante sobre a posição atual.

      ESTUDO ATUAL:
      - Nome do Repertório: ${repertoireName || 'Estudo Geral'}
      - Descrição do Objetivo: ${repertoireDescription || 'Melhorar a compreensão da abertura'}

      CONTEXTO TÉCNICO:
      - Motor de Análise: ${engineEnabled ? 'LIGADO' : 'DESLIGADO'}
      - Posição (FEN): ${fen}
      - Histórico de lances: ${history.join(', ')}
      - Abertura identificada: ${opening || 'Desconhecida'}
      - Avaliação da Engine: ${engineEnabled ? evaluation : 'N/A'}
      - Linha Recomendada (Stockfish): ${engineEnabled && bestLine ? bestLine.join(' ') : 'N/A'}
      - Vez de jogar: ${turn === 'w' ? 'Brancas' : 'Pretas'}

      HISTÓRICO DA CONVERSA (Seus comentários anteriores):
      ${previousComments && previousComments.length > 0 ? previousComments.map((c: string, i: number) => `Comentário ${i + 1}: ${c}`).join('\n') : 'Nenhum comentário anterior.'}

      INSTRUÇÕES CRÍTICAS:
      ${isMoveAnalysis && lastMoveSan
        ? `0. FOQUE EXCLUSIVAMENTE NO ÚLTIMO LANCE: "${lastMoveSan}". Explique se foi um bom lance, um erro ou uma imprecisão baseado na avaliação atual (${evaluation}).`
        : ''
      }
      ${engineEnabled
        ? `1. ANALISE PROFUNDAMENTE a "Linha Recomendada" (${bestLine ? bestLine.join(' ') : 'N/A'}). Explique o MOTIVO tático/estratégico desses lances.
           2. Explique o PORQUÊ de a avaliação ser ${evaluation}. Se estiver vantajoso, diga como converter; se estiver pior, diga como lutar.`
        : `1. FOQUE EM CONCEITOS GERAIS: estrutura de peões, segurança do rei, desenvolvimento e controle do centro.
           2. Não mencione números ou linhas específicas da engine, aja como um mestre observando o tabuleiro.`
      }
      3. Seja conciso (máximo 3-4 frases), com retornos claros.
      4. Conecte sua explicação ao objetivo do estudo se possível.
      5. ${lastMoveSan ? `Mencione o lance "${lastMoveSan}" na sua explicação.` : 'Analise a posição de forma fluida.'}
      6. NÃO se repita em relação aos comentários anteriores.
      7. Responda em Português do Brasil com um tom profissional e inspirador.

      Responda apenas com o texto do comentário.
    `;

    const text = await aiService.generateText(prompt);

    if (!text) {
      throw new Error('A IA não retornou uma resposta válida.');
    }

    return NextResponse.json({
      status: 'success',
      data: { commentary: text },
      meta: { timestamp: new Date().toISOString() }
    });

  } catch (error: any) {
    const isRateLimit = error.message?.includes('429') || error.status === 429;

    if (isRateLimit) {
      return NextResponse.json({
        status: 'error',
        message: "Limite de requisições da IA atingido. Tente novamente em alguns segundos.",
        code: 'RATE_LIMIT_EXCEEDED'
      }, { status: 429 });
    }

    console.error('[API v1 AI Comment Error]:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Ocorreu um erro interno ao processar sua análise.',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
