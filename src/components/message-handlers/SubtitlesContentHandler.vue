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
        v-if="content.status === 'success' && content.videos && content.videos.length > 0"
        class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-16"
      >
        <ChatVideo
          v-for="(video, index) in displayVideos"
          :key="`subtitle-video-${video.id || video.template_name || index}`"
          :content="formatVideoContent(video)"
          :is-last-conv="false"
          :full-width="fullWidth"
          :show-overlay-menu="showOverlayMenu"
          :show-loading="false"
        />

        <div
          v-if="showStylePrompt && !showStyleSelection"
          class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-stretch vdb-c-overflow-hidden vdb-c-rounded-16 vdb-c-border vdb-c-border-roy vdb-c-bg-vdb-lightgrey"
        >
          <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-px-16 vdb-c-py-10">
            <div class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center vdb-c-gap-12">
              <p
                class="vdb-c-text-14 vdb-c-leading-24 vdb-c-flex-1 vdb-c-font-semibold vdb-c-text-vdb-darkishgrey"
              >
                Would you like to see other styling presets?
              </p>
              <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
                <SecondaryButton
                  :disabled="!isInteractive"
                  custom-class="vdb-c-px-[13px] vdb-c-py-[9px] vdb-c-rounded-8"
                  @click="handleNoResponse"
                >
                  No, this is fine
                </SecondaryButton>
                <PrimaryButton
                  :disabled="!isInteractive"
                  custom-class="vdb-c-px-[13px] vdb-c-py-[9px] vdb-c-rounded-8 vdb-c-bg-vdb-darkorange hover:vdb-c-bg-[#a33702]"
                  @click="handleYesResponse"
                >
                  Yes, show styles
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="showStyleSelection"
          class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-[30px]"
        >
          <div class="vdb-c-grid vdb-c-w-full vdb-c-grid-cols-4 vdb-c-gap-[18.58px]">
            <div
              v-for="style in styleOptions"
              :key="style.id"
              class="vdb-c-relative vdb-c-aspect-square vdb-c-min-h-[200px] vdb-c-w-full vdb-c-cursor-pointer vdb-c-overflow-hidden vdb-c-rounded-[14.864px] vdb-c-bg-white vdb-c-transition-all vdb-c-duration-300 hover:vdb-c-shadow-lg"
              :class="{ 'vdb-c-pointer-events-none vdb-c-opacity-50': isGenerating }"
              @click="toggleStyleSelection(style.id)"
            >
              <div
                class="vdb-c-absolute vdb-c-left-[8px] vdb-c-top-[7.5px] vdb-c-z-20 vdb-c-flex vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-overflow-hidden vdb-c-rounded-[7px] vdb-c-border vdb-c-border-solid vdb-c-transition-all"
                :class="
                  selectedStyles.includes(style.id)
                    ? 'vdb-c-border-[#EC5B16] vdb-c-bg-[#EC5B16]'
                    : 'vdb-c-border-[#E5E7EB] vdb-c-bg-white'
                "
                @click.stop="toggleStyleSelection(style.id)"
              >
                <CheckIcon
                  v-if="selectedStyles.includes(style.id)"
                  class="vdb-c-h-[12px] vdb-c-w-[12px]"
                  style="stroke: white"
                />
              </div>
            </div>
          </div>

          <div
            class="vdb-c-flex vdb-c-h-[38px] vdb-c-w-full vdb-c-items-center vdb-c-justify-end vdb-c-gap-[8px]"
          >
            <SecondaryButton
              :disabled="!isInteractive || isGenerating"
              custom-class="vdb-c-px-[13px] vdb-c-py-[9px] vdb-c-rounded-8"
              @click="handleCancelSelection"
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              :disabled="!isInteractive || selectedStyles.length === 0 || isGenerating"
              custom-class="vdb-c-px-[13px] vdb-c-py-[9px] vdb-c-rounded-8"
              @click="handleRegenerateVideo"
            >
              {{ isGenerating ? 'Generating...' : 'Regenerate video' }}
            </PrimaryButton>
          </div>
        </div>
      </div>
      <div v-else-if="content.status === 'progress'" class="vdb-c-flex vdb-c-flex-col"></div>
      <div v-else-if="content.status === 'not_generated'" class="vdb-c-flex vdb-c-flex-col"></div>
    </transition>
  </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import ChatVideo from './ChatVideo.vue';
import LoadingMessage from './elements/LoadingMessage.vue';
import PrimaryButton from '../chat/v2/elements/PrimaryButton.vue';
import SecondaryButton from '../chat/v2/elements/SecondaryButton.vue';
import CheckIcon from '../chat/v2/icons/CheckIcon.vue';

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
  showStylePrompt: {
    type: Boolean,
    default: true,
  },
  currentMessageIndex: {
    type: Number,
    default: 0,
  },
  messageList: {
    type: Array,
    default: () => [],
  },
  callApi: {
    type: Function,
    default: null,
  },
});

const context = inject('videodb-chat-context');
const handleAddMessage = context?.handleAddMessage;
const callApi = props.callApi || context?.callApi;

const showStyleSelection = ref(false);
const selectedStyles = ref([]);
const isGenerating = ref(false);
const generatedVideos = ref([]);

const styleOptions = [
  { id: '1_tiktok_classic', name: 'TikTok Classic' },
  { id: '2_cinematic_gold', name: 'Cinematic Gold' },
  { id: '3_bold_impact', name: 'Bold Impact' },
  { id: '4_box_highlight', name: 'Box Highlight' },
  { id: '5_color_wave', name: 'Color Wave' },
  { id: '6_supersize_drama', name: 'Supersize Drama' },
  { id: '7_clean_minimal', name: 'Clean Minimal' },
  { id: '8_modern_boxed', name: 'Modern Boxed' },
];

const isInteractive = computed(() => {
  const isLastMessageInConv = props.currentMessageIndex === props.messageList.length - 1;
  return props.isLastConv && isLastMessageInConv;
});

const displayVideos = computed(() => {
  if (generatedVideos.value.length > 0) {
    return generatedVideos.value;
  }
  return props.content.videos || [];
});

const formatVideoContent = (video) => {
  return {
    status: 'success',
    video: {
      stream_url: video.stream_url,
      name: video.name || 'Untitled Video',
      collection_name: video.collection_name || '',
      id: video.id || '',
      collection_id: video.collection_id || '',
      style: video.style || 'horizontal',
    },
  };
};

const handleNoResponse = () => {
  if (handleAddMessage) {
    handleAddMessage({
      text: 'No, this is fine',
    });
  }
};

const handleYesResponse = () => {
  showStyleSelection.value = true;
};

const toggleStyleSelection = (styleId) => {
  const index = selectedStyles.value.indexOf(styleId);
  if (index > -1) {
    selectedStyles.value.splice(index, 1);
  } else {
    selectedStyles.value.push(styleId);
  }
};

const handleCancelSelection = () => {
  showStyleSelection.value = false;
  selectedStyles.value = [];
};

const handleRegenerateVideo = async () => {
  if (!callApi || selectedStyles.value.length === 0) {
    return;
  }

  const videoId = props.content.video_id;
  const collectionId = props.content.collection_id;

  if (!videoId || !collectionId) {
    console.error('Missing video_id or collection_id');
    return;
  }

  isGenerating.value = true;

  try {
    const result = await callApi('/subtitle/generate', {
      method: 'POST',
      payload: {
        video_id: videoId,
        collection_id: collectionId,
        template_names: selectedStyles.value,
      },
    });

    if (result.status === 'success' && result.data?.data?.videos) {
      generatedVideos.value = result.data.data.videos.map((video) => ({
        stream_url: video.stream_url,
        name: video.template_display_name || video.template_name,
        template_name: video.template_name,
        id: videoId,
        collection_id: collectionId,
      }));

      showStyleSelection.value = false;
      selectedStyles.value = [];
    } else {
      console.error('Failed to generate subtitles:', result);
    }
  } catch (error) {
    console.error('Error generating subtitles:', error);
  } finally {
    isGenerating.value = false;
  }
};
</script>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.vdb-c-text-14 {
  font-size: 14px;
}

.vdb-c-leading-24 {
  line-height: 24px;
}
</style>
