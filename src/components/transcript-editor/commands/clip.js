import { snapToWord, listInfoSpans } from "../util/wordSnap.js";

export const CLIP_META = "clipMeta";

function genClipId() {
  return `clip-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;
}

/**
 * Snap the current selection to enclosing word boundaries and create a clip:
 * a clipHighlight mark across the selected info-spans + a start/end pair of
 * clipPill atomic inline nodes flanking that mark.
 *
 * Returns the new clip object via the `tr.setMeta(CLIP_META, …)` payload,
 * which TranscriptEditor.vue forwards to the host.
 */
export function addClipFromSelection(state, dispatch) {
  const { selection, schema } = state;
  if (selection.empty) return false;

  const startSnap = snapToWord(state.doc, selection.from, "forward");
  const endSnap = snapToWord(state.doc, selection.to, "backward");
  if (!startSnap || !endSnap) return false;
  if (endSnap.to <= startSnap.from) return false;

  const id = genClipId();
  const fromPos = startSnap.from;
  const toPos = endSnap.to;
  const start = startSnap.astart;
  const end = endSnap.aend;
  if (!(end > start)) return false;

  if (dispatch) {
    const tr = state.tr;
    tr.addMark(fromPos, toPos, schema.marks.clipHighlight.create({ id }));

    const startPill = schema.nodes.clipPill.create({ kind: "start", id });
    const endPill = schema.nodes.clipPill.create({ kind: "end", id });
    tr.insert(fromPos, startPill);
    // After inserting the start pill at fromPos, every position >= fromPos
    // shifts by 1. The end of the highlighted range is now at toPos + 1.
    tr.insert(toPos + 1, endPill);

    tr.setMeta(CLIP_META, {
      kind: "added",
      clip: {
        id,
        start,
        end,
        location: { start: fromPos, end: toPos },
      },
    });
    tr.setMeta("addToHistory", false);
    dispatch(tr);
  }
  return true;
}

/**
 * Find pill positions and the highlight mark range for a given clip id, and
 * remove them in one transaction.
 */
export function removeClipById(id) {
  return (state, dispatch) => {
    const { schema } = state;
    let startPillPos = null;
    let endPillPos = null;
    let highlightFrom = null;
    let highlightTo = null;

    state.doc.descendants((node, pos) => {
      if (node.type === schema.nodes.clipPill && node.attrs.id === id) {
        if (node.attrs.kind === "start") startPillPos = pos;
        else if (node.attrs.kind === "end") endPillPos = pos;
      }
      if (node.isText) {
        const m = node.marks.find(
          (mk) => mk.type.name === "clipHighlight" && mk.attrs.id === id,
        );
        if (m) {
          if (highlightFrom == null) highlightFrom = pos;
          highlightTo = pos + node.nodeSize;
        }
      }
    });

    if (startPillPos == null && endPillPos == null && highlightFrom == null) {
      return false;
    }

    if (dispatch) {
      const tr = state.tr;
      if (highlightFrom != null && highlightTo != null) {
        tr.removeMark(
          highlightFrom,
          highlightTo,
          schema.marks.clipHighlight.create({ id }),
        );
      }
      // Delete pills back-to-front so positions stay valid.
      const positions = [startPillPos, endPillPos]
        .filter((p) => p != null)
        .sort((a, b) => b - a);
      for (const p of positions) {
        tr.delete(p, p + 1);
      }
      tr.setMeta(CLIP_META, { kind: "removed", id });
      tr.setMeta("addToHistory", false);
      dispatch(tr);
    }
    return true;
  };
}

/**
 * Resize a clip's start or end to a new doc position. The new position is
 * snapped to the nearest word boundary (in the appropriate direction) and
 * the clip's source-time start/end are recomputed from the info marks at
 * the new endpoints.
 *
 * Re-implementation of the clip in place: remove the old highlight + pills,
 * re-add at the snapped boundaries. Simpler than incremental diffing and
 * matches Spext's pattern of recomputing time from doc positions on edit.
 */
export function editClipPill(id, kind, newDocPos) {
  return (state, dispatch) => {
    const { schema } = state;
    let startPillPos = null;
    let endPillPos = null;
    let highlightFrom = null;
    let highlightTo = null;

    state.doc.descendants((node, pos) => {
      if (node.type === schema.nodes.clipPill && node.attrs.id === id) {
        if (node.attrs.kind === "start") startPillPos = pos;
        else if (node.attrs.kind === "end") endPillPos = pos;
      }
      if (node.isText) {
        const m = node.marks.find(
          (mk) => mk.type.name === "clipHighlight" && mk.attrs.id === id,
        );
        if (m) {
          if (highlightFrom == null) highlightFrom = pos;
          highlightTo = pos + node.nodeSize;
        }
      }
    });

    if (
      startPillPos == null ||
      endPillPos == null ||
      highlightFrom == null ||
      highlightTo == null
    ) {
      return false;
    }

    // Compute the inner highlight bounds excluding the pills themselves.
    const innerFrom = startPillPos + 1;
    const innerTo = endPillPos;

    let newStartInner = innerFrom;
    let newEndInner = innerTo;

    if (kind === "start") {
      const snap = snapToWord(state.doc, newDocPos, "forward");
      if (!snap) return false;
      newStartInner = Math.min(snap.from, innerTo - 1);
    } else if (kind === "end") {
      const snap = snapToWord(state.doc, newDocPos, "backward");
      if (!snap) return false;
      newEndInner = Math.max(snap.to, innerFrom + 1);
    } else {
      return false;
    }

    if (newEndInner <= newStartInner) return false;

    // Re-derive source times from the info marks at the new endpoints.
    const spans = listInfoSpans(state.doc);
    const startSpan = spans.find(
      (s) => s.from <= newStartInner && newStartInner <= s.to,
    );
    const endSpan = spans.find(
      (s) => s.from <= newEndInner - 1 && newEndInner - 1 <= s.to,
    );
    if (!startSpan || !endSpan) return false;

    if (dispatch) {
      const tr = state.tr;
      // Remove old highlight + pills (back to front).
      tr.removeMark(
        highlightFrom,
        highlightTo,
        schema.marks.clipHighlight.create({ id }),
      );
      const removePositions = [startPillPos, endPillPos].sort((a, b) => b - a);
      for (const p of removePositions) tr.delete(p, p + 1);

      // Map the new inner range through the deletions.
      const mappedStart = tr.mapping.map(newStartInner);
      const mappedEnd = tr.mapping.map(newEndInner);

      tr.addMark(
        mappedStart,
        mappedEnd,
        schema.marks.clipHighlight.create({ id }),
      );
      tr.insert(mappedStart, schema.nodes.clipPill.create({ kind: "start", id }));
      tr.insert(
        mappedEnd + 1,
        schema.nodes.clipPill.create({ kind: "end", id }),
      );

      tr.setMeta(CLIP_META, {
        kind: "edited",
        clip: {
          id,
          start: startSpan.astart,
          end: endSpan.aend,
          location: { start: mappedStart, end: mappedEnd },
        },
      });
      tr.setMeta("addToHistory", false);
      dispatch(tr);
    }
    return true;
  };
}

/**
 * Strip every clipPill node and clipHighlight mark from the doc.
 */
export function removeAllClipStuff(state, dispatch) {
  const { schema } = state;
  const pillPositions = [];
  let anyMark = false;

  state.doc.descendants((node, pos) => {
    if (node.type === schema.nodes.clipPill) {
      pillPositions.push(pos);
    }
    if (node.isText) {
      if (node.marks.some((m) => m.type.name === "clipHighlight")) {
        anyMark = true;
      }
    }
  });

  if (!pillPositions.length && !anyMark) return false;

  if (dispatch) {
    const tr = state.tr;
    if (anyMark) {
      tr.removeMark(0, state.doc.content.size, schema.marks.clipHighlight);
    }
    pillPositions.sort((a, b) => b - a);
    for (const p of pillPositions) tr.delete(p, p + 1);
    tr.setMeta(CLIP_META, { kind: "cleared" });
    tr.setMeta("addToHistory", false);
    dispatch(tr);
  }
  return true;
}

/**
 * Walk the doc, return the live list of clips reconstructed from
 * clipHighlight marks + pill nodes. Used by getClips() in the editor api.
 */
export function listClipsInDoc(doc, schema) {
  const pillStart = new Map();
  const pillEnd = new Map();
  const highlights = new Map();

  doc.descendants((node, pos) => {
    if (node.type === schema.nodes.clipPill) {
      const id = node.attrs.id;
      if (node.attrs.kind === "start") pillStart.set(id, pos);
      else if (node.attrs.kind === "end") pillEnd.set(id, pos);
    }
    if (node.isText) {
      for (const m of node.marks) {
        if (m.type.name !== "clipHighlight") continue;
        const id = m.attrs.id;
        const cur = highlights.get(id);
        if (!cur) highlights.set(id, { from: pos, to: pos + node.nodeSize });
        else cur.to = pos + node.nodeSize;
      }
    }
  });

  const spans = listInfoSpans(doc);
  const clips = [];
  for (const [id, h] of highlights.entries()) {
    const startSpan = spans.find((s) => s.from <= h.from && h.from <= s.to);
    const endSpan = spans.find((s) => s.from <= h.to - 1 && h.to - 1 <= s.to);
    if (!startSpan || !endSpan) continue;
    clips.push({
      id,
      start: startSpan.astart,
      end: endSpan.aend,
      location: {
        start: pillStart.has(id) ? pillStart.get(id) : h.from,
        end: pillEnd.has(id) ? pillEnd.get(id) : h.to,
      },
    });
  }
  clips.sort((a, b) => a.start - b.start);
  return clips;
}
