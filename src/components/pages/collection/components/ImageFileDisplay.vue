<template>
  <div
    class="vdb-c-group vdb-c-relative vdb-c-flex vdb-c-h-[44px] vdb-c-w-[44px] vdb-c-shrink-0 vdb-c-overflow-hidden vdb-c-rounded-10 vdb-c-bg-white hover:vdb-c-outline hover:vdb-c-outline-1 hover:vdb-c-outline-roy"
  >
    <!-- Loading Spinner -->
    <div
      v-if="isLoading"
      class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-items-center vdb-c-justify-center vdb-c-bg-[#F7F7F7]"
    >
      <SpinnerIcon class="vdb-c-h-20 vdb-c-w-20" />
    </div>
    <!-- Image -->
    <img
      v-else-if="imageUrl"
      :src="imageUrl"
      class="vdb-c-h-full vdb-c-w-full vdb-c-object-cover"
      alt=""
    />
    <!-- Remove Button -->
    <button
      @click="$emit('remove')"
      class="vdb-c-absolute vdb-c-right-2 vdb-c-top-2 vdb-c-flex vdb-c-h-16 vdb-c-w-16 vdb-c-items-center vdb-c-justify-center vdb-c-opacity-0 vdb-c-transition-opacity group-hover:vdb-c-opacity-100"
    >
      <CrossFilled :fill="'#1E1E1E'" class="vdb-c-relative vdb-c-h-16 vdb-c-w-16" />
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import CrossFilled from '../../../chat/v2/icons/CrossFilled.vue';
import SpinnerIcon from '../../../chat/v2/icons/SpinnerIcon.vue';

const props = defineProps({
  file: {
    type: Object,
    required: true,
    validator: (file) => file.type === 'image',
  },
  context: {
    type: Object,
    default: undefined,
  },
});

defineEmits(['remove']);

const context = props.context || inject('videodb-chat-context');
const isLoading = ref(false);
const imageUrl = ref(props.file.url);

onMounted(async () => {
  // If URL already exists (from device upload), no need to fetch
  if (imageUrl.value) {
    return;
  }

  // If from collection, fetch the URL
  if (props.file.collectionId && props.file.assetId) {
    isLoading.value = true;
    try {
      const { generateImageUrl } = context || {};
      if (generateImageUrl) {
        const result = await generateImageUrl(props.file.collectionId, props.file.assetId);
        if (result?.url) {
          imageUrl.value = result.url;
        }
      }
    } catch (error) {
      console.warn('Failed to generate image URL:', error);
    } finally {
      isLoading.value = false;
    }
  }
});
</script>
