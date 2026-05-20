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

export function addMarkDeleted(state, dispatch, startPos, endPos) {
  if (!dispatch) return;
  dispatch(
    state.tr.addMark(startPos, endPos, state.schema.marks.deleted.create()),
  );
}

export function removeMarkDeleted(state, dispatch, startPos, endPos) {
  if (!dispatch) return;
  dispatch(state.tr.removeMark(startPos, endPos, state.schema.marks.deleted));
}
