<template>
  <button
    v-if="button.type === 'button'"
    @click="handleClick"
    :class="[
      'vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-lg vdb-c-transition-all vdb-c-duration-200',
      {
        'vdb-c-bg-white vdb-c-text-black hover:vdb-c-bg-roy': button.variant === 'normal',
        'vdb-c-bg-red-500 vdb-c-text-white hover:vdb-c-bg-red-600': button.variant === 'danger',
      },
    ]"
    :style="{ width: '32px', height: '32px' }"
  >
    <component :is="button.icon" />
  </button>
  <a
    v-else-if="button.type === 'link'"
    :href="button.href"
    :target="button.target || '_blank'"
    rel="noopener noreferrer"
    :class="[
      'vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-lg vdb-c-transition-all vdb-c-duration-200',
      {
        'vdb-c-bg-white vdb-c-text-black hover:vdb-c-bg-roy': button.variant === 'normal',
        'vdb-c-bg-red-500 vdb-c-text-white hover:vdb-c-bg-red-600': button.variant === 'danger',
      },
    ]"
    :style="{ width: '32px', height: '32px' }"
  >
    <component :is="button.icon" />
  </a>
</template>

<script setup>
const props = defineProps({
  button: {
    type: Object,
    required: true,
  },
});

const handleClick = () => {
  if (props.button.onClick) {
    props.button.onClick();
  }
};
</script>
