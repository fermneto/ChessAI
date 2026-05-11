'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import CustomChessBoard from '@/components/chess/CustomChessBoard';
import { ChevronLeft, ChevronRight, RotateCcw, RefreshCw } from 'lucide-react';
import { lookupOpening } from '@/lib/chess/openingDatabase';
import {
  type ChessTree,
  type MoveNode,
  getPathToNode,
  getVariations,
  getFullLineInfo,
} from '@/lib/chess/moveTree';

export interface ExploreStudyState {
  fen: string;
  history: string[];
  opening: string | null;
  turn: 'w' | 'b';
}

interface Props {
  repertoire: any;
  onStateChange?: (state: ExploreStudyState) => void;
}

export default function ExploreViewer({ repertoire, onStateChange }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const gameRef = useRef(new Chess());
  const savedMoves = repertoire.moves as any;

  const [fen, setFen] = useState(
    savedMoves?.current_fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  );
  const [lastMove, setLastMove] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<'white' | 'black'>(repertoire.color || 'white');
  const [currentOpening, setCurrentOpening] = useState<string | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [manualArrows, setManualArrows] = useState<any[]>([]);

  // Tree state
  const [tree] = useState<ChessTree>(() => {
    if (savedMoves?.nodes) return savedMoves as ChessTree;
    return { rootId: 'root', nodes: { root: { id: 'root', fen: fen, san: '', children: [], parentId: null } }, activeNodeId: 'root' };
  });
  const [currentNodeId, setCurrentNodeId] = useState<string>(() => {
    return savedMoves?.activeNodeId || savedMoves?.rootId || 'root';
  });
  const [renderTick, setRenderTick] = useState(0);
  const forceUpdate = useCallback(() => setRenderTick(t => t + 1), []);

  useEffect(() => {
    setIsMounted(true);
    // Initialize board from tree
    if (tree.nodes[currentNodeId]) {
      const node = tree.nodes[currentNodeId];
      gameRef.current = new Chess(node.fen);
      setFen(node.fen);
    }
  }, []);

  // Identify opening & notify parent
  useEffect(() => {
    if (!isMounted) return;
    lookupOpening(gameRef.current.fen()).then(info => {
      const openingStr = info ? `${info.eco}: ${info.name}` : null;
      if (info) setCurrentOpening(openingStr);
      
      if (onStateChange) {
        const path = getPathToNode(tree, currentNodeId);
        onStateChange({
          fen: gameRef.current.fen(),
          history: path,
          opening: openingStr || currentOpening,
          turn: gameRef.current.turn() as 'w' | 'b',
        });
      }
    });
  }, [fen, isMounted, currentNodeId]);

  // Navigate to a node (read-only navigation)
  const navigateTo = useCallback((nodeId: string) => {
    const node = tree.nodes[nodeId];
    if (!node) return;
    gameRef.current = new Chess(node.fen);
    setFen(node.fen);
    setCurrentNodeId(nodeId);
    setSelectedSquare(null);
    setLegalMoves([]);
    // Calculate lastMove
    if (node.parentId) {
      const parent = tree.nodes[node.parentId];
      if (parent) {
        const tempGame = new Chess(parent.fen);
        try {
          const move = tempGame.move(node.san);
          if (move) setLastMove(move.from + move.to);
        } catch { setLastMove(null); }
      }
    } else {
      setLastMove(null);
    }
    forceUpdate();
  }, [tree, forceUpdate]);

  // Navigate to prev/next in path
  const goBack = useCallback(() => {
    const node = tree.nodes[currentNodeId];
    if (node?.parentId) navigateTo(node.parentId);
  }, [tree, currentNodeId, navigateTo]);

  const goForward = useCallback(() => {
    const node = tree.nodes[currentNodeId];
    if (node?.children && node.children.length > 0) navigateTo(node.children[0]);
  }, [tree, currentNodeId, navigateTo]);

  const goToRoot = useCallback(() => {
    navigateTo(tree.rootId);
  }, [tree, navigateTo]);

  const goToEnd = useCallback(() => {
    let current = tree.nodes[currentNodeId];
    while (current && current.children && current.children.length > 0) {
      current = tree.nodes[current.children[0]];
    }
    if (current && current.id !== currentNodeId) {
      navigateTo(current.id);
    }
  }, [tree, currentNodeId, navigateTo]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goBack();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          goToRoot();
          break;
        case 'ArrowDown':
          e.preventDefault();
          goToEnd();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, goForward, goToRoot, goToEnd]);

  // Square click for read-only navigation (allow clicking moves in tree)
  const onSquareClick = (square: string) => {
    if (selectedSquare) {
      // Try to navigate to a child that results from this move
      const node = tree.nodes[currentNodeId];
      if (node?.children) {
        for (const childId of node.children) {
          const child = tree.nodes[childId];
          const tempGame = new Chess(node.fen);
          try {
            const move = tempGame.move(child.san);
            if (move && move.from === selectedSquare && move.to === square) {
              navigateTo(childId);
              setSelectedSquare(null);
              setLegalMoves([]);
              return;
            }
          } catch { /* ignore */ }
        }
      }
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // Check if piece has moves in the tree (read-only)
    const node = tree.nodes[currentNodeId];
    const piece = gameRef.current.get(square as any);
    if (piece && piece.color === gameRef.current.turn() && node?.children && node.children.length > 0) {
      // Highlight possible squares from repertoire
      const possibleTargets: string[] = [];
      for (const childId of node.children) {
        const child = tree.nodes[childId];
        const tempGame = new Chess(node.fen);
        try {
          const move = tempGame.move(child.san);
          if (move && move.from === square) possibleTargets.push(move.to);
        } catch { /* ignore */ }
      }
      if (possibleTargets.length > 0) {
        setSelectedSquare(square);
        setLegalMoves(possibleTargets);
        return;
      }
    }
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  // Render move tree as notation
  const pathNodes = getPathToNode(tree, currentNodeId)
    .map(san => san)
    .filter(Boolean);

  const currentNode = tree.nodes[currentNodeId];
  const variations = currentNode ? getVariations(tree, currentNodeId) : [];
  const hasChildren = currentNode?.children && currentNode.children.length > 0;
  const hasParent = !!currentNode?.parentId;

  if (!isMounted) return (
    <div className="aspect-square bg-neutral-100 rounded-xl animate-pulse" />
  );

  return (
    <div className="space-y-4">
      {/* Opening label */}
      {currentOpening && (
        <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 inline-block">
          {currentOpening}
        </div>
      )}

      {/* Board */}
      <CustomChessBoard
        position={fen}
        onSquareClick={onSquareClick}
        boardOrientation={orientation}
        selectedSquare={selectedSquare}
        lastMove={lastMove}
        legalMoves={legalMoves}
        manualArrows={manualArrows}
        onManualArrowsChange={setManualArrows}
      />

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={goToRoot}
          disabled={!hasParent}
          className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 transition-colors"
          title="Início"
        >
          <RefreshCw size={15} className="text-neutral-500" />
        </button>
        <button
          onClick={goBack}
          disabled={!hasParent}
          className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 transition-colors"
          title="Voltar"
        >
          <ChevronLeft size={15} className="text-neutral-500" />
        </button>
        <button
          onClick={goForward}
          disabled={!hasChildren}
          className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 transition-colors"
          title="Avançar"
        >
          <ChevronRight size={15} className="text-neutral-500" />
        </button>
        <button
          onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')}
          className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors ml-auto"
          title="Inverter tabuleiro"
        >
          <RotateCcw size={15} className="text-neutral-500" />
        </button>
      </div>

      {/* Move notation */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 min-h-[70px] flex flex-col justify-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Caminho atual</p>
        <div className="flex flex-wrap gap-1">
          {pathNodes.length > 0 ? (
            pathNodes.map((san, i) => {
              const isEven = i % 2 === 0;
              return (
                <span key={i} className="flex items-center gap-0.5">
                  {isEven && (
                    <span className="text-[10px] text-neutral-400 font-mono">{Math.floor(i / 2) + 1}.</span>
                  )}
                  <span className={`text-xs font-bold px-1 py-0.5 rounded ${i === pathNodes.length - 1 ? 'bg-blue-100 text-blue-700' : 'text-neutral-700'}`}>
                    {san}
                  </span>
                </span>
              );
            })
          ) : (
            <span className="text-[10px] text-neutral-400 italic">Posição inicial</span>
          )}
        </div>
      </div>

      {/* Variations (children at current node) */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 min-h-[85px] flex flex-col justify-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Continuações</p>
        <div className="flex flex-wrap gap-1.5">
          {hasChildren ? (
            currentNode!.children!.map((childId, i) => {
              const child = tree.nodes[childId];
              return (
                <button
                  key={childId}
                  onClick={() => navigateTo(childId)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors
                    ${i === 0
                      ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                >
                  {child.san}
                </button>
              );
            })
          ) : (
            <span className="text-xs text-neutral-400 italic">Fim da linha explorada</span>
          )}
        </div>
      </div>
    </div>
  );
}
