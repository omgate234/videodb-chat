<template>
  <div class="vdb-c-relative">
    <div
      v-if="isLoading"
      class="vdb-c-pointer-events-none vdb-c-absolute vdb-c-inset-0 vdb-c-z-10 vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-lg vdb-c-bg-white/60 vdb-c-backdrop-blur-[2px]"
    >
      <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
        <div class="vdb-c-h-[24px] vdb-c-w-[24px]">
          <SpinnerIcon />
        </div>
        <span class="vdb-c-text-sm vdb-c-font-medium vdb-c-text-[#1E1E1E]">Loading...</span>
      </div>
    </div>

    <div class="vdb-c-grid vdb-c-grid-cols-12 vdb-c-gap-20">
      <div
        v-for="(item, index) in displayedAssets"
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

    <div
      v-if="showPagination && totalPages > 1"
      class="vdb-c-mt-20 vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-8"
    >
      <NavigationButton
        label="Previous"
        :disabled="activePage === 1 || isLoading"
        :is-previous="true"
        @click="goToPage(activePage - 1)"
      />

      <template v-for="(pageNumber, index) in displayedPageNumbers" :key="pageNumber">
        <PaginationButton
          :target-page="pageNumber"
          :state="activePage === pageNumber ? 'active' : 'default'"
          :label="pageNumber"
          :disabled="isLoading"
          @click="goToPage"
        />
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
        :disabled="activePage === totalPages || isLoading"
        @click="goToPage(activePage + 1)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import AudioCard from './AudioCard.vue';
import ImageCard from './ImageCard.vue';
import NavigationButton from './NavigationButton.vue';
import PaginationButton from './PaginationButton.vue';
import VideoCard from './VideoCard.vue';
import SpinnerIcon from '../icons/SpinnerIcon.vue';

const props = defineProps({
  assetResults: {
    type: Array,
    default: () => [],
  },
  totalCount: {
    type: Number,
    default: 0,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  itemsPerPage: {
    type: Number,
    default: 12,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
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

const emit = defineEmits([
  'video-click',
  'delete-video',
  'delete-audio',
  'delete-voice',
  'delete-image',
  'start-editing',
  'save-editing',
  'cancel-editing',
  'update:currentPage',
]);

const isServerSidePagination = computed(() => props.totalCount > 0);

const localPage = ref(1);

const activePage = computed(() => {
  return isServerSidePagination.value ? props.currentPage : localPage.value;
});

const totalPages = computed(() => {
  const count = isServerSidePagination.value ? props.totalCount : props.assetResults.length;
  return Math.ceil(count / props.itemsPerPage);
});

const displayedAssets = computed(() => {
  if (!props.showPagination) {
    return props.assetResults;
  }

  if (isServerSidePagination.value) {
    return props.assetResults;
  }

  const start = (localPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return props.assetResults.slice(start, end);
});

watch(
  () => props.assetResults.length,
  () => {
    if (!isServerSidePagination.value) {
      localPage.value = 1;
    }
  }
);

const displayedPageNumbers = computed(() => {
  const total = totalPages.value;
  const current = activePage.value;

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total]);

  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  } else if (current >= total - 2) {
    pages.add(total - 3);
    pages.add(total - 2);
    pages.add(total - 1);
  } else {
    pages.add(current - 1);
    pages.add(current);
    pages.add(current + 1);
  }

  return Array.from(pages).sort((a, b) => a - b);
});

const goToPage = (page) => {
  if (props.isLoading) return;
  if (page >= 1 && page <= totalPages.value) {
    if (isServerSidePagination.value) {
      emit('update:currentPage', page);
    } else {
      localPage.value = page;
    }
  }
};
</script>
