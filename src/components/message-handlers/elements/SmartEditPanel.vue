<template>
  <div
    class="vdb-c-mt-12 vdb-c-overflow-hidden vdb-c-rounded-12 vdb-c-border vdb-c-border-kilvish-300 vdb-c-bg-white"
  >
    <div
      class="vdb-c-flex vdb-c-items-center vdb-c-justify-between vdb-c-border-b vdb-c-border-kilvish-200 vdb-c-px-16 vdb-c-py-10"
    >
      <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
        <span
          class="material-symbols-outlined vdb-c-text-kilvish-700"
          style="font-size: 16px"
        >
          auto_fix_high
        </span>
        <span class="vdb-c-text-caption1 vdb-c-font-semibold vdb-c-text-kilvish-900">
          Smart Edit
        </span>
        <span
          v-if="totalRemoved > 0"
          class="vdb-c-rounded-6 vdb-c-bg-green-100 vdb-c-px-6 vdb-c-py-1 vdb-c-text-caption2 vdb-c-text-green-800"
        >
          {{ totalRemoved }} removed
        </span>
      </div>
      <button
        class="vdb-c-flex vdb-c-h-22 vdb-c-w-22 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-6 vdb-c-text-kilvish-600 hover:vdb-c-bg-kilvish-200 hover:vdb-c-text-kilvish-900"
        :title="collapsed ? 'Expand' : 'Collapse'"
        @click="collapsed = !collapsed"
      >
        <span class="material-symbols-outlined" style="font-size: 18px">
          {{ collapsed ? "expand_more" : "expand_less" }}
        </span>
      </button>
    </div>

    <div v-if="!collapsed" class="vdb-c-px-16 vdb-c-py-12">
      <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-12">
        <!-- Fillers row -->
        <div
          class="vdb-c-flex vdb-c-flex-col vdb-c-gap-6 vdb-c-rounded-10 vdb-c-bg-kilvish-100 vdb-c-px-12 vdb-c-py-10"
        >
          <div class="vdb-c-flex vdb-c-items-center vdb-c-justify-between">
            <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
              <span
                class="material-symbols-outlined vdb-c-text-kilvish-700"
                style="font-size: 16px"
              >
                voice_over_off
              </span>
              <span class="vdb-c-text-caption1 vdb-c-font-medium vdb-c-text-kilvish-900">
                Filler words
              </span>
              <span class="vdb-c-text-caption2 vdb-c-text-kilvish-600">
                · {{ fillerLabel }}
              </span>
            </div>
            <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-6">
              <button
                v-if="fillerActiveCount > 0"
                class="vdb-c-flex vdb-c-h-22 vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-8 vdb-c-bg-white vdb-c-px-8 vdb-c-text-caption2 vdb-c-text-kilvish-800 hover:vdb-c-bg-kilvish-200"
                title="Restore all filler words"
                :disabled="applying"
                @click="$emit('restore-fillers')"
              >
                <span class="material-symbols-outlined" style="font-size: 14px">
                  undo
                </span>
                Restore
              </button>
              <button
                class="vdb-c-flex vdb-c-h-22 vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-8 vdb-c-bg-primary vdb-c-px-8 vdb-c-text-caption2 vdb-c-text-white hover:vdb-c-bg-primary-700 disabled:vdb-c-opacity-60"
                :disabled="applying || !fillerPendingCount"
                :title="
                  fillerPendingCount
                    ? `Remove ${fillerPendingCount} filler word${fillerPendingCount === 1 ? '' : 's'}`
                    : 'Nothing to remove'
                "
                @click="$emit('apply-fillers')"
              >
                <span class="material-symbols-outlined" style="font-size: 14px">
                  delete
                </span>
                Remove all
              </button>
            </div>
          </div>
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-4">
            <label
              class="vdb-c-text-caption2 vdb-c-text-kilvish-700"
            >
              Filler word list (comma-separated)
            </label>
            <input
              type="text"
              :value="fillerWords"
              spellcheck="false"
              class="vdb-c-rounded-8 vdb-c-border vdb-c-border-kilvish-300 vdb-c-bg-white vdb-c-px-10 vdb-c-py-6 vdb-c-text-caption2 vdb-c-font-mono vdb-c-text-kilvish-900 focus:vdb-c-border-primary focus:vdb-c-outline-none"
              @input="$emit('update:fillerWords', $event.target.value)"
            />
          </div>
          <div
            v-if="fillerInstances.length"
            class="vdb-c-mt-2 vdb-c-flex vdb-c-flex-col vdb-c-gap-2"
          >
            <div
              class="vdb-c-flex vdb-c-items-center vdb-c-justify-between vdb-c-text-caption2 vdb-c-text-kilvish-700"
            >
              <span>Instances</span>
              <button
                v-if="fillerInstances.length > previewCap"
                class="vdb-c-text-caption2 vdb-c-text-primary hover:vdb-c-underline"
                @click="showAllFillers = !showAllFillers"
              >
                {{
                  showAllFillers
                    ? "Show fewer"
                    : `Show all ${fillerInstances.length}`
                }}
              </button>
            </div>
            <ul
              class="vdb-c-flex vdb-c-max-h-[160px] vdb-c-flex-wrap vdb-c-gap-4 vdb-c-overflow-y-auto"
            >
              <li
                v-for="inst in visibleFillers"
                :key="`f-${inst.from}-${inst.to}`"
              >
                <button
                  class="vdb-c-flex vdb-c-h-22 vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-6 vdb-c-px-6 vdb-c-text-caption2 vdb-c-font-mono"
                  :class="
                    inst.isDeleted
                      ? 'vdb-c-bg-red-100 vdb-c-text-primary vdb-c-line-through'
                      : 'vdb-c-bg-white vdb-c-text-kilvish-800 hover:vdb-c-bg-kilvish-200'
                  "
                  :title="`${formatTime(inst.astart)} — click to ${
                    inst.isDeleted ? 'restore' : 'remove'
                  }, double-click to jump`"
                  @click="
                    $emit('toggle-instance', {
                      from: inst.from,
                      to: inst.to,
                      source: 'filler',
                    })
                  "
                  @dblclick="
                    $emit('goto-instance', { from: inst.from, to: inst.to })
                  "
                >
                  {{ inst.text }}
                  <span
                    class="vdb-c-text-caption2 vdb-c-opacity-60"
                  >
                    {{ formatTime(inst.astart) }}
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Silences row -->
        <div
          class="vdb-c-flex vdb-c-flex-col vdb-c-gap-6 vdb-c-rounded-10 vdb-c-bg-kilvish-100 vdb-c-px-12 vdb-c-py-10"
        >
          <div class="vdb-c-flex vdb-c-items-center vdb-c-justify-between">
            <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
              <span
                class="material-symbols-outlined vdb-c-text-kilvish-700"
                style="font-size: 16px"
              >
                graphic_eq
              </span>
              <span class="vdb-c-text-caption1 vdb-c-font-medium vdb-c-text-kilvish-900">
                Silences
              </span>
              <span class="vdb-c-text-caption2 vdb-c-text-kilvish-600">
                · {{ silenceLabel }}
              </span>
            </div>
            <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-6">
              <button
                v-if="silenceActiveCount > 0"
                class="vdb-c-flex vdb-c-h-22 vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-8 vdb-c-bg-white vdb-c-px-8 vdb-c-text-caption2 vdb-c-text-kilvish-800 hover:vdb-c-bg-kilvish-200"
                title="Restore all silences"
                :disabled="applying"
                @click="$emit('restore-silences')"
              >
                <span class="material-symbols-outlined" style="font-size: 14px">
                  undo
                </span>
                Restore
              </button>
              <button
                class="vdb-c-flex vdb-c-h-22 vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-8 vdb-c-bg-primary vdb-c-px-8 vdb-c-text-caption2 vdb-c-text-white hover:vdb-c-bg-primary-700 disabled:vdb-c-opacity-60"
                :disabled="applying || !silencePendingCount"
                :title="
                  silencePendingCount
                    ? `Trim ${silencePendingCount} silence${silencePendingCount === 1 ? '' : 's'}`
                    : 'Nothing to trim'
                "
                @click="$emit('apply-silences')"
              >
                <span class="material-symbols-outlined" style="font-size: 14px">
                  content_cut
                </span>
                Trim all
              </button>
            </div>
          </div>
          <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
            <label class="vdb-c-text-caption2 vdb-c-text-kilvish-700">
              Min duration
            </label>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              :value="silenceThreshold"
              class="vdb-c-flex-1"
              @input="
                $emit('update:silenceThreshold', Number($event.target.value))
              "
            />
            <span
              class="vdb-c-w-44 vdb-c-text-right vdb-c-font-mono vdb-c-text-caption2 vdb-c-text-kilvish-800"
            >
              ≥ {{ Number(silenceThreshold).toFixed(1) }}s
            </span>
          </div>
          <div
            v-if="silenceInstances.length"
            class="vdb-c-mt-2 vdb-c-flex vdb-c-flex-col vdb-c-gap-2"
          >
            <div
              class="vdb-c-flex vdb-c-items-center vdb-c-justify-between vdb-c-text-caption2 vdb-c-text-kilvish-700"
            >
              <span>Detected gaps</span>
              <button
                v-if="silenceInstances.length > previewCap"
                class="vdb-c-text-caption2 vdb-c-text-primary hover:vdb-c-underline"
                @click="showAllSilences = !showAllSilences"
              >
                {{
                  showAllSilences
                    ? "Show fewer"
                    : `Show all ${silenceInstances.length}`
                }}
              </button>
            </div>
            <ul
              class="vdb-c-flex vdb-c-max-h-[160px] vdb-c-flex-col vdb-c-gap-2 vdb-c-overflow-y-auto"
            >
              <li
                v-for="inst in visibleSilences"
                :key="`s-${inst.source}-${inst.astart.toFixed(3)}-${inst.aend.toFixed(3)}`"
                class="vdb-c-flex vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-6 vdb-c-bg-white vdb-c-px-8 vdb-c-py-3"
                :class="inst.isDeleted ? 'vdb-c-opacity-60' : ''"
              >
                <span
                  class="vdb-c-shrink-0 vdb-c-rounded-6 vdb-c-bg-kilvish-200 vdb-c-px-6 vdb-c-py-1 vdb-c-font-mono vdb-c-text-caption2 vdb-c-text-kilvish-700"
                >
                  {{ formatTime(inst.astart) }}
                </span>
                <span
                  class="vdb-c-flex-1 vdb-c-font-mono vdb-c-text-caption2"
                  :class="
                    inst.isDeleted
                      ? 'vdb-c-text-kilvish-600 vdb-c-line-through'
                      : 'vdb-c-text-kilvish-800'
                  "
                >
                  {{ formatDuration(inst.duration) }} silence
                  <span
                    v-if="inst.source === 'gap'"
                    class="vdb-c-text-kilvish-500"
                  >
                    (auto-trimmed)
                  </span>
                </span>
                <button
                  v-if="inst.from != null"
                  class="vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-6 vdb-c-text-kilvish-700 hover:vdb-c-bg-kilvish-200 hover:vdb-c-text-kilvish-900"
                  title="Jump to silence"
                  @click="
                    $emit('goto-instance', { from: inst.from, to: inst.to })
                  "
                >
                  <span class="material-symbols-outlined" style="font-size: 14px">
                    near_me
                  </span>
                </button>
                <button
                  v-if="inst.from != null"
                  class="vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-6"
                  :class="
                    inst.isDeleted
                      ? 'vdb-c-text-green-700 hover:vdb-c-bg-green-100'
                      : 'vdb-c-text-primary hover:vdb-c-bg-red-100'
                  "
                  :title="inst.isDeleted ? 'Restore' : 'Trim'"
                  @click="
                    $emit('toggle-instance', {
                      from: inst.from,
                      to: inst.to,
                      source: 'silence',
                    })
                  "
                >
                  <span class="material-symbols-outlined" style="font-size: 14px">
                    {{ inst.isDeleted ? "restart_alt" : "content_cut" }}
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  fillerInstances: { type: Array, default: () => [] },
  silenceInstances: { type: Array, default: () => [] },
  fillerActiveCount: { type: Number, default: 0 },
  silenceActiveCount: { type: Number, default: 0 },
  fillerWords: { type: String, default: "" },
  silenceThreshold: { type: Number, default: 1.0 },
  applying: { type: Boolean, default: false },
});

defineEmits([
  "apply-fillers",
  "restore-fillers",
  "apply-silences",
  "restore-silences",
  "toggle-instance",
  "goto-instance",
  "update:fillerWords",
  "update:silenceThreshold",
]);

const collapsed = ref(false);
const showAllFillers = ref(false);
const showAllSilences = ref(false);
const previewCap = 24;

const fillerPendingCount = computed(
  () => props.fillerInstances.filter((i) => !i.isDeleted).length,
);
const silencePendingCount = computed(
  () =>
    props.silenceInstances.filter(
      (i) => i.from != null && !i.isDeleted,
    ).length,
);

const fillerLabel = computed(() => {
  const total = props.fillerInstances.length;
  if (!total) return "no matches";
  const active = props.fillerActiveCount;
  if (active && active === total) return `${total} removed`;
  if (active) return `${active} of ${total} removed`;
  return `${total} found`;
});

const silenceLabel = computed(() => {
  const total = props.silenceInstances.length;
  if (!total) return "none above threshold";
  const trimmable = props.silenceInstances.filter((i) => i.from != null).length;
  const active = props.silenceActiveCount;
  if (!trimmable) return `${total} auto-trimmed`;
  if (active && active === trimmable) return `${trimmable} trimmed`;
  if (active) return `${active} of ${trimmable} trimmed`;
  return `${trimmable} trimmable · ${total - trimmable} auto`;
});

const totalRemoved = computed(
  () => props.fillerActiveCount + props.silenceActiveCount,
);

const visibleFillers = computed(() =>
  showAllFillers.value
    ? props.fillerInstances
    : props.fillerInstances.slice(0, previewCap),
);
const visibleSilences = computed(() =>
  showAllSilences.value
    ? props.silenceInstances
    : props.silenceInstances.slice(0, previewCap),
);

function formatTime(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}
function formatDuration(sec) {
  const v = Math.max(0, Number(sec) || 0);
  return `${v.toFixed(1)}s`;
}
</script>
