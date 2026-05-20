export const info = {
  attrs: {
    uid: { default: "" },
    astart: { default: 0 },
    aend: { default: 0 },
  },
  parseDOM: [
    {
      tag: "span[uid]",
      getAttrs(node) {
        return {
          uid: node.getAttribute("uid"),
          astart: Number(node.getAttribute("astart")),
          aend: Number(node.getAttribute("aend")),
        };
      },
    },
  ],
  toDOM(mark) {
    return [
      "span",
      {
        uid: mark.attrs.uid,
        astart: String(mark.attrs.astart),
        aend: String(mark.attrs.aend),
        class: "intranscript",
      },
    ];
  },
};
