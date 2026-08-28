import { useRef, useState } from "react";
import type { DragEvent } from "react";
import type { PageItem } from "../types";

interface PageGridProps {
  pages: PageItem[];
  onReorder: (nextPages: PageItem[]) => void;
  onRemove: (pageId: string) => void;
}

export function PageGrid({ pages, onReorder, onRemove }: PageGridProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const dragCounter = useRef(0);

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setOverId(null);
      return;
    }
    const fromIndex = pages.findIndex((p) => p.id === draggedId);
    const toIndex = pages.findIndex((p) => p.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const next = pages.slice();
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onReorder(next);
    setDraggedId(null);
    setOverId(null);
  };

  return (
    <div className="page-grid">
      {pages.map((page, index) => (
        <div
          key={page.id}
          className={`page-card${draggedId === page.id ? " page-card--dragging" : ""}${
            overId === page.id && draggedId && draggedId !== page.id
              ? " page-card--over"
              : ""
          }`}
          draggable
          onDragStart={(e: DragEvent<HTMLDivElement>) => {
            setDraggedId(page.id);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragEnter={() => {
            dragCounter.current += 1;
            if (draggedId) setOverId(page.id);
          }}
          onDragLeave={() => {
            dragCounter.current -= 1;
            if (dragCounter.current <= 0) setOverId(null);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            dragCounter.current = 0;
            handleDrop(page.id);
          }}
          onDragEnd={() => {
            setDraggedId(null);
            setOverId(null);
            dragCounter.current = 0;
          }}
        >
          <div className="page-card__position">{index + 1}</div>
          <button
            type="button"
            className="page-card__remove"
            title="Retirer cette page"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(page.id);
            }}
          >
            ×
          </button>
          <div className="page-card__thumb">
            {page.thumbnail ? (
              <img src={page.thumbnail} alt={`${page.fileName} p.${page.pageNumber}`} draggable={false} />
            ) : (
              <div className="page-card__thumb-fallback">PDF</div>
            )}
          </div>
          <div className="page-card__meta">
            <span className="page-card__filename" title={page.fileName}>
              {page.fileName}
            </span>
            <span className="page-card__pagenum">page {page.pageNumber}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
