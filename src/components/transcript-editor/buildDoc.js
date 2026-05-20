/**
 * Group word-level segments into paragraphs and seed a ProseMirror doc.
 *
 * Each paragraph is broken on a pause longer than `paragraphPauseThreshold`
 * (default 2.0s). Within a paragraph, each segment becomes a text node
 * carrying an `info` mark with `uid`/`astart`/`aend`. Adjacent words inside
 * a paragraph are joined by a single space text node. The space is
 * intentionally NOT marked — only marked spans contribute to kept-ranges.
 */
const PARA_PAUSE = 2.0;

function sortAndDedupe(segments) {
  return [...segments]
    .filter((s) => s && Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start)
    .sort((a, b) => a.start - b.start || a.end - b.end);
}

export function groupParagraphs(segments, threshold = PARA_PAUSE) {
  const out = [];
  let current = [];
  let prevEnd = null;
  for (const seg of segments) {
    if (prevEnd != null && seg.start - prevEnd > threshold) {
      if (current.length) out.push(current);
      current = [];
    }
    current.push(seg);
    prevEnd = seg.end;
  }
  if (current.length) out.push(current);
  return out;
}

export function buildDoc(schema, rawSegments) {
  const segments = sortAndDedupe(rawSegments || []);
  const paragraphs = groupParagraphs(segments);

  if (!paragraphs.length) {
    return schema.nodes.doc.create(null, [schema.nodes.paragraph.create()]);
  }

  const pNodes = paragraphs.map((words) => {
    const children = [];
    words.forEach((seg, i) => {
      if (i > 0) children.push(schema.text(" "));
      const text = (seg.text ?? "").trim();
      if (!text) return;
      children.push(
        schema.text(text, [
          schema.marks.info.create({
            uid: `${seg.start.toFixed(3)}-${seg.end.toFixed(3)}`,
            astart: seg.start,
            aend: seg.end,
          }),
        ]),
      );
    });
    return schema.nodes.paragraph.create(null, children);
  });

  return schema.nodes.doc.create(null, pNodes);
}
