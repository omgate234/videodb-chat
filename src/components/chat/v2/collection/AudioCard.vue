<template>
  <div
    class="audio-card vdb-c-flex vdb-c-cursor-pointer vdb-c-flex-col vdb-c-items-start vdb-c-gap-8 vdb-c-transition-all vdb-c-duration-300"
    :class="{ 'audio-card--hovered': isHovered || isActive }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="handleCardClick"
    @dblclick="handleCardDoubleClick"
  >
    <!-- Audio Container -->
    <div class="vdb-c-relative vdb-c-w-full vdb-c-overflow-hidden vdb-c-rounded-12">
      <!-- Selection Checkbox -->
      <div
        v-if="enabledSelection && selectionMode === 'checkbox'"
        class="selection-checkbox vdb-c-absolute vdb-c-left-4 vdb-c-top-4 vdb-c-z-20 vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-overflow-hidden vdb-c-rounded-[7px] vdb-c-border vdb-c-border-solid vdb-c-transition-all"
        :class="
          isSelected
            ? 'vdb-c-border-[#EC5B16] vdb-c-bg-[#EC5B16]'
            : 'vdb-c-border-[#E5E7EB] vdb-c-bg-white'
        "
        @click.stop="handleSelect"
      >
        <CheckIcon v-if="isSelected" class="vdb-c-h-12 vdb-c-w-12" style="stroke: white" />
      </div>
      <!-- Selection Radio Button -->
      <div
        v-if="enabledSelection && selectionMode === 'radio'"
        class="selection-radio vdb-c-absolute vdb-c-left-4 vdb-c-top-4 vdb-c-z-20 vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-transition-all"
        @click.stop="handleSelect"
      >
        <div class="radio-checkmark" :class="{ 'radio-checkmark--selected': isSelected }"></div>
      </div>
      <div
        class="audio-wrapper vdb-c-relative vdb-c-w-full vdb-c-overflow-hidden vdb-c-rounded-12 vdb-c-bg-black"
      >
        <img
          src="../../../../static/audio.png"
          class="audio-thumbnail vdb-c-absolute vdb-c-left-0 vdb-c-top-0 vdb-c-h-full vdb-c-w-full vdb-c-object-cover vdb-c-transition-transform vdb-c-duration-300"
        />

        <div
          class="play-button vdb-c-absolute vdb-c-left-1/2 vdb-c-top-1/2 vdb-c-flex vdb-c-h-48 vdb-c-w-48 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-transition-all vdb-c-duration-300"
          @click.stop="toggleAudio(url)"
        >
          <PauseIcon v-if="playing" class="vdb-c-h-20 vdb-c-w-20" />
          <PlayIcon v-else class="vdb-c-h-20 vdb-c-w-20" />
        </div>

        <!-- Copy Icon - Top Right -->
        <div
          class="copy-button vdb-c-absolute vdb-c-right-8 vdb-c-top-8 vdb-c-z-10 vdb-c-cursor-pointer vdb-c-rounded-full vdb-c-border vdb-c-p-6 vdb-c-transition-all vdb-c-duration-300"
          @click.stop="copyId(item.id)"
        >
          <CopyIcon />
        </div>

        <!-- Duration Pill - Bottom Right -->
        <div
          v-if="item.type !== 'voices'"
          class="vdb-c-absolute vdb-c-bottom-8 vdb-c-right-8 vdb-c-z-10 vdb-c-inline-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[13.281px] vdb-c-rounded-20 vdb-c-bg-black/50 vdb-c-px-6 vdb-c-py-4 vdb-c-text-right vdb-c-text-xs vdb-c-font-medium vdb-c-leading-normal vdb-c-text-white"
        >
          {{ formatDuration(item.length) }}
        </div>
      </div>
    </div>

    <!-- Text and Three Dots Container -->
    <div
      class="info-container vdb-c-flex vdb-c-w-full vdb-c-items-start vdb-c-gap-8 vdb-c-self-stretch"
      @mouseleave="
        () => {
          showMenu = false;
        }
      "
    >
      <div
        class="vdb-c-m-0 vdb-c-line-clamp-2 vdb-c-flex-1 vdb-c-overflow-hidden vdb-c-text-[13px] vdb-c-font-normal vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
      >
        <template v-if="isEditing">
          <input
            :id="`edit-input-${item.id}`"
            v-model="editingName"
            type="text"
            class="vdb-selection-orange vdb-c-w-full vdb-c-truncate vdb-c-bg-[#FFE9D3] vdb-c-px-6 vdb-c-py-2 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey vdb-c-outline-none focus:vdb-c-border-vdb-darkorange"
            @click.stop
            @keydown.enter.prevent="handleSave"
            @keydown.esc.stop="handleCancel"
            @blur="handleSave"
          />
        </template>
        <template v-else>
          <span
            class="vdb-c-inline-block vdb-c-w-full vdb-c-cursor-pointer vdb-c-truncate"
            @dblclick.stop="handleStartEditing"
            title="Double-click to rename"
          >
            {{ item.name }}
          </span>
        </template>
      </div>
      <div
        v-if="!disableOptions"
        ref="menuButtonRef"
        class="vdb-c-relative vdb-c-z-[1000] vdb-c-flex-shrink-0 vdb-c-cursor-pointer vdb-c-p-4 vdb-c-transition-opacity vdb-c-duration-300"
        :class="[isHovered || isActive ? 'vdb-c-opacity-100' : 'vdb-c-opacity-0']"
        @mouseenter="
          () => {
            showMenu = true;
          }
        "
      >
        <ThreeDotsIcon class="three-dots-button" />
        <!-- Dropdown Menu -->
        <ul
          v-if="showMenu"
          :class="
            (index + 1) % 4 === 0 ? 'vdb-c-left-full vdb-c-translate-x-[-100%]' : 'vdb-c-left-0'
          "
          class="menu-dropdown vdb-c-absolute vdb-c-top-full vdb-c-z-[1000] vdb-c-min-w-[160px] vdb-c-cursor-pointer vdb-c-rounded-12 vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-p-8 vdb-c-text-sm"
        >
          <li
            class="menu-item vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-12 vdb-c-rounded-8 vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-sm vdb-c-font-[500] vdb-c-text-black hover:vdb-c-bg-roy"
            @click.stop="handleRename"
          >
            <EditIcon :stroke-color="'#1E1E1E'" />
            <span>Rename</span>
          </li>
          <li
            class="menu-item vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-12 vdb-c-rounded-8 vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-sm vdb-c-font-[500] vdb-c-text-black hover:vdb-c-bg-roy"
            @click.stop="handleDownload"
          >
            <UploadIcon :stroke-color="'#1E1E1E'" />
            <span>Download</span>
          </li>
          <li
            class="menu-item vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-12 vdb-c-rounded-8 vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-sm vdb-c-font-[500] vdb-c-text-[#E2462C] hover:vdb-c-bg-roy"
            @click.stop="handleDelete"
          >
            <TrashIcon :stroke-color="'#E2462C'" />
            <span>Delete</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <NotificationCenter ref="notificationCenterRef" />

  <DeleteModal
    :is-open="showDeleteModal"
    heading="Delete asset"
    text="Are you sure you want to delete this asset? This action cannot be undone."
    delete-button-text="Yes, I'm sure"
    cancel-button-text="Cancel"
    @close="showDeleteModal = false"
    @confirm="handleConfirmDelete"
  />

  <AudioModal
    :is-open="showAudioModal"
    :item="item"
    :get-audio-url="getAudioUrl"
    :editing-asset-id="editingAssetId"
    @close="showAudioModal = false"
    @delete-audio="$emit('delete-audio', $event)"
    @start-editing="$emit('start-editing', $event)"
    @save-editing="$emit('save-editing', $event)"
    @cancel-editing="$emit('cancel-editing')"
  />
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import NotificationCenter from '../../../chat/elements/NotificationCenter.vue';
import DeleteModal from '../DeleteModal.vue';
import CopyIcon from '../../../icons/CopyIcon.vue';
import PauseIcon from '../../../icons/PauseIcon.vue';
import PlayIcon from '../../../icons/play.vue';
import ThreeDotsIcon from '../icons/ThreeDotsIcon.vue';
import EditIcon from '../icons/EditIcon.vue';
import UploadIcon from '../icons/UploadIcon.vue';
import TrashIcon from '../icons/TrashIcon.vue';
import CheckIcon from '../icons/CheckIcon.vue';
import AudioModal from './AudioModal.vue';

const isHovered = ref(false);
const isActive = ref(false);
const url = ref(null);
const audio = ref(null);
const playing = ref(false);
const notificationCenterRef = ref(null);
const showMenu = ref(false);
const menuButtonRef = ref(null);
const showDeleteModal = ref(false);
const editingName = ref('');
const showAudioModal = ref(false);

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: 0,
  },
  getAudioUrl: {
    type: Function,
  },
  editingAssetId: {
    type: String,
    default: null,
  },
  enabledSelection: {
    type: Boolean,
    default: false,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  selectionMode: {
    type: String,
    default: 'checkbox',
    validator: (value) => ['checkbox', 'radio'].includes(value),
  },
  selectionName: {
    type: String,
    default: '',
  },
  disableOptions: {
    type: Boolean,
    default: false,
  },
});

onMounted(async () => {
  if (props.getAudioUrl) {
    // For voices, use audio_id instead of id
    const audioId = props.item.type === 'voices' ? props.item.audio_id : props.item.id;
    const collectionId = props.item.collection_id || props.item.collectionId;
    const audioUrl = await props.getAudioUrl(collectionId, audioId);
    url.value = audioUrl;
  }
});

const emit = defineEmits([
  'delete-audio',
  'audio-click',
  'menu-click',
  'start-editing',
  'save-editing',
  'cancel-editing',
  'select',
]);

const isEditing = computed(() => {
  return props.editingAssetId === props.item.id;
});

watch(
  () => props.editingAssetId,
  (newValue) => {
    if (newValue === props.item.id) {
      editingName.value = props.item.name || '';
      nextTick(() => {
        const input = document.getElementById(`edit-input-${props.item.id}`);
        if (input) {
          input.focus();
          input.select();
        }
      });
    } else {
      editingName.value = '';
    }
  },
  { immediate: true }
);

watch(
  () => props.item.name,
  (newName) => {
    if (!isEditing.value) {
      editingName.value = newName || '';
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

function toggleAudio(audioUrl) {
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
}

function copyId(id) {
  navigator.clipboard
    .writeText(id)
    .then(() => {
      notificationCenterRef.value.addNotification('Audio ID Copied');
    })
    .catch((e) => {
      console.error(e);
      notificationCenterRef.value.addNotification('Failed to copy ID');
    });
}

let clickTimeout = null;

function handleCardClick() {
  // Clear any existing timeout
  if (clickTimeout) {
    clearTimeout(clickTimeout);
  }

  // Set a timeout for single click
  clickTimeout = setTimeout(() => {
    emit('audio-click', props.item);
  }, 200); // 200ms delay to detect double click
}

function handleCardDoubleClick() {
  // Clear the single click timeout
  if (clickTimeout) {
    clearTimeout(clickTimeout);
    clickTimeout = null;
  }

  // Open the modal
  showAudioModal.value = true;
}

function handleRename() {
  emit('start-editing', props.item);
}

function handleStartEditing() {
  emit('start-editing', props.item);
}

function handleSave() {
  if (isEditing.value) {
    const trimmed = (editingName.value || '').trim();
    if (trimmed.length === 0) {
      handleCancel();
      return;
    }
    emit('save-editing', { assetId: props.item.id, name: trimmed });
  }
}

function handleCancel() {
  emit('cancel-editing');
}

function handleDownload() {
  if (url.value) {
    const link = document.createElement('a');
    link.href = url.value;
    link.download = `${props.item.name || 'audio'}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    console.error('No audio URL available');
    if (notificationCenterRef.value) {
      notificationCenterRef.value.addNotification('Audio not available for download', {
        type: 'error',
      });
    }
  }
}

function handleDelete() {
  showDeleteModal.value = true;
}

function handleConfirmDelete() {
  showDeleteModal.value = false;
  emit('delete-audio', props.item);
}

function handleSelect() {
  if (props.enabledSelection) {
    emit('select', props.item);
  }
}
</script>

<style scoped>
.audio-card {
  padding: 10px 10px 12px 10px;
  border-radius: 17.023px;
}

.audio-card--hovered {
  background: var(--Light-Grey-VDB, #f7f7f7);
}

/* Audio Container - 16:9 aspect ratio */
.audio-wrapper {
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.audio-thumbnail {
  transform: scale(1.001);
}

.audio-card:hover .audio-thumbnail {
  transform: scale(1.05);
}

/* Play Button */
.play-button {
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(16px);
  opacity: 0;
  color: #fff;
}

.audio-card:hover .play-button {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.05);
  background: rgba(0, 0, 0, 0.6);
}

/* Copy Button - Top Right */
.copy-button {
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(16px);
}

.copy-button:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.45);
}

.three-dots-button:hover {
  opacity: 0.7;
}

.menu-dropdown {
  box-shadow:
    0px 5px 11px rgba(0, 0, 0, 0.06),
    0px 21px 21px rgba(0, 0, 0, 0.05),
    0px 47px 28px rgba(0, 0, 0, 0.03),
    0px 83px 33px rgba(0, 0, 0, 0.01),
    0px 130px 36px rgba(0, 0, 0, 0);
}

/* Radio Button Styles */
.radio-checkmark {
  width: 20px;
  height: 20px;
  background-color: #ffffff;
  border: 1px solid #b9b9b9;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.radio-checkmark--selected {
  border-color: #ec5b16;
  border-width: 5px;
}

.selection-radio:hover .radio-checkmark {
  border-color: #ec5b16;
}

:global(.vdb-selection-orange::selection) {
  background: #c14103;
  color: #ffffff;
}

:global(.vdb-selection-orange::-moz-selection) {
  background: #c14103;
  color: #ffffff;
}
</style>
