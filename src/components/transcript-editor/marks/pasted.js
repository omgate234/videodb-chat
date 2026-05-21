// 1:1 with SpextApp Marks/pasted.js — parseDOM intentionally absent so that
// when a `pasted` span is copied and re-pasted, the inner `info` mark wins
// and the new content is treated as fresh transcript, not "still pasted".
export const pasted = {
  attrs: {
    class: { default: "pasted" },
  },
  toDOM(mark) {
    return ["span", mark.attrs];
  },
};
