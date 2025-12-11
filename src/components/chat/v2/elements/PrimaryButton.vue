<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-4 vdb-c-rounded-8 vdb-c-bg-vdb-orange vdb-c-p-8 vdb-c-pr-12 vdb-c-text-sm vdb-c-font-medium vdb-c-text-white vdb-c-transition-colors vdb-c-duration-200 hover:vdb-c-bg-vdb-darkorange',
      'disabled:vdb-c-cursor-not-allowed disabled:vdb-c-bg-[#B9B9B9]',
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
