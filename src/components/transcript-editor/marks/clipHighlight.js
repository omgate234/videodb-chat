export const clipHighlight = {
  attrs: {
    id: { default: "" },
  },
  inclusive: false,
  parseDOM: [
    {
      tag: "span.clipHighlight",
      getAttrs(node) {
        return { id: node.getAttribute("data-clip-id") || "" };
      },
    },
  ],
  toDOM(mark) {
    return [
      "span",
      { class: "clipHighlight", "data-clip-id": mark.attrs.id },
      0,
    ];
  },
};
