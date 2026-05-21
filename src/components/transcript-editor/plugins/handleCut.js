import { Plugin } from "prosemirror-state";
import { cut } from "../commands/cut.js";
/**
 * cut command
 */
export function handleCut() {
  return new Plugin({
    props: {
      handleDOMEvents: {
        cut: function (view, event) {
          cut(view, event);
        },
      },
    },
  });
}
