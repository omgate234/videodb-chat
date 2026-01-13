<template>
  <div
    v-if="showUploadDialog"
    class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-[1001] vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-bg-black/50 vdb-c-p-24"
    @click="handleCancel"
  >
    <div
      class="vdb-c-shadow-xl vdb-c-flex vdb-c-w-[540px] vdb-c-flex-col vdb-c-overflow-clip vdb-c-rounded-[20px] vdb-c-border vdb-c-border-[#E5E7EB] vdb-c-bg-white"
      @click.stop
    >
      <!-- Header -->
      <div class="vdb-c-flex vdb-c-items-center vdb-c-p-[20px]">
        <h2
          class="vdb-c-flex-1 vdb-c-text-[20px] vdb-c-font-semibold vdb-c-capitalize vdb-c-leading-[1.5] vdb-c-text-[#1E1E1E]"
        >
          Upload Files
        </h2>
        <button
          @click="handleCancel"
          class="vdb-c-flex vdb-c-h-[23.594px] vdb-c-w-[23.594px] vdb-c-items-center vdb-c-justify-center vdb-c-overflow-clip vdb-c-text-[#1E1E1E] hover:vdb-c-opacity-70"
        >
          <CrossIcon class="vdb-c-h-full vdb-c-w-full" :fill="'#1E1E1E'" />
        </button>
      </div>

      <!-- Body -->
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-[20px] vdb-c-overflow-clip vdb-c-border-t vdb-c-border-[#E5E7EB] vdb-c-bg-white vdb-c-p-[20px]"
      >
        <!-- Drop Zone and Files Container -->
        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[10px]">
          <!-- Drop Zone -->
          <div
            :class="[
              'vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-[16px] vdb-c-rounded-[12px] vdb-c-border-2 vdb-c-border-dashed vdb-c-px-[48px] vdb-c-py-[20px] vdb-c-transition-colors',
              isDragging
                ? 'vdb-c-border-[#EC5B16] vdb-c-bg-[#FFF5F0]'
                : 'vdb-c-cursor-pointer vdb-c-border-[#B9B9B9] vdb-c-bg-[#F7F7F7] hover:vdb-c-border-[#EC5B16]',
            ]"
            @dragenter.prevent="handleDragEnter"
            @dragleave.prevent="handleDragLeave"
            @dragover.prevent="handleDragOver"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input
              type="file"
              ref="fileInputEl"
              class="vdb-c-hidden"
              accept="audio/*,video/*,image/*"
              multiple
              @change="handleFileSelect"
            />
            <!-- Upload Icon -->
            <div
              class="vdb-c-flex vdb-c-items-center vdb-c-rounded-[66.667px] vdb-c-border-[1.333px] vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-[8px]"
            >
              <UploadFileIcon :stroke-color="'#000000'" class="vdb-c-h-[32px] vdb-c-w-[32px]" />
            </div>

            <!-- Upload Instructions -->
            <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[6px]">
              <p
                class="vdb-c-text-[14px] vdb-c-font-semibold vdb-c-leading-normal vdb-c-tracking-[0.07px] vdb-c-text-[#1E1E1E]"
              >
                Select a file or drag and drop here
              </p>
              <p
                class="vdb-c-text-[12px] vdb-c-font-normal vdb-c-leading-[18px] vdb-c-text-[#464646]"
              >
                All video, audio and image formats supported.
              </p>
            </div>
          </div>

          <!-- Files Added Container -->
          <div
            v-if="hasUploadedFiles"
            class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-[6px] vdb-c-rounded-[12px] vdb-c-bg-[#F7F7F7] vdb-c-p-[10px]"
          >
            <div
              class="vdb-c-uploaded-files-container vdb-c-flex vdb-c-max-h-[156px] vdb-c-flex-col vdb-c-gap-[6px] vdb-c-overflow-y-auto"
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
                <ImageFileDisplay
                  v-else-if="file.type === 'image'"
                  :file="file"
                  @remove="removeFile(index)"
                />
              </template>
            </div>
          </div>
        </div>

        <!-- URL Input -->
        <BigInput
          v-model="url"
          label="Or upload from URL"
          placeholder="Add file URL"
          type="text"
          :allow-clear="true"
        />

        <!-- Collection Selection -->
        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[8px]">
          <label
            class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-normal vdb-c-tracking-[0.07px] vdb-c-text-[#1E1E1E]"
          >
            Add files to
          </label>
          <div class="vdb-c-relative">
            <!-- Backdrop overlay for dropdown -->
            <div
              v-if="isDropdownOpen"
              class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-40"
              @click="isDropdownOpen = false"
            ></div>

            <button
              @click.stop="toggleDropdown"
              :disabled="isCreatingCollection && collections.length === 0"
              :class="[
                'vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[4px] vdb-c-rounded-[8px] vdb-c-border vdb-c-p-[9px] vdb-c-transition-colors',
                isCreatingCollection && collections.length === 0
                  ? 'vdb-c-cursor-not-allowed vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-opacity-60'
                  : isDropdownOpen
                    ? 'vdb-c-border-[#FFCFA5] vdb-c-bg-[#FFE9D3]'
                    : 'vdb-c-border-[#EFEFEF] vdb-c-bg-white hover:vdb-c-bg-[#F7F7F7]',
              ]"
            >
              <FolderIcon
                v-if="isDropdownOpen"
                :stroke-color="'#821F0C'"
                class="vdb-c-h-[16.667px] vdb-c-w-[16.667px] vdb-c-shrink-0"
              />
              <span
                :class="[
                  'vdb-c-flex-1 vdb-c-text-left vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px]',
                  isDropdownOpen ? 'vdb-c-text-[#821F0C]' : 'vdb-c-text-[#000000]',
                ]"
              >
                {{
                  isCreatingCollection && collections.length === 0
                    ? 'Creating collection...'
                    : selectedCollection
                      ? collections.find((c) => c.id === selectedCollection)?.name
                      : 'Select Collection'
                }}
              </span>
              <ChevronDownIcon
                :class="[
                  'vdb-c-h-[16.667px] vdb-c-w-[16.667px] vdb-c-shrink-0 vdb-c-transition-transform',
                  { 'vdb-c-rotate-180': isDropdownOpen },
                ]"
                :stroke-color="isDropdownOpen ? '#821F0C' : '#1E1E1E'"
                :stroke-width="2"
              />
            </button>

            <!-- Dropdown Menu (positioned absolutely below) -->
            <div
              v-if="isDropdownOpen"
              class="vdb-c-absolute vdb-c-bottom-[calc(100%+8px)] vdb-c-left-0 vdb-c-right-0 vdb-c-z-50 vdb-c-flex vdb-c-max-h-[252px] vdb-c-flex-col vdb-c-overflow-hidden vdb-c-rounded-[12px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-[8px] vdb-c-shadow-[0px_23px_6px_0px_rgba(0,0,0,0),0px_15px_6px_0px_rgba(0,0,0,0.01),0px_8px_5px_0px_rgba(0,0,0,0.02),0px_4px_4px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.03)]"
              @click.stop
            >
              <div
                class="vdb-c-collections-dropdown-container vdb-c-flex vdb-c-flex-col vdb-c-gap-[2px] vdb-c-overflow-y-auto"
                style="scrollbar-gutter: stable"
              >
                <button
                  v-for="collection in collections"
                  :key="collection.id"
                  @click.stop="selectCollection(collection.id)"
                  :class="[
                    'vdb-c-flex vdb-c-items-center vdb-c-gap-[6px] vdb-c-rounded-[10px] vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-text-left vdb-c-transition-colors',
                    selectedCollection === collection.id
                      ? 'vdb-c-bg-[#FFE9D3]'
                      : 'hover:vdb-c-bg-[#F7F7F7]',
                  ]"
                >
                  <FolderIcon
                    :stroke-color="selectedCollection === collection.id ? '#821F0C' : '#1E1E1E'"
                    class="vdb-c-h-[16.667px] vdb-c-w-[16.667px] vdb-c-shrink-0"
                  />
                  <span
                    :class="[
                      'vdb-c-flex-1 vdb-c-truncate vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px]',
                      selectedCollection === collection.id
                        ? 'vdb-c-text-[#821F0C]'
                        : 'vdb-c-text-[#1E1E1E]',
                    ]"
                  >
                    {{ collection.name }}
                  </span>
                  <CheckIcon
                    v-if="selectedCollection === collection.id"
                    class="vdb-c-h-[13.333px] vdb-c-w-[13.333px] vdb-c-shrink-0"
                    style="color: #821f0c; stroke-width: 2px"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="vdb-c-flex vdb-c-items-center vdb-c-justify-end vdb-c-gap-[10px] vdb-c-border-t vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-[20px] vdb-c-py-[12px]"
      >
        <button
          @click="handleCancel"
          class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[8px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#D9D9D9] vdb-c-bg-white vdb-c-px-[16px] vdb-c-py-[12px] vdb-c-transition-colors hover:vdb-c-bg-[#F7F7F7]"
        >
          <span
            class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[16px] vdb-c-text-[#1E1E1E]"
          >
            Cancel
          </span>
        </button>
        <button
          @click="handleUpload"
          :disabled="!canUpload"
          :class="[
            'vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[10px] vdb-c-rounded-[8px] vdb-c-px-[16px] vdb-c-py-[12px] vdb-c-transition-colors',
            canUpload
              ? 'vdb-c-bg-[#EC5B16] hover:vdb-c-bg-[#D65214]'
              : 'vdb-c-cursor-not-allowed vdb-c-bg-[#969696]',
          ]"
        >
          <span class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[16px] vdb-c-text-white">
            Upload
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import CrossIcon from './icons/CrossIcon.vue';
import UploadFileIcon from './icons/UploadFileIcon.vue';
import FolderIcon from './icons/FolderIcon.vue';
import ChevronDownIcon from './icons/ChevronDownIcon.vue';
import CheckIcon from './icons/CheckIcon.vue';
import VideoFileDisplay from '../../pages/collection/components/VideoFileDisplay.vue';
import AudioFileDisplay from '../../pages/collection/components/AudioFileDisplay.vue';
import ImageFileDisplay from './UploadImageFileDisplay.vue';
import BigInput from './elements/BigInput.vue';
import { ref, watch, computed } from 'vue';

const emit = defineEmits(['cancel-upload', 'upload']);

const props = defineProps({
  showUploadDialog: {
    type: Boolean,
    required: true,
  },
  defaultSelectedCollectionId: {
    type: String,
    default: null,
  },
  collections: {
    type: Array,
    default: () => [],
    required: true,
  },
  isCreatingCollection: {
    type: Boolean,
    default: false,
  },
});

let dragCounter = 0;
const isDragging = ref(false);
const url = ref('');
const fileInput = ref([]);
const fileInputEl = ref(null);
const selectedCollection = ref(null);
const isDropdownOpen = ref(false);
const isUploading = ref(false);

const hasUploadedFiles = computed(() => fileInput.value.length > 0);
const canUpload = computed(() => {
  return (
    (hasUploadedFiles.value || url.value.trim()) && selectedCollection.value && !isUploading.value
  );
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

const clearState = () => {
  dragCounter = 0;
  isDragging.value = false;
  url.value = '';
  fileInput.value = [];
  selectedCollection.value = props.defaultSelectedCollectionId || null;
  isDropdownOpen.value = false;
  isUploading.value = false;
};

const handleUrlInput = (e) => {
  // URL input doesn't clear files in new design
};

const removeFile = (index) => {
  fileInput.value.splice(index, 1);
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
    (file) =>
      file.type.startsWith('audio/') ||
      file.type.startsWith('video/') ||
      file.type.startsWith('image/')
  );

  if (validFiles.length > 0) {
    fileInput.value = [...fileInput.value, ...validFiles];
  }
};

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    fileInput.value = [...fileInput.value, ...files];
  }
};

const triggerFileInput = () => {
  fileInputEl.value?.click();
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectCollection = (collectionId) => {
  selectedCollection.value = collectionId;
  isDropdownOpen.value = false;
};

const handleCancel = () => {
  emit('cancel-upload');
  clearState();
};

const handleUpload = () => {
  if (!canUpload.value) return;

  isUploading.value = true;

  if (url.value.trim()) {
    emit('upload', {
      source: { url: url.value },
      sourceType: 'url',
      collectionId: selectedCollection.value,
    });
  }

  if (hasUploadedFiles.value) {
    fileInput.value.forEach((file) => {
      emit('upload', {
        source: file,
        sourceType: 'file',
        collectionId: selectedCollection.value,
      });
    });
  }

  clearState();
};

watch(
  () => props.collections,
  (newCollections) => {
    if (newCollections.length > 0 && !selectedCollection.value) {
      selectedCollection.value = props.defaultSelectedCollectionId || newCollections[0].id;
    }
  },
  { immediate: true }
);

watch(
  () => props.defaultSelectedCollectionId,
  (newDefaultId) => {
    if (newDefaultId) {
      selectedCollection.value = newDefaultId;
    }
  }
);
</script>

<style>
/* Scrollbar styles for files container */
.vdb-c-uploaded-files-container {
  overflow-y: auto;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

.vdb-c-uploaded-files-container::-webkit-scrollbar {
  width: 6px;
}

.vdb-c-uploaded-files-container::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 999px;
}

.vdb-c-uploaded-files-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 999px;
}

.vdb-c-uploaded-files-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Scrollbar styles for collections dropdown */
.vdb-c-collections-dropdown-container::-webkit-scrollbar {
  width: 4px;
}

.vdb-c-collections-dropdown-container::-webkit-scrollbar-track {
  background: transparent;
}

.vdb-c-collections-dropdown-container::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 999px;
}

.vdb-c-collections-dropdown-container::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

.vdb-c-collections-dropdown-container {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}
</style>
