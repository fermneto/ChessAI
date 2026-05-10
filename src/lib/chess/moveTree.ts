import { v4 as uuidv4 } from 'uuid';

/**
 * Representa um lance individual na árvore de estudo
 */
export interface MoveNode {
  id: string;
  san: string;
  fen: string;
  parentId: string | null;
  comments?: string;
  children: string[]; // IDs dos nós filhos (variantes)
}

/**
 * Estrutura completa da árvore de lances de um repertório
 */
export interface ChessTree {
  nodes: Record<string, MoveNode>;
  rootId: string;
}

/**
 * Cria uma árvore de xadrez vazia a partir da posição inicial
 * @param initialFen A posição FEN inicial (geralmente a posição de partida)
 */
export const createEmptyTree = (initialFen: string): ChessTree => {
  const rootId = 'root';
  return {
    rootId,
    nodes: {
      [rootId]: {
        id: rootId,
        san: '',
        fen: initialFen,
        parentId: null,
        children: [],
      }
    }
  };
};

/**
 * Adiciona um lance à árvore ou retorna o nó existente se o lance já foi feito
 * @param tree A árvore atual
 * @param parentId O ID do nó pai onde o lance será aplicado
 * @param san O lance em notação algébrica (ex: "e4")
 * @param fen A posição FEN resultante do lance
 */
export const addMoveToTree = (
  tree: ChessTree,
  parentId: string,
  san: string,
  fen: string
): { tree: ChessTree; nodeId: string } => {
  const parentNode = tree.nodes[parentId];
  if (!parentNode) return { tree, nodeId: parentId };

  // Verifica se o lance já existe como filho para evitar duplicatas
  const existingChildId = parentNode.children.find(
    childId => tree.nodes[childId].san === san
  );

  if (existingChildId) {
    return { tree, nodeId: existingChildId };
  }

  // Cria um novo nó com ID único
  const newNodeId = uuidv4();
  const newNode: MoveNode = {
    id: newNodeId,
    san,
    fen,
    parentId,
    children: [],
  };

  const newTree = {
    ...tree,
    nodes: {
      ...tree.nodes,
      [newNodeId]: newNode,
      [parentId]: {
        ...parentNode,
        children: [...parentNode.children, newNodeId]
      }
    }
  };

  return { tree: newTree, nodeId: newNodeId };
};

/**
 * Retorna a lista de lances (SAN) desde a raiz até um nó específico
 * @param tree A árvore de lances
 * @param nodeId O ID do nó de destino
 */
export const getPathToNode = (tree: ChessTree, nodeId: string): string[] => {
  const path: string[] = [];
  let current = tree.nodes[nodeId];
  
  while (current && current.parentId !== null) {
    path.unshift(current.san);
    current = tree.nodes[current.parentId];
  }
  
  return path;
};

/**
 * Retorna todos os nós filhos (variantes) de um nó específico
 * @param tree A árvore de lances
 * @param nodeId O ID do nó pai
 */
export const getVariations = (tree: ChessTree, nodeId: string): MoveNode[] => {
  const node = tree.nodes[nodeId];
  if (!node) return [];
  return node.children.map(id => tree.nodes[id]);
};

/**
 * Estrutura de dados para representar um passo no caminho atual com suas alternativas
 */
export interface PathStep {
  nodeId: string;
  san: string;
  siblings: { id: string; san: string }[];
}

/**
 * Obtém informações detalhadas da linha atual, incluindo variantes irmãs em cada passo
 * @param tree A árvore de lances
 * @param nodeId O ID do nó atual
 */
export const getFullLineInfo = (tree: ChessTree, nodeId: string): PathStep[] => {
  const path: PathStep[] = [];
  let currentId = nodeId;

  while (currentId !== tree.rootId) {
    const node = tree.nodes[currentId];
    if (!node || !node.parentId) break;

    const parent = tree.nodes[node.parentId];
    path.unshift({
      nodeId: node.id,
      san: node.san,
      siblings: parent.children
        .filter(id => id !== node.id)
        .map(id => ({ id, san: tree.nodes[id].san }))
    });

    currentId = node.parentId;
  }

  return path;
};
