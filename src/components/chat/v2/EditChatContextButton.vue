<template>
  <button
    v-if="!isHidden"
    @click="$emit('click')"
    class="vdb-c-flex vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-12 vdb-c-border vdb-c-border-[#FFCFA5] vdb-c-bg-[#FFE9D3] vdb-c-px-20 vdb-c-py-10 vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#FFD9B3]"
  >
    <span
      class="vdb-c-whitespace-nowrap vdb-c-text-[14px] vdb-c-font-semibold vdb-c-leading-[22px] vdb-c-text-[#EC5B16]"
    >
      Dev Zone
    </span>
    <EditIcon class="vdb-c-h-24 vdb-c-w-24 vdb-c-text-[#EC5B16]" />
  </button>
</template>

<script setup>
import { computed, unref } from 'vue';
import EditIcon from '../../icons/Edit.vue';

const props = defineProps({
  chatLoading: {
    type: [Boolean, Object],
    default: false,
  },
});

defineEmits(['click']);

const isHidden = computed(() => {
  const loading = unref(props.chatLoading);
  return !!loading;
});
</script>
