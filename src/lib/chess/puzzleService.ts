import { createClient } from '@/lib/supabase/client';

import { Chess } from 'chess.js';

export interface Puzzle {
  id: string;
  fen: string;
  solution: string[]; // UCI format (e2e4, c3a4, etc)
  rating: number;
  themes: string[];
  lastMove?: string;
}

/**
 * Puzzle search
 */
export const puzzleService = {
  async getPuzzle(excludeIds: Set<string> = new Set(), openingTheme?: string): Promise<Puzzle | null> {
    try {
      const url = openingTheme
        ? `https://lichess.org/api/puzzle/next?angle=${encodeURIComponent(openingTheme)}`
        : 'https://lichess.org/api/puzzle/next';

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) throw new Error('Erro ao buscar puzzle no Lichess');

      const data = await response.json();

      if (excludeIds.has(data.puzzle.id) && excludeIds.size > 0) {
        const retryResponse = await fetch(url, { cache: 'no-store' });
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          return this.mapLichessDataToPuzzle(retryData);
        }
      }

      return this.mapLichessDataToPuzzle(data);
    } catch (error) {
      console.error('Erro na API do Lichess:', error);
      return this.getDailyPuzzle();
    }
  },


  async getDailyPuzzle(): Promise<Puzzle | null> {
    try {
      const response = await fetch('https://lichess.org/api/puzzle/daily', { cache: 'no-store' });
      const data = await response.json();
      return this.mapLichessDataToPuzzle(data);
    } catch (e) {
      return null;
    }
  },

  mapLichessDataToPuzzle(data: any): Puzzle {
    let fen = data.puzzle.fen;
    let lastMove = data.puzzle.lastMove;

    if (!fen && data.game && data.game.pgn && data.puzzle.initialPly) {
      try {
        const tempGame = new Chess();
        const moves = data.game.pgn.split(' ');
        const initialPly = data.puzzle.initialPly;

        let lastMoveObj = null;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].trim() !== '') {
            lastMoveObj = tempGame.move(moves[i]);
          }
        }

        fen = tempGame.fen();
        if (lastMoveObj) {
          lastMove = lastMoveObj.from + lastMoveObj.to;
        }
      } catch (err) {
        console.error('Erro ao reconstruir FEN do PGN:', err);
      }
    }

    return {
      id: data.puzzle.id,
      fen: fen,
      solution: data.puzzle.solution,
      rating: data.puzzle.rating,
      themes: data.puzzle.themes,
      lastMove: lastMove
    };
  }
};
