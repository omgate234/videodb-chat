<template>
  <div
    class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-8 vdb-c-py-14 vdb-c-text-left"
  >
    <LoadingMessage
      v-if="showLoading"
      :status="content.status"
      :message="content.status_message"
      :is-last-conv="isLastConv"
    />
    <transition name="fade" mode="out-in">
      <div
        v-if="content.status === 'success' && content.video.stream_url"
        class="vdb-c-w-full vdb-c-py-6"
      >
        <div
          :class="videoContainerClasses"
          :style="!isFullScreen && !isMp4Url ? { border: '2px solid var(--Light-Grey-VDB, #F7F7F7)' } : {}"
        >
          <!-- Vertical 9:16 wrapper when not fullscreen -->
          <div
            v-if="isVertical && !isFullScreen"
            class="vdb-c-relative vdb-c-w-full"
            :style="{ paddingTop: verticalPadding }"
          >
            <div class="vdb-c-absolute vdb-c-inset-0">
              <VideoDBPlayer
                ref="playerRef"
                :class="
                  isFullScreen ? 'vdb-c-h-screen vdb-c-w-screen' : 'vdb-c-h-full vdb-c-w-full'
                "
                :stream-url="content.video.stream_url"
                :default-controls="false"
                :default-overlay="false"
                @fullScreenChange="handleFullScreenChange"
                @mouseenter="isHovered = true"
                @mouseleave="isHovered = false"
              >
                <template #overlay>
                  <CustomOverlay
                    :video-name="content.video.name"
                    :collection-name="content.video.collection_name"
                    :stream-url="content.video.stream_url"
                    :video-id="content.video.id"
                    :collection-id="content.video.collection_id"
                    :is-hovered="isHovered"
                    :show-overlay-menu="showOverlayMenu"
                    :is-full-screen="isFullScreen"
                  />
                </template>
                <template #controls>
                  <CustomControls
                    v-show="isHovered"
                    :is-vertical="true"
                    :stream-url="content.video.stream_url"
                    :is-full-screen="isFullScreen"
                  />
                </template>
              </VideoDBPlayer>
            </div>
          </div>
          <div
            v-else-if="isMp4Url"
            class="vdb-c-relative"
            :class="isFullScreen ? 'vdb-c-h-screen vdb-c-w-screen' : ''"
          >
            <div v-if="mp4Error" class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-4 vdb-c-rounded-16 vdb-c-bg-gray-100 vdb-c-p-8">
              <p class="vdb-c-text-gray-600">Video link has expired</p>
            </div>
            <video
              v-else
              ref="mp4PlayerRef"
              class="vdb-c-rounded-16"
              :style="mp4VideoStyle"
              :src="content.video.stream_url"
              controls
              playsinline
              @loadedmetadata="handleMp4Metadata"
              @error="handleMp4Error"
            />
          </div>
          <VideoDBPlayer
            v-else
            ref="playerRef"
            :class="isFullScreen ? 'vdb-c-h-screen vdb-c-w-screen' : ''"
            :stream-url="content.video.stream_url"
            :default-controls="false"
            :default-overlay="false"
            @fullScreenChange="handleFullScreenChange"
            @mouseenter="isHovered = true"
            @mouseleave="isHovered = false"
          >
            <template #overlay>
              <CustomOverlay
                :video-name="content.video.name"
                :collection-name="content.video.collection_name"
                :stream-url="content.video.stream_url"
                :video-id="content.video.id"
                :collection-id="content.video.collection_id"
                :is-hovered="isHovered"
                :show-overlay-menu="showOverlayMenu"
                :is-full-screen="isFullScreen"
              />
            </template>
            <template #controls>
              <CustomControls
                v-show="isHovered"
                :is-vertical="false"
                :stream-url="content.video.stream_url"
                :is-full-screen="isFullScreen"
              />
            </template>
          </VideoDBPlayer>
        </div>
      </div>
      <div v-else-if="content.status === 'progress'">
        <div
          class="vdb-c-full xl:vdb-c-1/2 vdb-c-animate-pulse vdb-c-overflow-hidden vdb-c-rounded-20 sm:vdb-c-w-3/4 lg:vdb-c-w-3/5 xl:vdb-c-w-1/2"
        >
          <div class="vdb-c-relative vdb-c-w-full" :style="{ paddingTop: verticalPadding }">
            <div
              class="vdb-c-absolute vdb-c-inset-0 vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-bg-gray-200"
            ></div>
          </div>
        </div>
      </div>
      <div v-else-if="content.status === 'not_generated'" class="vdb-c-flex vdb-c-flex-col"></div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { VideoDBPlayer } from '@videodb/player-vue';
import '@videodb/player-vue/dist/style.css';
import CustomOverlay from './video-player/CustomOverlay.vue';
import CustomControls from './video-player/CustomControls.vue';
import LoadingMessage from './elements/LoadingMessage.vue';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  isLastConv: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  showOverlayMenu: {
    type: Boolean,
    default: true,
  },
  showLoading: {
    type: Boolean,
    default: true,
  },
});

const playerRef = ref(null);
const mp4PlayerRef = ref(null);
const isFullScreen = ref(false);
const isHovered = ref(false);
const mp4Error = ref(false);
const mp4IsVertical = ref(false);

const handleMp4Error = () => {
  mp4Error.value = true;
};

const handleMp4Metadata = (event) => {
  const video = event.target;
  mp4IsVertical.value = video.videoHeight > video.videoWidth;
};

const mp4VideoStyle = computed(() => {
  if (mp4IsVertical.value) {
    return {
      maxHeight: '40vh',
      width: 'auto',
      maxWidth: '100%',
    };
  }
  return {
    maxHeight: '40vh',
    width: '100%',
  };
});

const isVertical = computed(() => {
  return (
    !!(props?.content && props.content.video && props.content.video.style) &&
    String(props.content.video.style).toLowerCase() === 'vertical'
  );
});

const isMp4Url = computed(() => {
  const url = props?.content?.video?.stream_url || '';
  return url.includes('.mp4');
});

const verticalPadding = computed(() => (isVertical.value ? '177.78%' : '56.25%'));

const videoContainerClasses = computed(() => {
  if (isFullScreen.value) {
    return 'vdb-c-fixed vdb-c-inset-0 vdb-c-z-50 vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-overflow-y-hidden vdb-c-bg-black-64';
  }

  if (props.fullWidth) {
    return isVertical.value
      ? 'vdb-c-w-full vdb-c-aspect-[9/16] vdb-c-overflow-hidden vdb-c-rounded-16'
      : 'vdb-c-w-full vdb-c-overflow-hidden vdb-c-rounded-16';
  }

  return isVertical.value
    ? 'vdb-c-full xl:vdb-c-1/2 vdb-c-aspect-[9/16] vdb-c-overflow-hidden vdb-c-rounded-16 sm:vdb-c-h-[75vh] lg:vdb-c-h-[60vh] xl:vdb-c-h-[50vh]'
    : 'vdb-c-full xl:vdb-c-1/2 vdb-c-overflow-hidden vdb-c-rounded-16 sm:vdb-c-w-3/4 lg:vdb-c-w-3/5 xl:vdb-c-w-1/2';
});

// Trigger native browser fullscreen action
const handleFullScreenChange = async () => {
  try {
    const isNativeFullScreen = !!(document.fullscreenElement || document.webkitFullscreenElement);

    if (isNativeFullScreen) {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    } else {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    }
  } catch (err) {
    console.error('Fullscreen toggle failed', err);
  }
};

// Sync local state with browser event (Single Source of Truth)
const onFullScreenChange = () => {
  const isCurrentlyFullScreen = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
  isFullScreen.value = isCurrentlyFullScreen;
};

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullScreenChange);
  document.addEventListener('webkitfullscreenchange', onFullScreenChange);
  document.addEventListener('mozfullscreenchange', onFullScreenChange);
  document.addEventListener('MSFullscreenChange', onFullScreenChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFullScreenChange);
  document.removeEventListener('webkitfullscreenchange', onFullScreenChange);
  document.removeEventListener('mozfullscreenchange', onFullScreenChange);
  document.removeEventListener('MSFullscreenChange', onFullScreenChange);
});
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
