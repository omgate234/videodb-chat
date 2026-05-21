import { Plugin } from "prosemirror-state";
import { makeSelection } from "../util.js";
import { copyNode } from "../importedFromProse/prosemirror-view/input.js";
/**
 * create the transaction copy and send when ctrl+c event happen
 */
export function handleCopy() {
  return new Plugin({
    props: {
      handleDOMEvents: {
        copy: function (view, event) {
          makeSelection(view.state, view.dispatch);
          copyNode(view, event);
          view.dispatch(
            view.state.tr.setMeta("copy", true), // we catch this in dispatchTransaction tr.getMeta()
          );
          return true;
        },
      },
    },
  });
}
