<template>
  <div
    class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-20 vdb-c-py-14 vdb-c-text-left"
  >
    <!-- Upload Status Header -->
    <div class="vdb-c-flex vdb-c-h-24 vdb-c-items-center vdb-c-gap-8">
      <div class="vdb-c-size-20 vdb-c-overflow-hidden">
        <SpinnerIcon class="vdb-c-size-20" />
      </div>
      <div class="vdb-c-text-[14px] vdb-c-font-semibold vdb-c-leading-[22px] vdb-c-text-[#1E1E1E]">
        Upload in progress
      </div>
    </div>

    <!-- Warning Alert -->
    <div
      class="vdb-c-flex vdb-c-w-full vdb-c-items-start vdb-c-gap-8 vdb-c-rounded-[12px] vdb-c-border vdb-c-border-[#F8C450] vdb-c-bg-[#FEFCE8] vdb-c-p-12"
    >
      <!-- Warning Icon -->
      <div class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-start">
        <div class="vdb-c-size-20 vdb-c-overflow-hidden">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.85465 17.0826C2.71340 17.0826 2.58653 17.0481 2.47403 16.979C2.36153 16.9101 2.27409 16.819 2.21173 16.7059C2.14674 16.5937 2.10431 16.4722 2.09777 16.3413C2.09124 16.2105 2.12653 16.0809 2.21027 15.9526L9.34427 3.62927C9.42148 3.50094 9.51798 3.40608 9.63381 3.34469C9.74981 3.28331 9.87186 3.25261 10.0001 3.25261C10.1283 3.25261 10.2503 3.28331 10.3663 3.44469C10.4821 3.50608 10.5786 3.50094 10.6558 3.62927L17.7898 15.9526C17.8736 16.0809 17.9089 16.2105 17.9024 16.3413C17.8958 16.4722 17.8534 16.5937 17.7884 16.7059C17.7261 16.819 17.6386 16.9101 17.5261 16.979C17.4136 17.0481 17.2867 17.0826 17.1455 17.0826H2.85465ZM10.0001 14.8391C10.1907 14.8391 10.3506 14.7745 10.4797 14.6455C10.6087 14.5165 10.6732 14.3566 10.6732 14.166C10.6732 13.9753 10.6087 13.8154 10.4797 13.6863C10.3506 13.5573 10.1907 13.4928 10.0001 13.4928C9.8094 13.4928 9.64954 13.5573 9.52048 13.6863C9.39148 13.8154 9.32698 13.9753 9.32698 14.166C9.32698 14.3566 9.39148 14.5165 9.52048 14.6455C9.64954 14.7745 9.8094 14.8391 10.0001 14.8391ZM10.0002 12.6594C10.1774 12.6594 10.3259 12.5996 10.4454 12.4798C10.5652 12.3601 10.625 12.2115 10.625 12.0344V9.1178C10.625 8.94075 10.5651 8.79232 10.4453 8.67261C10.3254 8.55277 10.1769 8.49286 9.99987 8.49286C9.82267 8.49286 9.67423 8.55277 9.55452 8.67261C9.43465 8.79232 9.37471 8.94075 9.37471 9.1178V12.0344C9.37471 12.2115 9.43467 12.3601 9.55452 12.4798C9.67417 12.5996 9.82265 12.6594 10.0002 12.6594Z"
              fill="#8E4B10"
            />
          </svg>
        </div>
      </div>

      <!-- Warning Content -->
      <div
        class="vdb-c-min-w-0 vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-gap-6 vdb-c-pb-0 vdb-c-pl-0 vdb-c-pr-0 vdb-c-pt-[1px]"
      >
        <div
          class="vdb-c-flex vdb-c-w-full vdb-c-items-start vdb-c-py-0 vdb-c-pl-0 vdb-c-pr-[35px]"
        >
          <p
            class="vdb-c-min-w-0 vdb-c-flex-1 vdb-c-text-[16px] vdb-c-font-semibold vdb-c-leading-normal vdb-c-text-[#8E4B10]"
          >
            Warning
          </p>
        </div>
        <div
          class="vdb-c-w-full vdb-c-text-[14px] vdb-c-font-normal vdb-c-leading-[1.6] vdb-c-text-[#92400E]"
        >
          <p class="vdb-c-mb-0 vdb-c-font-bold">Keep this tab open while files are uploading.</p>
          <p class="vdb-c-mb-0">
            Closing it may interrupt the upload, and this chat won't be saved.
          </p>
          <p class="vdb-c-mb-0">&nbsp;</p>
          <p class="vdb-c-mb-0">
            You can start a new chat or open Director in another tab while uploads continue in the
            background.
          </p>
        </div>
      </div>
    </div>

    <!-- Files List -->
    <div
      v-if="content.files && content.files.length > 0"
      class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-6 vdb-c-rounded-[12px] vdb-c-bg-[#F7F7F7] vdb-c-p-10"
    >
      <template v-for="(file, index) in content.files" :key="index">
        <VideoFileDisplay
          v-if="file.type === 'video'"
          :file="file"
          :full-width="true"
          :error-message="file.errorMessage"
        />
        <AudioFileDisplay
          v-else-if="file.type === 'audio'"
          :file="file"
          :full-width="true"
          :error-message="file.errorMessage"
        />
        <ImageFileDisplay
          v-else-if="file.type === 'image'"
          :file="file"
          :error-message="file.errorMessage"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import SpinnerIcon from '../chat/v2/icons/SpinnerIcon.vue';
import VideoFileDisplay from '../pages/collection/components/VideoFileDisplay.vue';
import AudioFileDisplay from '../pages/collection/components/AudioFileDisplay.vue';
import ImageFileDisplay from '../chat/v2/UploadImageFileDisplay.vue';

defineProps({
  content: {
    type: Object,
    required: true,
  },
  isLastConv: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
p {
  margin: 0;
}
</style>
