export const PILL_NODE_SIZE = 1;

export const clipPill = {
  inline: true,
  group: "inline",
  atom: true,
  selectable: false,
  draggable: true,
  attrs: {
    kind: { default: "start" },
    id: { default: "" },
  },
  parseDOM: [
    {
      tag: "span.clipPill",
      getAttrs(node) {
        return {
          kind: node.getAttribute("data-kind") || "start",
          id: node.getAttribute("data-clip-id") || "",
        };
      },
    },
  ],
  toDOM(node) {
    return [
      "span",
      {
        class: `clipPill clipPill--${node.attrs.kind}`,
        "data-kind": node.attrs.kind,
        "data-clip-id": node.attrs.id,
      },
    ];
  },
};
