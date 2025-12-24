<template>
  <svg
    :class="className"
    :style="{ color }"
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.5 0.877075C3.84222 0.877075 0.877075 3.84222 0.877075 7.5C0.877075 11.1578 3.84222 14.1227 7.5 14.1227C11.1578 14.1227 14.1227 11.1578 14.1227 7.5C14.1227 3.84222 11.1578 0.877075 7.5 0.877075ZM5.5 5C5.22386 5 5 5.22386 5 5.5V9.5C5 9.77614 5.22386 10 5.5 10H9.5C9.77614 10 10 9.77614 10 9.5V5.5C10 5.22386 9.77614 5 9.5 5H5.5Z"
      :fill="fill"
      fill-rule="evenodd"
      clip-rule="evenodd"
    ></path>
  </svg>
</template>

<script>
export default {
  name: 'StopIcon',
  props: {
    className: { type: String, default: '' },
    color: { type: String, default: 'currentColor' },
    fill: { type: String, default: 'currentColor' },
  },
};
</script>

<style scoped>
svg path {
  color: currentColor;
}
</style>
