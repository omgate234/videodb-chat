<template>
  <div
    class="vdb-c-h-fit vdb-c-w-full vdb-c-border-t vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-20 vdb-c-py-10"
  >
    <!-- Queued Messages List -->
    <div
      v-if="queuedMessages.length > 0"
      class="vdb-c-mb-10 vdb-c-rounded-lg vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-[#FAFAFA] vdb-c-p-12"
    >
      <div class="vdb-c-mb-8 vdb-c-flex vdb-c-items-center vdb-c-gap-6">
        <ChevronDownIcon class="vdb-c-h-16 vdb-c-w-16 vdb-c-text-[#969696]" />
        <span class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-text-[#969696]">
          {{ queuedMessages.length }} Queued
        </span>
      </div>
      <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-8">
        <div
          v-for="(msg, index) in queuedMessages"
          :key="msg.id"
          class="vdb-c-flex vdb-c-items-start vdb-c-gap-8 vdb-c-rounded vdb-c-bg-white vdb-c-px-10 vdb-c-py-8"
        >
          <div class="vdb-c-flex-1">
            <p
              class="vdb-c-text-[13px] vdb-c-font-normal vdb-c-leading-[20px] vdb-c-text-[#1E1E1E]"
            >
              {{ msg.text }}
            </p>
            <p class="vdb-c-mt-4 vdb-c-text-[12px] vdb-c-text-[#969696]">
              Sends after message finishes
            </p>
          </div>
          <button
            @click="removeQueuedMessage(index)"
            class="vdb-c-flex-shrink-0 vdb-c-p-4 vdb-c-transition hover:vdb-c-opacity-70"
            title="Remove from queue"
          >
            <TrashIcon :stroke-color="'#969696'" />
          </button>
        </div>
      </div>
    </div>

    <div
      :class="[
        'vdb-c-relative vdb-c-w-full vdb-c-rounded-[26px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-10 vdb-c-py-[7px]',
      ]"
    >
      <div
        v-if="displayFiles.length > 0"
        class="vdb-c-flex vdb-c-w-full vdb-c-gap-12 vdb-c-overflow-x-auto vdb-c-pb-4 vdb-c-pt-4"
      >
        <template v-for="(file, index) in displayFiles" :key="file.id">
          <ImageFileDisplay
            v-if="file.type === 'image'"
            :file="file"
            :context="context"
            @remove="removeFile(index)"
          />
          <VideoFileDisplay
            v-else-if="file.type === 'video'"
            :file="file"
            @remove="removeFile(index)"
          />
          <AudioFileDisplay
            v-else-if="file.type === 'audio' || file.type === 'voices'"
            :file="file"
            @remove="removeFile(index)"
          />
        </template>
      </div>
      <!-- Waveform visualizer (when recording with agent selected) -->
      <AudioWaveformVisualizer
        v-if="selectedAgents.length > 0 && voiceState !== 'idle'"
        :analyser-node="analyserNode"
        :is-recording="voiceState === 'recording'"
        class="vdb-c-mb-20 vdb-c-mt-12 vdb-c-w-full"
      />
      <textarea
        ref="textareaRef"
        name="chat-input"
        v-else-if="selectedAgents.length > 0"
        v-model="inputText"
        type="text"
        class="vdb-c-chat-input vdb-c-mb-20 vdb-c-mt-12 vdb-c-max-h-[140px] vdb-c-w-full vdb-c-overflow-y-auto vdb-c-bg-transparent vdb-c-px-10 vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[24px] vdb-c-text-vdb-darkishgrey vdb-c-placeholder-[#969696] vdb-c-outline-none focus:vdb-c-outline-none"
        rows="1"
        :placeholder="placeholder"
        autocomplete="off"
        @input="handleInput"
        @keydown="handleTextareaKeyDown"
      ></textarea>
      <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-10">
        <div
          :class="[
            'vdb-c-chat-input-upload-icon vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-text-[#1E1E1E]',
          ]"
        >
          <button
            ref="plusButtonRef"
            @click="toggleDropUp"
            :disabled="chatLoading"
            :class="[
              'vdb-c-flex vdb-c-size-[36px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-border vdb-c-transition-all',
              chatLoading
                ? 'vdb-c-cursor-not-allowed vdb-c-border-[#DBDBDB] vdb-c-bg-roy'
                : 'vdb-c-border-[rgba(13,13,13,0.1)] vdb-c-bg-white hover:vdb-c-border-[#B9B9B9] hover:vdb-c-bg-roy focus:vdb-c-border-orange-200 focus:vdb-c-bg-orange-100',
            ]"
          >
            <PlusIcon :class="[chatLoading ? 'vdb-c-opacity-50' : '']" />
          </button>
          <AddDropUp
            :is-open="showDropUp"
            :trigger-element="plusButtonRef"
            :agents="allAgentsForDropdown"
            :disabled="chatLoading"
            @close="showDropUp = false"
            @agent-select="handleAgentSelect"
            @files-selected="handleFilesSelected"
            @upload-from-collection="handleUploadFromCollection"
          />
        </div>
        <div class="vdb-c-relative">
          <button
            ref="modelButtonRef"
            @click="toggleModelDropdown"
            :class="[
              'vdb-c-flex vdb-c-size-[36px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-border vdb-c-transition-all',
              selectedModel?.value?.id || selectedModel?.id
                ? 'vdb-c-border-[#FFCFA5] vdb-c-bg-[#FFE9D3]'
                : 'vdb-c-border-[rgba(13,13,13,0.1)] vdb-c-bg-white hover:vdb-c-border-[#B9B9B9] hover:vdb-c-bg-roy',
            ]"
          >
            <ModelIcon
              :class="[
                'vdb-c-h-[16.667px] vdb-c-w-[16.667px]',
                selectedModel?.value?.id || selectedModel?.id
                  ? 'vdb-c-text-[#821F0C]'
                  : 'vdb-c-text-vdb-darkishgrey',
              ]"
            />
          </button>
          <LLMDropdown
            :is-open="showModelDropdown"
            :trigger-element="modelButtonRef"
            :providers="llmProviders"
            :selected-model-id="selectedModel?.value?.id || selectedModel?.id"
            @close="showModelDropdown = false"
            @model-select="handleModelSelect"
          />
        </div>
        <!-- Waveform visualizer (when recording without agent) -->
        <AudioWaveformVisualizer
          v-if="selectedAgents.length === 0 && voiceState !== 'idle'"
          :analyser-node="analyserNode"
          :is-recording="voiceState === 'recording'"
          class="vdb-c-flex-1"
        />
        <textarea
          ref="textareaRef"
          name="chat-input"
          v-else-if="selectedAgents.length === 0"
          v-model="inputText"
          type="text"
          class="vdb-c-chat-input vdb-c-max-h-[140px] vdb-c-overflow-y-auto vdb-c-bg-transparent vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-vdb-darkishgrey vdb-c-placeholder-[#969696] vdb-c-outline-none focus:vdb-c-outline-none"
          rows="1"
          :placeholder="placeholder"
          autocomplete="off"
          @input="handleInput"
          @keydown="handleTextareaKeyDown"
        ></textarea>
        <div
          class="vdb-c-flex vdb-c-flex-grow vdb-c-items-center vdb-c-justify-start vdb-c-gap-8"
          v-if="selectedAgents.length > 0"
        >
          <!-- Show first 2 selected agents as pills -->
          <button
            v-for="agent in selectedAgents.slice(0, 2)"
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
          <!-- Show +N badge if more than 2 agents selected -->
          <span
            v-if="selectedAgents.length > 2"
            class="vdb-c-flex vdb-c-items-center vdb-c-rounded-full vdb-c-border vdb-c-border-[#FFCFA5] vdb-c-bg-[#FFE9D3] vdb-c-px-[9px] vdb-c-py-8 vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-[#821F0C]"
          >
            +{{ selectedAgents.length - 2 }}
          </span>
          <button
            v-if="selectedAgents.some((a) => a.name?.toLowerCase() === 'search')"
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

        <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-[8px]">
          <!-- Voice recording controls (when recording/processing) -->
          <template v-if="voiceState !== 'idle'">
            <!-- Cancel button (disabled during transcribing) -->
            <button
              @click="cancelRecording"
              :disabled="voiceState === 'transcribing'"
              :class="[
                'vdb-c-flex vdb-c-size-[36px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-transition-all',
                voiceState === 'transcribing'
                  ? 'vdb-c-cursor-not-allowed vdb-c-opacity-50'
                  : 'vdb-c-text-[#969696] hover:vdb-c-text-[#1E1E1E]',
              ]"
              title="Cancel recording"
            >
              <CrossIcon fill="#969696" class="vdb-c-h-[18px] vdb-c-w-[18px]" />
            </button>

            <!-- Confirm button (checkmark during recording, spinner during transcribing) -->
            <button
              @click="confirmRecording"
              :disabled="voiceState === 'transcribing'"
              :class="[
                'vdb-c-flex vdb-c-size-[36px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-border vdb-c-transition-all',
                voiceState === 'transcribing'
                  ? 'vdb-c-cursor-not-allowed vdb-c-border-[#DBDBDB] vdb-c-bg-[#F7F7F7]'
                  : 'vdb-c-border-[#EC5B16] vdb-c-bg-white hover:vdb-c-bg-[#FFF5EC]',
              ]"
              :title="voiceState === 'recording' ? 'Send to transcribe' : 'Processing...'"
            >
              <!-- Spinner during transcribing -->
              <SpinnerIcon
                v-if="voiceState === 'transcribing'"
                class="vdb-c-h-[20px] vdb-c-w-[20px]"
              />
              <!-- Checkmark during recording -->
              <CheckIcon v-else class="vdb-c-h-[18px] vdb-c-w-[18px] vdb-c-text-[#EC5B16]" />
            </button>
          </template>

          <!-- Normal controls (when idle) -->
          <template v-else>
            <!-- Mic Button -->
            <button
              @click="handleMicClick"
              :disabled="chatLoading"
              :class="[
                'vdb-c-flex vdb-c-size-[36px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-border vdb-c-transition-all',
                chatLoading
                  ? 'vdb-c-cursor-not-allowed vdb-c-border-[#DBDBDB] vdb-c-bg-[#F7F7F7]'
                  : 'vdb-c-border-[rgba(13,13,13,0.1)] vdb-c-bg-white hover:vdb-c-border-[#B9B9B9] hover:vdb-c-bg-[#F7F7F7]',
              ]"
              title="Voice input"
            >
              <MicrophoneIcon
                :fill="chatLoading ? '#969696' : '#1E1E1E'"
                class="vdb-c-h-[18px] vdb-c-w-[18px]"
              />
            </button>
            <button
              v-if="chatLoading"
              @click="handleStopMessage"
              :class="[
                'vdb-c-flex vdb-c-size-[36px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-border vdb-c-border-[#EC5B16] vdb-c-bg-white vdb-c-text-[#EC5B16] vdb-c-transition hover:vdb-c-bg-[#FFF5EC]',
              ]"
              type="button"
              title="Stop generating"
            >
              <StopIcon class-name="vdb-c-w-20 vdb-c-h-20" :fill="'#EC5B16'" />
            </button>
            <button
              v-else
              @click="handleSend"
              :disabled="!canSend"
              :class="[
                'vdb-c-flex vdb-c-size-[36px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-text-white vdb-c-transition',
              ]"
              type="submit"
            >
              <SendIcon
                class-name="vdb-c-w-20 vdb-c-h-20"
                :fill="canSend ? '#EC5B16' : '#B9B9B9'"
              />
            </button>
          </template>
        </div>
      </div>
    </div>

    <UploadFromCollectionModal
      :is-open="showUploadFromCollectionModal"
      :context="context"
      :pre-selected-assets="collectionAssets.map((a) => a.asset)"
      @close="showUploadFromCollectionModal = false"
      @select="handleCollectionAssetsSelected"
    />

    <!-- @ Mention Dropdown -->
    <AgentMentionDropdown
      ref="agentMentionDropdownRef"
      :is-open="showAgentMentionDropdown"
      :position="mentionDropdownPosition"
      :agents="allAgentsForDropdown"
      :selected-agents="selectedAgents"
      :query="agentMentionQuery"
      :highlighted-index="agentMentionHighlightedIndex"
      @select="selectAgentFromMention"
      @close="showAgentMentionDropdown = false"
      @highlight="agentMentionHighlightedIndex = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, inject, onUnmounted, watch, nextTick, onMounted } from 'vue';
import AttachIcon from '../../../chat/v2/icons/AttachIcon.vue';
import ModelIcon from '../../../chat/v2/icons/ModelIcon.vue';
import MicrophoneIcon from '../../../chat/v2/icons/MicrophoneIcon.vue';
import SearchIcon from '../../../chat/v2/icons/agents/SearchIcon.vue';
import VoiceIcon from '../../../chat/v2/icons/agents/VoiceIcon.vue';
import CensorIcon from '../../../chat/v2/icons/agents/CensorIcon.vue';
import ClipIcon from '../../../chat/v2/icons/agents/ClipIcon.vue';
import SubtitleIcon from '../../../chat/v2/icons/agents/SubtitleIcon.vue';
import DubbingIcon from '../../../chat/v2/icons/agents/DubbingIcon.vue';
import GenerateIcon from '../../../chat/v2/icons/agents/GenerateIcon.vue';
import EditIcon from '../../../chat/v2/icons/agents/EditIcon.vue';
import ThreeDotsIcon from '../../../chat/v2/icons/ThreeDotsIcon.vue';
import SendButtonIcon from '../../../chat/v2/icons/agents/SendButtonIcon.vue';
import CrossIcon from '../../../chat/v2/icons/CrossIcon.vue';
import AgentDropdown from './AgentDropdown.vue';
import AttachDropdown from './AttachDropdown.vue';
import LLMDropdown from './LLMDropdown.vue';
import ImageFileDisplay from './ImageFileDisplay.vue';
import VideoFileDisplay from './VideoFileDisplay.vue';
import AudioFileDisplay from './AudioFileDisplay.vue';
import SearchOptions from './SearchOptions.vue';
import Tooltip from '../../../chat/v2/elements/Tooltip.vue';
import PlusIcon from '../../../chat/v2/icons/PlusIcon.vue';
import SendIcon from '../../../chat/v2/icons/SendIcon.vue';
import AddDropUp from './AddDropUp.vue';
import ChevronDown from '../../../icons/ChevronDown.vue';
import SearchControlsPanel from './SearchControlsPanel.vue';
import UploadFromCollectionModal from './UploadFromCollectionModal.vue';
import StopIcon from '../../../icons/StopIcon.vue';
import TrashIcon from '../../../chat/v2/icons/TrashIcon.vue';
import ChevronDownIcon from '../../../chat/v2/icons/ChevronDownIcon.vue';
import AudioWaveformVisualizer from './AudioWaveformVisualizer.vue';
import SpinnerIcon from '../../../chat/v2/icons/SpinnerIcon.vue';
import CheckIcon from '../../../chat/v2/icons/CheckIcon.vue';
import AgentMentionDropdown from './AgentMentionDropdown.vue';

const props = defineProps({
  context: {
    type: Object,
    default: undefined,
  },
  showLoadingState: {
    type: Boolean,
    default: false,
  },
  editedContext: {
    type: [Array, Object],
    default: null,
  },
});

const context = props.context || inject('videodb-chat-context', {});

const collectionHasVideos = computed(() => {
  return (
    context?.activeCollectionVideos?.value?.length > 0 ||
    context?.activeCollectionVideos?.length > 0
  );
});

const pendingMessageId = computed(() => {
  if (!props.showLoadingState) {
    return null;
  }
  const conversations = context?.conversations?.value || context?.conversations || {};

  // Get all conversations sorted by conv_id (timestamp)
  const sortedConvIds = Object.keys(conversations).sort((a, b) => Number(b) - Number(a));

  // Find the last conversation with a pending output message
  for (const convId of sortedConvIds) {
    const conv = conversations[convId];
    const messages = Object.values(conv).sort((a, b) => {
      const aId = parseFloat(a.msg_id);
      const bId = parseFloat(b.msg_id);
      return bId - aId;
    });

    // Find the last output message that is pending
    const pendingMsg = messages.find(
      (msg) =>
        msg.msg_type === 'output' && (msg.status === 'progress' || msg.clientLoading || msg.is_mock)
    );

    if (pendingMsg) {
      return pendingMsg.msg_id;
    }
  }

  return null;
});

const inputText = ref('');
const showAgentsDropdown = ref(false);
const showAttachDropdown = ref(false);
const showModelDropdown = ref(false);
const showDropUp = ref(false);
const showUploadFromCollectionModal = ref(false);
const showCursor = ref(true);
const selectedAgents = ref([]);
const llmProviders = ref([]);
const threeDotsButtonRef = ref(null);
const attachButtonRef = ref(null);
const modelButtonRef = ref(null);
const plusButtonRef = ref(null);
const controlsButtonRef = ref(null);
const showSearchControlsPanel = ref(false);
const wasManuallyClosed = ref(false);
const textareaRef = ref(null);

// @ mention state
const showAgentMentionDropdown = ref(false);
const agentMentionQuery = ref('');
const agentMentionStartIndex = ref(-1);
const agentMentionHighlightedIndex = ref(0);
const mentionDropdownPosition = ref({ bottom: 0, left: 0 });
const agentMentionDropdownRef = ref(null);

// Voice recording state
const voiceState = ref('idle'); // 'idle' | 'recording' | 'stopped' | 'transcribing'
let mediaRecorder = null;
let audioChunks = [];
let mediaStream = null;
let audioContext = null;
const analyserNode = ref(null);
let recordedMimeType = 'audio/webm';

const chatLoading = computed(() => {
  if (!props.showLoadingState) {
    return false;
  }
  const sid = context.sessionId?.value || context.sessionId;
  return context.isSessionBusy?.(sid) || false;
});

const queuedMessages = computed(() => {
  const sid = context.sessionId?.value || context.sessionId;
  if (!sid || !context.messageQueues) return [];
  return (context.messageQueues[sid] || []).map((m) => ({
    id: m.id,
    text: m.text,
  }));
});

const selectedModel = computed(() => context?.selectedModel?.value || context?.selectedModel);
const placeholder = computed(() => {
  if (context?.activeCollectionData?.value?.name) {
    return `Chat with "${context.activeCollectionData.value.name}"`;
  }
  return 'Chat with Collection';
});

const hasVideoId = computed(() => {
  return !!(context?.videoId?.value || context?.videoId);
});

const agentsList = [
  {
    name: 'Search',
    icon: SearchIcon,
  },
  {
    name: 'Edit',
    icon: EditIcon,
  },
  {
    name: 'Dubbing',
    icon: DubbingIcon,
  },
  {
    name: 'Subtitle',
    icon: SubtitleIcon,
  },
  {
    name: 'Clip',
    icon: ClipIcon,
  },
  {
    name: 'Censor',
    icon: CensorIcon,
  },
  {
    name: 'Generate',
    icon: GenerateIcon,
  },
  {
    name: 'Voice',
    icon: VoiceIcon,
  },
];

const allAgentsForDropdown = computed(() => {
  const hasVideos = collectionHasVideos.value;

  return agentsList.map((agent) => {
    let disabled = false;
    if (agent.name === 'Generate') {
      disabled = false;
    } else if (!hasVideos) {
      disabled = true;
    } else {
      disabled = false;
    }

    return {
      ...agent,
      display: true,
      disabled,
    };
  });
});

const displayAgentsButtons = computed(() => {
  const hasVideos = collectionHasVideos.value;
  const selectedAgentNames = selectedAgents.value.map((a) => a.name);

  return agentsList.map((agent) => {
    let display = false;

    if (hasVideos) {
      if (agent.name === 'Search') {
        display = true;
      } else if (selectedAgentNames.length > 0) {
        display = selectedAgentNames.includes(agent.name);
      } else {
        display = agent.name === 'Edit';
      }
    } else {
      display = agent.name === 'Generate' || agent.name === 'Search';
    }

    let disabled = false;
    if (agent.name === 'Generate') {
      disabled = false;
    } else if (!hasVideos) {
      disabled = true;
    } else {
      disabled = false;
    }

    return {
      ...agent,
      display,
      disabled,
    };
  });
});

const visibleAgents = computed(() => {
  const agents = displayAgentsButtons.value.filter((agent) => agent.display);

  const searchAgent = agents.find((agent) => agent.name === 'Search');
  const otherAgents = agents.filter((agent) => agent.name !== 'Search');

  if (searchAgent) {
    return [searchAgent, ...otherAgents];
  }

  return agents;
});

const canSend = computed(() => {
  return inputText.value.trim().length > 0 && !chatLoading.value;
});

const isAgentSelected = (agent) => {
  return selectedAgents.value.some((a) => a.name === agent.name);
};

// Computed: agents available for @ mention (not already selected)
const filteredMentionAgents = computed(() => {
  const selectedNames = selectedAgents.value.map((a) => a.name);
  let available = allAgentsForDropdown.value.filter((agent) => !selectedNames.includes(agent.name));

  if (agentMentionQuery.value) {
    available = available.filter((agent) =>
      agent.name.toLowerCase().includes(agentMentionQuery.value.toLowerCase())
    );
  }

  return available;
});

// Get caret coordinates in textarea for @ mention positioning
const getCaretCoordinates = (element, position) => {
  const div = document.createElement('div');
  const computed = window.getComputedStyle(element);

  // Copy styles that affect text rendering
  const styleProps = [
    'fontFamily',
    'fontSize',
    'fontWeight',
    'fontStyle',
    'letterSpacing',
    'textTransform',
    'wordSpacing',
    'textIndent',
    'whiteSpace',
    'lineHeight',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'paddingBottom',
    'borderLeftWidth',
    'borderRightWidth',
    'borderTopWidth',
    'borderBottomWidth',
    'boxSizing',
  ];

  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';
  div.style.width = computed.width;

  styleProps.forEach((prop) => {
    div.style[prop] = computed[prop];
  });

  div.textContent = element.value.substring(0, position);

  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);

  document.body.appendChild(div);

  const coordinates = {
    top: span.offsetTop,
    left: span.offsetLeft,
    height: parseInt(computed.lineHeight) || parseInt(computed.fontSize) * 1.2,
  };

  document.body.removeChild(div);
  return coordinates;
};

// Update @ mention dropdown position
const updateMentionDropdownPosition = () => {
  const textarea = textareaRef.value;
  if (!textarea || agentMentionStartIndex.value < 0) return;

  const textareaRect = textarea.getBoundingClientRect();
  const caretCoords = getCaretCoordinates(textarea, agentMentionStartIndex.value);

  // Calculate position relative to viewport
  const viewportHeight = window.innerHeight;
  const dropdownHeight = 220; // Approximate dropdown height

  // Position dropdown above the @ character
  const bottomFromViewport = viewportHeight - (textareaRect.top + caretCoords.top - textarea.scrollTop);
  const leftFromViewport = textareaRect.left + caretCoords.left;

  mentionDropdownPosition.value = {
    bottom: bottomFromViewport + caretCoords.height + 4,
    left: leftFromViewport,
  };
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

const isControlsActive = computed(() => {
  return selectedAgents.value.some((a) => a.name?.toLowerCase() === 'search');
});

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
    // Remove agent from selected list
    selectedAgents.value = selectedAgents.value.filter((a) => a.name !== agent.name);
    if (!selectedAgents.value.some((a) => a.name?.toLowerCase() === 'search')) {
      showSearchControlsPanel.value = false;
    }
    wasManuallyClosed.value = false;
  } else {
    // Add agent to selected list
    selectedAgents.value = [...selectedAgents.value, agent];
    wasManuallyClosed.value = false;
  }
};

const handleAgentSelect = (agent) => {
  const fullAgent = displayAgentsButtons.value.find((a) => a.name === agent.name);
  if (fullAgent) {
    handleAgentClick(fullAgent);
  } else {
    handleAgentClick(agent);
  }
};

// Select agent from @ mention dropdown
const selectAgentFromMention = (agent) => {
  if (agent.disabled) return;
  if (!textareaRef.value) return;

  const textarea = textareaRef.value;
  const value = inputText.value;
  const startIndex = agentMentionStartIndex.value;
  const cursorPos = textarea.selectionStart;

  // Replace @query with @AgentName
  const beforeMention = value.substring(0, startIndex);
  const afterMention = value.substring(cursorPos);
  inputText.value = `${beforeMention}@${agent.name} ${afterMention}`;

  // Add agent to selected agents
  if (!selectedAgents.value.some((a) => a.name === agent.name)) {
    selectedAgents.value = [...selectedAgents.value, agent];
  }

  // Close dropdown
  showAgentMentionDropdown.value = false;
  agentMentionQuery.value = '';
  agentMentionStartIndex.value = -1;
  agentMentionHighlightedIndex.value = 0;

  // Focus textarea and set cursor position
  nextTick(() => {
    if (textareaRef.value) {
      const newCursorPos = startIndex + agent.name.length + 2; // +2 for @ and space
      textareaRef.value.focus();
      textareaRef.value.setSelectionRange(newCursorPos, newCursorPos);
    }
  });
};

// Handle keyboard navigation in @ mention dropdown
const handleTextareaKeyDown = (event) => {
  // Handle @ mention dropdown navigation
  if (showAgentMentionDropdown.value && filteredMentionAgents.value.length > 0) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      agentMentionHighlightedIndex.value =
        (agentMentionHighlightedIndex.value + 1) % filteredMentionAgents.value.length;
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      agentMentionHighlightedIndex.value =
        (agentMentionHighlightedIndex.value - 1 + filteredMentionAgents.value.length) %
        filteredMentionAgents.value.length;
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      const agent = filteredMentionAgents.value[agentMentionHighlightedIndex.value];
      if (agent) {
        selectAgentFromMention(agent);
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      showAgentMentionDropdown.value = false;
      agentMentionQuery.value = '';
      agentMentionStartIndex.value = -1;
      return;
    }
  }

  // Handle Escape to close search controls panel
  if (event.key === 'Escape' && showSearchControlsPanel.value) {
    event.preventDefault();
    showSearchControlsPanel.value = false;
    wasManuallyClosed.value = true;
    return;
  }

  // Handle send on Enter (without shift)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
};

const toggleDropUp = () => {
  if (chatLoading.value) return;
  showDropUp.value = !showDropUp.value;
};

const toggleAgentsDropdown = () => {
  showAgentsDropdown.value = !showAgentsDropdown.value;
  if (showAgentsDropdown.value) {
    showAttachDropdown.value = false;
    showModelDropdown.value = false;
    showDropUp.value = false;
  }
};

const toggleAttachDropdown = () => {
  showAttachDropdown.value = !showAttachDropdown.value;
  if (showAttachDropdown.value) {
    showAgentsDropdown.value = false;
    showModelDropdown.value = false;
    showDropUp.value = false;
  }
};

const toggleModelDropdown = () => {
  showModelDropdown.value = !showModelDropdown.value;
  if (showModelDropdown.value) {
    showAgentsDropdown.value = false;
    showAttachDropdown.value = false;
    showDropUp.value = false;
  }
};

const handleModelSelect = (model) => {
  if (context?.handleModelSelect) {
    context.handleModelSelect(model);
  }
};

const uploadedFiles = ref([]);
const collectionAssets = ref([]);
const displayFiles = ref([]);

const additionalData = ref({
  precision: 'exact',
  searchFor: 'scenes',
});

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + ' ' + sizes[i];
};

const handleFilesSelected = (files) => {
  if (chatLoading.value) return;

  files.forEach((file) => {
    let fileType = 'file';
    if (file.type.startsWith('image/')) {
      fileType = 'image';
    } else if (file.type.startsWith('video/')) {
      fileType = 'video';
    } else if (file.type.startsWith('audio/')) {
      fileType = 'audio';
    }

    const fileId = Date.now() + Math.random();

    uploadedFiles.value.push({
      id: fileId,
      file: file,
    });

    const displayFile = {
      id: fileId,
      type: fileType,
      name: file.name,
      size: formatFileSize(file.size),
      isFromDevice: true,
    };

    if (fileType === 'image') {
      displayFile.url = URL.createObjectURL(file);
    }

    displayFiles.value.push(displayFile);
  });
};

const removeFile = (index) => {
  const displayFile = displayFiles.value[index];

  if (displayFile.type === 'image' && displayFile.url && displayFile.isFromDevice) {
    URL.revokeObjectURL(displayFile.url);
  }

  displayFiles.value.splice(index, 1);

  if (displayFile.isFromDevice) {
    const uploadedIndex = uploadedFiles.value.findIndex((f) => f.id === displayFile.id);
    if (uploadedIndex !== -1) {
      uploadedFiles.value.splice(uploadedIndex, 1);
    }
  } else {
    const assetIndex = collectionAssets.value.findIndex((a) => a.id === displayFile.id);
    if (assetIndex !== -1) {
      collectionAssets.value.splice(assetIndex, 1);
    }
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
  () => selectedAgents.value.some((a) => a.name?.toLowerCase() === 'search'),
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

onMounted(async () => {
  window.addEventListener('click', handleClickOutside);

  if (context?.fetchLLMModels) {
    try {
      const result = await context.fetchLLMModels();
      if (result.status === 'success' && result.data?.data?.providers) {
        llmProviders.value = result.data.data.providers;
      }
    } catch (error) {
      console.error('Failed to fetch LLM models:', error);
    }
  }
});

onUnmounted(() => {
  displayFiles.value.forEach((file) => {
    if (file.type === 'image' && file.url && file.isFromDevice) {
      URL.revokeObjectURL(file.url);
    }
  });
  window.removeEventListener('click', handleClickOutside);
  // Cleanup voice recording
  cleanupRecording();
});

const handleUploadFromDevice = () => {};

const handleUploadFromCollection = () => {
  if (chatLoading.value) return;
  showUploadFromCollectionModal.value = true;
  showDropUp.value = false;
};

// Voice recording functions
const getSupportedMimeType = () => {
  const mimeTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/webm;codecs=opus',
    'audio/webm',
  ];
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  return 'audio/webm';
};

const setupAudioAnalyser = (stream) => {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.7;

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  analyserNode.value = analyser;
};

const startRecording = async () => {
  if (chatLoading.value) return;

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];

    setupAudioAnalyser(mediaStream);

    recordedMimeType = getSupportedMimeType();
    mediaRecorder = new MediaRecorder(mediaStream, { mimeType: recordedMimeType });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.start(100);
    voiceState.value = 'recording';
  } catch (err) {
    console.error('Failed to start recording:', err);
    voiceState.value = 'idle';
  }
};

const cancelRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  cleanupRecording();
  voiceState.value = 'idle';
};

const cleanupRecording = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  analyserNode.value = null;
  audioChunks = [];
  mediaRecorder = null;
};

const confirmRecording = async () => {
  // Stop recording first if still recording
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    // Create a promise that resolves when recording stops
    await new Promise((resolve) => {
      mediaRecorder.onstop = resolve;
      mediaRecorder.stop();
    });
  }

  voiceState.value = 'transcribing';

  try {
    if (audioChunks.length === 0) {
      throw new Error('No audio recorded');
    }

    const audioBlob = new Blob(audioChunks, { type: recordedMimeType });

    if (context?.speechToText) {
      const response = await context.speechToText(audioBlob);

      if (response.status === 'success' && response.text) {
        inputText.value = response.text;
      } else {
        throw new Error(response.error || 'Transcription failed');
      }
    } else {
      throw new Error('Speech to text not available');
    }
  } catch (err) {
    console.error('Transcription error:', err);
    // Show error to user (could be enhanced with notification system)
    alert(err.message || 'Failed to transcribe audio');
  } finally {
    cleanupRecording();
    voiceState.value = 'idle';
  }
};

const handleMicClick = () => {
  startRecording();
};

// Auto-resize textarea when inputText changes programmatically (e.g., after transcription)
watch(inputText, () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
      textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 140)}px`;
    }
  });
});

const handleCollectionAssetsSelected = async (selectedAssets) => {
  const { activeCollectionData, collectionId: collectionIdRef } = context || {};

  // Get current collection ID from context
  const currentCollectionId =
    activeCollectionData?.value?.id || activeCollectionData?.id || collectionIdRef?.value;

  for (const asset of selectedAssets) {
    if (!asset || !asset.type) {
      console.warn('Invalid asset skipped:', asset);
      continue;
    }

    const fileId = Date.now() + Math.random() + (asset.id || Math.random());

    // Store collection asset
    collectionAssets.value.push({
      id: fileId,
      asset: asset,
    });

    // Create display file with fallback for name
    // Normalize type: voices -> voices (keep as is), others -> lowercase
    const normalizedType = asset.type === 'voices' ? 'voices' : asset.type.toLowerCase();

    const displayFile = {
      id: fileId,
      type: normalizedType,
      name: asset.name || asset.title || `Untitled ${asset.type}`,
      url: null,
      isFromDevice: false,
      collectionId: currentCollectionId || asset.collectionId || asset.collection_id,
      assetId: asset.id,
    };

    // Add to displayFiles - component validators will handle missing properties
    displayFiles.value.push(displayFile);
  }
};

const handleInput = (event) => {
  const textarea = event.target;
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;

  // Handle @ mention detection
  const text = inputText.value;
  const cursorPos = textarea.selectionStart;

  // Find the last @ before cursor
  let atIndex = -1;
  for (let i = cursorPos - 1; i >= 0; i--) {
    if (text[i] === '@') {
      atIndex = i;
      break;
    }
    // Stop if we hit a space or newline before finding @
    if (text[i] === ' ' || text[i] === '\n') {
      break;
    }
  }

  if (atIndex >= 0) {
    // Check if @ is at start or preceded by space/newline
    const charBefore = atIndex > 0 ? text[atIndex - 1] : ' ';
    if (charBefore === ' ' || charBefore === '\n' || atIndex === 0) {
      const query = text.substring(atIndex + 1, cursorPos);
      // Only show dropdown if query doesn't contain spaces
      if (!query.includes(' ')) {
        agentMentionQuery.value = query;
        agentMentionStartIndex.value = atIndex;
        agentMentionHighlightedIndex.value = 0;
        showAgentMentionDropdown.value = true;
        nextTick(() => {
          updateMentionDropdownPosition();
        });
        return;
      }
    }
  }

  // No valid @ mention, close dropdown
  showAgentMentionDropdown.value = false;
  agentMentionQuery.value = '';
  agentMentionStartIndex.value = -1;
};

const handleStopMessage = () => {
  const msgId = pendingMessageId.value;
  if (msgId && context?.stopMessage) {
    context.stopMessage(msgId);
  }
};

const removeQueuedMessage = (index) => {
  const sid = context.sessionId?.value || context.sessionId;
  if (sid && context.messageQueues?.[sid]) {
    context.messageQueues[sid].splice(index, 1);
  }
};

const handleSend = () => {
  const textClean = inputText.value.trim();

  if (textClean.length === 0) return;

  const targetSid = context.sessionId?.value || context.sessionId;

  // Prepare files for sending (raw File objects from device uploads)
  const filesToSend = uploadedFiles.value.map((f) => f.file);

  // Prepare collection assets - separate by type
  const videos = [];
  const audios = [];
  const voices = [];
  const uploadedFilesFromCollection = [];

  collectionAssets.value.forEach((a) => {
    const asset = a.asset;
    uploadedFilesFromCollection.push(asset);

    if (asset.type === 'video') {
      videos.push(asset);
    } else if (asset.type === 'audio') {
      audios.push(asset);
    } else if (asset.type === 'voices') {
      voices.push(asset);
    }
  });

  const hasSearchAgent = selectedAgents.value.some((a) => a.name?.toLowerCase() === 'search');
  const additionalInfo = hasSearchAgent
    ? {
        precision: additionalData.value.precision,
        searchFor: additionalData.value.searchFor,
      }
    : null;

  const payload = {
    text: textClean,
    agents: selectedAgents.value.map((a) => a.name),
    files: filesToSend,
    uploaded_files: uploadedFilesFromCollection,
    additionalInfo: additionalInfo,
  };

  if (videos.length > 0) {
    payload.videos = videos;
  }
  if (audios.length > 0) {
    payload.audios = audios;
  }
  if (voices.length > 0) {
    payload.voices = voices;
  }

  const modelId = selectedModel?.value?.id || selectedModel?.id;
  if (modelId) {
    payload.model_name = modelId;
  }
  if (props.editedContext) {
    payload.edited_context = props.editedContext;
  }

  if (chatLoading.value) {
    if (context?.enqueueMessage) {
      context.enqueueMessage(targetSid, payload);
    }
  } else {
    if (context?.handleAddMessage) {
      context.handleAddMessage(payload);
    }
  }

  // Clean up object URLs before clearing
  displayFiles.value.forEach((file) => {
    if (file.type === 'image' && file.url && file.isFromDevice) {
      URL.revokeObjectURL(file.url);
    }
  });

  inputText.value = '';
  selectedAgents.value = [];
  uploadedFiles.value = [];
  collectionAssets.value = [];
  displayFiles.value = [];
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
