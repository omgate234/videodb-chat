/**
 * Walk the doc, return all info-marked (and not deleted) text spans as
 * { from, to, astart, aend, text }. Used by the clipper to snap a doc
 * position to a real word boundary and read the source-time bounds.
 *
 * Note: clipPill nodes inserted by the clipper are atomic and have no
 * info mark, so they are naturally skipped by this walk.
 */
export function listInfoSpans(doc) {
  const spans = [];
  doc.descendants((node, pos) => {
    if (!node.isText) return;
    let info = null;
    let isDeleted = false;
    for (const m of node.marks) {
      if (m.type.name === "info") info = m;
      else if (m.type.name === "deleted") isDeleted = true;
    }
    if (!info || isDeleted) return;
    spans.push({
      from: pos,
      to: pos + node.nodeSize,
      astart: info.attrs.astart,
      aend: info.attrs.aend,
      text: node.text,
    });
  });
  return spans;
}

/**
 * Return the info-span that covers `pos`, or — failing that — the nearest
 * span on the side specified by `prefer` ("forward" snaps to the next
 * word at/after pos; "backward" snaps to the previous word at/before pos).
 * Returns null if no info-marked text exists in the doc.
 */
export function snapToWord(doc, pos, prefer = "forward") {
  const spans = listInfoSpans(doc);
  if (!spans.length) return null;
  for (const s of spans) {
    if (s.from <= pos && pos <= s.to) return s;
  }
  if (prefer === "forward") {
    for (const s of spans) if (s.from >= pos) return s;
    return spans[spans.length - 1];
  }
  let last = null;
  for (const s of spans) {
    if (s.to <= pos) last = s;
    else break;
  }
  return last || spans[0];
}
