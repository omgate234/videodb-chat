<template>
  <div
    class="image-card vdb-c-flex vdb-c-cursor-pointer vdb-c-flex-col vdb-c-items-start vdb-c-gap-8 vdb-c-transition-all vdb-c-duration-300"
    :class="{ 'image-card--hovered': isHovered || isActive }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="handleCardClick"
    @dblclick="handleCardDoubleClick"
  >
    <!-- Image Container -->
    <div class="vdb-c-relative vdb-c-w-full vdb-c-overflow-hidden vdb-c-rounded-12">
      <div
        class="image-wrapper vdb-c-relative vdb-c-w-full vdb-c-overflow-hidden vdb-c-rounded-12 vdb-c-bg-black"
      >
        <div
          v-if="url"
          class="image-thumbnail vdb-c-absolute vdb-c-left-0 vdb-c-top-0 vdb-c-h-full vdb-c-w-full vdb-c-bg-cover vdb-c-bg-center vdb-c-bg-no-repeat vdb-c-transition-transform vdb-c-duration-300"
          :style="{
            backgroundImage: `url('${url}')`,
          }"
        ></div>
        <default-thumbnail
          v-else
          class="image-thumbnail image-thumbnail--default vdb-c-absolute vdb-c-left-0 vdb-c-top-0 vdb-c-h-full vdb-c-w-full"
        />

        <!-- Copy Icon - Top Right -->
        <div
          class="copy-button vdb-c-absolute vdb-c-right-8 vdb-c-top-8 vdb-c-z-10 vdb-c-cursor-pointer vdb-c-rounded-full vdb-c-border vdb-c-p-6 vdb-c-transition-all vdb-c-duration-300"
          @click.stop="copyId(item.id)"
        >
          <CopyIcon />
        </div>
      </div>
    </div>

    <!-- Text and Three Dots Container -->
    <div
      @mouseleave="
        () => {
          showMenu = false;
        }
      "
      class="info-container vdb-c-flex vdb-c-w-full vdb-c-items-start vdb-c-gap-8 vdb-c-self-stretch"
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

  <ImageModal
    :is-open="showImageModal"
    :item="item"
    :get-image-url="getImageUrl"
    :editing-asset-id="editingAssetId"
    @close="showImageModal = false"
    @delete-image="$emit('delete-image', $event)"
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
import ThreeDotsIcon from '../icons/ThreeDotsIcon.vue';
import DefaultThumbnail from '../../../assets/DefaultThumbnail.vue';
import EditIcon from '../icons/EditIcon.vue';
import UploadIcon from '../icons/UploadIcon.vue';
import TrashIcon from '../icons/TrashIcon.vue';
import ImageModal from './ImageModal.vue';

const isHovered = ref(false);
const isActive = ref(false);
const url = ref(null);
const notificationCenterRef = ref(null);
const showMenu = ref(false);
const menuButtonRef = ref(null);
const showDeleteModal = ref(false);
const editingName = ref('');
const showImageModal = ref(false);

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: 0,
  },
  getImageUrl: {
    type: Function,
  },
  editingAssetId: {
    type: String,
    default: null,
  },
});

onMounted(async () => {
  if (props.getImageUrl) {
    const imageUrl = await props.getImageUrl(props.item.collection_id, props.item.id);
    url.value = imageUrl;
  }
});

const emit = defineEmits([
  'delete-image',
  'image-click',
  'menu-click',
  'start-editing',
  'save-editing',
  'cancel-editing',
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

function copyId(id) {
  navigator.clipboard
    .writeText(id)
    .then(() => {
      notificationCenterRef.value.addNotification('Image ID Copied');
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
    emit('image-click', props.item);
  }, 200); // 200ms delay to detect double click
}

function handleCardDoubleClick() {
  // Clear the single click timeout
  if (clickTimeout) {
    clearTimeout(clickTimeout);
    clickTimeout = null;
  }

  // Open the modal
  showImageModal.value = true;
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
    link.download = `${props.item.name || 'image'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    console.error('No image URL available');
    if (notificationCenterRef.value) {
      notificationCenterRef.value.addNotification('Image not available for download', {
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
  emit('delete-image', props.item);
}
</script>

<style scoped>
.image-card {
  padding: 10px 10px 12px 10px;
  border-radius: 17.023px;
}

.image-card--hovered {
  background: var(--Light-Grey-VDB, #f7f7f7);
}

/* Image Container - 16:9 aspect ratio */
.image-wrapper {
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.image-thumbnail {
  transform: scale(1.001);
}

.image-card:hover .image-thumbnail {
  transform: scale(1.05);
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

:global(.vdb-selection-orange::selection) {
  background: #c14103;
  color: #ffffff;
}

:global(.vdb-selection-orange::-moz-selection) {
  background: #c14103;
  color: #ffffff;
}
</style>
