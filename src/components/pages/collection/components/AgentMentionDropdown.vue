<template>
  <Teleport to="body">
    <div
      v-if="isOpen && filteredAgents.length > 0"
      ref="dropdownRef"
      data-agent-mention-dropdown
      class="vdb-c-fixed vdb-c-z-[100] vdb-c-flex vdb-c-min-w-[180px] vdb-c-max-w-[280px] vdb-c-flex-col vdb-c-rounded-12 vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-p-8 vdb-c-shadow-[0px_23px_6px_0px_rgba(0,0,0,0),0px_15px_6px_0px_rgba(0,0,0,0.01),0px_8px_5px_0px_rgba(0,0,0,0.02),0px_4px_4px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.03)]"
      :style="{
        bottom: `${position.bottom}px`,
        left: `${position.left}px`,
      }"
    >
      <div class="vdb-c-mb-4 vdb-c-px-10 vdb-c-py-4 vdb-c-text-[11px] vdb-c-font-medium vdb-c-uppercase vdb-c-tracking-wide vdb-c-text-[#969696]">
        Agents
      </div>
      <!-- Scrollable container for agents - max height for ~4 items -->
      <div
        ref="scrollContainerRef"
        class="agent-mention-scroll vdb-c-flex vdb-c-max-h-[176px] vdb-c-flex-col vdb-c-gap-[2px] vdb-c-overflow-y-auto"
      >
        <button
          v-for="(agent, index) in filteredAgents"
          :key="agent.name"
          :data-index="index"
          :disabled="agent.disabled"
          @click="handleAgentClick(agent)"
          @mouseenter="$emit('highlight', index)"
          :class="[
            'agent-mention-item group vdb-c-group vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200',
            agent.disabled && 'vdb-c-cursor-not-allowed',
            index === highlightedIndex
              ? 'vdb-c-bg-[#FFE9D3]'
              : 'hover:vdb-c-bg-[#EFEFEF]',
          ]"
        >
          <Tooltip
            v-if="agent.disabled"
            class="vdb-c-absolute vdb-c-left-[87.5%] vdb-c-top-0 vdb-c-hidden group-hover:vdb-c-block"
            text="Add or generate videos in your collection to enable this"
          />
          <span
            :class="[
              'vdb-c-font-medium',
              index === highlightedIndex ? 'vdb-c-text-[#821F0C]' : 'vdb-c-text-[#EC5B16]',
            ]"
          >
            @
          </span>
          <component
            :is="agent.icon"
            :class="[
              'vdb-c-h-18 vdb-c-w-18 vdb-c-flex-shrink-0',
              agent.disabled
                ? 'vdb-c-text-[#969696]'
                : index === highlightedIndex
                  ? 'vdb-c-text-[#821F0C]'
                  : 'vdb-c-text-vdb-darkishgrey',
            ]"
          />
          <span
            :class="[
              'vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5',
              agent.disabled
                ? 'vdb-c-text-[#969696]'
                : index === highlightedIndex
                  ? 'vdb-c-text-[#821F0C]'
                  : 'vdb-c-text-vdb-darkishgrey',
            ]"
          >
            {{ agent.name }}
          </span>
        </button>
      </div>
      <div
        v-if="filteredAgents.length === 0"
        class="vdb-c-px-10 vdb-c-py-8 vdb-c-text-[13px] vdb-c-text-[#969696]"
      >
        No matching agents
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import Tooltip from '../../../chat/v2/elements/Tooltip.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Object,
    default: () => ({ bottom: 0, left: 0 }),
  },
  agents: {
    type: Array,
    default: () => [],
  },
  selectedAgents: {
    type: Array,
    default: () => [],
  },
  query: {
    type: String,
    default: '',
  },
  highlightedIndex: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['select', 'close', 'highlight']);

const dropdownRef = ref(null);
const scrollContainerRef = ref(null);

// Filter agents: exclude already selected and match query
const filteredAgents = computed(() => {
  const selectedNames = props.selectedAgents.map((a) => a.name);
  let available = props.agents.filter((agent) => !selectedNames.includes(agent.name));

  if (props.query) {
    available = available.filter((agent) =>
      agent.name.toLowerCase().includes(props.query.toLowerCase())
    );
  }

  return available;
});

// Scroll highlighted item into view when it changes
watch(
  () => props.highlightedIndex,
  (newIndex) => {
    nextTick(() => {
      // Query from body since component is teleported
      const dropdown = document.querySelector('[data-agent-mention-dropdown]');
      if (dropdown) {
        const item = dropdown.querySelector(`[data-index="${newIndex}"]`);
        if (item) {
          item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    });
  }
);

const handleAgentClick = (agent) => {
  if (!agent.disabled) {
    emit('select', agent);
  }
};

// Expose filteredAgents for parent component
defineExpose({
  filteredAgentsCount: computed(() => filteredAgents.value.length),
  filteredAgents,
});
</script>

<style scoped>
.agent-mention-scroll {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.agent-mention-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
