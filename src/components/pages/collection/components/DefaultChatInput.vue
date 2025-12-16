<template>
  <div
    class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-10 vdb-c-rounded-20 vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-vdb-lightgrey vdb-c-px-10 vdb-c-pb-10 vdb-c-pt-10 vdb-c-shadow-[0px_0px_4px_0px_rgba(0,0,0,0.04),0px_0px_1px_0px_rgba(0,0,0,0.6)]"
  >
    <!-- Files Container -->
    <div
      v-if="displayFiles.length > 0"
      class="vdb-c-flex vdb-c-w-full vdb-c-gap-12 vdb-c-overflow-x-auto vdb-c-px-4 vdb-c-pt-4"
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
          v-else-if="file.type === 'audio'"
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
      :class="displayFiles.length > 0 ? 'vdb-c-min-h-[40px]' : 'vdb-c-min-h-[72px]'"
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
        <!-- Attach Button -->
        <div class="vdb-c-relative">
          <button
            ref="attachButtonRef"
            @click="toggleAttachDropdown"
            class="vdb-c-flex vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-full vdb-c-border vdb-c-border-[rgba(13,13,13,0.1)] vdb-c-bg-white vdb-c-px-[9px] vdb-c-py-8 vdb-c-transition-all hover:vdb-c-border-[#FFCFA5] hover:vdb-c-bg-[#FFE9D3]"
          >
            <AttachIcon class="vdb-c-h-[16.667px] vdb-c-w-[16.667px] vdb-c-text-vdb-darkishgrey" />
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

        <!-- Agent Buttons -->
        <button
          v-for="agent in visibleAgents.sort((a, b) => Number(a.disabled) - Number(b.disabled))"
          :key="agent.name"
          :disabled="agent.disabled"
          @click="handleAgentClick(agent)"
          :class="[
            'group vdb-c-group vdb-c-relative vdb-c-flex vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-full vdb-c-border vdb-c-px-[9px] vdb-c-py-8 vdb-c-transition-all',
            getAgentButtonClasses(agent),
          ]"
        >
          <Tooltip
            v-if="agent.disabled && !collectionHasVideos"
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

        <!-- Three Dots Button -->
        <div class="vdb-c-relative">
          <button
            ref="threeDotsButtonRef"
            @click="toggleAgentsDropdown"
            class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[33554400px] vdb-c-border vdb-c-border-[rgba(13,13,13,0.1)] vdb-c-bg-white vdb-c-p-8 vdb-c-transition-all hover:vdb-c-border-[#FFCFA5] hover:vdb-c-bg-[#FFE9D3]"
          >
            <ThreeDotsIcon class="vdb-c-h-[16.667px] vdb-c-w-[16.667px]" />
          </button>
          <AgentDropdown
            :is-open="showAgentsDropdown"
            :trigger-element="threeDotsButtonRef"
            :agents="displayAgentsButtons"
            @close="showAgentsDropdown = false"
            @agent-select="handleAgentSelect"
          />
        </div>
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

    <UploadFromCollectionModal
      :is-open="showUploadFromCollectionModal"
      :context="context"
      @close="showUploadFromCollectionModal = false"
      @select="handleCollectionAssetsSelected"
    />
  </div>
</template>
<script setup>
import { ref, computed, inject, onUnmounted } from 'vue';
import AttachIcon from '../../../chat/v2/icons/AttachIcon.vue';
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
import ImageFileDisplay from './ImageFileDisplay.vue';
import VideoFileDisplay from './VideoFileDisplay.vue';
import AudioFileDisplay from './AudioFileDisplay.vue';
import SearchOptions from './SearchOptions.vue';
import Tooltip from '../../../chat/v2/elements/Tooltip.vue';
import UploadFromCollectionModal from './UploadFromCollectionModal.vue';

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
const showAgentsDropdown = ref(false);
const showAttachDropdown = ref(false);
const showUploadFromCollectionModal = ref(false);
const showCursor = ref(true);
const selectedAgent = ref(null);
const threeDotsButtonRef = ref(null);
const attachButtonRef = ref(null);
const placeholder = computed(() => {
  if (context?.activeCollectionData?.value?.name) {
    return `Chat with ${context.activeCollectionData.value.name}`;
  }
  return 'Chat with Collection';
});

const agentsList = [
  {
    name: 'Generate',
    icon: GenerateIcon,
  },
  {
    name: 'Search',
    icon: SearchIcon,
  },
  {
    name: 'Voice',
    icon: VoiceIcon,
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
  const selectedAgentName = selectedAgent.value?.name;

  return agentsList.map((agent) => {
    // Determine display state based on collection state and selection
    let display = false;

    if (hasVideos) {
      // When there are videos:
      // - Search is always visible
      // - If an agent is selected, it replaces Edit (selected agent is visible, Edit is not)
      // - If no agent is selected, Edit is visible
      if (agent.name === 'Search') {
        display = true;
      } else if (selectedAgentName) {
        // An agent is selected: show selected agent, hide Edit
        display = agent.name === selectedAgentName;
      } else {
        // No agent selected: show Edit
        display = agent.name === 'Edit';
      }
    } else {
      // When there are no videos: only Generate and Search are visible
      display = agent.name === 'Generate' || agent.name === 'Search';
    }

    // Determine disabled state
    let disabled = false;
    if (agent.name === 'Generate') {
      disabled = false; // Generate is always enabled
    } else if (!hasVideos) {
      disabled = true; // All agents except Generate are disabled when no videos
    } else {
      disabled = false; // All agents are enabled when there are videos
    }

    return {
      ...agent,
      display,
      disabled,
    };
  });
});

const visibleAgents = computed(() => {
  // Simply return agents that should be displayed, maintaining order
  const agents = displayAgentsButtons.value.filter((agent) => agent.display);

  // Ensure Search comes first, then selected agent (if any)
  const searchAgent = agents.find((agent) => agent.name === 'Search');
  const otherAgents = agents.filter((agent) => agent.name !== 'Search');

  if (searchAgent) {
    return [searchAgent, ...otherAgents];
  }

  return agents;
});

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
  }
};

const toggleAttachDropdown = () => {
  showAttachDropdown.value = !showAttachDropdown.value;
  if (showAttachDropdown.value) {
    showAgentsDropdown.value = false;
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

// Cleanup on unmount
onUnmounted(() => {
  displayFiles.value.forEach((file) => {
    if (file.type === 'image' && file.url && file.isFromDevice) {
      URL.revokeObjectURL(file.url);
    }
  });
});

const handleUploadFromDevice = () => {
  console.log('Upload from device clicked');
  // This is handled by the file input now
};

const handleUploadFromCollection = () => {
  showUploadFromCollectionModal.value = true;
  // TODO: Implement file selection from collection
};

const handleInput = (event) => {
  const textarea = event.target;
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, 72)}px`;
};

const handleCollectionAssetsSelected = async (selectedAssets) => {
  const { activeCollectionData, collectionId: collectionIdRef } = context || {};

  // Get current collection ID from context
  const currentCollectionId =
    activeCollectionData?.value?.id || activeCollectionData?.id || collectionIdRef?.value;

  for (const asset of selectedAssets) {
    console.log(`>> handling ${asset.name} of type ${asset.type}`);
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
    const displayFile = {
      id: fileId,
      type: asset.type.toLowerCase(), // Ensure lowercase: video, audio, image
      name: asset.name || asset.title || `Untitled ${asset.type}`,
      url: null,
      isFromDevice: false,
      collectionId: currentCollectionId || asset.collectionId || asset.collection_id,
      assetId: asset.id,
    };

    displayFiles.value.push(displayFile);
  }
};

const handleSend = () => {
  if (!canSend.value) return;

  // Prepare files for sending (raw File objects from device uploads)
  const filesToSend = uploadedFiles.value.map((f) => f.file);

  // Prepare collection assets as uploaded_files
  const uploadedFilesFromCollection = collectionAssets.value.map((a) => a.asset);

  const additionalInfo =
    selectedAgent.value?.name === 'Search'
      ? {
          precision: additionalData.value.precision,
          searchFor: additionalData.value.searchFor,
        }
      : null;

  if (context?.handleAddMessage) {
    context.handleAddMessage({
      text: inputText.value,
      agents: selectedAgent.value ? [selectedAgent.value.name] : [],
      files: filesToSend,
      uploaded_files: uploadedFilesFromCollection,
      additionalInfo: additionalInfo,
    });
  }

  // Clean up object URLs before clearing
  displayFiles.value.forEach((file) => {
    if (file.type === 'image' && file.url && file.isFromDevice) {
      URL.revokeObjectURL(file.url);
    }
  });

  // Clear state
  inputText.value = '';
  selectedAgent.value = null;
  uploadedFiles.value = [];
  collectionAssets.value = [];
  displayFiles.value = [];
  additionalData.value = {
    precision: 'exact',
    searchFor: 'scenes',
  };
};
</script>
