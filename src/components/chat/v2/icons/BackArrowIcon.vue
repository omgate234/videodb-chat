<template>
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11.475 14.85L5.625 9L11.475 3.15L10.125 1.8L2.925 9L10.125 16.2L11.475 14.85Z"
      :fill="fill"
    />
  </svg>
</template>

<script setup>
defineProps({
  fill: {
    type: String,
    default: '#1E1E1E',
  },
});
</script>
