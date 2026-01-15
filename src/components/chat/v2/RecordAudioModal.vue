<template>
  <div
    v-if="isOpen"
    class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-[1001] vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-bg-black/50 vdb-c-p-24"
    @click="handleClose"
  >
    <div
      class="vdb-c-shadow-xl vdb-c-flex vdb-c-w-[540px] vdb-c-flex-col vdb-c-overflow-clip vdb-c-rounded-[20px] vdb-c-border vdb-c-border-[#E5E7EB] vdb-c-bg-white"
      @click.stop
    >
      <!-- Header -->
      <div class="vdb-c-flex vdb-c-items-center vdb-c-p-[20px]">
        <h2
          class="vdb-c-flex-1 vdb-c-text-[20px] vdb-c-font-semibold vdb-c-capitalize vdb-c-leading-[1.5] vdb-c-text-[#1E1E1E]"
        >
          Record Audio
        </h2>
        <button
          @click="handleClose"
          class="vdb-c-flex vdb-c-h-[23.594px] vdb-c-w-[23.594px] vdb-c-items-center vdb-c-justify-center vdb-c-overflow-clip vdb-c-text-[#1E1E1E] hover:vdb-c-opacity-70"
        >
          <CrossIcon class="vdb-c-h-full vdb-c-w-full" :fill="'#1E1E1E'" />
        </button>
      </div>

      <!-- Body -->
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-[20px] vdb-c-overflow-clip vdb-c-border-t vdb-c-border-[#E5E7EB] vdb-c-bg-white vdb-c-p-[20px]"
      >
        <!-- Permission Request State -->
        <div
          v-if="recordingState === 'requesting_permission'"
          class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-[16px] vdb-c-rounded-[12px] vdb-c-border-2 vdb-c-border-dashed vdb-c-border-[#B9B9B9] vdb-c-bg-[#F7F7F7] vdb-c-px-[48px] vdb-c-py-[32px]"
        >
          <div
            class="vdb-c-flex vdb-c-items-center vdb-c-rounded-[66.667px] vdb-c-border-[1.333px] vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-[12px]"
          >
            <SpinnerIcon
              class="vdb-c-h-[32px] vdb-c-w-[32px] vdb-c-animate-spin vdb-c-text-vdb-orange"
            />
          </div>
          <p class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-[#464646]">
            Requesting microphone permission...
          </p>
        </div>

        <!-- Permission Denied State -->
        <div
          v-else-if="recordingState === 'permission_denied'"
          class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-[16px] vdb-c-rounded-[12px] vdb-c-border-2 vdb-c-border-dashed vdb-c-border-[#E02424] vdb-c-bg-[#FDF2F2] vdb-c-px-[48px] vdb-c-py-[32px]"
        >
          <div
            class="vdb-c-flex vdb-c-items-center vdb-c-rounded-[66.667px] vdb-c-border-[1.333px] vdb-c-border-[#E02424] vdb-c-bg-white vdb-c-p-[12px]"
          >
            <ErrorIcon class="vdb-c-h-[32px] vdb-c-w-[32px]" />
          </div>
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[6px]">
            <p class="vdb-c-text-[14px] vdb-c-font-semibold vdb-c-text-[#1E1E1E]">
              Microphone access denied
            </p>
            <p
              class="vdb-c-text-center vdb-c-text-[12px] vdb-c-font-normal vdb-c-leading-[18px] vdb-c-text-[#464646]"
            >
              Please allow microphone access in your browser settings and try again.
            </p>
          </div>
          <button
            @click="requestPermission"
            class="vdb-c-mt-[8px] vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[8px] vdb-c-rounded-[8px] vdb-c-bg-vdb-orange vdb-c-px-[16px] vdb-c-py-[10px] vdb-c-transition-colors hover:vdb-c-bg-vdb-darkorange"
          >
            <span class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-white">Try Again</span>
          </button>
        </div>

        <!-- Idle/Ready State -->
        <div
          v-else-if="recordingState === 'idle'"
          class="vdb-c-flex vdb-c-cursor-pointer vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-[16px] vdb-c-rounded-[12px] vdb-c-border-2 vdb-c-border-dashed vdb-c-border-[#B9B9B9] vdb-c-bg-[#F7F7F7] vdb-c-px-[48px] vdb-c-py-[32px] vdb-c-transition-colors hover:vdb-c-border-[#EC5B16]"
          @click="startRecording"
        >
          <div
            class="vdb-c-flex vdb-c-items-center vdb-c-rounded-full vdb-c-border-[1.333px] vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-[12px]"
          >
            <MicrophoneIcon fill="#1E1E1E" class="vdb-c-h-[32px] vdb-c-w-[32px]" />
          </div>
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[6px]">
            <p class="vdb-c-text-[14px] vdb-c-font-semibold vdb-c-text-[#1E1E1E]">
              Click to start recording
            </p>
            <p
              class="vdb-c-text-[12px] vdb-c-font-normal vdb-c-leading-[18px] vdb-c-text-[#464646]"
            >
              Record audio directly from your microphone
            </p>
          </div>
        </div>

        <!-- Recording State -->
        <div
          v-else-if="recordingState === 'recording'"
          class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-[20px] vdb-c-rounded-[12px] vdb-c-border-2 vdb-c-border-[#EC5B16] vdb-c-bg-[#FFF5F0] vdb-c-px-[48px] vdb-c-py-[32px]"
        >
          <div class="vdb-c-relative vdb-c-flex vdb-c-items-center vdb-c-justify-center">
            <div
              class="vdb-c-absolute vdb-c-h-[72px] vdb-c-w-[72px] vdb-c-animate-ping vdb-c-rounded-full vdb-c-bg-[#EC5B16] vdb-c-opacity-20"
            ></div>
            <div
              class="vdb-c-flex vdb-c-h-[56px] vdb-c-w-[56px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[#EC5B16]"
            >
              <MicrophoneIcon fill="#FFFFFF" class="vdb-c-h-[28px] vdb-c-w-[28px]" />
            </div>
          </div>
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[8px]">
            <p class="vdb-c-text-[14px] vdb-c-font-semibold vdb-c-text-[#1E1E1E]">Recording...</p>
            <p class="vdb-c-font-mono vdb-c-text-[24px] vdb-c-font-bold vdb-c-text-[#EC5B16]">
              {{ formattedDuration }}
            </p>
          </div>
          <button
            @click="stopRecording"
            class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[8px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#D9D9D9] vdb-c-bg-white vdb-c-px-[20px] vdb-c-py-[10px] vdb-c-transition-colors hover:vdb-c-bg-[#F7F7F7]"
          >
            <StopIcon class="vdb-c-h-[16px] vdb-c-w-[16px]" />
            <span class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-[#1E1E1E]"
              >Stop Recording</span
            >
          </button>
        </div>

        <!-- Recorded/Preview State -->
        <div
          v-else-if="recordingState === 'recorded'"
          class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[16px]"
        >
          <div
            class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[16px] vdb-c-rounded-[12px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-p-[20px]"
          >
            <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[12px]">
              <div
                class="vdb-c-flex vdb-c-h-[40px] vdb-c-w-[40px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-vdb-orange"
              >
                <HeadPhoneIcon :stroke-color="'#FFFFFF'" class="vdb-c-h-[20px] vdb-c-w-[20px]" />
              </div>
              <div class="vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-gap-[2px]">
                <p class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-[#1E1E1E]">
                  {{ audioName || 'Recorded Audio' }}
                </p>
                <p class="vdb-c-text-[12px] vdb-c-text-[#666666]">
                  Duration: {{ formattedDuration }}
                </p>
              </div>
              <button
                @click="clearRecording"
                class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[6px] vdb-c-p-[8px] vdb-c-text-[#666666] vdb-c-transition-colors hover:vdb-c-bg-[#EFEFEF] hover:vdb-c-text-[#E02424]"
                title="Delete recording"
              >
                <TrashIcon class="vdb-c-h-[18px] vdb-c-w-[18px]" />
              </button>
            </div>
            <audio
              ref="audioPlayerRef"
              :src="audioUrl"
              controls
              class="vdb-c-w-full vdb-c-rounded-[8px]"
            ></audio>
          </div>
          <button
            @click="retryRecording"
            class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[8px] vdb-c-self-start vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#D9D9D9] vdb-c-bg-white vdb-c-px-[16px] vdb-c-py-[10px] vdb-c-transition-colors hover:vdb-c-bg-[#F7F7F7]"
          >
            <MicrophoneIcon fill="#1E1E1E" class="vdb-c-h-[16px] vdb-c-w-[16px]" />
            <span class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-[#1E1E1E]"
              >Record Again</span
            >
          </button>
        </div>

        <!-- Uploading State -->
        <div
          v-else-if="recordingState === 'uploading'"
          class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-[16px] vdb-c-rounded-[12px] vdb-c-border-2 vdb-c-border-dashed vdb-c-border-[#B9B9B9] vdb-c-bg-[#F7F7F7] vdb-c-px-[48px] vdb-c-py-[32px]"
        >
          <div
            class="vdb-c-flex vdb-c-items-center vdb-c-rounded-[66.667px] vdb-c-border-[1.333px] vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-[12px]"
          >
            <SpinnerIcon
              class="vdb-c-h-[32px] vdb-c-w-[32px] vdb-c-animate-spin vdb-c-text-vdb-orange"
            />
          </div>
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[6px]">
            <p class="vdb-c-text-[14px] vdb-c-font-semibold vdb-c-text-[#1E1E1E]">
              Uploading audio...
            </p>
            <p class="vdb-c-text-[12px] vdb-c-font-normal vdb-c-text-[#464646]">
              Please wait while your recording is being uploaded
            </p>
          </div>
        </div>

        <!-- Success State -->
        <div
          v-else-if="recordingState === 'success'"
          class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-[16px] vdb-c-rounded-[12px] vdb-c-border-2 vdb-c-border-[#0AA910] vdb-c-bg-[#F0FDF4] vdb-c-px-[48px] vdb-c-py-[32px]"
        >
          <div
            class="vdb-c-flex vdb-c-items-center vdb-c-rounded-full vdb-c-bg-[#0AA910] vdb-c-p-[12px]"
          >
            <CheckIcon class="vdb-c-h-[32px] vdb-c-w-[32px] vdb-c-text-white" />
          </div>
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[8px]">
            <p class="vdb-c-text-[14px] vdb-c-font-semibold vdb-c-text-[#1E1E1E]">
              Audio uploaded successfully!
            </p>
            <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[8px]">
              <p class="vdb-c-text-[12px] vdb-c-text-[#464646]">
                <span class="vdb-c-font-medium">Name:</span> {{ uploadResult?.name }}
              </p>
              <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-[8px]">
                <span class="vdb-c-text-[12px] vdb-c-font-medium vdb-c-text-[#464646]"
                  >Audio ID:</span
                >
                <div
                  class="vdb-c-flex vdb-c-items-center vdb-c-gap-[6px] vdb-c-rounded-[6px] vdb-c-bg-[#E8F5E9] vdb-c-px-[8px] vdb-c-py-[4px]"
                >
                  <code class="vdb-c-font-mono vdb-c-text-[11px] vdb-c-text-[#0AA910]">{{
                    uploadResult?.id
                  }}</code>
                  <button
                    @click="copyAudioId"
                    class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[4px] vdb-c-p-[2px] vdb-c-text-[#0AA910] vdb-c-transition-colors hover:vdb-c-bg-[#C8E6C9]"
                    :title="copied ? 'Copied!' : 'Copy to clipboard'"
                  >
                    <CheckIcon v-if="copied" class="vdb-c-h-[14px] vdb-c-w-[14px]" />
                    <CopyIcon v-else class="vdb-c-h-[14px] vdb-c-w-[14px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="recordingState === 'error'"
          class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-[16px] vdb-c-rounded-[12px] vdb-c-border-2 vdb-c-border-dashed vdb-c-border-[#E02424] vdb-c-bg-[#FDF2F2] vdb-c-px-[48px] vdb-c-py-[32px]"
        >
          <div
            class="vdb-c-flex vdb-c-items-center vdb-c-rounded-[66.667px] vdb-c-border-[1.333px] vdb-c-border-[#E02424] vdb-c-bg-white vdb-c-p-[12px]"
          >
            <ErrorIcon class="vdb-c-h-[32px] vdb-c-w-[32px]" />
          </div>
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[6px]">
            <p class="vdb-c-text-[14px] vdb-c-font-semibold vdb-c-text-[#1E1E1E]">Upload failed</p>
            <p
              class="vdb-c-text-center vdb-c-text-[12px] vdb-c-font-normal vdb-c-leading-[18px] vdb-c-text-[#464646]"
            >
              {{
                errorMessage || 'An error occurred while uploading your audio. Please try again.'
              }}
            </p>
          </div>
          <button
            @click="retryUpload"
            class="vdb-c-mt-[8px] vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[8px] vdb-c-rounded-[8px] vdb-c-bg-vdb-orange vdb-c-px-[16px] vdb-c-py-[10px] vdb-c-transition-colors hover:vdb-c-bg-vdb-darkorange"
          >
            <span class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-white">Try Again</span>
          </button>
        </div>

        <!-- Audio Name Input (shown when recorded) -->
        <BigInput
          v-if="recordingState === 'recorded'"
          v-model="audioName"
          label="Audio name"
          placeholder="Enter a name for your recording"
          type="text"
          :allow-clear="true"
          :maxlength="100"
        />
      </div>

      <!-- Footer -->
      <div
        class="vdb-c-flex vdb-c-items-center vdb-c-justify-end vdb-c-gap-[10px] vdb-c-border-t vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-[20px] vdb-c-py-[12px]"
      >
        <button
          @click="handleClose"
          class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[8px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#D9D9D9] vdb-c-bg-white vdb-c-px-[16px] vdb-c-py-[12px] vdb-c-transition-colors hover:vdb-c-bg-[#F7F7F7]"
        >
          <span
            class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[16px] vdb-c-text-[#1E1E1E]"
          >
            {{ recordingState === 'success' ? 'Done' : 'Cancel' }}
          </span>
        </button>
        <button
          v-if="recordingState === 'recorded'"
          @click="handleUpload"
          :disabled="!canUpload"
          :class="[
            'vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[10px] vdb-c-rounded-[8px] vdb-c-px-[16px] vdb-c-py-[12px] vdb-c-transition-colors',
            canUpload
              ? 'vdb-c-bg-[#EC5B16] hover:vdb-c-bg-[#D65214]'
              : 'vdb-c-cursor-not-allowed vdb-c-bg-[#969696]',
          ]"
        >
          <span class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[16px] vdb-c-text-white">
            Upload
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import CrossIcon from './icons/CrossIcon.vue';
import MicrophoneIcon from './icons/MicrophoneIcon.vue';
import SpinnerIcon from './icons/SpinnerIcon.vue';
import ErrorIcon from './icons/ErrorIcon.vue';
import CheckIcon from './icons/CheckIcon.vue';
import CopyIcon from './icons/CopyIcon.vue';
import TrashIcon from './icons/TrashIcon.vue';
import HeadPhoneIcon from './icons/HeadPhoneIcon.vue';
import BigInput from './elements/BigInput.vue';

const StopIcon = {
  template: `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="10" height="10" rx="2" fill="#E02424"/>
    </svg>
  `,
};

const emit = defineEmits(['close', 'upload-complete']);

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  collectionId: {
    type: String,
    required: true,
  },
  uploadMedia: {
    type: Function,
    required: true,
  },
});

const recordingState = ref('idle');
const audioName = ref('');
const recordingDuration = ref(0);
const audioUrl = ref(null);
const audioBlob = ref(null);
const errorMessage = ref('');
const uploadResult = ref(null);
const audioPlayerRef = ref(null);
const copied = ref(false);

let mediaRecorder = null;
let audioChunks = [];
let recordingInterval = null;
let mediaStream = null;
let recordedMimeType = 'audio/webm';

const getSupportedMimeType = () => {
  const mimeTypes = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  return 'audio/webm';
};

const getFileExtension = (mimeType) => {
  if (mimeType.startsWith('audio/mp4')) return 'm4a';
  if (mimeType.startsWith('audio/ogg')) return 'ogg';
  return 'webm';
};

const formattedDuration = computed(() => {
  const mins = Math.floor(recordingDuration.value / 60);
  const secs = recordingDuration.value % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});

const canUpload = computed(() => {
  return audioBlob.value !== null && recordingState.value === 'recorded';
});

const requestPermission = async () => {
  recordingState.value = 'requesting_permission';
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
    recordingState.value = 'idle';
  } catch (err) {
    console.error('Microphone permission denied:', err);
    recordingState.value = 'permission_denied';
  }
};

const startRecording = async () => {
  try {
    recordingState.value = 'requesting_permission';
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioChunks = [];
    recordingDuration.value = 0;

    recordedMimeType = getSupportedMimeType();
    mediaRecorder = new MediaRecorder(mediaStream, { mimeType: recordedMimeType });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: recordedMimeType });
      audioBlob.value = blob;
      audioUrl.value = URL.createObjectURL(blob);
      recordingState.value = 'recorded';

      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        mediaStream = null;
      }
    };

    mediaRecorder.start(1000);
    recordingState.value = 'recording';

    recordingInterval = setInterval(() => {
      recordingDuration.value++;
    }, 1000);
  } catch (err) {
    console.error('Failed to start recording:', err);
    recordingState.value = 'permission_denied';
  }
};

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  if (recordingInterval) {
    clearInterval(recordingInterval);
    recordingInterval = null;
  }
};

const clearRecording = () => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
  audioUrl.value = null;
  audioBlob.value = null;
  audioName.value = '';
  recordingDuration.value = 0;
  recordingState.value = 'idle';
};

const retryRecording = () => {
  clearRecording();
  startRecording();
};

const handleUpload = async () => {
  if (!audioBlob.value || !props.collectionId) return;

  recordingState.value = 'uploading';
  errorMessage.value = '';

  try {
    const fileName = audioName.value.trim() || `Recording_${Date.now()}`;
    const ext = getFileExtension(recordedMimeType);
    const file = new File([audioBlob.value], `${fileName}.${ext}`, {
      type: recordedMimeType,
    });

    const response = await props.uploadMedia({
      source: file,
      sourceType: 'file',
      collectionId: props.collectionId,
      mediaType: 'audio',
    });

    if (response?.ok) {
      const data = await response.json();
      uploadResult.value = {
        id: data.id,
        name: data.name || fileName,
        collection_id: data.collection_id,
      };
      recordingState.value = 'success';
      emit('upload-complete', uploadResult.value);
    } else {
      throw new Error('Upload failed');
    }
  } catch (err) {
    console.error('Upload error:', err);
    errorMessage.value = err.message || 'Failed to upload audio';
    recordingState.value = 'error';
  }
};

const retryUpload = () => {
  if (audioBlob.value) {
    recordingState.value = 'recorded';
  } else {
    recordingState.value = 'idle';
  }
};

const copyAudioId = async () => {
  if (!uploadResult.value?.id) return;
  try {
    await navigator.clipboard.writeText(uploadResult.value.id);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const handleClose = () => {
  cleanup();
  emit('close');
};

const cleanup = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  if (recordingInterval) {
    clearInterval(recordingInterval);
    recordingInterval = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }

  recordingState.value = 'idle';
  audioName.value = '';
  recordingDuration.value = 0;
  audioUrl.value = null;
  audioBlob.value = null;
  errorMessage.value = '';
  uploadResult.value = null;
  copied.value = false;
  audioChunks = [];
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      cleanup();
    }
  }
);

onUnmounted(() => {
  cleanup();
});
</script>
