export interface PdfFileEntry {
  id: string;
  file: File;
  name: string;
  pageCount: number;
}

export interface PageItem {
  id: string;
  fileId: string;
  fileName: string;
  pageIndex: number; // 0-based index within the source file
  pageNumber: number; // 1-based, for display
  thumbnail: string | null; // data URL
}
