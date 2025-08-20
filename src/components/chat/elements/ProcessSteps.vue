<template>
  <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-12">
    <!-- Process Header -->
    <button
      type="button"
      class="vdb-c-flex vdb-c-w-fit vdb-c-items-center vdb-c-gap-8 vdb-c-bg-transparent vdb-c-text-left"
      @click="toggle()"
    >
      <!-- title: 16px / 500 -->
      <span
        class="vdb-c-w-fit vdb-c-text-[16px] vdb-c-font-medium vdb-c-text-kilvish-800"
      >
        {{ step.title }}
      </span>

      <ChevronDown
        class="vdb-c-ml-auto"
        :class="{ 'vdb-c-rotate-180 vdb-c-transform': isExpanded }"
        :stroke-width="2"
        :stroke-color="'#343E4F'"
      />
    </button>

    <!-- Process Sub-steps -->
    <div v-if="isExpanded" class="vdb-c-flex vdb-c-flex-col vdb-c-gap-12">
      <div
        v-for="(process, processIndex) in step.processes"
        :key="processIndex"
      >
        <div
          class="vdb-c-inline-flex vdb-c-items-center vdb-c-gap-6 vdb-c-self-start vdb-c-whitespace-nowrap vdb-c-rounded-full vdb-c-bg-[#EFEFEF] vdb-c-px-20 vdb-c-py-4"
          :class="{
            'soft-blink':
              index === activeIndex &&
              processIndex === step.processes.length - 1 &&
              status !== 'success',
          }"
        >
          <component
            :is="getProcessIcon(process.process_name)"
            className="vdb-c-h-12 vdb-c-w-12"
            color="#000000"
          />

          <div class="vdb-c-flex vdb-c-items-baseline vdb-c-gap-6">
            <span
              class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-text-kilvish-900"
            >
              {{ process.process_name }}
            </span>
            <span
              class="vdb-c-font-mono vdb-c-text-[12px] vdb-c-font-normal vdb-c-text-kilvish-700"
            >
              {{ process.process_content }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ChevronDown from "../../icons/ChevronDown.vue";
import TargetIcon from "../../icons/TargetIcon.vue";
import ShuffleIcon from "../../icons/ShuffleIcon.vue";
import QuoteIcon from "../../icons/QuoteIcon.vue";
import CountdownTimerIcon from "../../icons/CountdownTimerIcon.vue";
import CrossCircledIcon from "../../icons/CrossCircledIcon.vue";
import MixerHorizontalIcon from "../../icons/MixerHorizontalIcon.vue";
import CircleBackslashIcon from "../../icons/CircleBackslashIcon.vue";
import CursorTextIcon from "../../icons/CursorTextIcon.vue";
import ActivityLogIcon from "../../icons/ActivityLogIcon.vue";
import RowsIcon from "../../icons/RowsIcon.vue";
import SearchIcon from "../../icons/SearchIcon.vue";

const props = defineProps({
  step: { type: Object, required: true },
  index: { type: Number, required: true },
  status: { type: String, required: true },
  activeIndex: { type: Number, required: true },
  isExpanded: { type: Boolean, required: true },
  toggle: { type: Function, required: true },
});

const getProcessIcon = (rawName) => {
  const name = (rawName || "").toString().toLowerCase().trim();
  if (name.includes("searching")) return CountdownTimerIcon;
  if (name.includes("search")) return SearchIcon;
  if (name.includes("paraphrases")) return RowsIcon;
  if (name.includes("paraphrasing")) return ShuffleIcon;
  if (name.includes("paraphrase")) return QuoteIcon;
  if (name.includes("intent")) return TargetIcon;
  if (name.includes("diagnosis")) return ActivityLogIcon;
  if (name.includes("joiner")) return MixerHorizontalIcon;
  if (name.includes("empty")) return CircleBackslashIcon;
  if (name.includes("query")) return CursorTextIcon;
  if (name.includes("no") || name.includes("no result"))
    return CrossCircledIcon;
  return SearchIcon;
};
</script>

<style scoped>
@keyframes softBlink {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
.soft-blink {
  animation: softBlink 1.8s ease-in-out infinite;
}
</style>
