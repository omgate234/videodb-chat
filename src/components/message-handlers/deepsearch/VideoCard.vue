<template>
  <div
    class="video-card vdb-c-flex vdb-c-w-full vdb-c-min-w-[240px] vdb-c-cursor-pointer vdb-c-flex-col vdb-c-items-start vdb-c-gap-8 vdb-c-transition-all vdb-c-duration-300"
    :class="{ 'video-card--hovered': isHovered }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Video Player Container -->
    <div class="vdb-c-relative vdb-c-w-full vdb-c-overflow-hidden vdb-c-rounded-[12px]">
      <div
        v-if="video.stream_url"
        class="video-player-wrapper vdb-c-relative vdb-c-w-full vdb-c-overflow-hidden vdb-c-rounded-[12px] vdb-c-bg-black"
      >
        <VideoDBPlayer
          ref="playerRef"
          :key="video.id + '-' + video.stream_url"
          :stream-url="video.stream_url"
          :default-controls="false"
          :default-overlay="false"
          class="vdb-c-absolute vdb-c-left-0 vdb-c-top-0 vdb-c-h-full vdb-c-w-full vdb-c-rounded-[12px]"
          @play="handlePlay"
        >
          <template #overlay>
            <BigCenterButton
              class="play-button vdb-c-absolute vdb-c-left-1/2 vdb-c-top-1/2 vdb-c-flex vdb-c-h-48 vdb-c-w-48 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-transition-all vdb-c-duration-300"
            />

            <!-- Three Dots Menu - Top Right -->
            <div
              ref="menuButtonRef"
              class="three-dots-wrapper vdb-c-absolute vdb-c-right-8 vdb-c-top-8 vdb-c-z-10 vdb-c-rounded-full vdb-c-border vdb-c-p-6 vdb-c-transition-all vdb-c-duration-300"
              :class="[
                onSharePage ? 'vdb-c-cursor-not-allowed vdb-c-opacity-50' : 'vdb-c-cursor-pointer',
              ]"
              @click.stop="!onSharePage && toggleMenu()"
              @mouseenter="menuHovered = true"
              @mouseleave="
                () => {
                  menuHovered = false;
                  if (!showMenu) isHovered = false;
                }
              "
            >
              <ThreeDotsIcon stroke-color="#FFFFFF" class="vdb-c-h-16 vdb-c-w-16" />
            </div>

            <!-- Duration Pill - Bottom Right -->
            <div
              class="vdb-c-absolute vdb-c-bottom-8 vdb-c-right-8 vdb-c-z-10 vdb-c-inline-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[19px] vdb-c-bg-black/50 vdb-c-px-[6px] vdb-c-py-[4px] vdb-c-text-right vdb-c-text-[12px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-white"
            >
              {{ formatDuration(video.end - video.start) }}
            </div>
          </template>
        </VideoDBPlayer>
      </div>

      <!-- Fallback for no stream_url -->
      <div
        v-else
        class="video-thumbnail-wrapper vdb-c-relative vdb-c-w-full vdb-c-overflow-hidden vdb-c-rounded-[12px] vdb-c-bg-black"
      >
        <img
          v-if="video.thumbnail_data && video.thumbnail_data.length > 0"
          :src="video.thumbnail_data[0].thumbnail_url"
          :alt="video.name"
          class="video-thumbnail vdb-c-absolute vdb-c-left-0 vdb-c-top-0 vdb-c-h-full vdb-c-w-full vdb-c-object-cover vdb-c-transition-transform vdb-c-duration-300"
        />

        <div
          class="play-button vdb-c-absolute vdb-c-left-1/2 vdb-c-top-1/2 vdb-c-flex vdb-c-h-48 vdb-c-w-48 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-transition-all vdb-c-duration-300"
        >
          <PlayIcon class="vdb-c-h-20 vdb-c-w-20" />
        </div>

        <!-- Three Dots Menu - Top Right -->
        <div
          ref="menuButtonRef"
          class="three-dots-wrapper vdb-c-absolute vdb-c-right-8 vdb-c-top-8 vdb-c-z-10 vdb-c-rounded-full vdb-c-border vdb-c-p-6 vdb-c-transition-all vdb-c-duration-300"
          :class="[
            onSharePage ? 'vdb-c-cursor-not-allowed vdb-c-opacity-50' : 'vdb-c-cursor-pointer',
          ]"
          @click.stop="!onSharePage && toggleMenu()"
          @mouseenter="menuHovered = true"
          @mouseleave="
            () => {
              menuHovered = false;
              if (!showMenu) isHovered = false;
            }
          "
        >
          <ThreeDotsIcon stroke-color="#FFFFFF" class="vdb-c-h-16 vdb-c-w-16" />
        </div>

        <!-- Duration Pill - Bottom Right -->
        <div
          class="vdb-c-absolute vdb-c-bottom-8 vdb-c-right-8 vdb-c-z-10 vdb-c-inline-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[19px] vdb-c-bg-black/50 vdb-c-px-[6px] vdb-c-py-[4px] vdb-c-text-right vdb-c-text-[12px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-white"
        >
          {{ formatDuration(video.end - video.start) }}
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[8px]">
      <!-- Title -->
      <div class="vdb-c-flex-1 vdb-c-overflow-hidden">
        <p
          class="vdb-c-overflow-hidden vdb-c-text-ellipsis vdb-c-whitespace-nowrap vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-[#1e1e1e]"
        >
          {{ video.name || 'Untitled' }}
        </p>
      </div>

      <!-- Edit Button -->
      <button
        @click="!onSharePage && $emit('edit', video)"
        @mouseenter="editHovered = true"
        @mouseleave="editHovered = false"
        :disabled="onSharePage"
        :class="[
          'vdb-c-flex vdb-c-items-center vdb-c-gap-[4px] vdb-c-rounded-[6px] vdb-c-border vdb-c-py-[4px] vdb-c-pl-[4px] vdb-c-pr-[6px] vdb-c-transition-colors',
          onSharePage
            ? 'vdb-c-cursor-not-allowed vdb-c-border-[#efefef] vdb-c-bg-[#f7f7f7] vdb-c-opacity-50'
            : editHovered
              ? 'vdb-c-cursor-pointer vdb-c-border-[#ffcfa5] vdb-c-bg-[#ffe9d3]'
              : 'vdb-c-cursor-pointer vdb-c-border-[#efefef] vdb-c-bg-[#f7f7f7]',
        ]"
      >
        <EditIcon :fill="onSharePage ? '#969696' : editHovered ? '#821f0c' : '#1e1e1e'" />
        <span
          :class="[
            'vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal',
            onSharePage
              ? 'vdb-c-text-[#969696]'
              : editHovered
                ? 'vdb-c-text-[#821f0c]'
                : 'vdb-c-text-[#1e1e1e]',
          ]"
        >
          Edit
        </span>
      </button>
    </div>
  </div>

  <!-- Dropdown Menu (Teleported) -->
  <Teleport to="body">
    <ul
      v-if="showMenu && menuPosition"
      class="menu-dropdown vdb-c-fixed vdb-c-z-[10000] vdb-c-w-[200px] vdb-c-min-w-[200px] vdb-c-cursor-pointer vdb-c-rounded-12 vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-white vdb-c-p-8 vdb-c-text-sm"
      :style="{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }"
      @mouseleave="handleMenuMouseLeave"
    >
      <!-- Copy Link -->
      <li
        class="menu-item vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-12 vdb-c-rounded-8 vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-sm vdb-c-font-[500] vdb-c-text-black hover:vdb-c-bg-roy"
        @click.stop="handleCopyLink"
      >
        <CheckIcon
          v-if="showCheckIcon"
          class="vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0 vdb-c-text-[#1e1e1e]"
        />
        <LinkIcon v-else class="vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0" fill="#1e1e1e" />
        <span class="vdb-c-flex-shrink-0">Copy link</span>
      </li>

      <!-- Download -->
      <li
        class="menu-item vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-12 vdb-c-rounded-8 vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-sm vdb-c-font-[500] vdb-c-text-black hover:vdb-c-bg-roy"
        @click.stop="handleDownload"
      >
        <DownloadIcon class="vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0" fill="#1e1e1e" />
        <span class="vdb-c-flex-shrink-0">Download</span>
      </li>

      <!-- Meta Info -->
      <li
        class="menu-item vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-12 vdb-c-rounded-8 vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-sm vdb-c-font-[500] vdb-c-text-black hover:vdb-c-bg-roy"
        @click.stop="handleMetaInfo"
      >
        <MetaInfoIcon class="vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0" fill="#1e1e1e" />
        <span class="vdb-c-flex-shrink-0">View meta info</span>
      </li>
    </ul>
  </Teleport>

  <!-- Meta Info Modal -->
  <MetaInfoModal :show-modal="showMetaInfoModal" :video="props.video" @close="closeMetaInfoModal" />

  <!-- Notification Center -->
  <NotificationCenter ref="notificationCenterRef" />
</template>

<script setup>
import { ref, inject, nextTick } from 'vue';
import { BigCenterButton, VideoDBPlayer } from '@videodb/player-vue';
import '@videodb/player-vue/dist/style.css';
import EditIcon from '../../chat/v2/icons/deep-search/EditIcon.vue';
import ThreeDotsIcon from '../../chat/v2/icons/ThreeDotsIcon.vue';
import LinkIcon from '../../chat/v2/icons/deep-search/LinkIcon.vue';
import DownloadIcon from '../../chat/v2/icons/deep-search/DownloadIcon.vue';
import PlayIcon from '../../icons/play.vue';
import CheckIcon from '../../chat/v2/icons/CheckIcon.vue';
import MetaInfoIcon from '../../chat/v2/icons/deep-search/MetaInfoIcon.vue';
import MetaInfoModal from '../../modals/MetaInfoModal.vue';
import NotificationCenter from '../../chat/elements/NotificationCenter.vue';

const props = defineProps({
  video: {
    type: Object,
    required: true,
  },
  callApi: {
    type: Function,
    default: null,
  },
  onVideoPlay: {
    type: Function,
    default: null,
  },
  index: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['edit']);

const context = inject('videodb-chat-context');
const callApi = props.callApi || context?.callApi;
const onSharePage = context?.onSharePage || false;

const isHovered = ref(false);
const editHovered = ref(false);
const menuHovered = ref(false);
const showMenu = ref(false);
const menuButtonRef = ref(null);
const menuPosition = ref(null);
const showCheckIcon = ref(false);
const showMetaInfoModal = ref(false);
const notificationCenterRef = ref(null);
const playerRef = ref(null);

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const toggleMenu = async () => {
  if (onSharePage) return;
  showMenu.value = !showMenu.value;
  if (showMenu.value && menuButtonRef.value) {
    await nextTick();
    const rect = menuButtonRef.value.getBoundingClientRect();
    const isEveryFourth = (props.index + 1) % 4 === 0;
    menuPosition.value = {
      top: rect.bottom + 8,
      left: isEveryFourth ? rect.right - 200 : rect.left,
    };
  }
};

const handleMenuMouseLeave = () => {
  showMenu.value = false;
  if (!menuHovered.value) {
    isHovered.value = false;
  }
};

const handleCopyLink = async () => {
  if (onSharePage) return;
  if (!props.video.stream_url) {
    console.error('Copy link not available - missing stream URL');
    notificationCenterRef.value?.addNotification('Video link not available', { type: 'error' });
    showMenu.value = false;
    return;
  }

  try {
    await navigator.clipboard.writeText(
      `https://console.videodb.io/player?url=${encodeURIComponent(props.video.stream_url)}`
    );

    showCheckIcon.value = true;
    notificationCenterRef.value?.addNotification('Video link copied');
    setTimeout(() => {
      showCheckIcon.value = false;
    }, 1000);
  } catch (error) {
    console.error('Error copying link:', error);
    notificationCenterRef.value?.addNotification('Failed to copy link', { type: 'error' });
  }
  showMenu.value = false;
};

const handleDownload = async () => {
  if (onSharePage) return;
  if (!props.video.stream_url) {
    console.error('Download not available - missing stream URL');
    notificationCenterRef.value?.addNotification('Download not available', { type: 'error' });
    showMenu.value = false;
    return;
  }

  notificationCenterRef.value?.addNotification('Downloading video...');

  try {
    const clipName = `${props.video.name || 'clip'}_${props.video.start}-${props.video.end}`;

    if (callApi) {
      const downloadResult = await callApi('/videodb/download', {
        method: 'POST',
        payload: {
          stream_url: props.video.stream_url,
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
        notificationCenterRef.value?.addNotification('Video download started');
      } else {
        console.error('No download URL received', downloadResult);
        notificationCenterRef.value?.addNotification('Failed to download video', { type: 'error' });
      }
    } else {
      const link = document.createElement('a');
      link.href = props.video.stream_url;
      link.download = `${clipName}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      notificationCenterRef.value?.addNotification('Video download started');
    }
  } catch (error) {
    console.error('Error downloading:', error);
    notificationCenterRef.value?.addNotification('Failed to download video', { type: 'error' });
  }
  showMenu.value = false;
};

const handleMetaInfo = () => {
  showMenu.value = false;
  showMetaInfoModal.value = true;
};

const closeMetaInfoModal = () => {
  showMetaInfoModal.value = false;
};

const handlePlay = () => {
  if (props.onVideoPlay) {
    props.onVideoPlay();
  }
};

defineExpose({
  playerRef,
});
</script>

<style scoped>
.video-card {
  padding: 10px 10px 12px 10px;
  border-radius: 17.023px;
  background: white;
}

.video-card--hovered {
  background: var(--Light-Grey-VDB, #f7f7f7);
}

/* Video Container - 16:9 aspect ratio */
.video-player-wrapper,
.video-thumbnail-wrapper {
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.video-thumbnail {
  transform: scale(1.001);
}

.video-card:hover .video-thumbnail {
  transform: scale(1.05);
}

/* Play Button */
.play-button {
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(16px);
  opacity: 0;
  color: #fff;
}

.video-card:hover .play-button {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.05);
  background: rgba(0, 0, 0, 0.6);
}

/* Three Dots Button - Top Right */
.three-dots-wrapper {
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(16px);
}

.three-dots-wrapper:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.45);
}

.menu-dropdown {
  box-shadow:
    0px 5px 11px rgba(0, 0, 0, 0.06),
    0px 21px 21px rgba(0, 0, 0, 0.05),
    0px 47px 28px rgba(0, 0, 0, 0.03),
    0px 83px 33px rgba(0, 0, 0, 0.01),
    0px 130px 36px rgba(0, 0, 0, 0);
}

.menu-item {
  transition: background-color 0.2s ease;
}
</style>
