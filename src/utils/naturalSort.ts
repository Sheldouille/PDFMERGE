/**
 * Natural / numeric-aware comparator for filenames, so "page2.pdf" sorts
 * before "page10.pdf" instead of after (plain alphabetical would reverse them).
 */
export function naturalCompare(a: string, b: string): number {
  const chunk = (s: string) => s.match(/(\d+|\D+)/g) ?? [];
  const chunksA = chunk(a);
  const chunksB = chunk(b);
  const len = Math.max(chunksA.length, chunksB.length);

  for (let i = 0; i < len; i++) {
    const partA = chunksA[i] ?? "";
    const partB = chunksB[i] ?? "";
    if (partA === partB) continue;

    const numA = /^\d+$/.test(partA) ? Number(partA) : NaN;
    const numB = /^\d+$/.test(partB) ? Number(partB) : NaN;

    if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
      if (numA !== numB) return numA - numB;
      continue;
    }
    return partA.localeCompare(partB, undefined, { sensitivity: "base" });
  }
  return 0;
}
