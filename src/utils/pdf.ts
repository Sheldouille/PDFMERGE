import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
import type { PageItem, PdfFileEntry } from "../types";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

let uid = 0;
export function nextId(prefix: string): string {
  uid += 1;
  return `${prefix}-${Date.now()}-${uid}`;
}

const THUMB_MAX_DIM = 220;

export async function loadPdfEntry(file: File): Promise<{
  entry: PdfFileEntry;
  pages: PageItem[];
}> {
  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
  const pageCount = doc.numPages;
  const fileId = nextId("file");

  const pages: PageItem[] = [];
  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const scale = THUMB_MAX_DIM / Math.max(viewport.width, viewport.height);
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(scaledViewport.width);
    canvas.height = Math.ceil(scaledViewport.height);
    const context = canvas.getContext("2d");
    let thumbnail: string | null = null;
    if (context) {
      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
      }).promise;
      thumbnail = canvas.toDataURL("image/png");
    }

    pages.push({
      id: nextId("page"),
      fileId,
      fileName: file.name,
      pageIndex: i - 1,
      pageNumber: i,
      thumbnail,
    });
    page.cleanup();
  }

  await doc.destroy();

  return {
    entry: { id: fileId, file, name: file.name, pageCount },
    pages,
  };
}

export async function mergePdfs(
  files: PdfFileEntry[],
  order: PageItem[],
): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  const sourceDocs = new Map<string, PDFDocument>();

  for (const entry of files) {
    const bytes = await entry.file.arrayBuffer();
    const src = await PDFDocument.load(bytes);
    sourceDocs.set(entry.id, src);
  }

  for (const item of order) {
    const src = sourceDocs.get(item.fileId);
    if (!src) continue;
    const [copiedPage] = await merged.copyPages(src, [item.pageIndex]);
    merged.addPage(copiedPage);
  }

  return merged.save();
}
