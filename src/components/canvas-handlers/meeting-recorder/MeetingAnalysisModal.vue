<template>
  <Transition name="modal-fade" appear>
    <div
      v-if="isOpen"
      class="vdb-c-select-none vdb-c-border vdb-c-border-[#E5E7EB] vdb-c-bg-[#FFFFFF]"
      :class="
        isFloating
          ? 'vdb-c-absolute vdb-c-bottom-24 vdb-c-right-24 vdb-c-top-24 vdb-c-z-10 vdb-c-h-[95%] vdb-c-w-[397px] vdb-c-overflow-hidden vdb-c-rounded-12 vdb-c-shadow-[0_8px_24px_rgba(0,0,0,0.08)]'
          : 'vdb-c-rounded-0 vdb-c-relative vdb-c-w-full'
      "
      role="dialog"
      aria-modal="true"
      aria-label="Meeting Assistant"
    >
      <!-- Shell -->
      <div
        class="vdb-c-flex vdb-c-max-h-[80vh] vdb-c-flex-col vdb-c-items-start vdb-c-overflow-hidden vdb-c-pb-24 vdb-c-transition-all vdb-c-duration-300"
        :class="isFloating ? 'vdb-c-rounded-12' : 'vdb-c-rounded-0'"
      >
        <!-- Header -->
        <div
          class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-between vdb-c-border-b vdb-c-border-gray-200 vdb-c-bg-[#F7F7F7] vdb-c-px-20 vdb-c-py-12"
        >
          <div
            class="vdb-c-text-[18px] vdb-c-font-[600] vdb-c-capitalize vdb-c-leading-[27px] vdb-c-text-black"
          >
            Meeting Assistant
          </div>

          <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
            <!-- Pin / Float toggle -->
            <button
              class="vdb-c-grid vdb-c-size-28 vdb-c-place-items-center vdb-c-rounded-8 vdb-c-border vdb-c-transition"
              :aria-pressed="!isFloating ? 'true' : 'false'"
              :title="isFloating ? 'Pin panel' : 'Unpin (float)'"
              @click="$emit('toggle-floating')"
            >
              <!-- Pin icon -->
              <Pinned
                v-if="!isFloating"
                className="vdb-c-text-[#EC5B16]"
                fill="#111827"
              />
              <!-- Unpin icon -->
              <UnPinned
                v-else
                className="vdb-c-text-[#111827]"
                fill="#111827"
              />
            </button>

            <!-- Close -->
            <button
              class="vdb-c-grid vdb-c-size-28 vdb-c-place-items-center vdb-c-rounded-8 vdb-c-border vdb-c-transition"
              title="Close"
              @click="$emit('close')"
            >
              <Cross className="vdb-c-text-[#111827]" fill="#111827" />
            </button>
          </div>
        </div>

        <!-- Main (scroll area) -->
        <div
          class="scrollbar-hide vdb-c-flex vdb-c-w-full vdb-c-flex-1 vdb-c-flex-col vdb-c-items-start vdb-c-gap-30 vdb-c-overflow-y-auto vdb-c-px-20 vdb-c-py-16"
        >
          <!-- Live Insights -->
          <section
            class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-20"
          >
            <!-- Label -->
            <div
              class="vdb-c-flex vdb-c-h-[24px] vdb-c-w-full vdb-c-items-center vdb-c-gap-8"
            >
              <!-- placeholder icon -->
              <div
                class="vdb-c-size-16 vdb-c-rounded-full vdb-c-bg-[#0E1216]/10"
              ></div>
              <div
                class="vdb-c-text-[16px] vdb-c-font-[500] vdb-c-leading-[19.6px] vdb-c-text-black"
              >
                Live Insights
              </div>
            </div>

            <!-- High Priority Card -->
            <div
              class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-16 vdb-c-rounded-[10px] vdb-c-border vdb-c-border-[#FFE9D3] vdb-c-bg-[#FFF5EC] vdb-c-p-12"
            >
              <div
                class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-12"
              >
                <div
                  class="vdb-c-inline-flex vdb-c-items-center vdb-c-gap-12 vdb-c-rounded-[48px] vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-[13px] vdb-c-font-[600] vdb-c-text-black"
                >
                  High Priority
                </div>
                <ul class="vdb-c-w-full vdb-c-list-disc vdb-c-pl-20">
                  <li
                    v-for="item in visibleHighPriority"
                    :key="item.text"
                    class="vdb-c-text-[14px] vdb-c-leading-[24px] vdb-c-text-black"
                  >
                    {{ normalize(item.text) }}
                  </li>
                </ul>
              </div>

              <button
                v-if="highPriority.length > 2"
                class="vdb-c-inline-flex vdb-c-items-center vdb-c-gap-1 vdb-c-rounded-[999px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-8 vdb-c-text-[13px] vdb-c-font-[500] vdb-c-leading-[16px] vdb-c-tracking-[0.065px] vdb-c-text-black vdb-c-transition hover:vdb-c-bg-[#F9FAFB]"
                @click="toggleSeeAll('high')"
              >
                {{ showAllHigh ? "See less" : "See all" }}
              </button>
            </div>

            <!-- Opportunity Card -->
            <div
              class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-16 vdb-c-rounded-[10px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-[#F9FAFB] vdb-c-p-12"
            >
              <div
                class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-12"
              >
                <div
                  class="vdb-c-inline-flex vdb-c-items-center vdb-c-gap-12 vdb-c-rounded-[48px] vdb-c-bg-[#EFEFEF] vdb-c-px-12 vdb-c-py-8 vdb-c-text-[13px] vdb-c-font-[600] vdb-c-text-black"
                >
                  Opportunity
                </div>

                <ul class="vdb-c-w-full vdb-c-list-disc vdb-c-pl-20">
                  <li
                    v-for="(item, idx) in visibleOpportunities"
                    :key="'op-' + idx + '-' + item.text"
                    class="vdb-c-text-[14px] vdb-c-leading-[24px] vdb-c-text-black"
                  >
                    {{ normalize(item.text) }}
                  </li>
                </ul>
              </div>

              <button
                v-if="opportunities.length > 2"
                class="vdb-c-inline-flex vdb-c-items-center vdb-c-gap-1 vdb-c-rounded-[999px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-8 vdb-c-text-[13px] vdb-c-font-[500] vdb-c-leading-[16px] vdb-c-tracking-[0.065px] vdb-c-text-black vdb-c-transition hover:vdb-c-bg-[#FFFFFF]/70"
                @click="toggleSeeAll('opp')"
              >
                {{ showAllOpp ? "See less" : "See all" }}
              </button>
            </div>
          </section>

          <!-- Suggested Questions / Actions -->
          <section
            class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-20"
          >
            <div
              class="vdb-c-text-[16px] vdb-c-font-[500] vdb-c-leading-[19.6px] vdb-c-text-black"
            >
              Suggested Questions/Actions
            </div>

            <TransitionGroup
              name="list-fade"
              tag="ul"
              class="vdb-c-w-full vdb-c-list-disc vdb-c-pl-20"
            >
              <li
                v-for="(q, idx) in questions"
                :key="'q-' + idx + '-' + q.text + '-' + q.answered"
                class="vdb-c-text-[14px] vdb-c-leading-[24px] vdb-c-text-black"
              >
                {{ q.text }}
              </li>
            </TransitionGroup>
          </section>

          <!-- Meeting Checklist -->
          <section
            class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-20"
          >
            <div
              class="vdb-c-text-[16px] vdb-c-font-[500] vdb-c-leading-[19.6px] vdb-c-text-black"
            >
              Meeting Checklist
            </div>

            <div
              class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-12"
            >
              <TransitionGroup
                name="list-fade"
                tag="div"
                class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-12 vdb-c-self-stretch"
              >
                <label
                  v-for="(item, idx) in localChecklist"
                  :key="'c-' + idx + '-' + item.text"
                  class="vdb-c-flex vdb-c-w-full vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-16 vdb-c-rounded-[10px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-16 vdb-c-py-8"
                >
                  <button
                    type="button"
                    class="vdb-c-flex vdb-c-h-[16px] vdb-c-w-[16px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-4 vdb-c-border vdb-c-transition"
                    :class="
                      item.covered
                        ? 'vdb-c-border-[#EC5B16] vdb-c-bg-[#EC5B16]'
                        : 'vdb-c-border-[#969696] vdb-c-bg-white'
                    "
                    @click="toggleChecklist(idx)"
                    :aria-pressed="item.covered ? 'true' : 'false'"
                  >
                    <svg
                      v-if="item.covered"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6 12l4 4 8-8"
                        stroke="#FFFFFF"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>

                  <span
                    class="vdb-c-text-[14px] vdb-c-font-[500] vdb-c-leading-[24px] vdb-c-tracking-[0.07px] vdb-c-text-black"
                  >
                    {{ item.text }}
                  </span>
                </label>
              </TransitionGroup>
            </div>
          </section>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, watch, ref } from "vue";
import { useVideoDBChat } from "../../../context";
import Pinned from "./Pinned.vue";
import UnPinned from "./UnPinned.vue";
import Cross from "./Cross.vue";

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  isFloating: { type: Boolean, default: true },
});

const emit = defineEmits(["close", "toggle-floating"]);

const { canvasState } = useVideoDBChat();

/** Normalize escaped percent signs coming from the stream */
const normalize = (t = "") => t.replaceAll("\\%", "%").trim();

// Use content from canvas state instead of props
const content = computed(() => canvasState.content || {});

// ---- local reactive mirrors (so we always re-render on deep updates)
const liveInsights = ref([]);
const questions = ref([]);
const localChecklist = ref([]); // you already had this; leaving it here for clarity

watch(
  () => content.value?.meeting_assistant,
  (ma) => {
    liveInsights.value = [...(ma?.live_insights ?? [])];
    questions.value = [...(ma?.suggested_questions ?? [])];
    localChecklist.value = (ma?.meeting_checklist ?? []).map((x) => ({ ...x }));
  },
  { immediate: true, deep: true },
);

// derived views
const highPriority = computed(() =>
  liveInsights.value.filter(
    (x) => (x.type || "").toLowerCase() === "high priority",
  ),
);
const opportunities = computed(() =>
  liveInsights.value.filter(
    (x) => (x.type || "").toLowerCase() === "opportunity",
  ),
);

const showAllHigh = ref(false);
const showAllOpp = ref(false);
const latestTwo = (arr) => (arr.length <= 2 ? arr : arr.slice(-2));

const visibleHighPriority = computed(() =>
  showAllHigh.value ? highPriority.value : latestTwo(highPriority.value),
);
const visibleOpportunities = computed(() =>
  showAllOpp.value ? opportunities.value : latestTwo(opportunities.value),
);

function toggleSeeAll(which) {
  if (which === "high") showAllHigh.value = !showAllHigh.value;
  if (which === "opp") showAllOpp.value = !showAllOpp.value;
}

function toggleChecklist(idx) {
  const item = localChecklist.value[idx];
  if (item) item.covered = !item.covered;
}

/** When the modal re-opens, collapse the "see all" views for a clean start */
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      showAllHigh.value = false;
      showAllOpp.value = false;
    }
  },
);
</script>
<style scoped>
/* Hide native scrollbar (keeps scroll functionality) */
.scrollbar-hide::-webkit-scrollbar {
  width: 0;
  height: 0;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Modal fade/scale */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 180ms ease,
    transform 220ms ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}

/* List item transitions for live insights - fade only, no movement */
.insights-fade-enter-active,
.insights-fade-leave-active {
  transition: opacity 200ms ease;
}
.insights-fade-enter-from,
.insights-fade-leave-to {
  opacity: 0;
}

/* List item transitions for questions and checklist - with movement */
.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 200ms ease;
}
.list-fade-enter-from,
.list-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
.list-fade-move {
  transition: transform 200ms ease;
}

/* Small utility since we used size-28 (28px square) */
.vdb-c-size-28 {
  width: 28px;
  height: 28px;
}
</style>
