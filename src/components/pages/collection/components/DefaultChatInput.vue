<template>
  <div
    class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-10 vdb-c-rounded-20 vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-vdb-lightgrey vdb-c-px-10 vdb-c-pb-10 vdb-c-pt-10 vdb-c-shadow-[0px_0px_4px_0px_rgba(0,0,0,0.04),0px_0px_1px_0px_rgba(0,0,0,0.6)]"
  >
    <!-- Input Area -->
    <div
      class="vdb-c-flex vdb-c-w-full vdb-c-items-start vdb-c-gap-px vdb-c-pl-[4px] vdb-c-min-h-[72px]"
    >
      <textarea
        name="chat-input"
        v-model="inputText"
        :placeholder="placeholder"
        class="vdb-c-leading-24 vdb-c-min-h-0 vdb-c-flex-1 vdb-c-resize-none vdb-c-border-0 vdb-c-bg-transparent vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-vdb-darkishgrey vdb-c-placeholder-[#969696] vdb-c-outline-none"
        rows="1"
        @input="handleInput"
        @keydown.enter.exact.prevent="handleSend"
      ></textarea>
    </div>

    <!-- Actions Row -->
    <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6">
      <!-- Left Actions -->
      <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-6">
        <!-- Search Agent Button -->
        <button
          :disabled="searchAgent.disabled"
          @click="handleAgentClick(searchAgent)"
          :class="[
            'group vdb-c-group vdb-c-relative vdb-c-flex vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-full vdb-c-border vdb-c-px-[9px] vdb-c-py-8 vdb-c-transition-all',
            getAgentButtonClasses(searchAgent),
          ]"
        >
          <Tooltip
            v-if="searchAgent.disabled && !collectionHasVideos"
            text="Add or generate videos in your collection to enable this"
            class="vdb-c-absolute vdb-c-left-1/2 vdb-c-top-[calc(100%+15px)] vdb-c-hidden vdb-c-translate-x-[-50%] group-hover:vdb-c-block"
          />
          <SearchIcon
            :class="[
              'vdb-c-h-[16.667px] vdb-c-w-[16.667px] vdb-c-flex-shrink-0',
              getAgentIconClasses(searchAgent),
            ]"
          />
          <span :class="getAgentTextClasses(searchAgent)">
            Search
          </span>
          <CrossIcon
            v-if="isAgentSelected(searchAgent)"
            :fill="'#821F0C'"
            class="vdb-c-ml-4 vdb-c-h-[18px] vdb-c-w-[18px] vdb-c-flex-shrink-0"
          />
        </button>
      </div>

      <!-- Spacer -->
      <div class="vdb-c-flex-1"></div>

      <!-- Send Button -->
      <button
        @click="handleSend"
        :disabled="!canSend"
        :class="[
          'vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[50px] vdb-c-transition-all',
          getSendButtonClasses(),
        ]"
      >
        <SendButtonIcon :fill="getSendButtonFill()" />
      </button>
    </div>

    <SearchOptions
      v-if="selectedAgent?.name === 'Search'"
      :precision="additionalData.precision"
      :search-for="additionalData.searchFor"
      @update:precision="additionalData.precision = $event"
      @update:search-for="additionalData.searchFor = $event"
    />
  </div>
</template>
<script setup>
import { ref, computed, inject } from 'vue';
import SearchIcon from '../../../chat/v2/icons/agents/SearchIcon.vue';
import SendButtonIcon from '../../../chat/v2/icons/agents/SendButtonIcon.vue';
import CrossIcon from '../../../chat/v2/icons/CrossIcon.vue';
import Tooltip from '../../../chat/v2/elements/Tooltip.vue';
import SearchOptions from './SearchOptions.vue';

const props = defineProps({
  context: {
    type: Object,
    default: undefined,
  },
});

const context = inject('videodb-chat-context');

const collectionHasVideos = computed(() => {
  return (
    context?.activeCollectionVideos?.value?.length > 0 ||
    context?.activeCollectionVideos?.length > 0
  );
});

const inputText = ref('');
const selectedAgent = ref(null);
const additionalData = ref({
  precision: 'exact',
  searchFor: 'scenes',
});
const placeholder = computed(() => {
  if (context?.activeCollectionData?.value?.name) {
    return `Chat with ${context.activeCollectionData.value.name}`;
  }
  return 'Chat with Collection';
});

const searchAgent = computed(() => ({
  name: 'Search',
  icon: SearchIcon,
  disabled: !collectionHasVideos.value,
}));

const canSend = computed(() => {
  return inputText.value.trim().length > 0;
});

const isAgentSelected = (agent) => {
  return selectedAgent.value?.name === agent.name;
};

const getAgentButtonClasses = (agent) => {
  if (isAgentSelected(agent)) {
    return 'vdb-c-bg-[#FFE9D3] vdb-c-border-[#FFCFA5]';
  }
  if (agent.disabled) {
    return 'vdb-c-bg-roy vdb-c-border-[#DBDBDB] vdb-c-cursor-not-allowed';
  }
  return 'vdb-c-bg-white vdb-c-border-[rgba(13,13,13,0.1)] hover:vdb-c-bg-[#FFE9D3] hover:vdb-c-border-[#FFCFA5]';
};

const getAgentIconClasses = (agent) => {
  if (isAgentSelected(agent)) {
    return 'vdb-c-text-[#821F0C]';
  }
  if (agent.disabled) {
    return 'vdb-c-text-[#969696]';
  }
  return 'vdb-c-text-vdb-darkishgrey';
};

const getAgentTextClasses = (agent) => {
  if (isAgentSelected(agent)) {
    return 'vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-text-[#821F0C] vdb-c-whitespace-nowrap';
  }
  if (agent.disabled) {
    return 'vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-text-[#969696] vdb-c-whitespace-nowrap';
  }
  return 'vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-text-vdb-darkishgrey vdb-c-whitespace-nowrap';
};

const getSendButtonClasses = () => {
  if (!canSend.value) {
    return 'vdb-c-h-[36px] vdb-c-w-[36px] vdb-c-cursor-not-allowed';
  }
  return 'vdb-c-h-[36px] vdb-c-w-[36px]';
};

const getSendButtonFill = () => {
  if (!canSend.value) {
    return '#B9B9B9';
  }
  return '#EC5B16';
};

const handleAgentClick = (agent) => {
  if (agent.disabled) return;

  if (isAgentSelected(agent)) {
    selectedAgent.value = null;
  } else {
    selectedAgent.value = agent;
  }
};

const handleInput = (event) => {
  const textarea = event.target;
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, 72)}px`;
};

const handleSend = () => {
  if (!canSend.value) return;

  const additionalInfo =
    selectedAgent.value?.name === 'Search'
      ? {
          precision: additionalData.value.precision,
          searchFor: additionalData.value.searchFor,
        }
      : null;

  if (context?.handleAddMessage) {
    const messageData = {
      text: inputText.value,
      agents: selectedAgent.value ? [selectedAgent.value.name] : [],
      files: [],
      uploaded_files: [],
      additionalInfo: additionalInfo,
    };

    context.handleAddMessage(messageData);
  }

  inputText.value = '';
  selectedAgent.value = null;
  additionalData.value = {
    precision: 'exact',
    searchFor: 'scenes',
  };
};
</script>
