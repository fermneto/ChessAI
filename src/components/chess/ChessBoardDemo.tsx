'use client';

import { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

// Italian Game opening moves for demo
const DEMO_MOVES = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4'];

export default function ChessBoardDemo() {
  const [game] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [moveIndex, setMoveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMoveIndex((prev) => {
        const next = prev < DEMO_MOVES.length ? prev + 1 : 0;
        if (next === 0) {
          game.reset();
        } else {
          try {
            game.move(DEMO_MOVES[next - 1]);
          } catch {
            game.reset();
            return 0;
          }
        }
        setFen(game.fen());
        return next;
      });
    }, 1600);

    return () => clearInterval(interval);
  }, [game]);

  return (
    <div className="w-full aspect-square">
      <Chessboard
        id="demo-board"
        position={fen}
        arePiecesDraggable={false}
        boardOrientation="white"
        customBoardStyle={{
          borderRadius: '0',
        }}
        customDarkSquareStyle={{ backgroundColor: '#b7c0d8' }}
        customLightSquareStyle={{ backgroundColor: '#e8edf5' }}
        animationDuration={400}
      />
    </div>
  );
}
