<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-[1000] vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-bg-vdb-darkishgrey/95"
      @click.self="handleClose"
    >
      <!-- Modal Content -->
      <div
        class="vdb-c-max-w-4xl vdb-c-relative vdb-c-max-h-[90vh] vdb-c-w-[80%] vdb-c-rounded-20 vdb-c-bg-white vdb-c-p-24 vdb-c-shadow-4"
      >
        <!-- Close Button -->
        <button
          @click="handleClose"
          class="vdb-c-absolute vdb-c-left-24 vdb-c-top-24 vdb-c-flex vdb-c-h-32 vdb-c-w-32 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-gray-100 vdb-c-transition-colors hover:vdb-c-bg-gray-200"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="#1E1E1E"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <!-- Title and Actions Row -->
        <div class="vdb-c-mb-20 vdb-c-flex vdb-c-items-center vdb-c-justify-between">
          <!-- Title (editable) -->
          <div class="vdb-c-ml-48 vdb-c-flex-1">
            <template v-if="isEditingTitle">
              <input
                :id="`edit-title-input-${item.id}`"
                v-model="editingTitle"
                type="text"
                class="vdb-selection-orange vdb-c-text-16 vdb-c-w-full vdb-c-rounded-6 vdb-c-px-12 vdb-c-py-6 vdb-c-font-medium vdb-c-text-vdb-darkishgrey vdb-c-outline-none focus:vdb-c-border-vdb-darkorange"
                @click.stop
                @keydown.enter.prevent="handleSaveTitle"
                @keydown.esc.stop="handleCancelTitle"
                @blur="handleSaveTitle"
              />
            </template>
            <template v-else>
              <h2
                class="vdb-c-text-20 vdb-c-cursor-pointer vdb-c-font-semibold vdb-c-text-vdb-darkishgrey"
                @dblclick.stop="handleStartEditingTitle"
                title="Double-click to rename"
              >
                {{ item.name }}
              </h2>
            </template>
          </div>

          <!-- Action Buttons -->
          <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
            <button
              @click="copyId(item.id)"
              class="vdb-c-flex vdb-c-h-40 vdb-c-w-40 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-transition-colors hover:vdb-c-bg-roy"
              title="Copy ID"
            >
              <CopyIcon fill="#1E1E1E" />
            </button>

            <button
              @click="handleDownload"
              class="vdb-c-flex vdb-c-h-40 vdb-c-w-40 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-transition-colors hover:vdb-c-bg-roy"
              title="Download"
            >
              <DownloadIcon />
            </button>

            <button
              @click="handleDelete"
              class="vdb-c-flex vdb-c-h-40 vdb-c-w-40 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-transition-colors hover:vdb-c-bg-red-200"
              title="Delete"
            >
              <TrashIcon :stroke-color="'#E2462C'" />
            </button>
          </div>
        </div>

        <!-- Audio Player -->
        <div
          class="vdb-c-relative vdb-c-aspect-video vdb-c-w-full vdb-c-overflow-hidden vdb-c-rounded-12 vdb-c-bg-black"
        >
          <div
            class="audio-wrapper vdb-c-relative vdb-c-flex vdb-c-min-h-full vdb-c-w-full vdb-c-items-center vdb-c-justify-center vdb-c-overflow-hidden vdb-c-rounded-12 vdb-c-bg-black"
          >
            <img
              src="../../../../static/audio.png"
              class="audio-thumbnail vdb-c-absolute vdb-c-left-0 vdb-c-top-0 vdb-c-h-full vdb-c-w-full vdb-c-object-cover vdb-c-transition-transform vdb-c-duration-300"
            />

            <!-- Play/Pause Button -->
            <div
              class="play-button vdb-c-absolute vdb-c-left-1/2 vdb-c-top-1/2 vdb-c-flex vdb-c-h-48 vdb-c-w-48 vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-transition-all vdb-c-duration-300"
              @click="toggleAudio(url)"
            >
              <PauseIcon v-if="playing" class="vdb-c-h-20 vdb-c-w-20" />
              <PlayIcon v-else class="vdb-c-h-20 vdb-c-w-20" />
            </div>

            <!-- Duration Pill - Bottom Right -->
            <div
              class="vdb-c-absolute vdb-c-bottom-8 vdb-c-right-8 vdb-c-z-10 vdb-c-inline-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-6 vdb-c-rounded-20 vdb-c-bg-black/50 vdb-c-px-6 vdb-c-py-4 vdb-c-text-right vdb-c-text-xs vdb-c-font-medium vdb-c-leading-normal vdb-c-text-white"
            >
              {{ formatDuration(item.length) }}
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
import NotificationCenter from '../../../chat/elements/NotificationCenter.vue';
import DeleteModal from '../DeleteModal.vue';
import CopyIcon from '../icons/CopyIcon.vue';
import DownloadIcon from '../icons/DownloadIcon.vue';
import TrashIcon from '../icons/TrashIcon.vue';
import PauseIcon from '../../../icons/PauseIcon.vue';
import PlayIcon from '../../../icons/play.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: () => ({}),
  },
  getAudioUrl: {
    type: Function,
  },
  editingAssetId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits([
  'close',
  'delete-audio',
  'start-editing',
  'save-editing',
  'cancel-editing',
]);

const isEditingTitle = ref(false);
const editingTitle = ref('');
const notificationCenterRef = ref(null);
const showDeleteModal = ref(false);
const url = ref(null);
const audio = ref(null);
const playing = ref(false);

const context = inject('videodb-chat-context');

// Watch for editing state changes
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

// Watch for item name changes
watch(
  () => props.item.name,
  (newName) => {
    if (!isEditingTitle.value) {
      editingTitle.value = newName || '';
    }
  }
);

onMounted(async () => {
  if (props.getAudioUrl) {
    const audioUrl = await props.getAudioUrl(props.item.collection_id, props.item.id);
    url.value = audioUrl;
  }
});

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

const toggleAudio = (audioUrl) => {
  if (!audio.value) {
    audio.value = new Audio(audioUrl);
    audio.value.addEventListener('ended', () => {
      playing.value = false;
      audio.value = null;
    });
  }

  if (playing.value) {
    audio.value.pause();
    playing.value = false;
  } else {
    audio.value.play().catch((e) => {
      notificationCenterRef.value.addNotification('Error playing audio', {
        type: 'error',
      });
      console.error(e);
    });
    playing.value = true;
  }
};

const copyId = (id) => {
  navigator.clipboard
    .writeText(id)
    .then(() => {
      notificationCenterRef.value.addNotification('Audio ID Copied');
    })
    .catch((e) => {
      console.error(e);
      notificationCenterRef.value.addNotification('Failed to copy ID');
    });
};

const handleClose = () => {
  // Stop audio if playing
  if (audio.value && playing.value) {
    audio.value.pause();
    playing.value = false;
  }
  emit('close');
};

const handleStartEditingTitle = () => {
  isEditingTitle.value = true;
  emit('start-editing', props.item);
};

const handleSaveTitle = () => {
  if (isEditingTitle.value) {
    const trimmed = (editingTitle.value || '').trim();
    if (trimmed.length === 0) {
      handleCancelTitle();
      return;
    }
    emit('save-editing', { assetId: props.item.id, name: trimmed });
    isEditingTitle.value = false;
  }
};

const handleCancelTitle = () => {
  isEditingTitle.value = false;
  editingTitle.value = props.item.name || '';
  emit('cancel-editing');
};

const handleDownload = async () => {
  if (url.value) {
    const link = document.createElement('a');
    link.href = url.value;
    link.download = `${props.item.name || 'audio'}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    if (notificationCenterRef.value) {
      notificationCenterRef.value.addNotification('Audio not available for download', {
        type: 'error',
      });
    }
  }
};

const handleDelete = () => {
  showDeleteModal.value = true;
};

const handleConfirmDelete = () => {
  showDeleteModal.value = false;
  // Stop audio if playing
  if (audio.value && playing.value) {
    audio.value.pause();
    playing.value = false;
  }
  emit('delete-audio', props.item);
  handleClose();
};
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
