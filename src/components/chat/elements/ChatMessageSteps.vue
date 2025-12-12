<template>
  <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-16">
    <button
      @click="toggleExpand"
      class="vdb-c-focus:outline-none vdb-c-flex vdb-c-items-center vdb-c-gap-8"
    >
      <ChevronDown
        :class="{ 'vdb-c-rotate-180 vdb-c-transform': isExpanded }"
        :stroke-width="2"
        :stroke-color="'#343E4F'"
      />
      <span class="vdb-c-font-medium vdb-c-text-black">Director's Log</span>
    </button>

    <transition
      enter-active-class="vdb-c-transition-all vdb-c-duration-300 vdb-c-ease-out"
      enter-from-class="vdb-c-transform vdb-c-scale-95 vdb-c-opacity-0"
      enter-to-class="vdb-c-transform vdb-c-scale-100 vdb-c-opacity-100"
      leave-active-class="vdb-c-transition-all vdb-c-duration-300 vdb-c-ease-in"
      leave-from-class="vdb-c-transform vdb-c-scale-100 vdb-c-opacity-100"
      leave-to-class="vdb-c-transform vdb-c-scale-95 vdb-c-opacity-0"
    >
      <div
        v-if="isExpanded"
        class="vdb-c-shadow-sm vdb-c-overflow-hidden vdb-c-rounded-md vdb-c-bg-white"
      >
        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-12 vdb-c-overflow-y-auto">
          <div
            v-for="(step, index) in displaySteps"
            :key="index"
            class="timeline-row vdb-c-grid vdb-c-grid-cols-[20px,1fr] vdb-c-gap-8"
          >
            <span class="vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-items-center vdb-c-justify-center">
              <span v-if="index !== displaySteps.length - 1" class="vdb-c-text-[#D9D9D9]">|</span>
              <div
                v-else
                class="vdb-c-block vdb-c-h-1/2 vdb-c-w-10 vdb-c-rounded-full"
                :class="
                  status === 'progress'
                    ? 'vdb-c-animate-pulse vdb-c-bg-orange-500'
                    : status === 'success'
                      ? 'vdb-c-bg-[#0AA910]'
                      : 'vdb-c-bg-[#0075FF]'
                "
              ></div>
            </span>
            <span
              class="vdb-c-flex-grow"
              :class="
                status !== 'success' && status !== 'progress' && index === displaySteps.length - 1
                  ? 'vdb-c-font-semibold vdb-c-text-[#0075FF]'
                  : status === 'success' &&
                      index === displaySteps.length - 1 &&
                      has_text_content !== -1
                    ? 'vdb-c-font-semibold vdb-c-text-green'
                    : 'vdb-c-font-medium vdb-c-text-kilvish-800'
              "
              v-html="step.replace(/@(\w+)/g, '<span class=\'vdb-c-text-orange-500\'>@$1</span>')"
            >
            </span>
          </div>
          <!-- /Steps -->
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import ChevronDown from '../../icons/ChevronDown.vue';

const props = defineProps({
  has_text_content: {
    type: Number,
    default: -1,
  },
  steps: {
    type: Array,
    default: () => [],
  },
  status: {
    type: String,
    default: 'progress',
  },
  expanded: {
    type: Boolean,
    default: false,
  },
});

const isExpanded = ref(props.expanded);
const expandedProcesses = ref(new Set());
const lastStepsLength = ref(0);

const activeIndex = computed(() => displaySteps.value.length - 1);

// ---- timeline rail measurement ----
const timelineEl = ref(null);
const bulletRefs = ref([]);
const railLeft = ref(10); // x-position of rail (center of bullet column)
const railStart = ref(0); // px from top of container to the first dot center
const railLength = ref(0); // px from first dot center to active dot center
let delayedMeasureTimeout = null;

const setBulletRef = (idx) => (el) => {
  if (!el) return;
  bulletRefs.value[idx] = el;
};

const measureRail = () => {
  // ensure DOM + paint done (handles "Final cut" insertion)
  nextTick(() => {
    requestAnimationFrame(() => {
      const container = timelineEl.value;
      const first = bulletRefs.value[0];
      const active = bulletRefs.value[activeIndex.value];
      if (!container || !first || !active) return;

      const crect = container.getBoundingClientRect();
      const f = first.getBoundingClientRect();
      const a = active.getBoundingClientRect();

      // horizontal center of the bullet
      railLeft.value = f.left - crect.left + f.width / 2;

      const start = f.top - crect.top + f.height / 2;
      const end = a.top - crect.top + a.height / 2;

      railStart.value = Math.min(start, end);
      railLength.value = Math.abs(end - start);
    });
  });
};

// keep parent in control for both open and close
watch(
  () => props.expanded,
  (newValue) => {
    if (!newValue) {
      isExpanded.value = false;
    }
  }
);

// auto-open new process sections only
watch(
  () => displaySteps.value,
  (steps) => {
    const startIndex = lastStepsLength.value === 0 ? 0 : lastStepsLength.value;
    const next = new Set(expandedProcesses.value);
    for (let i = startIndex; i < steps.length; i++) {
      const s = steps[i];
      if (s && typeof s === 'object' && s.type === 'process') next.add(i);
    }
    expandedProcesses.value = next;
    lastStepsLength.value = steps.length;

    measureRail();

    // If final cut gets appended (status === 'success'), schedule a
    // follow-up measure after animations/layout settle
    if (props.status === 'success') {
      if (delayedMeasureTimeout) clearTimeout(delayedMeasureTimeout);
      delayedMeasureTimeout = setTimeout(() => {
        measureRail();
        delayedMeasureTimeout = null;
      }, 250);
    }
  },
  { immediate: true }
);

// re-measure when process sections toggle (heights change)
watch(expandedProcesses, measureRail, { deep: true });

// also re-measure on window resize
if (typeof window !== 'undefined') {
  window.addEventListener('resize', measureRail);
}

onMounted(() => {
  measureRail();
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', measureRail);
  }
  if (delayedMeasureTimeout) clearTimeout(delayedMeasureTimeout);
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  if (isExpanded.value) measureRail();
};

const displaySteps = computed(() => {
  if (props.steps.length === 0) {
    return ['Thinking'];
  }
  if (props.status === 'success' && props.has_text_content !== -1) {
    return [...props.steps, 'Final cut ready!'];
  }
  return props.steps;
});
</script>

<style scoped>
/* --- colors reused --- */
.vdb-c-text-orange-500 {
  color: #f97316;
}
.vdb-c-text-green-500 {
  color: #22c55e;
}

/* --- dotted rail --- */
.timeline-rail {
  position: absolute;
  inset: 0; /* cover the whole steps area */
  pointer-events: none;
  z-index: 0; /* sit behind bullets/content */
}

.timeline-rail-line {
  position: absolute;
  width: 2px;
  /* dotted effect that always "kisses" the last circle */
  background-image: repeating-linear-gradient(
    to bottom,
    #d1d5db 0,
    #d1d5db 4px,
    transparent 4px,
    transparent 8px
  );
  /* center 2px line on computed x */
  transform: translateX(-1px);
}

/* ensure bullets sit above the rail */
.bullet {
  position: relative;
  z-index: 1;
}

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
