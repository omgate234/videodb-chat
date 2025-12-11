<template>
  <div class="collection-page vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col">
    <header
      class="vdb-c-flex vdb-c-h-60 vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-end vdb-c-gap-12 vdb-c-border-b vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-24"
    >
      <PrimaryButton :disabled="uploadDisabled" @click="handleUploadClick">
        <UploadIcon class="vdb-c-h-16 vdb-c-w-16" :class="uploadIconClass" />
        <span>Upload</span>
      </PrimaryButton>
    </header>
    <div class="vdb-c-flex vdb-c-w-full vdb-c-flex-1 vdb-c-items-start vdb-c-justify-start">
      <h1 class="vdb-c-text-lg vdb-c-font-semibold vdb-c-text-black">Collection</h1>
    </div>

    <div
      v-if="showChatInput"
      class="vdb-c-chat-input-container vdb-c-transition-all vdb-c-duration-300 vdb-c-ease-in-out"
      :class="{
        'vdb-c-pointer-events-none vdb-c-opacity-20': !(configStatus !== null && isSetupComplete),
      }"
    >
      <ChatInput
        :agents="agents || []"
        :input-disabled="chatLoading"
        :placeholder="chatInputPlaceholder"
        :context-data="activeCollectionData"
        @on-submit="handleAddMessage"
        @tag-agent="handleTagAgent($event, false)"
      />
    </div>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue';
import ChatInput from '../../chat/ChatInput.vue';
import UploadIcon from '../../chat/v2/icons/UploadIcon.vue';
import PrimaryButton from '../../chat/v2/elements/PrimaryButton.vue';

const props = defineProps({
  context: {
    type: Object,
    default: undefined,
  },
});

const context = props.context || inject('videodb-chat-context');

const {
  agents,
  chatLoading,
  chatInputPlaceholder = 'Ask Director',
  activeCollectionData,
  handleAddMessage,
  handleTagAgent,
  showChatInput = true,
  configStatus = null,
  isSetupComplete = false,
} = context || {};

const uploadDisabled = computed(() => !(configStatus !== null && isSetupComplete));
const uploadIconClass = computed(() =>
  uploadDisabled.value ? 'vdb-c-text-[#B9B9B9]' : 'vdb-c-text-[#EC5B16]'
);
const handleUploadClick = () => {
  console.log('upload');
};
</script>
