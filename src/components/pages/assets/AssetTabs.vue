<template>
  <nav class="vdb-c-flex vdb-c-gap-0">
    <button
      v-for="tab in tabs"
      :key="tab"
      @click="$emit('update:modelValue', tab)"
      class="vdb-c-relative vdb-c-border-b-2 vdb-c-px-[17px] vdb-c-py-10 vdb-c-text-body vdb-c-font-medium vdb-c-transition-colors"
      :class="
        modelValue === tab
          ? 'vdb-c-border-vdb-orange vdb-c-text-vdb-orange'
          : 'vdb-c-border-roy vdb-c-text-kilvish-600 hover:vdb-c-text-kilvish-900'
      "
    >
      {{ tab }}
    </button>
  </nav>
</template>

<script setup>
defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
});

defineEmits(['update:modelValue']);
</script>
