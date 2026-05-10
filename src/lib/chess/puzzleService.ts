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
 * Serviço de busca de puzzles.
 * Utiliza o banco de dados do Supabase para busca de puzzles táticos ilimitados.
 * Permite buscar por rating e temas.
 */
export const puzzleService = {
  /**
   * Busca um puzzle aleatório do banco de dados (Supabase).
   * Sem limites, puxa diretamente da coleção de milhares de puzzles.
   */
  async getPuzzle(excludeIds: Set<string> = new Set(), openingTheme?: string): Promise<Puzzle | null> {
    try {
      // Se houver um tema de abertura, adiciona o parâmetro 'angle'
      const url = openingTheme 
        ? `https://lichess.org/api/puzzle/next?angle=${encodeURIComponent(openingTheme)}`
        : 'https://lichess.org/api/puzzle/next';

      // Buscar um puzzle aleatório usando o endpoint '/api/puzzle/next' do Lichess
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        },
        // Adicionamos um parâmetro de timestamp para evitar cache
        cache: 'no-store'
      });

      if (!response.ok) throw new Error('Erro ao buscar puzzle no Lichess');
      
      const data = await response.json();
      
      // Se o puzzle retornado já foi jogado, tentamos buscar mais uma vez
      if (excludeIds.has(data.puzzle.id) && excludeIds.size > 0) {
        // Para evitar loops infinitos caso a API comece a repetir, limitamos a 1 tentativa extra
        const retryResponse = await fetch(url, { cache: 'no-store' });
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          return this.mapLichessDataToPuzzle(retryData);
        }
      }

      return this.mapLichessDataToPuzzle(data);
    } catch (error) {
      console.error('Erro na API do Lichess:', error);
      // Fallback para o puzzle diário em caso de falha temporária do endpoint
      return this.getDailyPuzzle();
    }
  },

  /**
   * Busca o puzzle diário do Lichess como fallback
   */
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

    // O endpoint /api/puzzle/next não retorna FEN ou lastMove, apenas PGN e initialPly
    if (!fen && data.game && data.game.pgn && data.puzzle.initialPly) {
      try {
        const tempGame = new Chess();
        const moves = data.game.pgn.split(' ');
        const initialPly = data.puzzle.initialPly;
        
        let lastMoveObj = null;
        for (let i = 0; i < moves.length; i++) {
          // Ignorar espaços vazios gerados pelo split
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
