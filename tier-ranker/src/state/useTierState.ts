import { useCallback, useEffect, useState } from 'react';
import { concepts } from '../data/concepts';
import { tiers, UNRANKED } from '../data/tiers';

export type Board = Record<string, string[]>;
const STORAGE_KEY = 'tier-ranker:v1';

export function initialBoard(): Board {
  const board: Board = { [UNRANKED]: concepts.map((c) => c.id) };
  for (const t of tiers) board[t.id] = [];
  return board;
}

// Keep a stored board valid if the concept/tier lists change.
function sanitize(stored: Board): Board {
  const board = initialBoard();
  const known = new Set(concepts.map((c) => c.id));
  const placed = new Set<string>();
  for (const t of tiers) {
    board[t.id] = (stored[t.id] ?? []).filter((id) => known.has(id) && !placed.has(id) && placed.add(id));
  }
  board[UNRANKED] = [
    ...(stored[UNRANKED] ?? []).filter((id) => known.has(id) && !placed.has(id) && placed.add(id)),
    ...concepts.map((c) => c.id).filter((id) => !placed.has(id)),
  ];
  return board;
}

function load(): Board {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : initialBoard();
  } catch {
    return initialBoard();
  }
}

export function findContainer(board: Board, id: string): string | undefined {
  if (id in board) return id;
  return Object.keys(board).find((k) => board[k].includes(id));
}

export function useTierState() {
  const [board, setBoard] = useState<Board>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  /** Move `itemId` into `toContainer` at `toIndex` (append if undefined). */
  const move = useCallback((itemId: string, toContainer: string, toIndex?: number) => {
    setBoard((prev) => {
      const from = findContainer(prev, itemId);
      if (!from || !(toContainer in prev)) return prev;
      const next: Board = { ...prev, [from]: prev[from].filter((id) => id !== itemId) };
      const target = [...next[toContainer]];
      const idx = toIndex === undefined ? target.length : Math.max(0, Math.min(toIndex, target.length));
      target.splice(idx, 0, itemId);
      next[toContainer] = target;
      return next;
    });
  }, []);

  const reset = useCallback(() => setBoard(initialBoard()), []);

  return { board, setBoard, move, reset };
}
