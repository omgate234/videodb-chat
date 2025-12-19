<template>
  <!-- Full Screen Overlay -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-[1000] vdb-c-flex vdb-c-h-screen vdb-c-flex-col vdb-c-overflow-hidden vdb-c-bg-[#3D3D3D]"
      @click.self="handleClose"
    >
      <!-- Top Bar with Title and Actions -->
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-between vdb-c-px-24 vdb-c-py-20"
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

      <!-- Image Display Container -->
      <div
        class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center vdb-c-justify-center vdb-c-overflow-hidden vdb-c-px-48 vdb-c-pb-48"
      >
        <div
          class="vdb-c-relative vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-items-center vdb-c-justify-center"
        >
          <img
            v-if="url"
            :src="url"
            :alt="item.name || 'Image'"
            class="vdb-c-max-h-full vdb-c-max-w-full vdb-c-rounded-12 vdb-c-object-contain"
          />
          <default-thumbnail v-else class="vdb-c-max-h-full vdb-c-max-w-full vdb-c-rounded-12" />
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
import DefaultThumbnail from '../../../assets/DefaultThumbnail.vue';
import NotificationCenter from '../../../chat/elements/NotificationCenter.vue';
import DeleteModal from '../DeleteModal.vue';
import CopyIcon from '../icons/CopyIcon.vue';
import DownloadIcon from '../icons/DownloadIcon.vue';
import TrashIcon from '../icons/TrashIcon.vue';
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
  getImageUrl: {
    type: Function,
  },
  editingAssetId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits([
  'close',
  'delete-image',
  'start-editing',
  'save-editing',
  'cancel-editing',
]);

const isEditingTitle = ref(false);
const editingTitle = ref('');
const notificationCenterRef = ref(null);
const showDeleteModal = ref(false);
const url = ref(null);

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
  if (props.getImageUrl) {
    const imageUrl = await props.getImageUrl(props.item.collection_id, props.item.id);
    url.value = imageUrl;
  }
});

const copyId = (id) => {
  navigator.clipboard
    .writeText(id)
    .then(() => {
      notificationCenterRef.value.addNotification('Image ID Copied');
    })
    .catch((e) => {
      console.error(e);
      notificationCenterRef.value.addNotification('Failed to copy ID');
    });
};

const handleClose = () => {
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
    notificationCenterRef.value?.addNotification('Downloading image...');
    const link = document.createElement('a');
    link.href = url.value;
    link.download = `${props.item.name || 'image'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notificationCenterRef.value?.addNotification('Image download started');
  } else {
    notificationCenterRef.value?.addNotification('Image not available for download', {
      type: 'error',
    });
  }
};

const handleDelete = () => {
  showDeleteModal.value = true;
};

const handleConfirmDelete = () => {
  showDeleteModal.value = false;
  emit('delete-image', props.item);
  notificationCenterRef.value?.addNotification('Image deleted successfully', { type: 'error' });
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
