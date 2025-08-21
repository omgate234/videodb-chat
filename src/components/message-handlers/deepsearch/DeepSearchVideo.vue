<template>
  <div
    class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-16 vdb-c-py-14 vdb-c-text-left"
  >
    <transition name="fade" mode="out-in">
      <div
        v-if="content.status === 'success' && content.video?.stream_url"
        class="vdb-c-w-full vdb-c-rounded-20 vdb-c-bg-kilvish-200 vdb-c-outline vdb-c-outline-1 vdb-c-outline-[#E5E7EB]"
      >
        <div
          :class="
            isFullScreen
              ? 'vdb-c-fixed vdb-c-inset-0 vdb-c-z-50 vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-overflow-y-hidden vdb-c-bg-black-64'
              : 'vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-16 vdb-c-p-16 lg:vdb-c-flex-row lg:vdb-c-items-center'
          "
        >
          <!-- LEFT: player -->
          <div
            :class="
              isFullScreen
                ? 'vdb-c-fixed vdb-c-inset-0 vdb-c-z-50 vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-overflow-y-hidden vdb-c-bg-black-64'
                : 'vdb-c-h-[170px] vdb-c-w-[300px] vdb-c-max-w-[260px] vdb-c-overflow-hidden vdb-c-rounded-20'
            "
          >
            <VideoDBPlayer
              ref="playerRef"
              :class="
                isFullScreen
                  ? 'vdb-c-h-screen vdb-c-w-screen'
                  : 'vdb-c-h-[170px] vdb-c-w-[300px] vdb-c-max-w-[260px]'
              "
              :stream-url="localStreamUrl"
              :default-controls="false"
              :default-overlay="false"
              :key="localStreamUrl"
              @fullScreenChange="handleFullScreenChange"
              @play="handlePlayerPlay"
              @timeupdate="handlePlayerTimeUpdate"
              @loadeddata="handlePlayerLoadedData"
            >
              <template #controls>
                <div class="vdb-p-pt-0 vdb-c-p-8">
                  <div class="sm:vdb-p-mx-8 vdb-c-mb-6 md:vdb-c-mb-6">
                    <ProgressBar :stream-url="content.video.stream_url" />
                  </div>
                  <div class="vdb-c-flex vdb-c-w-full vdb-c-justify-between">
                    <div
                      class="vdb-c-z-10 vdb-c-ml-0 vdb-c-flex vdb-c-items-center"
                    >
                      <PlayPauseButton />
                    </div>
                    <FullScreenButton class="" />
                  </div>
                </div>
              </template>
            </VideoDBPlayer>
          </div>

          <!-- RIGHT: editor slider -->
          <div
            class="vdb-c-min-w-0 vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-1 vdb-c-items-stretch vdb-c-gap-12"
          >
            <button
              @click="handleResetTrim"
              class="vdb-c-shadow-sm vdb-c-absolute -vdb-c-right-8 -vdb-c-top-8 vdb-c-z-10 vdb-c-flex vdb-c-h-24 vdb-c-w-24 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[#F7F7F7] vdb-c-text-[#242424] hover:vdb-c-bg-pam hover:vdb-c-text-white"
              aria-label="Reset clip"
              title="Reset clip"
            >
              <ResetIcon />
            </button>
            <div class="vdb-c-min-w-0 vdb-c-flex vdb-c-flex-1">
              <VideoTrimmer
                class="vdb-c-w-full"
                :start="localStart"
                :end="localEnd"
                :minTime="minTime"
                :maxTime="maxTime"
                :thumbnails="content.video.thumbnail_data"
                :video-thumbnail-url="content.video.thumbnail_url"
                :onStartChange="handleStartChange"
                :onEndChange="handleEndChange"
                :onMinTimeChange="handleMinTimeChange"
                :onMaxTimeChange="handleMaxTimeChange"
                :stream-url="content.video.stream_url"
                :video-length="content.video.length"
              />
            </div>
          </div>
          <div
            class="vdb-c-relative vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-8 vdb-c-rounded-full vdb-c-bg-white vdb-c-p-8 vdb-c-outline vdb-c-outline-[0.72px] vdb-c-outline-[rgba(36,36,36,0.20)]"
          >
            <div class="vdb-c-group vdb-c-relative">
              <button
                @click="handleConvertToVertical"
                :class="[
                  'vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[#F7F7F7] vdb-c-p-[5px] vdb-c-text-[#242424] vdb-c-transition-colors vdb-c-duration-150 hover:vdb-c-bg-pam',
                  content.status === 'progress'
                    ? 'vdb-c-cursor-not-allowed vdb-c-opacity-50'
                    : '',
                ]"
              >
                <RotateIcon
                  className="vdb-c-text-[#242424] vdb-c-transition-colors vdb-c-duration-150 group-hover:vdb-c-text-white"
                />
              </button>
              <div
                class="vdb-c-tooltip-shadow vdb-c-absolute vdb-c-right-full vdb-c-top-1/2 vdb-c-z-[10000] vdb-c-mr-10 vdb-c-hidden vdb-c--translate-y-1/2 vdb-c-items-center vdb-c-justify-end vdb-c-gap-10 vdb-c-whitespace-nowrap vdb-c-rounded-full vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-[14px] vdb-c-text-black group-hover:vdb-c-inline"
              >
                Convert to Vertical
              </div>
            </div>
            <div class="vdb-c-group vdb-c-relative">
              <button
                @click="handleDownloadStream"
                class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[#F7F7F7] vdb-c-p-[5px] vdb-c-text-[#242424] vdb-c-transition-colors vdb-c-duration-150 hover:vdb-c-bg-pam"
              >
                <DownloadIcon
                  className="vdb-c-text-[#242424] vdb-c-transition-colors vdb-c-duration-150 group-hover:vdb-c-text-white"
                />
              </button>
              <div
                class="vdb-c-tooltip-shadow vdb-c-absolute vdb-c-right-full vdb-c-top-1/2 vdb-c-z-[10000] vdb-c-mr-10 vdb-c-hidden vdb-c--translate-y-1/2 vdb-c-items-center vdb-c-justify-end vdb-c-gap-10 vdb-c-whitespace-nowrap vdb-c-rounded-full vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-[14px] vdb-c-text-black group-hover:vdb-c-inline"
              >
                Download
              </div>
            </div>
            <div class="vdb-c-group vdb-c-relative">
              <button
                :disabled="content.status === 'progress'"
                @click="handleFindSimilar"
                :class="[
                  'vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[#F7F7F7] vdb-c-p-[5px] vdb-c-text-[#242424] vdb-c-transition-colors vdb-c-duration-150 hover:vdb-c-bg-pam',
                  content.status === 'progress'
                    ? 'vdb-c-cursor-not-allowed vdb-c-opacity-50'
                    : '',
                ]"
              >
                <FindSimilarIcon
                  className="vdb-c-text-[#242424] vdb-c-transition-colors vdb-c-duration-150 group-hover:vdb-c-text-white"
                />
              </button>
              <div
                class="vdb-c-tooltip-shadow vdb-c-absolute vdb-c-right-full vdb-c-top-1/2 vdb-c-z-[10000] vdb-c-mr-10 vdb-c-hidden vdb-c--translate-y-1/2 vdb-c-items-center vdb-c-justify-end vdb-c-gap-10 vdb-c-whitespace-nowrap vdb-c-rounded-full vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-[14px] vdb-c-text-black group-hover:vdb-c-inline"
              >
                Find Similar Content
              </div>
            </div>
            <div class="vdb-c-group vdb-c-relative">
              <button
                :disabled="
                  !videoMetadata || Object.keys(videoMetadata).length === 0
                "
                @click="openEditModal"
                :class="[
                  'vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[#F7F7F7] vdb-c-p-[5px] vdb-c-text-[#242424] vdb-c-transition-colors vdb-c-duration-150 hover:vdb-c-bg-pam',
                  !videoMetadata
                    ? 'vdb-c-cursor-not-allowed vdb-c-opacity-50'
                    : '',
                ]"
              >
                <MediaEditIcon
                  className="vdb-c-text-[#242424] vdb-c-transition-colors vdb-c-duration-150 group-hover:vdb-c-text-white"
                />
              </button>
              <div
                class="vdb-c-tooltip-shadow vdb-c-absolute vdb-c-right-full vdb-c-top-1/2 vdb-c-z-[10000] vdb-c-mr-10 vdb-c-hidden vdb-c--translate-y-1/2 vdb-c-items-center vdb-c-justify-end vdb-c-gap-10 vdb-c-whitespace-nowrap vdb-c-rounded-full vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-[14px] vdb-c-text-black group-hover:vdb-c-inline"
              >
                Edit Meta Information
              </div>
            </div>
            <EditMetadataModal
              :show="showEditModal"
              :metadata="videoMetadata"
              :search-description="props.content?.video?.text || ''"
              @close="showEditModal = false"
              @save="handleSaveMeta"
            />
          </div>
        </div>
      </div>

      <div v-else-if="content.status === 'progress'">
        <div
          class="vdb-c-animate-pulse vdb-c-overflow-hidden vdb-c-rounded-20"
          style="width: 640px; max-width: 100%"
        >
          <div class="vdb-c-relative vdb-c-w-full" style="padding-top: 56.25%">
            <div class="vdb-c-absolute vdb-c-inset-0 vdb-c-bg-gray-200"></div>
          </div>
        </div>
      </div>

      <div
        v-else-if="content.status === 'not_generated'"
        class="vdb-c-flex vdb-c-flex-col"
      ></div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useVideoDBChat } from "../../../context.js";
import {
  VideoDBPlayer,
  TimeCode,
  BigCenterButton,
  VolumeControlButton,
  PlayPauseButton,
  FullScreenButton,
  ProgressBar,
} from "@videodb/player-vue";
import ResetIcon from "../../icons/Reset.vue";
import RotateIcon from "../../icons/Rotate.vue";
import DownloadIcon from "../../icons/Download.vue";
import MediaEditIcon from "../../icons/MediaEdit.vue";
import FindSimilarIcon from "../../icons/FindSimilar.vue";
import "@videodb/player-vue/dist/style.css";
import VideoTrimmer from "../elements/VideoTrimmer.vue";
import EditMetadataModal from "../../modals/EditMetadataModal.vue";

const props = defineProps({
  content: { type: Object, required: true },
  isLastConv: { type: Boolean, default: false },
});

// Removed logging watchers

const isFullScreen = ref(false);
const handleFullScreenChange = async () => {
  try {
    isFullScreen.value = !isFullScreen.value;
    if (isFullScreen.value) {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  } catch {}
};

// Player instance for controlling play/pause/seek
const playerRef = ref(null);

const hasEditor = computed(() => {
  return props.content?.agent_name === "deepsearch";
});

const videoMetadata = computed(
  () => props.content?.video?.metadata?.source ?? null,
);
const showEditModal = ref(false);
const openEditModal = () => {
  if (!videoMetadata.value) return;
  showEditModal.value = true;
};
const handleSaveMeta = () => {
  // Placeholder: no save logic yet. Close modal.
  showEditModal.value = false;
};

// trim range (draggable handles)
const initialVideo = props.content?.video || {};
const initialStart =
  typeof initialVideo.start === "number" ? initialVideo.start : 0;
const initialEnd = typeof initialVideo.end === "number" ? initialVideo.end : 0;
const initialLen =
  typeof initialVideo.length === "number" ? initialVideo.length : null;
const paddedInitMin = Math.max(0, initialStart - 15);
const paddedInitMax =
  initialLen !== null && isFinite(initialLen)
    ? Math.min(initialLen, initialEnd + 15)
    : initialEnd + 15;
const minTime = ref(paddedInitMin);
const maxTime = ref(paddedInitMax);
const localStart = ref(initialStart);
const localEnd = ref(initialEnd);
const localStreamUrl = ref(initialVideo?.stream_url || "");
const lastVideoId = ref(null);
const usingGeneratedStream = ref(false);
const usingWindowStream = ref(false);
const segmentEnded = ref(false);

// Window stream details
const windowStreamUrl = computed(
  () => props.content?.video?.metadata?.window_stream_url || "",
);
const windowStart = computed(() => {
  const v = props.content?.video || {};
  const start = typeof v.start === "number" ? v.start : 0;
  return Math.max(0, start - 15);
});
const windowEnd = computed(() => {
  const v = props.content?.video || {};
  const end = typeof v.end === "number" ? v.end : 0;
  const len = typeof v.length === "number" ? v.length : null;
  const raw = end + 15;
  return len !== null && isFinite(len) ? Math.min(len, raw) : raw;
});
const selectionWithinWindow = computed(() => {
  const s = Number(localStart.value);
  const e = Number(localEnd.value);
  if (!Number.isFinite(s) || !Number.isFinite(e)) return false;
  if (!windowStreamUrl.value) return false;
  return s >= windowStart.value && e <= windowEnd.value && s < e;
});
const clipStartRel = computed(() => {
  const rel = Number(localStart.value) - Number(windowStart.value);
  return Number.isFinite(rel) ? Math.max(0, rel) : 0;
});
const clipEndRel = computed(() => {
  const rel = Number(localEnd.value) - Number(windowStart.value);
  const startRel = clipStartRel.value;
  if (!Number.isFinite(rel)) return startRel;
  return Math.max(startRel, rel);
});

// callbacks consumed by VideoTrimmer
const handleStartChange = (start) => {
  localStart.value = start;
  segmentEnded.value = false;
};
const handleEndChange = (end) => {
  localEnd.value = end;
  segmentEnded.value = false;
};
const handleMinTimeChange = (newMinTime) => {
  minTime.value = newMinTime;
};
const handleMaxTimeChange = (newMaxTime) => {
  maxTime.value = newMaxTime;
};

// Removed logging watcher that observed trimmer payload

// Re-init ONLY when the video id changes
watch(
  () => props.content?.video?.id,
  (id) => {
    const v = props.content?.video || {};
    if (id && id !== lastVideoId.value) {
      lastVideoId.value = id;
      const start = typeof v.start === "number" ? v.start : 0;
      const end = typeof v.end === "number" ? v.end : 0;
      const len = typeof v.length === "number" ? v.length : null;
      const paddedMin = Math.max(0, start - 15);
      const paddedMax =
        len !== null && isFinite(len) ? Math.min(len, end + 15) : end + 15;
      minTime.value = paddedMin;
      maxTime.value = paddedMax;
      localStart.value = start;
      localEnd.value = end;
      usingGeneratedStream.value = false;
      usingWindowStream.value = false;
      segmentEnded.value = false;
      localStreamUrl.value = v.stream_url || "";
    }
  },
  { immediate: true },
);

// If upstream start/end genuinely change (e.g., server edit), sync them
watch(
  () => [props.content?.video?.start, props.content?.video?.end],
  ([start, end], [prevStart, prevEnd]) => {
    if (start !== prevStart || end !== prevEnd) {
      const v = props.content?.video || {};
      const s = typeof start === "number" ? start : 0;
      const e = typeof end === "number" ? end : 0;
      const len = typeof v.length === "number" ? v.length : null;
      const paddedMin = Math.max(0, s - 15);
      const paddedMax =
        len !== null && isFinite(len) ? Math.min(len, e + 15) : e + 15;
      minTime.value = paddedMin;
      maxTime.value = paddedMax;
      localStart.value = s;
      localEnd.value = e;
    }
  },
);

// Don’t overwrite a generated/trimmed stream url with the original one
watch(
  () => props.content?.video?.stream_url,
  (s, prev) => {
    if (!usingGeneratedStream.value && !usingWindowStream.value && s !== prev) {
      localStreamUrl.value = s || "";
    }
  },
);

// API from context and Send "Find Similar Content" message
const { addMessage, generateVideoStream, activeCollectionData } =
  useVideoDBChat();

// Debounced refresh of stream URL when trimmed range changes
let debounceTimer = null;
watch(
  () => [localStart.value, localEnd.value],
  async ([start, end]) => {
    if (!hasEditor.value) return;
    const video = props.content?.video;
    const collectionId = activeCollectionData?.value?.id;
    if (!video?.id || !collectionId) return;
    if (typeof start !== "number" || typeof end !== "number") return;
    if (start >= end) return;
    // If selection is covered by the window stream, use it and simulate trimming
    if (selectionWithinWindow.value && windowStreamUrl.value) {
      usingWindowStream.value = true;
      usingGeneratedStream.value = false;
      // Switch to window stream if needed
      if (localStreamUrl.value !== windowStreamUrl.value) {
        localStreamUrl.value = windowStreamUrl.value;
      }
      // No generation required in this case
      if (debounceTimer) clearTimeout(debounceTimer);
      return;
    }

    // Outside window: fall back to generating a precise stream
    usingWindowStream.value = false;
    // Guard: ensure generateVideoStream is available (custom hooks may omit it)
    if (typeof generateVideoStream !== "function") return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const res = await generateVideoStream(collectionId, video.id, start, end);
      if (res?.status === "success" && res?.data?.stream_url) {
        usingGeneratedStream.value = true;
        localStreamUrl.value = res.data.stream_url;
      }
    }, 400);
  },
);
// Reset trim and stream url to original values
const handleResetTrim = () => {
  const v = props.content?.video || {};
  if (typeof v.start === "number" && typeof v.end === "number") {
    minTime.value = Math.max(0, v.start - 15);
    maxTime.value = Math.min(v.end + 15, v.length);
    localStart.value = v.start;
    localEnd.value = v.end;
  }
  if (v.stream_url) {
    usingGeneratedStream.value = false;
    usingWindowStream.value = false;
    segmentEnded.value = false;
    localStreamUrl.value = v.stream_url;
  }
};
const handleFindSimilar = () => {
  if (props.content?.status === "progress") return;
  const video = props.content?.video || {};
  const name = video?.name || "this";
  addMessage?.({
    content: [
      {
        type: "text",
        text: `@DeepSearch find me similar content like the one from ${name}`,
      },
    ],
    additional_data: {
      ui_event: "more_like",
      join_data: {
        video_id: video?.id ?? null,
        start: video?.start ?? null,
        end: video?.end ?? null,
        text: video?.text ?? null,
      },
    },
  });
};

const formatTime = (totalSeconds) => {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const handleConvertToVertical = () => {
  if (props.content?.status === "progress") return;
  const video = props.content?.video || {};
  const startStr = formatTime(localStart.value);
  const endStr = formatTime(localEnd.value);
  const text = `@reel_maker, work on the video \`${video?.name ?? ""}\` from start: ${startStr} to end: ${endStr}`;
  addMessage?.({
    content: [{ type: "text", text }],
    additional_data: {
      video_id: video?.id ?? null,
      start: video?.start ?? null,
      end: video?.end ?? null,
    },
  });
};

const handleDownloadStream = () => {
  if (props.content?.status === "progress") return;
  const video = props.content?.video || {};
  const text = `@download download the stream with URL: \`${localStreamUrl.value}\` from \`${video?.name ?? "the above video"}\``;
  addMessage?.({
    content: [{ type: "text", text }],
  });
};

// Player event handlers to simulate trimming within window stream
const handlePlayerPlay = () => {
  if (!usingWindowStream.value) return;
  const instance = playerRef.value;
  if (!instance) return;
  const currentTime = Number(instance.time) || 0;
  const startRel = Number(clipStartRel.value) || 0;
  const endRel = Number(clipEndRel.value) || startRel;
  const epsilon = 0.25;
  // If segment previously ended and user presses play, replay from start of segment
  if (segmentEnded.value) {
    try {
      instance.seekTo?.(startRel);
      segmentEnded.value = false;
      // Let play continue
    } catch {}
    return;
  }
  if (currentTime < startRel - epsilon || currentTime > endRel + epsilon) {
    try {
      instance.seekTo?.(startRel);
    } catch {}
  }
};

const handlePlayerTimeUpdate = (evt) => {
  if (!usingWindowStream.value) return;
  const instance = playerRef.value;
  if (!instance) return;
  const t =
    (typeof instance.time === "number" ? instance.time : null) ??
    (evt && (evt.detail?.time ?? evt.time)) ??
    0;
  const endRel = Number(clipEndRel.value) || 0;
  const epsilon = 0.1;
  if (t >= endRel - epsilon) {
    try {
      instance.pause?.();
      instance.seekTo?.(startRel);
      segmentEnded.value = true;
    } catch {}
  }
};

const handlePlayerLoadedData = () => {
  if (!usingWindowStream.value) return;
  const instance = playerRef.value;
  if (!instance) return;
  const startRel = Number(clipStartRel.value) || 0;
  try {
    instance.seekTo?.(startRel);
    segmentEnded.value = false;
  } catch {}
};
</script>

<style lang="scss">
.video-js .vjs-big-play-button {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
<style scoped>
.vdb-c-tooltip-shadow {
  box-shadow:
    0 55px 16px 0 rgba(0, 0, 0, 0),
    0 36px 14px 0 rgba(0, 0, 0, 0.01),
    0 20px 12px 0 rgba(0, 0, 0, 0.04),
    0 9px 9px 0 rgba(0, 0, 0, 0.07),
    0 2px 5px 0 rgba(0, 0, 0, 0.08);
}
</style>
