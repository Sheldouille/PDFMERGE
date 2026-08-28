import { useMemo, useState } from "react";
import "./App.css";
import { Dropzone } from "./components/Dropzone";
import { PageGrid } from "./components/PageGrid";
import { detectCommonBaseName, sanitizeFileName } from "./utils/filename";
import { naturalCompare } from "./utils/naturalSort";
import { loadPdfEntry, mergePdfs } from "./utils/pdf";
import type { PageItem, PdfFileEntry } from "./types";

export default function App() {
  const [files, setFiles] = useState<PdfFileEntry[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [customName, setCustomName] = useState<string | null>(null);

  const fileCount = files.length;
  const pageCount = pages.length;

  const suggestedName = useMemo(
    () => (fileCount > 0 ? detectCommonBaseName(files.map((f) => f.name)) : ""),
    [files, fileCount],
  );
  const outputName = fileCount > 0 ? (customName ?? suggestedName) : "";

  const handleFiles = async (newFiles: File[]) => {
    setError(null);
    setResultUrl(null);
    setLoading(true);
    try {
      for (const file of newFiles) {
        const { entry, pages: newPages } = await loadPdfEntry(file);
        setFiles((prev) => [...prev, entry]);
        setPages((prev) => [...prev, ...newPages]);
      }
    } catch (err) {
      console.error(err);
      setError("Couldn't read one of the files. Make sure it's a valid PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSort = () => {
    const orderedFileIds = files
      .slice()
      .sort((a, b) => naturalCompare(a.name, b.name))
      .map((f) => f.id);

    const pagesByFile = new Map<string, PageItem[]>();
    for (const page of pages) {
      const bucket = pagesByFile.get(page.fileId) ?? [];
      bucket.push(page);
      pagesByFile.set(page.fileId, bucket);
    }

    const reordered = orderedFileIds.flatMap(
      (fileId) => pagesByFile.get(fileId) ?? [],
    );
    setPages(reordered);
    setResultUrl(null);
  };

  const handleRemovePage = (pageId: string) => {
    setPages((prev) => prev.filter((p) => p.id !== pageId));
    setResultUrl(null);
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setPages((prev) => prev.filter((p) => p.fileId !== fileId));
    setResultUrl(null);
  };

  const handleReset = () => {
    setFiles([]);
    setPages([]);
    setError(null);
    setResultUrl(null);
    setCustomName(null);
  };

  const handleMerge = async () => {
    if (pages.length === 0) return;
    setMerging(true);
    setError(null);
    try {
      const bytes = await mergePdfs(files, pages);
      const blob = new Blob([bytes.slice().buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      setError("Merge failed. Please try again or check your files.");
    } finally {
      setMerging(false);
    }
  };

  const uniqueFileNames = useMemo(
    () => Array.from(new Set(files.map((f) => f.name))),
    [files],
  );

  const downloadName = `${sanitizeFileName(outputName || "merged")}.pdf`;

  return (
    <div className="app">
      <header className="app__header">
        <h1>Merge PDF</h1>
        <p className="app__subtitle">
          Merge, reorder and sort your PDFs — 100% in your browser, no file
          is ever sent to a server.
        </p>
      </header>

      <main className="app__main">
        <Dropzone onFiles={handleFiles} busy={loading} />

        {error && <div className="alert alert--error">{error}</div>}

        {fileCount > 0 && (
          <section className="toolbar">
            <div className="toolbar__info">
              <strong>{fileCount}</strong> file{fileCount > 1 ? "s" : ""} ·{" "}
              <strong>{pageCount}</strong> page{pageCount > 1 ? "s" : ""}
            </div>
            <div className="toolbar__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleAutoSort}
                disabled={fileCount < 2}
                title="Sort files automatically based on numbers or patterns detected in their name"
              >
                🔍 Sort by filename
              </button>
              <button type="button" className="btn btn--ghost" onClick={handleReset}>
                Clear all
              </button>
            </div>
          </section>
        )}

        {uniqueFileNames.length > 0 && (
          <section className="filelist">
            {files.map((f) => (
              <span key={f.id} className="filelist__chip">
                {f.name}
                <span className="filelist__pages">({f.pageCount}p)</span>
                <button
                  type="button"
                  className="filelist__remove"
                  title="Remove this file"
                  onClick={() => handleRemoveFile(f.id)}
                >
                  ×
                </button>
              </span>
            ))}
          </section>
        )}

        {pages.length > 0 && (
          <>
            <p className="hint">
              Drag and drop the pages below to change their order in the
              final document.
            </p>
            <PageGrid
              pages={pages}
              onReorder={setPages}
              onRemove={handleRemovePage}
            />
          </>
        )}

        {pages.length > 0 && (
          <section className="mergebar">
            <label className="outputname">
              <span className="outputname__label">Output file name</span>
              <span className="outputname__field">
                <input
                  type="text"
                  className="outputname__input"
                  value={outputName}
                  placeholder="merged"
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <span className="outputname__ext">.pdf</span>
              </span>
            </label>
            <div className="mergebar__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleMerge}
                disabled={merging}
              >
                {merging ? "Merging…" : "Merge PDFs"}
              </button>
              {resultUrl && (
                <a
                  className="btn btn--success"
                  href={resultUrl}
                  download={downloadName}
                >
                  ⬇ Download {downloadName}
                </a>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="app__footer">
        <span>Standalone app — works offline, no data is ever transmitted.</span>
      </footer>
    </div>
  );
}
