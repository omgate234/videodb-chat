<template>
  <div
    class="vdb-c-group vdb-c-relative vdb-c-flex vdb-c-h-[44px] vdb-c-w-[44px] vdb-c-shrink-0 vdb-c-overflow-hidden vdb-c-rounded-10 vdb-c-bg-white hover:vdb-c-outline hover:vdb-c-outline-1 hover:vdb-c-outline-roy"
  >
    <img :src="file.url" class="vdb-c-h-full vdb-c-w-full vdb-c-object-cover" alt="" />
    <!-- Remove Button -->
    <button
      @click="$emit('remove')"
      class="vdb-c-absolute vdb-c-right-2 vdb-c-top-2 vdb-c-flex vdb-c-h-16 vdb-c-w-16 vdb-c-items-center vdb-c-justify-center vdb-c-opacity-0 vdb-c-transition-opacity group-hover:vdb-c-opacity-100"
    >
      <CrossFilled :fill="'#1E1E1E'" class="vdb-c-relative vdb-c-h-16 vdb-c-w-16" />
    </button>
  </div>
</template>

<script setup>
import CrossFilled from '../../../chat/v2/icons/CrossFilled.vue';

defineProps({
  file: {
    type: Object,
    required: true,
    validator: (file) => file.type === 'image' && file.url,
  },
});

defineEmits(['remove']);
</script>
