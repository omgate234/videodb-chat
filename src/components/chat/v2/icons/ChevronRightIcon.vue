<template>
  <svg
    width="17"
    height="17"
    viewBox="0 0 17 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.02083 12.3958L10.4167 8L6.02083 3.60413"
      :stroke="strokeColor || '#1E1E1E'"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup>
defineProps({
  strokeColor: {
    type: String,
    default: '#1E1E1E',
  },
});
</script>
