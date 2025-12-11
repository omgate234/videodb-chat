<template>
  <div class="assets-page">
    <header
      class="vdb-c-flex vdb-c-h-60 vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-between vdb-c-gap-12 vdb-c-border-b vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-10 vdb-c-text-vdb-darkishgrey"
    >
      <div class="vdb-c-ml-10 vdb-c-flex vdb-c-items-center vdb-c-gap-6">
        <LibraryIcon class="vdb-c-h-24 vdb-c-w-24" />
        <p class="vdb-c-text-base vdb-c-font-semibold vdb-c-leading-6">Asset Library</p>
      </div>

      <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-6">
        <Input class="vdb-c-w-[354px]">
          <template #icon>
            <SearchIcon />
          </template>
        </Input>
        <PrimaryButton
          class="vdb-c-flex-shrink-0"
          :disabled="uploadDisabled"
          @click="handleUploadClick"
        >
          <UploadIcon class="vdb-c-h-16 vdb-c-w-16" :class="uploadIconClass" />
          <span>Upload file</span>
        </PrimaryButton>
      </div>
    </header>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue';
import LibraryIcon from '../../chat/v2/icons/LibraryIcon.vue';
import UploadIcon from '../../chat/v2/icons/UploadIcon.vue';
import SearchIcon from '../../chat/v2/icons/SearchIcon.vue';
import PrimaryButton from '../../chat/v2/elements/PrimaryButton.vue';
import Input from '../../chat/v2/elements/assets/Input.vue';

const props = defineProps({
  context: {
    type: Object,
    default: undefined,
  },
});

const context = props.context || inject('videodb-chat-context');
const configStatus = computed(() => context?.configStatus?.value ?? null);
const isSetupComplete = computed(() => context?.isSetupComplete?.value ?? false);

const uploadDisabled = computed(
  () => !((configStatus?.value ?? null) !== null && isSetupComplete?.value)
);

const handleUploadClick = () => {
  console.log('upload');
};
</script>
