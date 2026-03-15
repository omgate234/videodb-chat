<!-- UploadNotifications.vue -->
<template>
  <div
    class="vdb-c-absolute vdb-c-bottom-24 vdb-c-right-24 vdb-c-z-50 vdb-c-flex vdb-c-flex-col vdb-c-gap-2"
  >
    <TransitionGroup name="notification">
      <div
        v-for="upload in uploads"
        :key="upload.id"
        class="vdb-c-flex vdb-c-h-[82px] vdb-c-w-[400px] vdb-c-items-center vdb-c-overflow-hidden vdb-c-rounded-[12px] vdb-c-border vdb-c-border-[#efefef]"
        :class="{
          'vdb-c-bg-white': upload.status !== 'error',
          'vdb-c-bg-[#fdf2f2] vdb-c-shadow-[0px_5px_20px_1px_rgba(0,2,40,0.1)]':
            upload.status === 'error',
        }"
      >
        <div
          class="vdb-c-flex vdb-c-h-full vdb-c-shrink-0 vdb-c-items-center vdb-c-px-[20px] vdb-c-py-[22px]"
          :class="{
            'vdb-c-bg-white': upload.status !== 'error',
            'vdb-c-bg-[#fdf2f2]': upload.status === 'error',
          }"
        >
          <div
            class="vdb-c-flex vdb-c-h-[54px] vdb-c-w-[54px] vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full"
            :class="{
              'vdb-c-bg-[#ffe9d3]': upload.status === 'loading',
              'vdb-c-bg-[#c8ffee]': upload.status === 'success',
              'vdb-c-bg-[#fbe5e5]': upload.status === 'error',
            }"
          >
            <UploadingIcon v-if="upload.status === 'loading'" fill="#EC5B16" />
            <SuccessIcon v-else-if="upload.status === 'success'" fill="#057A55" />
            <FailureIcon v-else fill="#E02424" />
          </div>
        </div>
        <div class="vdb-c-h-full vdb-c-w-px vdb-c-shrink-0 vdb-c-bg-[#EFEFEF]"></div>
        <div
          class="vdb-c-flex vdb-c-h-full vdb-c-flex-1 vdb-c-flex-col vdb-c-justify-center vdb-c-gap-[8px] vdb-c-overflow-hidden vdb-c-p-16"
          :class="{
            'vdb-c-bg-white': upload.status !== 'error',
            'vdb-c-bg-[#fdf2f2]': upload.status === 'error',
          }"
        >
          <p
            class="vdb-c-truncate vdb-c-text-[16px] vdb-c-font-medium vdb-c-text-[#1e1e1e]"
            :title="upload.name"
          >
            {{ upload.name }}
          </p>
          <p
            class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-tracking-[0.065px]"
            :class="{
              'vdb-c-text-[#ec5b16]': upload.status === 'loading',
              'vdb-c-text-[#057a55]': upload.status === 'success',
              'vdb-c-text-[#e02424]': upload.status === 'error',
            }"
          >
            <template v-if="upload.description">
              {{ upload.description }}
            </template>
            <template v-else>
              <template v-if="upload.status === 'loading'">
                Uploading file<span class="loading-dots"></span>
              </template>
              <template v-else-if="upload.status === 'success'">
                File uploaded successfully!
              </template>
              <template v-else> Error in uploading video. Try again. </template>
            </template>
          </p>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import UploadingIcon from '../v2/icons/notification/UploadingIcon.vue';
import SuccessIcon from '../v2/icons/notification/SuccessIcon.vue';
import FailureIcon from '../v2/icons/notification/FailureIcon.vue';

const uploads = ref([]);
let uploadCounter = 0;

const addUpload = (name, description = null) => {
  const id = uploadCounter++;
  const upload = {
    id,
    name,
    description,
    status: 'loading',
  };
  uploads.value.push(upload);
  return id;
};

const updateUploadStatus = (id, status, description = null) => {
  const upload = uploads.value.find((u) => u.id === id);
  if (upload) {
    upload.status = status;
    if (description !== null) {
      upload.description = description;
    }
    // Remove successful uploads after 3 seconds
    if (status === 'success') {
      setTimeout(() => {
        uploads.value = uploads.value.filter((u) => u.id !== id);
      }, 3000);
    }
    // Remove failed uploads after 5 seconds
    if (status === 'error') {
      setTimeout(() => {
        uploads.value = uploads.value.filter((u) => u.id !== id);
      }, 5000);
    }
  }
};

const updateUploadDescription = (id, description) => {
  const upload = uploads.value.find((u) => u.id === id);
  if (upload) {
    upload.description = description;
  }
};

defineExpose({
  addUpload,
  updateUploadStatus,
  updateUploadDescription,
});
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@keyframes loadingDots {
  0% {
    content: '.';
  }
  33% {
    content: '..';
  }
  66% {
    content: '...';
  }
}

.loading-dots {
  display: inline-block;
  width: 16px;
}

.loading-dots::after {
  content: '';
  animation: loadingDots 1.5s infinite;
}
</style>
