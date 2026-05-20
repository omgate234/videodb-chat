/**
 * Walk a ProseMirror doc and produce the list of source-time ranges that
 * remain after applying `deleted` marks. Adjacent kept spans are merged
 * (gap < `joinThreshold`), and ranges shorter than `minDuration` are
 * filtered out.
 *
 * Returns: number[][] — `[[s,e], ...]`
 */
export function computeKeptRanges(
  doc,
  { joinThreshold = 0.05, minDuration = 0.1 } = {},
) {
  const ranges = [];
  doc.descendants((node) => {
    if (!node.isText) return;
    let info = null;
    let isDeleted = false;
    for (const m of node.marks) {
      if (m.type.name === "info") info = m;
      else if (m.type.name === "deleted") isDeleted = true;
    }
    if (!info || isDeleted) return;
    const { astart, aend } = info.attrs;
    if (!Number.isFinite(astart) || !Number.isFinite(aend) || aend <= astart) {
      return;
    }
    const last = ranges[ranges.length - 1];
    if (last && Math.abs(astart - last[1]) <= joinThreshold) {
      last[1] = Math.max(last[1], aend);
    } else {
      ranges.push([astart, aend]);
    }
  });
  return ranges.filter(([s, e]) => e - s >= minDuration);
}

export function totalKeptDuration(ranges) {
  return ranges.reduce((acc, [s, e]) => acc + (e - s), 0);
}

export function keptSegmentCount(doc) {
  let kept = 0;
  let total = 0;
  doc.descendants((node) => {
    if (!node.isText) return;
    let info = null;
    let isDeleted = false;
    for (const m of node.marks) {
      if (m.type.name === "info") info = m;
      else if (m.type.name === "deleted") isDeleted = true;
    }
    if (!info) return;
    total += 1;
    if (!isDeleted) kept += 1;
  });
  return { kept, total };
}

export function rangesEqual(a, b, eps = 0.01) {
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i][0] - b[i][0]) > eps) return false;
    if (Math.abs(a[i][1] - b[i][1]) > eps) return false;
  }
  return true;
}

export function isFullVideo(ranges, videoLength, slack = 0.25) {
  if (!ranges.length) return false;
  if (!Number.isFinite(videoLength) || videoLength <= 0) return false;
  const total = totalKeptDuration(ranges);
  return Math.abs(total - videoLength) <= slack;
}
