/* eslint-disable */

import { Slice, Fragment, DOMParser, DOMSerializer } from "prosemirror-model";

export function serializeForClipboard(view, slice) {
  let context = [],
    { content, openStart, openEnd } = slice;
  while (
    openStart > 1 &&
    openEnd > 1 &&
    content.childCount == 1 &&
    content.firstChild.childCount == 1
  ) {
    openStart--;
    openEnd--;
    let node = content.firstChild;
    context.push(
      node.type.name,
      node.type.hasRequiredAttrs() ? node.attrs : null
    );
    content = node.content;
  }

  let serializer =
    view.someProp("clipboardSerializer") ||
    DOMSerializer.fromSchema(view.state.schema);
  let wrap = document.createElement("div");
  wrap.appendChild(serializer.serializeFragment(content));

  let firstChild = wrap.firstChild,
    needsWrap;
  while (
    firstChild &&
    firstChild.nodeType == 1 &&
    (needsWrap = wrapMap[firstChild.nodeName.toLowerCase()])
  ) {
    for (let i = needsWrap.length - 1; i >= 0; i--) {
      let wrapper = document.createElement(needsWrap[i]);
      while (wrap.firstChild) wrapper.appendChild(wrap.firstChild);
      wrap.appendChild(wrapper);
    }
    firstChild = wrap.firstChild;
  }

  if (firstChild && firstChild.nodeType == 1)
    firstChild.setAttribute(
      "data-pm-slice",
      `${openStart} ${openEnd} ${JSON.stringify(context)}`
    );

  let text =
    view.someProp("clipboardTextSerializer", (f) => f(slice)) ||
    slice.content.textBetween(0, slice.content.size, "\n\n");

  return { dom: wrap, text };
}

const wrapMap = {
  thead: ["table"],
  colgroup: ["table"],
  col: ["table", "colgroup"],
  tr: ["table", "tbody"],
  td: ["table", "tbody", "tr"],
  th: ["table", "tbody", "tr"],
};
