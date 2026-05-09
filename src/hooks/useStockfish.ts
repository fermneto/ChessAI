'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useStockfish() {
  const [engine, setEngine] = useState<Worker | null>(null);
  const [evaluation, setEvaluation] = useState<string>('0.0');
  const [bestMove, setBestMove] = useState<string | null>(null);
  const [bestLine, setBestLine] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Carregar o Stockfish 16 local da pasta /public usando o nome correto do arquivo
    const stockfishWorker = new Worker('/stockfish-nnue-16.js');
    
    stockfishWorker.onmessage = (e) => {
      const line = e.data;
      // console.log('SF16:', line); 
      
      if (line.includes('info') && line.includes(' score ')) {
        const parts = line.split(' ');
        
        // CP
        const cpIndex = parts.indexOf('cp');
        if (cpIndex !== -1 && parts[cpIndex + 1]) {
          // Detectar turno para perspectiva
          const turn = lastFenRef.current.split(' ')[1];
          let score = parseInt(parts[cpIndex + 1]) / 100;
          if (turn === 'b') score = -score;
          setEvaluation(score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1));
        }
        
        // Mate
        const mateIndex = parts.indexOf('mate');
        if (mateIndex !== -1 && parts[mateIndex + 1]) {
          const turn = lastFenRef.current.split(' ')[1];
          let mateScore = parseInt(parts[mateIndex + 1]);
          if (turn === 'b') mateScore = -mateScore;
          setEvaluation(`M${mateScore}`);
        }

        // PV (Melhor Linha)
        const pvIndex = parts.indexOf('pv');
        if (pvIndex !== -1) {
          const pvMoves = parts.slice(pvIndex + 1, pvIndex + 8); // Pegar os próximos 7 lances
          setBestLine(pvMoves);
        }
      }
      
      if (line.startsWith('bestmove')) {
        const parts = line.split(' ');
        if (parts[1] && parts[1] !== '(none)') {
          setBestMove(parts[1]);
        }
        setIsAnalyzing(false);
      }
    };

    // Configuração Stockfish 16 com NNUE
    stockfishWorker.postMessage('uci');
    stockfishWorker.postMessage('setoption name Use NNUE value true');
    stockfishWorker.postMessage('setoption name EvalFile value nn-5af11540bbfe.nnue');
    stockfishWorker.postMessage('isready');
    
    setEngine(stockfishWorker);

    return () => {
      stockfishWorker.terminate();
    };
  }, []);

  const lastFenRef = useRef('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

  const analyzePosition = useCallback((fen: string, depth = 15) => {
    if (!engine) return;
    lastFenRef.current = fen;
    setIsAnalyzing(true);
    engine.postMessage('stop');
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage(`go depth ${depth}`);
  }, [engine]);

  return {
    evaluation,
    bestMove,
    bestLine,
    isAnalyzing,
    analyzePosition
  };
}
