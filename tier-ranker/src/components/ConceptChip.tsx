import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Concept } from '../data/concepts';

type ChipProps = { concept: Concept; onOpen?: (c: Concept) => void; overlay?: boolean };

export function ChipBody({ concept, overlay }: { concept: Concept; overlay?: boolean }) {
  return (
    <span className={`chip${overlay ? ' chip--overlay' : ''}`}>
      <img className="chip__icon" src={concept.icon} alt="" draggable={false} />
      <span className="chip__name">{concept.name}</span>
    </span>
  );
}

export function ConceptChip({ concept, onOpen }: ChipProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: concept.id });
  return (
    <li
      ref={setNodeRef}
      className={`chip-wrap${isDragging ? ' chip-wrap--dragging' : ''}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      data-testid={`chip-${concept.id}`}
      data-concept={concept.id}
      aria-label={concept.name}
      onClick={() => onOpen?.(concept)}
      {...attributes}
      {...listeners}
    >
      <ChipBody concept={concept} />
    </li>
  );
}
