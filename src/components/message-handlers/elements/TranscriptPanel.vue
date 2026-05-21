<template>
  <transition name="transcript">
    <div
      v-if="show"
      class="vdb-c-mt-12 vdb-c-overflow-hidden vdb-c-rounded-16 vdb-c-border vdb-c-border-kilvish-300 vdb-c-bg-white"
    >
      <div
        class="vdb-c-flex vdb-c-items-center vdb-c-justify-between vdb-c-border-b vdb-c-border-kilvish-200 vdb-c-px-20 vdb-c-py-12"
      >
        <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
          <span
            class="material-symbols-outlined vdb-c-text-kilvish-700"
            style="font-size: 18px"
          >
            subtitles
          </span>
          <span class="vdb-c-text-caption1 vdb-c-font-semibold vdb-c-text-kilvish-900">
            {{ editable ? "Transcript Editor" : "Transcript" }}
          </span>
          <span
            v-if="!loading && !error && segmentCount && !editable"
            class="vdb-c-text-caption2 vdb-c-text-kilvish-600"
          >
            · {{ segmentCount }} segments
          </span>
          <span
            v-if="editable && !loading && !error && statusBadge"
            :class="[
              'vdb-c-rounded-6 vdb-c-px-8 vdb-c-py-2 vdb-c-text-caption2',
              statusBadge.cls,
            ]"
          >
            <span
              v-if="statusBadge.spinner"
              class="vdb-c-mr-4 vdb-c-inline-block vdb-c-h-10 vdb-c-w-10 vdb-c-animate-spin vdb-c-rounded-full vdb-c-border vdb-c-border-current vdb-c-border-t-transparent vdb-c-align-[-1px]"
            ></span>
            {{ statusBadge.label }}
          </span>
          <span
            v-if="editable && !loading && !error && counterLabel"
            class="vdb-c-text-caption2 vdb-c-text-kilvish-600"
          >
            · {{ counterLabel }}
          </span>
        </div>

        <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-6">
          <button
            v-if="editable && canRevert"
            class="vdb-c-flex vdb-c-h-24 vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-8 vdb-c-px-8 vdb-c-text-caption2 vdb-c-text-kilvish-700 hover:vdb-c-bg-kilvish-200 hover:vdb-c-text-kilvish-900"
            title="Revert to original"
            @click="$emit('revert')"
          >
            <span class="material-symbols-outlined" style="font-size: 16px">
              undo
            </span>
            Revert
          </button>
          <button
            v-if="editable && applyStatus === 'error'"
            class="vdb-c-flex vdb-c-h-24 vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-8 vdb-c-px-8 vdb-c-text-caption2 vdb-c-text-primary hover:vdb-c-bg-red-100"
            title="Retry"
            @click="$emit('retry')"
          >
            <span class="material-symbols-outlined" style="font-size: 16px">
              refresh
            </span>
            Retry
          </button>
          <button
            v-if="!loading"
            class="vdb-c-flex vdb-c-h-24 vdb-c-w-24 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-8 vdb-c-text-kilvish-600 hover:vdb-c-bg-kilvish-200 hover:vdb-c-text-kilvish-900"
            title="Close"
            @click="$emit('close')"
          >
            <span class="material-symbols-outlined" style="font-size: 18px">
              close
            </span>
          </button>
        </div>
      </div>

      <div class="vdb-c-px-20 vdb-c-py-16">
        <transition name="fade" mode="out-in">
          <div v-if="loading" key="loading" class="vdb-c-flex vdb-c-flex-col vdb-c-gap-12">
            <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
              <div
                class="vdb-c-h-16 vdb-c-w-16 vdb-c-animate-spin vdb-c-rounded-full vdb-c-border-2 vdb-c-border-kilvish-300 vdb-c-border-t-primary"
              ></div>
              <span class="vdb-c-text-caption1 vdb-c-text-kilvish-600">
                {{ loadingMessage }}
              </span>
            </div>
            <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-8">
              <div
                v-for="w in [76, 92, 64, 84, 70]"
                :key="w"
                class="vdb-c-h-12 vdb-c-animate-pulse vdb-c-rounded-6 vdb-c-bg-kilvish-200"
                :style="{ width: w + '%' }"
              ></div>
            </div>
          </div>

          <div
            v-else-if="error"
            key="error"
            class="vdb-c-flex vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-12 vdb-c-bg-red-100 vdb-c-px-16 vdb-c-py-12"
          >
            <span
              class="material-symbols-outlined vdb-c-text-primary"
              style="font-size: 18px"
            >
              error
            </span>
            <span class="vdb-c-text-caption1 vdb-c-text-primary-900">
              {{ error }}
            </span>
            <button
              class="vdb-c-ml-auto vdb-c-rounded-6 vdb-c-bg-white vdb-c-px-8 vdb-c-py-2 vdb-c-text-caption2 vdb-c-text-primary hover:vdb-c-bg-kilvish-100"
              @click="$emit('retry')"
            >
              Retry
            </button>
          </div>

          <div v-else-if="editable && segments && segments.length" key="editor">
            <SmartEditPanel
              :filler-instances="fillerInstances"
              :silence-instances="silenceInstances"
              :filler-active-count="fillerActiveCount"
              :silence-active-count="silenceActiveCount"
              :filler-words="fillerWords"
              :silence-threshold="silenceThreshold"
              :applying="applyStatus === 'regenerating'"
              @apply-fillers="$emit('apply-fillers')"
              @restore-fillers="$emit('restore-fillers')"
              @apply-silences="$emit('apply-silences')"
              @restore-silences="$emit('restore-silences')"
              @toggle-instance="(e) => $emit('toggle-instance', e)"
              @goto-instance="(e) => $emit('goto-instance', e)"
              @update:filler-words="(v) => $emit('update:fillerWords', v)"
              @update:silence-threshold="(v) => $emit('update:silenceThreshold', v)"
            />
            <div
              v-if="applyStatus === 'error' && applyStatusMessage"
              class="vdb-c-mb-8 vdb-c-flex vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-8 vdb-c-bg-red-100 vdb-c-px-12 vdb-c-py-6 vdb-c-text-caption2 vdb-c-text-primary"
            >
              <span class="material-symbols-outlined" style="font-size: 14px">
                error
              </span>
              <span>{{ applyStatusMessage }}</span>
            </div>
            <div
              v-else-if="applyStatus === 'empty'"
              class="vdb-c-mb-8 vdb-c-rounded-8 vdb-c-bg-kilvish-100 vdb-c-px-12 vdb-c-py-6 vdb-c-text-caption2 vdb-c-text-kilvish-700"
            >
              Nothing kept — showing original. Restore content to preview the edit.
            </div>
            <div
              v-if="activeClipId"
              class="vdb-c-mb-8 vdb-c-flex vdb-c-items-center vdb-c-justify-between vdb-c-rounded-8 vdb-c-bg-blue-100 vdb-c-px-12 vdb-c-py-6 vdb-c-text-caption2 vdb-c-text-blue-800"
            >
              <span class="vdb-c-flex vdb-c-items-center vdb-c-gap-6">
                <span class="material-symbols-outlined" style="font-size: 14px">
                  movie
                </span>
                {{
                  activeClipId === ALL_CLIPS_ID
                    ? `Previewing all clips (${clips.length})`
                    : "Previewing clip"
                }}
              </span>
              <button
                class="vdb-c-rounded-6 vdb-c-bg-white vdb-c-px-8 vdb-c-py-2 vdb-c-text-caption2 vdb-c-text-blue-800 hover:vdb-c-bg-kilvish-100"
                @click="$emit('clip-exit-preview')"
              >
                Exit clip preview
              </button>
            </div>
            <div
              class="vdb-c-mb-8 vdb-c-flex vdb-c-items-center vdb-c-justify-end"
            >
              <button
                class="vdb-c-flex vdb-c-h-24 vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-8 vdb-c-bg-kilvish-100 vdb-c-px-8 vdb-c-text-caption2 vdb-c-text-kilvish-800 hover:vdb-c-bg-kilvish-200 disabled:vdb-c-opacity-50"
                :disabled="!canAddClip"
                title="Add clip from selection (⌘K)"
                @click="$emit('clip-add-from-selection')"
              >
                <span class="material-symbols-outlined" style="font-size: 14px">
                  content_cut
                </span>
                Add Clip
              </button>
            </div>
            <TranscriptEditor
              ref="editorRef"
              :segments="segments"
              :editable="true"
              @ready="(api) => $emit('editor-ready', api)"
              @doc-change="(e) => $emit('doc-change', e)"
              @seek="(e) => $emit('seek', e)"
              @clip-add="(c) => $emit('clip-add', c)"
              @clip-remove="(id) => $emit('clip-remove', id)"
              @clip-edit="(c) => $emit('clip-edit', c)"
              @clip-cleared="$emit('clip-cleared')"
            />
            <div
              v-if="clips && clips.length"
              class="vdb-c-mt-12 vdb-c-border-t vdb-c-border-kilvish-200 vdb-c-pt-12"
            >
              <div
                class="vdb-c-mb-6 vdb-c-flex vdb-c-items-center vdb-c-justify-between"
              >
                <span
                  class="vdb-c-text-caption2 vdb-c-font-semibold vdb-c-text-kilvish-700"
                >
                  Clips · {{ clips.length }}
                </span>
                <button
                  class="vdb-c-flex vdb-c-h-22 vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-8 vdb-c-bg-blue-100 vdb-c-px-8 vdb-c-text-caption2 vdb-c-text-blue-800 hover:vdb-c-bg-blue-200"
                  title="Play all clips together"
                  @click="$emit('clip-play-all')"
                >
                  <span class="material-symbols-outlined" style="font-size: 14px">
                    play_arrow
                  </span>
                  Play all
                </button>
              </div>
              <ul class="vdb-c-flex vdb-c-flex-col vdb-c-gap-4">
                <li
                  v-for="(clip, idx) in clips"
                  :key="clip.id"
                  class="vdb-c-flex vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-8 vdb-c-px-8 vdb-c-py-4 hover:vdb-c-bg-kilvish-100"
                  :class="
                    activeClipId === clip.id ||
                    activeClipId === ALL_CLIPS_ID
                      ? 'vdb-c-bg-blue-100'
                      : ''
                  "
                  @mouseenter="$emit('clip-hover', clip.id)"
                  @mouseleave="$emit('clip-hover-end', clip.id)"
                >
                  <span
                    class="vdb-c-shrink-0 vdb-c-rounded-6 vdb-c-bg-kilvish-200 vdb-c-px-6 vdb-c-py-1 vdb-c-font-mono vdb-c-text-caption2 vdb-c-text-kilvish-700"
                  >
                    #{{ idx + 1 }}
                  </span>
                  <span
                    class="vdb-c-flex-1 vdb-c-font-mono vdb-c-text-caption2 vdb-c-text-kilvish-800"
                  >
                    {{ formatTime(clip.start) }} – {{ formatTime(clip.end) }}
                    <span class="vdb-c-text-kilvish-600">
                      · {{ formatDuration(clip.end - clip.start) }}
                    </span>
                  </span>
                  <button
                    class="vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-6 vdb-c-text-kilvish-700 hover:vdb-c-bg-kilvish-200 hover:vdb-c-text-kilvish-900"
                    title="Preview clip"
                    @click="$emit('clip-preview', clip)"
                  >
                    <span class="material-symbols-outlined" style="font-size: 14px">
                      play_arrow
                    </span>
                  </button>
                  <button
                    class="vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-6 vdb-c-text-kilvish-700 hover:vdb-c-bg-red-100 hover:vdb-c-text-primary"
                    title="Delete clip"
                    @click="$emit('clip-remove', clip.id)"
                  >
                    <span class="material-symbols-outlined" style="font-size: 14px">
                      delete
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div
            v-else-if="segments && segments.length"
            key="segments"
            class="vdb-c-max-h-[360px] vdb-c-overflow-y-auto vdb-c-pr-4"
          >
            <ol class="vdb-c-flex vdb-c-flex-col vdb-c-gap-8">
              <li
                v-for="(seg, idx) in segments"
                :key="idx"
                class="vdb-c-group vdb-c-flex vdb-c-gap-12 vdb-c-rounded-8 vdb-c-px-8 vdb-c-py-6 hover:vdb-c-bg-kilvish-100"
              >
                <span
                  class="vdb-c-mt-2 vdb-c-shrink-0 vdb-c-rounded-6 vdb-c-bg-kilvish-200 vdb-c-px-8 vdb-c-py-2 vdb-c-font-mono vdb-c-text-caption2 vdb-c-text-kilvish-700 group-hover:vdb-c-bg-kilvish-300"
                >
                  {{ formatTime(seg.start) }}
                </span>
                <p
                  class="vdb-c-text-caption1 vdb-c-leading-relaxed vdb-c-text-kilvish-900"
                >
                  {{ seg.text }}
                </p>
              </li>
            </ol>
          </div>

          <div
            v-else-if="text"
            key="text"
            class="vdb-c-max-h-[360px] vdb-c-overflow-y-auto vdb-c-pr-4"
          >
            <p
              class="vdb-c-whitespace-pre-wrap vdb-c-text-caption1 vdb-c-leading-relaxed vdb-c-text-kilvish-900"
            >
              {{ text }}
            </p>
          </div>

          <div
            v-else
            key="empty"
            class="vdb-c-py-12 vdb-c-text-center vdb-c-text-caption1 vdb-c-text-kilvish-600"
          >
            No transcript available.
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref } from "vue";
import TranscriptEditor from "./TranscriptEditor.vue";
import SmartEditPanel from "./SmartEditPanel.vue";

const props = defineProps({
  show: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  loadingMessage: { type: String, default: "Loading transcript…" },
  error: { type: String, default: "" },
  text: { type: String, default: "" },
  segments: { type: Array, default: () => [] },
  editable: { type: Boolean, default: false },
  applyStatus: { type: String, default: "idle_original" },
  applyStatusMessage: { type: String, default: "" },
  keptDuration: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 },
  keptCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  canRevert: { type: Boolean, default: false },
  clips: { type: Array, default: () => [] },
  activeClipId: { type: String, default: null },
  canAddClip: { type: Boolean, default: false },
  fillerInstances: { type: Array, default: () => [] },
  silenceInstances: { type: Array, default: () => [] },
  fillerActiveCount: { type: Number, default: 0 },
  silenceActiveCount: { type: Number, default: 0 },
  fillerWords: { type: String, default: "" },
  silenceThreshold: { type: Number, default: 1.0 },
});

defineEmits([
  "close",
  "revert",
  "retry",
  "editor-ready",
  "doc-change",
  "seek",
  "clip-add",
  "clip-remove",
  "clip-edit",
  "clip-cleared",
  "clip-add-from-selection",
  "clip-preview",
  "clip-play-all",
  "clip-exit-preview",
  "clip-hover",
  "clip-hover-end",
  "apply-fillers",
  "restore-fillers",
  "apply-silences",
  "restore-silences",
  "toggle-instance",
  "goto-instance",
  "update:fillerWords",
  "update:silenceThreshold",
]);

const editorRef = ref(null);
defineExpose({ editorRef });

const segmentCount = computed(() => props.segments?.length || 0);

const formatTime = (sec) => {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

const formatDuration = (sec) => {
  const v = Math.max(0, Number(sec) || 0);
  return `${v.toFixed(1)}s`;
};

const ALL_CLIPS_ID = "__all_clips__";

const statusBadge = computed(() => {
  switch (props.applyStatus) {
    case "regenerating":
      return {
        label: "Updating preview…",
        cls: "vdb-c-bg-kilvish-200 vdb-c-text-kilvish-800",
        spinner: true,
      };
    case "idle_edited":
      return {
        label: "Showing edited preview",
        cls: "vdb-c-bg-green-100 vdb-c-text-green-800",
      };
    case "error":
      return {
        label: "Preview failed",
        cls: "vdb-c-bg-red-100 vdb-c-text-primary",
      };
    case "empty":
      return {
        label: "Nothing kept",
        cls: "vdb-c-bg-kilvish-200 vdb-c-text-kilvish-700",
      };
    case "idle_original":
    default:
      return null;
  }
});

const counterLabel = computed(() => {
  if (!props.totalCount) return "";
  return `${props.keptCount} of ${props.totalCount} kept · ${formatTime(
    props.keptDuration,
  )} of ${formatTime(props.totalDuration)}`;
});
</script>

<style scoped>
.transcript-enter-active,
.transcript-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    max-height 0.25s ease;
  overflow: hidden;
}
.transcript-enter-from,
.transcript-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}
.transcript-enter-to,
.transcript-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 480px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
