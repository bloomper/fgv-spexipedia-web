/**
 * Line differences between two texts, for comparing revisions and merging after a conflict: each line of either text
 * once, as kept, removed (only in the old) or added (only in the new). A longest common subsequence; texts are
 * articles, so a few thousand lines at most.
 */
export type DiffLine = { kind: "same" | "removed" | "added"; text: string };

export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const n = a.length;
  const m = b.length;
  const lengths: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lengths[i][j] = a[i] === b[j] ? lengths[i + 1][j + 1] + 1 : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({ kind: "same", text: a[i] });
      i++;
      j++;
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
      result.push({ kind: "removed", text: a[i++] });
    } else {
      result.push({ kind: "added", text: b[j++] });
    }
  }
  while (i < n) {
    result.push({ kind: "removed", text: a[i++] });
  }
  while (j < m) {
    result.push({ kind: "added", text: b[j++] });
  }
  return result;
}
