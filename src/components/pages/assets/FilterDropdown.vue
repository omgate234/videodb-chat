<template>
  <div class="vdb-c-relative">
    <button
      @click="$emit('toggle')"
      :class="[
        'vdb-c-flex vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-8 vdb-c-border vdb-c-px-12 vdb-c-py-8 vdb-c-text-body vdb-c-font-medium vdb-c-text-kilvish-900 hover:vdb-c-bg-roy',
        isOpen ? 'vdb-c-border-roy vdb-c-bg-roy' : 'vdb-c-border-[#B9B9B9] vdb-c-bg-white',
      ]"
    >
      <span>Filter by</span>
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

        <!-- File Size -->
        <div>
          <p
            class="vdb-c-mb-4 vdb-c-rounded-8 vdb-c-bg-vdb-lightgrey vdb-c-px-8 vdb-c-py-6 vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
          >
            File Size
          </p>
          <div class="vdb-c-px-10">
            <CheckboxOption
              label="< 10 MB"
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
              label="> 500 MB"
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

const updateFilter = (key, value) => {
  props.modelValue[key] = value;
  emit('update:modelValue', props.modelValue);
};
</script>
