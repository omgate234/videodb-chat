<template>
  <!-- Full Screen Overlay -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-[1000] vdb-c-flex vdb-c-flex-col vdb-c-bg-[#3D3D3D]"
      @click.self="handleClose"
    >
      <!-- Top Bar with Title and Actions -->
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-between vdb-c-px-24 vdb-c-py-20"
      >
        <!-- Left: Close Button and Title -->
        <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-16">
          <!-- Close Button -->
          <button
            @click="handleClose"
            class="vdb-c-flex vdb-c-h-24 vdb-c-w-24 vdb-c-items-center vdb-c-justify-center vdb-c-transition-opacity hover:vdb-c-opacity-70"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#FFFFFF"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <!-- Title (editable) -->
          <div class="vdb-c-flex vdb-c-items-center">
            <template v-if="isEditingTitle">
              <input
                :id="`edit-title-input-${item.id}`"
                v-model="editingTitle"
                type="text"
                class="vdb-selection-orange vdb-c-max-w-[50vw] vdb-c-rounded-6 vdb-c-bg-transparent vdb-c-px-8 vdb-c-py-4 vdb-c-text-[16px] vdb-c-font-medium vdb-c-leading-6 vdb-c-text-white vdb-c-outline-none focus:vdb-c-bg-white/10"
                @click.stop
                @keydown.enter.prevent="handleSaveTitle"
                @keydown.esc.stop="handleCancelTitle"
                @blur="handleSaveTitle"
              />
            </template>
            <template v-else>
              <h2
                class="vdb-c-cursor-pointer vdb-c-text-[16px] vdb-c-font-medium vdb-c-leading-6 vdb-c-text-white"
                @dblclick.stop="handleStartEditingTitle"
                title="Double-click to rename"
              >
                {{ item.name }}
              </h2>
              <button
                @click="handleStartEditingTitle"
                class="vdb-c-ml-8 vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-items-center vdb-c-justify-center vdb-c-transition-opacity hover:vdb-c-opacity-70"
              >
                <EditIcon :stroke-color="'#FFFFFF'" />
              </button>
            </template>
          </div>
        </div>

        <!-- Right: Action Buttons -->
        <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
          <!-- Chat with video button -->
          <button
            @click="handleChatWithVideo"
            class="vdb-c-flex vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-8 vdb-c-border vdb-c-border-white/20 vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-[#1E1E1E] vdb-c-transition-colors hover:vdb-c-bg-white/90"
          >
            <ChatIcon class="vdb-c-h-20 vdb-c-w-20" />
            <span class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-[#1E1E1E]"
              >Chat with video</span
            >
          </button>

          <!-- Copy ID button -->
          <button
            @click="copyId(item.id)"
            class="vdb-c-flex vdb-c-h-[36px] vdb-c-w-[36px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-border vdb-c-border-white/20 vdb-c-bg-white vdb-c-transition-colors hover:vdb-c-bg-white/90"
            title="Copy ID"
          >
            <CopyIcon fill="#1E1E1E" />
          </button>

          <!-- Download button -->
          <button
            @click="handleDownload"
            class="vdb-c-flex vdb-c-h-[36px] vdb-c-w-[36px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-border vdb-c-border-white/20 vdb-c-bg-white vdb-c-transition-colors hover:vdb-c-bg-white/90"
            title="Download"
          >
            <DownloadIcon />
          </button>

          <!-- Delete button -->
          <button
            @click="handleDelete"
            class="vdb-c-flex vdb-c-h-[36px] vdb-c-w-[36px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-border vdb-c-border-white/20 vdb-c-bg-white vdb-c-transition-colors hover:vdb-c-bg-red-100"
            title="Delete"
          >
            <TrashIcon :stroke-color="'#E2462C'" />
          </button>
        </div>
      </div>

      <!-- Video Player Container -->
      <div
        class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center vdb-c-justify-center vdb-c-px-48 vdb-c-pb-48"
      >
        <div
          class="vdb-c-relative vdb-c-w-full vdb-c-max-w-[1440px] vdb-c-overflow-hidden vdb-c-rounded-12 vdb-c-bg-black"
          style="aspect-ratio: 16/9"
        >
          <div
            v-if="item.stream_url"
            class="video-player-wrapper vdb-c-relative vdb-c-h-full vdb-c-w-full vdb-c-overflow-hidden vdb-c-rounded-10 vdb-c-bg-black"
          >
            <VideoDBPlayer
              :stream-url="item.stream_url"
              :default-controls="true"
              :default-overlay="false"
              class="vdb-c-absolute vdb-c-left-0 vdb-c-top-0 vdb-c-h-full vdb-c-w-full vdb-c-rounded-12"
            >
              <template #overlay>
                <BigCenterButton
                  class="play-button vdb-c-absolute vdb-c-left-1/2 vdb-c-top-1/2 vdb-c-flex vdb-c-h-48 vdb-c-w-48 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-transition-all vdb-c-duration-300"
                >
                </BigCenterButton>
              </template>
            </VideoDBPlayer>
          </div>

          <!-- Fallback for no stream_url -->
          <div
            v-else
            class="video-thumbnail-wrapper vdb-c-relative vdb-c-h-full vdb-c-w-full vdb-c-overflow-hidden vdb-c-rounded-12 vdb-c-bg-black"
          >
            <div
              v-if="item.thumbnail_url"
              class="video-thumbnail vdb-c-absolute vdb-c-left-0 vdb-c-top-0 vdb-c-h-full vdb-c-w-full vdb-c-bg-cover vdb-c-bg-center vdb-c-bg-no-repeat vdb-c-transition-transform vdb-c-duration-300"
              :style="{
                backgroundImage: `url('${item.thumbnail_url}')`,
              }"
            ></div>
            <default-thumbnail
              v-else
              class="video-thumbnail video-thumbnail--default vdb-c-absolute vdb-c-left-0 vdb-c-top-0 vdb-c-h-full vdb-c-w-full"
            />

            <div
              class="play-button vdb-c-absolute vdb-c-left-1/2 vdb-c-top-1/2 vdb-c-flex vdb-c-h-48 vdb-c-w-48 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-transition-all vdb-c-duration-300"
            >
              <PlayIcon class="vdb-c-h-20 vdb-c-w-20" />
            </div>

            <!-- Duration Pill - Bottom Right -->
            <div
              class="vdb-c-absolute vdb-c-bottom-8 vdb-c-right-8 vdb-c-z-10 vdb-c-inline-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-6 vdb-c-rounded-20 vdb-c-bg-black/50 vdb-c-px-6 vdb-c-py-4 vdb-c-text-right vdb-c-text-xs vdb-c-font-medium vdb-c-leading-normal vdb-c-text-white"
            >
              {{ formatDuration(item.duration) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Notification Center -->
  <NotificationCenter ref="notificationCenterRef" />

  <!-- Delete Modal -->
  <DeleteModal
    :is-open="showDeleteModal"
    heading="Delete asset"
    text="Are you sure you want to delete this asset? This action cannot be undone."
    delete-button-text="Yes, I'm sure"
    cancel-button-text="Cancel"
    @close="showDeleteModal = false"
    @confirm="handleConfirmDelete"
  />
</template>

<script setup>
import { ref, inject, nextTick, computed, watch, onMounted } from 'vue';
import { BigCenterButton, VideoDBPlayer } from '@videodb/player-vue';
import '@videodb/player-vue/dist/style.css';
import DefaultThumbnail from '../../../assets/DefaultThumbnail.vue';
import NotificationCenter from '../../../chat/elements/NotificationCenter.vue';
import DeleteModal from '../DeleteModal.vue';
import PlayIcon from '../../../icons/play.vue';
import CopyIcon from '../icons/CopyIcon.vue';
import DownloadIcon from '../icons/DownloadIcon.vue';
import TrashIcon from '../icons/TrashIcon.vue';
import ChatIcon from '../icons/ChatIcon.vue';
import EditIcon from '../icons/EditIcon.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: () => ({}),
  },
  handleAddMessage: {
    type: Function,
  },
  editingAssetId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits([
  'close',
  'delete-video',
  'start-editing',
  'save-editing',
  'cancel-editing',
]);

const isEditingTitle = ref(false);
const editingTitle = ref('');
const notificationCenterRef = ref(null);
const showDeleteModal = ref(false);

const context = inject('videodb-chat-context');
const getVideoDownloadUrl = context?.getVideoDownloadUrl;

watch(
  () => props.editingAssetId,
  (newValue) => {
    if (newValue === props.item.id) {
      editingTitle.value = props.item.name || '';
      nextTick(() => {
        const input = document.getElementById(`edit-title-input-${props.item.id}`);
        if (input) {
          input.focus();
          input.select();
        }
      });
    } else {
      editingTitle.value = '';
      isEditingTitle.value = false;
    }
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      console.log('>>> item opened', props.item);
    }
  }
);

watch(
  () => props.item.name,
  (newName) => {
    if (!isEditingTitle.value) {
      editingTitle.value = newName || '';
    }
  }
);

const formatDuration = (seconds) => {
  if (!seconds) return '00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

function copyId(id) {
  navigator.clipboard
    .writeText(id)
    .then(() => {
      notificationCenterRef.value.addNotification('Video ID Copied');
    })
    .catch((e) => {
      console.error(e);
      notificationCenterRef.value.addNotification('Failed to copy ID');
    });
}

function handleClose() {
  emit('close');
}

function handleChatWithVideo() {
  if (props.handleAddMessage) {
    props.handleAddMessage({ text: props.item.name, video_id: props.item.id });
  }
  handleClose();
}

function handleStartEditingTitle() {
  isEditingTitle.value = true;
  emit('start-editing', props.item);
}

function handleSaveTitle() {
  if (isEditingTitle.value) {
    const trimmed = (editingTitle.value || '').trim();
    if (trimmed.length === 0) {
      handleCancelTitle();
      return;
    }
    emit('save-editing', { assetId: props.item.id, name: trimmed });
    isEditingTitle.value = false;
  }
}

function handleCancelTitle() {
  isEditingTitle.value = false;
  editingTitle.value = props.item.name || '';
  emit('cancel-editing');
}

async function handleDownload() {
  if (getVideoDownloadUrl) {
    try {
      const result = await getVideoDownloadUrl(props.item.collection_id, props.item.id);
      if (result?.data && result?.data?.download_url) {
        const link = document.createElement('a');
        link.href = result?.data?.download_url;
        link.download = `${props.item.name || 'video'}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('No download URL received');
        if (notificationCenterRef.value) {
          notificationCenterRef.value.addNotification('Failed to get download URL', {
            type: 'error',
          });
        }
      }
    } catch (error) {
      console.error('Error downloading video:', error);
      if (notificationCenterRef.value) {
        notificationCenterRef.value.addNotification('Failed to download video', { type: 'error' });
      }
    }
  }
}

function handleDelete() {
  showDeleteModal.value = true;
}

function handleConfirmDelete() {
  showDeleteModal.value = false;
  emit('delete-video', props.item);
  handleClose();
}
</script>

<style scoped>
:global(.vdb-selection-orange::selection) {
  background: #c14103;
  color: #ffffff;
}

:global(.vdb-selection-orange::-moz-selection) {
  background: #c14103;
  color: #ffffff;
}
</style>
