import { Schema } from "prosemirror-model";
import { info } from "./marks/info.js";
import { deleted } from "./marks/deleted.js";
import { clipHighlight } from "./marks/clipHighlight.js";
import { clipPill } from "./nodes/clipPill.js";

const doc = { content: "block+" };

const paragraph = {
  content: "inline*",
  group: "block",
  parseDOM: [{ tag: "p" }],
  toDOM() {
    return ["p", 0];
  },
};

const text = { group: "inline" };

export const schema = new Schema({
  nodes: { doc, paragraph, text, clipPill },
  marks: { info, deleted, clipHighlight },
});
