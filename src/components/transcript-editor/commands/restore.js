import {
  makeSelection,
  removeMarkDeleted,
  moveCursorToBoundary,
} from "../util.js";

export function restore(state, dispatch, view) {
  makeSelection(view.state, view.dispatch);
  for (let i = 0; i < view.state.selection.ranges.length; i++) {
    const { $from, $to } = view.state.selection.ranges[i];
    removeMarkDeleted(view.state, view.dispatch, $from.pos, $to.pos);
  }
  moveCursorToBoundary(view);
  return true;
}
