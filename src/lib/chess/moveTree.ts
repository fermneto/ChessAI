import { v4 as uuidv4 } from 'uuid';

export interface MoveNode {
  id: string;
  san: string;
  fen: string;
  parentId: string | null;
  comments?: string;
  children: string[]; // IDs of children nodes
}

export interface ChessTree {
  nodes: Record<string, MoveNode>;
  rootId: string;
}

/**
 * Creates an empty chess tree starting from the initial position
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
 * Adds a move to the tree or returns existing node if already present
 */
export const addMoveToTree = (
  tree: ChessTree,
  parentId: string,
  san: string,
  fen: string
): { tree: ChessTree; nodeId: string } => {
  const parentNode = tree.nodes[parentId];
  if (!parentNode) return { tree, nodeId: parentId };

  // Check if move already exists as a child
  const existingChildId = parentNode.children.find(
    childId => tree.nodes[childId].san === san
  );

  if (existingChildId) {
    return { tree, nodeId: existingChildId };
  }

  // Create new node
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
 * Converts a linear history array to a tree structure
 */
export const fromLinearHistory = (history: string[], fens: string[]): ChessTree => {
  let tree = createEmptyTree(fens[0] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  let currentId = tree.rootId;

  // If we only have history, we might need to recalculate FENs, 
  // but here we assume fens[i] is the result of history[i-1]
  // history: [e4, e5], fens: [start, fen_after_e4, fen_after_e5]
  
  for (let i = 0; i < history.length; i++) {
    const result = addMoveToTree(tree, currentId, history[i], fens[i+1]);
    tree = result.tree;
    currentId = result.nodeId;
  }

  return tree;
};

/**
 * Gets the main line (sequence of SANs) from root to a specific node
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
 * Gets all variations (children) of a node
 */
export const getVariations = (tree: ChessTree, nodeId: string): MoveNode[] => {
  const node = tree.nodes[nodeId];
  if (!node) return [];
  return node.children.map(id => tree.nodes[id]);
};

/**
 * Gets detailed info for the current path, including siblings at each step
 */
export interface PathStep {
  nodeId: string;
  san: string;
  siblings: { id: string; san: string }[];
}

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
