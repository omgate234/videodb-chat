<template>
  <div
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    class="vdb-c-relative"
    :data-collection-id="collection.id"
  >
    <button
      @click="handleClick"
      :class="[
        'vdb-c-flex vdb-c-h-[36px] vdb-c-w-full vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-6 vdb-c-truncate vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200',
        {
          'vdb-c-bg-[#FFE9D3]': isActive,
          'hover:vdb-c-bg-[#EFEFEF]': !isActive,
          'vdb-c-bg-[#EFEFEF] vdb-c-text-black': shouldShowHoverState,
        },
      ]"
    >
      <FolderOpenIcon v-if="isActive" stroke-color="#821F0C" class="vdb-c-flex-shrink-0" />
      <FolderIcon
        v-else
        :stroke-color="shouldShowHoverState ? '#821F0C' : '#1E1E1E'"
        class="vdb-c-flex-shrink-0"
      />
      <span class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center vdb-c-truncate">
        <template v-if="isEditing">
          <input
            :id="`edit-input-${collection.id}`"
            v-model="editingName"
            type="text"
            class="vdb-selection-orange vdb-c-w-full vdb-c-truncate vdb-c-bg-[#FFE9D3] vdb-c-px-6 vdb-c-py-2 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey vdb-c-outline-none"
            @click.stop
            @keydown.enter.prevent="handleSave"
            @keydown.esc.stop="handleCancel"
            @blur="handleSave"
          />
        </template>
        <template v-else>
          <span
            class="vdb-c-inline-block vdb-c-w-full vdb-c-truncate vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5"
            :class="{
              'vdb-c-text-[#821F0C]': isActive,
              'vdb-c-text-vdb-darkishgrey': !isActive && !shouldShowHoverState,
              'vdb-c-text-black': shouldShowHoverState,
            }"
            @dblclick.stop="handleStartEditing"
            title="Double-click to rename"
          >
            {{ collection.name }}
          </span>
        </template>
      </span>
      <button
        v-if="(hovered || (isOptionsMenuOpen && !isEditing && !isActive)) && !isEditing"
        @click.stop="handleOptionsClick"
        class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-6 vdb-c-p-4 vdb-c-transition-all vdb-c-duration-200"
      >
        <ThreeDotsIcon stroke-color="#1E1E1E" />
      </button>
    </button>

    <!-- Delete Collection Modal -->
    <DeleteCollectionModal
      :is-open="showDeleteModal"
      @close="showDeleteModal = false"
      @confirm="handleConfirmDelete"
    />

    <!-- Delete Collection Error Modal -->
    <DeleteCollectionErrorModal
      :is-open="showDeleteErrorModal"
      @close="showDeleteErrorModal = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import FolderIcon from './icons/FolderIcon.vue';
import FolderOpenIcon from './icons/FolderOpenIcon.vue';
import ThreeDotsIcon from './icons/ThreeDotsIcon.vue';
import DeleteCollectionModal from './DeleteCollectionModal.vue';
import DeleteCollectionErrorModal from './DeleteCollectionErrorModal.vue';

const props = defineProps({
  collection: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  editingCollectionId: {
    type: String,
    default: null,
  },
  isOptionsMenuOpen: {
    type: Boolean,
    default: false,
  },
  fetchCollectionVideos: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits([
  'click',
  'options-click',
  'start-editing',
  'save-editing',
  'cancel-editing',
  'delete-collection',
]);

const hovered = ref(false);
const editingName = ref('');
const showDeleteModal = ref(false);
const showDeleteErrorModal = ref(false);

const isEditing = computed(() => {
  return props.editingCollectionId === props.collection.id;
});

const isActive = computed(
  () => props.isSelected || props.collection.id === props.editingCollectionId
);

const shouldShowHoverState = computed(() => {
  if (isActive.value) return false;
  return hovered.value || props.isOptionsMenuOpen;
});

watch(
  () => props.editingCollectionId,
  (newValue) => {
    if (newValue === props.collection.id) {
      editingName.value = props.collection.name || '';
      nextTick(() => {
        const input = document.getElementById(`edit-input-${props.collection.id}`);
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
  () => props.collection.name,
  (newName) => {
    if (!isEditing.value) {
      editingName.value = newName || '';
    }
  }
);

const handleClick = () => {
  if (!isEditing.value) {
    emit('click', props.collection.id);
  }
};

const handleOptionsClick = (event) => {
  emit('options-click', props.collection, event);
};

const handleStartEditing = () => {
  emit('start-editing', props.collection);
};

const handleSave = () => {
  if (isEditing.value) {
    const trimmed = (editingName.value || '').trim();
    if (trimmed.length === 0) {
      handleCancel();
      return;
    }
    emit('save-editing', { collectionId: props.collection.id, name: trimmed });
  }
};

const handleCancel = () => {
  emit('cancel-editing');
};

// Handle delete action from options menu
const handleDelete = async () => {
  // Check if collection has videos before showing delete modal
  try {
    const videosResponse = await props.fetchCollectionVideos(props.collection.id);
    const videoCount = Array.isArray(videosResponse?.data) ? videosResponse.data.length : 0;

    if (videoCount > 0) {
      // Show error modal if collection has videos
      showDeleteErrorModal.value = true;
    } else {
      // Show delete confirmation modal if no videos
      showDeleteModal.value = true;
    }
  } catch (error) {
    console.error('Error checking collection videos:', error);
    // If we can't check, show delete modal anyway
    showDeleteModal.value = true;
  }
};

const handleConfirmDelete = () => {
  emit('delete-collection', props.collection);
  showDeleteModal.value = false;
};

// Expose methods for CollectionOptionsMenu to call
defineExpose({
  handleDelete,
});
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
