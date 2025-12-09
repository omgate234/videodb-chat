<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-50 vdb-c-flex vdb-c-items-center vdb-c-justify-center"
      @click="$emit('close')"
    >
      <div
        class="vdb-c-fixed vdb-c-left-0 vdb-c-top-0 vdb-c-z-[-10] vdb-c-h-screen vdb-c-w-screen vdb-c-bg-[#1e1e1e] vdb-c-opacity-70"
      ></div>
      <div
        class="vdb-c-shadow-xl vdb-c-mx-16 vdb-c-w-full vdb-c-max-w-[500px] vdb-c-rounded-12 vdb-c-bg-white"
        @click.stop
      >
        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-16 vdb-c-px-24 vdb-c-py-24">
          <div class="vdb-c-flex vdb-c-items-center vdb-c-justify-between">
            <h2 class="vdb-c-text-xl vdb-c-font-bold vdb-c-leading-6 vdb-c-text-[#1e1e1e]">
              Share chat link
            </h2>
            <button
              @click="$emit('close')"
              class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-text-[#1e1e1e] vdb-c-transition-colors hover:vdb-c-text-[#2D2D2D]"
            >
              <CrossIcon fill="#1e1e1e" />
            </button>
          </div>

          <p class="vdb-c-text-sm vdb-c-font-normal vdb-c-leading-5 vdb-c-text-[#969696]">
            Your name and any message you add after sharing stay private.
          </p>

          <div v-if="isLoading" class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
            <div
              class="vdb-c-h-16 vdb-c-w-16 vdb-c-animate-spin vdb-c-rounded-full vdb-c-border-2 vdb-c-border-[#EFEFEF] vdb-c-border-t-[#EC5B16]"
            ></div>
            <span class="vdb-c-text-sm vdb-c-font-medium vdb-c-leading-5 vdb-c-text-[#1e1e1e]"
              >Creating public link...</span
            >
          </div>

          <div v-else-if="publicLink" class="vdb-c-flex vdb-c-flex-col vdb-c-gap-8">
            <div
              class="vdb-c-flex vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-10 vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-12 vdb-c-py-10"
            >
              <input
                :value="publicLink"
                readonly
                class="vdb-c-flex-1 vdb-c-border-none vdb-c-bg-transparent vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-[#1e1e1e] vdb-c-outline-none"
              />
              <button
                @click="copyLink"
                :class="[
                  'vdb-c-flex vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-12 vdb-c-py-8 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-transition-all vdb-c-duration-200',
                  copied
                    ? 'vdb-c-bg-[#53B745] vdb-c-text-white'
                    : 'vdb-c-bg-[#EC5B16] vdb-c-text-white hover:vdb-c-bg-[#D96A1F]',
                ]"
              >
                <template v-if="copied">
                  <CheckIcon fill="#FFFFFF" />
                  <span>Copied</span>
                </template>
                <template v-else>
                  <CopyLinkIcon strokeColor="#FFFFFF" />
                  <span>Copy link</span>
                </template>
              </button>
            </div>
          </div>

          <!-- Error State -->
          <div
            v-else-if="error"
            class="vdb-c-rounded-10 vdb-c-border vdb-c-border-[#E2462C] vdb-c-bg-[#FFF5F5] vdb-c-px-12 vdb-c-py-10"
          >
            <p class="vdb-c-text-sm vdb-c-font-medium vdb-c-leading-5 vdb-c-text-[#E2462C]">
              {{ error }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import CrossIcon from '../../icons/Cross.vue';
import CheckIcon from '../../icons/Check.vue';
import CopyLinkIcon from './icons/CopyLinkIcon.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  sessionId: {
    type: String,
    default: '',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  onMakePublic: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(['close']);

const isLoading = ref(false);
const publicLink = ref('');
const error = ref('');
const copied = ref(false);

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(publicLink.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy link:', err);
  }
};

const initializeShare = async (sid) => {
  if (!sid || !props.isOpen) return;

  if (props.isPublic) {
    publicLink.value = `${window.location.origin}/share/${sid}`;
    isLoading.value = false;
    error.value = '';
    return;
  }

  isLoading.value = true;
  error.value = '';
  publicLink.value = '';

  try {
    const result = await props.onMakePublic(sid);
    if (result.success) {
      publicLink.value = `${window.location.origin}/share/${sid}`;
    } else {
      error.value = result.error || 'Failed to create public link';
    }
  } catch (err) {
    error.value = 'Failed to create public link';
    console.error('Error making session public:', err);
  } finally {
    isLoading.value = false;
  }
};

// Watch for sessionId changes and make session public
watch(
  () => props.sessionId,
  async (newSessionId) => {
    if (newSessionId && props.isOpen) {
      await initializeShare(newSessionId);
    }
  },
  { immediate: true }
);

// Re-run initialization whenever the modal is opened
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      await initializeShare(props.sessionId);
    } else {
      // Reset state when closing
      isLoading.value = false;
      publicLink.value = '';
      error.value = '';
      copied.value = false;
    }
  }
);
</script>

<style scoped>
.vdb-c-shadow-xl {
  box-shadow:
    0px 10px 25px rgba(0, 0, 0, 0.1),
    0px 20px 25px rgba(0, 0, 0, 0.16);
}
</style>
