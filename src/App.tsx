import { useMemo, useState } from "react";
import "./App.css";
import { Dropzone } from "./components/Dropzone";
import { PageGrid } from "./components/PageGrid";
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

  const fileCount = files.length;
  const pageCount = pages.length;

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
      setError(
        "Impossible de lire un des fichiers. Vérifiez qu'il s'agit bien d'un PDF valide.",
      );
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
      setError("La fusion a échoué. Réessayez ou vérifiez vos fichiers.");
    } finally {
      setMerging(false);
    }
  };

  const uniqueFileNames = useMemo(
    () => Array.from(new Set(files.map((f) => f.name))),
    [files],
  );

  return (
    <div className="app">
      <header className="app__header">
        <h1>Fusion PDF</h1>
        <p className="app__subtitle">
          Fusionnez, réorganisez et triez vos PDF — 100&nbsp;% dans votre
          navigateur, aucun fichier n'est envoyé sur un serveur.
        </p>
      </header>

      <main className="app__main">
        <Dropzone onFiles={handleFiles} busy={loading} />

        {error && <div className="alert alert--error">{error}</div>}

        {fileCount > 0 && (
          <section className="toolbar">
            <div className="toolbar__info">
              <strong>{fileCount}</strong> fichier{fileCount > 1 ? "s" : ""} ·{" "}
              <strong>{pageCount}</strong> page{pageCount > 1 ? "s" : ""}
            </div>
            <div className="toolbar__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleAutoSort}
                disabled={fileCount < 2}
                title="Trie les fichiers automatiquement selon les numéros ou motifs détectés dans leur nom"
              >
                🔍 Trier par nom de fichier
              </button>
              <button type="button" className="btn btn--ghost" onClick={handleReset}>
                Tout effacer
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
                  title="Retirer ce fichier"
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
              Glissez-déposez les pages ci-dessous pour changer leur ordre
              dans le document final.
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
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleMerge}
              disabled={merging}
            >
              {merging ? "Fusion en cours…" : "Fusionner les PDF"}
            </button>
            {resultUrl && (
              <a
                className="btn btn--success"
                href={resultUrl}
                download="fusion.pdf"
              >
                ⬇ Télécharger fusion.pdf
              </a>
            )}
          </section>
        )}
      </main>

      <footer className="app__footer">
        <span>Application autonome — fonctionne hors-ligne, aucune donnée transmise.</span>
      </footer>
    </div>
  );
}
