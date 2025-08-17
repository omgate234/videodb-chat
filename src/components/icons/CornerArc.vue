<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    :class="className"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :style="{ position: 'absolute', zIndex: 0 }"
  >
    <path
      d="M18.4776 7.65367C19.4827 5.22716 20 2.62644 20 0V20H0C2.62644 20 5.22716 19.4827 7.65367 18.4776C10.0802 17.4725 12.285 15.9993 14.1421 14.1421C15.9993 12.285 17.4725 10.0802 18.4776 7.65367Z"
      fill="#EC5B16"
    />
  </svg>
</template>

<script>
export default {
  name: "CornerArc",
  props: {
    className: {
      type: String,
      default: "",
    },
    size: {
      type: Number,
      default: 20,
    },
  },
};
</script>
