<template>
  <div
    class="vdb-c-flex vdb-c-w-full vdb-c-rounded-[8px] vdb-c-border vdb-c-transition-colors vdb-c-duration-200"
    :class="[
      wrapperClass,
      error
        ? 'vdb-c-border-[#E02424] vdb-c-bg-[#FDF2F2]'
        : disabled
          ? 'vdb-c-cursor-not-allowed vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-opacity-60'
          : isFocused
            ? 'vdb-c-border-[#EC5B16] vdb-c-bg-white vdb-c-shadow-[0_0_0_2px_rgba(236,91,22,0.25)]'
            : hasValue
              ? 'vdb-c-border-[#EFEFEF] vdb-c-bg-white'
              : 'vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7]',
    ]"
  >
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :disabled="disabled"
      class="vdb-c-placeholder:text-[#969696] vdb-c-placeholder:font-medium vdb-c-min-h-[104px] vdb-c-w-full vdb-c-resize-none vdb-c-border-none vdb-c-bg-transparent vdb-c-px-[16px] vdb-c-py-[14px] vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-text-[#1E1E1E] vdb-c-outline-none disabled:vdb-c-cursor-not-allowed"
      :class="[
        error ? 'vdb-c-placeholder:text-[#C81E1E] vdb-c-text-[#C81E1E]' : '',
        disabled ? 'vdb-c-text-[#969696]' : '',
        textareaClass,
      ]"
      @input="onInput"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  maxlength: {
    type: Number,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  wrapperClass: {
    type: [String, Array, Object],
    default: '',
  },
  textareaClass: {
    type: [String, Array, Object],
    default: '',
  },
  error: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const isFocused = ref(false);
const hasValue = computed(() => props.modelValue?.length > 0);

const onInput = (event) => {
  const value = event.target.value ?? '';
  emit('update:modelValue', props.maxlength ? value.slice(0, props.maxlength) : value);
};
</script>
