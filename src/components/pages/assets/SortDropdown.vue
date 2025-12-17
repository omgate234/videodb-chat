<template>
  <div class="vdb-c-relative">
    <button
      @click="$emit('toggle')"
      :class="[
        'vdb-c-flex vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-8 vdb-c-border vdb-c-px-[9px] vdb-c-py-[9px] vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-5 vdb-c-transition-colors',
        hasActiveSort
          ? 'vdb-c-border-[#FFCFA5] vdb-c-bg-[#FFE9D3] vdb-c-text-[#821F0C]'
          : isOpen
            ? 'vdb-c-border-[#B9B9B9] vdb-c-bg-[#EFEFEF] vdb-c-text-[#000000]'
            : 'vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-text-[#000000]',
      ]"
    >
      <span>Sort by</span>
      <ChevronDownIcon
        :class="[
          'vdb-c-h-[16.667px] vdb-c-w-[16.667px] vdb-c-transition-transform vdb-c-duration-200',
          hasActiveSort ? 'vdb-c-text-[#821F0C]' : 'vdb-c-text-[#1E1E1E]',
          isOpen ? 'vdb-c-rotate-180' : '',
        ]"
      />
    </button>

    <div
      v-if="isOpen"
      @click.stop
      class="vdb-c-absolute vdb-c-right-0 vdb-c-top-full vdb-c-z-50 vdb-c-mt-8 vdb-c-flex vdb-c-w-[250px] vdb-c-cursor-default vdb-c-flex-col vdb-c-gap-[8px] vdb-c-rounded-[12px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-8 vdb-c-shadow-[0px_0px_4px_0px_rgba(0,0,0,0.04),0px_0px_1px_0px_rgba(0,0,0,0.6)]"
    >
      <!-- Alphabetical -->
      <div class="w-full vdb-c-flex vdb-c-flex-col vdb-c-items-start vdb-c-gap-[4px]">
        <TitleWithTooltip title="Alphabetical" tooltip-text="" />
        <div class="w-full vdb-c-ml-10 vdb-c-flex vdb-c-flex-col vdb-c-gap-[2px]">
          <RadioInput
            name="sort"
            value="az"
            label="A to Z"
            :model-value="modelValue"
            @update:model-value="updateSort"
          />
          <RadioInput
            name="sort"
            value="za"
            label="Z to A"
            :model-value="modelValue"
            @update:model-value="updateSort"
          />
        </div>
      </div>

      <!-- Duration (hidden for Images and Voices) -->
      <div
        v-if="showDurationSort"
        class="w-full vdb-c-flex vdb-c-flex-col vdb-c-items-start vdb-c-gap-[4px]"
      >
        <TitleWithTooltip title="Duration" tooltip-text="" />
        <div class="w-full vdb-c-ml-10 vdb-c-flex vdb-c-flex-col vdb-c-gap-[2px]">
          <RadioInput
            name="sort"
            value="short_long"
            label="Short to Long"
            :model-value="modelValue"
            @update:model-value="updateSort"
          />
          <RadioInput
            name="sort"
            value="long_short"
            label="Long to Short"
            :model-value="modelValue"
            @update:model-value="updateSort"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ChevronDownIcon from '../../chat/v2/icons/ChevronDownIcon.vue';
import TitleWithTooltip from '../collection/components/TitleWithTooltip.vue';
import RadioInput from '../../chat/v2/elements/RadioInput.vue';

const props = defineProps({
  isOpen: Boolean,
  modelValue: {
    type: String,
    default: '',
  },
  activeTab: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['toggle', 'update:modelValue']);

const hasActiveSort = computed(() => {
  return Boolean(props.modelValue);
});

const showDurationSort = computed(() => {
  return props.activeTab !== 'Images' && props.activeTab !== 'Voices';
});

const updateSort = (value) => {
  emit('update:modelValue', value);
};
</script>
