/**
 * Smart-edit engine: filler-word and silence detection over an info-marked
 * ProseMirror doc. Ports the same shape as Spext's editorSearchUtility +
 * smartEditUtilities, narrowed to single-video, single-user scope.
 *
 * Detected items are mutated via the existing `deleted` mark — the same path
 * Backspace already uses — but we tag the mark with `type: 'filler' | 'silence'`
 * so we can bulk-restore by category without disturbing the user's manual
 * deletions (`type: 'user'`).
 */

const DEFAULT_FILLERS = [
  "um",
  "uh",
  "umm",
  "uhh",
  "ah",
  "er",
  "erm",
  "hmm",
  "mhm",
  "huh",
  "like",
  "literally",
  "basically",
  "actually",
  "honestly",
  "anyway",
  "anyways",
  "obviously",
];

const SILENCE_TEXT_RE = /^[\s\-–—_·.…]+$/;
const PUNCT_STRIP_RE = /^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu;

export function defaultFillerWords() {
  return DEFAULT_FILLERS.slice();
}

export function normalizeFillerList(list) {
  if (!list) return new Set();
  const arr = Array.isArray(list)
    ? list
    : String(list)
        .split(/[,\n]/)
        .map((s) => s.trim());
  const out = new Set();
  for (const w of arr) {
    if (!w) continue;
    out.add(w.toLowerCase().replace(PUNCT_STRIP_RE, ""));
  }
  out.delete("");
  return out;
}

function wordKey(text) {
  if (!text) return "";
  return text.toLowerCase().replace(PUNCT_STRIP_RE, "");
}

function isSilenceText(text) {
  if (!text) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  return SILENCE_TEXT_RE.test(trimmed);
}

function readMarks(node) {
  let info = null;
  let deleted = null;
  for (const m of node.marks) {
    if (m.type.name === "info") info = m;
    else if (m.type.name === "deleted") deleted = m;
  }
  return { info, deleted };
}

/**
 * Walk doc, return every info-marked text span with its current state.
 * Each entry: { from, to, astart, aend, text, isDeleted, deletedSource }
 */
export function listAllInfoSpans(doc) {
  const spans = [];
  doc.descendants((node, pos) => {
    if (!node.isText) return;
    const { info, deleted } = readMarks(node);
    if (!info) return;
    spans.push({
      from: pos,
      to: pos + node.nodeSize,
      astart: info.attrs.astart,
      aend: info.attrs.aend,
      text: node.text,
      isDeleted: !!deleted,
      deletedSource: deleted ? deleted.attrs.type || "user" : null,
    });
  });
  return spans;
}

/**
 * Detect filler-word matches. Returns one entry per info-span whose
 * normalized text is in `fillerSet`. Already-deleted spans (any source)
 * are still included with isDeleted=true so callers can render their
 * restore state — but bulkApplyFillers only adds new marks where missing.
 */
export function findFillerWords(doc, fillerSet) {
  if (!fillerSet || fillerSet.size === 0) return [];
  const out = [];
  for (const span of listAllInfoSpans(doc)) {
    if (isSilenceText(span.text)) continue;
    const k = wordKey(span.text);
    if (!k) continue;
    if (!fillerSet.has(k)) continue;
    out.push({ ...span, kind: "filler", matchedAs: k });
  }
  return out;
}

/**
 * Detect silence segments. Two sources:
 *
 *   1. Explicit silence info-spans whose text is dashes/dots only
 *      (videodb returns these as their own segments).
 *   2. Synthetic gaps between adjacent info-spans whose source-time
 *      separation is >= `minDuration` and is NOT already covered by
 *      an explicit silence span.
 *
 * Synthetic gaps have no doc range to mark — they are not actionable
 * via the deleted-mark mechanism (there's nothing to mark) and are
 * elided automatically by the kept-ranges algorithm. They are still
 * returned for UI surfacing.
 */
export function findSilences(doc, minDuration = 0.5) {
  const spans = listAllInfoSpans(doc);
  const out = [];
  let prev = null;

  for (const span of spans) {
    if (isSilenceText(span.text)) {
      const dur = Math.max(0, span.aend - span.astart);
      if (dur >= minDuration) {
        out.push({
          ...span,
          kind: "silence",
          source: "explicit",
          duration: dur,
        });
      }
    } else if (prev) {
      const gap = span.astart - prev.aend;
      if (gap >= minDuration) {
        out.push({
          from: null,
          to: null,
          astart: prev.aend,
          aend: span.astart,
          text: "",
          isDeleted: false,
          deletedSource: null,
          kind: "silence",
          source: "gap",
          duration: gap,
        });
      }
    }
    prev = span;
  }
  return out;
}

/**
 * Add a `deleted` mark with the given source over [from, to] in a single
 * transaction. Idempotent — re-applying does not double-mark.
 */
export function applyDeleted(state, dispatch, from, to, source = "user") {
  if (from == null || to == null || to <= from) return false;
  if (!dispatch) return true;
  const tr = state.tr.addMark(
    from,
    to,
    state.schema.marks.deleted.create({ type: source }),
  );
  tr.setMeta("addToHistory", true);
  dispatch(tr);
  return true;
}

/**
 * Remove every `deleted` mark over [from, to] regardless of source.
 */
export function restoreDeleted(state, dispatch, from, to) {
  if (from == null || to == null || to <= from) return false;
  if (!dispatch) return true;
  const tr = state.tr.removeMark(from, to, state.schema.marks.deleted);
  tr.setMeta("addToHistory", true);
  dispatch(tr);
  return true;
}

/**
 * Bulk-mark every match returned by findFillerWords as deleted with
 * `type: 'filler'`. Skips entries that already carry any deleted mark
 * so we don't stomp the user's manual deletions.
 *
 * Returns the count of new marks applied.
 */
export function bulkApplyFillers(state, dispatch, fillerSet) {
  const matches = findFillerWords(state.doc, fillerSet).filter(
    (m) => !m.isDeleted,
  );
  if (!matches.length) return 0;
  if (!dispatch) return matches.length;
  const tr = state.tr;
  for (const m of matches) {
    tr.addMark(
      m.from,
      m.to,
      state.schema.marks.deleted.create({ type: "filler" }),
    );
  }
  tr.setMeta("addToHistory", true);
  dispatch(tr);
  return matches.length;
}

/**
 * Bulk-mark every explicit silence span whose duration >= minDuration as
 * deleted with `type: 'silence'`. Synthetic gaps (no doc range) are
 * skipped — they're already not in the kept ranges by virtue of being
 * gaps. Skips already-deleted spans.
 */
export function bulkApplySilences(state, dispatch, minDuration = 0.5) {
  const matches = findSilences(state.doc, minDuration).filter(
    (m) => m.source === "explicit" && !m.isDeleted,
  );
  if (!matches.length) return 0;
  if (!dispatch) return matches.length;
  const tr = state.tr;
  for (const m of matches) {
    tr.addMark(
      m.from,
      m.to,
      state.schema.marks.deleted.create({ type: "silence" }),
    );
  }
  tr.setMeta("addToHistory", true);
  dispatch(tr);
  return matches.length;
}

/**
 * Walk the doc and remove every deleted mark whose `type` matches the
 * given source ('filler' | 'silence' | 'user'). Used by Restore-all.
 *
 * Returns the count of spans restored.
 */
export function bulkRestoreBySource(state, dispatch, source) {
  const ranges = [];
  state.doc.descendants((node, pos) => {
    if (!node.isText) return;
    for (const m of node.marks) {
      if (m.type.name === "deleted" && (m.attrs.type || "user") === source) {
        ranges.push({ from: pos, to: pos + node.nodeSize });
        break;
      }
    }
  });
  if (!ranges.length) return 0;
  if (!dispatch) return ranges.length;

  const tr = state.tr;
  for (const r of ranges) {
    tr.removeMark(r.from, r.to, state.schema.marks.deleted);
  }
  tr.setMeta("addToHistory", true);
  dispatch(tr);
  return ranges.length;
}

/**
 * Per-instance toggle: if the span is deleted, restore it; otherwise
 * mark it deleted with the given source.
 */
export function toggleInstance(state, dispatch, from, to, source) {
  if (from == null || to == null || to <= from) return false;
  let isDeleted = false;
  state.doc.nodesBetween(from, to, (node) => {
    if (!node.isText) return;
    if (node.marks.some((m) => m.type.name === "deleted")) {
      isDeleted = true;
    }
  });
  if (isDeleted) return restoreDeleted(state, dispatch, from, to);
  return applyDeleted(state, dispatch, from, to, source);
}

/**
 * Counts of filler / silence / user-deleted spans in the doc, plus totals
 * surfaced to the panel header.
 */
export function smartEditCounts(doc) {
  let fillerTotal = 0;
  let fillerDeleted = 0;
  let silenceTotal = 0;
  let silenceDeleted = 0;
  doc.descendants((node) => {
    if (!node.isText) return;
    const { info, deleted } = readMarks(node);
    if (!info) return;
    if (isSilenceText(node.text)) {
      silenceTotal += 1;
      if (deleted) silenceDeleted += 1;
    }
  });
  return { fillerTotal, fillerDeleted, silenceTotal, silenceDeleted };
}
