/* eslint-disable */

import browser from "./browser";
import { serializeForClipboard } from "./clipboard";
/**
 * taken from prosemirror-view and exported
 */
const brokenClipboardAPI =
  (browser.ie && browser.ie_version < 15) ||
  (browser.ios && browser.webkit_version < 604);

/**
 * #imported from prosemirror-view/input.js handlers.copy=
 * use prosemirror inbuilt functionality for cut/copy
 */
export function copyNode(view, e) {
  let sel = view.state.selection;

  if (sel.empty) return;

  // IE and Edge's clipboard interface is completely broken
  let data = brokenClipboardAPI ? null : e.clipboardData;
  let slice = sel.content();
  let { dom, text } = serializeForClipboard(view, slice);
  if (data) {
    e.preventDefault();
    data.clearData();
    data.setData("text/html", dom.innerHTML);
    data.setData("text/plain", text);
  } else {
    captureCopy(view, dom);
  }
  return slice;
  // * removed this line to make cut work as intented in Spext Editor
  // if (cut) view.dispatch(view.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut"))
}
/**
 * taken from prosemirror-view and exported
 */
function captureCopy(view, dom) {
  // The extra wrapper is somehow necessary on IE/Edge to prevent the
  // content from being mangled when it is put onto the clipboard
  let doc = dom.ownerDocument;
  let wrap = doc.body.appendChild(doc.createElement("div"));
  wrap.appendChild(dom);
  wrap.style.cssText = "position: fixed; left: -10000px; top: 10px";
  let sel = getSelection();
  let range = doc.createRange();
  range.selectNodeContents(dom);
  // Done because IE will fire a selectionchange moving the selection
  // to its start when removeAllRanges is called and the editor still
  // has focus (which will mess up the editor's selection state).
  view.dom.blur();
  sel.removeAllRanges();
  sel.addRange(range);
  setTimeout(() => {
    doc.body.removeChild(wrap);
    view.focus();
  }, 50);
}
