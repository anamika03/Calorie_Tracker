import { forwardRef } from 'react';
import { tiers } from '../data/tiers';
import type { Board } from '../state/useTierState';
import type { Concept } from '../data/concepts';
import { DropList } from './DropList';

type Props = { board: Board; onOpen: (c: Concept) => void };

export const TierBoard = forwardRef<HTMLDivElement, Props>(function TierBoard({ board, onOpen }, ref) {
  return (
    <div className="board" ref={ref} data-testid="board">
      {tiers.map((t) => (
        <section className="tier" key={t.id} data-testid={`tier-${t.id}`}>
          <div className="tier__label" style={{ background: t.color }}>
            {t.label}
          </div>
          <DropList id={t.id} items={board[t.id]} className="tier__items" onOpen={onOpen} />
        </section>
      ))}
    </div>
  );
});
