'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  position: string;
  onSquareClick?: (square: string) => void;
  boardOrientation?: 'white' | 'black';
  selectedSquare?: string | null;
  lastMove?: string | null;
}

const PIECE_IMAGES: Record<string, string> = {
  'p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  'r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  'n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  'b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  'q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  'k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
  'P': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  'R': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  'N': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  'B': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  'Q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  'K': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
};

export default function CustomChessBoard({ 
  position, 
  onSquareClick, 
  boardOrientation = 'white',
  selectedSquare,
  lastMove 
}: Props) {
  
  const board = useMemo(() => {
    const rows = position.split(' ')[0].split('/');
    const fullBoard: (string | null)[][] = [];

    for (const row of rows) {
      const fullRow: (string | null)[] = [];
      for (const char of row) {
        if (isNaN(parseInt(char))) {
          fullRow.push(char);
        } else {
          for (let i = 0; i < parseInt(char); i++) {
            fullRow.push(null);
          }
        }
      }
      fullBoard.push(fullRow);
    }
    return fullBoard;
  }, [position]);

  const squares = useMemo(() => {
    const res = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    const actualRanks = boardOrientation === 'white' ? ranks : [...ranks].reverse();
    const actualFiles = boardOrientation === 'white' ? files : [...files].reverse();

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const rankIdx = boardOrientation === 'white' ? i : 7 - i;
        const fileIdx = boardOrientation === 'white' ? j : 7 - j;
        
        const squareName = `${files[fileIdx]}${ranks[rankIdx]}`;
        const piece = board[rankIdx][fileIdx];
        const isDark = (i + j) % 2 === 1;

        res.push({
          name: squareName,
          piece,
          isDark,
          row: i,
          col: j
        });
      }
    }
    return res;
  }, [board, boardOrientation]);
  const pieceMapRef = useRef<Record<string, string>>({});
  
  // Gerar as peças de forma síncrona para evitar "piscadas"
  const { floatingPieces, newPieceMap } = useMemo(() => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const nextPieces = [];
    const currentMap: Record<string, string> = {};
    const usedIds = new Set<string>();

    // 1. Mapear o que temos agora
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const square = `${files[j]}${ranks[i]}`;
          let pieceId = '';

          const isTarget = lastMove && square === lastMove.slice(-2);
          const sourceSquare = lastMove ? lastMove.slice(0, 2) : null;

          // Se for o destino do último lance, herdar ID da origem
          if (isTarget && sourceSquare && pieceMapRef.current[sourceSquare]) {
            pieceId = pieceMapRef.current[sourceSquare];
          } 
          // Se a peça continua no mesmo lugar
          else if (pieceMapRef.current[square] && pieceMapRef.current[square].startsWith(piece) && !usedIds.has(pieceMapRef.current[square])) {
            pieceId = pieceMapRef.current[square];
          } 
          // Caso contrário, ID baseado na casa (estável para peças que não se movem)
          else {
            pieceId = `${piece}-${square}`;
          }

          usedIds.add(pieceId);
          currentMap[square] = pieceId;

          const visualRow = boardOrientation === 'white' ? i : 7 - i;
          const visualCol = boardOrientation === 'white' ? j : 7 - j;

          nextPieces.push({
            id: pieceId,
            type: piece,
            x: visualCol * 12.5,
            y: visualRow * 12.5
          });
        }
      }
    }

    // Atualizar a referência para o próximo render
    pieceMapRef.current = currentMap;

    return { floatingPieces: nextPieces, newPieceMap: currentMap };
  }, [board, boardOrientation, lastMove]);

  return (
    <div className="w-full aspect-square relative border-[6px] border-neutral-800 rounded-lg shadow-2xl overflow-hidden bg-neutral-900 select-none">
      {/* Camada 1: Quadrados (Estática) */}
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
        {squares.map((sq) => {
          const isLastMove = lastMove && (sq.name === lastMove.slice(-2) || sq.name === lastMove.slice(0, 2));
          return (
            <div
              key={sq.name}
              onClick={() => onSquareClick?.(sq.name)}
              className={`
                relative flex items-center justify-center cursor-pointer
                ${sq.isDark ? 'bg-[#64748b]' : 'bg-[#e2e8f0]'}
                ${selectedSquare === sq.name ? 'after:absolute after:inset-0 after:bg-yellow-400/40 after:z-10' : ''}
                ${isLastMove ? 'after:absolute after:inset-0 after:bg-blue-500/30 after:z-0' : ''}
              `}
            >
              {/* Coordenadas */}
              {sq.name.startsWith(boardOrientation === 'white' ? 'a' : 'h') && (
                <span className={`absolute top-0.5 left-1 text-[9px] font-bold z-20 ${sq.isDark ? 'text-white/30' : 'text-black/20'}`}>
                  {sq.name[1]}
                </span>
              )}
              {sq.name.endsWith(boardOrientation === 'white' ? '1' : '8') && (
                <span className={`absolute bottom-0.5 right-1 text-[9px] font-bold z-20 ${sq.isDark ? 'text-white/30' : 'text-black/20'}`}>
                  {sq.name[0]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Camada 2: Peças Flutuantes (Animadas) */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingPieces.map((p) => (
          <motion.div
            key={p.id}
            initial={false}
            animate={{ 
              left: `${p.x}%`, 
              top: `${p.y}%` 
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 35,
              mass: 0.8
            }}
            style={{
              position: 'absolute',
              width: '12.5%',
              height: '12.5%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 30
            }}
          >
            <img
              src={PIECE_IMAGES[p.type]}
              alt={p.type}
              className="w-[90%] h-[90%] drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
