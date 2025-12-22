<template>
  <div
    class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-8 vdb-c-py-14 vdb-c-text-left"
  >
    <LoadingMessage
      :status="content.status"
      :message="content.status_message"
      :is-last-conv="isLastConv"
    />
    <transition name="fade" mode="out-in">
      <div
        v-if="(content.status === 'success' || content.status === 'progress') && totalVideos > 0"
        class="vdb-c-mx-auto vdb-c-flex vdb-c-w-full vdb-c-max-w-[1080px] vdb-c-flex-col vdb-c-gap-20"
      >
        <!-- Header -->
        <div
          class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-16 vdb-c-rounded-[12px] vdb-c-border vdb-c-border-[#ec5b16] vdb-c-bg-[#fff5ec] vdb-c-p-6"
        >
          <!-- Results Badge -->
          <div
            class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[6px] vdb-c-rounded-[8px] vdb-c-bg-white vdb-c-py-[9px] vdb-c-pl-[9px] vdb-c-pr-[13px]"
          >
            <MagicIcon stroke="#ec5b16" />
            <span
              class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1e1e1e]"
            >
              Found {{ totalVideos }} results
            </span>
          </div>

          <!-- Info Text -->
          <div class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center">
            <p class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[1.5] vdb-c-text-[#1e1e1e]">
              Click chat on any video to start a chat with video
            </p>
          </div>
        </div>

        <!-- Video Grid -->
        <div class="vdb-c-flex vdb-c-flex-wrap vdb-c-justify-center vdb-c-gap-16">
          <VideoCard
            v-for="(item, index) in paginatedVideos"
            :key="`video-${item.id}-${index}`"
            :video="item"
          />
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
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
      <div v-else-if="content.status === 'not_generated'" class="vdb-c-flex vdb-c-flex-col"></div>
    </transition>
  </div>
</template>

<script setup>
import '@videodb/player-vue/dist/style.css';
import { computed, ref, watch } from 'vue';
import { useVideoDBChat } from '../../context.js';
import VideoCard from './ChatVideosCard.vue';
import NavigationButton from '../chat/v2/collection/NavigationButton.vue';
import PaginationButton from '../chat/v2/collection/PaginationButton.vue';
import LoadingMessage from './elements/LoadingMessage.vue';
import MagicIcon from '../chat/v2/icons/deep-search/MagicIcon.vue';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  isLastConv: {
    type: Boolean,
    default: false,
  },
});

const columns = computed(() => props.content?.ui_config?.columns || 4);

const totalVideos = computed(() => {
  return props.content?.count ?? (props.content?.videos || []).length;
});

const itemsPerPage = 8;
const currentPage = ref(1);

const totalPages = computed(() => {
  const videos = props.content?.videos || [];
  return Math.ceil(videos.length / itemsPerPage);
});

const paginatedVideos = computed(() => {
  const videos = props.content?.videos || [];
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return videos.slice(start, end);
});

const displayedPageNumbers = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;

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

const getOriginalIndex = (paginatedIndex) => {
  return (currentPage.value - 1) * itemsPerPage + paginatedIndex;
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

watch(
  () => props.content?.videos,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);
</script>

<style lang="scss">
.video-js .vjs-big-play-button {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
