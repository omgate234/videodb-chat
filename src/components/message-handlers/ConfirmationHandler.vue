<template>
  <div
    class="vdb-c-flex vdb-c-w-full vdb-c-max-w-[560px] vdb-c-flex-col vdb-c-overflow-hidden vdb-c-rounded-16 vdb-c-border vdb-c-border-roy vdb-c-bg-white"
  >
    <div class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-start vdb-c-bg-white vdb-c-p-20">
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-shrink-0 vdb-c-flex-col vdb-c-items-start vdb-c-gap-10"
      >
        <p
          class="vdb-c-leading-24 vdb-c-text-16 vdb-c-w-full vdb-c-shrink-0 vdb-c-font-medium vdb-c-text-vdb-darkishgrey"
        >
          {{ content.confirmation.title }}
        </p>
        <div class="vdb-c-flex vdb-c-w-full vdb-c-shrink-0 vdb-c-flex-col vdb-c-items-start">
          <p
            class="vdb-c-leading-20 vdb-c-text-13 vdb-c-shrink-0 vdb-c-whitespace-pre-wrap vdb-c-font-normal vdb-c-text-ota"
            v-html="formattedDescription"
          ></p>
        </div>
      </div>
    </div>
    <div
      class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center"
    >
      <div class="vdb-c-h-px vdb-c-w-full vdb-c-bg-roy"></div>
    </div>
    <div
      class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-end vdb-c-gap-8 vdb-c-bg-vdb-lightgrey vdb-c-p-10"
    >
      <div class="vdb-c-relative vdb-c-flex vdb-c-shrink-0 vdb-c-items-center vdb-c-gap-8">
        <SecondaryButton @click="handleCancel">Cancel</SecondaryButton>
        <PrimaryButton @click="handleConfirm">Yes, proceed</PrimaryButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import PrimaryButton from '../chat/v2/elements/PrimaryButton.vue';
import SecondaryButton from '../chat/v2/elements/SecondaryButton.vue';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
});

const context = inject('videodb-chat-context');
const handleAddMessage = context?.handleAddMessage;

const formattedDescription = computed(() => {
  if (!props.content?.confirmation?.description) return '';

  return props.content.confirmation.description.replace(
    /\*\*(.*?)\*\*/g,
    '<span class="vdb-c-font-bold">$1</span>'
  );
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
  const confirmMessage = props.content?.confirmation?.confirm_message || 'Yes, proceed';
  if (handleAddMessage) {
    handleAddMessage({
      text: confirmMessage,
    });
  }
};
</script>

<style scoped>
.vdb-c-leading-24 {
  line-height: 24px;
}

.vdb-c-leading-20 {
  line-height: 20px;
}

.vdb-c-text-16 {
  font-size: 16px;
}

.vdb-c-text-13 {
  font-size: 13px;
}
</style>
