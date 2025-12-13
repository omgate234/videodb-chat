<template>
  <div
    class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[4px] vdb-c-rounded-8 vdb-c-bg-vdb-lightgrey vdb-c-px-8 vdb-c-py-6"
  >
    <span class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-[#1E1E1E]">
      {{ title }}
    </span>

    <div v-if="tooltipText" class="vdb-c-relative vdb-c-z-[10000] vdb-c-h-16 vdb-c-w-16">
      <Tooltip
        :class="[
          'vdb-c-absolute vdb-c-bottom-full vdb-c-left-1/2 vdb-c-z-[10000] vdb-c-mb-[4px] vdb-c-translate-x-[-50%]',
          isHovered ? 'vdb-c-block' : 'vdb-c-hidden',
        ]"
        :text="tooltipText"
      />
      <InfoIcon
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        :fill="isHovered ? '#1E1E1E' : '#969696'"
        class="vdb-c-h-16 vdb-c-w-16 vdb-c-transition-colors vdb-c-duration-100"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Tooltip from '../../../chat/v2/elements/Tooltip.vue';
import InfoIcon from '../../../chat/v2/icons/InfoIcon.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  tooltipText: {
    type: String,
    default: '',
  },
});

const isHovered = ref(false);
</script>
