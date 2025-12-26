<template>
  <div
    class="vdb-c-flex vdb-c-w-full vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7]"
    :class="[wrapperClass, error ? 'vdb-c-border-[#E02424] vdb-c-bg-[#FDF2F2]' : '']"
  >
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :disabled="disabled"
      class="vdb-c-placeholder:text-[#969696] vdb-c-placeholder:font-medium vdb-c-min-h-[104px] vdb-c-w-full vdb-c-resize-none vdb-c-border-none vdb-c-bg-transparent vdb-c-px-[16px] vdb-c-py-[14px] vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-text-[#1E1E1E] vdb-c-outline-none"
      :class="[error ? 'vdb-c-placeholder:text-[#C81E1E] vdb-c-text-[#C81E1E]' : '', textareaClass]"
      @input="onInput"
    />
  </div>
</template>

<script setup>
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

const onInput = (event) => {
  const value = event.target.value ?? '';
  emit('update:modelValue', props.maxlength ? value.slice(0, props.maxlength) : value);
};
</script>
