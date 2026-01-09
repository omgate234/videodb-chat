<template>
  <!-- Empty State -->
  <div
    v-if="shouldShowEmptyState"
    class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-items-center vdb-c-justify-center vdb-c-bg-white"
  >
    <!-- Outer Container with 40px padding -->
    <div class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col vdb-c-p-[40px]">
      <!-- Inner Bordered Container -->
      <div
        class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[20px] vdb-c-border-2 vdb-c-border-solid vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-[82px] vdb-c-py-[32px]"
      >
        <!-- Content Container -->
        <div class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center">
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[20px]">
            <!-- Folder Icon -->
            <div
              class="vdb-c-relative vdb-c-flex vdb-c-h-[88px] vdb-c-w-[104px] vdb-c-items-center vdb-c-justify-center"
            >
              <FolderImage />
            </div>

            <!-- Copy Section -->
            <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center">
              <!-- Title -->
              <h1
                class="vdb-c-text-center vdb-c-text-[30px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-black"
              >
                No assets yet
              </h1>
            </div>

            <!-- Description Text -->
            <div class="vdb-c-flex vdb-c-w-[492px] vdb-c-flex-col vdb-c-items-center">
              <p
                class="vdb-c-w-full vdb-c-text-center vdb-c-text-[18px] vdb-c-font-normal vdb-c-leading-[28px] vdb-c-text-[#242424]"
              >
                Upload videos, images, or audio to start building your library. But first, create a
                collection.
              </p>
            </div>

            <!-- Create Collection Button -->
            <button
              @click="handleCreateCollection"
              class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[6px] vdb-c-rounded-[12px] vdb-c-border vdb-c-border-solid vdb-c-border-[#C14103] vdb-c-bg-[#EC5B16] vdb-c-py-[11px] vdb-c-pl-[18px] vdb-c-pr-[21px] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#D65214]"
            >
              <div
                class="vdb-c-flex vdb-c-h-[30px] vdb-c-w-[30px] vdb-c-items-center vdb-c-justify-center"
              >
                <CreateFolderIcon :fill="'white'" />
              </div>
              <span
                class="vdb-c-flex vdb-c-h-[30px] vdb-c-w-[135px] vdb-c-items-center vdb-c-justify-center vdb-c-text-center vdb-c-text-[16px] vdb-c-font-semibold vdb-c-leading-normal vdb-c-text-white"
              >
                Create Collection
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Collection Modal -->
    <CreateCollectionModal
      :showDialog="showCreateCollectionModal"
      :isFirstCollection="shouldShowEmptyState"
      :isCreating="isCreatingCollection"
      @cancel="handleCancelCreateCollection"
      @create="handleCreateCollectionFromEmpty"
    />

    <!-- Upload Modal -->
    <UploadModal
      :showUploadDialog="showUploadModal"
      :collections="collections"
      :defaultSelectedCollectionId="newlyCreatedCollectionId"
      @cancel-upload="handleCancelUpload"
      @upload="handleUploadWrapper"
    />
  </div>

  <!-- Normal Asset Library View -->
  <div
    v-else
    class="vdb-c-flex vdb-c-h-screen vdb-c-w-full vdb-c-flex-col vdb-c-overflow-hidden vdb-c-bg-white"
  >
    <!-- TOP HEADER -->
    <header
      class="vdb-c-flex vdb-c-h-60 vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-between vdb-c-gap-16 vdb-c-border-b vdb-c-border-roy vdb-c-bg-white vdb-c-px-24 vdb-c-text-vdb-darkishgrey"
    >
      <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
        <LibraryIcon class="vdb-c-h-24 vdb-c-w-24" />
        <p class="vdb-c-text-subheader2 vdb-c-font-semibold">Asset Library</p>
      </div>

      <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-16">
        <SearchInput
          :items="assets"
          @select-item="handleSelectItem"
          @update:query="handleSearchUpdate"
        />
        <PrimaryButton
          class="vdb-c-flex-shrink-0"
          :disabled="uploadDisabled"
          @click="handleUploadClick"
        >
          <AddIcon stroke-color="white" class="vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-shrink-0" />
          <span class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px]">
            Upload file
          </span>
        </PrimaryButton>
      </div>
    </header>

    <div
      class="vdb-c-flex vdb-c-h-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-start vdb-c-gap-[40px] vdb-c-px-[40px] vdb-c-py-[30px]"
    >
      <!-- CONTROLS BAR -->
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-flex-wrap vdb-c-items-center vdb-c-justify-between vdb-c-gap-16"
      >
        <!-- Type Tabs -->
        <AssetTabs :tabs="['Video', 'Audio', 'Images', 'Voices']" v-model="activeTab" />

        <!-- Filters & Sorts -->
        <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-12">
          <div ref="sortRef">
            <SortDropdown
              :is-open="activeDropdown === 'sort'"
              :active-tab="activeTab"
              v-model="sortState"
              @toggle="toggleDropdown('sort')"
            />
          </div>

          <div v-if="activeTab !== 'Images' && activeTab !== 'Voices'" ref="filterRef">
            <FilterDropdown
              :is-open="activeDropdown === 'filter'"
              :model-value="filterState"
              @update:model-value="handleFilterUpdate"
              @toggle="toggleDropdown('filter')"
            />
          </div>

          <div ref="collectionRef">
            <CollectionDropdown
              :is-open="activeDropdown === 'collection'"
              :collections="collections"
              v-model="selectedCollection"
              @toggle="toggleDropdown('collection')"
            />
          </div>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <div class="vdb-c-h-full vdb-c-w-full vdb-c-p-24">
        <div
          v-if="assets.length === 0"
          class="vdb-c-flex vdb-c-h-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-12 vdb-c-py-60 vdb-c-text-center"
        >
          <EmptyFolderIcon />
          <p class="vdb-c-font-medium vdb-c-text-vdb-darkishgrey">
            {{ isLoadingAssets ? 'Loading...' : 'No files found' }}
          </p>
        </div>
        <VideoList
          v-else
          :asset-results="assets"
          :total-count="totalAssets"
          :current-page="currentPage"
          :items-per-page="itemsPerPage"
          :is-loading="isLoadingAssets"
          :get-image-url="getImageUrl"
          :get-audio-url="getAudioUrl"
          :handle-add-message="context?.handleAddMessage"
          :editing-asset-id="editingAssetId"
          @video-click="handleVideoClick"
          @delete-video="handleDeleteVideoWrapper"
          @delete-image="handleDeleteImageWrapper"
          @delete-audio="handleDeleteAudioWrapper"
          @delete-voice="handleDeleteVoiceWrapper"
          @start-editing="handleStartEditing"
          @save-editing="handleSaveEditing"
          @cancel-editing="handleCancelEditing"
          @update:currentPage="handlePageChange"
        />
      </div>
    </div>

    <!-- Upload Modal -->
    <UploadModal
      :showUploadDialog="showUploadModal"
      :collections="collections"
      :defaultSelectedCollectionId="null"
      @cancel-upload="handleCancelUpload"
      @upload="handleUploadWrapper"
    />
  </div>
</template>

<script setup>
import { inject, computed, ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue';
import LibraryIcon from '../../chat/v2/icons/LibraryIcon.vue';
import PrimaryButton from '../../chat/v2/elements/PrimaryButton.vue';
import SearchInput from './SearchInput.vue';
import VideoList from '../../chat/v2/collection/VideoList.vue';
import AssetTabs from './AssetTabs.vue';
import SortDropdown from './SortDropdown.vue';
import FilterDropdown from './FilterDropdown.vue';
import CollectionDropdown from './CollectionDropdown.vue';
import EmptyFolderIcon from '../../chat/v2/icons/EmptyFolderIcon.vue';
import UploadModal from '../../chat/v2/UploadModal.vue';
import FolderImage from '../../chat/v2/icons/FolderImage.vue';
import CreateFolderIcon from '../../chat/v2/icons/CreateFolderIcon.vue';
import CreateCollectionModal from '../../chat/v2/CreateCollectionModal.vue';
import { useAssets } from './hooks/useAssets.js';
import AddIcon from '../../chat/v2/icons/AddIcon.vue';

const props = defineProps({
  context: {
    type: Object,
    default: undefined,
  },
});

const context = props.context || inject('videodb-chat-context');
const configStatus = computed(() => context?.configStatus?.value ?? null);
const isSetupComplete = computed(() => context?.isSetupComplete?.value ?? false);
const collections = computed(() => context?.collections?.value || []);
const navState = computed(() => context?.navState);

const uploadDisabled = computed(
  () => !((configStatus?.value ?? null) !== null && isSetupComplete?.value)
);

const shouldShowEmptyState = computed(() => {
  if (!isSetupComplete.value) {
    return true;
  }
  return collections.value.length === 0;
});

const showUploadModal = ref(false);
const showCreateCollectionModal = ref(false);
const isCreatingCollection = ref(false);
const newlyCreatedCollectionId = ref(null);

const handleUploadClick = () => {
  showUploadModal.value = true;
};

const handleCancelUpload = () => {
  showUploadModal.value = false;
  if (newlyCreatedCollectionId.value) {
    newlyCreatedCollectionId.value = null;
  }
};

const handleUploadWrapper = async (uploadData) => {
  showUploadModal.value = false;
  if (newlyCreatedCollectionId.value) {
    newlyCreatedCollectionId.value = null;
  }

  try {
    await context?.handleUpload(uploadData);
    await loadAssets(apiParams.value);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};

const handleCreateCollection = () => {
  showCreateCollectionModal.value = true;
};

const handleCancelCreateCollection = () => {
  showCreateCollectionModal.value = false;
};

const handleCreateCollectionFromEmpty = async (newCollection) => {
  const wasEmptyState = shouldShowEmptyState.value || collections.value.length === 0;

  try {
    isCreatingCollection.value = true;

    const createdCollection = await context?.createCollection(
      newCollection.name,
      newCollection.description || ' '
    );

    showCreateCollectionModal.value = false;

    if (wasEmptyState) {
      newlyCreatedCollectionId.value = createdCollection?.id;
      showUploadModal.value = true;
    }
  } catch (error) {
    console.error('Error creating collection:', error?.message || error);
  } finally {
    isCreatingCollection.value = false;
  }
};

// UI State
const activeTab = ref('Video');
const selectedCollection = ref(null);
const sortState = ref('');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 8;
const editingAssetId = ref(null);
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
const collectionRef = ref(null);

const toggleDropdown = (name) => {
  activeDropdown.value = activeDropdown.value === name ? null : name;
};

const handleClickOutside = (event) => {
  if (!activeDropdown.value) return;
  const target = event.target;

  if (activeDropdown.value === 'sort' && sortRef.value && !sortRef.value.contains(target)) {
    activeDropdown.value = null;
  }
  if (activeDropdown.value === 'filter' && filterRef.value && !filterRef.value.contains(target)) {
    activeDropdown.value = null;
  }
  if (
    activeDropdown.value === 'collection' &&
    collectionRef.value &&
    !collectionRef.value.contains(target)
  ) {
    activeDropdown.value = null;
  }
};

// Initialize the assets hook
const {
  assets,
  totalAssets,
  isLoadingAssets,
  loadAssets,
  getImageUrl,
  getAudioUrl,
  handleDeleteVideo,
  handleDeleteAudio,
  handleDeleteImage,
  handleDeleteVoice,
} = useAssets(context);

// Map UI state to API parameters
const apiParams = computed(() => {
  const typeMap = {
    Video: 'video',
    Audio: 'audio',
    Images: 'image',
    Voices: 'voices',
  };

  let sort_by = 'created_at';
  let sort_order = 'desc';

  if (sortState.value === 'az') {
    sort_by = 'name';
    sort_order = 'asc';
  } else if (sortState.value === 'za') {
    sort_by = 'name';
    sort_order = 'desc';
  } else if (sortState.value === 'short_long') {
    sort_by = 'duration';
    sort_order = 'asc';
  } else if (sortState.value === 'long_short') {
    sort_by = 'duration';
    sort_order = 'desc';
  } else if (sortState.value === 'small_large') {
    sort_by = 'size';
    sort_order = 'asc';
  } else if (sortState.value === 'large_small') {
    sort_by = 'size';
    sort_order = 'desc';
  } else if (sortState.value === 'newest') {
    sort_by = 'created_at';
    sort_order = 'desc';
  } else if (sortState.value === 'oldest') {
    sort_by = 'created_at';
    sort_order = 'asc';
  }

  let min_duration = null;
  let max_duration = null;
  let min_size = null;
  let max_size = null;

  // Duration filters (in seconds)
  if (filterState.dur_less_1) {
    max_duration = 60;
  } else if (filterState.dur_1_15) {
    min_duration = 60;
    max_duration = 900;
  } else if (filterState.dur_15_30) {
    min_duration = 900;
    max_duration = 1800;
  } else if (filterState.dur_more_30) {
    min_duration = 1800;
  }

  // File size filters (in bytes: MB * 1024 * 1024)
  if (filterState.size_less_10) {
    max_size = 10 * 1024 * 1024;
  } else if (filterState.size_10_100) {
    min_size = 10 * 1024 * 1024;
    max_size = 100 * 1024 * 1024;
  } else if (filterState.size_100_500) {
    min_size = 100 * 1024 * 1024;
    max_size = 500 * 1024 * 1024;
  } else if (filterState.size_more_500) {
    min_size = 500 * 1024 * 1024;
  }

  return {
    asset_type: typeMap[activeTab.value],
    collection_id: selectedCollection.value?.id || null,
    name_pattern: searchQuery.value.trim() || null,
    sort_by,
    sort_order,
    min_duration,
    max_duration,
    min_size,
    max_size,
    page: currentPage.value,
    page_size: itemsPerPage,
  };
});

// Debounce timer for search
let searchDebounceTimer = null;

// Watch for filter/sort/tab/collection changes - reset page and fetch immediately
watch(
  [activeTab, selectedCollection, sortState, filterState],
  () => {
    currentPage.value = 1;
    loadAssets(apiParams.value);
  },
  { deep: true }
);

// Watch search query with debounce
watch(searchQuery, () => {
  currentPage.value = 1;
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    loadAssets(apiParams.value);
  }, 300);
});

// Watch page changes
watch(currentPage, () => {
  loadAssets(apiParams.value);
});

// Watch for navigation to assets page
watch(
  () => navState.value?.currentPage,
  (newPage, oldPage) => {
    const isAssetsPage = newPage === 'assets';
    const wasAssetsPage = oldPage === 'assets';
    const pageJustOpened = isAssetsPage && !wasAssetsPage;

    if (pageJustOpened && isSetupComplete.value && collections.value.length > 0) {
      loadAssets(apiParams.value);
    }
  }
);

// Initial load when setup is complete
watch(
  [isSetupComplete, collections],
  ([setup, cols]) => {
    if (setup && cols.length > 0 && navState.value?.currentPage === 'assets') {
      loadAssets(apiParams.value);
    }
  },
  { immediate: true }
);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
});

// Event handlers
const handleSearchUpdate = (value) => {
  searchQuery.value = value;
};

const handleSelectItem = (item) => {
  searchQuery.value = item.name || '';
};

const handleFilterUpdate = (updatedFilterState) => {
  Object.assign(filterState, updatedFilterState);
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

const handleVideoClick = () => {};

const handleDeleteVideoWrapper = async (video) => {
  await handleDeleteVideo(video, apiParams.value);
};

const handleDeleteAudioWrapper = async (audio) => {
  await handleDeleteAudio(audio, apiParams.value);
};

const handleDeleteImageWrapper = async (image) => {
  await handleDeleteImage(image, apiParams.value);
};

const handleDeleteVoiceWrapper = async (voice) => {
  await handleDeleteVoice(voice, apiParams.value);
};

const handleStartEditing = (asset) => {
  editingAssetId.value = asset.id;
};

const handleSaveEditing = async ({ assetId, name }) => {
  try {
    const asset = assets.value.find((item) => item.id === assetId);
    if (!asset) return;

    const originalName = asset.name;
    asset.name = name;

    let result;
    if (asset.type === 'video') {
      result = await context.callApi(
        `/videodb/collection/${asset.collectionId || asset.collection_id}/video/${assetId}`,
        { method: 'PATCH', payload: { name } }
      );
    } else if (asset.type === 'audio') {
      result = await context.callApi(
        `/videodb/collection/${asset.collectionId || asset.collection_id}/audio/${assetId}`,
        { method: 'PATCH', payload: { name } }
      );
    } else if (asset.type === 'image') {
      result = await context.callApi(
        `/videodb/collection/${asset.collectionId || asset.collection_id}/image/${assetId}`,
        { method: 'PATCH', payload: { name } }
      );
    } else if (asset.type === 'voices') {
      result = await context.callApi(
        `/videodb/collection/${asset.collectionId || asset.collection_id}/voice/${assetId}`,
        { method: 'PATCH', payload: { name } }
      );
    }

    if (result?.status === 'success') {
      editingAssetId.value = null;
    } else {
      asset.name = originalName;
      throw new Error('Rename failed');
    }
  } catch (error) {
    console.error('Error saving asset name:', error);
    const asset = assets.value.find((item) => item.id === assetId);
    if (asset) {
      asset.name = asset.originalName || asset.name;
    }
    editingAssetId.value = null;
  }
};

const handleCancelEditing = () => {
  editingAssetId.value = null;
};
</script>
