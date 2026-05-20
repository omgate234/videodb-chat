/**
 * Convert between source-time (timestamps in the original video) and
 * edit-time (timestamps in the regenerated stream that contains only
 * `keptRanges`).
 *
 * Identity when `keptRanges` is null/empty — caller should pass null when
 * the player is on the original stream.
 */
export function makeTimeMap(keptRanges) {
  if (!keptRanges || !keptRanges.length) {
    return {
      sourceTimeOf: (editT) => editT,
      editTimeOf: (sourceT) => sourceT,
      identity: true,
    };
  }

  const cumulative = [];
  let acc = 0;
  for (const [s, e] of keptRanges) {
    cumulative.push({ s, e, cumStart: acc });
    acc += e - s;
  }
  const totalEdit = acc;

  function sourceTimeOf(editT) {
    if (!Number.isFinite(editT)) return null;
    if (editT <= 0) return cumulative[0].s;
    if (editT >= totalEdit) return cumulative[cumulative.length - 1].e;
    for (const r of cumulative) {
      const localEnd = r.cumStart + (r.e - r.s);
      if (editT < localEnd) return r.s + (editT - r.cumStart);
    }
    return cumulative[cumulative.length - 1].e;
  }

  function editTimeOf(sourceT) {
    if (!Number.isFinite(sourceT)) return null;
    for (const r of cumulative) {
      if (sourceT < r.s) return null;
      if (sourceT < r.e) return r.cumStart + (sourceT - r.s);
    }
    return null;
  }

  return { sourceTimeOf, editTimeOf, identity: false, totalEdit };
}
