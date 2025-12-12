<template>
  <button
    class="vdb-c-flex vdb-c-h-40 vdb-c-w-40 vdb-c-items-center vdb-c-justify-center vdb-c-gap-5 vdb-c-rounded-[10px] vdb-c-text-sm vdb-c-font-medium vdb-c-leading-6 vdb-c-tracking-wider"
    :class="[
      state === 'active'
        ? 'vdb-c-bg-[#EC5B16] vdb-c-text-white'
        : 'vdb-c-text-[#282828] hover:vdb-c-bg-gray-50',
    ]"
    @click="$emit('click', targetPage)"
  >
    {{ label }}
  </button>
</template>

<script setup>
const props = defineProps({
  label: {
    type: [String, Number],
    required: true,
  },
  targetPage: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'active', 'disabled'].includes(value),
  },
  isFirst: {
    type: Boolean,
    default: false,
  },
  isLast: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['click']);
</script>

<style></style>
