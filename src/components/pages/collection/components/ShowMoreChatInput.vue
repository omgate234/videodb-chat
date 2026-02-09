<template>
  <div
    class="vdb-c-h-fit vdb-c-w-full vdb-c-border-t vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-20 vdb-c-py-10"
  >
    <div
      :class="[
        'vdb-c-relative vdb-c-w-full vdb-c-rounded-[26px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-10 vdb-c-py-[7px]',
      ]"
    >
      <textarea
        name="chat-input"
        v-if="selectedAgent !== null"
        v-model="inputText"
        type="text"
        class="vdb-c-chat-input vdb-c-mb-20 vdb-c-mt-12 vdb-c-max-h-[25vh] vdb-c-w-full vdb-c-bg-transparent vdb-c-px-10 vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[24px] vdb-c-text-vdb-darkishgrey vdb-c-placeholder-[#969696] vdb-c-outline-none focus:vdb-c-outline-none"
        rows="1"
        :placeholder="placeholder"
        autocomplete="off"
        @input="handleInput"
        @keydown.enter.exact.prevent="handleSend"
      ></textarea>
      <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-10">
        <textarea
          name="chat-input"
          v-if="selectedAgent === null"
          v-model="inputText"
          type="text"
          class="vdb-c-chat-input vdb-c-max-h-[25vh] vdb-c-bg-transparent vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-vdb-darkishgrey vdb-c-placeholder-[#969696] vdb-c-outline-none focus:vdb-c-outline-none"
          rows="1"
          :placeholder="placeholder"
          autocomplete="off"
          @input="handleInput"
          @keydown.enter.exact.prevent="handleSend"
        ></textarea>
        <div
          class="vdb-c-flex vdb-c-flex-grow vdb-c-items-center vdb-c-justify-start vdb-c-gap-8"
          v-if="selectedAgent !== null"
        >
          <button
            v-for="agent in [selectedAgent]"
            :key="agent.name"
            :disabled="agent.disabled"
            @click="handleAgentClick(agent)"
            :class="[
              'group vdb-c-group vdb-c-relative vdb-c-flex vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-full vdb-c-border vdb-c-px-[9px] vdb-c-py-8 vdb-c-transition-all',
              getAgentButtonClasses(agent),
            ]"
          >
            <Tooltip
              v-if="agent.disabled"
              text="Add or generate videos in your collection to enable this"
              class="vdb-c-absolute vdb-c-left-1/2 vdb-c-top-[calc(100%+15px)] vdb-c-hidden vdb-c-translate-x-[-50%] group-hover:vdb-c-block"
            />
            <component
              :is="agent.icon"
              :class="[
                'vdb-c-h-[16.667px] vdb-c-w-[16.667px] vdb-c-flex-shrink-0',
                getAgentIconClasses(agent),
              ]"
            />
            <span :class="getAgentTextClasses(agent)">
              {{ agent.name }}
            </span>
            <CrossIcon
              v-if="isAgentSelected(agent)"
              :fill="'#821F0C'"
              class="vdb-c-ml-4 vdb-c-h-[18px] vdb-c-w-[18px] vdb-c-flex-shrink-0"
            />
          </button>
          <button
            v-if="selectedAgent && selectedAgent.name?.toLowerCase() === 'search'"
            @click.stop="handleControlsToggle"
            ref="controlsButtonRef"
            :class="[
              'group vdb-c-group vdb-c-relative vdb-c-flex vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-full vdb-c-border vdb-c-px-[9px] vdb-c-py-8 vdb-c-transition-all',
              showSearchControlsPanel
                ? 'vdb-c-border-[#FFCFA5] vdb-c-bg-[#FFE9D3]'
                : 'vdb-c-border-roy vdb-c-bg-white hover:vdb-c-border-[#B9B9B9] hover:vdb-c-bg-[#EFEFEF]',
            ]"
          >
            <span
              :class="[
                showSearchControlsPanel ? 'vdb-c-text-[#821F0C]' : 'vdb-c-text-vdb-darkishgrey',
              ]"
              class="vdb-c-whitespace-nowrap vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[19.5px]"
            >
              Controls
            </span>
            <ChevronDown
              :class="[showSearchControlsPanel ? 'vdb-c-rotate-180' : '']"
              class="vdb-c-h-[16.667px] vdb-c-w-[16.667px] vdb-c-flex-shrink-0 vdb-c-transition-transform vdb-c-duration-200"
              :stroke-color="showSearchControlsPanel ? '#821F0C' : '#1F2937'"
            />

            <SearchControlsPanel
              v-if="showSearchControlsPanel"
              :precision="additionalData.precision"
              :search-for="additionalData.searchFor"
              :hide-videos-option="hasVideoId"
              @update:precision="additionalData.precision = $event"
              @update:search-for="additionalData.searchFor = $event"
            />
          </button>
        </div>

        <!-- Search Agent Button (shown when no agent selected) -->
        <button
          v-if="selectedAgent === null"
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
        </button>

        <div class="vdb-c-flex vdb-c-items-center">
          <button
            @click="handleSend"
            :disabled="!canSend"
            :class="[
              'vdb-c-flex vdb-c-size-[36px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-text-white vdb-c-transition',
              chatLoading ? 'vdb-c-bg-[#B9B9B9]' : '',
            ]"
            type="submit"
          >
            <AnimatedEllipsisIcon v-if="chatLoading" />
            <SendIcon
              v-else
              class-name="vdb-c-w-20 vdb-c-h-20"
              :fill="canSend ? '#EC5B16' : '#B9B9B9'"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch, onMounted, onUnmounted } from 'vue';
import SearchIcon from '../../../chat/v2/icons/agents/SearchIcon.vue';
import CrossIcon from '../../../chat/v2/icons/CrossIcon.vue';
import Tooltip from '../../../chat/v2/elements/Tooltip.vue';
import SendIcon from '../../../chat/v2/icons/SendIcon.vue';
import AnimatedEllipsisIcon from '../../../chat/v2/icons/AnimatedEllipsisIcon.vue';
import ChevronDown from '../../../icons/ChevronDown.vue';
import SearchControlsPanel from './SearchControlsPanel.vue';

const props = defineProps({
  context: {
    type: Object,
    default: undefined,
  },
  showLoadingState: {
    type: Boolean,
    default: false,
  },
});

const context = props.context || inject('videodb-chat-context', {});

const collectionHasVideos = computed(() => {
  return (
    context?.activeCollectionVideos?.value?.length > 0 ||
    context?.activeCollectionVideos?.length > 0
  );
});

const chatLoading = computed(() => {
  if (!props.showLoadingState) {
    return false;
  }
  const conversations = context?.conversations?.value || context?.conversations || {};
  return Object.values(conversations).some((conv) =>
    Object.values(conv).some(
      (content) => content.status === 'progress' || content.clientLoading || content.is_mock
    )
  );
});

const inputText = ref('');
const selectedAgent = ref(null);
const controlsButtonRef = ref(null);
const showSearchControlsPanel = ref(false);
const wasManuallyClosed = ref(false);
const additionalData = ref({
  precision: 'exact',
  searchFor: 'scenes',
});
const placeholder = computed(() => {
  if (context?.activeCollectionData?.value?.name) {
    return `Chat with "${context.activeCollectionData.value.name}"`;
  }
  return 'Chat with Collection';
});

const searchAgent = computed(() => ({
  name: 'Search',
  icon: SearchIcon,
  disabled: !collectionHasVideos.value,
}));

const hasVideoId = computed(() => {
  return !!(context?.videoId?.value || context?.videoId);
});

const canSend = computed(() => {
  return inputText.value.trim().length > 0 && !chatLoading.value;
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

const handleAgentClick = (agent) => {
  if (agent.disabled) return;

  if (isAgentSelected(agent)) {
    selectedAgent.value = null;
    showSearchControlsPanel.value = false;
    wasManuallyClosed.value = false;
  } else {
    selectedAgent.value = agent;
    wasManuallyClosed.value = false;
  }
};

const handleControlsToggle = () => {
  showSearchControlsPanel.value = !showSearchControlsPanel.value;
  if (!showSearchControlsPanel.value) {
    wasManuallyClosed.value = true;
  }
};

const handleClickOutside = (event) => {
  if (
    controlsButtonRef.value &&
    !controlsButtonRef.value.contains(event.target) &&
    showSearchControlsPanel.value
  ) {
    showSearchControlsPanel.value = false;
    wasManuallyClosed.value = true;
  }
};

watch(
  () => selectedAgent.value?.name?.toLowerCase() === 'search',
  (isSearchSelected) => {
    if (isSearchSelected && !wasManuallyClosed.value) {
      showSearchControlsPanel.value = true;
    } else if (!isSearchSelected) {
      showSearchControlsPanel.value = false;
      wasManuallyClosed.value = false;
    }
  }
);

watch(hasVideoId, (videoIdExists) => {
  if (videoIdExists && additionalData.value.searchFor === 'videos') {
    additionalData.value.searchFor = 'scenes';
  }
});

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});

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
  showSearchControlsPanel.value = false;
  wasManuallyClosed.value = false;
};
</script>
<style>
.vdb-c-br-50 {
  border-radius: 50px;
}

.vdb-c-chat-input {
  flex-grow: 1;
  resize: none;
}

.vdb-c-chat-input::placeholder {
  font-weight: 400;
}
</style>
