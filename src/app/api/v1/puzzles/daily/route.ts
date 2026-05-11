import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://lichess.org/api/puzzle/daily', {
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
    console.error('[Daily Puzzle Proxy Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch daily puzzle' }, { status: 500 });
  }
}
