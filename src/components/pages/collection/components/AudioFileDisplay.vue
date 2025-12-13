<template>
  <div
    class="vdb-c-group vdb-c-relative vdb-c-flex vdb-c-w-[238px] vdb-c-min-w-[238px] vdb-c-items-start vdb-c-gap-6 vdb-c-rounded-[10px] vdb-c-bg-white vdb-c-p-6 vdb-c-transition-colors"
    :class="{
      'vdb-c-border vdb-c-border-[#EFEFEF]': focused,
    }"
  >
    <!-- Icon Container -->
    <div
      class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-p-6"
    >
      <!-- Audio Icon -->
      <HeadPhoneIcon :fill="'#1E1E1E'" />
    </div>

    <!-- File Info -->
    <div
      class="vdb-c-min-w-0 vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-gap-2 vdb-c-overflow-hidden"
    >
      <span
        class="vdb-c-overflow-hidden vdb-c-text-ellipsis vdb-c-whitespace-nowrap vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-[#1E1E1E]"
        :title="file.name"
        style="font-family: Inter, sans-serif"
      >
        {{ file.name }}
      </span>
      <span
        v-if="file.size"
        class="vdb-c-text-[11px] vdb-c-font-normal vdb-c-leading-normal vdb-c-text-[#464646]"
        style="font-family: Inter, sans-serif"
      >
        {{ file.size }}
      </span>
    </div>

    <!-- Remove Button -->
    <button
      @click="$emit('remove')"
      class="vdb-c-absolute vdb-c-right-6 vdb-c-top-6 vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-items-center vdb-c-justify-center vdb-c-opacity-0 vdb-c-transition-opacity group-hover:vdb-c-opacity-100"
    >
      <CrossFilled :fill="'#1E1E1E'" class="vdb-c-relative vdb-c-h-20 vdb-c-w-20" />
    </button>
  </div>
</template>

<script setup>
import HeadPhoneIcon from '../../../chat/v2/icons/HeadPhoneIcon.vue';
import CrossFilled from '../../../chat/v2/icons/CrossFilled.vue';

defineProps({
  file: {
    type: Object,
    required: true,
    validator: (file) => file.type === 'audio' && file.name,
  },
  focused: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['remove']);
</script>
