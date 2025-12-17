<template>
  <div class="collection-page vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col">
    <header
      class="vdb-c-flex vdb-c-h-60 vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-end vdb-c-gap-12 vdb-c-border-b vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-24"
    >
      <SearchInput
        v-if="showMore"
        :items="combinedAssets"
        @select-item="handleSelectItem"
        @update:query="handleSearchQueryUpdate"
        :placeholder="collectionName ? `Search files in '${collectionName}'` : 'Search files'"
      />
      <PrimaryButton :disabled="uploadDisabled" @click="handleUploadClick">
        <AddIcon stroke-color="white" class="vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-shrink-0" />
        <span class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px]">Upload</span>
      </PrimaryButton>
    </header>
    <div
      v-if="!showMore"
      :class="[!hasAssets ? 'vdb-c-mb-[60px]' : '']"
      class="vdb-c-flex vdb-c-h-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-[60px] vdb-c-p-[40px]"
    >
      <!-- Chat Input Section -->
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-max-w-[680px] vdb-c-flex-shrink-0 vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-[30px]"
      >
        <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-16">
          <div
            id="header-component"
            class="vdb-c-flex vdb-c-grow vdb-c-flex-row vdb-c-items-center vdb-c-gap-8"
          >
            <div
              class="vdb-c-flex vdb-c-h-[36px] vdb-c-w-[36px] vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center"
            >
              <FolderIcon :stroke-color="'#1E1E1E'" class="vdb-c-h-[36px] vdb-c-w-[36px]" />
            </div>
            <div class="vdb-c-flex vdb-c-shrink-0 vdb-c-flex-col vdb-c-items-center">
              <template v-if="isEditing">
                <input
                  :id="'edit-input-collection-header'"
                  v-model="editingName"
                  type="text"
                  class="vdb-selection-orange vdb-c-w-full vdb-c-truncate vdb-c-text-[22px] vdb-c-font-semibold vdb-c-leading-none vdb-c-text-vdb-darkishgrey vdb-c-outline-none"
                  @click.stop
                  @keydown.enter.prevent="handleSave"
                  @keydown.esc.stop="handleCancel"
                  @blur="handleSave"
                />
              </template>
              <template v-else>
                <h1
                  class="vdb-c-whitespace-nowrap vdb-c-text-center vdb-c-text-[22px] vdb-c-font-semibold vdb-c-leading-none vdb-c-text-vdb-darkishgrey"
                >
                  {{ collectionName || 'Collection' }}
                </h1>
              </template>
            </div>
          </div>
          <div
            class="vdb-c-relative vdb-c-flex vdb-c-h-[30px] vdb-c-w-[30px] vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center"
          >
            <button
              ref="optionsButtonRef"
              @click.stop="handleOptionsClick"
              class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-items-center vdb-c-justify-center"
            >
              <ThreeDotsIcon class="vdb-c-h-[30px] vdb-c-w-[30px] vdb-c-rotate-90" />
            </button>
            <CollectionOptionsMenu
              v-if="optionsButtonRef && currentCollection"
              :is-open="showCollectionOptions"
              :collection="currentCollection"
              :trigger-element="optionsButtonRef"
              :on-left="true"
              @close="showCollectionOptions = false"
              @rename="handleRenameCollection"
              @delete="handleDeleteCollection"
            />
          </div>
        </div>
        <ChatInput :context="context" />
      </div>
      <!-- Assets Section -->
      <div
        v-if="hasAssets"
        class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-[30px]"
      >
        <!-- Tabs and Search -->
        <div
          class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-between vdb-c-gap-[10px]"
        >
          <AssetTabs :tabs="['Video', 'Audio', 'Images', 'Voices']" v-model="activeTab" />
          <div class="vdb-c-flex-1"></div>
          <SearchInput
            :items="combinedAssets.filter((asset) => asset.type === activeTab.toLowerCase())"
            @select-item="handleSelectItem"
            @update:query="handleSearchQueryUpdate"
            :placeholder="`Search files in &quot;${collectionName}&quot;`"
          />
        </div>
        <!-- Asset Grid -->
        <div class="vdb-c-w-full">
          <div
            v-if="displayedAssets.length === 0"
            class="vdb-c-flex vdb-c-h-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-12 vdb-c-py-60 vdb-c-text-center"
          >
            <EmptyFolderIcon />
            <p class="vdb-c-font-medium vdb-c-text-vdb-darkishgrey">
              {{ isLoadingAssets ? 'Loading...' : 'No files found' }}
            </p>
          </div>
          <VideoList
            v-if="displayedAssets.length > 0"
            :asset-results="displayedAssets"
            :get-image-url="getImageUrl"
            :get-audio-url="getAudioUrl"
            :handle-add-message="handleAddMessage"
            :editing-asset-id="editingAssetId"
            :show-pagination="false"
            @video-click="handleVideoClick"
            @delete-video="handleDeleteVideo"
            @delete-image="handleDeleteImage"
            @delete-audio="handleDeleteAudio"
            @start-editing="handleStartEditing"
            @save-editing="handleSaveEditing"
            @cancel-editing="handleCancelEditing"
          />
          <!-- Show More Button -->
          <div
            v-if="filteredAssets.length > 4"
            class="vdb-c-mt-20 vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-center"
          >
            <button
              @click="handleShowMore"
              class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-[13px] vdb-c-py-[9px] vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-vdb-darkishgrey vdb-c-transition-colors hover:vdb-c-bg-[#F7F7F7]"
            >
              Show more
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Show More View -->
    <div
      v-if="showMore"
      class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col vdb-c-overflow-hidden"
    >
      <!-- Main Content (Scrollable) -->
      <div
        class="vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-items-center vdb-c-justify-start vdb-c-gap-[40px] vdb-c-overflow-y-auto vdb-c-pt-[30px]"
      >
        <!-- Controls Bar -->
        <div
          class="vdb-c-flex vdb-c-w-full vdb-c-flex-wrap vdb-c-items-center vdb-c-justify-between vdb-c-gap-16 vdb-c-px-[40px]"
        >
          <!-- Type Tabs -->
          <AssetTabs :tabs="['Video', 'Audio', 'Images', 'Voices']" v-model="activeTab" />

          <!-- Filters & Sorts -->
          <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-12">
            <div ref="sortRef">
              <SortDropdown
                :is-open="activeDropdown === 'sort'"
                v-model="sortState"
                @toggle="toggleDropdown('sort')"
              />
            </div>

            <div ref="filterRef">
              <FilterDropdown
                :is-open="activeDropdown === 'filter'"
                :model-value="filterState"
                @update:model-value="handleFilterUpdate"
                @toggle="toggleDropdown('filter')"
              />
            </div>
          </div>
        </div>

        <!-- Asset List -->
        <!-- Use flex-1 here to ensure empty state centers in available space, removed h-full -->
        <div class="vdb-c-w-full vdb-c-flex-1 vdb-c-p-24 vdb-c-px-[40px]">
          <div
            v-if="filteredAssets.length === 0"
            class="vdb-c-flex vdb-c-h-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-12 vdb-c-py-60 vdb-c-text-center"
          >
            <EmptyFolderIcon />
            <p class="vdb-c-font-medium vdb-c-text-vdb-darkishgrey">No files found</p>
          </div>
          <VideoList
            v-else
            :asset-results="filteredAssets"
            :get-image-url="getImageUrl"
            :get-audio-url="getAudioUrl"
            :handle-add-message="handleAddMessage"
            :editing-asset-id="editingAssetId"
            :show-pagination="true"
            @video-click="handleVideoClick"
            @delete-video="handleDeleteVideo"
            @delete-image="handleDeleteImage"
            @delete-audio="handleDeleteAudio"
            @start-editing="handleStartEditing"
            @save-editing="handleSaveEditing"
            @cancel-editing="handleCancelEditing"
          />
        </div>
      </div>

      <!-- Fixed Chat Input at the bottom -->
      <ShowMoreChatInput :context="context" />
    </div>

    <!-- Delete Collection Modal -->
    <DeleteCollectionModal
      :is-open="showDeleteCollectionModal"
      :collection-name="collectionToDelete?.name || ''"
      :total-files="totalFilesCount"
      @close="cancelDeleteCollection"
      @delete="confirmDeleteCollection"
    />

    <!-- Upload Modal -->
    <UploadModal
      :showUploadDialog="showUploadModal"
      :collections="currentCollectionArray"
      :defaultSelectedCollectionId="currentCollection?.id || null"
      @cancel-upload="handleCancelUpload"
      @upload="handleUploadWrapper"
    />

    <NotificationCenter ref="notificationCenterRef" />
  </div>
</template>

<script setup>
import {
  inject,
  computed,
  ref,
  reactive,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
  markRaw,
} from 'vue';
import PrimaryButton from '../../chat/v2/elements/PrimaryButton.vue';
import FolderIcon from '../../chat/v2/icons/FolderIcon.vue';
import ThreeDotsIcon from '../../chat/v2/icons/ThreeDotsIcon.vue';
import ChatInput from './components/DefaultChatInput.vue';
import CollectionOptionsMenu from '../../chat/v2/CollectionOptionsMenu.vue';
import AssetTabs from '../assets/AssetTabs.vue';
import SearchInput from '../assets/SearchInput.vue';
import VideoList from '../../chat/v2/collection/VideoList.vue';
import SortDropdown from '../assets/SortDropdown.vue';
import FilterDropdown from '../assets/FilterDropdown.vue';
import EmptyFolderIcon from '../../chat/v2/icons/EmptyFolderIcon.vue';
import { useAssetSearch } from '../assets/hooks/useAssetSearch.js';
import { useAssetFilters } from '../assets/hooks/useAssetFilters.js';
import ShowMoreChatInput from './components/ShowMoreChatInput.vue';
import DeleteCollectionModal from './DeleteCollectionModal.vue';
import NotificationCenter from '../../chat/elements/NotificationCenter.vue';
import ErrorIcon from '../../chat/v2/icons/ErrorIcon.vue';
import UploadModal from '../../chat/v2/UploadModal.vue';
import AddIcon from '../../chat/v2/icons/AddIcon.vue';

const props = defineProps({
  context: {
    type: Object,
    default: undefined,
  },
});

const context = inject('videodb-chat-context');

const {
  agents,
  chatLoading,
  chatInputPlaceholder = 'Ask Director',
  activeCollectionData,
  activeCollectionVideos,
  activeCollectionAudios,
  activeCollectionImages,
  handleAddMessage,
  handleTagAgent,
  showChatInput = true,
  configStatus = null,
  isSetupComplete = false,
  handleUpdateCollectionName,
  deleteCollection,
  fetchCollectionVideos,
  fetchCollectionAudios,
  fetchCollectionImages,
  fetchAssets,
  navState,
  actions,
  generateImageUrl,
  generateAudioUrl,
  deleteVideo,
  deleteAudio,
  deleteImage,
} = context || {};

const showMore = ref(false);
const showDeleteCollectionModal = ref(false);
const collectionToDelete = ref(null);
const notificationCenterRef = ref(null);

const uploadDisabled = computed(() => !(configStatus !== null && isSetupComplete));

const showUploadModal = ref(false);

const handleUploadClick = () => {
  showUploadModal.value = true;
};

const handleCancelUpload = () => {
  showUploadModal.value = false;
};

const handleUploadWrapper = async (uploadData) => {
  showUploadModal.value = false;
  try {
    await context?.handleUpload(uploadData);
    const collectionId = currentCollection.value?.id;
    if (collectionId) {
      const [videosRes, audiosRes, imagesRes, voicesRes] = await Promise.all([
        fetchCollectionVideos?.(collectionId) || Promise.resolve({ data: null }),
        fetchCollectionAudios?.(collectionId) || Promise.resolve({ data: null }),
        fetchCollectionImages?.(collectionId) || Promise.resolve({ data: null }),
        fetchAssets?.({
          collection_id: collectionId,
          asset_type: 'voices',
          page: 1,
          page_size: 10000,
        }) || Promise.resolve({ status: 'success', data: { assets: null } }),
      ]);

      if (activeCollectionVideos) {
        activeCollectionVideos.value = videosRes?.data || null;
      }
      if (activeCollectionAudios) {
        activeCollectionAudios.value = audiosRes?.data || null;
      }
      if (activeCollectionImages) {
        activeCollectionImages.value = imagesRes?.data || null;
      }
      if (voicesRes?.status === 'success' && voicesRes?.data?.data?.assets) {
        activeCollectionVoices.value = voicesRes.data.data.assets;
      } else {
        activeCollectionVoices.value = null;
      }
    }
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};

const currentCollectionArray = computed(() => {
  return currentCollection.value ? [currentCollection.value] : [];
});

const currentCollection = computed(() => {
  if (activeCollectionData?.value) {
    return activeCollectionData.value;
  }
  return activeCollectionData || null;
});

const collectionName = computed(() => {
  return currentCollection.value?.name || '';
});

const showCollectionOptions = ref(false);
const optionsButtonRef = ref(null);
const isEditing = ref(false);
const editingName = ref('');

watch(
  () => collectionName.value,
  (newName) => {
    if (!isEditing.value && newName) {
      editingName.value = newName || '';
    }
  }
);

watch(
  () => isEditing.value,
  (newValue) => {
    if (newValue) {
      editingName.value = collectionName.value || '';
      nextTick(() => {
        const input = document.getElementById('edit-input-collection-header');
        if (input) {
          input.focus();
          input.select();
        }
      });
    }
  }
);

const handleOptionsClick = () => {
  showCollectionOptions.value = !showCollectionOptions.value;
};

const handleRenameCollection = (collection) => {
  showCollectionOptions.value = false;
  isEditing.value = true;
};

const handleSave = () => {
  if (isEditing.value) {
    const trimmed = (editingName.value || '').trim();
    if (trimmed.length === 0) {
      handleCancel();
      return;
    }
    if (handleUpdateCollectionName && currentCollection.value?.id) {
      handleUpdateCollectionName({
        collectionId: currentCollection.value.id,
        name: trimmed,
      });
    }
    isEditing.value = false;
  }
};

const handleCancel = () => {
  isEditing.value = false;
  editingName.value = collectionName.value || '';
};

const handleDeleteCollection = (collection) => {
  showCollectionOptions.value = false;
  collectionToDelete.value = collection;
  showDeleteCollectionModal.value = true;
};

const confirmDeleteCollection = async () => {
  if (!collectionToDelete.value) return;

  try {
    if (deleteCollection) {
      await deleteCollection(collectionToDelete.value.id);
      if (actions?.goToDefault) {
        actions.goToDefault();
      }
    }
  } catch (error) {
    console.error('Error deleting collection:', error);
    if (notificationCenterRef.value) {
      notificationCenterRef.value.addNotification(
        'Unable to delete the collection. Please try again.',
        {
          type: 'error',
          icon: markRaw(ErrorIcon),
          duration: 5000,
        }
      );
    }
  } finally {
    showDeleteCollectionModal.value = false;
    collectionToDelete.value = null;
  }
};

const cancelDeleteCollection = () => {
  showDeleteCollectionModal.value = false;
  collectionToDelete.value = null;
};

// Assets section state
const isLoadingAssets = ref(false);
const activeCollectionVoices = ref(null);

watch(
  () => {
    const collectionData = activeCollectionData?.value || activeCollectionData;
    return collectionData?.id;
  },
  async (collectionId, oldCollectionId) => {
    const isCollectionPage = navState?.currentPage === 'collection';
    if (!isCollectionPage || !collectionId || collectionId === oldCollectionId) {
      return;
    }

    isLoadingAssets.value = true;
    try {
      const [videosRes, audiosRes, imagesRes, voicesRes] = await Promise.all([
        fetchCollectionVideos?.(collectionId) || Promise.resolve({ data: null }),
        fetchCollectionAudios?.(collectionId) || Promise.resolve({ data: null }),
        fetchCollectionImages?.(collectionId) || Promise.resolve({ data: null }),
        fetchAssets?.({
          collection_id: collectionId,
          asset_type: 'voices',
          page: 1,
          page_size: 10000,
        }) || Promise.resolve({ status: 'success', data: { assets: null } }),
      ]);

      if (activeCollectionVideos) {
        activeCollectionVideos.value = videosRes?.data || null;
      }
      if (activeCollectionAudios) {
        activeCollectionAudios.value = audiosRes?.data || null;
      }
      if (activeCollectionImages) {
        activeCollectionImages.value = imagesRes?.data || null;
      }
      if (voicesRes?.status === 'success' && voicesRes?.data?.data?.assets) {
        activeCollectionVoices.value = voicesRes.data.data.assets;
      } else {
        activeCollectionVoices.value = null;
      }
    } catch (error) {
      console.error('Error fetching collection assets:', error);
    } finally {
      isLoadingAssets.value = false;
    }
  },
  { immediate: true }
);
const activeTab = ref('Video');
const editingAssetId = ref(null);
const sortState = ref({});
const filterState = reactive({
  dur_less_1: false,
  dur_1_15: false,
  dur_15_30: false,
  dur_more_30: false,
  size_less_10: false,
  size_10_100: false,
  size_100_500: false,
  size_more_500: false,
});

// Dropdown Management
const activeDropdown = ref(null);
const sortRef = ref(null);
const filterRef = ref(null);

const toggleDropdown = (name) => {
  activeDropdown.value = activeDropdown.value === name ? null : name;
};

// Handle Click Outside to close dropdowns
const handleClickOutside = (event) => {
  if (!activeDropdown.value) return;
  const target = event.target;

  if (activeDropdown.value === 'sort' && sortRef.value && !sortRef.value.contains(target)) {
    activeDropdown.value = null;
  }
  if (activeDropdown.value === 'filter' && filterRef.value && !filterRef.value.contains(target)) {
    activeDropdown.value = null;
  }
};

const handleFilterUpdate = (updatedFilterState) => {
  Object.assign(filterState, updatedFilterState);
};

// Combine videos, audios, and images into a single array with proper structure
const combinedAssets = computed(() => {
  const assets = [];
  const collectionId = currentCollection.value?.id;
  const collectionName = currentCollection.value?.name || '';

  // Get arrays (handle both ref and direct value)
  const videos = activeCollectionVideos?.value || activeCollectionVideos || [];
  const audios = activeCollectionAudios?.value || activeCollectionAudios || [];
  const images = activeCollectionImages?.value || activeCollectionImages || [];
  const voices = activeCollectionVoices?.value || [];

  // Add videos
  if (Array.isArray(videos)) {
    videos.forEach((video) => {
      assets.push({
        ...video,
        type: 'video',
        collectionId: collectionId || video.collection_id,
        collectionName,
      });
    });
  }

  // Add audios
  if (Array.isArray(audios)) {
    audios.forEach((audio) => {
      assets.push({
        ...audio,
        type: 'audio',
        collectionId: collectionId || audio.collection_id,
        collectionName,
      });
    });
  }

  // Add images
  if (Array.isArray(images)) {
    images.forEach((image) => {
      assets.push({
        ...image,
        type: 'image',
        collectionId: collectionId || image.collection_id,
        collectionName,
      });
    });
  }

  // Add voices
  if (Array.isArray(voices)) {
    voices.forEach((voice) => {
      assets.push({
        ...voice,
        type: 'voices',
        collectionId: collectionId || voice.collection_id,
        collectionName,
      });
    });
  }

  return assets;
});

// Use search hook
const { searchQuery, searchFilteredAssets, handleSelectItem } = useAssetSearch(combinedAssets);

// Sync search query from SearchInput component
const handleSearchQueryUpdate = (value) => {
  searchQuery.value = value;
};

// Use filter hook
const { filteredAssets } = useAssetFilters(
  searchFilteredAssets,
  ref(null), // selectedCollection - not used in collection page
  activeTab,
  sortState,
  filterState
);

// Display only first 4 results
const displayedAssets = computed(() => {
  return filteredAssets.value.slice(0, 4);
});

// Check if there are any assets
const hasAssets = computed(() => {
  return combinedAssets.value.length > 0;
});

// Total files count for delete modal
const totalFilesCount = computed(() => {
  if (!collectionToDelete.value) return 0;

  const videos = activeCollectionVideos?.value || activeCollectionVideos || [];
  const audios = activeCollectionAudios?.value || activeCollectionAudios || [];
  const images = activeCollectionImages?.value || activeCollectionImages || [];
  const voices = activeCollectionVoices?.value || [];

  return (
    (Array.isArray(videos) ? videos.length : 0) +
    (Array.isArray(audios) ? audios.length : 0) +
    (Array.isArray(images) ? images.length : 0) +
    (Array.isArray(voices) ? voices.length : 0)
  );
});

// Get image URL helper
const getImageUrl = async (collectionId, imageId) => {
  if (!generateImageUrl) return null;
  const result = await generateImageUrl(collectionId, imageId);
  return result?.url || null;
};

// Get audio URL helper
const getAudioUrl = async (collectionId, audioId) => {
  if (!generateAudioUrl) return null;
  const result = await generateAudioUrl(collectionId, audioId);
  return result?.url || null;
};

// Delete handlers
const handleDeleteVideo = async (video) => {
  if (deleteVideo && video.collectionId && video.id) {
    try {
      await deleteVideo(video.collectionId, video.id);
      // Refetch assets
      const collectionId = currentCollection.value?.id;
      if (collectionId) {
        const videosRes = await fetchCollectionVideos?.(collectionId);
        if (activeCollectionVideos) {
          activeCollectionVideos.value = videosRes?.data || null;
        }
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  }
};

const handleDeleteAudio = async (audio) => {
  if (deleteAudio && audio.collectionId && audio.id) {
    try {
      await deleteAudio(audio.collectionId, audio.id);
      // Refetch assets
      const collectionId = currentCollection.value?.id;
      if (collectionId) {
        const audiosRes = await fetchCollectionAudios?.(collectionId);
        if (activeCollectionAudios) {
          activeCollectionAudios.value = audiosRes?.data || null;
        }
      }
    } catch (error) {
      console.error('Error deleting audio:', error);
    }
  }
};

const handleDeleteImage = async (image) => {
  if (deleteImage && image.collectionId && image.id) {
    try {
      await deleteImage(image.collectionId, image.id);
      // Refetch assets
      const collectionId = currentCollection.value?.id;
      if (collectionId) {
        const imagesRes = await fetchCollectionImages?.(collectionId);
        if (activeCollectionImages) {
          activeCollectionImages.value = imagesRes?.data || null;
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
};

const handleVideoClick = (video) => {
  console.log('Video clicked:', video);
};

const handleStartEditing = (asset) => {
  editingAssetId.value = asset.id;
};

const handleSaveEditing = async ({ assetId, name }) => {
  try {
    // Find the asset in the current results
    const asset = combinedAssets.value.find((item) => item.id === assetId);
    if (!asset) return;

    // Store original name for rollback
    const originalName = asset.name;

    // Optimistically update the name
    asset.name = name;

    // Call the appropriate API based on asset type
    let result;
    const collectionId = asset.collectionId || asset.collection_id;
    if (asset.type === 'video') {
      result = await context.callApi(`/videodb/collection/${collectionId}/video/${assetId}`, {
        method: 'PATCH',
        payload: { name: name },
      });
    } else if (asset.type === 'audio') {
      result = await context.callApi(`/videodb/collection/${collectionId}/audio/${assetId}`, {
        method: 'PATCH',
        payload: { name: name },
      });
    } else if (asset.type === 'image') {
      result = await context.callApi(`/videodb/collection/${collectionId}/image/${assetId}`, {
        method: 'PATCH',
        payload: { name: name },
      });
    }

    if (result?.status === 'success') {
      // API call successful, name is already updated optimistically
      editingAssetId.value = null;
    } else {
      // Revert on failure
      asset.name = originalName;
      throw new Error('Rename failed');
    }
  } catch (error) {
    console.error('Error saving asset name:', error);
    // Revert the optimistic update on error
    const asset = combinedAssets.value.find((item) => item.id === assetId);
    if (asset) {
      asset.name = asset.originalName || asset.name;
    }
    editingAssetId.value = null;
  }
};

const handleCancelEditing = () => {
  editingAssetId.value = null;
};

const handleShowMore = () => {
  showMore.value = true;
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
:global(.vdb-selection-orange::selection) {
  background: #c14103;
  color: #ffffff;
}

:global(.vdb-selection-orange::-moz-selection) {
  background: #c14103;
  color: #ffffff;
}
</style>
