import { TextSelection } from "prosemirror-state";

export function moveCursorToBoundary(view) {
  const doc = view.state.doc;
  const anchorPos = view.state.selection.anchor;
  const headPos = view.state.selection.head;
  let newPosition = null;
  let temp = null;
  if (anchorPos - headPos === 0) {
    temp = doc.resolve(anchorPos);
    if (temp.textOffset === 0) return;
    newPosition = doc.resolve(temp.pos + temp.nodeAfter.nodeSize);
  } else {
    newPosition = doc.resolve(anchorPos < headPos ? headPos : anchorPos);
  }
  view.dispatch(
    view.state.tr.setSelection(new TextSelection(newPosition, newPosition)),
  );
}

export function moveCursorToLeftBoundary(view) {
  const doc = view.state.doc;
  const anchorPos = view.state.selection.anchor;
  const headPos = view.state.selection.head;
  let temp = null;
  let newPosition = null;
  if (anchorPos - headPos === 0) {
    temp = doc.resolve(anchorPos);
    if (temp.textOffset === 0) {
      if (!temp.nodeBefore) return;
      newPosition = doc.resolve(temp.pos - temp.nodeBefore.nodeSize);
    } else {
      newPosition = doc.resolve(temp.pos - temp.textOffset - 2);
    }
  } else {
    newPosition = doc.resolve(anchorPos < headPos ? anchorPos : headPos);
  }
  if (!newPosition) return;
  view.dispatch(
    view.state.tr.setSelection(new TextSelection(newPosition, newPosition)),
  );
}

export function makeSelection(state, dispatch) {
  const doc = state.doc;
  const anchor = doc.resolve(state.selection.anchor);
  const head = doc.resolve(state.selection.head);
  if (anchor.pos !== head.pos) return;
  const start = doc.resolve(anchor.pos - anchor.textOffset);
  const end =
    head.nodeAfter == null
      ? doc.resolve(head.pos)
      : doc.resolve(head.pos + head.nodeAfter.nodeSize);
  dispatch(state.tr.setSelection(new TextSelection(start, end)));
}

export function makeSelectionPrevWord(state, dispatch) {
  const doc = state.doc;
  const anchor = state.selection.$anchor;
  if (!anchor.nodeBefore) return;
  const end = doc.resolve(anchor.pos - anchor.nodeBefore.nodeSize);
  dispatch(state.tr.setSelection(new TextSelection(end, anchor)));
}

/**
 * 1:1 with SpextApp util/utility.js: signature is
 *   addMarkDeleted(transactionMeta, state, dispatch, startPos, endPos)
 * where transactionMeta is { key, value } merged into the same transaction
 * (so consumers can react to e.g. {key:'cut', value:true}).
 *
 * Existing callers in videodb-chat use the shorter
 *   addMarkDeleted(state, dispatch, startPos, endPos)
 * form — we detect which signature was used by sniffing the first arg.
 */
export function addMarkDeleted(arg0, arg1, arg2, arg3, arg4) {
  let transactionMeta = null;
  let state, dispatch, startPos, endPos;
  if (
    arg0 &&
    typeof arg0 === "object" &&
    Object.prototype.hasOwnProperty.call(arg0, "key")
  ) {
    transactionMeta = arg0;
    state = arg1;
    dispatch = arg2;
    startPos = arg3;
    endPos = arg4;
  } else {
    state = arg0;
    dispatch = arg1;
    startPos = arg2;
    endPos = arg3;
  }
  if (!dispatch) return;
  let tr = state.tr;
  if (transactionMeta) tr = tr.setMeta(transactionMeta.key, transactionMeta.value);
  tr = tr.addMark(startPos, endPos, state.schema.marks.deleted.create());
  dispatch(tr);
}

export function removeMarkDeleted(state, dispatch, startPos, endPos) {
  if (!dispatch) return;
  dispatch(state.tr.removeMark(startPos, endPos, state.schema.marks.deleted));
}

export function calculateTimeFromTextNode(textNode) {
  let time = 0;
  textNode.marks.forEach((mark) => {
    if (mark.type.name === "info") {
      time += (Number(mark.attrs.aend) || 0) - (Number(mark.attrs.astart) || 0);
    }
  });
  return time;
}

/**
 * 1:1 with SpextApp util/utility.js#calculateTime — signed seconds for the
 * audio in a slice. `sign` is +1 for paste (adding time) or -1 for delete.
 */
export function calculateTime(slice, sign) {
  let time = 0;
  slice.content.content.forEach((paraNode) => {
    if (paraNode.type.name === "text") {
      time += calculateTimeFromTextNode(paraNode);
    } else {
      paraNode.content.content.forEach((textNode) => {
        time += calculateTimeFromTextNode(textNode);
      });
    }
  });
  return time * sign;
}

