<template>
  <Teleport to="body">
    <div v-if="isOpen" class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-40" @click="$emit('close')"></div>
    <div
      v-if="isOpen"
      ref="menuRef"
      class="vdb-c-fixed vdb-c-z-50 vdb-c-flex vdb-c-min-w-[200px] vdb-c-flex-col vdb-c-gap-[4px] vdb-c-rounded-12 vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-p-8 vdb-c-shadow-[0px_23px_6px_0px_rgba(0,0,0,0),0px_15px_6px_0px_rgba(0,0,0,0.01),0px_8px_5px_0px_rgba(0,0,0,0.02),0px_4px_4px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.03)]"
      :style="{
        top: `${position.top}px`,
        ...(onLeft ? { right: `${position.right}px` } : { left: `${position.left}px` }),
      }"
      @click.stop
    >
      <button
        @click="handleRename"
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-8 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-roy"
      >
        <EditIcon stroke-color="#1E1E1E" />
        <span class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-text-vdb-darkishgrey">
          Rename collection
        </span>
      </button>
      <button
        @click="handleDelete"
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-8 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-roy"
      >
        <TrashIcon stroke-color="#E2462C" />
        <span class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-text-primary">Delete</span>
      </button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue';
import EditIcon from './icons/EditIcon.vue';
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
  collection: {
    type: Object,
    default: null,
  },
  onLeft: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'rename', 'delete']);

const position = ref({ top: 0, left: 0, right: 0 });
const menuRef = ref(null);

const updatePosition = () => {
  let rect = null;

  if (props.triggerElement) {
    try {
      rect = props.triggerElement.getBoundingClientRect();
    } catch (error) {
      console.warn('Error getting triggerElement rect:', error);
    }
  }

  if (!rect && props.collection?.id) {
    const element = document.querySelector(`[data-collection-id="${props.collection.id}"]`);
    if (element) {
      try {
        rect = element.getBoundingClientRect();
      } catch (error) {
        console.warn('Error getting collection element rect:', error);
      }
    }
  }

  if (rect) {
    const gap = 14;

    if (props.onLeft) {
      // Position using right alignment
      position.value = {
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      };

      nextTick(() => {
        if (menuRef.value) {
          const menuRect = menuRef.value.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          if (position.value.top + menuRect.height > windowHeight) {
            position.value.top = rect.top - menuRect.height - gap;
          }
        }
      });
    } else {
      // Default left positioning
      position.value = {
        top: rect.bottom + 4,
        left: Math.max(rect.right - 34, 0),
      };

      nextTick(() => {
        if (menuRef.value) {
          const menuRect = menuRef.value.getBoundingClientRect();
          const windowWidth = window.innerWidth;

          if (position.value.left + menuRect.width > windowWidth) {
            position.value.left = rect.right - menuRect.width;
          }

          const windowHeight = window.innerHeight;
          if (position.value.top + menuRect.height > windowHeight) {
            position.value.top = rect.top - menuRect.height - gap;
          }
        }
      });
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
  emit('rename', props.collection);
  emit('close');
};

const handleDelete = () => {
  emit('delete', props.collection);
  emit('close');
};
</script>
