<template>
  <div
    class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-20 vdb-c-py-14 vdb-c-text-left"
  >
    <LoadingMessage
      :status="content.status"
      :message="content.status_message"
      :is-last-conv="isLastConv"
    />

    <transition name="fade" mode="out-in">
      <div
        v-if="content.status === 'success' || content.status === 'progress'"
        class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-16"
      >
        <!-- Goal Header -->
        <div
          v-if="content.goal"
          class="vdb-c-flex vdb-c-flex-col vdb-c-gap-8 vdb-c-rounded-12 vdb-c-border vdb-c-border-gray-300 vdb-c-bg-white vdb-c-p-16"
        >
          <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
            <TargetIcon class="vdb-c-h-20 vdb-c-w-20 vdb-c-text-vdb-orange" />
            <h3
              class="vdb-c-text-[16px] vdb-c-font-semibold vdb-c-leading-[24px] vdb-c-text-[#1E1E1E]"
            >
              Goal
            </h3>
          </div>
          <p class="vdb-c-text-[14px] vdb-c-font-normal vdb-c-leading-[22px] vdb-c-text-[#525252]">
            {{ content.goal }}
          </p>
        </div>

        <!-- Steps List -->
        <div
          v-if="content.steps && content.steps.length > 0"
          class="vdb-c-flex vdb-c-flex-col vdb-c-gap-12"
        >
          <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
            <h4
              class="vdb-c-text-[14px] vdb-c-font-semibold vdb-c-leading-[20px] vdb-c-text-[#1E1E1E]"
            >
              Execution Plan
            </h4>
            <span class="vdb-c-text-[13px] vdb-c-font-normal vdb-c-text-[#737373]">
              {{ completedSteps }} / {{ totalSteps }} completed
            </span>
          </div>

          <div class="vdb-c-relative vdb-c-flex vdb-c-flex-col vdb-c-gap-0">
            <div
              v-for="(step, index) in content.steps"
              :key="index"
              class="vdb-c-relative vdb-c-flex vdb-c-gap-16"
            >
              <!-- Vertical Line Connector -->
              <div
                v-if="index < content.steps.length - 1"
                class="vdb-c-absolute vdb-c-left-[11px] vdb-c-top-[32px] vdb-c-h-full vdb-c-w-[2px]"
                :class="getConnectorClass(step.status, content.steps[index + 1]?.status)"
              ></div>

              <!-- Step Icon -->
              <div class="vdb-c-relative vdb-c-z-10 vdb-c-flex vdb-c-shrink-0 vdb-c-pt-4">
                <div
                  class="vdb-c-flex vdb-c-h-24 vdb-c-w-24 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-border-2"
                  :class="getStepIconClass(step.status)"
                >
                  <SpinnerIcon v-if="step.status === 'in_progress'" class="vdb-c-h-14 vdb-c-w-14" />
                  <CheckIcon
                    v-else-if="step.status === 'completed'"
                    class="vdb-c-h-12 vdb-c-w-12 vdb-c-text-white"
                  />
                  <CrossIcon
                    v-else-if="step.status === 'failed'"
                    class="vdb-c-h-12 vdb-c-w-12 vdb-c-text-white"
                  />
                  <span
                    v-else
                    class="vdb-c-text-[11px] vdb-c-font-medium"
                    :class="step.status === 'pending' ? 'vdb-c-text-[#A3A3A3]' : 'vdb-c-text-white'"
                  >
                    {{ step.step_number }}
                  </span>
                </div>
              </div>

              <!-- Step Content -->
              <div
                class="vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-gap-6 vdb-c-pb-20"
                :class="{ 'vdb-c-pb-12': index === content.steps.length - 1 }"
              >
                <!-- Operation and Status Badge -->
                <div
                  class="vdb-c-flex vdb-c-items-start vdb-c-justify-between vdb-c-gap-12 vdb-c-pt-2"
                >
                  <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-4">
                    <h5
                      class="vdb-c-text-[14px] vdb-c-font-semibold vdb-c-leading-[20px]"
                      :class="getStepTextClass(step.status)"
                    >
                      {{ step.operation }}
                    </h5>
                    <p
                      v-if="step.description"
                      class="vdb-c-text-[13px] vdb-c-font-normal vdb-c-leading-[18px] vdb-c-text-[#737373]"
                    >
                      {{ step.description }}
                    </p>
                  </div>

                  <!-- Status Badge -->
                  <div
                    class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-6 vdb-c-px-8 vdb-c-py-4"
                    :class="getStatusBadgeClass(step.status)"
                  >
                    <span class="vdb-c-text-[11px] vdb-c-font-medium vdb-c-capitalize">
                      {{ getStatusLabel(step.status) }}
                    </span>
                  </div>
                </div>

                <!-- Result (for completed steps) -->
                <div
                  v-if="step.status === 'completed' && step.result"
                  class="vdb-c-rounded-8 vdb-c-border vdb-c-border-[#E5E7EB] vdb-c-bg-[#F9FAFB] vdb-c-p-12"
                >
                  <div class="vdb-c-flex vdb-c-items-start vdb-c-gap-8">
                    <InfoIcon
                      class="vdb-c-mt-2 vdb-c-h-14 vdb-c-w-14 vdb-c-shrink-0 vdb-c-text-[#0AA910]"
                    />
                    <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-4">
                      <span class="vdb-c-text-[12px] vdb-c-font-medium vdb-c-text-[#374151]">
                        Result
                      </span>
                      <p
                        class="vdb-c-text-[12px] vdb-c-font-normal vdb-c-leading-[18px] vdb-c-text-[#6B7280]"
                      >
                        {{ step.result }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Reason (for failed steps) -->
                <div
                  v-if="step.status === 'failed' && step.reason"
                  class="vdb-c-rounded-8 vdb-c-border vdb-c-border-[#FEE2E2] vdb-c-bg-[#FEF2F2] vdb-c-p-12"
                >
                  <div class="vdb-c-flex vdb-c-items-start vdb-c-gap-8">
                    <ErrorIcon
                      class="vdb-c-mt-2 vdb-c-h-14 vdb-c-w-14 vdb-c-shrink-0"
                      fill="#DC2626"
                    />
                    <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-4">
                      <span class="vdb-c-text-[12px] vdb-c-font-medium vdb-c-text-[#991B1B]">
                        Error
                      </span>
                      <p
                        class="vdb-c-text-[12px] vdb-c-font-normal vdb-c-leading-[18px] vdb-c-text-[#DC2626]"
                      >
                        {{ step.reason }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-12 vdb-c-rounded-12 vdb-c-border vdb-c-border-dashed vdb-c-border-gray-300 vdb-c-bg-gray-100 vdb-c-py-40"
        >
          <InfoIcon class="vdb-c-h-32 vdb-c-w-32 vdb-c-text-gray-400" />
          <p class="vdb-c-text-[14px] vdb-c-font-normal vdb-c-text-[#737373]">
            No steps available yet
          </p>
        </div>
      </div>

      <!-- Not Generated State -->
      <div v-else-if="content.status === 'not_generated'" class="vdb-c-flex vdb-c-flex-col"></div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import LoadingMessage from './elements/LoadingMessage.vue';
import SpinnerIcon from '../chat/v2/icons/SpinnerIcon.vue';
import CheckIcon from '../chat/v2/icons/CheckIcon.vue';
import CrossIcon from '../chat/v2/icons/CrossIcon.vue';
import ChevronRightIcon from '../chat/v2/icons/ChevronRightIcon.vue';
import InfoIcon from '../chat/v2/icons/InfoIcon.vue';
import ErrorIcon from '../chat/v2/icons/ErrorIcon.vue';
import TargetIcon from '../icons/TargetIcon.vue';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  isLastConv: {
    type: Boolean,
    default: false,
  },
});

const totalSteps = computed(() => props.content.steps?.length || 0);
const completedSteps = computed(
  () => props.content.steps?.filter((s) => s.status === 'completed').length || 0
);

const getStepIconClass = (status) => {
  switch (status) {
    case 'completed':
      return 'vdb-c-border-[#0AA910] vdb-c-bg-[#0AA910]';
    case 'in_progress':
      return 'vdb-c-border-vdb-orange vdb-c-bg-white';
    case 'failed':
      return 'vdb-c-border-[#DC2626] vdb-c-bg-[#DC2626]';
    case 'pending':
    default:
      return 'vdb-c-border-[#E5E7EB] vdb-c-bg-white';
  }
};

const getStepTextClass = (status) => {
  switch (status) {
    case 'completed':
      return 'vdb-c-text-[#1E1E1E]';
    case 'in_progress':
      return 'vdb-c-text-[#1E1E1E]';
    case 'failed':
      return 'vdb-c-text-[#DC2626]';
    case 'pending':
    default:
      return 'vdb-c-text-[#A3A3A3]';
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'completed':
      return 'vdb-c-border vdb-c-border-[#D1FAE5] vdb-c-bg-[#ECFDF5] vdb-c-text-[#065F46]';
    case 'in_progress':
      return 'vdb-c-border vdb-c-border-[#FED7AA] vdb-c-bg-[#FFF7ED] vdb-c-text-[#C2410C]';
    case 'failed':
      return 'vdb-c-border vdb-c-border-[#FECACA] vdb-c-bg-[#FEF2F2] vdb-c-text-[#991B1B]';
    case 'pending':
    default:
      return 'vdb-c-border vdb-c-border-[#E5E7EB] vdb-c-bg-[#F9FAFB] vdb-c-text-[#6B7280]';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'pending':
    default:
      return 'Pending';
  }
};

const getConnectorClass = (currentStatus, nextStatus) => {
  if (currentStatus === 'completed') {
    return 'vdb-c-bg-[#0AA910]';
  } else if (currentStatus === 'in_progress') {
    return 'vdb-c-bg-gradient-to-b vdb-c-from-vdb-orange vdb-c-to-[#E5E7EB]';
  } else if (currentStatus === 'failed') {
    return 'vdb-c-bg-[#DC2626]';
  }
  return 'vdb-c-bg-[#E5E7EB]';
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
