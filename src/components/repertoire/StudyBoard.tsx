'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import CustomChessBoard from '@/components/chess/CustomChessBoard';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  RefreshCw,
  Save, 
  Play, 
  History,
  Brain,
  Zap,
  Book
} from 'lucide-react';
import { useStockfish } from '@/hooks/useStockfish';
import { lookupOpening } from '@/lib/chess/openingDatabase';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';
import { 
  type ChessTree, 
  type MoveNode, 
  createEmptyTree, 
  addMoveToTree, 
  fromLinearHistory, 
  getPathToNode,
  getVariations,
  getFullLineInfo,
  type PathStep
} from '@/lib/chess/moveTree';


type Repertoire = Database['public']['Tables']['repertoires']['Row'];

export interface StudyState {
  fen: string;
  history: string[];
  opening: string | null;
  evaluation: string;
  bestLine: string[];
  turn: 'w' | 'b';
}

interface Props {
  repertoire: Repertoire;
  onUpdate?: (updated: Repertoire) => void;
  onStateChange?: (state: StudyState) => void;
}

export default function StudyBoard({ repertoire, onUpdate, onStateChange }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const gameRef = useRef(new Chess());
  const savedMoves = repertoire.moves as any;
  const [fen, setFen] = useState(savedMoves?.current_fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [history, setHistory] = useState<string[]>(savedMoves?.history || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [engineEnabled, setEngineEnabled] = useState(false);
  const [manualArrows, setManualArrows] = useState<any[]>([]);
  const [currentOpening, setCurrentOpening] = useState<string | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  
  // Árvore de lances
  const [tree, setTree] = useState<ChessTree>(createEmptyTree(fen));
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  const [renderTick, setRenderTick] = useState(0);
  
  const { evaluation, bestMove, bestLine, isAnalyzing, analyzePosition } = useStockfish();

  const forceUpdate = useCallback(() => setRenderTick(t => t + 1), []);
  const supabase = createClient();

  // Calcular a porcentagem da barra de vantagem
  const getEvalPercentage = () => {
    if (evaluation.startsWith('M')) {
      return evaluation.includes('-') ? 0 : 100;
    }
    const score = parseFloat(evaluation);
    if (isNaN(score)) return 50;
    const percent = 50 + (score * 10);
    return Math.min(Math.max(percent, 5), 95);
  };

  // Analisar a posição quando o FEN mudar e o motor estiver ligado
  useEffect(() => {
    if (engineEnabled && isMounted) {
      analyzePosition(gameRef.current.fen());
    }
  }, [engineEnabled, history, isMounted, analyzePosition]);

  useEffect(() => {
    if (repertoire?.color) {
      setOrientation(repertoire.color as 'white' | 'black');
    }
  }, [repertoire]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Novo: Identificação de abertura aprimorada (Local + API com detecção de transposição)
  useEffect(() => {
    if (!isMounted) return;
    
    let isCancelled = false;
    
    async function identify() {
      const currentFen = gameRef.current.fen();
      
      try {
        const info = await lookupOpening(currentFen);
        if (info && !isCancelled) {
          setCurrentOpening(`${info.eco}: ${info.name}`);
        }
      } catch (e) {
        console.error("Erro na identificação da abertura:", e);
      }
    }

    identify();
    return () => { isCancelled = true; };
  }, [fen, isMounted]);

  // Notificar o pai sobre mudanças no estado de estudo
  useEffect(() => {
    if (onStateChange && isMounted) {
      onStateChange({
        fen,
        history: getPathToNode(tree, currentNodeId),
        opening: currentOpening,
        evaluation,
        bestLine,
        turn: gameRef.current.turn() as 'w' | 'b'
      });
    }
  }, [fen, tree, currentNodeId, currentOpening, evaluation, bestLine, onStateChange, isMounted]);

  // Sync state with repertoire when it changes from outside
  useEffect(() => {
    const saved = (repertoire.moves as any);
    if (!saved) return;

    if (saved.nodes) {
      // Já é uma árvore
      setTree(saved as ChessTree);
      setCurrentNodeId(saved.activeNodeId || saved.rootId || 'root');
      const activeNode = saved.nodes[saved.activeNodeId || saved.rootId || 'root'];
      if (activeNode) {
        gameRef.current = new Chess(activeNode.fen);
        setFen(activeNode.fen);
      }
    } else if (saved.current_fen) {
      // Migração de linear para árvore
      const history = saved.history || [];
      // Para migrar corretamente precisaríamos de todos os FENs históricos.
      // Como não temos, vamos apenas começar do FEN atual ou resetar.
      const newTree = createEmptyTree('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      setTree(newTree);
      setCurrentNodeId('root');
      gameRef.current = new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      setFen(gameRef.current.fen());
    }
  }, [repertoire.id]);

  // Initialize engine safely
  if (!gameRef.current || (typeof gameRef.current.fen !== 'function')) {
    gameRef.current = new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }

  const onSquareClick = (square: string) => {
    setManualArrows([]);
    if (selectedSquare) {
      const move = onDrop(selectedSquare, square);
      if (move) {
        setSelectedSquare(null);
        setLegalMoves([]);
        setError(null);
        return;
      }
    }
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }
    const piece = gameRef.current.get(square as any);
    if (piece) {
      setSelectedSquare(square);
      const moves = gameRef.current.moves({ square: square as any, verbose: true });
      setLegalMoves(moves.map(m => m.to));
      setError(null);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
    forceUpdate();
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    try {
      const move = gameRef.current.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });
      if (move) {
        const newFen = gameRef.current.fen();
        const { tree: newTree, nodeId } = addMoveToTree(tree, currentNodeId, move.san, newFen);
        
        setTree(newTree);
        setCurrentNodeId(nodeId);
        setFen(newFen);
        setLastMove(move.from + move.to);
        forceUpdate();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  const undoMove = () => {
    const currentNode = tree.nodes[currentNodeId];
    if (currentNode && currentNode.parentId) {
      const parentNode = tree.nodes[currentNode.parentId];
      gameRef.current = new Chess(parentNode.fen);
      setFen(parentNode.fen);
      setCurrentNodeId(parentNode.id);
      setLastMove(null);
      setManualArrows([]);
    }
  };

  const resetBoard = () => {
    setCurrentNodeId(tree.rootId);
    const rootNode = tree.nodes[tree.rootId];
    gameRef.current = new Chess(rootNode.fen);
    setFen(rootNode.fen);
    setLastMove(null);
    setManualArrows([]);
  };

  const saveRepertoire = async () => {
    setLoading(true);
    setError(null);
    const { data, error: updateError } = await (supabase
      .from('repertoires') as any)
      .update({
        moves: {
          ...tree,
          activeNodeId: currentNodeId,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', repertoire.id)
      .select()
      .single();

    if (updateError) {
      setError('Erro ao salvar: ' + updateError.message);
    } else if (data) {
      if (onUpdate) onUpdate(data);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEngineEnabled(!engineEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                  engineEnabled 
                    ? 'bg-blue-600 text-white shadow-blue-500/20' 
                    : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                <Zap size={14} className={engineEnabled ? 'fill-white' : ''} />
                {engineEnabled ? 'Motor ON' : 'Ligar Motor'}
              </button>

              {engineEnabled && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                  <div className={`px-3 py-1.5 rounded-lg font-mono font-bold text-sm shadow-inner ${
                    evaluation.startsWith('+') ? 'bg-green-50 text-green-700' : 
                    evaluation.startsWith('-') ? 'bg-red-50 text-red-700' : 'bg-neutral-50 text-neutral-600'
                  }`}>
                    {evaluation}
                  </div>
                  {bestMove && !isAnalyzing && (
                    <div className="text-xs font-medium text-neutral-500 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
                      Melhor lance: <span className="text-blue-600 font-bold uppercase">{bestMove}</span>
                    </div>
                  )}
                  {isAnalyzing && (
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-medium">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      Analisando...
                    </div>
                  )}
                </div>
              )}
            </div>
            {!engineEnabled && (
              <div className="text-[10px] font-medium text-neutral-400 italic">
                Stockfish 16.1.0 pronto para análise
              </div>
            )}
          </div>

          <div
            className="aspect-square w-full max-w-[600px] mx-auto bg-white p-2.5 rounded-2xl shadow-large border border-neutral-100 relative z-0"
          >
            {!isMounted ? (
              <div className="w-full aspect-square bg-neutral-50 animate-pulse rounded-xl flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : (
              <CustomChessBoard
                position={gameRef.current.fen()}
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
                checkSquare={gameRef.current.inCheck() ? (() => {
                  const board = gameRef.current.board();
                  for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {
                      const p = board[i][j];
                      if (p && p.type === 'k' && p.color === gameRef.current.turn()) {
                        return String.fromCharCode(97 + j) + (8 - i);
                      }
                    }
                  }
                  return null;
                })() : null}
              />
            )}
            {error && (
              <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] px-3 py-1 rounded-full font-bold z-50">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-neutral-100">
              <button 
                onClick={() => setOrientation(prev => prev === 'white' ? 'black' : 'white')}
                className="p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-500 transition-colors"
                title="Girar Tabuleiro"
              >
                <RotateCcw size={18} className={orientation === 'black' ? 'rotate-180' : ''} />
              </button>
              <div className="w-[1px] h-6 bg-neutral-100 mx-1" />
              <button 
                onClick={undoMove}
                disabled={currentNodeId === tree.rootId}
                className="p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-500 disabled:opacity-30 transition-colors"
                title="Desfazer"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={resetBoard}
                disabled={currentNodeId === tree.rootId}
                className="p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-500 disabled:opacity-30 transition-colors"
                title="Reiniciar"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={saveRepertoire}
                disabled={loading}
                className="btn btn-primary btn-md gap-2 shadow-md shadow-blue-500/10"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={16} />
                    Salvar progresso
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="card-surface flex flex-col min-h-[300px]">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/30">
              <div className="flex items-center gap-2">
                <History size={16} className="text-neutral-400" />
                <h3 className="font-semibold text-neutral-800 text-sm">Notação</h3>
              </div>
              <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                {getPathToNode(tree, currentNodeId).length} Lances
              </span>
            </div>

            {currentOpening && (
              <div className="px-4 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <Book size={12} className="text-blue-500" />
                <span className="text-[11px] font-bold text-blue-700 truncate">
                  {currentOpening}
                </span>
              </div>
            )}

            <div className="p-4 overflow-y-auto max-h-[300px]">
              {getPathToNode(tree, currentNodeId).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                  <Play size={24} className="mb-2" />
                  <p className="text-xs">Mova uma peça para<br />começar o estudo</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {(() => {
                    const currentLine = getPathToNode(tree, currentNodeId);
                    return Array.from({ length: Math.ceil(currentLine.length / 2) }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm py-1 border-b border-neutral-50 last:border-0">
                        <span className="w-5 text-neutral-300 font-mono text-[10px]">{i + 1}.</span>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <span className={`px-2 py-0.5 rounded ${currentLine.length === i*2 + 1 ? 'bg-blue-50 text-blue-700 font-bold' : 'text-neutral-700'}`}>
                            {currentLine[i * 2]}
                          </span>
                          {currentLine[i * 2 + 1] && (
                            <span className={`px-2 py-0.5 rounded ${currentLine.length === i*2 + 2 ? 'bg-blue-50 text-blue-700 font-bold' : 'text-neutral-700'}`}>
                              {currentLine[i * 2 + 1]}
                            </span>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>

          <div className="card-surface p-5 bg-neutral-900 border-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-blue-400" />
                <h3 className="font-semibold text-white text-sm">Análise de Engine</h3>
              </div>
              <div className="px-2 py-0.5 bg-blue-500/20 rounded text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                Stockfish 16
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 text-xs font-mono font-bold text-right ${
                  evaluation.startsWith('+') ? 'text-green-400' : 
                  evaluation.startsWith('-') ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {evaluation}
                </div>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={false}
                    animate={{ width: `${getEvalPercentage()}%` }}
                    transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                    className="h-full bg-blue-500"
                  />
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
                    <span className="text-neutral-500 italic">
                      {engineEnabled ? 'Calculando...' : 'Ligue o motor para analisar'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Branch & Variation Navigator - Refactored */}
      <div className="mt-4 flex flex-col gap-4">
        {/* 1. Breadcrumbs (Current Path) */}
        {getFullLineInfo(tree, currentNodeId).length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
            <button 
              onClick={() => resetBoard()}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors shrink-0"
              title="Início"
            >
              <RotateCcw size={14} />
            </button>
            <ChevronRight size={12} className="text-neutral-300 shrink-0" />
            <div className="flex items-center gap-1">
              {getFullLineInfo(tree, currentNodeId).map((step, idx) => (
                <div key={step.nodeId} className="flex items-center">
                  <button
                    onClick={() => {
                      setCurrentNodeId(step.nodeId);
                      gameRef.current = new Chess(tree.nodes[step.nodeId].fen);
                      setFen(tree.nodes[step.nodeId].fen);
                    }}
                    className={`text-[0.8125rem] font-medium px-2 py-1 rounded-md transition-all whitespace-nowrap ${
                      idx === getFullLineInfo(tree, currentNodeId).length - 1
                        ? 'text-blue-600 font-bold bg-blue-50'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ` : ''}{step.san}
                  </button>
                  {idx < getFullLineInfo(tree, currentNodeId).length - 1 && (
                    <ChevronRight size={10} className="text-neutral-300 mx-1 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Variation Explorer (Continuations) */}
        <div className="card-surface p-5 bg-white border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="text-blue-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600">Explorar Variantes</h4>
            </div>
            <span className="text-[10px] text-neutral-400 font-medium">
              {getVariations(tree, currentNodeId).length} lances salvos nesta posição
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Show saved variations */}
            {getVariations(tree, currentNodeId).map((variation) => (
              <button
                key={variation.id}
                onClick={() => {
                  setCurrentNodeId(variation.id);
                  gameRef.current = new Chess(variation.fen);
                  setFen(variation.fen);
                  setLastMove(null);
                }}
                className="group relative flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-blue-300 hover:bg-blue-50 transition-all hover:shadow-md"
              >
                <span className="text-lg font-black text-neutral-800 group-hover:text-blue-600 transition-colors">
                  {variation.san}
                </span>
                <span className="text-[9px] text-neutral-400 uppercase font-bold mt-1">
                  Linha salva
                </span>
              </button>
            ))}

            {/* Empty state or "Add new" hint */}
            {getVariations(tree, currentNodeId).length === 0 && (
              <div className="col-span-full py-8 border-2 border-dashed border-neutral-100 rounded-3xl flex flex-col items-center justify-center text-neutral-400">
                <Play size={20} className="mb-2 opacity-20" />
                <p className="text-[11px] font-medium text-center">
                  Nenhuma variante salva aqui.<br />
                  <span className="text-blue-500">Mova uma peça</span> para criar uma nova branche.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
