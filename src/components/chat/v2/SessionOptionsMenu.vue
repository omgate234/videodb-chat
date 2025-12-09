<template>
  <Teleport to="body">
    <div v-if="isOpen" class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-40" @click="$emit('close')"></div>
    <div
      v-if="isOpen"
      ref="menuRef"
      class="vdb-c-fixed vdb-c-z-50 vdb-c-flex vdb-c-min-w-[200px] vdb-c-flex-col vdb-c-gap-[4px] vdb-c-rounded-12 vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-shadow-[0px_23px_6px_0px_rgba(0,0,0,0),0px_15px_6px_0px_rgba(0,0,0,0.01),0px_8px_5px_0px_rgba(0,0,0,0.02),0px_4px_4px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.03)]"
      :style="{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }"
      @click.stop
    >
      <button
        @click="handleRename"
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[6px] vdb-c-rounded-[10px] vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#F5F5F5]"
      >
        <div
          class="vdb-c-flex vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center"
        >
          <EditIcon stroke-color="#1E1E1E" />
        </div>
        <span
          class="vdb-c-flex-1 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1e1e1e]"
        >
          Rename chat
        </span>
      </button>
      <button
        @click="handleShare"
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[6px] vdb-c-rounded-[10px] vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#F5F5F5]"
      >
        <div
          class="vdb-c-flex vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center"
        >
          <ShareIcon stroke-color="#1E1E1E" />
        </div>
        <span
          class="vdb-c-flex-1 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1e1e1e]"
        >
          Share chat
        </span>
      </button>
      <button
        @click="handleDelete"
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[6px] vdb-c-rounded-[10px] vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#F5F5F5]"
      >
        <div
          class="vdb-c-flex vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center"
        >
          <TrashIcon stroke-color="#E2462C" />
        </div>
        <span
          class="vdb-c-flex-1 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#E2462C]"
        >
          Delete
        </span>
      </button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue';
import EditIcon from './icons/EditIcon.vue';
import ShareIcon from './icons/ShareIcon.vue';
import TrashIcon from './icons/TrashIcon.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  triggerElement: {
    type: Object, // Expecting the HTML Element
    default: null,
  },
  session: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'rename', 'share', 'delete']);

const position = ref({ top: 0, left: 0 });
const menuRef = ref(null);

const updatePosition = () => {
  if (props.session && document.querySelector(`[data-session-id="${props.session.session_id}"]`)) {
    try {
      const rect = document
        .querySelector(`[data-session-id="${props.session.session_id}"]`)
        .getBoundingClientRect();
      const gap = 8;

      position.value = {
        top: rect.bottom - 36,
        left: rect.right + gap,
      };

      nextTick(() => {
        if (menuRef.value) {
          const menuRect = menuRef.value.getBoundingClientRect();
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          // Adjust horizontal position if menu goes off screen
          if (position.value.left + menuRect.width > windowWidth) {
            position.value.left = windowWidth - menuRect.width - 12;
          }
          if (position.value.left < 12) {
            position.value.left = 12;
          }

          // Adjust vertical position if menu goes off screen
          if (position.value.top + menuRect.height > windowHeight) {
            position.value.top = rect.top - menuRect.height - gap;
          }
          if (position.value.top < 12) {
            position.value.top = 12;
          }
        }
      });
    } catch (error) {
      console.warn('Error calculating position:', error);
    }
  }
};

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      updatePosition();
    }
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      window.addEventListener('resize', updatePosition);
    } else {
      window.removeEventListener('resize', updatePosition);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  window.removeEventListener('resize', updatePosition);
});

const handleRename = () => {
  emit('rename', props.session);
  emit('close');
};

const handleShare = () => {
  emit('share', props.session);
  emit('close');
};

const handleDelete = () => {
  emit('delete', props.session);
  emit('close');
};
</script>
