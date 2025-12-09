<template>
  <div class="default-page">
    <h1 class="vdb-c-text-black">Default Page</h1>
  </div>
</template>

<script setup>
import { inject } from 'vue';

const props = defineProps({
  context: {
    type: Object,
    default: undefined,
  },
});

const context = props.context || inject('videodb-chat-context');
</script>
