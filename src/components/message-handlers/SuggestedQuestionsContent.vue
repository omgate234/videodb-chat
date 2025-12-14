<template>
  <div
    v-if="shouldShow"
    class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-8 vdb-c-bg-white vdb-c-py-14 vdb-c-text-left"
  >
    <transition name="fade" mode="out-in">
      <div
        v-if="content.status === 'success' && content.questions && content.questions.length > 0"
        class="vdb-c-w-full"
      >
        <div class="vdb-c-flex vdb-c-flex-col">
          <!-- Title -->
          <h3
            class="vdb-c-mb-16 vdb-c-text-base vdb-c-font-medium vdb-c-leading-6 vdb-c-text-[#1E1E1E]"
          >
            Suggested questions
          </h3>

          <!-- Questions List -->
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-rounded">
            <button
              v-for="(question, index) in content.questions"
              :key="index"
              @click="handleQuestionClick(question)"
              class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-10 vdb-c-border-t vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-24 vdb-c-py-16 vdb-c-text-left vdb-c-text-[#1E1E1E] vdb-c-transition-colors last:vdb-c-border-b-0 hover:vdb-c-text-vdb-darkorange active:vdb-c-bg-gray-100"
            >
              <SuggestionIcon />

              <!-- Question Text -->
              <span class="vdb-c-flex-1 vdb-c-text-sm vdb-c-font-normal vdb-c-leading-5">
                {{ question }}
              </span>
            </button>
          </div>
        </div>
      </div>
      <div v-else-if="content.status === 'progress'">
        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-16">
          <!-- Loading skeleton for title -->
          <div
            class="vdb-c-w-160 vdb-c-h-24 vdb-c-animate-pulse vdb-c-rounded vdb-c-bg-gray-200"
          ></div>
          <!-- Loading skeleton for questions -->
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-rounded vdb-c-border vdb-c-border-[#E0E0E0]">
            <div
              v-for="i in 3"
              :key="i"
              class="vdb-c-flex vdb-c-items-center vdb-c-gap-10 vdb-c-border-b vdb-c-border-[#E0E0E0] vdb-c-px-24 vdb-c-py-16 last:vdb-c-border-b-0"
            >
              <div
                class="vdb-c-h-16 vdb-c-w-16 vdb-c-animate-pulse vdb-c-rounded vdb-c-bg-gray-200"
              ></div>
              <div
                class="vdb-c-h-20 vdb-c-flex-1 vdb-c-animate-pulse vdb-c-rounded vdb-c-bg-gray-200"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="content.status === 'not_generated'" class="vdb-c-flex vdb-c-flex-col"></div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import SuggestionIcon from '../chat/v2/icons/SuggestionIcon.vue';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  isLastConv: {
    type: Boolean,
    default: false,
  },
  addMessage: {
    type: Function,
    default: null,
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

const shouldShow = computed(() => {
  const isLastMessageInConv = props.currentMessageIndex === props.messageList.length - 1;
  return props.isLastConv && isLastMessageInConv;
});

const handleQuestionClick = (question) => {
  if (!question) return;

  const content = [{ type: 'text', text: question }];
  props.addMessage({ content });
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
