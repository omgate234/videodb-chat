<template>
  <label
    class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-6"
    @click="$emit('change', isSelected ? '' : value)"
  >
    <div
      :class="[
        'vdb-c-flex vdb-c-h-16 vdb-c-w-16 vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-transition-all',
        isSelected ? 'vdb-c-bg-orange' : 'vdb-c-border vdb-c-border-[#B9B9B9] vdb-c-bg-white',
      ]"
      style="box-shadow: none"
      :style="{ boxShadow: isFocused ? '0 0 0 2px rgba(236, 91, 22, 0.20)' : 'none' }"
      tabindex="0"
      @focus="isFocused = true"
      @blur="isFocused = false"
    >
      <div
        v-if="isSelected"
        class="vdb-c-rounded-full vdb-c-bg-white"
        style="width: 7px; height: 7px"
      />
    </div>
    <span
      class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-tracking-[0.065px] vdb-c-text-vdb-darkishgrey"
    >
      {{ label }}
    </span>
  </label>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: '',
  },
});

defineEmits(['change']);

const isSelected = computed(() => props.modelValue === props.value);
const isFocused = ref(false);
</script>
