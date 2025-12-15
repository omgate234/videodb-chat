<template>
  <div
    class="vdb-c-absolute vdb-c-bottom-8 vdb-c-left-8 vdb-c-right-8 vdb-c-flex vdb-c-flex-col vdb-c-gap-4 vdb-c-px-1"
  >
    <!-- Progress Bar -->
    <div class="vdb-c-relative vdb-c-h-9 vdb-c-w-full">
      <ProgressBar :stream-url="streamUrl" />
    </div>

    <!-- Controls Container -->
    <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-4">
      <!-- Left: Play/Pause Button Container -->
      <div
        class="vdb-c-flex vdb-c-items-center vdb-c-rounded-full vdb-c-border-[0.656px] vdb-c-border-white-40 vdb-c-bg-[rgba(128,128,128,0.3)] vdb-c-p-2 vdb-c-backdrop-blur-[23.438px]"
        style="mix-blend-mode: luminosity; border-width: 0.656px"
      >
        <button
          class="vdb-c-flex vdb-c-size-[30px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[rgba(0,0,0,0.3)] vdb-c-transition-all hover:vdb-c-bg-[rgba(0,0,0,0.6)]"
          @click="togglePlay"
          :title="playing ? 'Pause' : 'Play'"
        >
          <PauseIcon v-if="playing" class="vdb-c-h-26 vdb-c-w-26" />
          <PlayIcon v-else class="vdb-c-h-26 vdb-c-w-26" />
        </button>
      </div>

      <!-- Middle: Volume and Time Container -->
      <div
        ref="volumeContainer"
        class="vdb-c-flex vdb-c-items-center vdb-c-gap-4 vdb-c-rounded-full vdb-c-border vdb-c-border-white-40 vdb-c-bg-[rgba(128,128,128,0.3)] vdb-c-p-4 vdb-c-backdrop-blur-[23.438px]"
        style="border-width: 0.656px"
      >
        <!-- Volume Control -->
        <!-- Collapsed: Button Only -->
        <button
          v-if="!showVolumeSlider"
          class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[rgba(0,0,0,0.3)] vdb-c-p-5 vdb-c-transition-all hover:vdb-c-bg-[rgba(0,0,0,0.6)]"
          @click.stop="showVolumeSlider = true"
          :title="videoMuted || volume === 0 ? 'Unmute' : 'Volume'"
        >
          <VolumeOffIcon v-if="videoMuted || volume === 0" />
          <VolumeOnIcon v-else />
        </button>

        <!-- Expanded: Icon + Slider -->
        <div
          v-else
          class="vdb-c-flex vdb-c-items-center vdb-c-gap-[2.5px] vdb-c-rounded-full vdb-c-bg-[rgba(0,0,0,0.6)] vdb-c-py-5 vdb-c-pl-5 vdb-c-pr-[12.5px]"
        >
          <!-- Icon Button -->
          <button
            @click.stop="handleMuteToggle"
            :title="videoMuted || volume === 0 ? 'Unmute' : 'Mute'"
            class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center"
          >
            <VolumeOffIcon v-if="videoMuted || volume === 0" />
            <VolumeOnIcon v-else />
          </button>

          <!-- Slider Container with relative positioning for internal elements only -->
          <div
            class="vdb-c-relative vdb-c-flex vdb-c-h-[9.375px] vdb-c-w-[62.5px] vdb-c-items-center"
          >
            <!-- Background Track -->
            <div
              class="vdb-c-absolute vdb-c-h-5 vdb-c-w-full vdb-c-rounded-full vdb-c-bg-[rgba(255,255,255,0.4)]"
            />

            <!-- Active Track -->
            <div
              class="vdb-c-absolute vdb-c-h-5 vdb-c-rounded-full vdb-c-bg-orange"
              :style="{
                width: `${displayVolume * 62.5}px`,
                mixBlendMode: 'normal',
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
              class="vdb-c-pointer-events-none vdb-c-absolute vdb-c-h-[7.5px] vdb-c-w-[7.5px] vdb-c-rounded-full vdb-c-bg-white vdb-c-shadow-[0px_0px_4px_rgba(236,91,22,0.6)]"
              :style="{ left: `${displayVolume * 62.5 - 3.75}px`, zIndex: 30 }"
            />
          </div>
        </div>

        <!-- Time Display -->
        <div
          class="vdb-c-flex vdb-c-h-30 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[rgba(0,0,0,0.3)] vdb-c-px-6"
        >
          <p
            class="vdb-c-whitespace-nowrap vdb-c-text-[10px] vdb-c-leading-normal vdb-c-text-white"
            style="text-shadow: #000000 0px 0px 0.714px"
          >
            <span class="vdb-c-font-medium">{{ currentTime }}</span>
            <span class="vdb-c-font-normal"> / {{ totalTime }}</span>
          </p>
        </div>
      </div>

      <!-- Spacer -->
      <div class="vdb-c-flex-grow" />

      <!-- Right: Full Screen Button Container -->
      <div
        v-if="!isVertical"
        class="vdb-c-flex vdb-c-items-center vdb-c-rounded-full vdb-c-border-[0.656px] vdb-c-border-white-40 vdb-c-bg-[rgba(128,128,128,0.3)] vdb-c-p-2 vdb-c-backdrop-blur-[23.438px]"
        style="mix-blend-mode: luminosity; border-width: 0.656px"
      >
        <!-- Full Screen Button -->
        <button
          class="vdb-c-flex vdb-c-size-[30px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[rgba(0,0,0,0.3)] vdb-c-transition-all hover:vdb-c-bg-[rgba(0,0,0,0.6)]"
          @click="toggleFullScreen"
          :title="props.isFullScreen ? 'Exit Full Screen' : 'Full Screen'"
        >
          <ExitFullScreenIcon v-if="props.isFullScreen" class="vdb-c-h-16-667 vdb-c-w-16-667" />
          <FullScreenIcon v-else class="vdb-c-h-16-667 vdb-c-w-16-667" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useVideoDBPlayer } from '@videodb/player-vue';
import { ProgressBar } from '@videodb/player-vue';
import PlayIcon from '../../chat/v2/icons/video-player/PlayIcon.vue';
import PauseIcon from '../../chat/v2/icons/video-player/PauseIcon.vue';
import VolumeOnIcon from '../../chat/v2/icons/video-player/VolumeOnIcon.vue';
import VolumeOffIcon from '../../chat/v2/icons/video-player/VolumeOffIcon.vue';
import FullScreenIcon from '../../chat/v2/icons/video-player/FullScreenIcon.vue';
import ExitFullScreenIcon from '../../chat/v2/icons/video-player/ExitFullScreenIcon.vue';

const props = defineProps({
  isVertical: {
    type: Boolean,
    default: false,
  },
  streamUrl: {
    type: String,
    default: '',
  },
  isFullScreen: {
    type: Boolean,
    default: false,
  },
});

const {
  playing,
  volume,
  videoMuted,
  time,
  duration,
  togglePlay,
  setVolume,
  toggleMute,
  toggleFullScreen,
} = useVideoDBPlayer();

const showVolumeSlider = ref(false);
const volumeContainer = ref(null);
const lastVolume = ref(0.5); // Store the volume before muting

const displayVolume = computed(() => {
  return volume.value;
});

const handleVolumeChange = (event) => {
  const newVolume = parseFloat(event.target.value);
  setVolume(newVolume);
  // Store this as the last known good volume
  if (newVolume > 0) {
    lastVolume.value = newVolume;
  }
  // Unmute if adjusting volume while muted
  if (newVolume > 0 && videoMuted.value) {
    toggleMute();
  }
};

const handleMuteToggle = () => {
  if (volume.value === 0 || videoMuted.value) {
    // Unmute: restore the last volume
    const volumeToRestore = lastVolume.value > 0 ? lastVolume.value : 0.5;
    setVolume(volumeToRestore);
    if (videoMuted.value) {
      toggleMute();
    }
  } else {
    // Mute: save current volume and set to 0
    lastVolume.value = volume.value;
    setVolume(0);
  }
};

const handleClickOutside = (event) => {
  if (volumeContainer.value && !volumeContainer.value.contains(event.target)) {
    showVolumeSlider.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const showHours = (duration) => Math.floor(duration / 3600) > 0;
const formatPadded = (number) => String(number).padStart(2, '0');
const formatDuration = (duration) => {
  const hrs = formatPadded(Math.floor(duration / 3600)) + ':';
  const mins = formatPadded(Math.floor((duration % 3600) / 60)) + ':';
  const secs = formatPadded(Math.floor(duration % 60));
  return `${showHours(duration) ? hrs : ''}${mins}${secs}`;
};

const currentTime = computed(() => formatDuration(time.value));
const totalTime = computed(() => formatDuration(duration.value));
</script>

<style scoped>
/* Hide default range input styling */
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
</style>
