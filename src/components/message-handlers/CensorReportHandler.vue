<template>
  <div
    class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-overflow-hidden vdb-c-rounded-16 vdb-c-border vdb-c-border-roy vdb-c-bg-white"
  >
    <div
      class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-justify-center vdb-c-bg-vdb-lightgrey"
      :class="isOpen ? 'vdb-c-border-b vdb-c-border-roy' : ''"
    >
      <button
        class="vdb-c-flex vdb-c-w-full vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-20 vdb-c-border-0 vdb-c-bg-transparent vdb-c-px-20 vdb-c-py-[15px] vdb-c-transition-colors hover:vdb-c-bg-[#EFEFEF]"
        @click="toggleAccordion"
      >
        <div class="vdb-c-min-w-0 vdb-c-flex vdb-c-grow vdb-c-items-center">
          <p
            class="vdb-c-text-14 vdb-c-leading-24 vdb-c-tracking-007 vdb-c-whitespace-pre vdb-c-font-semibold vdb-c-text-vdb-darkishgrey"
          >
            View censor report
          </p>
        </div>
        <div class="vdb-c-h-20 vdb-c-w-20 vdb-c-shrink-0" :class="{ 'vdb-c-rotate-180': isOpen }">
          <ChevronDown class="vdb-c-text-vdb-darkishgrey" />
        </div>
      </button>
    </div>
    <Transition name="accordion">
      <div
        v-if="isOpen"
        class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-bg-white vdb-c-px-20 vdb-c-pb-[15px] vdb-c-pt-20"
      >
        <MarkdownText :content="{ text: content.censor_table }" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ChevronDown from '../chat/v2/icons/ChevronDownIcon.vue';
import MarkdownText from './elements/MarkdownText.vue';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
});

const isOpen = ref(false);

const toggleAccordion = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style scoped>
.vdb-c-text-14 {
  font-size: 14px;
}

.vdb-c-leading-24 {
  line-height: 24px;
}

.vdb-c-tracking-007 {
  letter-spacing: 0.07px;
}

.vdb-c-rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>
