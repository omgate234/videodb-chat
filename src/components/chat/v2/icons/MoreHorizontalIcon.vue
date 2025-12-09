<template>
  <svg
    width="17"
    height="17"
    viewBox="0 0 17 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.54167 8H3.54861M8 8H8.00694M12.4583 8H12.4653"
      :stroke="strokeColor || '#1E1E1E'"
      stroke-width="2"
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
