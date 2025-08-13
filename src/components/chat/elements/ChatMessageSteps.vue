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
        <div
          class="vdb-c-flex vdb-c-flex-col vdb-c-gap-12 vdb-c-overflow-y-auto"
        >
          <div
            v-for="(step, index) in displaySteps"
            :key="index"
            class="vdb-c-flex vdb-c-flex-col vdb-c-gap-8"
          >
            <!-- String Action -->
            <div
              v-if="typeof step === 'string'"
              class="vdb-c-flex vdb-c-items-center vdb-c-gap-8"
            >
              <span
                class="vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-items-center vdb-c-justify-center"
              >
                <span
                  v-if="index !== displaySteps.length - 1"
                  class="vdb-c-text-[#D9D9D9]"
                  >|</span
                >
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
                :class="{
                  'vdb-c-font-semibold vdb-c-text-[#0075FF]':
                    index === displaySteps.length - 1,
                  'vdb-c-font-semibold vdb-c-text-green':
                    status === 'success' && index === displaySteps.length - 1,
                  'vdb-c-font-medium vdb-c-text-kilvish-800': !(
                    status === 'success' && index === displaySteps.length - 1
                  ),
                }"
                v-html="
                  step.replace(
                    /@(\w+)/g,
                    '<span class=\'vdb-c-text-orange-500\'>@$1</span>',
                  )
                "
              >
              </span>
            </div>

            <!-- Process Action -->
            <div
              v-else-if="step.type === 'process'"
              class="vdb-c-flex vdb-c-flex-col vdb-c-gap-8"
            >
              <!-- Process Header with chevron toggle -->
              <button
                type="button"
                class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-8 vdb-c-bg-transparent vdb-c-text-left"
                @click="toggleProcess(index)"
              >
                <span
                  class="vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-items-center vdb-c-justify-center"
                >
                  <span
                    v-if="index !== displaySteps.length - 1"
                    class="vdb-c-text-[#D9D9D9]"
                    >|</span
                  >
                  <div
                    v-else
                    class="vdb-c-block vdb-c-h-1/2 vdb-c-w-10 vdb-c-rounded-full"
                    :class="
                      index !== displaySteps.length - 1
                        ? 'vdb-c-animate-pulse vdb-c-bg-orange-500'
                        : 'vdb-c-bg-[#0AA910]'
                    "
                  ></div>
                </span>
                <span
                  class="vdb-c-flex-grow vdb-c-font-semibold"
                  :class="{
                    'vdb-c-text-green': index === displaySteps.length - 1,
                    'vdb-c-text-kilvish-800': !(
                      index ===
                      displaySteps.length - 1
                    ),
                  }"
                >
                  {{ step.title }}
                </span>
                <ChevronDown
                  class="vdb-c-ml-auto"
                  :class="{
                    'vdb-c-rotate-180 vdb-c-transform':
                      isProcessExpanded(index),
                  }"
                  :stroke-width="2"
                  :stroke-color="'#343E4F'"
                />
              </button>

              <!-- Process Sub-steps -->
              <div
                v-if="isProcessExpanded(index)"
                class="vdb-c-ml-28 vdb-c-flex vdb-c-flex-col vdb-c-gap-8"
              >
                <div
                  v-for="(process, processIndex) in step.processes"
                  :key="processIndex"
                >
                  <!-- Pill -->
                  <div
                    class="vdb-c-w-full vdb-c-rounded-full vdb-c-bg-[#EFEFEF] vdb-c-px-16 vdb-c-py-10"
                    :class="{
                      'soft-blink':
                        index === displaySteps.length - 1 &&
                        processIndex === step.processes.length - 1,
                    }"
                  >
                    <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
                      <!-- Icon placeholder intentionally omitted per spec -->
                      <div class="vdb-c-flex vdb-c-flex-wrap vdb-c-gap-6">
                        <span
                          class="vdb-c-font-semibold vdb-c-text-kilvish-900"
                        >
                          {{ process.process_name }}
                        </span>
                        <span class="vdb-c-text-kilvish-700">
                          {{ process.process_content }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import ChevronDown from "../../icons/ChevronDown.vue";

const props = defineProps({
  steps: {
    type: Array,
    default: () => [],
  },
  status: {
    type: String,
    default: "progress",
  },
  expanded: {
    type: Boolean,
    default: false,
  },
});

const isExpanded = ref(props.expanded);
const expandedProcesses = ref(new Set());
const lastStepsLength = ref(0);

const displaySteps = computed(() => {
  if (props.steps.length === 0) {
    return ["Thinking"];
  }
  if (props.status === "success") {
    return [...props.steps, "Final cut ready!"];
  }
  return props.steps;
});

watch(
  () => props.expanded,
  (newValue) => {
    if (!newValue) {
      isExpanded.value = false;
    }
  },
);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const toggleProcess = (stepIndex) => {
  const next = new Set(expandedProcesses.value);
  if (next.has(stepIndex)) {
    next.delete(stepIndex);
  } else {
    next.add(stepIndex);
  }
  expandedProcesses.value = next;
};

const isProcessExpanded = (stepIndex) => {
  return expandedProcesses.value.has(stepIndex);
};

// Open process sections by default; keep user-collapsed items closed, only auto-open new ones
watch(
  () => displaySteps.value,
  (steps) => {
    const startIndex = lastStepsLength.value === 0 ? 0 : lastStepsLength.value;
    const next = new Set(expandedProcesses.value);
    for (let i = startIndex; i < steps.length; i++) {
      const s = steps[i];
      if (s && typeof s === "object" && s.type === "process") {
        next.add(i);
      }
    }
    expandedProcesses.value = next;
    lastStepsLength.value = steps.length;
  },
  { immediate: true },
);
</script>

<style scoped>
.vdb-c-text-orange-500 {
  color: #f97316;
}
.vdb-c-text-green-500 {
  color: #22c55e;
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
