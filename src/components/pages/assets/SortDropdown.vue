<template>
  <div class="vdb-c-relative">
    <button
      @click="$emit('toggle')"
      :class="[
        'vdb-c-flex vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-8 vdb-c-border vdb-c-px-12 vdb-c-py-8 vdb-c-text-body vdb-c-font-medium vdb-c-text-kilvish-900 hover:vdb-c-bg-roy',
        isOpen ? 'vdb-c-border-roy vdb-c-bg-roy' : 'vdb-c-border-[#B9B9B9] vdb-c-bg-white',
      ]"
    >
      <span>Sort by</span>
      <ChevronDownIcon
        :class="[
          'vdb-c-h-20 vdb-c-w-20 vdb-c-text-vdb-darkishgrey vdb-c-transition-transform vdb-c-duration-200',
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
            name="alphabetical"
            value="az"
            label="A to Z"
            :model-value="modelValue.alphabetical"
            @update:model-value="(val) => updateCategory('alphabetical', val)"
          />
          <RadioInput
            name="alphabetical"
            value="za"
            label="Z to A"
            :model-value="modelValue.alphabetical"
            @update:model-value="(val) => updateCategory('alphabetical', val)"
          />
        </div>
      </div>

      <!-- Duration -->
      <div class="w-full vdb-c-flex vdb-c-flex-col vdb-c-items-start vdb-c-gap-[4px]">
        <TitleWithTooltip title="Duration" tooltip-text="" />
        <div class="w-full vdb-c-ml-10 vdb-c-flex vdb-c-flex-col vdb-c-gap-[2px]">
          <RadioInput
            name="duration"
            value="short_long"
            label="Short to Long"
            :model-value="modelValue.duration"
            @update:model-value="(val) => updateCategory('duration', val)"
          />
          <RadioInput
            name="duration"
            value="long_short"
            label="Long to Short"
            :model-value="modelValue.duration"
            @update:model-value="(val) => updateCategory('duration', val)"
          />
        </div>
      </div>

      <!-- File size -->
      <div class="w-full vdb-c-flex vdb-c-flex-col vdb-c-items-start vdb-c-gap-[4px]">
        <TitleWithTooltip title="File size" tooltip-text="" />
        <div class="w-full vdb-c-ml-10 vdb-c-flex vdb-c-flex-col vdb-c-gap-[2px]">
          <RadioInput
            name="file_size"
            value="small_large"
            label="Small to Large"
            :model-value="modelValue.fileSize"
            @update:model-value="(val) => updateCategory('fileSize', val)"
          />
          <RadioInput
            name="file_size"
            value="large_small"
            label="Large to Small"
            :model-value="modelValue.fileSize"
            @update:model-value="(val) => updateCategory('fileSize', val)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ChevronDownIcon from '../../chat/v2/icons/ChevronDownIcon.vue';
import TitleWithTooltip from '../collection/components/TitleWithTooltip.vue';
import RadioInput from '../../chat/v2/elements/RadioInput.vue';

const props = defineProps({
  isOpen: Boolean,
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['toggle', 'update:modelValue']);

const updateCategory = (category, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [category]: value,
  });
};
</script>
