'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Chess } from 'chess.js';
import CustomChessBoard from '@/components/chess/CustomChessBoard';
import { 
  Trophy, 
  Target, 
  HelpCircle, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Brain,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';
import { 
  type ChessTree, 
  type MoveNode, 
  getPathToNode,
} from '@/lib/chess/moveTree';
import { lookupOpening } from '@/lib/chess/openingDatabase';
import { puzzleService } from '@/lib/chess/puzzleService';

type Repertoire = Database['public']['Tables']['repertoires']['Row'];

interface Props {
  repertoire: Repertoire;
}

interface TrainingStats {
  total: number;
  correct: number;
  streak: number;
  bestStreak: number;
}

export default function TrainingSession({ repertoire }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const gameRef = useRef(new Chess());
  const tree = repertoire.moves as unknown as ChessTree;
  
  // State
  const [mode, setMode] = useState<'repertoire' | 'tactics'>('repertoire');
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [currentPuzzle, setCurrentPuzzle] = useState<any>(null);
  const [isLoadingPuzzle, setIsLoadingPuzzle] = useState(true);
  const [solutionIndex, setSolutionIndex] = useState(0);
  const [lastMove, setLastMove] = useState<string | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [status, setStatus] = useState<'waiting' | 'correct' | 'wrong' | 'hint' | 'complete'>('waiting');
  const [hintText, setHintText] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);
  const [stats, setStats] = useState<TrainingStats>({ total: 0, correct: 0, streak: 0, bestStreak: 0 });
  const [sessionMoves, setSessionMoves] = useState(0);
  const [playedPuzzleIds, setPlayedPuzzleIds] = useState<Set<string>>(new Set());
  const [manualArrows, setManualArrows] = useState<{from: string, to: string, color?: string}[]>([]);
  
  const supabase = createClient();



  const startNewPuzzle = useCallback(async (newMode?: 'repertoire' | 'tactics') => {
    const activeMode = newMode || mode;
    setStatus('waiting');
    setHintText(null);
    setLastMove(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setSolutionIndex(0);
    setManualArrows([]);

    setIsLoadingPuzzle(true);

    // Helper para extrair o tema de abertura Lichess baseado no estudo
    let openingTheme: string | undefined = undefined;
    if (activeMode === 'repertoire') {
      let rawOpeningName = repertoire.opening_name;
      
      // Fallback: se não estiver salvo no banco, descobre dinamicamente pela árvore
      if (!rawOpeningName && tree && tree.nodes && Object.keys(tree.nodes).length > 1) {
        // Encontra o nó mais profundo (linha principal)
        let maxDepth = -1;
        let deepestNode = Object.values(tree.nodes)[0];
        
        for (const node of Object.values(tree.nodes)) {
          const path = getPathToNode(tree, node.id);
          if (path.length > maxDepth) {
            maxDepth = path.length;
            deepestNode = node;
          }
        }

        // Sobe a partir desse nó até o root procurando a última abertura reconhecida
        let current: MoveNode | undefined = deepestNode;
        while (current) {
          const info = await lookupOpening(current.fen);
          if (info) {
            rawOpeningName = info.name;
            break;
          }
          current = current.parentId ? tree.nodes[current.parentId] : undefined;
        }
      }

      if (!rawOpeningName) {
         setCurrentPuzzle(null);
         setIsLoadingPuzzle(false);
         return; // Aborta e mostra o empty state, pois não conseguiu identificar a abertura
      }
      
      openingTheme = rawOpeningName.split(':')[0].trim()
        .replace(/'s/g, 's')
        .replace(/\s+/g, '_');
    }

    // Busca o puzzle (com ou sem filtro de abertura)
    let puzzle = await puzzleService.getPuzzle(playedPuzzleIds, openingTheme); 
    
    // Se falhar em encontrar com o tema, cai pro fallback aleatório
    if (!puzzle && openingTheme) {
       puzzle = await puzzleService.getPuzzle(playedPuzzleIds);
    }
    
    if (puzzle) {
      gameRef.current = new Chess(puzzle.fen);
      setFen(puzzle.fen);
      setCurrentPuzzle(puzzle);
      setPlayedPuzzleIds(prev => new Set(prev).add(puzzle!.id));
      setSolutionIndex(0); // O primeiro lance esperado (solution[0]) é o do usuário
    }
    
    setIsLoadingPuzzle(false);
  }, [mode, playedPuzzleIds, repertoire.opening_name]);

  useEffect(() => {
    setIsMounted(true);
    startNewPuzzle();
  }, []); // Only on mount

  // Identify opening
  useEffect(() => {
    if (fen && mode === 'repertoire') {
      lookupOpening(fen).then(info => {
        if (info) setOpening(`${info.eco}: ${info.name}`);
      });
    } else if (currentPuzzle) {
      setOpening(currentPuzzle.themes?.slice(0, 2).join(', ') || 'Tático');
    }
  }, [fen, mode, currentPuzzle]);

  const onSquareClick = (square: string) => {
    if (status === 'correct' || status === 'complete') return;

    if (selectedSquare) {
      const success = handleMove(selectedSquare, square);
      if (success) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      setManualArrows([]);
      return;
    }

    const piece = gameRef.current.get(square as any);
    if (piece && piece.color === gameRef.current.turn()) {
      setSelectedSquare(square);
      const moves = gameRef.current.moves({ square: square as any, verbose: true });
      setLegalMoves(Array.from(new Set(moves.map(m => m.to))));
      setManualArrows([]);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
      setManualArrows([]);
    }
  };

  const handleMove = (from: string, to: string) => {
    try {
      // Verificar se o lance é uma promoção para não enviar 'promotion' desnecessariamente
      const piece = gameRef.current.get(from as any);
      const isPromotion = piece && piece.type === 'p' && 
                          ((piece.color === 'w' && to[1] === '8') || 
                           (piece.color === 'b' && to[1] === '1'));
                           
      const moveOpts: any = { from, to };
      if (isPromotion) moveOpts.promotion = 'q';

      const move = gameRef.current.move(moveOpts);
      if (move) {
        setManualArrows([]);
        const moveUCI = from + to + (isPromotion ? 'q' : '');
        setFen(gameRef.current.fen());
        setLastMove(moveUCI);
        
        // Ambas as abas agora usam a lógica de Tática (solucionar lances do Lichess)
        // A diferença é apenas a origem do puzzle (Tema vs Aleatório)
        const expectedUCI = currentPuzzle?.solution[solutionIndex];
        
        if (!expectedUCI) return true; // Falha de segurança
          if (moveUCI === expectedUCI) {
            const nextIdx = solutionIndex + 1;
            if (nextIdx < currentPuzzle.solution.length) {
              // CPU Responde se houver mais lances na solução
              setSolutionIndex(nextIdx + 1);
              const cpuMoveUCI = currentPuzzle.solution[nextIdx];
              setTimeout(() => {
                try {
                  const cpuMoveOpts: any = {
                    from: cpuMoveUCI.slice(0, 2),
                    to: cpuMoveUCI.slice(2, 4)
                  };
                  if (cpuMoveUCI.length > 4) cpuMoveOpts.promotion = cpuMoveUCI[4];
                  
                  gameRef.current.move(cpuMoveOpts);
                  setFen(gameRef.current.fen());
                  setLastMove(cpuMoveUCI);
                  
                  // Se o lance do CPU foi o último, o puzzle acabou
                  if (nextIdx + 1 >= currentPuzzle.solution.length) {
                    handleSuccess();
                  }
                } catch (e) {
                  console.error('Erro lance CPU tática:', e);
                }
              }, 500);
            } else {
              handleSuccess();
            }
          } else {
            handleFailure();
          }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const handleSuccess = () => {
    setStatus('correct');
    setStats(prev => {
      const newStreak = prev.streak + 1;
      return {
        total: prev.total + 1,
        correct: prev.correct + 1,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak)
      };
    });
    
    setSessionMoves(prev => {
      const newMoves = prev + 1;
      if (newMoves === 10) {
        setTimeout(() => {
          setStatus('complete');
          saveSession(); // Adiciona uma unidade para o contador de treinos
        }, 1500);
      } else {
        setTimeout(() => {
          startNewPuzzle();
        }, 1500);
      }
      return newMoves;
    });
  };

  const handleFailure = () => {
    setStatus('wrong');
    setStats(prev => ({ ...prev, total: prev.total + 1, streak: 0 }));
    
    setTimeout(() => {
      gameRef.current.undo();
      setFen(gameRef.current.fen());
      setLastMove(null);
      setStatus('waiting');
    }, 1000);
  };

  const getHint = async () => {
    // Agora ambas as abas usam Puzzles
    const targetMove = currentPuzzle?.solution[solutionIndex];
    if (!targetMove || loadingHint) return;
    
    // Highlight origin square
    try {
      // Para táticas, já é UCI (ex: e2e4)
      const originSquare = targetMove.slice(0, 2);

      if (originSquare) {
        setManualArrows([{ from: originSquare, to: originSquare, color: 'rgba(34, 197, 94, 0.8)' }]);
      }
    } catch (e) {}

    setLoadingHint(true);
    try {
      const response = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fen: gameRef.current.fen(),
          expectedMove: targetMove,
          history: [],
          opening: opening || 'Tático',
          repertoireName: mode === 'repertoire' ? repertoire.name : 'Treino de Tática',
          turn: gameRef.current.turn()
        }),
      });
      const data = await response.json();
      setHintText(data.hint);
      setStatus('hint');
    } catch (err) {
      setHintText("Pense no desenvolvimento e nas casas centrais.");
    } finally {
      setLoadingHint(false);
    }
  };



  const saveSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await (supabase.from('training_sessions') as any).insert({
      user_id: user.id,
      repertoire_id: mode === 'repertoire' ? repertoire.id : null,
      duration_seconds: 0,
      moves_played: stats.total,
      correct_moves: stats.correct,
      session_type: mode === 'repertoire' ? 'drill' : 'exploration'
    });
  };

  if (!isMounted) return null;

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      
      {/* Board Column */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {/* Mode Selector */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mb-2">
           <button 
             onClick={() => { setMode('repertoire'); startNewPuzzle('repertoire'); }}
             className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'repertoire' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
           >
             Repertório
           </button>
           <button 
             onClick={() => { setMode('tactics'); startNewPuzzle('tactics'); }}
             className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'tactics' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
           >
             Tática (DB)
           </button>
        </div>

        <div className="w-full max-w-[550px] relative">
          {!currentPuzzle && !isLoadingPuzzle && mode === 'repertoire' ? (
            <div className="aspect-square bg-neutral-800 rounded-2xl flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10">
              <div className="text-4xl mb-4 opacity-20">📭</div>
              <h3 className="text-lg font-bold text-white mb-2">Repertório Vazio</h3>
              <p className="text-sm text-neutral-500 mb-6">Sua linha de abertura ainda não foi reconhecida. Adicione mais lances ao seu repertório no modo de estudo para liberar os exercícios.</p>
              <Link href={`/repertoire/${repertoire.id}`} className="btn btn-primary btn-sm">Ir para Estudo</Link>
            </div>
          ) : (
            <AnimatePresence mode="wait">
               <motion.div
                  key={currentPuzzle?.id || 'empty'}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
               >
                  <CustomChessBoard 
                    position={fen}
                    onSquareClick={onSquareClick}
                    boardOrientation={mode === 'repertoire' 
                      ? repertoire.color 
                      : (currentPuzzle ? (new Chess(currentPuzzle.fen).turn() === 'w' ? 'black' : 'white') : repertoire.color)
                    }
                    selectedSquare={selectedSquare}
                    lastMove={lastMove}
                    legalMoves={legalMoves}
                    manualArrows={manualArrows}
                    onManualArrowsChange={setManualArrows}
                  />
               </motion.div>
            </AnimatePresence>
          )}

          {/* Feedback Overlay */}
          <AnimatePresence>
            {status === 'correct' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-emerald-500/90 text-white p-8 rounded-full shadow-2xl backdrop-blur-sm flex flex-col items-center gap-2">
                  <CheckCircle2 size={64} className="animate-bounce" />
                  <span className="font-black text-2xl uppercase tracking-tighter italic">Excelente!</span>
                </div>
              </motion.div>
            )}
            {status === 'wrong' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-red-500/90 text-white p-8 rounded-full shadow-2xl backdrop-blur-sm flex flex-col items-center gap-2">
                  <XCircle size={64} className="animate-shake" />
                  <span className="font-black text-2xl uppercase tracking-tighter italic">Tente de novo</span>
                </div>
              </motion.div>
            )}
            {status === 'complete' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-neutral-900/95 backdrop-blur-md rounded-2xl border border-white/10"
              >
                <div className="flex flex-col items-center justify-center text-center max-w-sm">
                  <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                    <Trophy size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-2">Sessão Concluída!</h3>
                  <p className="text-neutral-400 text-sm mb-8">Você completou o limite de exercícios. Seu treino foi contabilizado com sucesso.</p>
                  
                  <div className="flex gap-3 w-full">
                    <Link href={`/repertoire/${repertoire.id}`} className="flex-1 btn btn-ghost text-sm py-3">Voltar</Link>
                    <button 
                      onClick={() => {
                        setSessionMoves(0);
                        startNewPuzzle();
                      }}
                      className="flex-1 btn btn-primary text-sm py-3"
                    >
                      Treinar Mais
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Board Controls */}
        <div className="flex items-center gap-3 w-full max-w-[550px]">
           <button 
             onClick={() => startNewPuzzle()}
             className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-wider"
           >
             <RefreshCw size={14} />
             Pular
           </button>
           <button 
             onClick={getHint}
             disabled={loadingHint || !!hintText || !currentPuzzle}
             className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 transition-all flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-indigo-900/20"
           >
             {loadingHint ? <Brain size={14} className="animate-pulse" /> : <HelpCircle size={14} />}
             Hint por IA
           </button>
        </div>
      </div>

      {/* Info Column */}
      <div className="w-full md:w-[320px] flex flex-col gap-4">
        
        {/* Stats Card */}
        <div className="bg-neutral-800/50 border border-white/10 rounded-2xl p-5 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Trophy size={60} />
          </div>
          
          <h3 className="text-neutral-400 text-[9px] font-black uppercase tracking-[0.2em] mb-4">Seu Desempenho</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-2xl font-black text-white tabular-nums">
                {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
              </span>
              <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-tighter">Precisão</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black text-orange-500 tabular-nums flex items-center gap-1">
                {stats.streak}
                <Zap size={18} fill="currentColor" className="animate-pulse" />
              </span>
              <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-tighter">Streak</p>
            </div>
          </div>
        </div>

        {/* Puzzle Context Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
             <div className="flex items-center gap-2">
                <Target size={14} className="text-blue-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Contexto</span>
             </div>
             {mode === 'tactics' && currentPuzzle && (
                <div className="px-2 py-0.5 bg-blue-500/20 rounded text-[9px] font-bold text-blue-400">
                   Rating: {currentPuzzle.rating}
                </div>
             )}
          </div>
          <div className="p-4 space-y-4">
             <div>
                <p className="text-[9px] text-neutral-500 font-bold uppercase mb-1">Tema</p>
                <p className="text-xs font-bold text-white leading-tight">
                   {opening || 'Praticando...'}
                </p>
             </div>
             
             <div>
                <p className="text-[9px] text-neutral-500 font-bold uppercase mb-1">Objetivo</p>
                <div className="flex items-center gap-2">
                   <div className={`w-2.5 h-2.5 rounded-full ${gameRef.current.turn() === 'w' ? 'bg-white shadow-[0_0_8px_white]' : 'bg-neutral-600'}`} />
                   <span className="text-xs font-bold text-neutral-200">
                      {gameRef.current.turn() === 'w' ? 'Brancas jogam e ganham' : 'Pretas jogam e ganham'}
                   </span>
                </div>
             </div>
          </div>
        </div>

        {/* AI Hint Section */}
        <AnimatePresence>
          {hintText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/20 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                 <Brain size={14} className="text-blue-400" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300">Dica da IA</span>
              </div>
              <p className="text-xs text-blue-50 font-medium leading-relaxed italic">
                 "{hintText}"
              </p>
              <button 
                onClick={() => setHintText(null)}
                className="mt-3 text-[9px] font-black uppercase tracking-widest text-blue-400/40 hover:text-blue-300 transition-colors"
              >
                Ocultar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer/Progress */}
        <div className="mt-auto pt-4">
           <div className="flex items-center justify-between text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-2">
              <span>Modo: {mode === 'repertoire' ? 'Repertório' : 'Tática'}</span>
              <span>{sessionMoves} Concluídos</span>
           </div>
           <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${mode === 'repertoire' ? 'bg-orange-500' : 'bg-blue-500'}`}
                animate={{ width: `${Math.min(100, (sessionMoves / 10) * 100)}%` }}
              />
           </div>
        </div>
      </div>
    </div>
  );
}
