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
      class="vdb-c-absolute vdb-c-right-0 vdb-c-top-full vdb-c-z-20 vdb-c-mt-8 vdb-c-w-256 vdb-c-rounded-12 vdb-c-bg-white vdb-c-p-8 vdb-c-shadow-lg vdb-c-ring-1 vdb-c-ring-black-4"
    >
      <div class="vdb-c-flex vdb-c-flex-col">
        <!-- Alphabetical -->
        <div class="vdb-c-flex vdb-c-flex-col">
          <p
            class="vdb-c-mb-4 vdb-c-rounded-8 vdb-c-bg-vdb-lightgrey vdb-c-px-8 vdb-c-py-6 vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
          >
            Alphabetical
          </p>
          <RadioButton
            class="ml-12"
            name="alphabetical"
            label="A to Z"
            value="az"
            :current-value="modelValue.alphabetical"
            @change="(val) => updateCategory('alphabetical', val)"
          />
          <RadioButton
            name="alphabetical"
            label="Z to A"
            value="za"
            :current-value="modelValue.alphabetical"
            @change="(val) => updateCategory('alphabetical', val)"
          />
        </div>

        <!-- Duration -->
        <div class="vdb-c-mt-8 vdb-c-flex vdb-c-flex-col">
          <p
            class="vdb-c-mb-4 vdb-c-rounded-8 vdb-c-bg-vdb-lightgrey vdb-c-px-8 vdb-c-py-6 vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
          >
            Duration
          </p>
          <RadioButton
            name="duration"
            label="Short to Long"
            value="short_long"
            :current-value="modelValue.duration"
            @change="(val) => updateCategory('duration', val)"
          />
          <RadioButton
            name="duration"
            label="Long to Short"
            value="long_short"
            :current-value="modelValue.duration"
            @change="(val) => updateCategory('duration', val)"
          />
        </div>

        <!-- File size -->
        <div class="vdb-c-mt-8 vdb-c-flex vdb-c-flex-col">
          <p
            class="vdb-c-mb-4 vdb-c-rounded-8 vdb-c-bg-vdb-lightgrey vdb-c-px-8 vdb-c-py-6 vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
          >
            File size
          </p>
          <RadioButton
            name="file_size"
            label="Small to Large"
            value="small_large"
            :current-value="modelValue.fileSize"
            @change="(val) => updateCategory('fileSize', val)"
          />
          <RadioButton
            name="file_size"
            label="Large to Small"
            value="large_small"
            :current-value="modelValue.fileSize"
            @change="(val) => updateCategory('fileSize', val)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h } from 'vue';
import ChevronDownIcon from '../../chat/v2/icons/ChevronDownIcon.vue';

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

// Internal Helper
const RadioButton = (props, { emit }) => {
  return h(
    'label',
    {
      class:
        'vdb-c-flex vdb-c-cursor-pointer vdb-c-ml-12 vdb-c-items-center vdb-c-gap-8 vdb-c-px-10 vdb-c-py-6',
    },
    [
      h('input', {
        type: 'radio',
        name: props.name,
        value: props.value,
        checked: props.currentValue === props.value,
        onChange: () => emit('change', props.value),
        class:
          'vdb-c-h-16 vdb-c-w-16 vdb-c-text-orange focus:vdb-c-ring-orange vdb-c-accent-orange',
      }),
      h(
        'span',
        {
          class:
            'vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-none vdb-c-tracking-[0.065px] vdb-c-text-vdb-darkishgrey',
        },
        props.label
      ),
    ]
  );
};
</script>

<style scoped>
/* Custom radio button styling to match Figma design */
:deep(input[type='radio']) {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
}

:deep(input[type='radio']:checked) {
  border-color: #ec5b16;
  background-color: #ffffff;
}

:deep(input[type='radio']:checked::before) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ec5b16;
}

:deep(input[type='radio']:focus) {
  outline: none;
  box-shadow: 0 0 0 2px rgba(236, 91, 22, 0.2);
}
</style>
