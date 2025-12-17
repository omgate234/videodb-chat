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
        v-if="content.status === 'success' && content.audio?.audio_url"
        class="vdb-c-w-full vdb-c-py-6"
      >
        <div
          class="vdb-c-flex vdb-c-w-[564px] vdb-c-flex-col vdb-c-gap-[20px] vdb-c-rounded-16 vdb-c-border-2 vdb-c-border-[#e9e9e9] vdb-c-bg-[#efefef] vdb-c-p-16 vdb-c-pt-20"
        >
          <!-- Title -->
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[2px]">
            <p
              class="vdb-c-overflow-hidden vdb-c-text-ellipsis vdb-c-whitespace-nowrap vdb-c-text-[14px] vdb-c-font-semibold vdb-c-leading-normal vdb-c-text-[#1e1e1e]"
            >
              {{ audioTitle }}
            </p>
          </div>

          <!-- Container for Timeline and Controls -->
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[10px]">
            <!-- Progress Bar / Timeline -->
            <div class="vdb-c-relative vdb-c-h-[3px] vdb-c-w-full">
              <!-- Background Track -->
              <div
                class="vdb-c-absolute vdb-c-inset-0 vdb-c-h-full vdb-c-w-full vdb-c-rounded-full vdb-c-bg-vdb-darkishgrey vdb-c-opacity-20 vdb-c-backdrop-blur-[4.6px]"
              />
              <!-- Active Track -->
              <div
                class="vdb-c-absolute vdb-c-h-full vdb-c-rounded-full vdb-c-bg-vdb-orange"
                :style="{ width: `${progressPercentage}%` }"
              />
              <!-- Scrubber -->
              <div
                class="vdb-c-absolute vdb-c-size-[10px] vdb-c-translate-y-[-50%] vdb-c-rounded-full vdb-c-bg-vdb-orange vdb-c-outline vdb-c-outline-1 vdb-c-outline-white vdb-c-backdrop-blur-[4.6px]"
                :style="{ left: `calc(${progressPercentage}% - 6px)`, top: '50%' }"
              />
              <!-- Input Range (transparent overlay) -->
              <input
                type="range"
                min="0"
                :max="duration || 0"
                :value="currentTime"
                @input="handleSeek"
                @click.stop
                class="vdb-c-absolute vdb-c-inset-0 vdb-c-h-full vdb-c-w-full vdb-c-cursor-pointer"
                style="z-index: 10"
              />
            </div>

            <!-- Controls Row -->
            <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-2">
              <!-- Left: Time Stamp and Volume -->
              <div class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center vdb-c-gap-8">
                <!-- Time Stamp -->
                <div
                  class="vdb-c-flex vdb-c-h-[32px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[32.143px] vdb-c-border-[1.071px] vdb-c-border-white vdb-c-bg-white vdb-c-px-[10px] vdb-c-py-[6px]"
                >
                  <p
                    class="vdb-c-whitespace-nowrap vdb-c-text-[13px] vdb-c-leading-[20px] vdb-c-text-[#1e1e1e]"
                  >
                    <span class="vdb-c-font-medium">{{ formattedCurrentTime }}</span>
                    <span class="vdb-c-font-normal"> : {{ formattedDuration }}</span>
                  </p>
                </div>

                <!-- Volume Control -->
                <div ref="volumeContainer" class="vdb-c-relative vdb-c-flex vdb-c-items-center">
                  <!-- Collapsed: Button Only -->
                  <button
                    v-if="!showVolumeSlider"
                    class="vdb-c-flex vdb-c-h-[32px] vdb-c-w-[32px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[32.143px] vdb-c-border-[1.071px] vdb-c-border-white vdb-c-bg-white vdb-c-p-[6px] vdb-c-transition-all hover:vdb-c-border-[#E6E6E6] hover:vdb-c-bg-vdb-lightgrey"
                    @click.stop="showVolumeSlider = true"
                    :title="isMuted || volume === 0 ? 'Unmute' : 'Volume'"
                  >
                    <VolumeOffIcon v-if="isMuted || volume === 0" />
                    <VolumeOnIcon v-else />
                  </button>

                  <!-- Expanded: Icon + Slider -->
                  <div
                    v-else
                    class="vdb-c-flex vdb-c-h-[32px] vdb-c-items-center vdb-c-gap-[4px] vdb-c-rounded-[32.143px] vdb-c-border-[1.071px] vdb-c-border-[#E6E6E6] vdb-c-bg-white vdb-c-py-[6px] vdb-c-pl-[6px] vdb-c-pr-[12.5px]"
                  >
                    <!-- Icon Button -->
                    <button
                      @click.stop="handleMuteToggle"
                      :title="isMuted || volume === 0 ? 'Unmute' : 'Mute'"
                      class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center"
                    >
                      <VolumeOffIcon v-if="isMuted || volume === 0" />
                      <VolumeOnIcon v-else />
                    </button>

                    <!-- Slider Container -->
                    <div
                      class="vdb-c-relative vdb-c-flex vdb-c-h-[9.375px] vdb-c-w-[50px] vdb-c-items-center"
                    >
                      <!-- Background Track -->
                      <div
                        class="vdb-c-absolute vdb-c-h-[2px] vdb-c-w-full vdb-c-rounded-full vdb-c-bg-[rgba(30,30,30,0.2)]"
                      />

                      <!-- Active Track -->
                      <div
                        class="vdb-c-absolute vdb-c-h-[2px] vdb-c-rounded-full vdb-c-bg-[#EC5B16]"
                        :style="{
                          width: `${displayVolume * 50}px`,
                        }"
                      />

                      <!-- Input Range (transparent overlay) -->
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        :value="displayVolume"
                        @input="handleVolumeChange"
                        @click.stop
                        class="vdb-c-h-full vdb-c-w-full vdb-c-cursor-pointer"
                        style="position: relative; z-index: 20"
                      />

                      <!-- Scrubber -->
                      <div
                        class="vdb-c-pointer-events-none vdb-c-absolute vdb-c-h-[8px] vdb-c-w-[8px] vdb-c-rounded-full vdb-c-bg-[#EC5B16] vdb-c-outline vdb-c-outline-1 vdb-c-outline-white vdb-c-backdrop-blur-[4.6px]"
                        :style="{ left: `${displayVolume * 50 - 4}px`, zIndex: 30 }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Center: Play Controls -->
              <div
                class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center vdb-c-justify-center vdb-c-gap-8 vdb-c-rounded-[46.875px] vdb-c-backdrop-blur-[23.438px]"
              >
                <!-- Rewind 10s -->
                <button
                  class="vdb-c-flex vdb-c-h-[32px] vdb-c-w-[32px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[37.5px] vdb-c-border-[0.446px] vdb-c-border-white vdb-c-bg-white vdb-c-p-[6px] vdb-c-transition-all hover:vdb-c-border-[#E6E6E6] hover:vdb-c-bg-vdb-lightgrey"
                  @click="rewind10"
                  title="Rewind 10 seconds"
                >
                  <Rewind10Icon />
                </button>

                <!-- Play/Pause Button (Orange) -->
                <button
                  class="vdb-c-flex vdb-c-h-[36px] vdb-c-w-[36px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[#ec5b16] vdb-c-p-[6px] vdb-c-transition-all hover:vdb-c-opacity-90"
                  @click="togglePlay"
                  :title="isPlaying ? 'Pause' : 'Play'"
                >
                  <PauseIcon v-if="isPlaying" />
                  <PlayIcon v-else />
                </button>

                <!-- Forward 10s -->
                <button
                  class="vdb-c-flex vdb-c-h-[32px] vdb-c-w-[32px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[37.5px] vdb-c-border-[0.446px] vdb-c-border-white vdb-c-bg-white vdb-c-p-[6px] vdb-c-transition-all hover:vdb-c-border-[#E6E6E6] hover:vdb-c-bg-vdb-lightgrey"
                  @click="forward10"
                  title="Forward 10 seconds"
                >
                  <Forward10Icon />
                </button>
              </div>

              <!-- Right: Copy Link and Options -->
              <div class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center vdb-c-justify-end vdb-c-gap-2">
                <!-- Copy Link Button -->
                <button
                  class="vdb-c-flex vdb-c-h-[32px] vdb-c-w-[32px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[32.143px] vdb-c-border vdb-c-p-[6px] vdb-c-transition-all"
                  :class="[
                    linkCopied
                      ? 'vdb-c-bg-black'
                      : 'vdb-c-bg-white hover:vdb-c-border-[#E6E6E6] hover:vdb-c-bg-vdb-lightgrey',
                  ]"
                  @click="copyAudioLink"
                  :title="linkCopied ? 'Link Copied!' : 'Copy Link'"
                >
                  <TickIcon v-if="linkCopied" />
                  <CopyLinkIcon v-else />
                </button>

                <!-- Options Button (Three Dots) -->
                <div ref="menuButtonRef">
                  <button
                    class="vdb-c-flex vdb-c-h-[32px] vdb-c-w-[32px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[32.143px] vdb-c-border-[1.071px] vdb-c-border-[#efefef] vdb-c-bg-white vdb-c-p-[6px] vdb-c-transition-all hover:vdb-c-border-[#E6E6E6] hover:vdb-c-bg-vdb-lightgrey"
                    @click.stop="toggleMenu"
                    title="Options"
                  >
                    <ThreeDotsIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Hidden Audio Element -->
          <audio
            ref="audioRef"
            :src="audioUrl"
            @loadedmetadata="handleLoadedMetadata"
            @timeupdate="handleTimeUpdate"
            @ended="handleEnded"
            @play="isPlaying = true"
            @pause="isPlaying = false"
          />
        </div>

        <!-- Voice and Text Details -->
        <div
          v-if="audioVoiceName || audioText"
          class="vdb-c-mt-20 vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-[6px] vdb-c-text-[13px] vdb-c-leading-[1.5] vdb-c-text-[#1e1e1e]"
        >
          <p v-if="audioVoiceName" class="vdb-c-w-full">
            <span class="vdb-c-font-semibold">Voice:&nbsp;</span>
            <span class="vdb-c-font-normal"> {{ audioVoiceName }}</span>
          </p>
          <p v-if="audioText" class="vdb-c-w-full">
            <span class="vdb-c-font-bold">Text:&nbsp;</span>
            <span class="vdb-c-font-normal"> {{ audioText }}</span>
          </p>
        </div>
      </div>
      <div v-else-if="content.status === 'progress'">
        <div
          class="vdb-c-w-[564px] vdb-c-animate-pulse vdb-c-overflow-hidden vdb-c-rounded-16 vdb-c-border-2 vdb-c-border-[#e9e9e9] vdb-c-bg-[#efefef] vdb-c-p-16 vdb-c-pt-20"
        >
          <div class="vdb-c-h-[100px] vdb-c-w-full vdb-c-rounded-8 vdb-c-bg-gray-200"></div>
        </div>
      </div>
      <div v-else-if="content.status === 'not_generated'" class="vdb-c-flex vdb-c-flex-col"></div>
    </transition>

    <!-- Dropdown Menu (Teleported) -->
    <Teleport to="body">
      <ul
        v-if="showMenu && menuPosition"
        class="menu-dropdown vdb-c-fixed vdb-c-z-[10000] vdb-c-w-[200px] vdb-c-min-w-[200px] vdb-c-cursor-pointer vdb-c-rounded-12 vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-white vdb-c-p-8 vdb-c-text-sm"
        :style="{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }"
      >
        <!-- Copy Asset ID (shown when audioId exists) -->
        <li
          v-if="audioId"
          class="menu-item vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-12 vdb-c-rounded-8 vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-sm vdb-c-font-[500] vdb-c-text-black hover:vdb-c-bg-[#efefef]"
          @click.stop="copyAssetId"
        >
          <CopyIcon class="vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0" />
          <span class="vdb-c-flex-shrink-0">Copy Asset ID</span>
        </li>

        <!-- Add to Collection (shown when audioId doesn't exist) -->
        <li
          v-if="!audioId"
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
import { ref, computed, onMounted, onBeforeUnmount, watch, inject, nextTick } from 'vue';
import PlayIcon from '../chat/v2/icons/audio-player/PlayIcon.vue';
import PauseIcon from '../chat/v2/icons/audio-player/PauseIcon.vue';
import VolumeOnIcon from '../chat/v2/icons/audio-player/VolumeOnIcon.vue';
import VolumeOffIcon from '../chat/v2/icons/audio-player/VolumeOffIcon.vue';
import Rewind10Icon from '../chat/v2/icons/audio-player/Rewind10Icon.vue';
import Forward10Icon from '../chat/v2/icons/audio-player/Forward10Icon.vue';
import CopyLinkIcon from '../chat/v2/icons/audio-player/CopyLinkIcon.vue';
import ThreeDotsIcon from '../chat/v2/icons/audio-player/ThreeDotsIcon.vue';
import TickIcon from '../chat/v2/icons/audio-player/TickIcon.vue';
import CopyIcon from '../chat/v2/icons/CopyIcon.vue';
import FolderIcon from '../chat/v2/icons/FolderIcon.vue';
import DownloadIcon from '../chat/v2/icons/DownloadIcon.vue';
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
});

const context = inject('videodb-chat-context');
const handleUpload = context?.handleUpload;
const activeCollectionData = context?.activeCollectionData;
const generateAudioUrl = context?.generateAudioUrl;

const audioRef = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0.5);
const isMuted = ref(false);
const showVolumeSlider = ref(false);
const volumeContainer = ref(null);
const lastVolume = ref(0.5);
const linkCopied = ref(false);
const showMenu = ref(false);
const menuButtonRef = ref(null);
const menuPosition = ref(null);
const fetchedAudioUrl = ref(null);
const isFetchingUrl = ref(false);

const audioUrl = computed(() => {
  if (fetchedAudioUrl.value) {
    return fetchedAudioUrl.value;
  }
  return props.content?.audio?.audio_url || '';
});

const audioTitle = computed(() => {
  return props.content?.audio?.name || 'Audio Track';
});

const audioText = computed(() => {
  return props.content?.audio?.text || null;
});

const audioVoiceName = computed(() => {
  return props.content?.audio?.voice_name || null;
});

const audioId = computed(() => {
  return props.content?.audio?.id || null;
});

const collectionId = computed(() => {
  return props.content?.audio?.collection_id || null;
});

const progressPercentage = computed(() => {
  if (!duration.value) return 0;
  return (currentTime.value / duration.value) * 100;
});

const displayVolume = computed(() => {
  return volume.value;
});

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const formatPadded = (num) => String(num).padStart(2, '0');
  if (hrs > 0) {
    return `${hrs}:${formatPadded(mins)}:${formatPadded(secs)}`;
  }
  return `${mins}:${formatPadded(secs)}`;
};

const formattedCurrentTime = computed(() => formatDuration(currentTime.value));
const formattedDuration = computed(() => formatDuration(duration.value));

const togglePlay = () => {
  if (!audioRef.value) return;
  if (isPlaying.value) {
    audioRef.value.pause();
  } else {
    audioRef.value.play();
  }
};

const rewind10 = () => {
  if (!audioRef.value) return;
  audioRef.value.currentTime = Math.max(0, audioRef.value.currentTime - 10);
};

const forward10 = () => {
  if (!audioRef.value) return;
  audioRef.value.currentTime = Math.min(duration.value, audioRef.value.currentTime + 10);
};

const handleSeek = (event) => {
  if (!audioRef.value) return;
  const newTime = parseFloat(event.target.value);
  audioRef.value.currentTime = newTime;
  currentTime.value = newTime;
};

const handleLoadedMetadata = () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration;
    audioRef.value.volume = volume.value;
  }
};

const handleTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime;
  }
};

const handleEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
};

const handleVolumeChange = (event) => {
  const newVolume = parseFloat(event.target.value);
  volume.value = newVolume;
  if (audioRef.value) {
    audioRef.value.volume = newVolume;
    audioRef.value.muted = false;
    isMuted.value = false;
  }
  if (newVolume > 0) {
    lastVolume.value = newVolume;
  }
};

const handleMuteToggle = () => {
  if (!audioRef.value) return;
  if (volume.value === 0 || isMuted.value) {
    const volumeToRestore = lastVolume.value > 0 ? lastVolume.value : 0.5;
    volume.value = volumeToRestore;
    audioRef.value.volume = volumeToRestore;
    audioRef.value.muted = false;
    isMuted.value = false;
  } else {
    lastVolume.value = volume.value;
    volume.value = 0;
    audioRef.value.muted = true;
    isMuted.value = true;
  }
};

const copyAudioLink = async () => {
  try {
    const link = audioUrl.value || window.location.href;
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
  if (!audioId.value) return;
  try {
    await navigator.clipboard.writeText(audioId.value);
    showMenu.value = false;
  } catch (err) {
    console.error('Failed to copy asset ID:', err);
  }
};

const handleAddToCollection = async () => {
  if (!handleUpload || !audioUrl.value) {
    console.error('handleUpload or audioUrl not available');
    showMenu.value = false;
    return;
  }

  try {
    const targetCollectionId = activeCollectionData?.value?.id || collectionId.value;
    if (!targetCollectionId) {
      console.error('No collection ID available');
      showMenu.value = false;
      return;
    }

    await handleUpload({
      source: { url: audioUrl.value },
      sourceType: 'url',
      collectionId: targetCollectionId,
      mediaType: 'audio',
    });
    showMenu.value = false;
  } catch (err) {
    console.error('Failed to add to collection:', err);
    showMenu.value = false;
  }
};

const handleDownload = async () => {
  if (!audioUrl.value) {
    console.error('Download not available - missing audioUrl');
    showMenu.value = false;
    return;
  }

  try {
    const link = document.createElement('a');
    link.href = audioUrl.value;
    link.download = `${audioTitle.value || 'audio'}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMenu.value = false;
  } catch (error) {
    console.error('Error downloading audio:', error);
    showMenu.value = false;
  }
};

const handleClickOutside = (event) => {
  if (volumeContainer.value && !volumeContainer.value.contains(event.target)) {
    showVolumeSlider.value = false;
  }
  if (menuButtonRef.value && !menuButtonRef.value.contains(event.target)) {
    showMenu.value = false;
  }
};

const fetchAudioUrl = async () => {
  if (isFetchingUrl.value) return;

  const audioIdValue = audioId.value;
  const collectionIdValue = collectionId.value;

  // Always fetch a fresh URL because existing URLs can expire (signed URLs with expiration)
  if (generateAudioUrl && audioIdValue && collectionIdValue) {
    isFetchingUrl.value = true;
    try {
      const result = await generateAudioUrl(collectionIdValue, audioIdValue);
      fetchedAudioUrl.value = result?.url || null;
    } catch (error) {
      console.error('Error fetching audio URL:', error);
    } finally {
      isFetchingUrl.value = false;
    }
  }
};

watch(audioUrl, (newUrl) => {
  if (audioRef.value && newUrl) {
    audioRef.value.load();
    currentTime.value = 0;
    isPlaying.value = false;
  }
});

// Watch for changes in audioId or collectionId to refetch
watch(
  [audioId, collectionId],
  () => {
    fetchAudioUrl();
  },
  { immediate: true }
);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  if (audioRef.value) {
    audioRef.value.volume = volume.value;
  }
  fetchAudioUrl();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  if (audioRef.value) {
    audioRef.value.pause();
  }
});
</script>

<style scoped>
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0;
  height: 0;
  opacity: 0;
}

input[type='range']::-moz-range-thumb {
  width: 0;
  height: 0;
  opacity: 0;
  border: none;
}

.menu-dropdown {
  box-shadow:
    0px 5px 11px rgba(0, 0, 0, 0.06),
    0px 21px 21px rgba(0, 0, 0, 0.05),
    0px 47px 28px rgba(0, 0, 0, 0.03),
    0px 83px 33px rgba(0, 0, 0, 0.01),
    0px 130px 36px rgba(0, 0, 0, 0);
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
