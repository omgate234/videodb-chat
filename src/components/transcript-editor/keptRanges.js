/**
 * Walk a ProseMirror doc and produce the list of source-time ranges that
 * remain after applying `deleted` marks. Adjacent kept spans are merged
 * (gap < `joinThreshold`), and ranges shorter than `minDuration` are
 * filtered out.
 *
 * `joinThreshold` defaults to 0.5s — in-paragraph word boundaries usually
 * sit at 0.05–0.30s, so a 0.5s default coalesces all natural speech into
 * one range while pauses longer than half a second produce separate
 * ranges (which get auto-trimmed by the Timeline API on concat). This
 * keeps the timeline payload small and the output natural.
 *
 * Returns: number[][] — `[[s,e], ...]`, sorted, non-overlapping.
 */
export function computeKeptRanges(
  doc,
  { joinThreshold = 0.5, minDuration = 0.1, from = null, to = null } = {},
) {
  // Walk the doc producing kept-word entries plus explicit "break" markers
  // wherever a deleted word sits between two kept words. The break prevents
  // sanitizeTimeline from coalescing across a user-initiated deletion when
  // the source-time gap happens to fall under joinThreshold (e.g. cutting a
  // 0.5s word leaves a ~0.5s hole that would otherwise be re-joined and
  // masked).
  //
  // When `from`/`to` are supplied, the walk is restricted to text nodes that
  // intersect that doc-position range. Used by clip preview to derive the
  // kept ranges inside a clip's bookends — this skips deleted words inside
  // the clip and breaks across paragraph gaps wider than joinThreshold.
  const hasRange = from != null && to != null;
  const entries = [];
  let pendingBreak = false;
  doc.descendants((node, pos) => {
    if (!node.isText) return;
    if (hasRange) {
      const nodeEnd = pos + node.nodeSize;
      if (nodeEnd <= from || pos >= to) return;
    }
    let info = null;
    let isDeleted = false;
    for (const m of node.marks) {
      if (m.type.name === "info") info = m;
      else if (m.type.name === "deleted") isDeleted = true;
    }
    if (!info) return;
    if (isDeleted) {
      pendingBreak = true;
      return;
    }
    const { astart, aend } = info.attrs;
    if (!Number.isFinite(astart) || !Number.isFinite(aend) || aend <= astart) {
      return;
    }
    if (pendingBreak && entries.length) entries.push("break");
    pendingBreak = false;
    entries.push([astart, aend]);
  });

  return sanitizeTimeline(entries, { joinThreshold, minDuration });
}

/**
 * Validate and normalize a timeline of source-time ranges, **preserving
 * input order**. Drops invalid entries (NaN, non-finite, end <= start),
 * coalesces consecutive ranges only when they are continuous in source
 * time (cur.start >= last.end) AND within `joinThreshold`, filters out
 * anything shorter than `minDuration`. Optional `videoLength` clamps the
 * upper bound — the backend's Timeline API rejects ranges past the
 * video duration with an opaque error.
 *
 * Order preservation is load-bearing for paste/splice: copying source-
 * time 30–35 into a doc position between 10 and 11 produces ranges
 * [[0,10],[30,35],[11,...]]. Sorting would collapse this back to
 * [[0,10],[11,...],[30,35]] and lose the splice intent.
 */
export function sanitizeTimeline(
  ranges,
  { joinThreshold = 0.5, minDuration = 0.1, videoLength = null } = {},
) {
  if (!Array.isArray(ranges) || !ranges.length) return [];

  // Entries may be `[s,e]` ranges or the literal string `"break"` — a hard
  // boundary marker emitted by computeKeptRanges where a user-deletion sits
  // between two kept words. Breaks suppress join-across regardless of gap.
  const cleaned = [];
  for (const r of ranges) {
    if (r === "break") {
      cleaned.push("break");
      continue;
    }
    if (!Array.isArray(r) || r.length < 2) continue;
    let [s, e] = r;
    s = Number(s);
    e = Number(e);
    if (!Number.isFinite(s) || !Number.isFinite(e)) continue;
    if (s < 0) s = 0;
    if (videoLength != null && Number.isFinite(videoLength) && videoLength > 0) {
      // Clamp to floor(videoLength). The Timeline API rejects ranges that
      // run past the integer-second mark even when source `end` is e.g.
      // 280.003 — the backend treats fractional overshoots as out-of-bounds.
      const cap = Math.floor(videoLength);
      if (s >= cap) continue;
      if (e > cap) e = cap;
    }
    if (e <= s) continue;
    cleaned.push([s, e]);
  }

  // Drop any leading/trailing/duplicate breaks now that invalid ranges are gone
  const compact = [];
  for (const r of cleaned) {
    if (r === "break") {
      if (!compact.length || compact[compact.length - 1] === "break") continue;
      compact.push(r);
    } else {
      compact.push(r);
    }
  }
  while (compact.length && compact[compact.length - 1] === "break") compact.pop();

  if (!compact.length) return [];

  const merged = [];
  let blockBreak = false;
  for (const r of compact) {
    if (r === "break") {
      blockBreak = true;
      continue;
    }
    if (!merged.length) {
      merged.push(r.slice());
      continue;
    }
    const last = merged[merged.length - 1];
    const continuous =
      !blockBreak && r[0] >= last[1] && r[0] - last[1] <= joinThreshold;
    if (continuous) {
      last[1] = Math.max(last[1], r[1]);
    } else {
      merged.push(r.slice());
    }
    blockBreak = false;
  }

  return merged.filter(([s, e]) => e - s >= minDuration);
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
