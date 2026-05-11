'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  position: string;
  onSquareClick?: (square: string) => void;
  boardOrientation?: 'white' | 'black';
  selectedSquare?: string | null;
  lastMove?: string | null;
  legalMoves?: string[];
  checkSquare?: string | null;
  arrows?: { from: string, to: string, color?: string }[];
  manualArrows?: { from: string, to: string, color?: string }[];
  onManualArrowsChange?: (arrows: any[]) => void;
}

const PIECE_IMAGES: Record<string, string> = {
  'p': '/pieces/bP.png',
  'r': '/pieces/bR.png',
  'n': '/pieces/bN.png',
  'b': '/pieces/bB.png',
  'q': '/pieces/bQ.png',
  'k': '/pieces/bK.png',
  'P': '/pieces/wP.png',
  'R': '/pieces/wR.png',
  'N': '/pieces/wN.png',
  'B': '/pieces/wB.png',
  'Q': '/pieces/wQ.png',
  'K': '/pieces/wK.png',
};

export default function CustomChessBoard({
  position,
  onSquareClick,
  boardOrientation = 'white',
  selectedSquare,
  lastMove,
  legalMoves = [],
  checkSquare = null,
  arrows = [],
  manualArrows = [],
  onManualArrowsChange
}: Props) {
  const [rightClickStart, setRightClickStart] = useState<string | null>(null);

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

  const handleMouseDown = (square: string, e: React.MouseEvent) => {
    if (e.button === 2) { // Botão direito
      setRightClickStart(square);
    }
  };

  const handleMouseUp = (square: string, e: React.MouseEvent) => {
    if (e.button === 2 && rightClickStart && onManualArrowsChange) {
      const from = rightClickStart;
      const to = square;

      const newArrow = {
        from,
        to,
        color: 'rgba(251, 191, 36, 0.8)'
      };

      const exists = manualArrows.find(a => a.from === from && a.to === to);

      if (exists) {
        onManualArrowsChange(manualArrows.filter(a => a.from !== from || a.to !== to));
      } else {
        onManualArrowsChange([...manualArrows, newArrow]);
      }

      setRightClickStart(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const squares = useMemo(() => {
    const res = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

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
          visualRow: i,
          visualCol: j
        });
      }
    }
    return res;
  }, [board, boardOrientation]);
  const pieceMapRef = useRef<Record<string, string>>({});

  const { floatingPieces } = useMemo(() => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const nextPieces = [];
    const currentMap: Record<string, string> = {};
    const usedIds = new Set<string>();

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const square = `${files[j]}${ranks[i]}`;
          let pieceId = '';

          const isTarget = lastMove && square === lastMove.slice(-2);
          const sourceSquare = lastMove ? lastMove.slice(0, 2) : null;

          if (isTarget && sourceSquare && pieceMapRef.current[sourceSquare]) {
            pieceId = pieceMapRef.current[sourceSquare];
          }
          else if (pieceMapRef.current[square] && pieceMapRef.current[square].startsWith(piece) && !usedIds.has(pieceMapRef.current[square])) {
            pieceId = pieceMapRef.current[square];
          }
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

    pieceMapRef.current = currentMap;

    return { floatingPieces: nextPieces, newPieceMap: currentMap };
  }, [board, boardOrientation, lastMove]);

  const getSquareVisualCoord = (sqName: string) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    const fileIdx = files.indexOf(sqName[0]);
    const rankIdx = ranks.indexOf(sqName[1]);

    const visualRow = boardOrientation === 'white' ? rankIdx : 7 - rankIdx;
    const visualCol = boardOrientation === 'white' ? fileIdx : 7 - fileIdx;

    return {
      x: visualCol * 12.5 + 6.25,
      y: visualRow * 12.5 + 6.25
    };
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      className="w-full aspect-square relative border-[6px] border-neutral-800 rounded-lg shadow-2xl overflow-hidden bg-neutral-900 select-none"
    >
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
        {squares.map((sq) => {
          const isLastMove = lastMove && (sq.name === lastMove.slice(-2) || sq.name === lastMove.slice(0, 2));
          const isLegalMove = legalMoves?.includes(sq.name);
          const isCheck = checkSquare === sq.name;
          const manualCircle = manualArrows.find(a => a.from === sq.name && a.to === sq.name);

          return (
            <div
              key={sq.name}
              onMouseDown={(e) => handleMouseDown(sq.name, e)}
              onMouseUp={(e) => handleMouseUp(sq.name, e)}
              onClick={() => onSquareClick?.(sq.name)}
              className={`
                relative flex items-center justify-center cursor-pointer
                ${sq.isDark ? 'bg-[#64748b]' : 'bg-[#e2e8f0]'}
                ${selectedSquare === sq.name ? 'after:absolute after:inset-0 after:bg-yellow-400/40 after:z-10' : ''}
                ${isLastMove ? 'after:absolute after:inset-0 after:bg-blue-500/30 after:z-0' : ''}
                ${isCheck ? 'after:absolute after:inset-0 after:bg-red-500/50 after:shadow-[inset_0_0_20px_rgba(255,0,0,0.5)] after:z-10' : ''}
              `}
            >
              {manualCircle && (
                <div
                  className="absolute inset-0 z-30 pointer-events-none border-[6px] rounded-full"
                  style={{ borderColor: manualCircle.color || 'rgba(251, 191, 36, 0.5)' }}
                />
              )}
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

      <div className="absolute inset-0 pointer-events-none z-40">
        {legalMoves?.map((sqName) => {
          const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
          const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

          const fileIdx = files.indexOf(sqName[0]);
          const rankIdx = ranks.indexOf(sqName[1]);

          const visualRow = boardOrientation === 'white' ? rankIdx : 7 - rankIdx;
          const visualCol = boardOrientation === 'white' ? fileIdx : 7 - fileIdx;

          const hasPiece = board[rankIdx][fileIdx] !== null;

          return (
            <div
              key={`legal-${sqName}`}
              style={{
                position: 'absolute',
                width: '12.5%',
                height: '12.5%',
                left: `${visualCol * 12.5}%`,
                top: `${visualRow * 12.5}%`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {hasPiece ? (
                <div className="w-[85%] h-[85%] border-[6px] border-black/10 rounded-full" />
              ) : (
                <div className="w-4 h-4 bg-black/10 rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      <svg
        className="absolute inset-0 pointer-events-none z-50 overflow-visible"
        viewBox="0 0 100 100"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="4"
            markerHeight="4"
            refX="2"
            refY="2"
            orient="auto"
          >
            <path d="M 0 0 L 4 2 L 0 4 z" fill="rgba(34, 197, 94, 0.6)" />
          </marker>
          <marker
            id="arrowhead-manual"
            markerWidth="4"
            markerHeight="4"
            refX="2"
            refY="2"
            orient="auto"
          >
            <path d="M 0 0 L 4 2 L 0 4 z" fill="rgba(251, 191, 36, 0.8)" />
          </marker>
        </defs>

        {arrows.map((arrow, idx) => {
          const start = getSquareVisualCoord(arrow.from);
          const end = getSquareVisualCoord(arrow.to);

          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const shorten = 3;

          const adjEndX = end.x - (dx / length) * shorten;
          const adjEndY = end.y - (dy / length) * shorten;

          return (
            <line
              key={`engine-arrow-${idx}`}
              x1={start.x}
              y1={start.y}
              x2={adjEndX}
              y2={adjEndY}
              stroke={arrow.color || "rgba(34, 197, 94, 0.6)"}
              strokeWidth="1.8"
              markerEnd="url(#arrowhead)"
              strokeLinecap="round"
              className="animate-in fade-in duration-300"
            />
          );
        })}

        {manualArrows.filter(a => a.from !== a.to).map((arrow, idx) => {
          const start = getSquareVisualCoord(arrow.from);
          const end = getSquareVisualCoord(arrow.to);

          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          if (length === 0) return null;

          const shorten = 3;
          const adjEndX = end.x - (dx / length) * shorten;
          const adjEndY = end.y - (dy / length) * shorten;

          return (
            <line
              key={`manual-arrow-${idx}`}
              x1={start.x}
              y1={start.y}
              x2={adjEndX}
              y2={adjEndY}
              stroke={arrow.color || "rgba(251, 191, 36, 0.8)"}
              strokeWidth="1.8"
              markerEnd="url(#arrowhead-manual)"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </div>
  );
}
