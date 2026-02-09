<template>
  <Teleport to="body">
    <div v-if="isOpen" class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-40" @click="$emit('close')"></div>
    <div
      v-if="isOpen"
      ref="dropdownRef"
      class="vdb-c-fixed vdb-c-z-50 vdb-c-flex vdb-c-min-w-[208px] vdb-c-flex-col vdb-c-gap-[2px] vdb-c-rounded-12 vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-8 vdb-c-shadow-[0px_-167px_47px_0px_rgba(0,0,0,0),0px_-107px_43px_0px_rgba(0,0,0,0),0px_-60px_36px_0px_rgba(0,0,0,0.01),0px_-27px_27px_0px_rgba(0,0,0,0.02),0px_-7px_15px_0px_rgba(0,0,0,0.02)]"
      :style="{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }"
      @click.stop
    >
      <!-- Agents Section -->
      <div class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-[2px]">
        <button
          v-for="agent in agents"
          :key="agent.name"
          :disabled="agent.disabled"
          @click="handleAgentClick(agent)"
          :class="[
            'group vdb-c-group vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200',
            agent.disabled && 'vdb-c-cursor-not-allowed',
            selectedAgent?.name === agent.name ? 'vdb-c-bg-[#FFE9D3]' : 'hover:vdb-c-bg-[#EFEFEF]',
          ]"
        >
          <Tooltip
            v-if="agent.disabled"
            class="vdb-c-absolute vdb-c-left-[87.5%] vdb-c-top-0 vdb-c-hidden group-hover:vdb-c-block"
            text="Add or generate videos in your collection to enable this"
          />
          <component
            :is="agent.icon"
            :class="[
              'vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0',
              agent.disabled ? 'vdb-c-text-[#969696]' : selectedAgent?.name === agent.name ? 'vdb-c-text-[#821F0C]' : 'vdb-c-text-vdb-darkishgrey',
            ]"
          />
          <span
            :class="[
              'vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5',
              agent.disabled ? 'vdb-c-text-[#969696]' : selectedAgent?.name === agent.name ? 'vdb-c-text-[#821F0C]' : 'vdb-c-text-vdb-darkishgrey',
            ]"
          >
            {{ agent.name }}
          </span>
        </button>
      </div>

      <!-- Divider -->
      <div v-if="!hideUploadSection" class="vdb-c-my-[2px] vdb-c-h-px vdb-c-w-full vdb-c-bg-[#EFEFEF]"></div>

      <!-- Upload Section -->
      <div v-if="!hideUploadSection" class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-[2px]">
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
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue';
import UploadFileIcon from '../../../chat/v2/icons/UploadFileIcon.vue';
import FolderOpenIcon from '../../../chat/v2/icons/FolderOpenIcon.vue';
import Tooltip from '../../../chat/v2/elements/Tooltip.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  triggerElement: {
    type: Object,
    default: null,
  },
  agents: {
    type: Array,
    default: () => [],
  },
  hideUploadSection: {
    type: Boolean,
    default: false,
  },
  selectedAgent: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits([
  'close',
  'agent-select',
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
      const gap = 8; // Gap between button and dropdown

      // Position above the button (drop-up)
      position.value = {
        top: rect.top - gap, // Start above
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

          // Adjust vertical position - place above button
          position.value.top = rect.top - dropdownRect.height - gap;

          // If dropdown goes above viewport, position below instead
          if (position.value.top < 0) {
            position.value.top = rect.bottom + gap;
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

const handleAgentClick = (agent) => {
  if (!agent.disabled) {
    emit('agent-select', agent);
    emit('close');
  }
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || []);
  if (files.length > 0) {
    emit('files-selected', files);
    emit('close');
  }
  event.target.value = '';
};

const handleUploadFromCollection = () => {
  emit('upload-from-collection');
  emit('close');
};
</script>
