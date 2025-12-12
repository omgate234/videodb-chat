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

        <!-- Image Display -->
        <div
          class="vdb-c-flex vdb-c-max-h-[60vh] vdb-c-w-full vdb-c-items-center vdb-c-justify-center vdb-c-overflow-hidden vdb-c-rounded-12 vdb-c-bg-black"
        >
          <img
            v-if="url"
            :src="url"
            :alt="item.name || 'Image'"
            class="vdb-c-max-h-full vdb-c-max-w-full vdb-c-rounded-12 vdb-c-object-contain"
          />
          <default-thumbnail v-else class="vdb-c-max-h-full vdb-c-max-w-full" />
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
    const link = document.createElement('a');
    link.href = url.value;
    link.download = `${props.item.name || 'image'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    if (notificationCenterRef.value) {
      notificationCenterRef.value.addNotification('Image not available for download', {
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
  emit('delete-image', props.item);
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
