<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-[9999] vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-bg-black vdb-c-bg-opacity-50"
        @click.self="handleClose"
      >
        <div
          class="vdb-c-flex vdb-c-w-full vdb-c-max-w-[530px] vdb-c-flex-col vdb-c-overflow-hidden vdb-c-rounded-[16px] vdb-c-bg-white vdb-c-shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_10px_10px_-5px_rgba(0,0,0,0.04)]"
        >
          <!-- Content -->
          <div class="vdb-c-border-b vdb-c-border-gray-200 vdb-c-bg-white vdb-c-p-[20px]">
            <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[30px]">
              <!-- Title -->
              <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[16px]">
                <p
                  class="vdb-c-grow vdb-c-text-[20px] vdb-c-font-semibold vdb-c-leading-[24px] vdb-c-text-vdb-darkishgrey"
                >
                  Delete collection?
                </p>
                <button
                  @click="handleClose"
                  class="vdb-c-flex vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-transition-opacity hover:vdb-c-opacity-70"
                >
                  <CrossIcon :fill="'#1E1E1E'" />
                </button>
              </div>

              <!-- Warning Alert -->
              <div
                class="vdb-c-flex vdb-c-h-[98px] vdb-c-w-[490px] vdb-c-items-start vdb-c-gap-[8px] vdb-c-rounded-[12px] vdb-c-border vdb-c-border-[#F8C450] vdb-c-bg-[#FEFCE8] vdb-c-p-[12px]"
              >
                <div class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-start">
                  <WarningIcon />
                </div>
                <div
                  class="vdb-c-flex vdb-c-grow vdb-c-flex-col vdb-c-gap-[6px] vdb-c-pb-0 vdb-c-pt-px"
                >
                  <div class="vdb-c-pr-[35px]">
                    <p class="vdb-c-text-[16px] vdb-c-font-semibold vdb-c-text-[#854D0E]">
                      Warning
                    </p>
                  </div>
                  <p
                    class="vdb-c-w-full vdb-c-text-[14px] vdb-c-font-normal vdb-c-leading-[1.6] vdb-c-text-[#A16207]"
                  >
                    This action can not be undone. By deleting this collection all
                    <span class="vdb-c-font-bold">{{ totalFiles }} files</span> will also be
                    permanently deleted.
                  </p>
                </div>
              </div>

              <!-- Input Field (Second Stage) -->
              <div
                v-if="confirmationStage"
                class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-[8px]"
              >
                <div class="vdb-c-w-full">
                  <p
                    class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-normal vdb-c-tracking-[0.07px] vdb-c-text-vdb-darkishgrey"
                  >
                    To confirm, type "{{ collectionName }}" in the box below
                  </p>
                </div>
                <div
                  class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-overflow-hidden vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#EFEFEF]"
                  :class="[inputValue ? 'vdb-c-bg-white' : 'vdb-c-bg-[#F7F7F7]']"
                >
                  <input
                    ref="confirmationInput"
                    v-model="inputValue"
                    type="text"
                    placeholder="Name of the collection to be deleted"
                    class="vdb-c-w-full vdb-c-px-[16px] vdb-c-py-[14px] vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-tracking-[0.07px] vdb-c-text-vdb-darkishgrey vdb-c-outline-none placeholder:vdb-c-italic placeholder:vdb-c-text-[#B9B9B9]"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Actions Footer -->
          <div
            class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-end vdb-c-border-t vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-[20px] vdb-c-py-[12px]"
          >
            <button
              v-if="!confirmationStage"
              @click="handleInitialButtonClick"
              @mouseenter="isHoveringButton = true"
              @mouseleave="isHoveringButton = false"
              class="vdb-c-flex vdb-c-w-[490px] vdb-c-items-center vdb-c-justify-center vdb-c-gap-[4px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-transparent vdb-c-py-[11px] vdb-c-pl-[9px] vdb-c-pr-[13px] vdb-c-transition-colors"
              :class="[isHoveringButton ? 'vdb-c-bg-[#464646]' : 'vdb-c-bg-[#B9B9B9]']"
            >
              <TrashIcon :stroke-color="'#FFFFFF'" />
              <span
                class="vdb-c-text-[14px] vdb-c-font-semibold vdb-c-leading-[16px] vdb-c-text-white"
              >
                I am sure about deleting this collection
              </span>
            </button>
            <button
              v-else
              @click="handleDelete"
              :disabled="!isDeleteEnabled"
              class="vdb-c-flex vdb-c-grow vdb-c-items-center vdb-c-justify-center vdb-c-gap-[4px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-transparent vdb-c-py-[11px] vdb-c-pl-[9px] vdb-c-pr-[13px] vdb-c-transition-colors disabled:vdb-c-cursor-not-allowed"
              :class="[
                isDeleteEnabled
                  ? 'vdb-c-bg-[#E02424] hover:vdb-c-bg-[#C41E1E]'
                  : 'vdb-c-bg-[#B9B9B9]',
              ]"
            >
              <TrashIcon :stroke-color="'#FFFFFF'" class="vdb-c-h-[16.667px] vdb-c-w-[16.667px]" />
              <span
                class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[16px] vdb-c-text-white"
              >
                Delete this collection
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import WarningIcon from '../../chat/v2/icons/WarningIcon.vue';
import TrashIcon from '../../chat/v2/icons/TrashIcon.vue';
import CrossIcon from '../../chat/v2/icons/CrossIcon.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  collectionName: {
    type: String,
    required: true,
  },
  totalFiles: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['close', 'delete']);

const confirmationStage = ref(false);
const inputValue = ref('');
const isHoveringButton = ref(false);
const confirmationInput = ref(null);

const isDeleteEnabled = computed(() => {
  return inputValue.value === props.collectionName;
});

const handleClose = () => {
  confirmationStage.value = false;
  inputValue.value = '';
  isHoveringButton.value = false;
  emit('close');
};

const handleInitialButtonClick = () => {
  confirmationStage.value = true;
  nextTick(() => {
    confirmationInput.value?.focus();
  });
};

const handleDelete = () => {
  if (isDeleteEnabled.value) {
    emit('delete');
    handleClose();
  }
};

watch(
  () => props.isOpen,
  (newValue) => {
    if (!newValue) {
      confirmationStage.value = false;
      inputValue.value = '';
      isHoveringButton.value = false;
    }
  }
);
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
