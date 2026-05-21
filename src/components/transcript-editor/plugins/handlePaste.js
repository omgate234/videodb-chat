import { Plugin } from "prosemirror-state";
import { Slice, Fragment } from "prosemirror-model";
import { moveCursorToBoundary, calculateTime } from "../util.js";

/**
 * 1:1 with SpextApp plugins/handlePaste.js — minus the music-note / blockmode
 * / store branches that don't exist in videodb-chat.
 *
 * If user has copied something from outside the doc, don't allow them to paste.
 * If user has copied from doc only then first update cursor position & then paste.
 */
export function handlePaste() {
  return new Plugin({
    props: {
      handlePaste: function (view, event, slice) {
        if (slice.content.content[0].isText) {
          // * outsideText
          return true;
        }
        // * move cursor to boundary (place where text needs to be placed)
        // * then paste text
        moveCursorToBoundary(view);
        let time = calculateTime(slice, 1);
        slice.content.forEach(function (node, offset, index) {
          node.forEach(function (subNode, offset, index) {
            subNode.marks.splice(0, 0, view.state.schema.mark("pasted")); // apply mark
          });
        });
        view.dispatch(view.state.tr.setMeta("pastedTime", time)); // update time on the screen
        if (time > 0) {
          return false;
        } else {
          return true;
        }
      },
      // The below function disallows any plain text pasting
      transformPastedText() {
        return "";
      },
    },
  });
}

/**
 * Strip content we don't want to carry across paste:
 *   - `deleted` (soft-deletes shouldn't follow the user)
 *   - `clipHighlight` (clip selection visual)
 *   - `clipPill` nodes (clip-boundary widgets)
 *   - filler-word artifacts ('uh ', 'um ')
 *
 * KEEP `info` marks (timing data) — without them paste contributes 0s and
 * the timeline API splice falls apart. This is the necessary divergence
 * from SpextApp's transformPasted, which targets `transcript`-mode docs.
 */
const dontPaste = ["deleted", "clipHighlight"];
const fillerWords = ["uh ", "um "];

function cleanFragment(fragment) {
  const out = [];
  fragment.forEach((node) => {
    if (node.type.name === "clipPill") return; // drop clip pill nodes entirely
    if (node.isText) {
      // drop text carrying a `deleted` mark (soft-deletes shouldn't follow)
      const hasDeleted = node.marks.some((m) => m.type.name === "deleted");
      if (hasDeleted) return;
      // drop standalone filler-word text nodes
      if (fillerWords.indexOf(node.text) >= 0) return;
      // strip clipHighlight (and any other dontPaste) marks but keep text + info
      const cleanMarks = node.marks.filter(
        (m) => dontPaste.indexOf(m.type.name) < 0,
      );
      out.push(node.mark(cleanMarks));
      return;
    }
    // block / inline parent: recurse and rebuild via node.copy so paragraph
    // wrappers are preserved — without this, slice.content.content[0] becomes
    // a text node and handlePaste's isText guard rejects the paste.
    const cleaned = cleanFragment(node.content);
    out.push(node.copy(cleaned));
  });
  return Fragment.from(out);
}

export function transformPasted() {
  return new Plugin({
    props: {
      transformPasted: function (slice) {
        const cleaned = cleanFragment(slice.content);
        return new Slice(cleaned, slice.openStart, slice.openEnd);
      },
    },
  });
}
