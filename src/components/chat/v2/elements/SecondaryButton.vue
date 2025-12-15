<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'vdb-c-rounded-10 vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-16 vdb-c-py-8 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-[#1A1A1A] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#F7F7F7]',
      'disabled:vdb-c-cursor-not-allowed disabled:vdb-c-opacity-50',
      customClass,
    ]"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  customClass: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['click']);

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>
