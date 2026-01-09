<template>
  <label
    class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-6"
    @click="$emit('change', !checked)"
  >
    <div
      :class="[
        'vdb-c-flex vdb-c-h-16 vdb-c-w-16 vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-4 vdb-c-transition-all',
        checked ? 'vdb-c-bg-orange' : 'vdb-c-border vdb-c-border-[#E5E7EB] vdb-c-bg-white',
      ]"
      :style="{ boxShadow: isFocused ? '0 0 0 2px rgba(236, 91, 22, 0.20)' : 'none' }"
      tabindex="0"
      @focus="isFocused = true"
      @blur="isFocused = false"
    >
      <svg
        v-if="checked"
        width="10"
        height="8"
        viewBox="0 0 10 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 4L3.5 6.5L9 1"
          stroke="white"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <span
      class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-tracking-[0.065px] vdb-c-text-vdb-darkishgrey"
    >
      {{ label }}
    </span>
  </label>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  label: {
    type: String,
    required: true,
  },
  checked: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['change']);

const isFocused = ref(false);
</script>
