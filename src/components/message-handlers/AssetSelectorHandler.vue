<template>
  <div
    class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-8 vdb-c-py-14 vdb-c-text-left"
  >
    <LoadingMessage
      v-if="!isUser"
      :status="content.status"
      :message="content.status_message"
      :is-last-conv="isLastConv"
    />

    <!-- Upload UI (outside modal container) -->
    <div
      v-if="showUploadUI && uploadStatus"
      class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-20 vdb-c-py-14 vdb-c-text-left"
    >
      <!-- Upload Status Header -->
      <div class="vdb-c-flex vdb-c-h-24 vdb-c-items-center vdb-c-gap-8">
        <div class="vdb-c-size-20 vdb-c-overflow-hidden">
          <SpinnerIcon v-if="uploadStatus.status !== 'success'" class="vdb-c-size-20" />
          <SuccessIcon v-else class="vdb-c-size-20" />
        </div>
        <div
          class="vdb-c-text-[14px] vdb-c-font-semibold vdb-c-leading-[22px] vdb-c-text-[#1E1E1E]"
        >
          {{
            uploadStatus.status === 'success'
              ? 'Your assets were loaded. Working on them for your query...'
              : 'Upload in progress'
          }}
        </div>
      </div>

      <!-- Warning Alert -->
      <div
        v-if="uploadStatus.status !== 'success'"
        class="vdb-c-flex vdb-c-w-full vdb-c-items-start vdb-c-gap-8 vdb-c-rounded-[12px] vdb-c-border vdb-c-border-[#F8C450] vdb-c-bg-[#FEFCE8] vdb-c-p-12"
      >
        <!-- Warning Icon -->
        <div class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-start">
          <div class="vdb-c-size-20 vdb-c-overflow-hidden">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.85465 17.0826C2.71340 17.0826 2.58653 17.0481 2.47403 16.979C2.36153 16.9101 2.27409 16.819 2.21173 16.7059C2.14674 16.5937 2.10431 16.4722 2.09777 16.3413C2.09124 16.2105 2.12653 16.0809 2.21027 15.9526L9.34427 3.62927C9.42148 3.50094 9.51798 3.40608 9.63381 3.34469C9.74981 3.28331 9.87186 3.25261 10.0001 3.25261C10.1283 3.25261 10.2503 3.28331 10.3663 3.44469C10.4821 3.50608 10.5786 3.50094 10.6558 3.62927L17.7898 15.9526C17.8736 16.0809 17.9089 16.2105 17.9024 16.3413C17.8958 16.4722 17.8534 16.5937 17.7884 16.7059C17.7261 16.819 17.6386 16.9101 17.5261 16.979C17.4136 17.0481 17.2867 17.0826 17.1455 17.0826H2.85465ZM10.0001 14.8391C10.1907 14.8391 10.3506 14.7745 10.4797 14.6455C10.6087 14.5165 10.6732 14.3566 10.6732 14.166C10.6732 13.9753 10.6087 13.8154 10.4797 13.6863C10.3506 13.5573 10.1907 13.4928 10.0001 13.4928C9.8094 13.4928 9.64954 13.5573 9.52048 13.6863C9.39148 13.8154 9.32698 13.9753 9.32698 14.166C9.32698 14.3566 9.39148 14.5165 9.52048 14.6455C9.64954 14.7745 9.8094 14.8391 10.0001 14.8391ZM10.0002 12.6594C10.1774 12.6594 10.3259 12.5996 10.4454 12.4798C10.5652 12.3601 10.625 12.2115 10.625 12.0344V9.1178C10.625 8.94075 10.5651 8.79232 10.4453 8.67261C10.3254 8.55277 10.1769 8.49286 9.99987 8.49286C9.82267 8.49286 9.67423 8.55277 9.55452 8.67261C9.43465 8.79232 9.37471 8.94075 9.37471 9.1178V12.0344C9.37471 12.2115 9.43467 12.3601 9.55452 12.4798C9.67417 12.5996 9.82265 12.6594 10.0002 12.6594Z"
                fill="#8E4B10"
              />
            </svg>
          </div>
        </div>

        <!-- Warning Content -->
        <div
          class="vdb-c-min-w-0 vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-gap-6 vdb-c-pb-0 vdb-c-pl-0 vdb-c-pr-0 vdb-c-pt-[1px]"
        >
          <div
            class="vdb-c-flex vdb-c-w-full vdb-c-items-start vdb-c-py-0 vdb-c-pl-0 vdb-c-pr-[35px]"
          >
            <p
              class="vdb-c-min-w-0 vdb-c-flex-1 vdb-c-text-[16px] vdb-c-font-semibold vdb-c-leading-normal vdb-c-text-[#8E4B10]"
            >
              Warning
            </p>
          </div>
          <div
            class="vdb-c-w-full vdb-c-text-[14px] vdb-c-font-normal vdb-c-leading-[1.6] vdb-c-text-[#92400E]"
          >
            <p class="vdb-c-mb-0 vdb-c-font-bold">Keep this tab open while files are uploading.</p>
            <p class="vdb-c-mb-0">
              Closing it may interrupt the upload, and this chat won't be saved.
            </p>
            <p class="vdb-c-mb-0">&nbsp;</p>
            <p class="vdb-c-mb-0">
              You can start a new chat or open Director in another tab while uploads continue in the
              background.
            </p>
          </div>
        </div>
      </div>

      <!-- Files List -->
      <div
        v-if="uploadStatus"
        class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-6 vdb-c-rounded-[12px] vdb-c-bg-[#F7F7F7] vdb-c-p-10"
      >
        <VideoFileDisplay
          v-if="uploadStatus.type === 'video'"
          :file="uploadStatus"
          :full-width="true"
          class="vdb-c-p-12"
        />
        <AudioFileDisplay
          v-else-if="uploadStatus.type === 'audio' || uploadStatus.type === 'voices'"
          :file="uploadStatus"
          :full-width="true"
          class="vdb-c-p-12"
        />
      </div>
    </div>

    <!-- Modal Container (hidden during upload) -->
    <transition name="fade" mode="out-in">
      <div
        v-if="(content.status === 'success' || content.status === 'progress') && !showUploadUI"
        class="vdb-c-flex vdb-c-w-full vdb-c-max-w-[640px] vdb-c-flex-col vdb-c-overflow-hidden vdb-c-rounded-[16px] vdb-c-border vdb-c-border-[#E5E7EB] vdb-c-bg-white"
      >
        <!-- Header -->
        <div class="vdb-c-flex vdb-c-items-center vdb-c-px-[20px] vdb-c-py-[12px]">
          <h2
            class="vdb-c-flex-1 vdb-c-text-[15px] vdb-c-font-semibold vdb-c-capitalize vdb-c-leading-[20px] vdb-c-text-[#1E1E1E]"
          >
            {{ title }}
          </h2>
        </div>

        <!-- Body -->
        <div
          class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-[16px] vdb-c-overflow-clip vdb-c-border-t vdb-c-border-[#E5E7EB] vdb-c-bg-white vdb-c-p-[20px]"
        >
          <!-- Choose from Asset Library Button -->
          <button
            v-if="!showUploadUI"
            @click="showAssetLibraryModal = true"
            :disabled="!isInteractive"
            :class="[
              'vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[4px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#C14103] vdb-c-bg-[#FFF5EC] vdb-c-p-[9px] vdb-c-transition-colors',
              isInteractive
                ? 'hover:vdb-c-bg-[#FFE9D3]'
                : 'vdb-c-cursor-not-allowed vdb-c-opacity-50',
            ]"
          >
            <FolderIcon
              :stroke-color="'#821F0C'"
              class="vdb-c-h-[16.667px] vdb-c-w-[16.667px] vdb-c-shrink-0"
            />
            <span
              class="vdb-c-flex-1 vdb-c-text-left vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#821F0C]"
            >
              Choose from asset library
            </span>
          </button>

          <!-- Or Divider -->
          <div
            v-if="!showUploadUI"
            class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-center"
          >
            <div
              class="vdb-c-absolute vdb-c-inset-0 vdb-c-flex vdb-c-items-center vdb-c-justify-center"
            >
              <div class="vdb-c-h-px vdb-c-w-full vdb-c-border-t vdb-c-border-[#C5C1BA]"></div>
            </div>
            <div
              class="vdb-c-relative vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-bg-white vdb-c-px-[8px]"
            >
              <span
                class="vdb-c-text-[11.3px] vdb-c-font-normal vdb-c-uppercase vdb-c-leading-[18px] vdb-c-text-[#969696]"
              >
                Or
              </span>
            </div>
          </div>

          <!-- Drop Zone -->
          <div
            v-if="!showUploadUI"
            :class="[
              'vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-[12px] vdb-c-rounded-[12px] vdb-c-border-2 vdb-c-border-dashed vdb-c-px-[48px] vdb-c-py-[24px] vdb-c-transition-colors',
              !isInteractive
                ? 'vdb-c-cursor-not-allowed vdb-c-border-[#B9B9B9] vdb-c-bg-[#F7F7F7] vdb-c-opacity-50'
                : isDragging
                  ? 'vdb-c-border-[#EC5B16] vdb-c-bg-[#FFF5F0]'
                  : 'vdb-c-cursor-pointer vdb-c-border-[#B9B9B9] vdb-c-bg-[#F7F7F7] hover:vdb-c-border-[#EC5B16]',
            ]"
            @dragenter.prevent="isInteractive && handleDragEnter($event)"
            @dragleave.prevent="isInteractive && handleDragLeave($event)"
            @dragover.prevent="isInteractive && handleDragOver($event)"
            @drop.prevent="isInteractive && handleDrop($event)"
            @click="isInteractive && triggerFileInput()"
          >
            <input
              type="file"
              ref="fileInputEl"
              class="vdb-c-hidden"
              accept="audio/*,video/*"
              :disabled="!isInteractive"
              @change="handleFileSelect"
            />
            <!-- Upload Icon -->
            <div
              class="vdb-c-flex vdb-c-items-center vdb-c-rounded-[66.667px] vdb-c-border-[1.333px] vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-[8px]"
            >
              <UploadFileIcon :stroke-color="'#000000'" class="vdb-c-h-[32px] vdb-c-w-[32px]" />
            </div>

            <!-- Upload Instructions -->
            <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center">
              <p
                class="vdb-c-text-[13px] vdb-c-font-semibold vdb-c-leading-[20px] vdb-c-text-[#1E1E1E]"
              >
                <span>Click to upload&nbsp;</span>
                <span class="vdb-c-font-normal vdb-c-text-[#6B7280]"> </span>
                <span class="vdb-c-font-normal">or drag and drop</span>
              </p>
            </div>
          </div>

          <!-- Selected Asset from Library -->
          <div
            v-if="hasSelectedAsset && !showUploadUI"
            class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-[6px] vdb-c-rounded-[12px] vdb-c-bg-[#F7F7F7] vdb-c-p-[10px]"
          >
            <div
              class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-[10px] vdb-c-bg-white vdb-c-p-6"
            >
              <div class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center vdb-c-gap-6">
                <span
                  class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-[#1E1E1E]"
                >
                  {{ selectedAssetFromLibrary.name }}
                </span>
              </div>
              <button
                @click="selectedAssetFromLibrary = null"
                class="vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-items-center vdb-c-justify-center vdb-c-text-[#1E1E1E] hover:vdb-c-opacity-70"
              >
                <CrossIcon fill="#1E1E1E" class="vdb-c-h-16 vdb-c-w-16" />
              </button>
            </div>
          </div>

          <!-- Files Added Container (before upload) -->
          <div
            v-if="hasUploadedFiles && !uploadStatus"
            class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-[6px] vdb-c-rounded-[12px] vdb-c-bg-[#F7F7F7] vdb-c-p-[10px]"
          >
            <div
              class="vdb-c-uploaded-files-container vdb-c-flex vdb-c-max-h-[156px] vdb-c-flex-col vdb-c-gap-[6px] vdb-c-overflow-y-auto"
              style="scrollbar-gutter: stable"
            >
              <template v-for="(file, index) in displayFiles" :key="file.id || index">
                <VideoFileDisplay
                  v-if="file.type === 'video'"
                  :file="file"
                  @remove="removeFile(index)"
                  class="!vdb-c-w-full"
                />
                <AudioFileDisplay
                  v-else-if="file.type === 'audio'"
                  :file="file"
                  @remove="removeFile(index)"
                  class="!vdb-c-w-full"
                />
              </template>
            </div>
          </div>

          <!-- URL Input -->
          <div v-if="!showUploadUI" class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[8px]">
            <label
              class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-tracking-[0.065px] vdb-c-text-[#1E1E1E]"
            >
              Upload via URL
            </label>
            <input
              type="text"
              :placeholder="urlPlaceholder"
              :disabled="!isInteractive"
              class="vdb-c-w-full vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-[12px] vdb-c-py-[9px] vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-tracking-[0.065px] vdb-c-text-[#1E1E1E] placeholder:vdb-c-text-[#969696] focus:vdb-c-border-[#EC5B16] focus:vdb-c-outline-none disabled:vdb-c-cursor-not-allowed disabled:vdb-c-opacity-50"
              v-model="url"
              @input="handleUrlInput"
            />
          </div>
        </div>

        <!-- Footer -->
        <div
          v-if="!showUploadUI"
          class="vdb-c-flex vdb-c-items-center vdb-c-justify-end vdb-c-gap-[10px] vdb-c-border-t vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-[20px] vdb-c-py-[12px]"
        >
          <button
            @click="handleSubmit"
            :disabled="!canSubmit || !isInteractive"
            :class="[
              'vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[10px] vdb-c-rounded-[8px] vdb-c-px-[16px] vdb-c-py-[10px] vdb-c-transition-colors',
              canSubmit && isInteractive
                ? 'vdb-c-bg-[#EC5B16] hover:vdb-c-bg-[#D65214]'
                : 'vdb-c-cursor-not-allowed vdb-c-bg-[#969696]',
            ]"
          >
            <span class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[16px] vdb-c-text-white">
              Submit
            </span>
          </button>
        </div>
      </div>
      <div v-else-if="content.status === 'not_generated'" class="vdb-c-flex vdb-c-flex-col"></div>
    </transition>

    <!-- Asset Library Modal -->
    <RadioUploadFromCollectionModal
      :is-open="showAssetLibraryModal"
      :context="context"
      :single-selection="true"
      @close="showAssetLibraryModal = false"
      @select="handleAssetSelectFromModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import LoadingMessage from './elements/LoadingMessage.vue';
import FolderIcon from '../chat/v2/icons/FolderIcon.vue';
import UploadFileIcon from '../chat/v2/icons/UploadFileIcon.vue';
import VideoFileDisplay from '../pages/collection/components/VideoFileDisplay.vue';
import AudioFileDisplay from '../pages/collection/components/AudioFileDisplay.vue';
import ImageFileDisplay from '../chat/v2/UploadImageFileDisplay.vue';
import RadioUploadFromCollectionModal from '../pages/collection/components/RadioUploadFromCollectionModal.vue';
import CrossIcon from '../icons/Cross.vue';
import SpinnerIcon from '../chat/v2/icons/SpinnerIcon.vue';
import SuccessIcon from '../chat/v2/icons/SuccessIcon.vue';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  isUser: {
    type: Boolean,
    default: false,
  },
  isLastConv: {
    type: Boolean,
    default: false,
  },
  currentMessageIndex: {
    type: Number,
    required: true,
  },
  messageList: {
    type: Array,
    required: true,
  },
  searchTerm: {
    type: String,
    default: '',
  },
  convId: {
    type: String,
    default: '',
  },
  msgId: {
    type: String,
    default: '',
  },
  openCanvas: {
    type: Function,
    default: null,
  },
  canvasState: {
    type: Object,
    default: () => ({}),
  },
  closeCanvas: {
    type: Function,
    default: null,
  },
  callApi: {
    type: Function,
    default: null,
  },
  addMessage: {
    type: Function,
    default: null,
  },
});

const context = inject('videodb-chat-context');
const handleUpload = context?.handleUpload;
const handleAddMessage = context?.handleAddMessage;
const uploadMedia = context?.uploadMedia;

const collectionId = computed(() => {
  return props.content?.asset_selector?.collection_id || null;
});

const title = computed(() => {
  return props.content?.asset_selector?.title || 'Select voice source';
});

const urlPlaceholder = computed(() => {
  return props.content?.asset_selector?.url_placeholder || 'Paste audio file URL';
});

let dragCounter = 0;
const isDragging = ref(false);
const url = ref('');
const fileInput = ref([]);
const fileInputEl = ref(null);
const isUploading = ref(false);
const showAssetLibraryModal = ref(false);
const selectedAssetFromLibrary = ref(null);
const uploadStatus = ref(null);
const showUploadUI = ref(false);

const hasUploadedFiles = computed(() => fileInput.value.length > 0);
const hasSelectedAsset = computed(() => selectedAssetFromLibrary.value !== null);

const isInteractive = computed(() => {
  const isLastMessageInConv = props.currentMessageIndex === props.messageList.length - 1;
  return props.isLastConv && isLastMessageInConv;
});

const canSubmit = computed(() => {
  if (showUploadUI.value) return false;
  if (!isInteractive.value) return false;
  const hasSource = hasUploadedFiles.value || url.value.trim() || hasSelectedAsset.value;
  return hasSource && collectionId.value && !isUploading.value;
});

const displayFiles = computed(() => {
  return fileInput.value.map((file) => {
    let fileType = 'file';
    if (file.type.startsWith('image/')) {
      fileType = 'image';
    } else if (file.type.startsWith('video/')) {
      fileType = 'video';
    } else if (file.type.startsWith('audio/')) {
      fileType = 'audio';
    }

    return {
      id: Date.now() + Math.random(),
      type: fileType,
      name: file.name,
      size: formatFileSize(file.size),
      file: file,
    };
  });
});

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + ' ' + sizes[i];
};

const handleAssetSelectFromModal = async (assets) => {
  if (assets && assets.length > 0) {
    const asset = assets[0];
    showAssetLibraryModal.value = false;

    // Directly call handleAddMessage for collection assets
    if (handleAddMessage) {
      const assetName = asset.name || 'asset';
      const assetType = asset.type === 'voices' ? 'voice' : asset.type;

      const messageText = `use this ${assetType} with name ${assetName}`;

      const messageData = {
        text: messageText,
        uploaded_files: [asset],
      };

      if (asset.type === 'video') {
        messageData.videos = [asset];
      } else if (asset.type === 'audio') {
        messageData.audios = [asset];
      } else if (asset.type === 'voices') {
        messageData.voices = [asset];
      }

      await handleAddMessage(messageData);
    }
  }
};

const handleDragEnter = (e) => {
  e.preventDefault();
  dragCounter++;
  isDragging.value = true;
};

const handleDragLeave = (e) => {
  e.preventDefault();
  dragCounter--;
  if (dragCounter === 0) {
    isDragging.value = false;
  }
};

const handleDragOver = (e) => {
  e.preventDefault();
  isDragging.value = true;
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragging.value = false;
  dragCounter = 0;

  const files = Array.from(e.dataTransfer.files);
  const validFiles = files.filter(
    (file) => file.type.startsWith('audio/') || file.type.startsWith('video/')
  );

  if (validFiles.length > 0) {
    // Only allow 1 file - take the first one
    fileInput.value = [validFiles[0]];
    selectedAssetFromLibrary.value = null;
    url.value = '';
  }
};

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    // Only allow 1 file - take the first one
    const validFile = files.find(
      (file) => file.type.startsWith('audio/') || file.type.startsWith('video/')
    );
    if (validFile) {
      fileInput.value = [validFile];
      selectedAssetFromLibrary.value = null;
      url.value = '';
    }
  }
};

const triggerFileInput = () => {
  fileInputEl.value?.click();
};

const removeFile = (index) => {
  fileInput.value.splice(index, 1);
  selectedAssetFromLibrary.value = null;
};

const handleUrlInput = () => {
  // Clear file input and selected asset when URL is entered
  if (url.value.trim()) {
    fileInput.value = [];
    selectedAssetFromLibrary.value = null;
  }
};

const handleSubmit = async () => {
  if (!canSubmit.value || !uploadMedia || !collectionId.value) return;

  isUploading.value = true;
  showUploadUI.value = true;

  let fileName = '';
  let fileType = 'audio';

  try {
    let uploadData;

    if (url.value.trim()) {
      fileName = url.value.split('/').pop() || url.value;
      uploadData = {
        source: { url: url.value },
        sourceType: 'url',
        collectionId: collectionId.value,
      };
    } else if (hasUploadedFiles.value && fileInput.value.length > 0) {
      const file = fileInput.value[0];
      fileName = file.name;
      fileType = file.type.startsWith('video/') ? 'video' : 'audio';
      uploadData = {
        source: file,
        sourceType: 'file',
        collectionId: collectionId.value,
      };
    } else {
      return;
    }

    uploadStatus.value = {
      type: fileType,
      name: fileName,
      size: fileInput.value[0]?.size ? formatFileSize(fileInput.value[0].size) : '0 B',
      status: 'pending',
    };

    const response = await uploadMedia(uploadData);

    if (response?.ok || response?.status === 'READY') {
      let uploadResData;
      try {
        if (response.json && typeof response.json === 'function') {
          uploadResData = await response.json();
        } else if (response.data) {
          uploadResData = response.data;
        } else if (response.status === 'READY') {
          uploadResData = response;
        } else {
          uploadResData = response;
        }
      } catch (e) {
        console.error('Error parsing upload response:', e);
        uploadResData = response;
      }

      uploadStatus.value.status = 'success';

      const uploadedId = uploadResData?.id || uploadResData?.video_id || uploadResData?.audio_id;
      const uploadedAsset = {
        id: uploadedId,
        name: fileName,
        type: fileType,
        collection_id: collectionId.value,
      };

      if (handleAddMessage) {
        const assetType = fileType === 'video' ? 'video' : 'audio';
        const messageText = `use this ${assetType} with name ${fileName}`;

        const messageData = {
          text: messageText,
          uploaded_files: [uploadedAsset],
        };

        if (fileType === 'video') {
          messageData.videos = [uploadedAsset];
        } else {
          messageData.audios = [uploadedAsset];
        }

        await handleAddMessage(messageData);
      }

      setTimeout(() => {
        url.value = '';
        fileInput.value = [];
        selectedAssetFromLibrary.value = null;
        uploadStatus.value = null;
        showUploadUI.value = false;
      }, 1000);
    } else {
      uploadStatus.value.status = 'failure';
      uploadStatus.value.errorMessage = 'Upload failed. Please try again.';
    }
  } catch (error) {
    console.error('Error uploading files:', error);
    if (uploadStatus.value) {
      uploadStatus.value.status = 'failure';
      uploadStatus.value.errorMessage = error?.message || 'Upload failed. Please try again.';
    }
  } finally {
    isUploading.value = false;
  }
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

/* Scrollbar styles for files container */
.vdb-c-uploaded-files-container::-webkit-scrollbar {
  width: 4px;
}

.vdb-c-uploaded-files-container::-webkit-scrollbar-track {
  background: transparent;
}

.vdb-c-uploaded-files-container::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 999px;
}

.vdb-c-uploaded-files-container::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

.vdb-c-uploaded-files-container {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}
</style>
