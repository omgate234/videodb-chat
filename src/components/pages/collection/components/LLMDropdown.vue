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
      class="vdb-c-fixed vdb-c-z-50 vdb-c-flex vdb-c-max-h-[400px] vdb-c-min-w-[120px] vdb-c-flex-col vdb-c-gap-[2px] vdb-c-overflow-y-auto vdb-c-rounded-12 vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-p-8 vdb-c-shadow-[0px_23px_6px_0px_rgba(0,0,0,0),0px_15px_6px_0px_rgba(0,0,0,0.01),0px_8px_5px_0px_rgba(0,0,0,0.02),0px_4px_4px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.03)]"
      @click.stop
    >
      <template v-for="provider in providers" :key="provider.provider">
        <button
          v-for="model in provider.models"
          :key="model.id"
          @click="handleModelClick(model.id, model.name)"
          :class="[
            'vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200',
            selectedModelId === model.id ? 'vdb-c-bg-[#FFE9D3]' : 'hover:vdb-c-bg-roy',
          ]"
        >
          <span
            :class="[
              'vdb-c-flex-1 vdb-c-truncate vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5',
              selectedModelId === model.id ? 'vdb-c-text-[#821F0C]' : 'vdb-c-text-vdb-darkishgrey',
            ]"
          >
            {{ model.name }}
          </span>
        </button>
      </template>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  providers: {
    type: Array,
    default: () => [],
  },
  triggerElement: {
    type: Object,
    default: null,
  },
  selectedModelId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['close', 'model-select']);

const position = ref({ top: 0, left: 0 });
const dropdownRef = ref(null);

const updatePosition = () => {
  if (props.triggerElement) {
    try {
      const rect = props.triggerElement.getBoundingClientRect();
      const gap = 8;

      position.value = {
        top: rect.bottom + gap,
        left: rect.left,
      };

      nextTick(() => {
        if (dropdownRef.value) {
          const dropdownRect = dropdownRef.value.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const windowWidth = window.innerWidth;

          if (position.value.top + dropdownRect.height > windowHeight) {
            position.value.top = rect.top - dropdownRect.height - gap;
          }

          if (position.value.left + dropdownRect.width > windowWidth) {
            position.value.left = windowWidth - dropdownRect.width - 16;
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

const handleModelClick = (modelId, modelName) => {
  emit('model-select', { id: modelId, name: modelName });
  emit('close');
};
</script>
