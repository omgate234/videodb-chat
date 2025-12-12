<template>
  <label
    class="vdb-c-ml-12 vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-6 vdb-c-px-10 vdb-c-py-6"
  >
    <input
      type="checkbox"
      :checked="checked"
      @change="$emit('change', $event.target.checked)"
      class="vdb-c-h-16 vdb-c-w-16 vdb-c-rounded-2 vdb-c-text-orange focus:vdb-c-ring-orange"
    />
    <span
      class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-none vdb-c-tracking-[0.065px] vdb-c-text-vdb-darkishgrey"
    >
      {{ label }}
    </span>
  </label>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  checked: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['change']);
</script>
