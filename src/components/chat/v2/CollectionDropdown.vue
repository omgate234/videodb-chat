<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      :class="['vdb-c-absolute vdb-c-inset-0 vdb-c-z-40']"
      @click="$emit('close')"
    ></div>
    <div
      v-if="isOpen"
      ref="dropdownRef"
      :style="{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }"
      class="vdb-c-fixed vdb-c-z-50 vdb-c-flex vdb-c-min-w-[254px] vdb-c-flex-col vdb-c-gap-[2px] vdb-c-rounded-12 vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-p-8 vdb-c-shadow-[0px_23px_6px_0px_rgba(0,0,0,0),0px_15px_6px_0px_rgba(0,0,0,0.01),0px_8px_5px_0px_rgba(0,0,0,0.02),0px_4px_4px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.03)]"
      :class="[`vdb-c-top-[${position.top}px]`, `vdb-c-left-[${position.left}px]`]"
      @click.stop
    >
      <button
        v-for="collection in collections"
        :key="collection.id"
        @click="handleCollectionClick(collection.id)"
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-roy"
      >
        <FolderIcon stroke-color="#1E1E1E" class="vdb-c-flex-shrink-0" />
        <span
          class="vdb-c-flex-1 vdb-c-truncate vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
        >
          {{ collection.name }}
        </span>
      </button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue';
import FolderIcon from './icons/FolderIcon.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  collections: {
    type: Array,
    default: () => [],
  },
  triggerElement: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'collection-select']);

const position = ref({ top: 0, left: 0 });
const dropdownRef = ref(null);

const updatePosition = () => {
  if (document.querySelector('[data-compid="see-more-button"]')) {
    try {
      const rect = document
        .querySelector('[data-compid="see-more-button"]')
        .getBoundingClientRect();

      const gap = 8;
      position.value = {
        top: rect.top,
        left: rect.right + gap,
      };

      nextTick(() => {
        if (dropdownRef.value) {
          const dropdownRect = dropdownRef.value.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          if (position.value.top + dropdownRect.height > windowHeight) {
            position.value.top = rect.bottom - dropdownRect.height;
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

const handleCollectionClick = (collectionId) => {
  emit('collection-select', collectionId);
  emit('close');
};
</script>
