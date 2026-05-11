'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import CustomChessBoard from '@/components/chess/CustomChessBoard';
import { ChevronLeft, ChevronRight, RotateCcw, RefreshCw, Zap } from 'lucide-react';
import { useStockfish } from '@/hooks/useStockfish';
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
  evaluation: string;
  bestLine: string[];
  engineEnabled: boolean;
}

interface Props {
  repertoire: any;
  onStateChange?: (state: ExploreStudyState) => void;
}

export default function ExploreViewer({ repertoire, onStateChange }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const breadcrumbsRef = useRef<HTMLDivElement>(null);
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
  const [engineEnabled, setEngineEnabled] = useState(false);

  const { evaluation, bestMove, bestLine, isAnalyzing, analyzePosition } = useStockfish();

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
      
      if (info) setCurrentOpening(openingStr);
    });
  }, [fen, isMounted, currentNodeId]);

  // Stockfish analysis
  useEffect(() => {
    if (engineEnabled && isMounted) {
      analyzePosition(gameRef.current.fen());
    }
  }, [engineEnabled, fen, isMounted, analyzePosition]);

  // Notify parent of state changes
  useEffect(() => {
    if (!isMounted || !onStateChange) return;

    onStateChange({
      fen: gameRef.current.fen(),
      history: getPathToNode(tree, currentNodeId),
      opening: currentOpening,
      turn: gameRef.current.turn() as 'w' | 'b',
      evaluation,
      bestLine,
      engineEnabled,
    });
  }, [fen, currentNodeId, evaluation, bestLine, engineEnabled, isMounted]);

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

  const resetExplorer = useCallback(() => {
    navigateTo('root');
  }, [navigateTo]);

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
    setManualArrows([]);
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
    <div className="space-y-4 min-w-0 max-w-full overflow-hidden grid grid-cols-1">
      {/* Opening label area */}
      {currentOpening && (
        <div className="animate-in fade-in slide-in-from-top-1">
          <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 inline-block">
            {currentOpening}
          </div>
        </div>
      )}

      {/* Board Area Container - Centered and structured */}
      <div className="flex flex-col items-center w-full max-w-[600px] mx-auto space-y-4">
        {/* Engine Toolbar - Structured & Integrated */}
        <div className="w-full bg-neutral-50/50 rounded-2xl border border-neutral-100 p-2.5 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setEngineEnabled(!engineEnabled)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm shrink-0 ${engineEnabled
                  ? 'bg-blue-600 text-white shadow-blue-500/20'
                  : 'bg-white text-neutral-500 border border-neutral-200 hover:bg-neutral-50'
                }`}
            >
              <Zap size={12} className={engineEnabled ? 'fill-white' : ''} />
              {engineEnabled ? 'Motor ON' : 'Analisar'}
            </button>

            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
              {engineEnabled ? (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 overflow-hidden">
                  <div className={`px-2 py-1 rounded-lg font-mono font-bold text-xs shadow-inner shrink-0 ${evaluation.startsWith('+') ? 'bg-green-50 text-green-700' :
                      evaluation.startsWith('-') ? 'bg-red-50 text-red-700' : 'bg-neutral-50 text-neutral-600'
                    }`}>
                    {evaluation}
                  </div>
                  {bestMove && !isAnalyzing && (
                    <div className="hidden xs:block text-[10px] font-medium text-neutral-500 bg-white/80 px-2.5 py-1 rounded-lg border border-neutral-100 truncate">
                      Melhor: <span className="text-blue-600 font-bold uppercase">{bestMove}</span>
                    </div>
                  )}
                  {isAnalyzing && (
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-medium shrink-0">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      <span className="hidden sm:inline">Analisando...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[10px] font-medium text-neutral-400 italic animate-in fade-in truncate opacity-60">
                  Stockfish 16.1.0 pronto para análise
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="w-full relative z-0">
          <CustomChessBoard
            position={fen}
            onSquareClick={onSquareClick}
            boardOrientation={orientation}
            selectedSquare={selectedSquare}
            lastMove={lastMove}
            legalMoves={legalMoves}
            arrows={engineEnabled && bestMove ? [{
              from: bestMove.slice(0, 2),
              to: bestMove.slice(2, 4),
              color: "rgba(34, 197, 94, 0.6)"
            }] : []}
            manualArrows={manualArrows}
            onManualArrowsChange={setManualArrows}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 py-2">
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
      </div>

      {/* Move notation (Breadcrumbs style) */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 min-h-[70px] flex flex-col justify-center overflow-hidden w-full max-w-[600px] mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Caminho atual</p>
        <div className="w-0 min-w-full overflow-x-auto overflow-y-hidden no-scrollbar">
          <div
            ref={breadcrumbsRef}
            className="block whitespace-nowrap py-2 min-h-[44px] bg-neutral-50/50 px-2 border border-transparent w-max min-w-full"
          >
            {pathNodes.length > 0 ? (
              <div className="inline-flex items-center gap-1">
                <button
                  onClick={resetExplorer}
                  className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors shrink-0"
                  title="Início"
                >
                  <RotateCcw size={14} />
                </button>
                <ChevronRight size={12} className="text-neutral-300 shrink-0" />
                <div className="inline-flex items-center gap-1">
                  {pathNodes.map((san, i) => {
                    const nodes = getFullLineInfo(tree, currentNodeId);
                    const stepNodeId = nodes[i]?.nodeId;

                    return (
                      <div key={i} className="inline-flex items-center">
                        <button
                          onClick={() => stepNodeId && navigateTo(stepNodeId)}
                          className={`text-[0.8125rem] font-medium px-2 py-1 rounded-md transition-all whitespace-nowrap ${i === pathNodes.length - 1
                            ? 'text-blue-600 font-bold bg-blue-50'
                            : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                            }`}
                        >
                          {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}{san}
                        </button>
                        {i < pathNodes.length - 1 && (
                          <ChevronRight size={10} className="text-neutral-300 mx-1 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-neutral-400">
                <RotateCcw size={14} className="opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Posição Inicial</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variations (children at current node) */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 min-h-[85px] flex flex-col justify-center overflow-hidden w-full max-w-[600px] mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Continuações</p>
        <div className="w-0 min-w-full overflow-x-auto overflow-y-hidden no-scrollbar">
          <div className="block whitespace-nowrap w-max min-w-full">
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

      {/* Best Line Display */}
      {engineEnabled && (
        <div className="card-surface p-4 bg-neutral-900 border border-neutral-800 shadow-xl w-full max-w-[600px] mx-auto">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Linha Recomendada</span>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${evaluation.startsWith('+') ? 'bg-green-500/10 text-green-400' :
                  evaluation.startsWith('-') ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                {evaluation}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Melhor linha</div>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-neutral-300 font-mono">
                {bestLine.length > 0 ? (
                  bestLine.map((mv, idx) => (
                    <span key={idx} className={idx === 0 ? 'text-blue-400 font-bold' : ''}>
                      {idx % 2 === 0 && gameRef.current.turn() === 'b' && idx === 0 ? '... ' : ''}
                      {mv}
                    </span>
                  ))
                ) : (
                  <span className="text-neutral-500 italic text-[10px]">
                    {isAnalyzing ? 'Calculando...' : 'Aguardando posição'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
