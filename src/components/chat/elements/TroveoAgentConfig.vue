<template>
  <div
    class="vdb-c-mt-4 vdb-c-rounded-lg vdb-c-border vdb-c-border-gray-200 vdb-c-bg-gray-50 vdb-c-p-4"
  >
    <div class="vdb-c-mb-4">
      <h4
        class="vdb-c-mb-3 vdb-c-text-sm vdb-c-font-medium vdb-c-text-gray-700"
      >
        Troveo Agent Configuration
      </h4>

      <!-- Search for section -->
      <div class="vdb-c-mb-4">
        <label
          class="vdb-c-mb-2 vdb-c-block vdb-c-text-sm vdb-c-font-medium vdb-c-text-gray-600"
          >Search for:</label
        >
        <div class="vdb-c-flex vdb-c-gap-4">
          <label class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center">
            <input
              type="radio"
              v-model="config.searchFor"
              value="videos"
              class="vdb-c-mr-2"
            />
            <span class="vdb-c-text-sm">Videos</span>
          </label>
          <label class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center">
            <input
              type="radio"
              v-model="config.searchFor"
              value="scenes"
              class="vdb-c-mr-2"
            />
            <span class="vdb-c-text-sm">Scenes</span>
          </label>
        </div>
      </div>

      <!-- Thinking mode section -->
      <div class="vdb-c-mb-4">
        <label
          class="vdb-c-mb-2 vdb-c-block vdb-c-text-sm vdb-c-font-medium vdb-c-text-gray-600"
          >Thinking mode:</label
        >
        <div class="vdb-c-flex vdb-c-gap-4">
          <label class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center">
            <input
              type="radio"
              v-model="config.thinkingMode"
              value="fast"
              class="vdb-c-mr-2"
            />
            <span class="vdb-c-text-sm">Fast</span>
          </label>
          <label class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center">
            <input
              type="radio"
              v-model="config.thinkingMode"
              value="thinking"
              class="vdb-c-mr-2"
            />
            <span class="vdb-c-text-sm">Thinking</span>
          </label>
        </div>
      </div>

      <!-- Send button -->
      <button
        @click="handleSend"
        :disabled="!isConfigComplete"
        class="vdb-c-w-full vdb-c-rounded vdb-c-bg-orange vdb-c-px-4 vdb-c-py-2 vdb-c-text-sm vdb-c-font-medium vdb-c-text-white vdb-c-transition-colors"
        :class="{
          'vdb-c-cursor-not-allowed vdb-c-opacity-50': !isConfigComplete,
          'hover:vdb-c-bg-orange-600': isConfigComplete,
        }"
      >
        Send Message
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  messageText: {
    type: String,
    required: true,
  },
  onSend: {
    type: Function,
    required: true,
  },
});

const config = ref({
  searchFor: "videos",
  thinkingMode: "fast",
});

const isConfigComplete = computed(() => {
  return config.value.searchFor && config.value.thinkingMode;
});

const handleSend = () => {
  if (isConfigComplete.value) {
    props.onSend({
      text: props.messageText,
      additional_info: {
        searchFor: config.value.searchFor,
        thinkingMode: config.value.thinkingMode,
      },
    });
  }
};
</script>
