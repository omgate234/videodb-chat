<template>
  <component
    :is="clickable ? 'button' : 'div'"
    :class="[
      'vdb-c-flex vdb-c-items-center vdb-c-overflow-hidden vdb-c-rounded-[16px] vdb-c-border vdb-c-p-[20px] vdb-c-transition-colors vdb-c-duration-200',
      clickable
        ? 'vdb-c-gap-[20px] vdb-c-cursor-pointer vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-text-left hover:vdb-c-border-[#EC5B16] hover:vdb-c-bg-[#FFE9D3]'
        : 'vdb-c-gap-[16px] vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7]',
    ]"
    @click="clickable ? $emit('click') : undefined"
    @mouseenter="clickable && (isHovered = true)"
    @mouseleave="clickable && (isHovered = false)"
  >
    <!-- Icon circle: 80x80px -->
    <div
      class="vdb-c-relative vdb-c-h-[80px] vdb-c-w-[80px] vdb-c-flex-shrink-0 vdb-c-overflow-hidden vdb-c-rounded-full vdb-c-bg-white"
      :style="
        clickable && isHovered
          ? 'box-shadow: 0px 0px 0px 1px inset #c14103'
          : 'box-shadow: 0px 0px 0px 1px inset rgba(0, 0, 0, 0.1)'
      "
    >
      <div
        class="vdb-c-absolute vdb-c-left-1/2 vdb-c-top-1/2 vdb-c-flex vdb-c-h-[40px] vdb-c-w-[40px] vdb-c-translate-x-[-50%] vdb-c-translate-y-[-50%] vdb-c-items-center vdb-c-justify-center vdb-c-overflow-hidden"
      >
        <component
          :is="icon"
          :class="[
            'vdb-c-h-[40px] vdb-c-w-[40px]',
            clickable && isHovered ? 'vdb-c-text-[#EC5B16]' : 'vdb-c-text-[#1E1E1E]',
          ]"
        />
      </div>
    </div>
    <!-- Content: gap-10px between text and arrow when clickable (Figma 7288:76177) -->
    <div
      :class="[
        'vdb-c-flex vdb-c-min-w-0 vdb-c-flex-1 vdb-c-items-center',
        clickable ? 'vdb-c-gap-[10px]' : '',
      ]"
    >
      <div
        class="vdb-c-flex vdb-c-min-w-0 vdb-c-flex-1 vdb-c-flex-col vdb-c-gap-[4px] vdb-c-items-start vdb-c-overflow-hidden"
      >
        <!-- Title: 14px when clickable (hover state), 15px/28px when not (default state) -->
        <p
          :class="[
            'vdb-c-w-full vdb-c-overflow-hidden vdb-c-text-ellipsis vdb-c-whitespace-nowrap vdb-c-font-medium vdb-c-text-[#1E1E1E]',
            clickable
              ? 'vdb-c-text-[14px] vdb-c-leading-normal vdb-c-tracking-[0.08px]'
              : 'vdb-c-text-[15px] vdb-c-leading-[28px]',
          ]"
        >
          {{ name }}
        </p>
        <p
          class="vdb-c-line-clamp-3 vdb-c-w-full vdb-c-overflow-hidden vdb-c-text-ellipsis vdb-c-text-[12px] vdb-c-font-normal vdb-c-leading-[16px] vdb-c-text-[#464646]"
        >
          {{ description }}
        </p>
      </div>
      <ArrowRightAltIcon
        v-if="clickable"
        :fill="isHovered ? '#EC5B16' : '#1E1E1E'"
        class="vdb-c-h-[24px] vdb-c-w-[24px] vdb-c-flex-shrink-0"
      />
    </div>
  </component>
</template>

<script setup>
import { ref } from 'vue';
import ArrowRightAltIcon from '../../chat/v2/icons/ArrowRightAltIcon.vue';

defineProps({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: Object,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['click']);

const isHovered = ref(false);
</script>
