<template>
  <button
    class="vdb-c-flex vdb-c-h-40 vdb-c-items-center vdb-c-gap-1 vdb-c-rounded-md vdb-c-px-3 vdb-c-text-sm vdb-c-font-medium vdb-c-leading-6 vdb-c-tracking-wider"
    :class="[
      disabled
        ? 'vdb-c-cursor-not-allowed vdb-c-text-[#969696]'
        : 'vdb-c-text-[#282828] hover:vdb-c-bg-gray-50',
      !isPrevious ? 'vdb-c-flex-row-reverse' : '',
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <NextIcon
      v-if="!isPrevious"
      class="vdb-c-h-20 vdb-c-w-20"
      :class="disabled ? 'vdb-c-text-[#969696]' : 'vdb-c-text-[#282828]'"
    />
    <NextIcon
      v-else
      class="vdb-c-h-20 vdb-c-w-20 vdb-c-rotate-180 vdb-c-transform"
      :class="disabled ? 'vdb-c-text-[#969696]' : 'vdb-c-text-[#282828]'"
    />
    <span>{{ label }}</span>
  </button>
</template>

<script setup>
import NextIcon from '../icons/NextIcon.vue';

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  isPrevious: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['click']);
</script>
