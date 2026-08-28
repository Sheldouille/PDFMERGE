import { useCallback, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";

interface DropzoneProps {
  onFiles: (files: File[]) => void;
  busy: boolean;
}

export function Dropzone({ onFiles, busy }: DropzoneProps) {
  const [isOver, setIsOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const pdfs = Array.from(fileList).filter(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
      );
      if (pdfs.length > 0) onFiles(pdfs);
    },
    [onFiles],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <div
      className={`dropzone${isOver ? " dropzone--active" : ""}${busy ? " dropzone--busy" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={onDrop}
      onClick={() => !busy && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        hidden
        onChange={onInputChange}
      />
      <div className="dropzone__icon">📄</div>
      <p className="dropzone__title">
        {busy ? "Loading…" : "Drag your PDF files here"}
      </p>
      <p className="dropzone__hint">or click to browse your files</p>
    </div>
  );
}
