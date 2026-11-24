import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { conceptById, type Concept } from '../data/concepts';
import { ConceptChip } from './ConceptChip';

type Props = { id: string; items: string[]; className: string; onOpen: (c: Concept) => void; emptyHint?: string };

export function DropList({ id, items, className, onOpen, emptyHint }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <SortableContext id={id} items={items} strategy={rectSortingStrategy}>
      <ul
        ref={setNodeRef}
        className={`${className}${isOver ? ' is-over' : ''}`}
        data-testid={`drop-${id}`}
        data-container={id}
      >
        {items.map((cid) => {
          const c = conceptById.get(cid);
          return c ? <ConceptChip key={cid} concept={c} onOpen={onOpen} /> : null;
        })}
        {items.length === 0 && emptyHint && <li className="drop-hint">{emptyHint}</li>}
      </ul>
    </SortableContext>
  );
}
