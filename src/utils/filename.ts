/**
 * Suggests an output file name from a set of input file names by finding
 * what they have in common and dropping the part that varies between them
 * (typically a page/sheet index), e.g.:
 *   SG878666_Sheet7DML_I00.pdf, SG878666_Sheet10DML_I00.pdf, ...
 *   -> "SG878666DML_I00"
 */

const stripExtension = (name: string) => name.replace(/\.pdf$/i, "");

const chunk = (s: string): string[] => s.match(/(\d+|\D+)/g) ?? [s];

const trimSeparators = (s: string) => s.replace(/^[_\-. ]+|[_\-. ]+$/g, "");

export function sanitizeFileName(name: string): string {
  const cleaned = name
    .replace(/[\\/:*?"<>|]/g, "")
    .trim()
    .slice(0, 150);
  return cleaned || "merged";
}

export function detectCommonBaseName(fileNames: string[]): string {
  const names = fileNames.map(stripExtension).filter(Boolean);
  if (names.length === 0) return "merged";
  if (names.length === 1) return sanitizeFileName(names[0]);

  const chunkLists = names.map(chunk);
  const chunkCount = chunkLists[0].length;
  const sameStructure = chunkLists.every((c) => c.length === chunkCount);

  if (sameStructure) {
    const varying = Array.from({ length: chunkCount }, (_, i) =>
      !chunkLists.every((c) => c[i] === chunkLists[0][i]),
    );

    let prefixLen = 0;
    while (prefixLen < chunkCount && !varying[prefixLen]) prefixLen++;

    let suffixLen = 0;
    while (
      suffixLen < chunkCount - prefixLen &&
      !varying[chunkCount - 1 - suffixLen]
    ) {
      suffixLen++;
    }

    if (prefixLen + suffixLen < chunkCount) {
      const base = chunkLists[0];
      let prefixChunks = base.slice(0, prefixLen);
      const suffixChunks = base.slice(chunkCount - suffixLen);

      // Drop a trailing label chunk (letters only, no digits) that sits
      // right before the varying part, e.g. "_Sheet" before a page number,
      // as long as there's still something left to identify the file by.
      const lastPrefix = prefixChunks[prefixChunks.length - 1];
      if (
        lastPrefix &&
        /^\D+$/.test(lastPrefix) &&
        (prefixChunks.length > 1 || suffixChunks.length > 0)
      ) {
        prefixChunks = prefixChunks.slice(0, -1);
      }

      const candidate = trimSeparators(
        prefixChunks.join("") + suffixChunks.join(""),
      );
      if (candidate.length >= 2) return sanitizeFileName(candidate);
    }
  }

  return "merged";
}
