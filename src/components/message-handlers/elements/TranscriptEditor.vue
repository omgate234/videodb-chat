<template>
  <div ref="hostRef" class="vdb-c-transcript-editor"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { history, undo, redo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";

import { schema } from "../../transcript-editor/schema.js";
import { buildDoc } from "../../transcript-editor/buildDoc.js";
import {
  remove,
  removeThisWord,
  removePrevWord,
} from "../../transcript-editor/commands/remove.js";
import { restore } from "../../transcript-editor/commands/restore.js";
import { splitBlockAfterWord } from "../../transcript-editor/commands/splitBlock.js";
import {
  playingHighlightPlugin,
  setPlayingHighlight,
  clearPlayingHighlight,
  hoverClipPlugin,
  setHoverClip,
  clearHoverClip,
} from "../../transcript-editor/decorations.js";
import {
  computeArrangement,
  getTextBlockAtTime,
  getTextBlockAtSourceTime,
} from "../../transcript-editor/timeline.js";
import {
  CLIP_META,
  addClipFromSelection,
  removeClipById,
  editClipPill,
  removeAllClipStuff,
  listClipsInDoc,
} from "../../transcript-editor/commands/clip.js";
import {
  findFillerWords,
  findSilences,
  bulkApplyFillers,
  bulkApplySilences,
  bulkRestoreBySource,
  toggleInstance,
  normalizeFillerList,
} from "../../transcript-editor/util/smartEdit.js";
import { handleCopy } from "../../transcript-editor/plugins/handleCopy.js";
import { handleCut } from "../../transcript-editor/plugins/handleCut.js";
import {
  handlePaste,
  transformPasted,
} from "../../transcript-editor/plugins/handlePaste.js";
import { TextSelection } from "prosemirror-state";

const props = defineProps({
  segments: { type: Array, required: true },
  editable: { type: Boolean, default: false },
});

const emit = defineEmits([
  "ready",
  "doc-change",
  "seek",
  "clip-add",
  "clip-remove",
  "clip-edit",
  "clip-cleared",
]);

const hostRef = ref(null);
let view = null;
let blockListCache = null;

const editKeymap = {
  Backspace: (state, dispatch, v) =>
    remove(state, dispatch, v) || removeThisWord(state, dispatch, v),
  Delete: (state, dispatch, v) =>
    remove(state, dispatch, v) || removeThisWord(state, dispatch, v),
  "Mod-Backspace": (state, dispatch, v) =>
    remove(state, dispatch, v) || removePrevWord(state, dispatch, v),
  Enter: splitBlockAfterWord,
  "Mod-z": undo,
  "Shift-Mod-z": redo,
  "Mod-y": redo,
  "Mod-Shift-r": (state, dispatch, v) => restore(state, dispatch, v),
  "Mod-k": (state, dispatch) => addClipFromSelection(state, dispatch),
};

function buildState(segments) {
  return EditorState.create({
    doc: buildDoc(schema, segments),
    plugins: [
      history(),
      keymap(editKeymap),
      keymap(baseKeymap),
      handleCopy(),
      handleCut(),
      handlePaste(),
      transformPasted(),
      playingHighlightPlugin,
      hoverClipPlugin,
    ],
  });
}

function invalidateBlockList() {
  blockListCache = null;
}

function blockList() {
  if (!view) return [];
  if (!blockListCache) blockListCache = computeArrangement(view.state.doc);
  return blockListCache;
}

function findBlockAtPos(pos) {
  const list = blockList();
  let exact = null;
  let nearest = null;
  for (const b of list) {
    if (b.location <= pos && pos <= b.location + b.node.nodeSize) {
      exact = b;
      break;
    }
    if (b.location <= pos) nearest = b;
  }
  return exact || nearest;
}

function handleClick(_view, pos) {
  const block = findBlockAtPos(pos);
  if (block) emit("seek", { sourceTime: block.astart, block });
  return false;
}

class ClipPillView {
  constructor(node, editorView, getPos) {
    this.node = node;
    this.editorView = editorView;
    this.getPos = getPos;
    this.dom = document.createElement("span");
    this.dom.className = `clipPill clipPill--${node.attrs.kind}`;
    this.dom.dataset.kind = node.attrs.kind;
    this.dom.dataset.clipId = node.attrs.id;
    this.dom.setAttribute("contenteditable", "false");
    this.dragging = false;
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.dom.addEventListener("mousedown", this.onMouseDown);
  }
  onMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dragging = true;
    this.dom.classList.add("clipPill--dragging");
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
  }
  onMouseMove(e) {
    if (!this.dragging) return;
    const coords = this.editorView.posAtCoords({
      left: e.clientX,
      top: e.clientY,
    });
    if (!coords) return;
    const { state, dispatch } = this.editorView;
    editClipPill(this.node.attrs.id, this.node.attrs.kind, coords.pos)(
      state,
      dispatch,
    );
  }
  onMouseUp() {
    this.dragging = false;
    this.dom.classList.remove("clipPill--dragging");
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
  }
  ignoreMutation() {
    return true;
  }
  stopEvent() {
    return true;
  }
  destroy() {
    this.dom.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
  }
}

function api() {
  return {
    get view() {
      return view;
    },
    get state() {
      return view ? view.state : null;
    },
    get blockList() {
      return blockList();
    },
    blockAtSourceTime(t) {
      return getTextBlockAtSourceTime(t, blockList());
    },
    blockAtEditTime(t) {
      return getTextBlockAtTime(t, blockList());
    },
    setHighlight(from, to) {
      if (view) setPlayingHighlight(view, from, to);
    },
    clearHighlight() {
      if (view) clearPlayingHighlight(view);
    },
    setEditable(yes) {
      if (view) view.setProps({ editable: () => !!yes });
    },
    addClipFromSelection() {
      if (!view) return false;
      return addClipFromSelection(view.state, view.dispatch.bind(view));
    },
    removeClip(id) {
      if (!view) return false;
      return removeClipById(id)(view.state, view.dispatch.bind(view));
    },
    editClipBoundary(id, kind, pos) {
      if (!view) return false;
      return editClipPill(id, kind, pos)(view.state, view.dispatch.bind(view));
    },
    getClips() {
      if (!view) return [];
      return listClipsInDoc(view.state.doc, schema);
    },
    clearAllClips() {
      if (!view) return false;
      return removeAllClipStuff(view.state, view.dispatch.bind(view));
    },
    scanFillers(fillerList) {
      if (!view) return [];
      return findFillerWords(view.state.doc, normalizeFillerList(fillerList));
    },
    scanSilences(minDuration) {
      if (!view) return [];
      return findSilences(view.state.doc, minDuration);
    },
    applyFillers(fillerList) {
      if (!view) return 0;
      return bulkApplyFillers(
        view.state,
        view.dispatch.bind(view),
        normalizeFillerList(fillerList),
      );
    },
    restoreFillers() {
      if (!view) return 0;
      return bulkRestoreBySource(
        view.state,
        view.dispatch.bind(view),
        "filler",
      );
    },
    applySilences(minDuration) {
      if (!view) return 0;
      return bulkApplySilences(
        view.state,
        view.dispatch.bind(view),
        minDuration,
      );
    },
    restoreSilences() {
      if (!view) return 0;
      return bulkRestoreBySource(
        view.state,
        view.dispatch.bind(view),
        "silence",
      );
    },
    toggleInstance(from, to, source) {
      if (!view) return false;
      return toggleInstance(
        view.state,
        view.dispatch.bind(view),
        from,
        to,
        source,
      );
    },
    gotoInstance(from, to) {
      if (!view) return;
      try {
        const doc = view.state.doc;
        const safeFrom = Math.max(0, Math.min(from, doc.content.size));
        const safeTo = Math.max(safeFrom, Math.min(to, doc.content.size));
        const $from = doc.resolve(safeFrom);
        const $to = doc.resolve(safeTo);
        const tr = view.state.tr
          .setSelection(new TextSelection($from, $to))
          .scrollIntoView();
        view.dispatch(tr);
        view.focus();
      } catch (_) {
        /* boundary errors are non-fatal */
      }
    },
    setHoverClip(id) {
      if (!view) return;
      const clips = listClipsInDoc(view.state.doc, schema);
      const c = clips.find((x) => x.id === id);
      if (!c) return;
      setHoverClip(view, c.location.start, c.location.end + 1);
    },
    clearHoverClip() {
      if (view) clearHoverClip(view);
    },
    resetDoc(segments) {
      if (!view) return;
      const next = buildState(segments);
      view.updateState(next);
      invalidateBlockList();
    },
    replaceDocFromJSON(json) {
      if (!view) return;
      const newDoc = schema.nodeFromJSON(json);
      const tr = view.state.tr.replaceWith(
        0,
        view.state.doc.content.size,
        newDoc.content,
      );
      view.dispatch(tr);
      invalidateBlockList();
    },
    docToJSON() {
      return view ? view.state.doc.toJSON() : null;
    },
  };
}

defineExpose({ api });

onMounted(() => {
  if (!hostRef.value) return;
  const state = buildState(props.segments);
  view = new EditorView(hostRef.value, {
    state,
    editable: () => !!props.editable,
    handleClickOn: handleClick,
    handleTextInput: () => true,
    nodeViews: {
      clipPill: (node, editorView, getPos) =>
        new ClipPillView(node, editorView, getPos),
    },
    dispatchTransaction(tr) {
      const nextState = view.state.apply(tr);
      view.updateState(nextState);
      const clipMeta = tr.getMeta(CLIP_META);
      if (clipMeta) {
        if (clipMeta.kind === "added") emit("clip-add", clipMeta.clip);
        else if (clipMeta.kind === "removed") emit("clip-remove", clipMeta.id);
        else if (clipMeta.kind === "edited") emit("clip-edit", clipMeta.clip);
        else if (clipMeta.kind === "cleared") emit("clip-cleared");
      }
      if (tr.docChanged) {
        invalidateBlockList();
        emit("doc-change", { state: nextState });
      }
    },
  });
  emit("ready", api());
});

watch(
  () => props.segments,
  (next) => {
    if (!view) return;
    view.updateState(buildState(next));
    invalidateBlockList();
    emit("doc-change", { state: view.state, reseed: true });
  },
);

watch(
  () => props.editable,
  (yes) => {
    if (view) view.setProps({ editable: () => !!yes });
  },
);

onBeforeUnmount(() => {
  if (view) {
    view.destroy();
    view = null;
  }
});
</script>

<style>
.vdb-c-transcript-editor .ProseMirror {
  outline: none;
  font-size: 13px;
  line-height: 1.7;
  color: rgb(33, 33, 33);
  max-height: 360px;
  overflow-y: auto;
  padding-right: 4px;
}
.vdb-c-transcript-editor .ProseMirror p {
  margin: 0 0 10px 0;
}
.vdb-c-transcript-editor .ProseMirror p:last-child {
  margin-bottom: 0;
}
.vdb-c-transcript-editor span.intranscript {
  cursor: pointer;
  border-radius: 2px;
  transition: background-color 0.12s ease;
}
.vdb-c-transcript-editor span.intranscript:hover {
  background-color: rgba(0, 0, 0, 0.06);
}
.vdb-c-transcript-editor span.deleted {
  text-decoration: line-through;
  color: rgba(0, 0, 0, 0.4);
}
.vdb-c-transcript-editor span.is-playing,
.vdb-c-transcript-editor .is-playing {
  background-color: rgba(255, 213, 79, 0.55);
}
.vdb-c-transcript-editor span.clipHighlight {
  background-color: rgba(40, 130, 240, 0.18);
  border-radius: 2px;
}
.vdb-c-transcript-editor span.clipHover {
  background-color: rgba(40, 130, 240, 0.32);
  border-radius: 2px;
}
.vdb-c-transcript-editor span.clipPill {
  display: inline-block;
  width: 4px;
  height: 1.05em;
  vertical-align: -2px;
  margin: 0 1px;
  border-radius: 2px;
  background: rgba(40, 130, 240, 0.9);
  cursor: ew-resize;
  user-select: none;
}
.vdb-c-transcript-editor span.clipPill--dragging {
  background: rgba(40, 130, 240, 1);
  box-shadow: 0 0 0 2px rgba(40, 130, 240, 0.25);
}
.vdb-c-transcript-editor span.pasted {
  background-color: rgba(40, 130, 240, 0.25);
  border-radius: 2px;
  animation: vdbPastedFade 800ms ease-out forwards;
}
@keyframes vdbPastedFade {
  from {
    background-color: rgba(40, 130, 240, 0.25);
  }
  to {
    background-color: rgba(40, 130, 240, 0);
  }
}
</style>
