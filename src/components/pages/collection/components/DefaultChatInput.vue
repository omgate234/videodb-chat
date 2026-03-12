<template>
  <div class="vdb-c-relative vdb-c-z-20 vdb-c-w-full">
    <div
      class="vdb-c-relative vdb-c-z-10 vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-overflow-hidden vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-vdb-lightgrey vdb-c-shadow-[0px_0px_4px_0px_rgba(0,0,0,0.04),0px_0px_1px_0px_rgba(0,0,0,0.6)]"
      :class="showSuggestions && suggestions.length > 0 ? 'vdb-c-rounded-t-20' : 'vdb-c-rounded-20'"
    >
      <!-- Main Input Section -->
      <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-10 vdb-c-px-10 vdb-c-pb-10 vdb-c-pt-20">
        <!-- Files Container -->
        <div
          v-if="displayFiles.length > 0"
          class="vdb-c-flex vdb-c-w-full vdb-c-gap-12 vdb-c-overflow-x-auto vdb-c-px-4"
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
            <div v-else>
              <p>Invalid file type : {{ JSON.stringify(file) }}</p>
            </div>
          </template>
        </div>

        <!-- Input Area -->
        <div
          class="vdb-c-flex vdb-c-w-full vdb-c-items-start vdb-c-gap-px vdb-c-pl-[4px]"
          :class="
            voiceState !== 'idle' ? 'vdb-c-h-[48px]' : 'vdb-c-max-h-[150px] vdb-c-min-h-[48px]'
          "
        >
          <!-- Normal textarea (when idle) -->
          <textarea
            v-if="voiceState === 'idle'"
            ref="textareaRef"
            name="chat-input"
            v-model="inputText"
            :placeholder="placeholder"
            class="vdb-c-leading-24 vdb-c-max-h-[140px] vdb-c-min-h-[24px] vdb-c-flex-1 vdb-c-resize-none vdb-c-overflow-y-auto vdb-c-border-0 vdb-c-bg-transparent vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-vdb-darkishgrey vdb-c-placeholder-[#969696] vdb-c-outline-none"
            rows="1"
            @input="handleInput"
            @keydown="handleTextareaKeyDown"
            @blur="handleTextareaBlur"
            @focus="handleTextareaFocus"
          ></textarea>
          <!-- Waveform visualizer (when recording/processing) -->
          <AudioWaveformVisualizer
            v-else
            :analyser-node="analyserNode"
            :is-recording="voiceState === 'recording'"
            class="vdb-c-flex-1"
          />

          <!-- Agent Mention Dropdown (teleported to body) -->
          <AgentMentionDropdown
            :is-open="showAgentMentionDropdown"
            :position="mentionDropdownPosition"
            :agents="displayAgentsButtons"
            :selected-agents="selectedAgents"
            :query="agentMentionQuery"
            :highlighted-index="agentMentionHighlightedIndex"
            @select="selectAgentFromMention"
            @close="closeMentionDropdown"
          />
        </div>

        <!-- Actions Row -->
        <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6">
          <!-- Left Actions -->
          <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-6">
            <!-- Attach Button -->
            <div class="vdb-c-relative">
              <button
                ref="attachButtonRef"
                @click="toggleAttachDropdown"
                class="vdb-c-flex vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-full vdb-c-border vdb-c-border-[rgba(13,13,13,0.1)] vdb-c-bg-white vdb-c-px-[9px] vdb-c-py-8 vdb-c-transition-all hover:vdb-c-border-[#FFCFA5] hover:vdb-c-bg-[#FFE9D3]"
              >
                <AttachIcon class="vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-text-vdb-darkishgrey" />
                <span
                  class="vdb-c-whitespace-nowrap vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-text-vdb-darkishgrey"
                >
                  Attach
                </span>
              </button>
              <AttachDropdown
                :is-open="showAttachDropdown"
                :trigger-element="attachButtonRef"
                @close="showAttachDropdown = false"
                @upload-from-device="handleUploadFromDevice"
                @upload-from-collection="handleUploadFromCollection"
                @files-selected="handleFilesSelected"
              />
            </div>

            <!-- Agent Pill Button (dynamic based on selection) -->
            <button
              v-if="displayedPillAgent"
              @click="handlePillAgentClick"
              :disabled="displayedPillAgent.disabled"
              :class="[
                'vdb-c-flex vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-full vdb-c-border vdb-c-px-[9px] vdb-c-py-8 vdb-c-transition-all',
                isPillAgentSelected
                  ? 'vdb-c-border-[#FFCFA5] vdb-c-bg-[#FFE9D3]'
                  : displayedPillAgent.disabled
                    ? 'vdb-c-cursor-not-allowed vdb-c-border-[#DBDBDB] vdb-c-bg-white'
                    : 'vdb-c-border-[rgba(13,13,13,0.1)] vdb-c-bg-white hover:vdb-c-border-[#FFCFA5] hover:vdb-c-bg-[#FFE9D3]',
              ]"
            >
              <component
                :is="displayedPillAgent.icon"
                :class="[
                  'vdb-c-h-[20px] vdb-c-w-[20px]',
                  isPillAgentSelected
                    ? 'vdb-c-text-[#821F0C]'
                    : displayedPillAgent.disabled
                      ? 'vdb-c-text-[#969696]'
                      : 'vdb-c-text-vdb-darkishgrey',
                ]"
              />
              <span
                :class="[
                  'vdb-c-whitespace-nowrap vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[19.5px]',
                  isPillAgentSelected
                    ? 'vdb-c-text-[#821F0C]'
                    : displayedPillAgent.disabled
                      ? 'vdb-c-text-[#969696]'
                      : 'vdb-c-text-vdb-darkishgrey',
                ]"
              >
                {{ displayedPillAgent.name }}
              </span>
            </button>

            <!-- Three Dots Button (Agent Selector) -->
            <div class="vdb-c-relative">
              <button
                ref="threeDotsButtonRef"
                @click="toggleAgentsDropdown"
                class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-border vdb-c-border-[rgba(13,13,13,0.1)] vdb-c-bg-white vdb-c-p-8 vdb-c-transition-all hover:vdb-c-border-[#FFCFA5] hover:vdb-c-bg-[#FFE9D3]"
              >
                <ThreeDotsIcon class="vdb-c-h-[20px] vdb-c-w-[20px]" />
              </button>
              <AgentDropdown
                :is-open="showAgentsDropdown"
                :trigger-element="threeDotsButtonRef"
                :agents="displayAgentsButtons"
                :selected-agents="selectedAgents"
                @close="showAgentsDropdown = false"
                @agent-select="handleAgentSelect"
              />
            </div>
          </div>

          <!-- Spacer -->
          <div class="vdb-c-flex-1"></div>

          <!-- Right Actions -->
          <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-6">
            <!-- Model Button -->
            <div class="vdb-c-relative">
              <button
                ref="modelButtonRef"
                @click="toggleModelDropdown"
                :class="[
                  'vdb-c-flex vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-full vdb-c-border vdb-c-px-[9px] vdb-c-py-8 vdb-c-transition-all',
                  selectedModelId
                    ? 'vdb-c-border-[#FFCFA5] vdb-c-bg-[#FFE9D3]'
                    : 'vdb-c-border-[rgba(13,13,13,0.1)] vdb-c-bg-white hover:vdb-c-border-[#FFCFA5] hover:vdb-c-bg-[#FFE9D3]',
                ]"
              >
                <ModelIcon
                  :class="[
                    'vdb-c-h-[20px] vdb-c-w-[20px]',
                    selectedModelId ? 'vdb-c-text-[#821F0C]' : 'vdb-c-text-vdb-darkishgrey',
                  ]"
                />
                <span
                  :class="[
                    'vdb-c-max-w-[180px] vdb-c-truncate vdb-c-whitespace-nowrap vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[19.5px]',
                    selectedModelId ? 'vdb-c-text-[#821F0C]' : 'vdb-c-text-vdb-darkishgrey',
                  ]"
                  :title="selectedModelLabel"
                >
                  {{ selectedModelLabel }}
                </span>
              </button>
              <LLMDropdown
                :is-open="showModelDropdown"
                :trigger-element="modelButtonRef"
                :providers="llmProviders"
                :selected-model-id="selectedModelId"
                @close="showModelDropdown = false"
                @model-select="handleModelSelect"
              />
            </div>

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
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Suggestions Drawer -->
    <div
      v-if="showSuggestions && suggestions.length > 0"
      class="vdb-c-absolute vdb-c-left-0 vdb-c-right-0 vdb-c-top-[calc(100%-1px)] vdb-c-z-0 vdb-c-flex vdb-c-flex-col vdb-c-gap-2 vdb-c-overflow-hidden vdb-c-rounded-b-20 vdb-c-border vdb-c-border-t-0 vdb-c-border-[#EFEFEF] vdb-c-bg-vdb-lightgrey vdb-c-px-10 vdb-c-py-20 vdb-c-shadow-[0px_0px_4px_0px_rgba(0,0,0,0.04),0px_0px_1px_0px_rgba(0,0,0,0.6)]"
    >
      <button
        v-for="(suggestion, index) in suggestions"
        :key="index"
        @click="handleSuggestionClick(suggestion)"
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-8 vdb-c-rounded vdb-c-p-8 vdb-c-text-left vdb-c-transition-colors hover:vdb-c-bg-[#F0F0F0]"
      >
        <SuggestionIcon
          class="vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-flex-shrink-0 vdb-c-text-vdb-darkishgrey"
        />
        <span
          class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[24px] vdb-c-tracking-[0.08px] vdb-c-text-vdb-darkishgrey"
        >
          {{ suggestion.text }}
        </span>
      </button>
    </div>

    <UploadFromCollectionModal
      :is-open="showUploadFromCollectionModal"
      :context="context"
      :pre-selected-assets="collectionAssets.map((a) => a.asset)"
      @close="showUploadFromCollectionModal = false"
      @select="handleCollectionAssetsSelected"
    />
  </div>
</template>
<script setup>
import { ref, computed, inject, onUnmounted, onMounted, watch, nextTick } from 'vue';
import AttachIcon from '../../../chat/v2/icons/AttachIcon.vue';
import ModelIcon from '../../../chat/v2/icons/ModelIcon.vue';
import SearchIcon from '../../../chat/v2/icons/agents/SearchIcon.vue';
import CensorIcon from '../../../chat/v2/icons/agents/CensorIcon.vue';
import ClipIcon from '../../../chat/v2/icons/agents/ClipIcon.vue';
import SubtitleIcon from '../../../chat/v2/icons/agents/SubtitleIcon.vue';
import DubbingIcon from '../../../chat/v2/icons/agents/DubbingIcon.vue';
import GenerateIcon from '../../../chat/v2/icons/agents/GenerateIcon.vue';
import EditIcon from '../../../chat/v2/icons/agents/EditIcon.vue';
import ThreeDotsIcon from '../../../chat/v2/icons/ThreeDotsIcon.vue';
import SendButtonIcon from '../../../chat/v2/icons/agents/SendButtonIcon.vue';
import CrossIcon from '../../../chat/v2/icons/CrossIcon.vue';
import SuggestionIcon from '../../../chat/v2/icons/SuggestionIcon.vue';
import AgentDropdown from './AgentDropdown.vue';
import AttachDropdown from './AttachDropdown.vue';
import LLMDropdown from './LLMDropdown.vue';
import ImageFileDisplay from './ImageFileDisplay.vue';
import VideoFileDisplay from './VideoFileDisplay.vue';
import AudioFileDisplay from './AudioFileDisplay.vue';
import UploadFromCollectionModal from './UploadFromCollectionModal.vue';
import AudioWaveformVisualizer from './AudioWaveformVisualizer.vue';
import SpinnerIcon from '../../../chat/v2/icons/SpinnerIcon.vue';
import CheckIcon from '../../../chat/v2/icons/CheckIcon.vue';
import AgentMentionDropdown from './AgentMentionDropdown.vue';

// Note: Voice recording state and functions are kept for future use
// but mic button is not currently displayed in the UI

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

const chatLoading = computed(() => {
  return false;
});

const inputText = ref('');
const showSuggestions = ref(false);
const suggestions = ref([]);
const suggestionsLoading = ref(false);
const showAgentsDropdown = ref(false);
const showAttachDropdown = ref(false);
const showModelDropdown = ref(false);
const showUploadFromCollectionModal = ref(false);
const selectedAgents = ref([]); // Changed to array for multiple selection
const llmProviders = ref([]);
const threeDotsButtonRef = ref(null);
const attachButtonRef = ref(null);
const modelButtonRef = ref(null);
const textareaRef = ref(null);

// @ mention state
const showAgentMentionDropdown = ref(false);
const agentMentionQuery = ref('');
const agentMentionStartIndex = ref(-1);
const agentMentionHighlightedIndex = ref(0);
const mentionDropdownPosition = ref({ top: 0, left: 0 });

// Voice recording state
const voiceState = ref('idle'); // 'idle' | 'recording' | 'stopped' | 'transcribing'
let mediaRecorder = null;
let audioChunks = [];
let mediaStream = null;
let audioContext = null;
const analyserNode = ref(null);
let recordedMimeType = 'audio/webm';

const selectedModel = computed(() => context?.selectedModel?.value || context?.selectedModel);
const selectedModelId = computed(
  () => selectedModel.value?.id || selectedModel.value?.value?.id || null
);
const selectedModelLabel = computed(() => {
  return (
    selectedModel.value?.name ||
    selectedModel.value?.display_name ||
    selectedModel.value?.label ||
    selectedModel.value?.id ||
    'Model'
  );
});

const placeholder = computed(() => {
  if (context?.activeCollectionData?.value?.name) {
    return `Chat with ${context.activeCollectionData.value.name}`;
  }
  return 'Chat with Collection';
});

// Determine which agent to show as the inline pill button
// Priority: Deep Search if selected or no selection, otherwise first selected agent
const displayedPillAgent = computed(() => {
  const deepSearchAgent = displayAgentsButtons.value.find((a) => a.name === 'Deep Search');

  if (selectedAgents.value.length === 0) {
    // No agents selected -> show Deep Search (unselected)
    return deepSearchAgent;
  }

  // Check if Deep Search is among selected agents
  const deepSearchSelected = selectedAgents.value.find((a) => a.name === 'Deep Search');
  if (deepSearchSelected) {
    return deepSearchAgent;
  }

  // Otherwise show the first selected agent
  const firstSelected = selectedAgents.value[0];
  return displayAgentsButtons.value.find((a) => a.name === firstSelected.name) || deepSearchAgent;
});

// Check if the displayed pill agent is selected
const isPillAgentSelected = computed(() => {
  if (!displayedPillAgent.value) return false;
  return selectedAgents.value.some((a) => a.name === displayedPillAgent.value.name);
});

const agentsList = [
  {
    name: 'Generate',
    icon: GenerateIcon,
  },
  {
    name: 'Deep Search',
    icon: SearchIcon,
  },
  {
    name: 'Censor',
    icon: CensorIcon,
  },
  {
    name: 'Clip',
    icon: ClipIcon,
  },
  {
    name: 'Subtitle',
    icon: SubtitleIcon,
  },
  {
    name: 'Dubbing',
    icon: DubbingIcon,
  },
  {
    name: 'Edit',
    icon: EditIcon,
  },
];

const displayAgentsButtons = computed(() => {
  const hasVideos = collectionHasVideos.value;
  const selectedAgentNames = selectedAgents.value.map((a) => a.name);

  return agentsList.map((agent) => {
    // Determine disabled state
    let disabled = false;
    if (agent.name === 'Generate') {
      disabled = false; // Generate is always enabled
    } else if (!hasVideos) {
      disabled = true; // All agents except Generate are disabled when no videos
    } else {
      disabled = false; // All agents are enabled when there are videos
    }

    // Check if this agent is selected
    const isSelected = selectedAgentNames.includes(agent.name);

    return {
      ...agent,
      disabled,
      isSelected,
    };
  });
});

// Agents available for @ mention (not yet selected)
const availableAgentsForMention = computed(() => {
  const selectedNames = selectedAgents.value.map((a) => a.name);
  return displayAgentsButtons.value.filter((agent) => !selectedNames.includes(agent.name));
});

// Filtered agents for @ mention dropdown based on query
const filteredMentionAgents = computed(() => {
  let agents = availableAgentsForMention.value;
  if (agentMentionQuery.value) {
    agents = agents.filter((agent) =>
      agent.name.toLowerCase().includes(agentMentionQuery.value.toLowerCase())
    );
  }
  return agents;
});

// Watch for filtered agents change to reset highlighted index
watch(filteredMentionAgents, () => {
  agentMentionHighlightedIndex.value = 0;
});

const canSend = computed(() => {
  return inputText.value.trim().length > 0;
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

  const index = selectedAgents.value.findIndex((a) => a.name === agent.name);
  if (index !== -1) {
    // Remove agent from selection
    selectedAgents.value.splice(index, 1);
  } else {
    // Add agent to selection with source: 'clicked'
    selectedAgents.value.push({ ...agent, source: 'clicked' });
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

const toggleAgentsDropdown = () => {
  showAgentsDropdown.value = !showAgentsDropdown.value;
  if (showAgentsDropdown.value) {
    showAttachDropdown.value = false;
    showModelDropdown.value = false;
  }
};

const toggleAttachDropdown = () => {
  showAttachDropdown.value = !showAttachDropdown.value;
  if (showAttachDropdown.value) {
    showAgentsDropdown.value = false;
    showModelDropdown.value = false;
  }
};

const toggleModelDropdown = () => {
  showModelDropdown.value = !showModelDropdown.value;
  if (showModelDropdown.value) {
    showAgentsDropdown.value = false;
    showAttachDropdown.value = false;
  }
};

const handleModelSelect = (model) => {
  if (context?.handleModelSelect) {
    context.handleModelSelect(model);
  }
};

// File management state
const uploadedFiles = ref([]); // Raw File objects
const collectionAssets = ref([]); // Collection assets (videos, audios, images)
const displayFiles = ref([]); // Formatted files for display

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
  files.forEach((file) => {
    // Determine file type based on MIME type
    let fileType = 'file';
    if (file.type.startsWith('image/')) {
      fileType = 'image';
    } else if (file.type.startsWith('video/')) {
      fileType = 'video';
    } else if (file.type.startsWith('audio/')) {
      fileType = 'audio';
    }

    // Create unique ID for the file
    const fileId = Date.now() + Math.random();

    // Store raw file
    uploadedFiles.value.push({
      id: fileId,
      file: file,
    });

    // Create display file
    const displayFile = {
      id: fileId,
      type: fileType,
      name: file.name,
      size: formatFileSize(file.size),
      isFromDevice: true,
    };

    // For images, create preview URL
    if (fileType === 'image') {
      displayFile.url = URL.createObjectURL(file);
    }

    displayFiles.value.push(displayFile);
  });
};

const removeFile = (index) => {
  const displayFile = displayFiles.value[index];

  // Clean up object URL if it's an image
  if (displayFile.type === 'image' && displayFile.url && displayFile.isFromDevice) {
    URL.revokeObjectURL(displayFile.url);
  }

  // Remove from display files
  displayFiles.value.splice(index, 1);

  // Find and remove corresponding uploaded file or collection asset
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

// Fetch suggestions from the API
const fetchSuggestions = async () => {
  const collectionId = context?.activeCollectionData?.value?.id || context?.collectionId?.value;
  if (!collectionId || suggestionsLoading.value) return;

  suggestionsLoading.value = true;
  try {
    const result = await context?.callApi(`/videodb/collection/${collectionId}/suggestions`);
    if (result?.status === 'success' && result?.data?.suggestions) {
      suggestions.value = result.data.suggestions;
    }
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    suggestions.value = [];
  } finally {
    suggestionsLoading.value = false;
  }
};

// Handle textarea focus - show suggestions
const handleTextareaFocus = () => {
  if (inputText.value.trim() === '' && suggestions.value.length > 0) {
    showSuggestions.value = true;
  }
};

// Handle suggestion click
const handleSuggestionClick = (suggestion) => {
  inputText.value = suggestion.text;
  showSuggestions.value = false;

  // Auto-select the agents from the suggestion
  if (suggestion.agents && suggestion.agents.length > 0) {
    suggestion.agents.forEach((agentName) => {
      const agent = displayAgentsButtons.value.find((a) => a.name === agentName);
      if (agent && !selectedAgents.value.some((a) => a.name === agentName)) {
        selectedAgents.value.push({ ...agent, source: 'suggestion' });
      }
    });
  }

  // Focus the textarea
  nextTick(() => {
    textareaRef.value?.focus();
  });
};

// Handle pill agent button click (toggles the displayed agent)
const handlePillAgentClick = () => {
  const agent = displayedPillAgent.value;
  if (!agent || agent.disabled) return;

  const index = selectedAgents.value.findIndex((a) => a.name === agent.name);
  if (index !== -1) {
    // Deselect
    selectedAgents.value.splice(index, 1);
  } else {
    // Select
    selectedAgents.value.push({ ...agent, source: 'clicked' });
  }
};

// Fetch LLM models and suggestions on mount
onMounted(async () => {
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

  // Fetch suggestions
  fetchSuggestions();
});

// Refetch suggestions when collection changes
watch(
  () => context?.activeCollectionData?.value?.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      suggestions.value = [];
      fetchSuggestions();
    }
  }
);

// Cleanup on unmount
onUnmounted(() => {
  displayFiles.value.forEach((file) => {
    if (file.type === 'image' && file.url && file.isFromDevice) {
      URL.revokeObjectURL(file.url);
    }
  });
  // Cleanup voice recording
  cleanupRecording();
});

const handleUploadFromDevice = () => {
  // This is handled by the file input now
};

const handleUploadFromCollection = () => {
  showUploadFromCollectionModal.value = true;
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

// Auto-resize textarea when inputText changes programmatically (e.g., after transcription)
watch(inputText, () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
      textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 140)}px`;
    }
  });
});

const handleInput = (event) => {
  const textarea = event.target;
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;

  const value = textarea.value;

  // Show/hide suggestions based on input
  if (value.trim() === '' && suggestions.value.length > 0) {
    showSuggestions.value = true;
  } else {
    showSuggestions.value = false;
  }

  // Check if any selected agent's @AgentName was removed from text
  // Only remove agents that were added via @ mention (source: 'mention'), not clicked ones
  selectedAgents.value = selectedAgents.value.filter((agent) => {
    // Keep agents that were clicked (not from @ mention)
    if (agent.source === 'clicked') {
      return true;
    }
    // For mention-sourced agents, check if @AgentName is still in text
    const pattern = `@${agent.name}`;
    return value.includes(pattern);
  });

  // Check for @ mention
  const cursorPos = textarea.selectionStart;

  // Find the last @ before cursor
  const textBeforeCursor = value.substring(0, cursorPos);
  const lastAtIndex = textBeforeCursor.lastIndexOf('@');
  const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ');
  const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
  const lastBreakIndex = Math.max(lastSpaceIndex, lastNewlineIndex);

  if (lastAtIndex !== -1 && lastAtIndex > lastBreakIndex) {
    // We're in an @ mention
    agentMentionStartIndex.value = lastAtIndex;
    agentMentionQuery.value = textBeforeCursor.slice(lastAtIndex + 1);
    showAgentMentionDropdown.value = true;
    agentMentionHighlightedIndex.value = 0;

    // Calculate dropdown position
    updateMentionDropdownPosition();
  } else {
    closeMentionDropdown();
  }
};

const getCaretCoordinates = (element, position) => {
  // Create a mirror div to calculate caret position
  const div = document.createElement('div');
  const style = div.style;
  const computed = window.getComputedStyle(element);

  // Copy textarea styles to the mirror div
  style.whiteSpace = 'pre-wrap';
  style.wordWrap = 'break-word';
  style.position = 'absolute';
  style.visibility = 'hidden';
  style.overflow = 'hidden';

  // Copy relevant styles
  const properties = [
    'fontFamily',
    'fontSize',
    'fontWeight',
    'fontStyle',
    'letterSpacing',
    'textTransform',
    'wordSpacing',
    'textIndent',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'boxSizing',
    'lineHeight',
  ];

  properties.forEach((prop) => {
    style[prop] = computed[prop];
  });

  style.width = `${element.offsetWidth}px`;
  style.height = 'auto';

  div.textContent = element.value.substring(0, position);

  // Add a span at the caret position
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

const updateMentionDropdownPosition = () => {
  if (!textareaRef.value) return;

  const textarea = textareaRef.value;
  const rect = textarea.getBoundingClientRect();

  // Get the caret position at the @ symbol
  const caretPos = getCaretCoordinates(textarea, agentMentionStartIndex.value);

  // Calculate position relative to viewport
  // Account for textarea scroll
  const scrollTop = textarea.scrollTop;
  const caretTop = rect.top + caretPos.top - scrollTop;
  const caretLeft = rect.left + caretPos.left;

  // Position above the @ symbol using bottom positioning
  mentionDropdownPosition.value = {
    bottom: window.innerHeight - caretTop + 4,
    left: caretLeft,
  };
};

const closeMentionDropdown = () => {
  showAgentMentionDropdown.value = false;
  agentMentionQuery.value = '';
  agentMentionStartIndex.value = -1;
  agentMentionHighlightedIndex.value = 0;
};

const selectAgentFromMention = (agent) => {
  if (!textareaRef.value) return;

  const textarea = textareaRef.value;
  const value = inputText.value;
  const startIndex = agentMentionStartIndex.value;
  const cursorPos = textarea.selectionStart;

  // Replace @query with @AgentName
  const beforeMention = value.substring(0, startIndex);
  const afterMention = value.substring(cursorPos);
  inputText.value = `${beforeMention}@${agent.name} ${afterMention}`;

  // Add agent to selected agents with source: 'mention'
  if (!selectedAgents.value.some((a) => a.name === agent.name)) {
    selectedAgents.value.push({ ...agent, source: 'mention' });
  }

  closeMentionDropdown();

  // Focus textarea and set cursor position
  nextTick(() => {
    if (textareaRef.value) {
      const newCursorPos = startIndex + agent.name.length + 2; // +2 for @ and space
      textareaRef.value.focus();
      textareaRef.value.setSelectionRange(newCursorPos, newCursorPos);
    }
  });
};

const handleTextareaKeyDown = (event) => {
  // Handle @ mention navigation first
  if (showAgentMentionDropdown.value && filteredMentionAgents.value.length > 0) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      agentMentionHighlightedIndex.value = Math.max(0, agentMentionHighlightedIndex.value - 1);
      return; // Stop processing
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      agentMentionHighlightedIndex.value = Math.min(
        filteredMentionAgents.value.length - 1,
        agentMentionHighlightedIndex.value + 1
      );
      return; // Stop processing
    } else if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      const selectedAgent = filteredMentionAgents.value[agentMentionHighlightedIndex.value];
      if (selectedAgent && !selectedAgent.disabled) {
        selectAgentFromMention(selectedAgent);
      }
      return; // Stop processing - don't send message
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeMentionDropdown();
      return; // Stop processing
    } else if (event.key === 'Tab') {
      event.preventDefault();
      const selectedAgent = filteredMentionAgents.value[agentMentionHighlightedIndex.value];
      if (selectedAgent && !selectedAgent.disabled) {
        selectAgentFromMention(selectedAgent);
      }
      return; // Stop processing
    }
  }

  // Handle Enter for send (only if mention dropdown is not open)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
};

const handleTextareaBlur = () => {
  // Delay closing to allow click on dropdown items and suggestions
  setTimeout(() => {
    closeMentionDropdown();
    showSuggestions.value = false;
  }, 200);
};

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

    const fileId = asset.id || Math.random();

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

    displayFiles.value.push(displayFile);
  }
};

const hasSearchAgentSelected = computed(() => {
  return selectedAgents.value.some((a) => a.name === 'Deep Search');
});

const handleSend = () => {
  if (!canSend.value) return;

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

  const additionalInfo = hasSearchAgentSelected.value
    ? {
        precision: additionalData.value.precision,
        searchFor: additionalData.value.searchFor,
      }
    : null;

  if (context?.handleAddMessage) {
    const messageData = {
      text: inputText.value,
      agents: selectedAgents.value.map((a) => a.name),
      files: filesToSend,
      uploaded_files: uploadedFilesFromCollection,
      additionalInfo: additionalInfo,
    };

    if (videos.length > 0) {
      messageData.videos = videos;
    }
    if (audios.length > 0) {
      messageData.audios = audios;
    }
    if (voices.length > 0) {
      messageData.voices = voices;
    }
    const modelId = selectedModelId.value;
    if (modelId) {
      messageData.model_name = modelId;
    }

    context.handleAddMessage(messageData);
  }

  // Clean up object URLs before clearing
  displayFiles.value.forEach((file) => {
    if (file.type === 'image' && file.url && file.isFromDevice) {
      URL.revokeObjectURL(file.url);
    }
  });

  // Clear state
  inputText.value = '';
  selectedAgents.value = [];
  uploadedFiles.value = [];
  collectionAssets.value = [];
  displayFiles.value = [];
  additionalData.value = {
    precision: 'exact',
    searchFor: 'scenes',
  };
  closeMentionDropdown();
};
</script>
