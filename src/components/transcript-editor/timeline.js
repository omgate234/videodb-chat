/**
 * Walk the doc to produce a list of source-time-aligned blocks, one per
 * non-deleted info-marked text node. Each entry has:
 *   { time, id, duration, location, astart, aend, index }
 * where `time` is the cumulative edit-time at the start of the block,
 * `astart`/`aend` are the source-time bounds, and `location` is the doc
 * position of the node.
 */
export function computeArrangement(doc) {
  const blockList = [];
  let editTimeCursor = 0;
  let paraStart = 0;

  doc.content.forEach((paraNode) => {
    paraNode.content.forEach((node, offset) => {
      const location = paraStart + 1 + offset;
      let isDeleted = false;
      let info = null;
      node.marks.forEach((mark) => {
        if (mark.type.name === "deleted") isDeleted = true;
        if (mark.type.name === "info") info = mark;
      });
      if (isDeleted || !info) return;
      const duration = info.attrs.aend - info.attrs.astart;
      blockList.push({
        time: editTimeCursor,
        id: info.attrs.uid,
        node,
        duration,
        astart: info.attrs.astart,
        aend: info.attrs.aend,
        location,
        index: blockList.length,
      });
      editTimeCursor += duration;
    });
    paraStart += paraNode.nodeSize;
  });
  return blockList;
}

/**
 * Look up the block whose edit-time window covers `editTime`. Returns the
 * last block whose start <= editTime. Returns null if blockList empty.
 */
export function getTextBlockAtTime(editTime, blockList) {
  if (!blockList.length) return null;
  let index = blockList.length - 1;
  for (let i = 0; i < blockList.length; i++) {
    if (blockList[i].time > editTime) {
      index = i - 1;
      break;
    }
  }
  if (index < 0) return blockList[0];
  return blockList[index];
}

/**
 * Look up the block whose source-time window covers `sourceTime`. Useful for
 * driving highlight when the player is on the original (un-edited) stream.
 * Returns null if no block contains the time.
 */
export function getTextBlockAtSourceTime(sourceTime, blockList) {
  if (!blockList.length) return null;
  for (let i = 0; i < blockList.length; i++) {
    const b = blockList[i];
    if (sourceTime >= b.astart && sourceTime < b.aend) return b;
  }
  return null;
}
