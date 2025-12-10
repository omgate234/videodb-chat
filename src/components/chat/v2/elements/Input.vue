<template>
  <div
    class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7]"
    :class="[wrapperClass, error ? 'vdb-c-border-[#E02424] vdb-c-bg-[#FDF2F2]' : '']"
  >
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :disabled="disabled"
      class="vdb-c-placeholder:text-[#969696] vdb-c-placeholder:font-medium vdb-c-w-full vdb-c-border-none vdb-c-bg-transparent vdb-c-px-[16px] vdb-c-py-[14px] vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-text-[#1E1E1E] vdb-c-outline-none"
      :class="error ? 'vdb-c-placeholder:text-[#C81E1E] vdb-c-text-[#C81E1E]' : ''"
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
  type: {
    type: String,
    default: 'text',
  },
  wrapperClass: {
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
