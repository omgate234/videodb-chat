<template>
  <div
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    class="vdb-c-relative"
    :data-session-id="session.session_id"
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
      <span class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center vdb-c-gap-6 vdb-c-truncate">
        <template v-if="isEditing">
          <input
            :id="`edit-input-${session.session_id}`"
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
            class="vdb-c-inline-block vdb-c-w-full vdb-c-truncate vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5"
            :class="{
              'vdb-c-text-[#821F0C]': isActive,
              'vdb-c-text-vdb-darkishgrey': !isActive && !shouldShowHoverState,
              'vdb-c-text-black': shouldShowHoverState,
            }"
            @dblclick.stop="handleStartEditing"
            title="Double-click to rename"
          >
            {{
              session.name ||
              session?.metadata?.name ||
              new Date(session.created_at * 1000)
                .toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })
                .replace(/\//g, '.')
                .replace(',', ' -')
            }}
          </span>
        </template>
      </span>
      <SpinnerIcon
        v-if="session.isUploading"
        class="vdb-c-size-20 vdb-c-flex-shrink-0 vdb-c-text-vdb-orange"
      />
      <SuccessIcon v-else-if="session.uploadComplete" class="vdb-c-size-20 vdb-c-flex-shrink-0" />
      <button
        v-else-if="(hovered || showOptions) && !isEditing"
        ref="optionsButton"
        @click.stop="handleOptionsClick"
        class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-6 vdb-c-p-4 vdb-c-transition-all vdb-c-duration-200"
      >
        <ThreeDotsIcon stroke-color="#1E1E1E" />
      </button>
    </button>

    <!-- Delete Session Modal -->
    <DeleteSessionModal
      :is-open="showDeleteModal"
      @close="showDeleteModal = false"
      @confirm="handleConfirmDelete"
    />

    <!-- Share Session Modal -->
    <ShareSessionModal
      :is-open="showShareModal"
      :session-id="session.session_id"
      :is-public="session.is_public"
      :on-make-public="onMakePublic"
      @close="showShareModal = false"
    />

    <SessionOptionsMenu
      :is-open="showOptions"
      :session="session"
      :trigger-element="optionsButton"
      @close="showOptions = false"
      @rename="handleRename"
      @share="handleShare"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import ThreeDotsIcon from './icons/ThreeDotsIcon.vue';
import SpinnerIcon from './icons/SpinnerIcon.vue';
import SuccessIcon from './icons/SuccessIcon.vue';
import DeleteSessionModal from './DeleteSessionModal.vue';
import ShareSessionModal from './ShareSessionModal.vue';
import SessionOptionsMenu from './SessionOptionsMenu.vue';

const props = defineProps({
  session: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  editingSessionId: {
    type: String,
    default: null,
  },
  onMakePublic: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits([
  'click',
  'start-editing',
  'save-editing',
  'cancel-editing',
  'delete-session',
  'share-session',
]);

const hovered = ref(false);
const editingName = ref('');
const showDeleteModal = ref(false);
const showShareModal = ref(false);
const showOptions = ref(false);
const optionsButton = ref(null);

const isEditing = computed(() => {
  return props.editingSessionId === props.session.session_id;
});

const isActive = computed(
  () => props.isSelected || props.session.session_id === props.editingSessionId
);

const shouldShowHoverState = computed(() => {
  if (isActive.value) return false;
  return hovered.value || (showOptions.value && !isEditing.value);
});

const getSessionDisplayName = () => {
  return (
    props.session.name ||
    props.session?.metadata?.name ||
    new Date(props.session.created_at * 1000)
      .toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(/\//g, '.')
      .replace(',', ' -')
  );
};

watch(
  () => props.editingSessionId,
  (newValue) => {
    if (newValue === props.session.session_id) {
      editingName.value = getSessionDisplayName();
      nextTick(() => {
        const input = document.getElementById(`edit-input-${props.session.session_id}`);
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
  () => props.session.name,
  (newName) => {
    if (!isEditing.value) {
      editingName.value = newName || '';
    }
  }
);

const handleClick = () => {
  if (!isEditing.value) {
    emit('click', props.session.session_id);
  }
};

const handleOptionsClick = (event) => {
  optionsButton.value = event.currentTarget;
  showOptions.value = !showOptions.value;
};

const handleStartEditing = () => {
  emit('start-editing', props.session);
};

const handleRename = () => {
  handleStartEditing();
  showOptions.value = false;
};

const handleSave = () => {
  if (isEditing.value) {
    const trimmed = (editingName.value || '').trim();
    if (trimmed.length === 0) {
      handleCancel();
      return;
    }
    emit('save-editing', { sessionId: props.session.session_id, name: trimmed });
  }
};

const handleCancel = () => {
  emit('cancel-editing');
};

// Handle delete and share actions from options menu
const handleDelete = () => {
  showDeleteModal.value = true;
  showOptions.value = false;
};

const handleShare = () => {
  showShareModal.value = true;
  showOptions.value = false;
};

const handleConfirmDelete = () => {
  emit('delete-session', props.session.session_id);
  showDeleteModal.value = false;
};

watch(isEditing, (val) => {
  if (val) {
    showOptions.value = false;
  }
});

// Expose methods for SessionOptionsMenu to call
defineExpose({
  handleDelete,
  handleShare,
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
