<template>
  <Teleport to="body">
    <div v-if="isOpen" class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-40" @click="$emit('close')"></div>
    <div
      v-if="isOpen"
      ref="dropdownRef"
      class="vdb-c-fixed vdb-c-z-50 vdb-c-flex vdb-c-min-w-[148px] vdb-c-flex-col vdb-c-gap-[2px] vdb-c-rounded-12 vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-8 vdb-c-shadow-[0px_23px_6px_0px_rgba(0,0,0,0),0px_15px_6px_0px_rgba(0,0,0,0.01),0px_8px_5px_0px_rgba(0,0,0,0.02),0px_4px_4px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.03)]"
      :style="{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }"
      @click.stop
    >
      <label
        class="vdb-c-flex vdb-c-w-full vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#EFEFEF]"
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          class="vdb-c-hidden"
          @change="handleFileSelect"
        />
        <UploadFileIcon
          :stroke-color="'#1E1E1E'"
          class="vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0"
        />
        <span
          class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
        >
          Upload from device
        </span>
      </label>
      <button
        @click="handleUploadFromCollection"
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#EFEFEF]"
      >
        <FolderOpenIcon class="vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0" />
        <span
          class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
        >
          Add from collection
        </span>
      </button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue';
import UploadFileIcon from '../../../chat/v2/icons/UploadFileIcon.vue';
import FolderOpenIcon from '../../../chat/v2/icons/FolderOpenIcon.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  triggerElement: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits([
  'close',
  'upload-from-device',
  'upload-from-collection',
  'files-selected',
]);

const position = ref({ top: 0, left: 0 });
const dropdownRef = ref(null);

const updatePosition = () => {
  if (props.triggerElement) {
    try {
      const rect = props.triggerElement.getBoundingClientRect();
      const gap = 3; // 3px gap as specified

      position.value = {
        top: rect.bottom + gap,
        left: rect.left,
      };

      nextTick(() => {
        if (dropdownRef.value) {
          const dropdownRect = dropdownRef.value.getBoundingClientRect();
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          // Adjust horizontal position if needed
          if (position.value.left + dropdownRect.width > windowWidth) {
            position.value.left = rect.right - dropdownRect.width;
          }
          if (position.value.left < 0) {
            position.value.left = rect.left;
          }

          // Adjust vertical position if needed
          if (position.value.top + dropdownRect.height > windowHeight) {
            position.value.top = rect.top - dropdownRect.height - gap;
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

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || []);
  if (files.length > 0) {
    emit('files-selected', files);
    emit('close');
  }
  event.target.value = '';
};

const handleUploadFromDevice = () => {
  emit('upload-from-device');
};

const handleUploadFromCollection = () => {
  emit('upload-from-collection');
  emit('close');
};
</script>
