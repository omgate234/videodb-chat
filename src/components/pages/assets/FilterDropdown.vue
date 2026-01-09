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
      class="vdb-c-absolute vdb-c-right-0 vdb-c-top-full vdb-c-z-20 vdb-c-mt-8 vdb-c-w-256 vdb-c-rounded-12 vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-8"
      style="
        box-shadow:
          0px 23px 6px 0px rgba(0, 0, 0, 0),
          0px 15px 6px 0px rgba(0, 0, 0, 0.01),
          0px 8px 5px 0px rgba(0, 0, 0, 0.02),
          0px 4px 4px 0px rgba(0, 0, 0, 0.03),
          0px 1px 2px 0px rgba(0, 0, 0, 0.03);
      "
    >
      <div class="vdb-c-flex vdb-c-max-h-352 vdb-c-flex-col vdb-c-gap-8 vdb-c-overflow-y-auto">
        <!-- Duration -->
        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-4 vdb-c-bg-white">
          <div
            class="vdb-c-flex vdb-c-items-center vdb-c-rounded-8 vdb-c-bg-vdb-lightgrey vdb-c-px-8 vdb-c-py-6"
          >
            <p
              class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
            >
              Duration
            </p>
          </div>
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-2 vdb-c-pl-12">
            <CheckboxOption
              label="Less than 1 minute"
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
              label="More than 30 minutes"
              :checked="modelValue.dur_more_30"
              @change="(checked) => updateFilter('dur_more_30', checked)"
            />
          </div>
        </div>

        <!-- File Size -->
        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-4 vdb-c-bg-white">
          <div
            class="vdb-c-flex vdb-c-items-center vdb-c-rounded-8 vdb-c-bg-vdb-lightgrey vdb-c-px-8 vdb-c-py-6"
          >
            <p
              class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
            >
              File Size
            </p>
          </div>
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-2 vdb-c-pl-12">
            <CheckboxOption
              label="Less than 10 MB"
              :checked="modelValue.size_less_10"
              @change="(checked) => updateFilter('size_less_10', checked)"
            />
            <CheckboxOption
              label="10-100 MB"
              :checked="modelValue.size_10_100"
              @change="(checked) => updateFilter('size_10_100', checked)"
            />
            <CheckboxOption
              label="100-500 MB"
              :checked="modelValue.size_100_500"
              @change="(checked) => updateFilter('size_100_500', checked)"
            />
            <CheckboxOption
              label="More than 500 MB"
              :checked="modelValue.size_more_500"
              @change="(checked) => updateFilter('size_more_500', checked)"
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

const hasActiveFilters = computed(() => {
  return Object.values(props.modelValue).some((value) => value === true);
});

const updateFilter = (key, value) => {
  const updatedFilter = { ...props.modelValue, [key]: value };
  emit('update:modelValue', updatedFilter);
  emit('toggle');
};
</script>
