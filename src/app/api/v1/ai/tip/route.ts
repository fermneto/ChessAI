import { getDailyTip } from '@/lib/ai/tips';
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

    const tip = await getDailyTip();
    return NextResponse.json({ status: 'success', data: tip });

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
