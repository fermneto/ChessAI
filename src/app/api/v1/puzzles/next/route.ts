import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const angle = searchParams.get('angle');
  
  const url = angle
    ? `https://lichess.org/api/puzzle/next?angle=${encodeURIComponent(angle)}`
    : 'https://lichess.org/api/puzzle/next';

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Lichess API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Puzzle Proxy Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch puzzle' }, { status: 500 });
  }
}
