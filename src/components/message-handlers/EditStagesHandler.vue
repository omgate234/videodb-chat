<template>
  <div
    class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-rounded-12 vdb-c-border vdb-c-border-roy vdb-c-bg-vdb-lightgrey"
  >
    <div
      v-for="(stage, index) in content.stages"
      :key="index"
      class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-8"
      :class="getItemPadding(index)"
    >
      <div
        class="vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-text-vdb-darkishgrey"
      >
        <CheckIcon />
      </div>
      <div class="vdb-c-min-w-0 vdb-c-flex vdb-c-grow vdb-c-items-center">
        <p
          class="vdb-c-text-13 vdb-c-leading-24 vdb-c-tracking-065 vdb-c-font-medium vdb-c-text-vdb-darkishgrey"
        >
          {{ stage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import CheckIcon from '../chat/v2/icons/CheckIcon.vue';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
});

const getItemPadding = (index) => {
  const isFirst = index === 0;
  const isLast = index === props.content.stages.length - 1;

  if (isFirst) {
    return 'vdb-c-pt-8 vdb-c-pb-4 vdb-c-px-12';
  } else if (isLast) {
    return 'vdb-c-pt-4 vdb-c-pb-8 vdb-c-px-12';
  } else {
    return 'vdb-c-py-4 vdb-c-px-12';
  }
};
</script>

<style scoped>
.vdb-c-leading-24 {
  line-height: 24px;
}

.vdb-c-text-13 {
  font-size: 13px;
}

.vdb-c-tracking-065 {
  letter-spacing: 0.065px;
}
</style>
