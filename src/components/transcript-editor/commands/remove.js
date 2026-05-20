import { TextSelection, AllSelection } from "prosemirror-state";
import {
  makeSelection,
  makeSelectionPrevWord,
  addMarkDeleted,
  moveCursorToLeftBoundary,
} from "../util.js";

export function remove(state, dispatch, view) {
  const doc = view.state.doc;
  const anchor = doc.resolve(view.state.selection.anchor);
  const head = doc.resolve(view.state.selection.head);
  if (anchor.pos === head.pos) return false;
  const sel = view.state.selection;
  if (sel instanceof TextSelection || sel instanceof AllSelection) {
    for (let i = 0; i < sel.ranges.length; i++) {
      const { $from, $to } = sel.ranges[i];
      addMarkDeleted(view.state, view.dispatch, $from.pos, $to.pos);
    }
  }
  moveCursorToLeftBoundary(view);
  return true;
}

export function removeThisWord(state, dispatch, view) {
  const doc = view.state.doc;
  const anchor = doc.resolve(view.state.selection.anchor);
  const head = doc.resolve(view.state.selection.head);
  if (
    anchor.nodeBefore === null ||
    (anchor.textOffset === 0 && head.textOffset === 0)
  ) {
    return false;
  }
  if (anchor.pos === head.pos) {
    makeSelection(view.state, view.dispatch);
  }
  const sel = view.state.selection;
  if (sel instanceof TextSelection) {
    for (let i = 0; i < sel.ranges.length; i++) {
      const { $from, $to } = sel.ranges[i];
      addMarkDeleted(view.state, view.dispatch, $from.pos, $to.pos);
    }
  }
  moveCursorToLeftBoundary(view);
  return true;
}

export function removePrevWord(state, dispatch, view) {
  const doc = view.state.doc;
  const anchor = doc.resolve(view.state.selection.anchor);
  const head = doc.resolve(view.state.selection.head);
  if (anchor.nodeBefore === null) return false;
  if (anchor.pos === head.pos) {
    makeSelectionPrevWord(view.state, view.dispatch);
  }
  const sel = view.state.selection;
  if (sel instanceof TextSelection) {
    for (let i = 0; i < sel.ranges.length; i++) {
      const { $from, $to } = sel.ranges[i];
      addMarkDeleted(view.state, view.dispatch, $from.pos, $to.pos);
    }
  }
  moveCursorToLeftBoundary(view);
  return true;
}
