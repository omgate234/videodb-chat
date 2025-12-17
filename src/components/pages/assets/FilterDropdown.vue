<template>
  <div class="vdb-c-relative">
    <button
      @click="$emit('toggle')"
      :class="[
        'vdb-c-flex vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-8 vdb-c-border vdb-c-px-[9px] vdb-c-py-[9px] vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-5 vdb-c-transition-colors',
        hasActiveFilters
          ? 'vdb-c-border-[#FFCFA5] vdb-c-bg-[#FFE9D3] vdb-c-text-[#821F0C]'
          : isOpen
            ? 'vdb-c-border-[#B9B9B9] vdb-c-bg-[#EFEFEF] vdb-c-text-[#000000]'
            : 'vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-text-[#000000]',
      ]"
    >
      <span>Filter by</span>
      <ChevronDownIcon
        :class="[
          'vdb-c-h-[16.667px] vdb-c-w-[16.667px] vdb-c-transition-transform vdb-c-duration-200',
          hasActiveFilters ? 'vdb-c-text-[#821F0C]' : 'vdb-c-text-[#1E1E1E]',
          isOpen ? 'vdb-c-rotate-180' : '',
        ]"
      />
    </button>

    <div
      v-if="isOpen"
      class="vdb-c-absolute vdb-c-right-0 vdb-c-top-full vdb-c-z-20 vdb-c-mt-8 vdb-c-w-256 vdb-c-rounded-12 vdb-c-bg-white vdb-c-p-8 vdb-c-shadow-lg vdb-c-ring-1 vdb-c-ring-black-4"
    >
      <div class="vdb-c-flex vdb-c-max-h-352 vdb-c-flex-col vdb-c-gap-8 vdb-c-overflow-y-auto">
        <!-- Duration -->
        <div>
          <p
            class="vdb-c-mb-4 vdb-c-rounded-8 vdb-c-bg-vdb-lightgrey vdb-c-px-8 vdb-c-py-6 vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
          >
            Duration
          </p>
          <div class="vdb-c-px-10">
            <CheckboxOption
              label="Less than 1 min"
              :checked="modelValue.dur_less_1"
              @change="(checked) => updateFilter('dur_less_1', checked)"
            />
            <CheckboxOption
              label="1-15 minutes"
              :checked="modelValue.dur_1_15"
              @change="(checked) => updateFilter('dur_1_15', checked)"
            />
            <CheckboxOption
              label="15-30 minutes"
              :checked="modelValue.dur_15_30"
              @change="(checked) => updateFilter('dur_15_30', checked)"
            />
            <CheckboxOption
              label="More than 30 min"
              :checked="modelValue.dur_more_30"
              @change="(checked) => updateFilter('dur_more_30', checked)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ChevronDownIcon from '../../chat/v2/icons/ChevronDownIcon.vue';
import CheckboxOption from './CheckboxOption.vue';

const props = defineProps({
  isOpen: Boolean,
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['toggle', 'update:modelValue']);

// Check if any filter option is selected
const hasActiveFilters = computed(() => {
  return Object.values(props.modelValue).some((value) => value === true);
});

const updateFilter = (key, value) => {
  props.modelValue[key] = value;
  emit('update:modelValue', props.modelValue);
};
</script>
