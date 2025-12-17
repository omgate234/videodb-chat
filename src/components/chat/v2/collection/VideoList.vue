<template>
  <div>
    <!-- Videos Grid -->
    <div class="vdb-c-grid vdb-c-grid-cols-12 vdb-c-gap-20">
      <div
        v-for="(item, index) in paginatedAssets"
        :key="`post-${item.id}`"
        class="vdb-c-col-span-12 sm:vdb-c-col-span-6"
        :class="[
          columns >= 4
            ? 'md:vdb-c-col-span-4 lg:vdb-c-col-span-3'
            : columns >= 3
              ? 'md:vdb-c-col-span-4 lg:vdb-c-col-span-4'
              : columns >= 2
                ? 'md:vdb-c-col-span-6 lg:vdb-c-col-span-6'
                : '',
        ]"
      >
        <video-card
          v-if="item.type !== 'audio' && item.type !== 'image' && item.type !== 'voices'"
          :item="item"
          :index="index"
          :handle-add-message="handleAddMessage"
          :editing-asset-id="editingAssetId"
          @video-click="$emit('video-click', $event)"
          @delete-video="$emit('delete-video', $event)"
          @start-editing="$emit('start-editing', $event)"
          @save-editing="$emit('save-editing', $event)"
          @cancel-editing="$emit('cancel-editing')"
        />

        <AudioCard
          v-else-if="item.type === 'audio' || item.type === 'voices'"
          :item="item"
          :index="index"
          :get-audio-url="getAudioUrl"
          :editing-asset-id="editingAssetId"
          @delete-audio="$emit('delete-audio', $event)"
          @delete-voice="$emit('delete-voice', $event)"
          @start-editing="$emit('start-editing', $event)"
          @save-editing="$emit('save-editing', $event)"
          @cancel-editing="$emit('cancel-editing')"
        />

        <ImageCard
          v-else-if="item.type === 'image'"
          :item="item"
          :index="index"
          :get-image-url="getImageUrl"
          :editing-asset-id="editingAssetId"
          @delete-image="$emit('delete-image', $event)"
          @start-editing="$emit('start-editing', $event)"
          @save-editing="$emit('save-editing', $event)"
          @cancel-editing="$emit('cancel-editing')"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="showPagination"
      class="vdb-c-mt-20 vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-8"
    >
      <NavigationButton
        label="Previous"
        :disabled="currentPage === 1"
        :is-previous="true"
        @click="goToPage(currentPage - 1)"
      />

      <template v-for="(pageNumber, index) in displayedPageNumbers" :key="pageNumber">
        <PaginationButton
          :target-page="pageNumber"
          :state="currentPage === pageNumber ? 'active' : 'default'"
          :label="pageNumber"
          @click="goToPage"
        />
        <!-- Show ellipsis if there's a gap between consecutive numbers -->
        <div
          class="vdb-c-flex vdb-c-h-40 vdb-c-w-40 vdb-c-items-end vdb-c-justify-center vdb-c-px-2 vdb-c-text-[#969696]"
          v-if="
            index < displayedPageNumbers.length - 1 &&
            displayedPageNumbers[index + 1] - pageNumber > 1
          "
        >
          <span> ... </span>
        </div>
      </template>

      <NavigationButton
        label="Next"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import AudioCard from './AudioCard.vue';
import ImageCard from './ImageCard.vue';
import NavigationButton from './NavigationButton.vue';
import PaginationButton from './PaginationButton.vue';
import VideoCard from './VideoCard.vue';

const props = defineProps({
  assetResults: {
    type: Array,
    default: () => [],
  },
  itemsPerPage: {
    type: Number,
    default: 8,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  columns: {
    type: Number,
    default: 4,
    validator: (value) => value >= 1 && value <= 4,
  },
  getImageUrl: {
    type: Function,
  },
  getAudioUrl: {
    type: Function,
  },
  handleAddMessage: {
    type: Function,
  },
  editingAssetId: {
    type: String,
    default: null,
  },
});

const currentPage = ref(1);
const totalPages = computed(() => Math.ceil(props.assetResults.length / props.itemsPerPage));

const paginatedAssets = computed(() => {
  if (!props.showPagination) {
    return props.assetResults;
  }
  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return props.assetResults.slice(start, end);
});

const displayedPageNumbers = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;

  // 1. If we have very few pages (5 or less), just show them all.
  // We use 5 instead of 4 here because '1 ... 4 5' looks weird compared to just '1 2 3 4 5'
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // 2. We want to show: First Page, Last Page, and a "Window" around current page
  // We use a Set to automatically handle duplicate numbers (e.g., if current is 1)
  const pages = new Set([1, total]);

  // 3. Add neighbors (Current - 1, Current, Current + 1)
  // But we clamp the window to ensure we always show at least 3 numbers together
  if (current <= 3) {
    // If near the start (e.g., Page 1, 2, or 3), show 1, 2, 3, 4 ... Last
    pages.add(2);
    pages.add(3);
    pages.add(4);
  } else if (current >= total - 2) {
    // If near the end (e.g., Page 8, 9, or 10), show 1 ... 7, 8, 9, 10
    pages.add(total - 3);
    pages.add(total - 2);
    pages.add(total - 1);
  } else {
    // If in the middle (e.g., Page 5), show 1 ... 4, 5, 6 ... 10
    pages.add(current - 1);
    pages.add(current);
    pages.add(current + 1);
  }

  return Array.from(pages).sort((a, b) => a - b);
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

defineEmits([
  'video-click',
  'delete-video',
  'delete-audio',
  'delete-voice',
  'delete-image',
  'start-editing',
  'save-editing',
  'cancel-editing',
]);
</script>
