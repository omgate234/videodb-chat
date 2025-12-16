<template>
  <div
    class="video-card vdb-c-flex vdb-c-w-[240px] vdb-c-cursor-pointer vdb-c-flex-col vdb-c-items-start vdb-c-gap-8 vdb-c-transition-all vdb-c-duration-300"
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
          :stream-url="video.stream_url"
          :default-controls="false"
          :default-overlay="false"
          class="vdb-c-absolute vdb-c-left-0 vdb-c-top-0 vdb-c-h-full vdb-c-w-full vdb-c-rounded-[12px]"
        >
          <template #overlay>
            <BigCenterButton
              class="play-button vdb-c-absolute vdb-c-left-1/2 vdb-c-top-1/2 vdb-c-flex vdb-c-h-48 vdb-c-w-48 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-transition-all vdb-c-duration-300"
            />

            <!-- Duration Pill - Bottom Right -->
            <div
              v-if="video.length || video.duration"
              class="vdb-c-absolute vdb-c-bottom-8 vdb-c-right-8 vdb-c-z-10 vdb-c-inline-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[19px] vdb-c-bg-black/50 vdb-c-px-[6px] vdb-c-py-[4px] vdb-c-text-right vdb-c-text-[12px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-white"
            >
              {{ formatDuration(video.length || video.duration) }}
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
          v-if="video.thumbnail_url"
          :src="video.thumbnail_url"
          :alt="video.name"
          class="video-thumbnail vdb-c-absolute vdb-c-left-0 vdb-c-top-0 vdb-c-h-full vdb-c-w-full vdb-c-object-cover vdb-c-transition-transform vdb-c-duration-300"
        />
        <DefaultThumbnail
          v-else
          class="video-thumbnail video-thumbnail--default vdb-c-absolute vdb-c-left-0 vdb-c-top-0 vdb-c-h-full vdb-c-w-full"
        />

        <div
          class="play-button vdb-c-absolute vdb-c-left-1/2 vdb-c-top-1/2 vdb-c-flex vdb-c-h-48 vdb-c-w-48 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-transition-all vdb-c-duration-300"
        >
          <PlayIcon class="vdb-c-h-20 vdb-c-w-20" />
        </div>

        <!-- Duration Pill - Bottom Right -->
        <div
          v-if="video.length || video.duration"
          class="vdb-c-absolute vdb-c-bottom-8 vdb-c-right-8 vdb-c-z-10 vdb-c-inline-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[19px] vdb-c-bg-black/50 vdb-c-px-[6px] vdb-c-py-[4px] vdb-c-text-right vdb-c-text-[12px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-white"
        >
          {{ formatDuration(video.length || video.duration) }}
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

      <!-- Chat Button -->
      <button
        @click="handleChatWithVideo"
        @mouseenter="chatHovered = true"
        @mouseleave="chatHovered = false"
        :class="[
          'vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-[4px] vdb-c-rounded-[6px] vdb-c-border vdb-c-py-[4px] vdb-c-pl-[4px] vdb-c-pr-[6px] vdb-c-transition-colors',
          chatHovered
            ? 'vdb-c-border-[#ffcfa5] vdb-c-bg-[#ffe9d3]'
            : 'vdb-c-border-[#efefef] vdb-c-bg-[#f7f7f7]',
        ]"
      >
        <ChatWithVideoIcon :fill="chatHovered ? '#821f0c' : '#1e1e1e'" />
        <span
          :class="[
            'vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal',
            chatHovered ? 'vdb-c-text-[#821f0c]' : 'vdb-c-text-[#1e1e1e]',
          ]"
        >
          Chat
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { BigCenterButton, VideoDBPlayer } from '@videodb/player-vue';
import '@videodb/player-vue/dist/style.css';
import ChatWithVideoIcon from '../chat/v2/icons/ChatWithVideo.vue';
import PlayIcon from '../icons/play.vue';
import DefaultThumbnail from '../assets/DefaultThumbnail.vue';

const props = defineProps({
  video: {
    type: Object,
    required: true,
  },
  handleAddMessage: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(['chat']);

const context = inject('videodb-chat-context');
const contextHandleAddMessage = context?.handleAddMessage;

const isHovered = ref(false);
const chatHovered = ref(false);

const formatDuration = (seconds) => {
  if (!seconds) return '00:00';

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const handleChatWithVideo = () => {
  const addMessageFn = props.handleAddMessage || contextHandleAddMessage;

  if (addMessageFn) {
    addMessageFn({
      text: props.video.name,
      video_id: props.video.id,
      from_event: true,
    });
  }
};
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

.video-player-wrapper,
.video-thumbnail-wrapper {
  padding-bottom: 56.25%;
}

.video-thumbnail {
  transform: scale(1.001);
}

.video-thumbnail--default {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.video-card:hover .video-thumbnail {
  transform: scale(1.05);
}

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

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>
