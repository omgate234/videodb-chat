<template>
  <div
    class="vdb-c-group vdb-c-relative vdb-c-flex vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-[10px] vdb-c-bg-white vdb-c-p-6 vdb-c-transition-colors"
    :class="[
      fullWidth ? 'vdb-c-w-full' : 'vdb-c-w-[238px] vdb-c-min-w-[238px]',
      {
        'vdb-c-border vdb-c-border-[#EFEFEF]': focused,
        'vdb-c-border vdb-c-border-[#E02424] vdb-c-bg-[#FDF2F2]': file.status === 'failure',
      },
    ]"
  >
    <!-- Icon Container -->
    <div
      class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[8px] vdb-c-border vdb-c-p-6"
      :class="[
        file.status === 'failure'
          ? 'vdb-c-border-[#FFCCCC] vdb-c-bg-[#FBE5E5]'
          : 'vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7]',
      ]"
    >
      <HeadPhoneIcon
        :fill="file.status === 'failure' ? '#E02424' : '#1E1E1E'"
        class="vdb-c-size-[20px]"
      />
    </div>

    <!-- File Info -->
    <div
      class="vdb-c-min-w-0 vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-gap-2 vdb-c-overflow-hidden"
    >
      <span
        class="vdb-c-overflow-hidden vdb-c-text-ellipsis vdb-c-whitespace-nowrap vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-[#1E1E1E]"
        :title="file.name"
      >
        {{ file.name }}
      </span>
      <span
        v-if="file.status === 'failure'"
        class="vdb-c-text-[11px] vdb-c-font-normal vdb-c-leading-normal vdb-c-text-[#E02424]"
      >
        {{ errorMessage || 'Error in uploading audio. Try again.' }}
      </span>
      <span
        v-else-if="file.size"
        class="vdb-c-text-[11px] vdb-c-font-normal vdb-c-leading-normal vdb-c-text-[#464646]"
      >
        {{ file.size }}
      </span>
    </div>

    <!-- Status Icons -->
    <div
      v-if="file.status"
      class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center"
    >
      <SpinnerIcon v-if="file.status === 'pending'" class="vdb-c-size-[30px]" />
      <SuccessIcon v-else-if="file.status === 'success'" class="vdb-c-size-[30px]" />
      <WarningFilledIcon v-else-if="file.status === 'failure'" class="vdb-c-size-[30px]" />
    </div>

    <!-- Remove Button (only show when no status or on hover) -->
    <button
      v-if="!file.status"
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
import SpinnerIcon from '../../../chat/v2/icons/SpinnerIcon.vue';
import SuccessIcon from '../../../chat/v2/icons/SuccessIcon.vue';
import WarningFilledIcon from '../../../chat/v2/icons/WarningFilledIcon.vue';

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
  fullWidth: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
});

defineEmits(['remove']);
</script>
