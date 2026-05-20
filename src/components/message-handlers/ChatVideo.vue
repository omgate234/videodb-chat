<template>
  <div
    class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-8 vdb-c-py-14 vdb-c-text-left"
  >
    <LoadingMessage
      :status="content.status"
      :message="content.status_message"
      :is-last-conv="isLastConv"
    />
    <transition name="fade" mode="out-in">
      <div
        v-if="content.status === 'success' && content.video.stream_url"
        class="vdb-c-w-full vdb-c-py-6"
      >
        <div
          :class="
            isFullScreen
              ? 'vdb-c-fixed vdb-c-inset-0 vdb-c-z-50 vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-overflow-y-hidden vdb-c-bg-black-64'
              : 'vdb-c-full xl:vdb-c-1/2 vdb-c-overflow-hidden vdb-c-rounded-20 sm:vdb-c-w-3/4 lg:vdb-c-w-3/5 xl:vdb-c-w-1/2'
          "
        >
          <VideoDBPlayer
            :key="currentStreamUrl"
            :class="isFullScreen ? 'vdb-c-h-screen vdb-c-w-screen' : ''"
            :stream-url="currentStreamUrl"
            :default-controls="false"
            :default-overlay="false"
            @fullScreenChange="handleFullScreenChange"
          >
            <template #overlay>
              <PlayerSyncBridge
                ref="bridgeRef"
                @time-update="onTimeUpdate"
                @duration="onDuration"
                @playing="onPlaying"
              />
              <BigCenterButton
                class="vdb-c-absolute vdb-c-left-1/2 vdb-c-top-1/2 vdb-c-h-32 vdb-c-w-32 md:vdb-c-h-48 md:vdb-c-w-48"
              />
              <button
                class="vdb-c-absolute vdb-c-right-12 vdb-c-top-12 vdb-c-flex vdb-c-h-32 vdb-c-w-32 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-black/60 vdb-c-text-white hover:vdb-c-bg-black/80 disabled:vdb-c-opacity-60"
                :title="content.video.id ? 'Edit' : 'Add to Collection'"
                :disabled="uploading"
                @click.stop="onOverlayActionClick"
              >
                <span class="material-symbols-outlined" style="font-size: 20px;">
                  {{ content.video.id ? "edit" : "cloud_upload" }}
                </span>
              </button>
            </template>
            <template #controls>
              <div class="vdb-p-pt-0 vdb-c-p-20">
                <div class="sm:vdb-p-mx-8 vdb-c-mb-8 md:vdb-c-mb-12">
                  <ProgressBar :stream-url="currentStreamUrl" />
                </div>
                <div class="vdb-c-flex vdb-c-w-full vdb-c-justify-between">
                  <div
                    class="vdb-c-z-10 vdb-c-ml-0 vdb-c-flex vdb-c-items-center"
                  >
                    <PlayPauseButton />
                    <VolumeControlButton />
                    <TimeCode />
                  </div>

                  <FullScreenButton class="" />
                </div>
              </div>
            </template>
          </VideoDBPlayer>
        </div>

        <div
          v-if="content.video.id"
          class="vdb-c-w-full sm:vdb-c-w-3/4 lg:vdb-c-w-3/5 xl:vdb-c-w-1/2"
        >
          <TranscriptPanel
            ref="panelRef"
            :show="showTranscript"
            :loading="transcriptLoading"
            :loading-message="transcriptLoadingMessage"
            :error="transcriptError"
            :text="transcriptText"
            :segments="transcriptSegments"
            :editable="true"
            :apply-status="applyStatus"
            :apply-status-message="applyStatusMessage"
            :kept-duration="keptDuration"
            :total-duration="totalDuration"
            :kept-count="keptCount"
            :total-count="totalCount"
            :can-revert="canRevert"
            :clips="clips"
            :active-clip-id="activeClipId"
            :can-add-clip="canAddClip"
            @close="onCloseTranscript"
            @revert="onRevert"
            @retry="onRetry"
            @editor-ready="onEditorReady"
            @doc-change="onDocChange"
            @seek="onEditorSeek"
            @clip-add="onClipAdd"
            @clip-remove="onClipRemoveRequest"
            @clip-edit="onClipEdit"
            @clip-cleared="onClipsCleared"
            @clip-add-from-selection="onClipAddFromSelection"
            @clip-preview="onClipPreview"
            @clip-play-all="onClipPlayAll"
            @clip-exit-preview="onClipExitPreview"
            @clip-hover="onClipHover"
            @clip-hover-end="onClipHoverEnd"
          />
        </div>
      </div>
      <div v-else-if="content.status === 'progress'">
        <div
          class="vdb-c-full xl:vdb-c-1/2 vdb-c-animate-pulse vdb-c-overflow-hidden vdb-c-rounded-20 sm:vdb-c-w-3/4 lg:vdb-c-w-3/5 xl:vdb-c-w-1/2"
        >
          <div class="vdb-c-relative vdb-c-w-full" style="padding-top: 56.25%">
            <div
              class="vdb-c-absolute vdb-c-inset-0 vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-bg-gray-200"
            ></div>
          </div>
        </div>
      </div>
      <div
        v-else-if="content.status === 'not_generated'"
        class="vdb-c-flex vdb-c-flex-col"
      ></div>
    </transition>

    <UploadChatVideoModal
      :show="showUploadModal"
      :default-name="content.video?.name || ''"
      :stream-url="content.video?.stream_url || ''"
      :uploading="uploading"
      :error="uploadError"
      @cancel="showUploadModal = false"
      @submit="onUploadSubmit"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  VideoDBPlayer,
  TimeCode,
  BigCenterButton,
  VolumeControlButton,
  PlayPauseButton,
  FullScreenButton,
  ProgressBar,
} from "@videodb/player-vue";
import "@videodb/player-vue/dist/style.css";
import LoadingMessage from "./elements/LoadingMessage.vue";
import UploadChatVideoModal from "../modals/UploadChatVideoModal.vue";
import TranscriptPanel from "./elements/TranscriptPanel.vue";
import PlayerSyncBridge from "./elements/PlayerSyncBridge.vue";
import { useVideoDBChat } from "../../context.js";
import {
  computeKeptRanges,
  totalKeptDuration,
  keptSegmentCount,
  rangesEqual,
  isFullVideo,
} from "../transcript-editor/keptRanges.js";
import { makeTimeMap } from "../transcript-editor/timeMap.js";

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  contentIndex: {
    type: Number,
    required: true,
  },
  convId: {
    type: [String, Number],
    required: true,
  },
  msgId: {
    type: [String, Number],
    required: true,
  },
  isLastConv: {
    type: Boolean,
    default: false,
  },
});

const {
  uploadChatVideo,
  fetchVideoTranscript,
  applyTimelineEdit,
  sessionId,
  collectionId,
} = useVideoDBChat();

const isFullScreen = ref(false);
const showUploadModal = ref(false);
const uploading = ref(false);
const uploadError = ref("");

const showTranscript = ref(false);
const transcriptFetched = ref(false);
const transcriptLoading = ref(false);
const transcriptLoadingMessage = ref("Loading transcript…");
const transcriptError = ref("");
const transcriptText = ref("");
const transcriptSegments = ref([]);

const originalStreamUrl = ref(props.content.video?.stream_url || "");
const currentStreamUrl = ref(props.content.video?.stream_url || "");
watch(
  () => props.content.video?.stream_url,
  (next) => {
    if (!next) return;
    if (!originalStreamUrl.value) originalStreamUrl.value = next;
    if (!currentStreamUrl.value || currentStreamUrl.value === originalStreamUrl.value) {
      currentStreamUrl.value = next;
      if (!originalStreamUrl.value) originalStreamUrl.value = next;
    }
  },
);

const editorApi = ref(null);
const bridgeRef = ref(null);
const panelRef = ref(null);

const pristineDocJSON = ref(null);
const currentRanges = ref([]);
const lastAppliedRanges = ref([]);
const videoLength = computed(() => Number(props.content.video?.length) || 0);
const playerDuration = ref(0);

const applyStatus = ref("idle_original");
const applyStatusMessage = ref("");

const keptDuration = computed(() => totalKeptDuration(currentRanges.value));
const totalDuration = computed(() => {
  if (videoLength.value > 0) return videoLength.value;
  if (playerDuration.value > 0) return playerDuration.value;
  return 0;
});
const counts = ref({ kept: 0, total: 0 });
const keptCount = computed(() => counts.value.kept);
const totalCount = computed(() => counts.value.total);
const canRevert = computed(
  () =>
    currentStreamUrl.value !== originalStreamUrl.value ||
    counts.value.kept !== counts.value.total ||
    clips.value.length > 0,
);

const ALL_CLIPS_ID = "__all_clips__";
const clips = ref([]);
const activeClipId = ref(null);
const activePreviewTimeline = ref(null);
const canAddClip = ref(false);
let clipAbortController = null;
let latestClipRequestId = 0;

let abortController = null;
let latestRequestId = 0;
let debounceTimer = null;
const DEBOUNCE_MS = 600;

const timeMap = computed(() => makeTimeMap(currentRanges.value));
const appliedTimeMap = computed(() => makeTimeMap(lastAppliedRanges.value));
const previewTimeMap = computed(() =>
  activePreviewTimeline.value ? makeTimeMap(activePreviewTimeline.value) : null,
);
const effectiveTimeMap = computed(
  () => previewTimeMap.value || effectiveTimeMap.value,
);

function onEditorReady(api) {
  editorApi.value = api;
  if (!pristineDocJSON.value && api?.docToJSON) {
    pristineDocJSON.value = api.docToJSON();
  }
  recomputeFromDoc(api?.state?.doc);
  refreshClipsFromEditor();
  document.addEventListener("selectionchange", onSelectionChange);
}

function onSelectionChange() {
  const state = editorApi.value?.state;
  if (!state) {
    canAddClip.value = false;
    return;
  }
  canAddClip.value = !state.selection.empty;
}

function refreshClipsFromEditor() {
  if (!editorApi.value?.getClips) {
    clips.value = [];
    return;
  }
  clips.value = editorApi.value.getClips();
}

function recomputeFromDoc(doc) {
  if (!doc) return;
  currentRanges.value = computeKeptRanges(doc);
  counts.value = keptSegmentCount(doc);
}

function onDocChange(payload) {
  const state = payload?.state;
  if (!state) return;
  if (payload.reseed) {
    if (editorApi.value?.docToJSON) {
      pristineDocJSON.value = editorApi.value.docToJSON();
    }
    recomputeFromDoc(state.doc);
    return;
  }
  recomputeFromDoc(state.doc);
  scheduleApply();
}

function scheduleApply() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runApply, DEBOUNCE_MS);
}

async function runApply() {
  debounceTimer = null;
  if (activeClipId.value) return;
  const ranges = currentRanges.value;

  if (!ranges.length) {
    cancelInFlight();
    applyStatus.value = "empty";
    applyStatusMessage.value = "";
    if (currentStreamUrl.value !== originalStreamUrl.value) {
      currentStreamUrl.value = originalStreamUrl.value;
    }
    lastAppliedRanges.value = [];
    return;
  }

  if (isFullVideo(ranges, totalDuration.value)) {
    cancelInFlight();
    applyStatus.value = "idle_original";
    applyStatusMessage.value = "";
    if (currentStreamUrl.value !== originalStreamUrl.value) {
      currentStreamUrl.value = originalStreamUrl.value;
    }
    lastAppliedRanges.value = ranges.slice();
    return;
  }

  if (rangesEqual(ranges, lastAppliedRanges.value)) {
    return;
  }

  const video = props.content.video;
  if (!video?.id) return;

  cancelInFlight();
  abortController = new AbortController();
  const requestId = ++latestRequestId;
  applyStatus.value = "regenerating";
  applyStatusMessage.value = "";

  try {
    const data = await applyTimelineEdit({
      collectionId: video.collection_id || collectionId.value,
      videoId: video.id,
      timeline: ranges,
      signal: abortController.signal,
    });
    if (requestId !== latestRequestId) return;
    const url = data?.stream_url;
    if (!url) throw new Error("No stream URL in response");
    currentStreamUrl.value = url;
    lastAppliedRanges.value = ranges.slice();
    applyStatus.value = "idle_edited";
    applyStatusMessage.value = "";
  } catch (e) {
    if (e?.name === "AbortError") return;
    if (requestId !== latestRequestId) return;
    applyStatus.value = "error";
    applyStatusMessage.value = e?.message || "Failed to update preview";
  } finally {
    if (requestId === latestRequestId) abortController = null;
  }
}

// Reset the player to t=0 and clear the transcript highlight. Robust to the
// :key-driven remount (bridgeRef may be momentarily null while videojs sets up
// a fresh instance) — we wait a few ticks for the bridge to come back.
async function resetPlayback({ paused = true } = {}) {
  if (editorApi.value?.clearHighlight) editorApi.value.clearHighlight();
  for (let i = 0; i < 10 && !bridgeRef.value; i++) await nextTick();
  if (!bridgeRef.value) return;
  bridgeRef.value.seekTo(0);
  if (paused) bridgeRef.value.pause();
}

function cancelInFlight() {
  if (abortController) {
    try {
      abortController.abort();
    } catch (_) {
      /* noop */
    }
    abortController = null;
  }
  latestRequestId++;
}

function onRevert() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  cancelInFlight();
  cancelClipInFlight();
  if (editorApi.value?.clearAllClips) editorApi.value.clearAllClips();
  if (editorApi.value && pristineDocJSON.value) {
    editorApi.value.replaceDocFromJSON(pristineDocJSON.value);
  }
  clips.value = [];
  activeClipId.value = null;
  activePreviewTimeline.value = null;
  currentStreamUrl.value = originalStreamUrl.value;
  applyStatus.value = "idle_original";
  applyStatusMessage.value = "";
  lastAppliedRanges.value = [];
  if (editorApi.value?.state?.doc) recomputeFromDoc(editorApi.value.state.doc);
  // Force the player back to the start. If currentStreamUrl actually changed
  // here, the :key remount also lands at 0 — this call is the safety net for
  // the no-URL-change path (e.g. revert after only adding clips, no edits).
  resetPlayback({ paused: true });
}

function onRetry() {
  if (transcriptError.value) {
    loadTranscript();
    return;
  }
  scheduleApply();
}

function onEditorSeek({ sourceTime }) {
  if (!Number.isFinite(sourceTime)) return;
  const editT = effectiveTimeMap.value.editTimeOf(sourceTime);
  if (editT == null || !Number.isFinite(editT)) return;
  if (bridgeRef.value?.seekTo) bridgeRef.value.seekTo(editT);
}

function onTimeUpdate(t) {
  if (!Number.isFinite(t)) return;
  if (!editorApi.value) return;
  const sourceT = effectiveTimeMap.value.sourceTimeOf(t);
  if (sourceT == null) {
    if (editorApi.value.clearHighlight) editorApi.value.clearHighlight();
    return;
  }
  const block = editorApi.value.blockAtSourceTime(sourceT);
  if (!block) {
    if (editorApi.value.clearHighlight) editorApi.value.clearHighlight();
    return;
  }
  const from = block.location;
  const to = block.location + block.node.nodeSize;
  if (editorApi.value.setHighlight) editorApi.value.setHighlight(from, to);
}

function onDuration(d) {
  if (Number.isFinite(d) && d > 0) playerDuration.value = d;
}

function onPlaying(_p) {
  /* reserved for future use */
}

function onCloseTranscript() {
  showTranscript.value = false;
  if (editorApi.value?.clearHighlight) editorApi.value.clearHighlight();
  if (editorApi.value?.clearHoverClip) editorApi.value.clearHoverClip();
  if (activeClipId.value) clearActiveClip();
}

function onClipAddFromSelection() {
  editorApi.value?.addClipFromSelection?.();
}

function onClipAdd(_clip) {
  refreshClipsFromEditor();
}

function onClipEdit(edited) {
  refreshClipsFromEditor();
  if (activeClipId.value === edited.id) previewClip(edited);
}

function onClipRemoveRequest(id) {
  if (activeClipId.value === id) clearActiveClip();
  editorApi.value?.removeClip?.(id);
}

function onClipsCleared() {
  clips.value = [];
  if (activeClipId.value) clearActiveClip();
}

function onClipHover(id) {
  editorApi.value?.setHoverClip?.(id);
}

function onClipHoverEnd(_id) {
  editorApi.value?.clearHoverClip?.();
}

function cancelClipInFlight() {
  if (clipAbortController) {
    try {
      clipAbortController.abort();
    } catch (_) {
      /* noop */
    }
    clipAbortController = null;
  }
  latestClipRequestId++;
}

async function runPreview(timeline, activeId, errorLabel) {
  const video = props.content.video;
  if (!video?.id) return;
  if (!timeline.length) return;
  for (const [s, e] of timeline) {
    if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return;
  }

  cancelInFlight();
  cancelClipInFlight();
  clipAbortController = new AbortController();
  const requestId = ++latestClipRequestId;
  activeClipId.value = activeId;
  applyStatus.value = "regenerating";
  applyStatusMessage.value = "";

  try {
    const data = await applyTimelineEdit({
      collectionId: video.collection_id || collectionId.value,
      videoId: video.id,
      timeline,
      signal: clipAbortController.signal,
    });
    if (requestId !== latestClipRequestId) return;
    const url = data?.stream_url;
    if (!url) throw new Error("No stream URL in response");
    activePreviewTimeline.value = timeline.map(([s, e]) => [s, e]);
    currentStreamUrl.value = url;
    applyStatus.value = "idle_edited";
    applyStatusMessage.value = "";
  } catch (e) {
    if (e?.name === "AbortError") return;
    if (requestId !== latestClipRequestId) return;
    applyStatus.value = "error";
    applyStatusMessage.value = e?.message || errorLabel;
  } finally {
    if (requestId === latestClipRequestId) clipAbortController = null;
  }
}

function previewClip(clip) {
  runPreview([[clip.start, clip.end]], clip.id, "Failed to preview clip");
}

function onClipPreview(clip) {
  previewClip(clip);
}

function onClipPlayAll() {
  if (!clips.value.length) return;
  const timeline = clips.value.map((c) => [c.start, c.end]);
  runPreview(timeline, ALL_CLIPS_ID, "Failed to preview clips");
}

function clearActiveClip() {
  cancelClipInFlight();
  activeClipId.value = null;
  activePreviewTimeline.value = null;
  // Force the deletion-driven preview to re-derive from the current doc.
  lastAppliedRanges.value = [];
  scheduleApply();
}

function onClipExitPreview() {
  clearActiveClip();
}

const loadTranscript = async () => {
  const video = props.content.video;
  if (!video?.id) return;
  transcriptLoading.value = true;
  transcriptError.value = "";
  transcriptLoadingMessage.value = "Loading transcript…";
  const slowTimer = setTimeout(() => {
    transcriptLoadingMessage.value =
      "Indexing spoken content (this may take a moment)…";
  }, 4000);
  try {
    const data = await fetchVideoTranscript({
      collectionId: video.collection_id || collectionId.value,
      videoId: video.id,
    });
    transcriptText.value = data?.text || "";
    transcriptSegments.value = Array.isArray(data?.segments)
      ? data.segments
      : [];
    transcriptFetched.value = true;
    pristineDocJSON.value = null;
    lastAppliedRanges.value = [];
  } catch (e) {
    transcriptError.value = e?.message || "Could not load transcript";
  } finally {
    clearTimeout(slowTimer);
    transcriptLoading.value = false;
  }
};

const handleFullScreenChange = () => {
  isFullScreen.value = !isFullScreen.value;
  if (isFullScreen.value) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

const onOverlayActionClick = () => {
  if (props.content.video?.id) {
    const willOpen = !showTranscript.value;
    showTranscript.value = willOpen;
    if (willOpen && !transcriptFetched.value && !transcriptLoading.value) {
      loadTranscript();
    }
    if (!willOpen && editorApi.value?.clearHighlight) {
      editorApi.value.clearHighlight();
    }
    return;
  }
  uploadError.value = "";
  showUploadModal.value = true;
};

const onUploadSubmit = async ({ name }) => {
  uploading.value = true;
  uploadError.value = "";
  try {
    await uploadChatVideo({
      collectionId: collectionId.value,
      sessionId: sessionId.value,
      convId: props.convId,
      msgId: props.msgId,
      contentIndex: props.contentIndex,
      streamUrl: props.content.video.stream_url,
      name,
    });
    showUploadModal.value = false;
  } catch (e) {
    uploadError.value = e?.message || "Upload failed";
  } finally {
    uploading.value = false;
  }
};

function syncFullscreenState() {
  isFullScreen.value = !!document.fullscreenElement;
}

onMounted(() => {
  document.addEventListener("fullscreenchange", syncFullscreenState);
});

onBeforeUnmount(() => {
  document.removeEventListener("fullscreenchange", syncFullscreenState);
  document.removeEventListener("selectionchange", onSelectionChange);
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  cancelInFlight();
  cancelClipInFlight();
});
</script>

<style lang="scss">
.video-js .vjs-big-play-button {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
