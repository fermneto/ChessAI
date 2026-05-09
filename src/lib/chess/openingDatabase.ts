export interface OpeningInfo {
  name: string;
  eco: string;
}

let localDatabase: Record<string, { n: string, e: string }> | null = null;
let isLoading = false;

// Pequena lista hardcoded para resposta instantânea nos lances iniciais
const FAST_TRACK: Record<string, { n: string, e: string }> = {
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR": { n: "Posição Inicial", e: "" },
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPPPPPP/RNBQKBNR": { n: "Abertura do Peão do Rei", e: "B00" },
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR": { n: "Abertura Aberta", e: "C20" },
  "rnbqkbnr/pppppppp/8/8/3P4/8/PPPPPPPP/RNBQKBNR": { n: "Abertura do Peão da Dama", e: "D00" },
};

/**
 * Carrega a base de dados de aberturas do arquivo local.
 */
async function loadDatabase() {
  if (localDatabase || isLoading) return;
  
  isLoading = true;
  try {
    const response = await fetch('/openings.json');
    if (response.ok) {
      localDatabase = await response.json();
    }
  } catch (error) {
    console.error('Erro ao carregar base de aberturas:', error);
  } finally {
    isLoading = false;
  }
}

/**
 * Busca informações da abertura utilizando a base de dados local abrangente.
 * Suporta milhares de aberturas e transposições de forma instantânea.
 */
export async function lookupOpening(fen: string): Promise<OpeningInfo | null> {
  const position = fen.split(' ')[0];

  // 1. Verificar Fast Track (instantâneo)
  const fast = FAST_TRACK[position];
  if (fast) return { name: fast.n, eco: fast.e };

  // 2. Garantir que a base completa está carregada
  if (!localDatabase) {
    await loadDatabase();
  }

  if (!localDatabase) return null;

  // 3. Tentar encontrar a posição na base completa
  const match = localDatabase[position];
  if (match) {
    return {
      name: match.n,
      eco: match.e
    };
  }
  
  return null;
}
