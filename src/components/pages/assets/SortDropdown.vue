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
      class="vdb-c-absolute vdb-c-right-0 vdb-c-top-full vdb-c-z-50 vdb-c-mt-8 vdb-c-w-256 vdb-c-rounded-12 vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-8"
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
        <!-- Alphabetical -->
        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-4 vdb-c-bg-white">
          <div
            class="vdb-c-flex vdb-c-items-center vdb-c-rounded-8 vdb-c-bg-vdb-lightgrey vdb-c-px-8 vdb-c-py-6"
          >
            <p
              class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
            >
              Alphabetical
            </p>
          </div>
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-2 vdb-c-pl-12">
            <RadioOption label="A to Z" value="az" :model-value="modelValue" @change="updateSort" />
            <RadioOption label="Z to A" value="za" :model-value="modelValue" @change="updateSort" />
          </div>
        </div>

        <!-- Duration (hidden for Images and Voices) -->
        <div v-if="showDurationSort" class="vdb-c-flex vdb-c-flex-col vdb-c-gap-4 vdb-c-bg-white">
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
            <RadioOption
              label="Short to Long"
              value="short_long"
              :model-value="modelValue"
              @change="updateSort"
            />
            <RadioOption
              label="Long to Short"
              value="long_short"
              :model-value="modelValue"
              @change="updateSort"
            />
          </div>
        </div>

        <!-- File size (hidden for Images and Voices) -->
        <div v-if="showFileSizeSort" class="vdb-c-flex vdb-c-flex-col vdb-c-gap-4 vdb-c-bg-white">
          <div
            class="vdb-c-flex vdb-c-items-center vdb-c-rounded-8 vdb-c-bg-vdb-lightgrey vdb-c-px-8 vdb-c-py-6"
          >
            <p
              class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
            >
              File size
            </p>
          </div>
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-2 vdb-c-pl-12">
            <RadioOption
              label="Small to Large"
              value="small_large"
              :model-value="modelValue"
              @change="updateSort"
            />
            <RadioOption
              label="Large to Small"
              value="large_small"
              :model-value="modelValue"
              @change="updateSort"
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
import RadioOption from './RadioOption.vue';

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
  return props.activeTab !== 'Images';
});

const showFileSizeSort = computed(() => {
  return props.activeTab !== 'Images';
});

const updateSort = (value) => {
  emit('update:modelValue', value);
  emit('toggle');
};
</script>
