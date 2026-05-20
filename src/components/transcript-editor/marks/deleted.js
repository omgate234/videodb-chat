export const deleted = {
  attrs: {
    type: { default: "user" },
  },
  parseDOM: [{ tag: "span.deleted" }],
  toDOM(mark) {
    return ["span", { class: "deleted", "data-type": mark.attrs.type }];
  },
};
