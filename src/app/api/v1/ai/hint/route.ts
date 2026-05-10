import { aiService } from '@/lib/ai/service';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * @api {post} /api/v1/ai/hint Pedir dica de lance
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

    const {
      fen,
      expectedMove,
      history,
      opening,
      repertoireName,
      turn
    } = body;

    // Validação
    if (!fen || !expectedMove) {
      return NextResponse.json(
        { status: 'error', message: 'FEN e lance esperado são obrigatórios', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        status: 'success', 
        data: { hint: "Dica: Tente focar no controle do centro e desenvolvimento das peças." } 
      });
    }

    const prompt = `
      Você é um mentor de xadrez que ajuda o aluno a lembrar seu próprio repertório.
      O aluno está treinando o repertório "${repertoireName || 'Geral'}".
      
      POSIÇÃO ATUAL:
      - FEN: ${fen}
      - Histórico: ${Array.isArray(history) ? history.join(', ') : 'N/A'}
      - Abertura: ${opening || 'Desconhecida'}
      - Vez de jogar: ${turn === 'w' ? 'Brancas' : 'Pretas'}
      
      O lance correto que o aluno deve fazer é: ${expectedMove}
      
      SUA TAREFA:
      Forneça uma DICA SUTIL que ajude o aluno a encontrar o lance "${expectedMove}" sem dizer o lance diretamente.
      Explique a IDEIA ESTRATÉGICA por trás desse lance.
      
      INSTRUÇÕES:
      1. Seja encorajador e conciso (máximo 2 frases).
      2. Responda em Português do Brasil.
      3. Não seja óbvio demais, instigue o pensamento.
      
      Responda apenas com o texto da dica.
    `;

    const text = await aiService.generateText(prompt);

    return NextResponse.json({ 
      status: 'success', 
      data: { hint: text || "Foque nos princípios da abertura!" } 
    });

  } catch (error: any) {
    console.error('[API v1 AI Hint Error]:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Erro interno ao gerar dica.',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
