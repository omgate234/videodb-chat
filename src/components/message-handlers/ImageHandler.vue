<template>
  <div
    class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-8 vdb-c-py-14 vdb-c-text-left"
  >
    <LoadingMessage
      v-if="!isUser"
      :status="content.status"
      :message="content.status_message"
      :isLastConv="isLastConv"
    />
    <transition name="fade" mode="out-in">
      <div v-if="content.status === 'success' && content.image.url" class="vdb-c-w-full vdb-c-py-6">
        <div
          class="vdb-c-full xl:vdb-c-1/2 vdb-c-relative vdb-c-overflow-hidden vdb-c-rounded-16 sm:vdb-c-w-3/4 lg:vdb-c-w-3/5 xl:vdb-c-w-1/2"
          style="border: 2px solid var(--Light-Grey-VDB, #f7f7f7)"
        >
          <div
            class="vdb-c-relative vdb-c-flex vdb-c-min-h-[200px] vdb-c-w-full vdb-c-items-center vdb-c-justify-center vdb-c-bg-gray-100"
            @mouseenter="isHovered = true"
            @mouseleave="isHovered = false"
          >
            <img
              :src="content.image.url"
              :alt="content.image.name || 'Image'"
              class="vdb-c-max-h-[80vh] vdb-c-max-w-full vdb-c-object-contain"
            />
            <!-- Gradient Backdrop Overlay (shown on hover) -->
            <div
              :class="[
                'vdb-c-absolute vdb-c-inset-0 vdb-c-transition-opacity vdb-c-duration-300',
                isHovered ? 'vdb-c-opacity-100' : 'vdb-c-opacity-0',
              ]"
              :style="{
                background:
                  'linear-gradient(180deg, rgba(0, 0, 0, 0.70) -28.55%, rgba(0, 0, 0, 0.30) 27.67%)',
                zIndex: 5,
              }"
            ></div>
            <!-- Top Left: Image Name -->
            <div
              :class="[
                'vdb-c-absolute vdb-c-left-11 vdb-c-top-11 vdb-c-z-20 vdb-c-flex vdb-c-flex-col vdb-c-gap-2 vdb-c-px-6 vdb-c-transition-opacity vdb-c-duration-300',
                isHovered ? 'vdb-c-opacity-100' : 'vdb-c-opacity-0',
              ]"
            >
              <div
                class="vdb-c-w-full vdb-c-overflow-hidden vdb-c-text-ellipsis vdb-c-whitespace-nowrap"
              >
                <p
                  class="vdb-c-text-13 vdb-c-overflow-hidden vdb-c-text-ellipsis vdb-c-whitespace-nowrap vdb-c-font-medium vdb-c-leading-normal vdb-c-text-white"
                  style="max-width: 282px"
                >
                  {{ content.image.name || 'Untitled Image' }}
                </p>
              </div>
            </div>
            <!-- Top Right: Control Buttons -->
            <div
              :class="[
                'vdb-c-absolute vdb-c-right-8 vdb-c-top-8 vdb-c-z-20 vdb-c-flex vdb-c-gap-[4px] vdb-c-rounded-full vdb-c-border vdb-c-border-white-40 vdb-c-bg-[rgba(128,128,128,0.3)] vdb-c-p-[4px] vdb-c-backdrop-blur-[23.438px] vdb-c-transition-opacity vdb-c-duration-300',
                isHovered ? 'vdb-c-opacity-100' : 'vdb-c-opacity-0',
              ]"
              style="mix-blend-mode: luminosity; border-width: 0.656px"
            >
              <!-- Zoom Button -->
              <button
                class="vdb-c-flex vdb-c-size-[30px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[30px] vdb-c-bg-[rgba(0,0,0,0.3)] vdb-c-p-[5px] vdb-c-transition-all hover:vdb-c-bg-[rgba(0,0,0,0.6)]"
                @click.stop="handleZoom"
                title="Zoom"
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
        </div>
      </div>
      <div v-else-if="content.status === 'progress'">
        <div
          class="vdb-c-full xl:vdb-c-1/2 vdb-c-animate-pulse vdb-c-overflow-hidden vdb-c-rounded-20 sm:vdb-c-w-3/4 lg:vdb-c-w-3/5 xl:vdb-c-w-1/2"
        >
          <div class="vdb-c-relative vdb-c-aspect-video vdb-c-w-full">
            <div
              class="vdb-c-absolute vdb-c-inset-0 vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-bg-gray-200"
            ></div>
          </div>
        </div>
      </div>
      <div v-else-if="content.status === 'not_generated'" class="vdb-c-flex vdb-c-flex-col"></div>
    </transition>

    <!-- Simple Image Modal -->
    <SimpleImageModal
      :is-open="showImageModal"
      :image-url="content.image?.url || ''"
      :image-name="content.image?.name || ''"
      @close="showImageModal = false"
    />

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, inject, nextTick } from 'vue';
import LoadingMessage from './elements/LoadingMessage.vue';
import ZoomIcon from '../chat/v2/icons/image-handler/ZoomIcon.vue';
import DownloadIcon from '../chat/v2/icons/image-handler/DownloadIcon.vue';
import ThreeDotsIcon from '../chat/v2/icons/image-handler/ThreeDotsIcon.vue';
import CopyIcon from '../chat/v2/icons/CopyIcon.vue';
import FolderIcon from '../chat/v2/icons/FolderIcon.vue';
import SimpleImageModal from './image-handler/SimpleImageModal.vue';

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  isUser: {
    type: Boolean,
    default: false,
  },
  isLastConv: {
    type: Boolean,
    default: false,
  },
});

const context = inject('videodb-chat-context');
const handleUpload = context?.handleUpload;
const activeCollectionData = context?.activeCollectionData;

const isHovered = ref(false);
const showMenu = ref(false);
const menuButtonRef = ref(null);
const showImageModal = ref(false);
const menuPosition = ref(null);

const imageId = computed(() => {
  return props.content?.image?.image_id || props.content?.image?.id || null;
});

const collectionId = computed(() => {
  return props.content?.image?.collection_id || null;
});

const handleZoom = () => {
  showImageModal.value = true;
};

const handleDownload = () => {
  const imageUrl = props.content?.image?.url;
  if (imageUrl) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${props.content?.image?.name || 'image'}.jpg`;
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
      left: rect.left,
    };
  }
};

const copyAssetId = async () => {
  if (!imageId.value) return;
  try {
    await navigator.clipboard.writeText(imageId.value);
    showMenu.value = false;
  } catch (err) {
    console.error('Failed to copy asset ID:', err);
  }
};

const handleAddToCollection = async () => {
  if (!handleUpload || !props.content?.image?.url) {
    console.error('handleUpload or imageUrl not available');
    showMenu.value = false;
    return;
  }

  try {
    const targetCollectionId = activeCollectionData?.value?.id || collectionId.value;
    if (!targetCollectionId) {
      console.error('No collection ID available');
      showMenu.value = false;
      return;
    }

    await handleUpload({
      source: { url: props.content.image.url },
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.vdb-c-h-16-667 {
  height: 16.667px;
}

.vdb-c-w-16-667 {
  width: 16.667px;
}

.vdb-c-border-white-40 {
  border-color: rgba(255, 255, 255, 0.4);
}

.vdb-c-text-13 {
  font-size: 13px;
}

.vdb-c-left-11 {
  left: 11px;
}

.vdb-c-top-11 {
  top: 11px;
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
