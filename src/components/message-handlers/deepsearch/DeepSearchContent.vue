<template>
  <div
    class="vdb-c-mx-auto vdb-c-flex vdb-c-w-full vdb-c-max-w-[1080px] vdb-c-flex-col vdb-c-gap-20"
  >
    <!-- Show grid view when no video is being edited -->
    <template v-if="editingIndex === null">
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
            Found {{ totalVideosCount }} results
          </span>
        </div>

        <!-- Info Text -->
        <div class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center">
          <p class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[1.5] vdb-c-text-[#1e1e1e]">
            Click Edit on any clip to make quick adjustments.
          </p>
        </div>
      </div>

      <!-- Video Grid -->
      <div
        class="vdb-c-grid vdb-c-w-full vdb-c-grid-cols-4 vdb-c-flex-wrap vdb-c-items-start vdb-c-justify-center vdb-c-gap-16"
      >
        <VideoCard
          v-for="(video, index) in paginatedVideos"
          :key="video.id + '-' + index + '-' + video.stream_url"
          :ref="
            (el) => {
              if (el) gridVideoRefs[getOriginalIndex(index)] = el;
            }
          "
          :video="video"
          :index="index"
          :call-api="callApi"
          :on-convert-to-reel="() => handleConvertToReelFromGrid(getOriginalIndex(index))"
          :on-video-play="() => handleVideoPlay(getOriginalIndex(index))"
          @edit="startEditing(getOriginalIndex(index))"
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
    </template>

    <!-- Show editor when a video is being edited -->
    <template v-else>
      <!-- Editor Header -->
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[100px] vdb-c-rounded-[12px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-[#f7f7f7] vdb-c-p-6"
      >
        <!-- Back Button -->
        <button
          @click="exitEditing"
          class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-gap-[6px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-white vdb-c-py-[9px] vdb-c-pl-[9px] vdb-c-pr-[13px] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#f7f7f7]"
        >
          <ArrowLeftIcon />
          <span
            class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1e1e1e]"
          >
            See all results
          </span>
        </button>

        <!-- Center Info -->
        <div
          class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center vdb-c-justify-center vdb-c-gap-[8px]"
        >
          <p class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[1.5] vdb-c-text-[#c14103]">
            {{ internalVideos[editingIndex].name || 'Untitled' }}
          </p>
          <div class="vdb-c-h-[16px] vdb-c-w-0 vdb-c-border-l vdb-c-border-[#1e1e1e]"></div>
          <p class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[1.5] vdb-c-text-[#464646]">
            Showing {{ editingIndex + 1 }} of {{ internalVideos.length }} results
          </p>
        </div>

        <!-- Navigation Buttons -->
        <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-[12px]">
          <button
            @click="previousVideo"
            :disabled="editingIndex === 0"
            class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-gap-[4px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-white vdb-c-py-[9px] vdb-c-pl-[5px] vdb-c-pr-[17px] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#f7f7f7] disabled:vdb-c-cursor-not-allowed disabled:vdb-c-opacity-50"
          >
            <ChevronIcon fill="#1e1e1e" />
            <span
              class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1e1e1e]"
            >
              Previous
            </span>
          </button>

          <button
            @click="nextVideo"
            :disabled="editingIndex === internalVideos.length - 1"
            class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-gap-[4px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-white vdb-c-py-[9px] vdb-c-pl-[17px] vdb-c-pr-[5px] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#f7f7f7] disabled:vdb-c-cursor-not-allowed disabled:vdb-c-opacity-50"
          >
            <span
              class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1e1e1e]"
            >
              Next
            </span>
            <ChevronIcon fill="#1e1e1e" class="vdb-c-rotate-180" />
          </button>
        </div>
      </div>

      <!-- Video Preview Section -->
      <div class="vdb-c-flex vdb-c-w-full vdb-c-items-start vdb-c-justify-center vdb-c-gap-[10px]">
        <!-- Video Container -->
        <div class="vdb-c-flex vdb-c-w-fit vdb-c-flex-col vdb-c-items-center vdb-c-gap-[10px]">
          <div class="vdb-c-relative vdb-c-h-full vdb-c-w-[480px]">
            <ChatVideo
              :key="`${internalVideos[editingIndex]?.video_id || internalVideos[editingIndex]?.id}-${internalVideos[editingIndex].stream_url}`"
              :show-loading="false"
              class="vdb-c-h-full vdb-c-w-full"
              v-if="internalVideos[editingIndex].stream_url"
              :content="{
                status: 'success',
                video: {
                  stream_url: internalVideos[editingIndex].stream_url,
                  name: internalVideos[editingIndex].name,
                  collection_name: internalVideos[editingIndex].collection_name || '',
                  style: internalVideos[editingIndex].style || 'horizontal',
                  id: internalVideos[editingIndex]?.video_id || internalVideos[editingIndex]?.id,
                  collection_id: internalVideos[editingIndex]?.collection_id,
                },
              }"
              :is-last-conv="false"
              :full-width="true"
              :show-overlay-menu="false"
            />

            <!-- Loading Overlay -->
            <div
              v-if="isGeneratingStream"
              class="vdb-c-absolute vdb-c-left-[50%] vdb-c-top-[50%] vdb-c-z-[1000000] vdb-c-flex vdb-c-translate-x-[-50%] vdb-c-translate-y-[-50%] vdb-c-transform vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[rgba(0,0,0,0.5)]"
            >
              <div
                class="vdb-c-flex vdb-c-items-center vdb-c-gap-[4px] vdb-c-rounded-[60px] vdb-c-bg-[rgba(0,0,0,0.5)] vdb-c-px-[8px] vdb-c-py-[4px] vdb-c-pl-[6px]"
              >
                <LoadingIcon
                  class="loading-spinner vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-flex-shrink-0"
                />
                <span
                  class="vdb-c-whitespace-nowrap vdb-c-text-[12px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-[#969696]"
                >
                  Loading preview
                </span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-[8px]">
            <!-- Reset Button -->
            <button
              @click="resetToDefault"
              class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-gap-[4px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-white vdb-c-py-[9px] vdb-c-pl-[9px] vdb-c-pr-[13px] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-border-[#ec5b16] hover:vdb-c-bg-[#ffe9d3]"
            >
              <ResetIcon fill="#2d2d2d" />
              <span
                class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1e1e1e]"
              >
                Reset to default
              </span>
            </button>

            <!-- Download Clip Button -->
            <button
              @click="downloadClip"
              class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-gap-[4px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-white vdb-c-py-[9px] vdb-c-pl-[9px] vdb-c-pr-[13px] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-border-[#ec5b16] hover:vdb-c-bg-[#ffe9d3]"
            >
              <DownloadIcon fill="#1E1E1E" />
              <span
                class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-vdb-darkishgrey"
              >
                Download clip
              </span>
            </button>
          </div>
        </div>

        <!-- Toolbar (Right Side) -->
        <div
          class="vdb-c-mt-[18px] vdb-c-flex vdb-c-flex-col vdb-c-gap-[2px] vdb-c-rounded-[40px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-[#f7f7f7] vdb-c-p-[4px]"
        >
          <!-- Copy Link -->
          <div class="vdb-c-relative">
            <Tooltip
              :class="[
                'vdb-c-absolute vdb-c-left-full vdb-c-top-1/2 vdb-c-z-[10000] vdb-c-ml-[8px] vdb-c-translate-y-[-50%]',
                hoveredButton === 'copy' ? 'vdb-c-block' : 'vdb-c-hidden',
              ]"
              :text="showCheckIcon ? 'Copied!' : 'Copy Link'"
            />
            <button
              @click="copyLink"
              @mouseenter="hoveredButton = 'copy'"
              @mouseleave="hoveredButton = null"
              class="toolbar-btn vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[37.5px] vdb-c-border vdb-c-border-[#f7f7f7] vdb-c-bg-[#f7f7f7] vdb-c-p-[6px] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-border-[#e6e6e6] hover:vdb-c-bg-white"
            >
              <CheckIcon v-if="showCheckIcon" class="vdb-c-text-[#1e1e1e]" />
              <LinkIcon v-else fill="#1e1e1e" />
            </button>
          </div>

          <!-- Convert to Reel -->
          <div class="vdb-c-relative">
            <Tooltip
              :class="[
                'vdb-c-absolute vdb-c-left-full vdb-c-top-1/2 vdb-c-z-[10000] vdb-c-ml-[8px] vdb-c-translate-y-[-50%]',
                hoveredButton === 'reel' ? 'vdb-c-block' : 'vdb-c-hidden',
              ]"
              text="Convert to Reel"
            />
            <button
              @click="convertToReel"
              @mouseenter="hoveredButton = 'reel'"
              @mouseleave="hoveredButton = null"
              class="toolbar-btn vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[37.5px] vdb-c-border vdb-c-border-[#f7f7f7] vdb-c-bg-[#f7f7f7] vdb-c-p-[6px] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-border-[#e6e6e6] hover:vdb-c-bg-white"
            >
              <RotateIcon fill="#1e1e1e" />
            </button>
          </div>

          <!-- Download -->
          <div class="vdb-c-relative">
            <Tooltip
              :class="[
                'vdb-c-absolute vdb-c-left-full vdb-c-top-1/2 vdb-c-z-[10000] vdb-c-ml-[8px] vdb-c-translate-y-[-50%]',
                hoveredButton === 'download' ? 'vdb-c-block' : 'vdb-c-hidden',
              ]"
              text="Download"
            />
            <button
              @click="downloadClip"
              @mouseenter="hoveredButton = 'download'"
              @mouseleave="hoveredButton = null"
              class="toolbar-btn vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[37.5px] vdb-c-border vdb-c-border-[#f7f7f7] vdb-c-bg-[#f7f7f7] vdb-c-p-[6px] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-border-[#e6e6e6] hover:vdb-c-bg-white"
            >
              <DownloadIcon fill="#1e1e1e" />
            </button>
          </div>

          <!-- Save to Collection -->
          <div class="vdb-c-relative">
            <Tooltip
              :class="[
                'vdb-c-absolute vdb-c-left-full vdb-c-top-1/2 vdb-c-z-[10000] vdb-c-ml-[8px] vdb-c-translate-y-[-50%]',
                hoveredButton === 'save' ? 'vdb-c-block' : 'vdb-c-hidden',
              ]"
              text="Save to Collection"
            />
            <button
              @click="saveToCollection"
              @mouseenter="hoveredButton = 'save'"
              @mouseleave="hoveredButton = null"
              class="toolbar-btn vdb-c-flex vdb-c-aspect-square vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[37.5px] vdb-c-border vdb-c-border-[#f7f7f7] vdb-c-bg-[#f7f7f7] vdb-c-p-[6px] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-border-[#e6e6e6] hover:vdb-c-bg-white"
            >
              <AddToFolderIcon fill="#1e1e1e" />
            </button>
          </div>

          <!-- Meta Info -->
          <div class="vdb-c-relative">
            <Tooltip
              :class="[
                'vdb-c-absolute vdb-c-left-full vdb-c-top-1/2 vdb-c-z-[10000] vdb-c-ml-[8px] vdb-c-translate-y-[-50%]',
                hoveredButton === 'meta' ? 'vdb-c-block' : 'vdb-c-hidden',
              ]"
              text="Meta Info"
            />
            <button
              @click="openMetaInfoModal"
              @mouseenter="hoveredButton = 'meta'"
              @mouseleave="hoveredButton = null"
              class="toolbar-btn vdb-c-flex vdb-c-aspect-square vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[37.5px] vdb-c-border vdb-c-border-[#f7f7f7] vdb-c-bg-[#f7f7f7] vdb-c-p-[6px] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-border-[#e6e6e6] hover:vdb-c-bg-white"
            >
              <MetaInfoIcon fill="#1e1e1e" />
            </button>
          </div>
        </div>
      </div>

      <!-- Slider Component -->
      <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-center">
        <SliderComponent
          :total-duration="internalVideos[editingIndex].length"
          :original-start="internalVideos[editingIndex].original_start"
          :original-end="internalVideos[editingIndex].original_end"
          :max-extension="20"
          :thumbnails="internalVideos[editingIndex].thumbnail_data"
          v-model:start="videoStates[editingIndex].start"
          v-model:end="videoStates[editingIndex].end"
        />
      </div>
    </template>

    <!-- Meta Info Modal -->
    <MetaInfoModal
      :show-modal="showMetaInfoModal"
      :video="selectedVideoForMetaInfo"
      @close="closeMetaInfoModal"
    />
  </div>
</template>

<script setup>
import { ref, watch, inject, computed } from 'vue';
import SliderComponent from './SliderComponent.vue';
import VideoCard from './VideoCard.vue';
import ChatVideo from '../ChatVideo.vue';
import MagicIcon from '../../chat/v2/icons/deep-search/MagicIcon.vue';
import ArrowLeftIcon from '../../chat/v2/icons/deep-search/ArrowLeftIcon.vue';
import ChevronIcon from '../../chat/v2/icons/deep-search/ChevronIcon.vue';
import ResetIcon from '../../chat/v2/icons/deep-search/ResetIcon.vue';
import DownloadIcon from '../../chat/v2/icons/deep-search/DownloadIcon.vue';
import LinkIcon from '../../chat/v2/icons/deep-search/LinkIcon.vue';
import RotateIcon from '../../chat/v2/icons/deep-search/RotateIcon.vue';
import AddToFolderIcon from '../../chat/v2/icons/deep-search/AddToFolderIcon.vue';
import LoadingIcon from '../../chat/v2/icons/deep-search/LoadingIcon.vue';
import CheckIcon from '../../chat/v2/icons/CheckIcon.vue';
import NavigationButton from '../../chat/v2/collection/NavigationButton.vue';
import PaginationButton from '../../chat/v2/collection/PaginationButton.vue';
import MetaInfoIcon from '../../chat/v2/icons/deep-search/MetaInfoIcon.vue';
import MetaInfoModal from '../../modals/MetaInfoModal.vue';
import Tooltip from '../../chat/v2/elements/Tooltip.vue';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  callApi: {
    type: Function,
    default: null,
  },
});

const context = inject('videodb-chat-context');
const getVideoDownloadUrl = context?.getVideoDownloadUrl;
const generateVideoStream = context?.generateVideoStream;
const getDownloadUrlFromStream = context?.getDownloadUrlFromStream;
const callApi = props.callApi || context?.callApi;
const handleAddMessage = context?.handleAddMessage;
const handleUpload = context?.handleUpload;
const activeCollectionData = context?.activeCollectionData;

const internalVideos = ref(
  props.content.videos.map((video) => ({
    ...video,
    start: video.start,
    end: video.end,
    stream_url: video.stream_url,
    original_start: video.start,
    original_end: video.end,
    original_stream_url: video.stream_url,
  }))
);

const videoStates = ref(
  props.content.videos.map((video) => ({
    start: video.start,
    end: video.end,
  }))
);

const editingIndex = ref(null);
const isGeneratingStream = ref(false);
const showCheckIcon = ref(false);
const showMetaInfoModal = ref(false);
const selectedVideoForMetaInfo = ref(null);
const hoveredButton = ref(null);
const gridVideoRefs = ref({});
const currentlyPlayingVideo = ref(null);

const itemsPerPage = 8;
const currentPage = ref(1);

const totalVideosCount = computed(() => {
  return props.content.count ?? props.content.videos.length;
});

const totalPages = computed(() => Math.ceil(props.content.videos.length / itemsPerPage));

const paginatedVideos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return props.content.videos.slice(start, end);
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

const startEditing = (index) => {
  editingIndex.value = index;
};

const exitEditing = () => {
  editingIndex.value = null;
};

const previousVideo = () => {
  if (editingIndex.value > 0) {
    editingIndex.value--;
  }
};

const nextVideo = () => {
  if (editingIndex.value < internalVideos.value.length - 1) {
    editingIndex.value++;
  }
};

const resetToDefault = () => {
  const currentVideo = internalVideos.value[editingIndex.value];
  videoStates.value[editingIndex.value].start = currentVideo.original_start;
  videoStates.value[editingIndex.value].end = currentVideo.original_end;

  internalVideos.value[editingIndex.value].stream_url = currentVideo.original_stream_url;
  internalVideos.value[editingIndex.value].start = currentVideo.original_start;
  internalVideos.value[editingIndex.value].end = currentVideo.original_end;
};

const updateStreamUrl = async (index) => {
  const video = internalVideos.value[index];
  const state = videoStates.value[index];

  const videoId = video.video_id || video.id;
  const collectionId = video.collection_id;

  if (state.start === video.start && state.end === video.end) {
    return;
  }

  if (!generateVideoStream || !collectionId || !videoId) {
    console.error('Cannot generate stream - missing required data', {
      collectionId,
      videoId,
      hasFunction: !!generateVideoStream,
    });
    return;
  }

  try {
    isGeneratingStream.value = true;
    const result = await generateVideoStream(collectionId, videoId, state.start, state.end);
    if (result?.data?.stream_url) {
      // Update internal video state with new stream URL and times
      internalVideos.value[index].stream_url = result.data.stream_url;
      internalVideos.value[index].start = state.start;
      internalVideos.value[index].end = state.end;
    } else {
      console.error('Failed to generate stream URL', result);
    }
  } catch (error) {
    console.error('Error generating stream URL:', error);
  } finally {
    isGeneratingStream.value = false;
  }
};

const downloadClip = async () => {
  const currentVideo = internalVideos.value[editingIndex.value];
  const streamUrl = currentVideo.stream_url;

  if (!streamUrl) {
    console.error('Download not available - missing stream URL');
    return;
  }

  try {
    const clipName = `${currentVideo.name || 'clip'}_${currentVideo.start}-${currentVideo.end}`;

    if (callApi) {
      const downloadResult = await callApi('/videodb/download', {
        method: 'POST',
        payload: {
          stream_url: streamUrl,
          name: clipName,
        },
      });

      if (downloadResult?.status === 'success' && downloadResult?.data?.download_url) {
        const link = document.createElement('a');
        link.href = downloadResult.data.download_url;
        link.download = `${clipName}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('No download URL received', downloadResult);
      }
    } else {
      const link = document.createElement('a');
      link.href = streamUrl;
      link.download = `${clipName}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Error downloading clip:', error);
  }
};

const copyLink = async () => {
  const currentVideo = internalVideos.value[editingIndex.value];
  const streamUrl = currentVideo.stream_url;

  if (!streamUrl) {
    console.error('Copy link not available - missing stream URL');
    return;
  }

  try {
    await navigator.clipboard.writeText(
      `https://console.videodb.io/player?url=${encodeURIComponent(streamUrl)}`
    );

    showCheckIcon.value = true;
    setTimeout(() => {
      showCheckIcon.value = false;
    }, 1000);
  } catch (error) {
    console.error('Error copying link:', error);
  }
};

const convertToReel = () => {
  const currentVideo = internalVideos.value[editingIndex.value];

  if (!handleAddMessage) {
    console.error('handleAddMessage not available');
    return;
  }

  const videoId = currentVideo.video_id || currentVideo.id;
  const message = `Convert this video clip from ${currentVideo.name || 'video'} from ${currentVideo.start} to ${currentVideo.end} into a reel.`;

  handleAddMessage({
    text: message,
    videos: [videoId],
    agents: ['Edit'],
    from_event: true,
  });
};

const handleConvertToReelFromGrid = (index) => {
  const video = props.content.videos[index];

  if (!handleAddMessage) {
    console.error('handleAddMessage not available');
    return;
  }

  const videoId = video.video_id || video.id;
  const message = `Convert this video clip from ${video.name || 'video'} from ${video.start} to ${video.end} into a reel.`;

  handleAddMessage({
    text: message,
    videos: [videoId],
    agents: ['Edit'],
    from_event: true,
  });
};

const downloadVideo = async () => {
  const currentVideo = internalVideos.value[editingIndex.value];
  const streamUrl = currentVideo.stream_url;
  const videoName = currentVideo.name || 'video';

  if (!getDownloadUrlFromStream || !streamUrl) {
    console.error('Download not available - missing streamUrl or download function');
    return;
  }

  try {
    const result = await getDownloadUrlFromStream(streamUrl, videoName);
    if (result?.status === 'success' && result?.data?.download_url) {
      const link = document.createElement('a');
      link.href = result.data.download_url;
      link.download = `${videoName}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('No download URL received from stream');
    }
  } catch (error) {
    console.error('Error downloading video from stream:', error);
  }
};

const saveToCollection = async () => {
  const currentVideo = internalVideos.value[editingIndex.value];
  const streamUrl = currentVideo.stream_url;

  if (!handleUpload || !streamUrl) {
    console.error('Save to collection not available');
    return;
  }

  try {
    const targetCollectionId = activeCollectionData?.value?.id;
    if (!targetCollectionId) {
      console.error('No active collection');
      return;
    }

    await handleUpload({
      source: { url: streamUrl },
      sourceType: 'url',
      collectionId: targetCollectionId,
      mediaType: 'video',
    });
  } catch (error) {
    console.error('Error adding to collection:', error);
  }
};

const openMetaInfoModal = () => {
  if (editingIndex.value !== null) {
    selectedVideoForMetaInfo.value = internalVideos.value[editingIndex.value];
    showMetaInfoModal.value = true;
  }
};

const closeMetaInfoModal = () => {
  showMetaInfoModal.value = false;
  selectedVideoForMetaInfo.value = null;
};

const handleVideoPlay = (index) => {
  const playingKey = `grid-${index}`;

  if (currentlyPlayingVideo.value === playingKey) {
    return;
  }

  currentlyPlayingVideo.value = playingKey;

  Object.entries(gridVideoRefs.value).forEach(([idx, videoCardComponent]) => {
    if (parseInt(idx) !== index) {
      const gridPlayer = videoCardComponent?.playerRef;
      if (gridPlayer?.playing) {
        gridPlayer.pause();
      }
    }
  });
};

watch(
  () => videoStates.value,
  () => {
    if (editingIndex.value !== null) {
      if (updateStreamUrl.timeoutId) {
        clearTimeout(updateStreamUrl.timeoutId);
      }

      updateStreamUrl.timeoutId = setTimeout(() => {
        updateStreamUrl(editingIndex.value);
      }, 500);
    }
  },
  { deep: true }
);

watch(
  () => props.content.videos,
  (newVideos) => {
    videoStates.value = newVideos.map((video) => ({
      start: video.start,
      end: video.end,
    }));

    internalVideos.value = newVideos.map((video) => ({
      ...video,
      start: video.start,
      end: video.end,
      stream_url: video.stream_url,
      original_start: video.start,
      original_end: video.end,
      original_stream_url: video.stream_url,
    }));

    currentPage.value = 1;
  },
  { deep: true }
);
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}
</style>
