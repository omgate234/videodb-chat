<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-[1000] vdb-c-flex vdb-c-flex-col vdb-c-bg-[#3D3D3D]"
      @click.self="handleClose"
    >
      <!-- Top Bar with Title and Close Button -->
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-between vdb-c-px-24 vdb-c-py-20"
      >
        <!-- Left: Close Button and Title -->
        <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-16">
          <!-- Close Button -->
          <button
            @click="handleClose"
            class="vdb-c-flex vdb-c-h-24 vdb-c-w-24 vdb-c-items-center vdb-c-justify-center vdb-c-transition-opacity hover:vdb-c-opacity-70"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#FFFFFF"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <!-- Title -->
          <h2 class="vdb-c-text-[16px] vdb-c-font-medium vdb-c-leading-6 vdb-c-text-white">
            {{ imageName || 'Image' }}
          </h2>
        </div>
        <div
          :class="[
            'vdb-c-absolute vdb-c-right-8 vdb-c-top-8 vdb-c-z-20 vdb-c-flex vdb-c-gap-[4px] vdb-c-rounded-full vdb-c-border vdb-c-border-white-40 vdb-c-bg-[rgba(128,128,128,0.3)] vdb-c-p-[4px] vdb-c-backdrop-blur-[23.438px] vdb-c-transition-opacity vdb-c-duration-300',
            isHovered ? 'vdb-c-opacity-100' : 'vdb-c-opacity-100',
          ]"
          style="mix-blend-mode: luminosity; border-width: 0.656px"
        >
          <!-- Zoom Button (disabled in modal) -->
          <button
            class="vdb-c-flex vdb-c-size-[30px] vdb-c-cursor-not-allowed vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[30px] vdb-c-bg-[rgba(0,0,0,0.3)] vdb-c-p-[5px] vdb-c-opacity-50"
            disabled
            title="Already zoomed"
          >
            <ZoomIcon class="vdb-c-h-16-667 vdb-c-w-16-667" />
          </button>
          <!-- Download Button -->
          <button
            class="vdb-c-flex vdb-c-size-[30px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[30px] vdb-c-bg-[rgba(0,0,0,0.3)] vdb-c-p-[5px] vdb-c-transition-all hover:vdb-c-bg-[rgba(0,0,0,0.6)]"
            @click.stop="handleDownload"
            title="Download"
          >
            <DownloadIcon class="vdb-c-h-16-667 vdb-c-w-16-667" />
          </button>
          <!-- Three Dots Button -->
          <div ref="menuButtonRef">
            <button
              class="vdb-c-flex vdb-c-size-[30px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[30px] vdb-c-bg-[rgba(0,0,0,0.3)] vdb-c-p-[5px] vdb-c-transition-all hover:vdb-c-bg-[rgba(0,0,0,0.6)]"
              @click.stop="toggleMenu"
              title="More options"
            >
              <ThreeDotsIcon class="vdb-c-h-16-667 vdb-c-w-16-667" />
            </button>
          </div>
        </div>
      </div>

      <!-- Image Display Container -->
      <div
        class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center vdb-c-justify-center vdb-c-px-48 vdb-c-pb-48"
      >
        <div
          class="vdb-c-relative vdb-c-flex vdb-c-max-h-full vdb-c-w-full vdb-c-items-center vdb-c-justify-center vdb-c-overflow-hidden vdb-c-rounded-12"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
        >
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="imageName || 'Image'"
            class="vdb-c-max-h-full vdb-c-max-w-full vdb-c-rounded-12 vdb-c-object-contain"
          />
        </div>
      </div>
    </div>

    <!-- Dropdown Menu (Teleported) -->
    <Teleport to="body">
      <ul
        v-if="showMenu && menuPosition"
        class="menu-dropdown vdb-c-fixed vdb-c-z-[10000] vdb-c-w-[200px] vdb-c-min-w-[200px] vdb-c-cursor-pointer vdb-c-rounded-12 vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-white vdb-c-p-8 vdb-c-text-sm"
        :style="{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }"
      >
        <!-- Copy Asset ID (shown when imageId exists) -->
        <li
          v-if="imageId"
          class="menu-item vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-12 vdb-c-rounded-8 vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-sm vdb-c-font-[500] vdb-c-text-black hover:vdb-c-bg-[#efefef]"
          @click.stop="copyAssetId"
        >
          <CopyIcon class="vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0" />
          <span class="vdb-c-flex-shrink-0">Copy Asset ID</span>
        </li>

        <!-- Add to Collection (shown when imageId doesn't exist) -->
        <li
          v-if="!imageId"
          class="menu-item vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-12 vdb-c-rounded-8 vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-sm vdb-c-font-[500] vdb-c-text-black hover:vdb-c-bg-[#efefef]"
          @click.stop="handleAddToCollection"
        >
          <FolderIcon class="vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0" stroke-color="#1E1E1E" />
          <span class="vdb-c-flex-shrink-0">Add to collection</span>
        </li>
      </ul>
    </Teleport>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, inject, nextTick } from 'vue';
import ZoomIcon from '../../chat/v2/icons/image-handler/ZoomIcon.vue';
import DownloadIcon from '../../chat/v2/icons/image-handler/DownloadIcon.vue';
import ThreeDotsIcon from '../../chat/v2/icons/image-handler/ThreeDotsIcon.vue';
import CopyIcon from '../../chat/v2/icons/CopyIcon.vue';
import FolderIcon from '../../chat/v2/icons/FolderIcon.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  imageName: {
    type: String,
    default: '',
  },
  imageId: {
    type: String,
    default: null,
  },
  collectionId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['close']);

const context = inject('videodb-chat-context');
const handleUpload = context?.handleUpload;
const activeCollectionData = context?.activeCollectionData;

const isHovered = ref(false);
const showMenu = ref(false);
const menuButtonRef = ref(null);
const menuPosition = ref(null);

const handleClose = () => {
  emit('close');
};

const handleDownload = () => {
  if (props.imageUrl) {
    const link = document.createElement('a');
    link.href = props.imageUrl;
    link.download = `${props.imageName || 'image'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    console.error('No image URL available');
  }
};

const toggleMenu = async () => {
  showMenu.value = !showMenu.value;
  if (showMenu.value && menuButtonRef.value) {
    await nextTick();
    const rect = menuButtonRef.value.getBoundingClientRect();
    menuPosition.value = {
      top: rect.bottom + 8,
      left: rect.left - 200,
    };
  }
};

const copyAssetId = async () => {
  if (!props.imageId) return;
  try {
    await navigator.clipboard.writeText(props.imageId);
    showMenu.value = false;
  } catch (err) {
    console.error('Failed to copy asset ID:', err);
  }
};

const handleAddToCollection = async () => {
  if (!handleUpload || !props.imageUrl) {
    console.error('handleUpload or imageUrl not available');
    showMenu.value = false;
    return;
  }

  try {
    const targetCollectionId = activeCollectionData?.value?.id || props.collectionId;
    if (!targetCollectionId) {
      console.error('No collection ID available');
      showMenu.value = false;
      return;
    }

    await handleUpload({
      source: { url: props.imageUrl },
      sourceType: 'url',
      collectionId: targetCollectionId,
      mediaType: 'image',
    });
    showMenu.value = false;
  } catch (err) {
    console.error('Failed to add to collection:', err);
    showMenu.value = false;
  }
};

const handleClickOutside = (event) => {
  if (menuButtonRef.value && !menuButtonRef.value.contains(event.target)) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.vdb-c-h-16-667 {
  height: 16.667px;
}

.vdb-c-w-16-667 {
  width: 16.667px;
}

.vdb-c-border-white-40 {
  border-color: rgba(255, 255, 255, 0.4);
}

.menu-dropdown {
  box-shadow:
    0px 5px 11px rgba(0, 0, 0, 0.06),
    0px 21px 21px rgba(0, 0, 0, 0.05),
    0px 47px 28px rgba(0, 0, 0, 0.03),
    0px 83px 33px rgba(0, 0, 0, 0.01),
    0px 130px 36px rgba(0, 0, 0, 0);
}
</style>
