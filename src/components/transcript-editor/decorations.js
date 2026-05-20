import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const playingHighlightKey = new PluginKey("playingHighlight");
export const hoverClipKey = new PluginKey("hoverClip");

/**
 * Plugin that paints a `is-playing` class on the text node whose doc position
 * range matches the meta payload `{ from, to }`. Set `null` to clear.
 */
export const playingHighlightPlugin = new Plugin({
  key: playingHighlightKey,
  state: {
    init: () => DecorationSet.empty,
    apply(tr, old) {
      const meta = tr.getMeta(playingHighlightKey);
      if (meta === undefined) return old.map(tr.mapping, tr.doc);
      if (meta === null) return DecorationSet.empty;
      const { from, to } = meta;
      if (from == null || to == null || from === to) return DecorationSet.empty;
      return DecorationSet.create(tr.doc, [
        Decoration.inline(from, to, { class: "is-playing" }),
      ]);
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});

export function setPlayingHighlight(view, from, to) {
  view.dispatch(view.state.tr.setMeta(playingHighlightKey, { from, to }));
}

export function clearPlayingHighlight(view) {
  view.dispatch(view.state.tr.setMeta(playingHighlightKey, null));
}

/**
 * Plugin that paints a `clipHover` class over the inline range supplied via
 * meta payload `{ from, to }`. Used to give the user a visual preview when
 * they hover a row in the side clip list. Set `null` to clear.
 */
export const hoverClipPlugin = new Plugin({
  key: hoverClipKey,
  state: {
    init: () => DecorationSet.empty,
    apply(tr, old) {
      const meta = tr.getMeta(hoverClipKey);
      if (meta === undefined) return old.map(tr.mapping, tr.doc);
      if (meta === null) return DecorationSet.empty;
      const { from, to } = meta;
      if (from == null || to == null || from >= to) return DecorationSet.empty;
      return DecorationSet.create(tr.doc, [
        Decoration.inline(from, to, { class: "clipHover" }),
      ]);
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});

export function setHoverClip(view, from, to) {
  view.dispatch(view.state.tr.setMeta(hoverClipKey, { from, to }));
}

export function clearHoverClip(view) {
  view.dispatch(view.state.tr.setMeta(hoverClipKey, null));
}

export function focusCursorOnLocation(view, location) {
  const doc = view.state.doc;
  view.focus();
  try {
    const start = doc.resolve(location);
    view.dispatch(
      view.state.tr
        .scrollIntoView()
        .setSelection(new TextSelection(start, start)),
    );
  } catch (e) {
    /* boundary errors are non-fatal */
  }
}
