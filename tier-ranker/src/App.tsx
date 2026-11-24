import { useCallback, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toBlob, toPng } from 'html-to-image';
import { conceptById, type Concept } from './data/concepts';
import { UNRANKED } from './data/tiers';
import { findContainer, useTierState } from './state/useTierState';
import { TierBoard } from './components/TierBoard';
import { DropList } from './components/DropList';
import { ChipBody } from './components/ConceptChip';
import { ConceptDetail } from './components/ConceptDetail';

const EXPORT_OPTS = { pixelRatio: 2, backgroundColor: '#f6f7f9', cacheBust: true };

export default function App() {
  const { board, setBoard, move, reset } = useTierState();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Concept | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  };

  // Pointer-first collisions; when over a container, snap to its closest chip.
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const pointer = pointerWithin(args);
      const hits = pointer.length ? pointer : rectIntersection(args);
      const overId = hits[0]?.id;
      if (overId === undefined) return [];
      const key = String(overId);
      if (key in board && board[key].length > 0) {
        const inner = closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((c) => board[key].includes(String(c.id))),
        });
        if (inner.length) return inner;
      }
      return [{ id: overId }];
    },
    [board],
  );

  const onDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id));

  // Cross-container moves happen live while dragging.
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const id = String(active.id);
    const from = findContainer(board, id);
    const to = findContainer(board, String(over.id));
    if (!from || !to || from === to) return;
    const overIndex = board[to].indexOf(String(over.id));
    move(id, to, overIndex === -1 ? undefined : overIndex);
  };

  // Same-container reordering happens on drop.
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;
    const id = String(active.id);
    const container = findContainer(board, id);
    if (!container || container !== findContainer(board, String(over.id))) return;
    const oldIndex = board[container].indexOf(id);
    const newIndex = board[container].indexOf(String(over.id));
    if (newIndex !== -1 && oldIndex !== newIndex) {
      setBoard((prev) => ({ ...prev, [container]: arrayMove(prev[container], oldIndex, newIndex) }));
    }
  };

  const download = useCallback(async () => {
    if (!exportRef.current) return;
    try {
      const dataUrl = await toPng(exportRef.current, EXPORT_OPTS);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'system-design-tier-list.png';
      a.click();
    } catch {
      flash('Could not create image');
    }
  }, []);

  const copy = useCallback(async () => {
    if (!exportRef.current) return;
    try {
      const blob = await toBlob(exportRef.current, EXPORT_OPTS);
      if (!blob) throw new Error('no blob');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      flash('Copied to clipboard');
    } catch {
      flash('Clipboard not available, try Download');
    }
  }, []);

  const active = activeId ? conceptById.get(activeId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <main className="page">
        <div ref={exportRef} className="export-area" data-testid="export-area">
          <header className="header">
            <p className="eyebrow">
              <span className="eyebrow__rule" /> TOOL · TIER LIST
            </p>
            <h1>
              Rank the <span className="accent">system design</span> stack.
            </h1>
            <p className="lede">
              Drag each concept into a tier. When you're happy with it, download a shareable image or copy it to your
              clipboard.
            </p>
            <p className="hint">→ Tap a concept to see what it is</p>
          </header>
          <TierBoard board={board} onOpen={setDetail} />
        </div>
      </main>

      <footer className="tray">
        <div className="tray__inner">
          <div className="tray__top">
            <div>
              <p className="tray__label">UNRANKED</p>
              <p className="tray__sub">Drag into a tier above ↑</p>
            </div>
            <div className="toolbar">
              <button className="btn" onClick={reset} data-testid="reset">
                Reset
              </button>
              <button className="btn" onClick={copy} data-testid="copy">
                Copy image
              </button>
              <button className="btn btn--primary" onClick={download} data-testid="download">
                Download PNG
              </button>
            </div>
          </div>
          <DropList
            id={UNRANKED}
            items={board[UNRANKED]}
            className="tray__items"
            onOpen={setDetail}
            emptyHint="All ranked! Drag a chip back here to unrank it."
          />
        </div>
      </footer>

      <DragOverlay>{active ? <ChipBody concept={active} overlay /> : null}</DragOverlay>
      {detail && <ConceptDetail concept={detail} onClose={() => setDetail(null)} />}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </DndContext>
  );
}
