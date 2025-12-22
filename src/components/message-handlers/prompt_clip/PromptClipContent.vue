<template>
  <div class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-0 vdb-c-px-16">
    <ChatVideo :key="videoContent.video.stream_url" :content="videoContent" />
    <div
      class="vdb-c-flex vdb-c-w-full vdb-c-max-w-[574px] vdb-c-flex-col vdb-c-items-start vdb-c-overflow-hidden vdb-c-rounded-16 vdb-c-border vdb-c-border-roy vdb-c-bg-vdb-lightgrey"
    >
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-shrink-0 vdb-c-items-center vdb-c-px-16 vdb-c-py-10"
      >
        <div class="vdb-c-min-w-0 vdb-c-flex vdb-c-grow vdb-c-items-center vdb-c-gap-12">
          <p
            class="vdb-c-min-w-0 vdb-c-grow vdb-c-text-body vdb-c-font-medium vdb-c-text-vdb-darkishgrey"
          >
            Refine this video clip
          </p>
          <div class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-center vdb-c-gap-8">
            <button
              :class="[
                'vdb-c-flex vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-gap-4 vdb-c-rounded-8 vdb-c-border vdb-c-py-[8px] vdb-c-pl-[8px] vdb-c-pr-[12px] vdb-c-transition-all',
                activeTab === 'reorder'
                  ? 'vdb-c-border-vdb-orange vdb-c-bg-[#FFF6F4]'
                  : 'vdb-c-border-roy vdb-c-bg-white hover:vdb-c-border-[#B9B9B9] hover:vdb-c-bg-roy',
              ]"
              @click="
                activeTab = activeTab === 'reorder' ? null : 'reorder';
                activeClipIndex = null;
                isCustomSelected = false;
                selectedPreset = null;
              "
            >
              <ReorderIcon
                class="vdb-c-h-20 vdb-c-w-20 vdb-c-shrink-0"
                :fill="activeTab === 'reorder' ? '#EC5B16' : '#1E1E1E'"
              />
              <span
                :class="[
                  'vdb-c-shrink-0 vdb-c-whitespace-nowrap vdb-c-text-center vdb-c-text-body vdb-c-font-medium vdb-c-leading-[20px]',
                  activeTab === 'reorder' ? 'vdb-c-text-vdb-orange' : 'vdb-c-text-black',
                ]"
              >
                Reorder clips
              </span>
            </button>
            <button
              :class="[
                'vdb-c-flex vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-gap-4 vdb-c-rounded-8 vdb-c-border vdb-c-px-[13px] vdb-c-py-[8px] vdb-c-transition-all',
                activeTab === 'aspectRatio'
                  ? 'vdb-c-border-vdb-orange vdb-c-bg-[#FFF6F4]'
                  : 'vdb-c-border-roy vdb-c-bg-white hover:vdb-c-border-[#B9B9B9] hover:vdb-c-bg-roy',
              ]"
              @click="
                activeTab = activeTab === 'aspectRatio' ? null : 'aspectRatio';
                activeClipIndex = null;
                isCustomSelected = false;
                selectedPreset = null;
              "
            >
              <AspectRatio
                class="vdb-c-h-20 vdb-c-w-20 vdb-c-shrink-0"
                :fill="activeTab === 'aspectRatio' ? '#EC5B16' : '#1E1E1E'"
              />
              <span
                :class="[
                  'vdb-c-shrink-0 vdb-c-whitespace-nowrap vdb-c-text-center vdb-c-text-body vdb-c-font-medium vdb-c-leading-[20px]',
                  activeTab === 'aspectRatio' ? 'vdb-c-text-vdb-orange' : 'vdb-c-text-black',
                ]"
              >
                Change aspect ratio
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="activeTab === 'reorder'"
      class="vdb-c-w-full vdb-c-max-w-[780px] vdb-c-pb-16 vdb-c-pt-16"
    >
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-12 vdb-c-rounded-12 vdb-c-bg-vdb-lightgrey vdb-c-p-16"
      >
        <div
          v-for="(clip, index) in localClips"
          :key="index"
          class="vdb-c-flex vdb-c-w-full vdb-c-shrink-0 vdb-c-flex-col vdb-c-items-start"
        >
          <div
            :class="[
              'vdb-c-flex vdb-c-w-full vdb-c-cursor-pointer vdb-c-items-center vdb-c-rounded-10 vdb-c-border vdb-c-p-12 vdb-c-transition-all',
              activeClipIndex === index
                ? 'vdb-c-border-vdb-orange vdb-c-bg-[#FFE9D3]'
                : 'vdb-c-border-roy vdb-c-bg-white',
            ]"
            @click="activeClipIndex = index"
          >
            <div
              class="vdb-c-min-w-0 vdb-c-flex vdb-c-shrink-0 vdb-c-grow vdb-c-items-center vdb-c-gap-12"
            >
              <div
                class="vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-border vdb-c-border-roy vdb-c-bg-vdb-darkishgrey vdb-c-p-6"
              >
                <span
                  class="vdb-c-whitespace-nowrap vdb-c-text-[14px] vdb-c-leading-normal vdb-c-text-white"
                >
                  {{ index + 1 }}
                </span>
              </div>
              <div
                class="vdb-c-relative vdb-c-h-40 vdb-c-w-[71px] vdb-c-shrink-0 vdb-c-rounded-[5px]"
              >
                <img
                  v-if="clip.thumbnail_url"
                  :src="clip.thumbnail_url"
                  :alt="clip.text"
                  class="vdb-c-pointer-events-none vdb-c-absolute vdb-c-inset-0 vdb-c-h-full vdb-c-w-full vdb-c-rounded-[5px] vdb-c-object-cover"
                />
              </div>
              <div
                class="vdb-c-min-w-0 vdb-c-flex vdb-c-shrink-0 vdb-c-grow vdb-c-flex-col vdb-c-items-start vdb-c-gap-2 vdb-c-overflow-hidden"
              >
                <p
                  class="vdb-c-w-full vdb-c-overflow-hidden vdb-c-text-ellipsis vdb-c-whitespace-nowrap vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-vdb-darkishgrey"
                >
                  {{ truncateText(clip.text) }}
                </p>
                <p
                  class="vdb-c-w-full vdb-c-text-[11px] vdb-c-font-normal vdb-c-leading-normal vdb-c-text-pam"
                >
                  {{ formatTime(clip.start) }} - {{ formatTime(clip.end) }}
                </p>
              </div>
            </div>
            <div
              class="vdb-c-flex vdb-c-shrink-0 vdb-c-flex-col vdb-c-items-start vdb-c-justify-center vdb-c-gap-10"
            >
              <button
                :disabled="index === 0"
                :class="[
                  'vdb-c-relative vdb-c-flex vdb-c-h-30 vdb-c-w-30 vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[66px] vdb-c-transition-all',
                  index !== 0
                    ? 'vdb-c-cursor-pointer hover:vdb-c-bg-[rgba(130,31,12,0.10)]'
                    : 'vdb-c-cursor-not-allowed vdb-c-opacity-50',
                ]"
                @click.stop="moveClipUp(index)"
              >
                <ChevronUp
                  class="vdb-c-h-30 vdb-c-w-30"
                  :fill="index !== 0 ? '#821F0C' : '#969696'"
                />
              </button>
              <button
                :disabled="index === localClips.length - 1"
                :class="[
                  'vdb-c-relative vdb-c-flex vdb-c-h-30 vdb-c-w-30 vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[66px] vdb-c-transition-all',
                  index !== localClips.length - 1
                    ? 'vdb-c-cursor-pointer hover:vdb-c-bg-[rgba(130,31,12,0.10)]'
                    : 'vdb-c-cursor-not-allowed vdb-c-opacity-50',
                ]"
                @click.stop="moveClipDown(index)"
              >
                <ChevronUp
                  class="vdb-c-h-30 vdb-c-w-30"
                  style="transform: rotate(180deg)"
                  :fill="index !== localClips.length - 1 ? '#821F0C' : '#969696'"
                />
              </button>
            </div>
          </div>
        </div>
        <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-end">
          <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
            <SecondaryButton @click="handleCancel" :disabled="isSubmitting">Cancel</SecondaryButton>
            <PrimaryButton @click="handleRegenerateVideo" :disabled="isSubmitting">
              {{ isSubmitting ? 'Regenerating...' : 'Regenerate video' }}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="activeTab === 'aspectRatio'"
      class="vdb-c-w-full vdb-c-px-16 vdb-c-pb-16 vdb-c-pt-16"
    >
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-20 vdb-c-rounded-16 vdb-c-border vdb-c-border-roy vdb-c-bg-vdb-lightgrey vdb-c-p-16"
      >
        <p
          class="vdb-c-w-full vdb-c-text-[14px] vdb-c-font-semibold vdb-c-leading-[24px] vdb-c-text-vdb-darkishgrey"
        >
          Select the new aspect ratio(s) for this video
        </p>
        <div class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-8">
          <p
            class="vdb-c-w-full vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-vdb-darkishgrey"
          >
            Preset Ratios
          </p>
          <div
            class="vdb-c-grid vdb-c-w-full vdb-c-gap-8"
            style="
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              align-content: start;
            "
          >
            <div
              :class="[
                'vdb-c-flex vdb-c-h-[62px] vdb-c-min-w-[80px] vdb-c-flex-[1_0_0] vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-12 vdb-c-p-[10px] vdb-c-transition-all',
                isCustomSelected
                  ? 'vdb-c-border vdb-c-border-vdb-orange vdb-c-bg-white'
                  : 'vdb-c-border vdb-c-border-roy vdb-c-bg-white',
              ]"
              @click="
                isCustomSelected = true;
                selectedPreset = null;
              "
            >
              <div
                class="vdb-c-flex vdb-c-h-24 vdb-c-w-24 vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center"
              >
                <AspectRatio
                  class="vdb-c-h-24 vdb-c-w-24"
                  style="transform: rotate(90deg)"
                  fill="#1E1E1E"
                />
              </div>
              <div
                class="vdb-c-min-w-0 vdb-c-flex vdb-c-h-full vdb-c-grow vdb-c-flex-col vdb-c-items-start vdb-c-justify-center"
              >
                <p
                  class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[22px] vdb-c-text-vdb-darkishgrey"
                >
                  Custom
                </p>
              </div>
            </div>
            <div
              v-for="preset in presets"
              :key="preset.value"
              :class="[
                'vdb-c-flex vdb-c-h-[62px] vdb-c-min-w-[80px] vdb-c-flex-[1_0_0] vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-12 vdb-c-p-[10px] vdb-c-transition-all',
                selectedPreset === preset.value
                  ? 'vdb-c-border vdb-c-border-vdb-orange vdb-c-bg-white'
                  : 'vdb-c-border vdb-c-border-roy vdb-c-bg-white',
              ]"
              @click="togglePreset(preset.value)"
            >
              <div
                :class="[
                  'vdb-c-shrink-0 vdb-c-rounded-[3px] vdb-c-border vdb-c-border-[#969696] vdb-c-bg-[#B9B9B9]',
                  preset.class,
                ]"
                :style="preset.transform"
              ></div>
              <div
                class="vdb-c-min-w-0 vdb-c-flex vdb-c-h-full vdb-c-grow vdb-c-flex-col vdb-c-items-start vdb-c-justify-center"
              >
                <p
                  class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[22px] vdb-c-text-vdb-darkishgrey"
                >
                  {{ preset.label }}
                </p>
              </div>
              <div
                :class="[
                  'vdb-c-flex vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[7px] vdb-c-border',
                  selectedPreset === preset.value
                    ? 'vdb-c-border-vdb-orange vdb-c-bg-vdb-orange'
                    : 'vdb-c-border-gray-200 vdb-c-bg-white',
                ]"
              >
                <svg
                  v-if="selectedPreset === preset.value"
                  class="vdb-c-h-[16px] vdb-c-w-[16px]"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="#FFFFFF"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div v-if="isCustomSelected" class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-8">
          <div class="vdb-c-flex vdb-c-w-[199px] vdb-c-flex-col vdb-c-items-start vdb-c-gap-8">
            <p
              class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-vdb-darkishgrey"
            >
              Width (px)
            </p>
            <input
              v-model="customWidth"
              type="number"
              placeholder="in pixels"
              class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-overflow-hidden vdb-c-rounded-8 vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-px-12 vdb-c-py-[9px] vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-text-vdb-darkishgrey placeholder:vdb-c-font-normal placeholder:vdb-c-text-gray-600"
            />
          </div>
          <div class="vdb-c-flex vdb-c-w-[199px] vdb-c-flex-col vdb-c-items-start vdb-c-gap-8">
            <p
              class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-vdb-darkishgrey"
            >
              Height(px)
            </p>
            <input
              v-model="customHeight"
              type="number"
              placeholder="in pixels"
              class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-overflow-hidden vdb-c-rounded-8 vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-px-12 vdb-c-py-[9px] vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-text-vdb-darkishgrey placeholder:vdb-c-font-normal placeholder:vdb-c-text-gray-600"
            />
          </div>
        </div>
        <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-end">
          <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
            <SecondaryButton @click="handleCancel" :disabled="isSubmitting">Cancel</SecondaryButton>
            <PrimaryButton @click="handleRegenerateVideo" :disabled="isSubmitting">
              {{ isSubmitting ? 'Regenerating...' : 'Regenerate videos' }}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import ReorderIcon from '../../chat/v2/icons/prompt-clip/ReorderIcon.vue';
import AspectRatio from '../../chat/v2/icons/prompt-clip/AspectRatio.vue';
import ChatVideo from '../ChatVideo.vue';
import ChevronUp from '../../chat/v2/icons/prompt-clip/ChevronUp.vue';
import PrimaryButton from '../../chat/v2/elements/PrimaryButton.vue';
import SecondaryButton from '../../chat/v2/elements/SecondaryButton.vue';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  callApi: {
    type: Function,
    required: true,
  },
});

const activeTab = ref(null);
const activeClipIndex = ref(null);
const isCustomSelected = ref(false);
const selectedPreset = ref(null);
const customWidth = ref('');
const customHeight = ref('');
const isSubmitting = ref(false);
const updatedStreamUrl = ref(null);

const presets = [
  {
    value: '4:5',
    label: '4 : 5',
    class: 'vdb-c-h-[40px] vdb-c-w-[32px]',
    transform: null,
  },
  {
    value: '1:1',
    label: '1:1',
    class: 'vdb-c-h-[40px] vdb-c-w-[40px]',
    transform: null,
  },
  {
    value: '9:16',
    label: '9:16',
    class: 'vdb-c-h-[40px] vdb-c-w-[22.5px]',
    transform: null,
  },
  {
    value: '16:9',
    label: '16:9',
    class: 'vdb-c-h-[22.5px] vdb-c-w-[40px]',
    transform: null,
  },
];

const togglePreset = (value) => {
  if (selectedPreset.value === value) {
    selectedPreset.value = null;
  } else {
    selectedPreset.value = value;
    isCustomSelected.value = false;
  }
};

const videoContent = computed(() => {
  const baseVideo = props.content.video || {};
  return {
    type: 'video',
    status: props.content.status || 'success',
    video: updatedStreamUrl.value
      ? { ...baseVideo, stream_url: updatedStreamUrl.value }
      : baseVideo,
  };
});

const sourceClips = computed(() => {
  return props.content.clips || props.content.prompt_clip || [];
});

const localClips = ref([]);

watch(
  sourceClips,
  (newClips) => {
    localClips.value = [...newClips];
  },
  { immediate: true }
);

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const truncateText = (text) => {
  if (!text) return '';
  if (text.length <= 50) return text;
  return text.substring(0, 50) + '...';
};

const moveClipUp = (index) => {
  if (index === 0) return;
  const newClips = [...localClips.value];
  [newClips[index - 1], newClips[index]] = [newClips[index], newClips[index - 1]];
  localClips.value = newClips;
  if (activeClipIndex.value === index) {
    activeClipIndex.value = index - 1;
  } else if (activeClipIndex.value === index - 1) {
    activeClipIndex.value = index;
  }
};

const moveClipDown = (index) => {
  if (index === localClips.value.length - 1) return;
  const newClips = [...localClips.value];
  [newClips[index], newClips[index + 1]] = [newClips[index + 1], newClips[index]];
  localClips.value = newClips;
  if (activeClipIndex.value === index) {
    activeClipIndex.value = index + 1;
  } else if (activeClipIndex.value === index + 1) {
    activeClipIndex.value = index;
  }
};

const handleCancel = () => {
  activeTab.value = null;
  activeClipIndex.value = null;
  isCustomSelected.value = false;
  selectedPreset.value = null;
  customWidth.value = '';
  customHeight.value = '';
};

const handleRegenerateVideo = async () => {
  if (isSubmitting.value) return;

  const payload = {
    clips: localClips.value,
    aspect_ratio: null,
  };

  if (activeTab.value === 'aspectRatio') {
    if (isCustomSelected.value) {
      if (customWidth.value && customHeight.value) {
        payload.aspect_ratio = `${customWidth.value}:${customHeight.value}`;
      }
    } else if (selectedPreset.value) {
      payload.aspect_ratio = selectedPreset.value;
    }
  }

  try {
    isSubmitting.value = true;
    const response = await props.callApi('/timeline', {
      method: 'POST',
      payload,
    });

    if (response?.status === 'success' && response?.data?.data?.stream_url) {
      updatedStreamUrl.value = response.data.data.stream_url;
      activeTab.value = null;
      handleCancel();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const videoElement = document.querySelector(
        '.vdb-c-flex.vdb-c-w-full.vdb-c-flex-col.vdb-c-gap-0.vdb-c-px-16'
      );
      if (videoElement) {
        videoElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      console.error(
        'Timeline regeneration failed:',
        response?.error || 'No stream URL in response'
      );
    }
  } catch (error) {
    console.error('Error regenerating timeline:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
