<template>
  <div
    class="vdb-c-pointer-events-none vdb-c-z-[9999] vdb-c-flex vdb-c-flex-col vdb-c-items-start vdb-c-gap-4 vdb-c-whitespace-nowrap vdb-c-rounded-6 vdb-c-bg-vdb-darkishgrey vdb-c-px-10 vdb-c-py-4 vdb-c-text-center vdb-c-text-caption1 vdb-c-font-medium vdb-c-tracking-[0.06px] vdb-c-text-white"
  >
    {{ text }}
  </div>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    default: '',
  },
});
</script>
