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
            class="vdb-c-flex vdb-c-flex-col vdb-c-gap-12"
          >
            <!-- String Action -->
            <div
              v-if="typeof step === 'string'"
              class="vdb-c-flex vdb-c-items-center vdb-c-gap-8"
            >
              <span
                class="vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-items-center vdb-c-justify-center"
              >
                <StatusComplete
                  v-if="index !== displaySteps.length - 1"
                  class="vdb-c-h-16 vdb-c-w-16"
                />
                <StatusProcessing
                  v-else-if="status !== 'success'"
                  class="vdb-c-h-16 vdb-c-w-16"
                />
                <StatusComplete v-else class="vdb-c-h-16 vdb-c-w-16" />
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
              />
            </div>

            <!-- Process Action -->
            <div
              v-else-if="step.type === 'process'"
              class="vdb-c-flex vdb-c-flex-col vdb-c-gap-12"
            >
              <!-- Process Header -->
              <button
                type="button"
                class="vdb-c-flex vdb-c-w-fit vdb-c-items-center vdb-c-gap-8 vdb-c-bg-transparent vdb-c-text-left"
                @click="toggleProcess(index)"
              >
                <span
                  class="vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-items-center vdb-c-justify-center"
                >
                  <StatusComplete
                    v-if="index !== displaySteps.length - 1"
                    class="vdb-c-h-16 vdb-c-w-16"
                  />
                  <StatusProcessing
                    v-else-if="status !== 'success'"
                    class="vdb-c-h-16 vdb-c-w-16"
                  />
                  <StatusComplete v-else class="vdb-c-h-16 vdb-c-w-16" />
                </span>

                <!-- title: 16px / 500 -->
                <span
                  class="vdb-c-w-fit vdb-c-text-[16px] vdb-c-font-medium vdb-c-text-kilvish-800"
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

              <!-- Process Sub-steps (no indent per spec) -->
              <div
                v-if="isProcessExpanded(index)"
                class="vdb-c-flex vdb-c-flex-col vdb-c-gap-12"
              >
                <div
                  v-for="(process, processIndex) in step.processes"
                  :key="processIndex"
                >
                  <!-- Pill (content-width, not full width) -->
                  <div
                    class="vdb-c-ml-28 vdb-c-inline-flex vdb-c-items-center vdb-c-gap-6 vdb-c-self-start vdb-c-whitespace-nowrap vdb-c-rounded-full vdb-c-bg-[#EFEFEF] vdb-c-px-20 vdb-c-py-4"
                    :class="{
                      'soft-blink':
                        index === displaySteps.length - 1 &&
                        processIndex === step.processes.length - 1,
                    }"
                  >
                    <!-- placeholder icon: Search icon -->
                    <SearchIcon
                      className="vdb-c-h-12 vdb-c-w-12"
                      color="#000000"
                    />

                    <div class="vdb-c-flex vdb-c-items-baseline vdb-c-gap-6">
                      <!-- process_name: 13px / 500 -->
                      <span
                        class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-text-kilvish-900"
                      >
                        {{ process.process_name }}
                      </span>

                      <!-- process_content: code font 12px / 400 -->
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
            <!-- /Process Action -->
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import ChevronDown from "../../icons/ChevronDown.vue";
import StatusProcessing from "../../icons/StatusProcessing.vue";
import StatusComplete from "../../icons/StatusComplete.vue";
import SearchIcon from "../../icons/SearchIcon.vue";

const props = defineProps({
  steps: { type: Array, default: () => [] },
  status: { type: String, default: "progress" },
  expanded: { type: Boolean, default: false },
});

const isExpanded = ref(props.expanded);
const expandedProcesses = ref(new Set());
const lastStepsLength = ref(0);

const displaySteps = computed(() => {
  if (props.steps.length === 0) return ["Thinking.."];
  if (props.status === "success") return [...props.steps, "Final cut ready!"];
  return props.steps;
});

// keep parent in control for both open and close
watch(
  () => props.expanded,
  (v) => {
    isExpanded.value = v;
  },
);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};
const toggleProcess = (i) => {
  const next = new Set(expandedProcesses.value);
  next.has(i) ? next.delete(i) : next.add(i);
  expandedProcesses.value = next;
};
const isProcessExpanded = (i) => expandedProcesses.value.has(i);

// auto-open new process sections only
watch(
  () => displaySteps.value,
  (steps) => {
    const startIndex = lastStepsLength.value === 0 ? 0 : lastStepsLength.value;
    const next = new Set(expandedProcesses.value);
    for (let i = startIndex; i < steps.length; i++) {
      const s = steps[i];
      if (s && typeof s === "object" && s.type === "process") next.add(i);
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
