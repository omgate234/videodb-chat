<template>
  <div
    class="vdb-c-flex vdb-c-h-screen vdb-c-w-full vdb-c-flex-col vdb-c-overflow-hidden vdb-c-bg-white"
  >
    <header
      v-if="showHeader"
      class="vdb-c-flex vdb-c-h-60 vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-between vdb-c-gap-12 vdb-c-border-b vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-24"
    >
      <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
        <button
          v-if="!onSharePage"
          type="button"
          class="vdb-c-flex vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-8 vdb-c-px-8 vdb-c-py-4 vdb-c-text-[15px] vdb-c-font-semibold vdb-c-leading-6 vdb-c-text-[#1E1E1E] vdb-c-transition-colors vdb-c-duration-200 hover:vdb-c-text-pam"
          :class="{
            'vdb-c-cursor-not-allowed vdb-c-opacity-50': !breadcrumbCollectionId,
          }"
          :disabled="!breadcrumbCollectionId"
          @click="handleCollectionCrumbClick"
        >
          <folder-icon class="vdb-c-h-18 vdb-c-w-18 vdb-c-text-[#1E1E1E]" />
          <span class="vdb-c-truncate">{{ breadcrumbCollectionName || 'Collection' }}</span>
        </button>
        <span
          v-if="breadcrumbSessionName && !onSharePage"
          class="vdb-c-text-[15px] vdb-c-text-[#1E1E1E]"
          ><chevron-right-icon class="vdb-c-h-18 vdb-c-w-18 vdb-c-text-[#1E1E1E]"
        /></span>
        <span
          v-if="breadcrumbSessionName"
          class="vdb-c-truncate vdb-c-text-[15px] vdb-c-font-medium vdb-c-leading-6 vdb-c-text-[#1E1E1E]"
          :title="breadcrumbSessionName"
        >
          {{ breadcrumbSessionName }}
        </span>
      </div>
    </header>
    <!-- Main content area - Scrollable messages -->
    <section
      class="vdb-c-flex vdb-c-min-h-0 vdb-c-flex-1 vdb-c-flex-col vdb-c-overflow-hidden vdb-c-bg-white"
    >
      <div class="vdb-c-flex vdb-c-min-h-0 vdb-c-flex-1 vdb-c-flex-col vdb-c-overflow-hidden">
        <div
          class="vdb-c-relative vdb-c-flex vdb-c-min-h-0 vdb-c-flex-1 vdb-c-flex-col vdb-c-overflow-hidden"
        >
          <setup-screen
            v-if="!isSetupComplete && configStatus !== null"
            :config-status="configStatus"
          />

          <div
            v-else
            class="vdb-c-flex vdb-c-min-h-0 vdb-c-flex-1 vdb-c-flex-col vdb-c-overflow-hidden"
          >
            <!-- Loading State -->
            <div
              v-if="showLoadingState"
              class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-bg-white vdb-c-px-60 vdb-c-pb-20 vdb-c-pt-16"
            >
              <div
                class="vdb-c-flex vdb-c-w-[268px] vdb-c-flex-col vdb-c-items-center vdb-c-gap-20"
              >
                <div class="vdb-c-h-40 vdb-c-w-40 vdb-c-shrink-0 vdb-c-overflow-clip">
                  <spinner-icon class="vdb-c-h-full vdb-c-w-full" />
                </div>
                <div
                  class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-4 vdb-c-text-center"
                >
                  <p
                    class="vdb-c-w-full vdb-c-text-[16px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1E1E1E]"
                  >
                    Preparing the chat session
                  </p>
                  <p
                    class="vdb-c-w-full vdb-c-text-[12px] vdb-c-font-normal vdb-c-leading-[20px] vdb-c-text-[#969696]"
                  >
                    We should be ready in a few seconds!
                  </p>
                </div>
              </div>
            </div>

            <!-- Chat messages (scrollable area) -->
            <div
              v-else
              ref="chatWindowRef"
              class="scrollbar-hide vdb-c-min-h-0 vdb-c-flex-1 vdb-c-overflow-y-auto"
              @scroll="handleScroll"
            >
              <chat-message-container
                v-for="(key, i) in Object.keys(conversations || {})"
                :key="key"
                :conversation="conversations[key]"
                :search-term="chatInput"
                :call-api="callApi"
                :add-message="chatAddMessage"
                :is-static-page="false"
                :is-last-conv="i === Object.keys(conversations || {}).length - 1"
                :open-canvas="openCanvas"
                :canvas-state="canvasState"
                :close-canvas="closeCanvas"
                class="vdb-c-px-30 vdb-c-transition-all vdb-c-duration-300 vdb-c-ease-in-out md:vdb-c-px-60"
                :class="{
                  'last-conv-height': i === Object.keys(conversations || {}).length - 1,
                }"
              />
              <div class="vdb-c-h-[90px]"></div>
            </div>

            <!-- Canvas overlay -->
            <component
              v-if="canvasState.show"
              :is="canvasHandlers[canvasState.type]"
              :canvas-state="canvasState"
              :closeCanvas="closeCanvas"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Chat Input - Fixed at bottom -->
    <ShowMoreChatInput v-if="showChatInput" :context="injectedContext" :show-loading-state="true" />

    <ShareSessionModal
      :is-open="showShareModal"
      :session-id="sessionIdValue"
      :is-public="isCurrentSessionPublic"
      :on-make-public="makeSessionPublic"
      @close="showShareModal = false"
    />

    <UploadModal
      :showUploadDialog="showUploadModal"
      :collections="collectionsList"
      :defaultSelectedCollectionId="breadcrumbCollectionId"
      @cancel-upload="handleCancelUpload"
      @upload="handleUploadWrapper"
    />
  </div>
</template>

<script setup>
import { computed, inject, nextTick, ref, watch } from 'vue';

import ShowMoreChatInput from '../collection/components/ShowMoreChatInput.vue';
import ChatMessageContainer from '../../chat/ChatMessageContainer.vue';
import SetupScreen from '../../chat/elements/SetupScreen.vue';
import ShareSessionModal from '../../chat/v2/ShareSessionModal.vue';
import UploadModal from '../../chat/v2/UploadModal.vue';
import ShareIcon from '../../icons/Share.vue';
import FolderIcon from '../../chat/v2/icons/FolderIcon.vue';
import ChevronRightIcon from '../../chat/v2/icons/ChevronRightIcon.vue';
import UploadIcon from '../../chat/v2/icons/UploadIcon.vue';
import SpinnerIcon from '../../chat/v2/icons/SpinnerIcon.vue';

const props = defineProps({
  context: {
    type: Object,
    default: undefined,
  },
});

const injectedContext = props.context || inject('videodb-chat-context');

// --- Extracted context refs and helpers ---
const {
  chatInput,
  chatLoading,
  conversations,
  addMessage,
  canvasHandlers,
  canvasState,
  openCanvas,
  closeCanvas,
  configStatus,
  isSetupComplete,
  agents,
  activeVideoData,
  activeCollectionData,
  handleAddMessage,
  chatAddMessage,
  handleTagAgent,
  callApi,
  sessionId: sessionIdRef,
  collectionId: collectionIdRef,
  videoId: videoIdRef,
  actions,
  makeSessionPublic,
  sessions,
  selectedCollectionId,
  showChatInput = true,
  showHeader = true,
  chatInputPlaceholder = 'Ask Director',
  isLoadingSession,
  handleUpload,
  collections,
  onSharePage = false,
} = injectedContext || {};

const chatWindowRef = ref(null);
const isScrolled = injectedContext?.isScrolled || ref(false);
const showShareModal = ref(false);
const showUploadModal = ref(false);

const collectionsList = computed(() => collections?.value || []);

const showLoadingState = computed(() => {
  return (
    isLoadingSession?.value &&
    (!conversations?.value || Object.keys(conversations.value).length === 0)
  );
});

const sessionIdValue = computed(() => sessionIdRef?.value || '');
const breadcrumbCollectionId = computed(() => {
  const fromSession = collectionIdRef?.value;
  const fromActive = activeCollectionData?.value?.id;
  return fromSession || fromActive || '';
});
const breadcrumbCollectionName = computed(() => {
  const name = activeCollectionData?.value?.name || activeCollectionData?.value?.title;
  return name || breadcrumbCollectionId.value || '';
});
const breadcrumbSessionName = computed(() => {
  const sid = sessionIdValue.value;
  if (!sid || !sessions?.value) return '';
  const match = sessions.value.find((s) => s.session_id === sid);
  return match?.name || '';
});

const isCurrentSessionPublic = computed(() => {
  const sid = sessionIdValue.value;
  if (!sid || !sessions?.value) return false;
  const match = sessions.value.find((s) => s.session_id === sid);
  return match?.is_public || false;
});

const shareDisabled = computed(() => !sessionIdValue.value || !makeSessionPublic);
const uploadDisabled = computed(
  () => !((configStatus?.value ?? null) !== null && isSetupComplete?.value)
);
const uploadButtonLabel = computed(() => 'Upload media');
const uploadIconClass = computed(() =>
  uploadDisabled.value ? 'vdb-c-text-[#B9B9B9]' : 'vdb-c-text-[#EC5B16]'
);
const uploadButtonClasses = computed(() => {
  if (uploadDisabled.value) {
    return [
      'vdb-c-border-[#EFEFEF]',
      'vdb-c-bg-white',
      'vdb-c-text-[#B9B9B9]',
      'vdb-c-cursor-not-allowed',
      'vdb-c-opacity-60',
    ];
  }
  return [
    'vdb-c-border-[#EC5B16]',
    'vdb-c-text-white',
    'vdb-c-bg-[#EC5B16]',
    'hover:vdb-c-bg-[#FFF5EC]',
  ];
});

// Mirror v1 scroll-to-latest behavior when loading
const scrollToLatestUserMessage = () => {
  const chatWindow = chatWindowRef.value;
  if (!chatWindow) return;
  nextTick(() => {
    const userMessages = chatWindow.querySelectorAll('[data-msg-type="input"]');
    if (userMessages.length > 0) {
      const latestUserMessage = userMessages[userMessages.length - 1];
      latestUserMessage.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  });
};

const handleScroll = () => {
  if (chatWindowRef.value && isScrolled) {
    isScrolled.value = chatWindowRef.value.scrollTop > 0;
  }
};

watch(
  () => chatLoading?.value,
  (val) => {
    if (val) {
      scrollToLatestUserMessage();
    }
  }
);

const handleCollectionCrumbClick = () => {
  if (!breadcrumbCollectionId.value || !actions?.goToCollection) return;
  if (selectedCollectionId?.value !== undefined) {
    selectedCollectionId.value = breadcrumbCollectionId.value;
  }
  actions.goToCollection(breadcrumbCollectionId.value);
};

const openShareModal = () => {
  if (shareDisabled.value) return;
  showShareModal.value = true;
};

const handleUploadClick = () => {
  showUploadModal.value = true;
};

const handleCancelUpload = () => {
  showUploadModal.value = false;
};

const handleUploadWrapper = async (uploadData) => {
  showUploadModal.value = false;

  try {
    await handleUpload?.(uploadData);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};
</script>

<style scoped>
.last-conv-height {
  min-height: calc(100% - 40px);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
