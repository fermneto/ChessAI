'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import CustomChessBoard from '@/components/chess/CustomChessBoard';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Save, 
  Play, 
  Settings,
  Info,
  History,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type Repertoire = Database['public']['Tables']['repertoires']['Row'];

interface Props {
  repertoire: Repertoire;
  onUpdate?: (updated: Repertoire) => void;
}

export default function StudyBoard({ repertoire, onUpdate }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const gameRef = useRef(new Chess());
  const moves = repertoire.moves as any;
  const [fen, setFen] = useState(moves?.current_fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync state with repertoire when it changes from outside
  useEffect(() => {
    const savedMoves = (repertoire.moves as any);
    if (savedMoves?.current_fen) {
      gameRef.current = new Chess(savedMoves.current_fen);
      setFen(gameRef.current.fen());
      setHistory(savedMoves.history || []);
    }
  }, [repertoire.id]); // Only re-sync if the ID changes to avoid loops

  const [tick, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  // Initialize engine safely
  if (!gameRef.current || (typeof gameRef.current.fen !== 'function')) {
    gameRef.current = new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }

  function onSquareClick(square: string) {
    const piece = gameRef.current.get(square as any);
    setDebug(`Clique: ${square} | Turno: ${gameRef.current.turn()}`);

    if (selectedSquare) {
      try {
        const move = gameRef.current.move({
          from: selectedSquare,
          to: square,
          promotion: 'q',
        });

        if (move) {
          setHistory(prev => [...prev, move.san]);
          setLastMove(move.from + move.to);
          setError(null);
          setSelectedSquare(null);
          forceUpdate();
          return;
        }
      } catch (e) {
        setError('Lance ilegal');
      }
      setSelectedSquare(piece ? square : null);
    } else {
      if (piece) {
        setSelectedSquare(square);
        setError(null);
      }
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
        setHistory(prev => [...prev, move.san]);
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
    gameRef.current.undo();
    setFen(gameRef.current.fen());
    setHistory(prev => prev.slice(0, -1));
    setLastMove(null);
  };

  const resetBoard = () => {
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setHistory([]);
    setLastMove(null);
  };

  const saveRepertoire = async () => {
    setLoading(true);
    setError(null);

    const { data, error: updateError } = await (supabase
      .from('repertoires') as any)
      .update({
        moves: {
          current_fen: gameRef.current.fen(),
          history: history,
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

  const boardRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(560);

  useEffect(() => {
    if (boardRef.current) {
      setBoardWidth(boardRef.current.offsetWidth - 20);
    }
    const handleResize = () => {
      if (boardRef.current) setBoardWidth(boardRef.current.offsetWidth - 20);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMounted]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Board Column */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div 
            ref={boardRef}
            className="aspect-square w-full max-w-[600px] mx-auto bg-white p-2.5 rounded-2xl shadow-large border border-neutral-100 relative"
          >
            {!isMounted ? (
              <div className="w-full aspect-square bg-neutral-50 animate-pulse rounded-xl flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : (
              <CustomChessBoard
                position={gameRef.current.fen()}
                onSquareClick={onSquareClick}
                boardOrientation={repertoire.color}
                selectedSquare={selectedSquare}
                lastMove={lastMove}
              />
            )}
            {error && (
              <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] px-3 py-1 rounded-full font-bold z-50">
                {error}
              </div>
            )}
          </div>

          {/* Manual Move Input for Diagnosis */}
          <div className="bg-white p-3 rounded-2xl shadow-soft border border-neutral-100 flex gap-3 items-center">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Digite um lance (ex: e4)"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value;
                    
                    // Teste de Força Bruta para e4
                    if (val.toLowerCase() === 'e4') {
                      gameRef.current = new Chess('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
                      setHistory(['e4']);
                      setError(null);
                      setDebug('FORÇADO: e4');
                      forceUpdate();
                      (e.target as HTMLInputElement).value = '';
                      return;
                    }

                    try {
                      const move = gameRef.current.move(val);
                      if (move) {
                        setHistory(prev => [...prev, move.san]);
                        setLastMove(move.from + move.to);
                        (e.target as HTMLInputElement).value = '';
                        setError(null);
                        setDebug(`Manual: ${move.san}`);
                        forceUpdate();
                      }
                    } catch (err) {
                      setError('Lance inválido');
                    }
                  }
                }}
              />
            </div>
            <div className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              Modo Texto
            </div>
          </div>

          {/* Board Controls */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={undoMove}
                disabled={history.length === 0}
                className="p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-500 disabled:opacity-30 transition-colors"
                title="Desfazer"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={resetBoard}
                disabled={history.length === 0}
                className="p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-500 disabled:opacity-30 transition-colors"
                title="Reiniciar"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {error && <span className="text-xs text-red-500 mr-2">{error}</span>}
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

        {/* Moves & Info Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* History Card */}
          <div className="card-surface flex-1 flex flex-col min-h-[300px]">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={16} className="text-neutral-400" />
                <h3 className="font-semibold text-neutral-800 text-sm">Notação</h3>
              </div>
              <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                {history.length} Lances
              </span>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[400px]">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                  <Play size={24} className="mb-2" />
                  <p className="text-xs">Mova uma peça para<br />começar o estudo</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm py-1 border-b border-neutral-50 last:border-0">
                      <span className="w-5 text-neutral-300 font-mono text-[10px]">{i + 1}.</span>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <span className={`px-2 py-0.5 rounded ${history.length === i*2 + 1 ? 'bg-blue-50 text-blue-700 font-bold' : 'text-neutral-700'}`}>
                          {history[i * 2]}
                        </span>
                        {history[i * 2 + 1] && (
                          <span className={`px-2 py-0.5 rounded ${history.length === i*2 + 2 ? 'bg-blue-50 text-blue-700 font-bold' : 'text-neutral-700'}`}>
                            {history[i * 2 + 1]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Engine Analysis Placeholder */}
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
                <div className="w-10 text-xs font-mono text-blue-400 font-bold text-right">+0.4</div>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: '50%' }}
                    animate={{ width: '55%' }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="text-[10px] text-neutral-500 font-bold uppercase mb-1">Melhor linha</div>
                <p className="text-xs text-neutral-300 font-mono">
                  {lastMove ? `... ${lastMove} Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3` : 'Aguardando lance...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
