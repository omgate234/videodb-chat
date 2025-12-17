<template>
  <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-12">
    <!-- Process Header -->
    <button
      type="button"
      class="vdb-c-flex vdb-c-w-fit vdb-c-items-center vdb-c-gap-8 vdb-c-bg-transparent vdb-c-text-left"
      @click="toggle && toggle()"
    >
      <!-- title: 16px / 500 -->
      <span class="vdb-c-w-fit vdb-c-text-[16px] vdb-c-font-medium vdb-c-text-kilvish-800">
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
    <div
      v-if="isExpanded"
      ref="subStepsContainerEl"
      class="scrollbar-hidden vdb-c-flex vdb-c-max-h-[355px] vdb-c-flex-col vdb-c-gap-12 vdb-c-overflow-y-auto"
    >
      <div v-for="(process, processIndex) in step.processes" :key="processIndex">
        <div
          class="scrollbar-hidden vdb-c-relative vdb-c-inline-flex vdb-c-max-w-[65vw] vdb-c-items-center vdb-c-gap-6 vdb-c-self-start vdb-c-whitespace-nowrap vdb-c-rounded-full vdb-c-bg-[#EFEFEF] vdb-c-px-20 vdb-c-py-4 md:vdb-c-max-w-[50vw]"
          :class="{
            'soft-blink':
              index === activeIndex &&
              processIndex === step.processes.length - 1 &&
              status !== 'success',
          }"
        >
          <!-- icon -->
          <component
            :is="getProcessIcon(process.process_name)"
            className="!vdb-c-size-12 vdb-c-min-h-12 vdb-c-min-w-12 vdb-c-text-black"
            color="#000000"
          />

          <!-- left: fixed name -->
          <span class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-text-kilvish-900">
            {{ process.process_name }}
          </span>

          <!-- right: ONLY content scrolls -->
          <div
            ref="contentEls"
            class="scrollbar-hidden vdb-c-flex-1 vdb-c-overflow-x-auto vdb-c-whitespace-nowrap"
            :class="{ 'shadow-right': showRightShadow[processIndex] }"
            @scroll="onContentScroll(processIndex)"
          >
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
import { ref, watch, nextTick, onMounted } from 'vue';
import ChevronDown from '../../icons/ChevronDown.vue';
import TargetIcon from '../../icons/TargetIcon.vue';
import ShuffleIcon from '../../icons/ShuffleIcon.vue';
import QuoteIcon from '../../icons/QuoteIcon.vue';
import CountdownTimerIcon from '../../icons/CountdownTimerIcon.vue';
import CrossCircledIcon from '../../icons/CrossCircledIcon.vue';
import MixerHorizontalIcon from '../../icons/MixerHorizontalIcon.vue';
import CircleBackslashIcon from '../../icons/CircleBackslashIcon.vue';
import CursorTextIcon from '../../icons/CursorTextIcon.vue';
import ActivityLogIcon from '../../icons/ActivityLogIcon.vue';
import RowsIcon from '../../icons/RowsIcon.vue';
import SearchIcon from '../../icons/SearchIcon.vue';
import ObjectIcon from '../../icons/ObjectIcon.vue';

const props = defineProps({
  step: { type: Object, required: true },
  index: { type: Number, required: true },
  status: { type: String, required: true },
  activeIndex: { type: Number, required: true },
  isExpanded: { type: Boolean, default: false },
  toggle: { type: Function, default: () => {} },
});

const subStepsContainerEl = ref(null);

const contentEls = ref([]);
const showRightShadow = ref([]);

const updateShadowForEl = (el, idx) => {
  if (!el) return;
  const { scrollWidth, clientWidth, scrollLeft } = el;
  if (scrollWidth <= clientWidth) {
    showRightShadow.value[idx] = false;
    return;
  }
  const atRight = Math.ceil(scrollLeft + clientWidth) >= scrollWidth;
  showRightShadow.value[idx] = !atRight;
};

const initShadows = () => {
  showRightShadow.value = props.step.processes.map(() => false);
  nextTick(() => {
    contentEls.value.forEach((el, idx) => updateShadowForEl(el, idx));
  });
};

const onContentScroll = (idx) => {
  const el = contentEls.value[idx];
  if (!el) return;
  updateShadowForEl(el, idx);
};

const scrollSubStepsToBottom = () => {
  const el = subStepsContainerEl.value;
  if (!el) return;
  try {
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  } catch (e) {
    el.scrollTop = el.scrollHeight;
  }
};

const queueAutoScroll = () => {
  nextTick(() => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(scrollSubStepsToBottom);
    } else {
      scrollSubStepsToBottom();
    }
  });
};

watch(
  () => props.isExpanded,
  (expanded) => {
    if (expanded) {
      queueAutoScroll();
      initShadows();
    }
  },
  { immediate: false }
);

watch(
  () => props.step?.processes,
  () => {
    if (props.isExpanded) {
      queueAutoScroll();
      initShadows();
    }
  },
  { deep: true }
);

onMounted(() => {
  initShadows();
});

const getProcessIcon = (rawName) => {
  const name = (rawName || '').toString().toLowerCase().trim();
  if (name.includes('searching')) return CountdownTimerIcon;
  if (name.includes('search')) return SearchIcon;
  if (name.includes('paraphrases')) return RowsIcon;
  if (name.includes('paraphrasing')) return ShuffleIcon;
  if (name.includes('paraphrase')) return QuoteIcon;
  if (name.includes('intent')) return TargetIcon;
  if (name.includes('diagnosis')) return ActivityLogIcon;
  if (name.includes('joiner')) return MixerHorizontalIcon;
  if (name.includes('empty')) return CircleBackslashIcon;
  if (name.includes('query')) return CursorTextIcon;
  if (name.includes('no') || name.includes('no result')) return CrossCircledIcon;
  return ObjectIcon;
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

.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
  height: 0;
  width: 0;
}

.shadow-right::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 40px;
  background: linear-gradient(to left, rgba(255, 255, 255, 0.9), transparent);
  pointer-events: none;
}
</style>
