<template>
  <div
    class="vdb-c-flex vdb-c-w-full vdb-c-max-w-[560px] vdb-c-flex-col vdb-c-overflow-hidden vdb-c-rounded-16 vdb-c-border vdb-c-border-roy vdb-c-bg-white"
  >
    <!-- Content -->
    <div class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-start vdb-c-bg-white vdb-c-p-20">
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-shrink-0 vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-20"
      >
        <!-- Title -->
        <div class="vdb-c-flex vdb-c-w-full vdb-c-shrink-0 vdb-c-items-center vdb-c-gap-16">
          <p
            class="vdb-c-min-w-px vdb-c-min-h-px vdb-c-flex-1 vdb-c-shrink-0 vdb-c-text-[16px] vdb-c-font-semibold vdb-c-leading-[24px] vdb-c-text-[#1E1E1E]"
          >
            Voice Cloning Authorization
          </p>
        </div>

        <!-- Alert Box -->
        <div
          class="vdb-c-flex vdb-c-w-full vdb-c-items-start vdb-c-gap-8 vdb-c-rounded-[12px] vdb-c-border vdb-c-border-[#F8C450] vdb-c-bg-[#FEFCE8] vdb-c-p-12"
        >
          <!-- Warning Icon -->
          <div class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-start">
            <div class="vdb-c-size-20 vdb-c-overflow-hidden">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.85465 17.0826C2.71340 17.0826 2.58653 17.0481 2.47403 16.979C2.36153 16.9101 2.27409 16.819 2.21173 16.7059C2.14674 16.5937 2.10431 16.4722 2.09777 16.3413C2.09124 16.2105 2.12653 16.0809 2.21027 15.9526L9.34427 3.62927C9.42148 3.50094 9.51798 3.40608 9.63381 3.34469C9.74981 3.28331 9.87186 3.25261 10.0001 3.25261C10.1283 3.25261 10.2503 3.28331 10.3663 3.44469C10.4821 3.50608 10.5786 3.50094 10.6558 3.62927L17.7898 15.9526C17.8736 16.0809 17.9089 16.2105 17.9024 16.3413C17.8958 16.4722 17.8534 16.5937 17.7884 16.7059C17.7261 16.819 17.6386 16.9101 17.5261 16.979C17.4136 17.0481 17.2867 17.0826 17.1455 17.0826H2.85465ZM10.0001 14.8391C10.1907 14.8391 10.3506 14.7745 10.4797 14.6455C10.6087 14.5165 10.6732 14.3566 10.6732 14.166C10.6732 13.9753 10.6087 13.8154 10.4797 13.6863C10.3506 13.5573 10.1907 13.4928 10.0001 13.4928C9.8094 13.4928 9.64954 13.5573 9.52048 13.6863C9.39148 13.8154 9.32698 13.9753 9.32698 14.166C9.32698 14.3566 9.39148 14.5165 9.52048 14.6455C9.64954 14.7745 9.8094 14.8391 10.0001 14.8391ZM10.0002 12.6594C10.1774 12.6594 10.3259 12.5996 10.4454 12.4798C10.5652 12.3601 10.625 12.2115 10.625 12.0344V9.1178C10.625 8.94075 10.5651 8.79232 10.4453 8.67261C10.3254 8.55277 10.1769 8.49286 9.99987 8.49286C9.82267 8.49286 9.67423 8.55277 9.55452 8.67261C9.43465 8.79232 9.37471 8.94075 9.37471 9.1178V12.0344C9.37471 12.2115 9.43467 12.3601 9.55452 12.4798C9.67417 12.5996 9.82265 12.6594 10.0002 12.6594Z"
                  fill="#8E4B10"
                />
              </svg>
            </div>
          </div>

          <!-- Content -->
          <div
            class="vdb-c-min-w-0 vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-gap-6 vdb-c-pb-0 vdb-c-pl-0 vdb-c-pr-0 vdb-c-pt-[1px]"
          >
            <!-- Alert Title -->
            <div
              class="vdb-c-flex vdb-c-w-full vdb-c-items-start vdb-c-py-0 vdb-c-pl-0 vdb-c-pr-[35px]"
            >
              <p
                class="vdb-c-min-w-0 vdb-c-flex-1 vdb-c-text-[16px] vdb-c-font-semibold vdb-c-leading-normal vdb-c-text-[#8E4B10]"
              >
                Before I clone this voice, I need to confirm:
              </p>
            </div>

            <!-- Alert Description -->
            <div
              class="vdb-c-w-full vdb-c-text-[14px] vdb-c-font-normal vdb-c-leading-[1.6] vdb-c-text-[#92400E]"
            >
              <p class="vdb-c-mb-0">Do you have authorization to clone and use this voice?</p>
              <p class="vdb-c-mb-0">&nbsp;</p>
              <p class="vdb-c-mb-0">
                <span class="vdb-c-font-bold"
                  >This includes having rights, permissions, or consent from the voice owner for
                  synthetic voice generation.</span
                >
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Footer -->
    <div
      class="vdb-c-flex vdb-c-w-full vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-end vdb-c-gap-10 vdb-c-border-t vdb-c-border-roy vdb-c-bg-[#F7F7F7] vdb-c-px-20 vdb-c-py-12"
    >
      <!-- Cancel Button -->
      <button
        @click="handleCancel"
        :disabled="!isInteractive"
        class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-gap-8 vdb-c-rounded-8 vdb-c-border vdb-c-border-[#D9D9D9] vdb-c-bg-white vdb-c-px-16 vdb-c-py-12 vdb-c-transition-colors hover:vdb-c-bg-[#F7F7F7] disabled:vdb-c-cursor-not-allowed disabled:vdb-c-opacity-50"
      >
        <span
          class="vdb-c-whitespace-nowrap vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[16px] vdb-c-text-[#1E1E1E]"
        >
          Cancel
        </span>
      </button>

      <!-- Confirm Button -->
      <button
        @click="handleConfirm"
        :disabled="!isInteractive"
        class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-gap-10 vdb-c-rounded-8 vdb-c-bg-[#EC5B16] vdb-c-px-16 vdb-c-py-12 vdb-c-transition-colors hover:vdb-c-bg-[#D14D0F] disabled:vdb-c-cursor-not-allowed disabled:vdb-c-opacity-50"
      >
        <span
          class="vdb-c-whitespace-nowrap vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[16px] vdb-c-text-white"
        >
          Yes, I'm authorized
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  isLastConv: {
    type: Boolean,
    default: false,
  },
  currentMessageIndex: {
    type: Number,
    required: true,
  },
  messageList: {
    type: Array,
    required: true,
  },
});

const context = inject('videodb-chat-context');
const handleAddMessage = context?.handleAddMessage;

const isInteractive = computed(() => {
  const isLastMessageInConv = props.currentMessageIndex === props.messageList.length - 1;
  return props.isLastConv && isLastMessageInConv;
});

const handleCancel = () => {
  const cancelMessage = props.content?.confirmation?.cancel_message || 'Cancel';
  if (handleAddMessage) {
    handleAddMessage({
      text: cancelMessage,
    });
  }
};

const handleConfirm = () => {
  const confirmMessage = props.content?.confirmation?.confirm_message || "Yes, I'm authorized";
  if (handleAddMessage) {
    handleAddMessage({
      text: confirmMessage,
    });
  }
};
</script>

<style scoped>
p {
  margin: 0;
}
</style>
