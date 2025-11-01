<template>
  <div
    class="vdb-c-rounded-[34px] vdb-c-border vdb-c-border-gray-300 vdb-c-p-24"
  >
    <div class="vdb-c-space-y-24">
      <div>
        <h4
          class="vdb-c-mb-16 vdb-c-text-xl vdb-c-font-semibold vdb-c-text-dark-gray-900"
        >
          Troveo Agent Configuration
        </h4>

        <!-- Search for section -->
        <div class="vdb-c-space-y-12">
          <label
            class="vdb-c-text-lg vdb-c-font-medium vdb-c-text-dark-gray-900"
            >Search for</label
          >
          <div class="vdb-c-flex vdb-c-space-x-24">
            <label
              class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-space-x-8"
            >
              <input
                type="radio"
                v-model="config.searchFor"
                value="scenes"
                class="vdb-c-h-16 vdb-c-w-16 vdb-c-border-dark-gray-300 vdb-c-text-orange-500 focus:vdb-c-ring-8 focus:vdb-c-ring-orange-500 focus:vdb-c-ring-offset-8"
              />
              <span
                class="vdb-c-text-lg vdb-c-font-medium vdb-c-text-dark-gray-900"
                >Scenes</span
              >
            </label>
            <label
              class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-space-x-8"
            >
              <input
                type="radio"
                v-model="config.searchFor"
                value="videos"
                class="vdb-c-h-16 vdb-c-w-16 vdb-c-border-dark-gray-300 vdb-c-text-orange-500 focus:vdb-c-ring-8 focus:vdb-c-ring-orange-500 focus:vdb-c-ring-offset-8"
              />
              <span
                class="vdb-c-text-lg vdb-c-font-medium vdb-c-text-dark-gray-900"
                >Videos</span
              >
            </label>
          </div>
        </div>

        <!-- Thinking mode section -->
        <div class="vdb-c-mt-16 vdb-c-space-y-12">
          <label
            class="vdb-c-text-lg vdb-c-font-medium vdb-c-text-dark-gray-900"
            >Thinking mode</label
          >
          <div class="vdb-c-flex vdb-c-space-x-24">
            <label
              class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-space-x-8"
            >
              <input
                type="radio"
                v-model="config.thinkingMode"
                value="recall"
                class="vdb-c-h-16 vdb-c-w-16 vdb-c-border-dark-gray-300 vdb-c-text-orange-500 focus:vdb-c-ring-8 focus:vdb-c-ring-orange-500 focus:vdb-c-ring-offset-8"
              />
              <span
                class="vdb-c-text-lg vdb-c-font-medium vdb-c-text-dark-gray-900"
                >Recall</span
              >
            </label>
            <label
              class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-space-x-8"
            >
              <input
                type="radio"
                v-model="config.thinkingMode"
                value="precision"
                class="vdb-c-h-16 vdb-c-w-16 vdb-c-border-dark-gray-300 vdb-c-text-orange-500 focus:vdb-c-ring-8 focus:vdb-c-ring-orange-500 focus:vdb-c-ring-offset-8"
              />
              <span
                class="vdb-c-text-lg vdb-c-font-medium vdb-c-text-dark-gray-900"
                >Precision</span
              >
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  messageText: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["config-change"]);

const config = ref({
  searchFor: "",
  thinkingMode: "",
});

const isConfigComplete = computed(() => {
  return config.value.searchFor && config.value.thinkingMode;
});

// Watch for config changes and emit them
watch(
  config,
  (newConfig) => {
    emit("config-change", {
      searchFor: newConfig.searchFor,
      thinkingMode: newConfig.thinkingMode,
    });
  },
  { deep: true, immediate: true },
);
</script>

<style scoped>
/* Custom radio button styling to match shadcn */
input[type="radio"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: white;
  border: 4px solid #d1d5db;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
}

input[type="radio"]:checked {
  background-color: #f97316;
  border-color: #f97316;
}

input[type="radio"]:checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 50%;
}

input[type="radio"]:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
}
</style>
