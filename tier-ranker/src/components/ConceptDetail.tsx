import { useEffect } from 'react';
import type { Concept } from '../data/concepts';

export function ConceptDetail({ concept, onClose }: { concept: Concept; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose} data-testid="concept-detail-backdrop">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="concept-detail-title"
        data-testid="concept-detail"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <img src={concept.icon} alt="" className="modal__icon" />
          <h2 id="concept-detail-title">{concept.name}</h2>
        </div>
        <p>{concept.description}</p>
        <button className="btn" onClick={onClose} autoFocus>
          Close
        </button>
      </div>
    </div>
  );
}
