<template>
  <div class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-4">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="vdb-c-text-sm vdb-c-font-medium vdb-c-leading-5 vdb-c-text-[#1E1E1E]"
    >
      {{ label }}
    </label>

    <div
      class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-rounded-[8px] vdb-c-border vdb-c-transition-colors vdb-c-duration-200"
      :class="wrapperClasses"
    >
      <div
        v-if="$slots.icon"
        class="vdb-c-flex vdb-c-items-center vdb-c-pl-[16px]"
        :class="iconClass"
      >
        <slot name="icon" />
      </div>

      <input
        :id="inputId"
        :name="inputName"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :disabled="disabled"
        class="vdb-c-w-full vdb-c-border-none vdb-c-bg-transparent vdb-c-py-[14px] vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-outline-none vdb-c-transition-colors vdb-c-duration-200 disabled:vdb-c-cursor-not-allowed"
        :class="inputClasses"
        @input="onInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <!-- Clear Button -->
      <button
        v-if="showClearButton"
        type="button"
        class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-pr-[16px] vdb-c-text-[#1E1E1E] vdb-c-transition-opacity hover:vdb-c-opacity-70"
        @click="handleClear"
        @mousedown.prevent
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <!-- Character Counter -->
    <div
      v-if="maxlength && showCharacterCount"
      class="vdb-c-flex vdb-c-w-full vdb-c-justify-end"
      :class="error ? 'vdb-c-text-[#C81E1E]' : 'vdb-c-text-[#969696]'"
    >
      <span class="vdb-c-text-xs vdb-c-font-medium vdb-c-leading-4">
        {{ characterCount }}/{{ maxlength }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  maxlength: { type: Number, default: undefined },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'text' },
  wrapperClass: { type: [String, Array, Object], default: '' },
  error: { type: Boolean, default: false },
  showCharacterCount: { type: Boolean, default: true },
  allowClear: { type: Boolean, default: false },
  name: { type: String, default: '' },
  id: { type: String, default: '' },
});

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`);
const inputName = computed(() => props.name || inputId.value);

const emit = defineEmits(['update:modelValue']);

const isFocused = ref(false);
const hasValue = computed(() => props.modelValue?.length > 0);
const characterCount = computed(() => props.modelValue?.length || 0);
const showClearButton = computed(
  () => props.allowClear && isFocused.value && hasValue.value && !props.disabled
);

const wrapperClasses = computed(() => [
  props.wrapperClass,
  // Error state
  props.error && 'vdb-c-border-[#E02424] vdb-c-bg-[#FDF2F2]',
  // Disabled state
  props.disabled &&
    'vdb-c-cursor-not-allowed vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-opacity-60',
  // Non-error, non-disabled states
  !props.disabled &&
    !props.error && [
      isFocused.value
        ? 'vdb-c-border-[#EC5B16] vdb-c-bg-white vdb-c-shadow-[0_0_0_2px_rgba(236,91,22,0.25)]'
        : hasValue.value
          ? 'vdb-c-border-[#EFEFEF] vdb-c-bg-white'
          : 'vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7]',
    ],
]);

const inputClasses = computed(() => [
  props.$slots?.icon ? 'vdb-c-pl-[8px]' : 'vdb-c-pl-[16px]',
  showClearButton.value ? 'vdb-c-pr-[8px]' : 'vdb-c-pr-[16px]',
  props.error && 'vdb-c-placeholder:text-[#C81E1E] vdb-c-text-[#C81E1E]',
  props.disabled && 'vdb-c-text-[#969696]',
  !props.error &&
    !props.disabled &&
    'vdb-c-placeholder:text-[#969696] vdb-c-placeholder:font-medium vdb-c-text-[#1E1E1E]',
]);

const iconClass = computed(() => {
  if (props.disabled) return 'vdb-c-text-[#969696]';
  if (isFocused.value && !props.error) return 'vdb-c-text-vdb-orange';
  if (hasValue.value && !isFocused.value && !props.error) return 'vdb-c-text-[#1E1E1E]';
  return 'vdb-c-text-[#969696]';
});

const onInput = (event) => {
  const value = event.target.value ?? '';
  emit('update:modelValue', props.maxlength ? value.slice(0, props.maxlength) : value);
};

const handleClear = () => emit('update:modelValue', '');
</script>
