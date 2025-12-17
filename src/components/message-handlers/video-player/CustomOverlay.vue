<template>
  <div class="vdb-c-absolute vdb-c-inset-0 vdb-c-flex vdb-c-flex-col">
    <!-- Gradient Overlay (shown on hover) -->
    <div
      :class="[
        'vdb-c-absolute vdb-c-inset-0 vdb-c-transition-opacity vdb-c-duration-300',
        showElements ? 'vdb-c-opacity-100' : 'vdb-c-opacity-0',
      ]"
      :style="{
        background:
          'linear-gradient(180deg, rgba(0, 0, 0, 0.70) -10.5%, rgba(0, 0, 0, 0.50) 112.72%)',
      }"
    ></div>

    <!-- Top Left: Video and Collection Name -->
    <div
      :class="[
        'vdb-c-absolute vdb-c-left-11 vdb-c-top-11 vdb-c-z-10 vdb-c-flex vdb-c-flex-col vdb-c-gap-2 vdb-c-px-6 vdb-c-transition-opacity vdb-c-duration-300',
        showElements ? 'vdb-c-opacity-100' : 'vdb-c-opacity-0',
      ]"
      style="border-left: 1px solid #c14103"
    >
      <div class="vdb-c-w-full vdb-c-overflow-hidden vdb-c-text-ellipsis vdb-c-whitespace-nowrap">
        <p
          v-if="videoName"
          class="vdb-c-text-13 vdb-c-overflow-hidden vdb-c-text-ellipsis vdb-c-whitespace-nowrap vdb-c-font-medium vdb-c-leading-normal vdb-c-text-white"
          style="max-width: 282px"
        >
          {{ videoName || 'Untitled Video' }}
        </p>
      </div>
      <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center">
        <p
          v-if="collectionName"
          class="vdb-c-text-12 vdb-c-whitespace-nowrap vdb-c-font-medium vdb-c-leading-normal vdb-c-text-[#969696]"
        >
          {{ collectionName || 'Unknown Collection' }}
        </p>
      </div>
    </div>

    <!-- Top Right: Copy Link and Menu -->
    <div
      v-if="showOverlayMenu"
      :class="[
        'vdb-c-absolute vdb-c-right-8 vdb-c-top-8 vdb-c-z-10 vdb-c-flex vdb-c-gap-4 vdb-c-rounded-full vdb-c-border vdb-c-border-white-40 vdb-c-bg-[rgba(128,128,128,0.3)] vdb-c-p-4 vdb-c-backdrop-blur-[23.438px] vdb-c-transition-opacity vdb-c-duration-300',
        showElements ? 'vdb-c-opacity-100' : 'vdb-c-opacity-0',
      ]"
      style="mix-blend-mode: luminosity; border-width: 0.656px"
    >
      <!-- Copy Link Button -->
      <button
        class="vdb-c-flex vdb-c-size-[30px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-p-5 vdb-c-transition-all"
        :class="[
          linkCopied
            ? 'vdb-c-bg-white'
            : 'vdb-c-bg-[rgba(0,0,0,0.3)] hover:vdb-c-bg-[rgba(0,0,0,0.6)]',
        ]"
        @click="copyVideoLink"
        :title="linkCopied ? 'Link Copied!' : 'Copy Link'"
      >
        <TickIcon v-if="linkCopied" class="vdb-c-h-20 vdb-c-w-20" />
        <CopyLinkIcon v-else class="vdb-c-h-20 vdb-c-w-20" />
      </button>

      <!-- Menu Button -->
      <div ref="menuButtonRef">
        <button
          class="vdb-c-flex vdb-c-size-[30px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[rgba(0,0,0,0.3)] vdb-c-p-5 vdb-c-transition-all hover:vdb-c-bg-[rgba(0,0,0,0.6)]"
          @click.stop="toggleMenu"
          title="Menu"
        >
          <MenuIcon class="vdb-c-h-16-667 vdb-c-w-16-667" />
        </button>
      </div>
    </div>

    <!-- Center Play/Pause Button -->
    <button
      :class="[
        'vdb-c-h-50 vdb-c-w-50 vdb-c-absolute vdb-c-left-1/2 vdb-c-top-1/2 vdb-c-z-10 vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-transition-opacity vdb-c-duration-300',
        showElements ? 'vdb-c-opacity-100' : 'vdb-c-opacity-0',
      ]"
      style="
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.12);
        border: 1.665px solid rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(13.318921089172363px);
      "
      @click="togglePlay"
    >
      <CenterPauseIcon v-if="playing" class="vdb-c-size-[17.5]" />
      <CenterPlayIcon v-else class="vdb-c-size-[17.5]" />
    </button>

    <!-- Dropdown Menu (Teleported) -->
    <Teleport to="body">
      <ul
        v-if="showMenu && menuPosition"
        class="menu-dropdown vdb-c-fixed vdb-c-z-[10000] vdb-c-w-[200px] vdb-c-min-w-[200px] vdb-c-cursor-pointer vdb-c-rounded-12 vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-white vdb-c-p-8 vdb-c-text-sm"
        :style="{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }"
      >
        <!-- Copy Asset ID (shown when videoId exists) -->
        <li
          v-if="videoId"
          class="menu-item vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-12 vdb-c-rounded-8 vdb-c-bg-[#efefef] vdb-c-px-12 vdb-c-py-8 vdb-c-text-sm vdb-c-font-[500] vdb-c-text-black hover:vdb-c-bg-[#efefef]"
          @click.stop="copyAssetId"
        >
          <CopyIcon class="vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0" />
          <span class="vdb-c-flex-shrink-0">Copy Asset ID</span>
        </li>

        <!-- Add to Collection (shown when videoId doesn't exist) -->
        <li
          v-if="!videoId"
          class="menu-item vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-12 vdb-c-rounded-8 vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-sm vdb-c-font-[500] vdb-c-text-black hover:vdb-c-bg-[#efefef]"
          @click.stop="handleAddToCollection"
        >
          <FolderIcon class="vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0" stroke-color="#1E1E1E" />
          <span class="vdb-c-flex-shrink-0">Add to collection</span>
        </li>

        <!-- Download -->
        <li
          class="menu-item vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-12 vdb-c-rounded-8 vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-sm vdb-c-font-[500] vdb-c-text-black hover:vdb-c-bg-[#efefef]"
          @click.stop="handleDownload"
        >
          <DownloadIcon class="vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0" />
          <span class="vdb-c-flex-shrink-0">Download</span>
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject, nextTick } from 'vue';
import { useVideoDBPlayer } from '@videodb/player-vue';
import CenterPlayIcon from '../../chat/v2/icons/video-player/CenterPlayIcon.vue';
import CenterPauseIcon from '../../chat/v2/icons/video-player/CenterPauseIcon.vue';
import CopyLinkIcon from '../../chat/v2/icons/video-player/CopyLinkIcon.vue';
import MenuIcon from '../../chat/v2/icons/video-player/MenuIcon.vue';
import TickIcon from '../../chat/v2/icons/video-player/TickIcon.vue';
import CopyIcon from '../../chat/v2/icons/CopyIcon.vue';
import FolderIcon from '../../chat/v2/icons/FolderIcon.vue';
import DownloadIcon from '../../chat/v2/icons/DownloadIcon.vue';

const props = defineProps({
  videoName: {
    type: String,
    default: '',
  },
  collectionName: {
    type: String,
    default: '',
  },
  streamUrl: {
    type: String,
    default: '',
  },
  videoId: {
    type: String,
    default: null,
  },
  collectionId: {
    type: String,
    default: null,
  },
  isHovered: {
    type: Boolean,
    default: false,
  },
  showOverlayMenu: {
    type: Boolean,
    default: true,
  },
});

const { playing, togglePlay, showElements } = useVideoDBPlayer();
const linkCopied = ref(false);
const showMenu = ref(false);
const menuButtonRef = ref(null);
const menuPosition = ref(null);

const context = inject('videodb-chat-context');
const handleUpload = context?.handleUpload;
const getVideoDownloadUrl = context?.getVideoDownloadUrl;
const getDownloadUrlFromStream = context?.getDownloadUrlFromStream;
const activeCollectionData = context?.activeCollectionData;

const copyVideoLink = async () => {
  try {
    const link = `https://console.videodb.io/player?url=${encodeURIComponent(props.streamUrl)}`;
    await navigator.clipboard.writeText(link);
    linkCopied.value = true;
    setTimeout(() => {
      linkCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy link:', err);
  }
};

const toggleMenu = async () => {
  showMenu.value = !showMenu.value;
  if (showMenu.value && menuButtonRef.value) {
    await nextTick();
    const rect = menuButtonRef.value.getBoundingClientRect();
    menuPosition.value = {
      top: rect.bottom + 8,
      left: rect.left,
    };
  }
};

const copyAssetId = async () => {
  if (!props.videoId) return;
  try {
    await navigator.clipboard.writeText(props.videoId);
    showMenu.value = false;
  } catch (err) {
    console.error('Failed to copy asset ID:', err);
  }
};

const handleAddToCollection = async () => {
  if (!handleUpload || !props.streamUrl) {
    console.error('handleUpload or streamUrl not available');
    showMenu.value = false;
    return;
  }

  try {
    const collectionId = activeCollectionData?.value?.id || props.collectionId;
    if (!collectionId) {
      console.error('No collection ID available');
      showMenu.value = false;
      return;
    }

    await handleUpload({
      source: { url: props.streamUrl },
      sourceType: 'url',
      collectionId: collectionId,
      mediaType: 'video',
    });
    showMenu.value = false;
  } catch (err) {
    console.error('Failed to add to collection:', err);
    showMenu.value = false;
  }
};

const handleDownload = async () => {
  showMenu.value = false;

  if (getVideoDownloadUrl && props.videoId && props.collectionId) {
    try {
      const result = await getVideoDownloadUrl(props.collectionId, props.videoId);
      if (result?.data && result?.data?.download_url) {
        const link = document.createElement('a');
        link.href = result.data.download_url;
        link.download = `${props.videoName || 'video'}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('No download URL received');
      }
      return;
    } catch (error) {
      console.error('Error downloading video:', error);
      return;
    }
  }

  if (!getDownloadUrlFromStream || !props.streamUrl) {
    console.error('Download not available - missing streamUrl or download function');
    return;
  }

  try {
    const result = await getDownloadUrlFromStream(props.streamUrl, props.videoName);
    if (result?.status === 'success' && result?.data?.download_url) {
      const link = document.createElement('a');
      link.href = result.data.download_url;
      link.download = `${props.videoName || 'video'}.mp4`;
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

const handleClickOutside = (event) => {
  if (menuButtonRef.value && !menuButtonRef.value.contains(event.target)) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.vdb-c-text-13 {
  font-size: 13px;
}

.vdb-c-text-12 {
  font-size: 12px;
}

.vdb-c-h-52 {
  height: 52px;
}

.vdb-c-w-52 {
  width: 52px;
}

.vdb-c-h-50 {
  height: 50px;
}

.vdb-c-w-50 {
  width: 50px;
}

.vdb-c-h-20 {
  height: 20px;
}

.vdb-c-w-20 {
  width: 20px;
}

.vdb-c-h-16-667 {
  height: 16.667px;
}

.vdb-c-w-16-667 {
  width: 16.667px;
}

.vdb-c-left-11 {
  left: 11px;
}

.vdb-c-top-11 {
  top: 11px;
}

.vdb-c-border-white-40 {
  border-color: rgba(255, 255, 255, 0.4);
}

.menu-dropdown {
  box-shadow:
    0px 5px 11px rgba(0, 0, 0, 0.06),
    0px 21px 21px rgba(0, 0, 0, 0.05),
    0px 47px 28px rgba(0, 0, 0, 0.03),
    0px 83px 33px rgba(0, 0, 0, 0.01),
    0px 130px 36px rgba(0, 0, 0, 0);
}
</style>
