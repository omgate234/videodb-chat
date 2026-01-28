<template>
  <Teleport to="body">
    <div v-if="isOpen" class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-40" @click="$emit('close')"></div>
    <div
      v-if="isOpen"
      ref="dropdownRef"
      class="vdb-c-fixed vdb-c-z-50 vdb-c-flex vdb-c-min-w-[148px] vdb-c-flex-col vdb-c-gap-[2px] vdb-c-rounded-12 vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-p-8 vdb-c-shadow-[0px_23px_6px_0px_rgba(0,0,0,0),0px_15px_6px_0px_rgba(0,0,0,0.01),0px_8px_5px_0px_rgba(0,0,0,0.02),0px_4px_4px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.03)]"
      :style="{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }"
      @click.stop
    >
      <button
        v-for="agent in agents"
        :key="agent.name"
        :disabled="agent.disabled"
        @click="handleAgentClick(agent)"
        :class="[
          'group vdb-c-group vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200',
          agent.disabled && 'vdb-c-cursor-not-allowed',
          isAgentSelected(agent)
            ? 'vdb-c-bg-[#FFE9D3]'
            : 'hover:vdb-c-bg-[#EFEFEF]',
        ]"
      >
        <Tooltip
          v-if="agent.disabled"
          class="vdb-c-absolute vdb-c-left-[87.5%] vdb-c-top-0 vdb-c-hidden group-hover:vdb-c-block"
          text="Add or generate videos in your collection to enable this"
        />
        <component
          :is="agent.icon"
          :class="[
            'vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0',
            agent.disabled
              ? 'vdb-c-text-[#969696]'
              : isAgentSelected(agent)
                ? 'vdb-c-text-[#821F0C]'
                : 'vdb-c-text-vdb-darkishgrey',
          ]"
        />
        <span
          :class="[
            'vdb-c-flex-1 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5',
            agent.disabled
              ? 'vdb-c-text-[#969696]'
              : isAgentSelected(agent)
                ? 'vdb-c-text-[#821F0C]'
                : 'vdb-c-text-vdb-darkishgrey',
          ]"
        >
          {{ agent.name }}
        </span>
        <!-- Checkmark for selected agents -->
        <svg
          v-if="isAgentSelected(agent)"
          class="vdb-c-h-16 vdb-c-w-16 vdb-c-flex-shrink-0 vdb-c-text-[#821F0C]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted, computed } from 'vue';
import Tooltip from '../../../chat/v2/elements/Tooltip.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  triggerElement: {
    type: Object,
    default: null,
  },
  agents: {
    type: Array,
    default: () => [],
  },
  selectedAgents: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close', 'agent-select']);

const position = ref({ top: 0, left: 0 });
const dropdownRef = ref(null);

const isAgentSelected = (agent) => {
  return props.selectedAgents.some((a) => a.name === agent.name);
};

const updatePosition = () => {
  if (props.triggerElement) {
    try {
      const rect = props.triggerElement.getBoundingClientRect();
      const gap = 8;

      position.value = {
        top: rect.bottom + gap,
        left: rect.left,
      };

      nextTick(() => {
        if (dropdownRef.value) {
          const dropdownRect = dropdownRef.value.getBoundingClientRect();
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          // Adjust horizontal position if needed
          if (position.value.left + dropdownRect.width > windowWidth) {
            position.value.left = rect.right - dropdownRect.width;
          }
          if (position.value.left < 0) {
            position.value.left = rect.left;
          }

          // Adjust vertical position if needed
          if (position.value.top + dropdownRect.height > windowHeight) {
            position.value.top = rect.top - dropdownRect.height - gap;
          }
        }
      });
    } catch (error) {
      console.warn('Error calculating position:', error);
    }
  }
};

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      updatePosition();
    }
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      window.addEventListener('resize', updatePosition);
    } else {
      window.removeEventListener('resize', updatePosition);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  window.removeEventListener('resize', updatePosition);
});

const handleAgentClick = (agent) => {
  if (!agent.disabled) {
    emit('agent-select', agent);
    // Don't close dropdown to allow multiple selection
  }
};
</script>
