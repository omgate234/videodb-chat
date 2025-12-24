<template>
  <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-12">
    <!-- Search Results Header -->
    <button
      type="button"
      class="vdb-c-flex vdb-c-w-fit vdb-c-items-center vdb-c-gap-8 vdb-c-bg-transparent vdb-c-text-left"
      @click="toggle && toggle()"
    >
      <span class="vdb-c-w-fit vdb-c-text-[16px] vdb-c-font-medium vdb-c-text-kilvish-800">
        {{ step.title }}
      </span>

      <ChevronDown
        class="vdb-c-ml-auto"
        :class="{ 'vdb-c-rotate-180 vdb-c-transform': isExpanded }"
        :stroke-width="2"
        :stroke-color="'#343E4F'"
      />
    </button>

    <!-- Search Results Grid -->
    <div
      v-if="isExpanded"
      class="vdb-c-max-h-[600px] vdb-c-overflow-y-auto vdb-c-rounded-lg vdb-c-bg-[#FAFAFA] vdb-c-p-16"
    >
      <div class="vdb-c-grid vdb-c-grid-cols-12 vdb-c-gap-20">
        <div
          v-for="(result, index) in step.search_results"
          :key="`result-${result.id}-${index}`"
          class="vdb-c-col-span-12 sm:vdb-c-col-span-6 md:vdb-c-col-span-4 lg:vdb-c-col-span-3"
        >
          <VideoCard
            :item="result"
            :index="index"
            :handle-add-message="handleAddMessage"
            :disable-options="true"
            @video-click="handleVideoClick"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="!step.search_results || step.search_results.length === 0"
        class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-py-40 vdb-c-text-center"
      >
        <SearchIcon class="vdb-c-mb-12 vdb-c-h-48 vdb-c-w-48 vdb-c-text-gray-400" />
        <p class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-kilvish-600">
          No search results found
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import ChevronDown from '../../icons/ChevronDown.vue';
import SearchIcon from '../../icons/SearchIcon.vue';
import VideoCard from '../v2/collection/VideoCard.vue';

const props = defineProps({
  step: { type: Object, required: true },
  index: { type: Number, required: true },
  status: { type: String, required: true },
  activeIndex: { type: Number, required: true },
  isExpanded: { type: Boolean, default: false },
  toggle: { type: Function, default: () => {} },
  handleAddMessage: { type: Function, default: null },
});

const emit = defineEmits(['video-click']);

const handleVideoClick = (result) => {
  emit('video-click', result);
};
</script>
