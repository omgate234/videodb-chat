import {
  makeSelection,
  addMarkDeleted,
  moveCursorToBoundary,
} from "../util.js";
import { copyNode } from "../importedFromProse/prosemirror-view/input.js";

/**
 * when user clicks CMD+X — 1:1 with SpextApp commands/cut.js (sans the
 * editTranscript / isUsedInProject branches, which don't apply here).
 *
 * @param {*} view  prosemirror EditorView
 * @param {*} event html clipboard event — used by copyNode
 */
export function cut(view, event) {
  let state = view.state;
  let dispatch = view.dispatch;

  makeSelection(state, dispatch); // select the whole word
  copyNode(view, event); // copy selection

  // uses view (not state) so the makeSelection effect is observed
  // eslint-disable-next-line no-console
  console.log(
    "[cut] selection",
    view.state.selection.from,
    view.state.selection.to,
    "ranges",
    view.state.selection.ranges.length,
  );
  for (let i = 0; i < view.state.selection.ranges.length; i++) {
    let { $from, $to } = view.state.selection.ranges[i];
    // eslint-disable-next-line no-console
    console.log("[cut] addMarkDeleted", $from.pos, $to.pos);
    addMarkDeleted(
      { key: "cut", value: true },
      view.state,
      view.dispatch,
      $from.pos,
      $to.pos,
    );
  }
  moveCursorToBoundary(view);
  return true;
}
