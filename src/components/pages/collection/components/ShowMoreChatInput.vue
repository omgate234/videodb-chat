<template>
  <div
    class="vdb-c-h-fit vdb-c-w-full vdb-c-border-t vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-20 vdb-c-py-10"
  >
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
          <ImageFileDisplay v-if="file.type === 'image'" :file="file" @remove="removeFile(index)" />
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
        </template>
      </div>
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
        <div
          :class="[
            'vdb-c-chat-input-upload-icon vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-text-[#1E1E1E]',
          ]"
        >
          <button
            ref="plusButtonRef"
            @click="toggleDropUp"
            class="vdb-c-flex vdb-c-size-[36px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-border vdb-c-border-[rgba(13,13,13,0.1)] vdb-c-bg-white hover:vdb-c-border-[#B9B9B9] hover:vdb-c-bg-roy focus:vdb-c-border-orange-200 focus:vdb-c-bg-orange-100"
          >
            <PlusIcon />
          </button>
          <AddDropUp
            :is-open="showDropUp"
            :trigger-element="plusButtonRef"
            :agents="allAgentsForDropdown"
            @close="showDropUp = false"
            @agent-select="handleAgentSelect"
            @files-selected="handleFilesSelected"
            @upload-from-collection="handleUploadFromCollection"
          />
        </div>
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
            @click.stop="showSearchControlsPanel = !showSearchControlsPanel"
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
              @update:precision="additionalData.precision = $event"
              @update:search-for="additionalData.searchFor = $event"
            />
          </button>
        </div>

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

    <UploadFromCollectionModal
      :is-open="showUploadFromCollectionModal"
      :context="context"
      @close="showUploadFromCollectionModal = false"
      @select="handleCollectionAssetsSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed, inject, onUnmounted, watch, nextTick, onMounted } from 'vue';
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
import PlusIcon from '../../../chat/v2/icons/PlusIcon.vue';
import SendIcon from '../../../chat/v2/icons/SendIcon.vue';
import AddDropUp from './AddDropUp.vue';
import ChevronDown from '../../../icons/ChevronDown.vue';
import SearchControlsPanel from './SearchControlsPanel.vue';
import UploadFromCollectionModal from './UploadFromCollectionModal.vue';
import AnimatedEllipsisIcon from '../../../chat/v2/icons/AnimatedEllipsisIcon.vue';

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
const showAgentsDropdown = ref(false);
const showAttachDropdown = ref(false);
const showDropUp = ref(false);
const showUploadFromCollectionModal = ref(false);
const showCursor = ref(true);
const selectedAgent = ref(null);
const threeDotsButtonRef = ref(null);
const attachButtonRef = ref(null);
const plusButtonRef = ref(null);
const controlsButtonRef = ref(null);
const showSearchControlsPanel = ref(false);
const placeholder = computed(() => {
  if (context?.activeCollectionData?.value?.name) {
    return `Chat with "${context.activeCollectionData.value.name}" collection`;
  }
  return 'Chat with Collection';
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
  const selectedAgentName = selectedAgent.value?.name;

  return agentsList.map((agent) => {
    let display = false;

    if (hasVideos) {
      if (agent.name === 'Search') {
        display = true;
      } else if (selectedAgentName) {
        display = agent.name === selectedAgentName;
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

const isControlsActive = computed(() => {
  return selectedAgent.value?.name?.toLowerCase() === 'search';
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
    selectedAgent.value = null;
    showSearchControlsPanel.value = false;
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

const toggleDropUp = () => {
  showDropUp.value = !showDropUp.value;
};

const toggleAgentsDropdown = () => {
  showAgentsDropdown.value = !showAgentsDropdown.value;
  if (showAgentsDropdown.value) {
    showAttachDropdown.value = false;
    showDropUp.value = false;
  }
};

const toggleAttachDropdown = () => {
  showAttachDropdown.value = !showAttachDropdown.value;
  if (showAttachDropdown.value) {
    showAgentsDropdown.value = false;
    showDropUp.value = false;
  }
};

const uploadedFiles = ref([]);
const collectionAssets = ref([]);
const displayFiles = ref([]);

const additionalData = ref({
  precision: 'exact',
  searchFor: 'videos',
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

const handleClickOutside = (event) => {
  if (
    controlsButtonRef.value &&
    !controlsButtonRef.value.contains(event.target) &&
    showSearchControlsPanel.value
  ) {
    showSearchControlsPanel.value = false;
  }
};

watch(
  () => selectedAgent.value?.name?.toLowerCase() === 'search',
  (isSearchSelected) => {
    if (isSearchSelected) {
      showSearchControlsPanel.value = true;
    } else {
      showSearchControlsPanel.value = false;
    }
  }
);

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  displayFiles.value.forEach((file) => {
    if (file.type === 'image' && file.url && file.isFromDevice) {
      URL.revokeObjectURL(file.url);
    }
  });
  window.removeEventListener('click', handleClickOutside);
});

const handleUploadFromDevice = () => {
  console.log('Upload from device clicked');
};

const handleUploadFromCollection = () => {
  showUploadFromCollectionModal.value = true;
  showDropUp.value = false;
};

const handleCollectionAssetsSelected = async (selectedAssets) => {
  const { generateImageUrl, generateAudioUrl } = context || {};

  for (const asset of selectedAssets) {
    if (!asset || !asset.type) {
      console.warn('Invalid asset skipped:', asset);
      continue;
    }

    console.log('>>> asset', asset);

    const fileId = Date.now() + Math.random() + (asset.id || Math.random());

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
    };

    // Generate URL for images (required for ImageFileDisplay validator)
    if (displayFile.type === 'image' && generateImageUrl) {
      try {
        const collectionId = asset.collectionId || asset.collection_id;
        if (collectionId && asset.id) {
          const result = await generateImageUrl(collectionId, asset.id);
          if (result?.url) {
            displayFile.url = result.url;
          }
        }
      } catch (error) {
        console.warn('Failed to generate image URL:', error);
      }
    }

    // Generate URL for audios (optional, but useful for preview)
    if (displayFile.type === 'audio' && generateAudioUrl) {
      try {
        const collectionId = asset.collectionId || asset.collection_id;
        if (collectionId && asset.id) {
          const result = await generateAudioUrl(collectionId, asset.id);
          if (result?.url) {
            displayFile.url = result.url;
          }
        }
      } catch (error) {
        console.warn('Failed to generate audio URL:', error);
      }
    }

    // Add to displayFiles - component validators will handle missing properties
    displayFiles.value.push(displayFile);
  }
};

const handleInput = (event) => {
  const textarea = event.target;
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, 72)}px`;
};

const handleSend = () => {
  if (!canSend.value) return;

  // Prepare files for sending (raw File objects)
  const filesToSend = uploadedFiles.value.map((f) => f.file);

  // Separate collection assets by type
  const videos = collectionAssets.value.filter((a) => a.asset.type === 'video').map((a) => a.asset);
  const audios = collectionAssets.value.filter((a) => a.asset.type === 'audio').map((a) => a.asset);
  const images = collectionAssets.value
    .filter((a) => a.asset.type === 'image')
    .map((a) => ({
      image_id: a.asset.id,
      url: displayFiles.value.find((f) => f.id === a.id)?.url || null,
    }));

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
      videos: videos,
      audios: audios,
      images: images,
      additionalInfo: additionalInfo,
    });
  }

  displayFiles.value.forEach((file) => {
    if (file.type === 'image' && file.url && file.isFromDevice) {
      URL.revokeObjectURL(file.url);
    }
  });

  inputText.value = '';
  selectedAgent.value = null;
  uploadedFiles.value = [];
  collectionAssets.value = [];
  displayFiles.value = [];
  additionalData.value = {
    precision: 'exact',
    searchFor: 'videos',
  };
  showSearchControlsPanel.value = false;
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
