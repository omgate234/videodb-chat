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
          Voice Input
        </h2>
        <button
          @click="handleClose"
          class="vdb-c-flex vdb-c-h-[24px] vdb-c-w-[24px] vdb-c-items-center vdb-c-justify-center vdb-c-text-[#1E1E1E] hover:vdb-c-opacity-70"
        >
          <CrossIcon class="vdb-c-h-full vdb-c-w-full" :fill="'#1E1E1E'" />
        </button>
      </div>

      <!-- Body -->
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-[20px] vdb-c-overflow-clip vdb-c-border-t vdb-c-border-[#E5E7EB] vdb-c-bg-white vdb-c-p-[20px]"
      >
        <!-- Idle State - Click to Record -->
        <div
          v-if="state === 'idle'"
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
            <p class="vdb-c-text-[12px] vdb-c-font-normal vdb-c-text-[#464646]">
              Speak and we'll convert your voice to text
            </p>
          </div>
        </div>

        <!-- Recording State -->
        <div
          v-else-if="state === 'recording'"
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
            <span class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-[#1E1E1E]">
              Stop Recording
            </span>
          </button>
        </div>

        <!-- Transcribing State -->
        <div
          v-else-if="state === 'transcribing'"
          class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-[16px] vdb-c-rounded-[12px] vdb-c-border-2 vdb-c-border-dashed vdb-c-border-[#B9B9B9] vdb-c-bg-[#F7F7F7] vdb-c-px-[48px] vdb-c-py-[32px]"
        >
          <div
            class="vdb-c-flex vdb-c-items-center vdb-c-rounded-full vdb-c-border-[1.333px] vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-[12px]"
          >
            <SpinnerIcon
              class="vdb-c-h-[32px] vdb-c-w-[32px] vdb-c-animate-spin vdb-c-text-vdb-orange"
            />
          </div>
          <p class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-[#464646]">
            Transcribing your audio...
          </p>
        </div>

        <!-- Transcript Ready State -->
        <div v-else-if="state === 'ready'" class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[16px]">
          <!-- Audio Player -->
          <div v-if="audioUrl" class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[8px]">
            <label class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-[#1E1E1E]">
              Recording
            </label>
            <audio :src="audioUrl" controls class="vdb-c-w-full vdb-c-rounded-[8px]"></audio>
          </div>

          <!-- Transcript -->
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[8px]">
            <label class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-[#1E1E1E]">
              Transcript
            </label>
            <textarea
              v-model="transcript"
              class="vdb-c-min-h-[120px] vdb-c-w-full vdb-c-resize-none vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#D9D9D9] vdb-c-bg-white vdb-c-p-[12px] vdb-c-text-[14px] vdb-c-text-[#1E1E1E] vdb-c-outline-none focus:vdb-c-border-[#EC5B16]"
              placeholder="Edit your transcript here..."
            ></textarea>
          </div>
          <button
            @click="resetToIdle"
            class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[8px] vdb-c-self-start vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#D9D9D9] vdb-c-bg-white vdb-c-px-[16px] vdb-c-py-[10px] vdb-c-transition-colors hover:vdb-c-bg-[#F7F7F7]"
          >
            <MicrophoneIcon fill="#1E1E1E" class="vdb-c-h-[16px] vdb-c-w-[16px]" />
            <span class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-[#1E1E1E]">
              Record Again
            </span>
          </button>
        </div>

        <!-- Error State -->
        <div
          v-else-if="state === 'error'"
          class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-[16px] vdb-c-rounded-[12px] vdb-c-border-2 vdb-c-border-dashed vdb-c-border-[#E02424] vdb-c-bg-[#FDF2F2] vdb-c-px-[48px] vdb-c-py-[32px]"
        >
          <div
            class="vdb-c-flex vdb-c-items-center vdb-c-rounded-full vdb-c-border-[1.333px] vdb-c-border-[#E02424] vdb-c-bg-white vdb-c-p-[12px]"
          >
            <ErrorIcon class="vdb-c-h-[32px] vdb-c-w-[32px]" />
          </div>
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[6px]">
            <p class="vdb-c-text-[14px] vdb-c-font-semibold vdb-c-text-[#1E1E1E]">
              {{ errorMessage || 'Something went wrong' }}
            </p>
            <p class="vdb-c-text-center vdb-c-text-[12px] vdb-c-font-normal vdb-c-text-[#464646]">
              Please try again
            </p>
          </div>
          <button
            @click="resetToIdle"
            class="vdb-c-mt-[8px] vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[8px] vdb-c-rounded-[8px] vdb-c-bg-vdb-orange vdb-c-px-[16px] vdb-c-py-[10px] vdb-c-transition-colors hover:vdb-c-bg-vdb-darkorange"
          >
            <span class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-white">Try Again</span>
          </button>
        </div>
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
            Cancel
          </span>
        </button>
        <button
          v-if="state === 'ready'"
          @click="handleSend"
          :disabled="!canSend"
          :class="[
            'vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[10px] vdb-c-rounded-[8px] vdb-c-px-[16px] vdb-c-py-[12px] vdb-c-transition-colors',
            canSend
              ? 'vdb-c-bg-[#EC5B16] hover:vdb-c-bg-[#D65214]'
              : 'vdb-c-cursor-not-allowed vdb-c-bg-[#969696]',
          ]"
        >
          <span class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[16px] vdb-c-text-white">
            Send
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import CrossIcon from '../../../chat/v2/icons/CrossIcon.vue';
import MicrophoneIcon from '../../../chat/v2/icons/MicrophoneIcon.vue';
import SpinnerIcon from '../../../chat/v2/icons/SpinnerIcon.vue';
import ErrorIcon from '../../../chat/v2/icons/ErrorIcon.vue';

const StopIcon = {
  template: `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="10" height="10" rx="2" fill="#E02424"/>
    </svg>
  `,
};

const emit = defineEmits(['close', 'send']);

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  speechToText: {
    type: Function,
    required: true,
  },
});

const state = ref('idle'); // idle, recording, transcribing, ready, error
const transcript = ref('');
const recordingDuration = ref(0);
const errorMessage = ref('');
const audioUrl = ref(null);

let mediaRecorder = null;
let audioChunks = [];
let recordingInterval = null;
let mediaStream = null;
let recordedMimeType = 'audio/webm';

const formattedDuration = computed(() => {
  const mins = Math.floor(recordingDuration.value / 60);
  const secs = recordingDuration.value % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});

const canSend = computed(() => {
  return transcript.value.trim().length > 0;
});

const getSupportedMimeType = () => {
  const mimeTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/webm;codecs=opus',
    'audio/webm',
  ];
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  return 'audio/webm';
};

const getFileExtension = (mimeType) => {
  if (mimeType.startsWith('audio/mpeg') || mimeType.startsWith('audio/mp3')) return 'mp3';
  if (mimeType.startsWith('audio/mp4')) return 'm4a';
  if (mimeType.startsWith('audio/ogg')) return 'ogg';
  return 'webm';
};

const startRecording = async () => {
  try {
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

    mediaRecorder.onstop = async () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        mediaStream = null;
      }

      const audioBlob = new Blob(audioChunks, { type: recordedMimeType });
      audioUrl.value = URL.createObjectURL(audioBlob);
      await transcribeAudio(audioBlob);
    };

    mediaRecorder.start(1000);
    state.value = 'recording';

    recordingInterval = setInterval(() => {
      recordingDuration.value++;
    }, 1000);
  } catch (err) {
    console.error('Failed to start recording:', err);
    errorMessage.value = 'Microphone access denied';
    state.value = 'error';
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
  state.value = 'transcribing';
};

const transcribeAudio = async (audioBlob) => {
  try {
    const response = await props.speechToText(audioBlob);

    if (response.status === 'success' && response.text) {
      transcript.value = response.text;
      state.value = 'ready';
    } else {
      throw new Error(response.error || 'Transcription failed');
    }
  } catch (err) {
    console.error('Transcription error:', err);
    errorMessage.value = err.message || 'Failed to transcribe audio';
    state.value = 'error';
  }
};

const resetToIdle = () => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
    audioUrl.value = null;
  }
  transcript.value = '';
  recordingDuration.value = 0;
  errorMessage.value = '';
  audioChunks = [];
  state.value = 'idle';
};

const handleSend = () => {
  if (!canSend.value) return;
  emit('send', transcript.value.trim());
  handleClose();
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
    audioUrl.value = null;
  }

  state.value = 'idle';
  transcript.value = '';
  recordingDuration.value = 0;
  errorMessage.value = '';
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
