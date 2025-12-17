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
          @update:query="(value) => (searchQuery = value)"
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
          v-if="filteredAssets.length === 0"
          class="vdb-c-flex vdb-c-h-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-12 vdb-c-py-60 vdb-c-text-center"
        >
          <EmptyFolderIcon />
          <p class="vdb-c-font-medium vdb-c-text-vdb-darkishgrey">
            {{ isLoadingAssets ? 'Loading...' : 'No files found' }}
          </p>
        </div>
        <VideoList
          v-else
          :asset-results="filteredAssets"
          :get-image-url="getImageUrl"
          :get-audio-url="getAudioUrl"
          :handle-add-message="context?.handleAddMessage"
          :editing-asset-id="editingAssetId"
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
import { useAssetFilters } from './hooks/useAssetFilters.js';
import { useAssetSearch } from './hooks/useAssetSearch.js';
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
    await loadAllAssets();
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
  showCreateCollectionModal.value = false;
  try {
    const createdCollection = await context?.createCollection(
      newCollection.name,
      newCollection.description || ' '
    );

    if (wasEmptyState) {
      newlyCreatedCollectionId.value = createdCollection?.id;
      showUploadModal.value = true;
    }
  } catch (error) {
    console.error('Error creating collection:', error?.message || error);
  }
};

// State
const activeTab = ref('Video');
const selectedCollection = ref(null);
const sortState = ref('');
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
  if (
    activeDropdown.value === 'collection' &&
    collectionRef.value &&
    !collectionRef.value.contains(target)
  ) {
    activeDropdown.value = null;
  }
};

watch(
  () => navState.value?.currentPage,
  (newPage, oldPage) => {
    const isAssetsPage = newPage === 'assets';
    const wasAssetsPage = oldPage === 'assets';
    const pageJustOpened = isAssetsPage && !wasAssetsPage;

    if (pageJustOpened && isSetupComplete.value && collections.value.length > 0) {
      loadAllAssets();
    }
  }
);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Use hooks
// 1. Initialize Base Assets Hook
// This hook now manages its own watchers for data loading
const {
  assets, // Raw API results
  isLoadingAssets,
  getImageUrl,
  getAudioUrl,
  handleDeleteVideo,
  handleDeleteAudio,
  handleDeleteImage,
  loadAllAssets,
} = useAssets(context);

// 2. Initialize Search Hook
// Pass raw assets in. Get search-filtered assets out.
const {
  searchQuery,
  searchFilteredAssets, // <--- Used as input for next hook
  handleSelectItem,
} = useAssetSearch(assets);

// 3. Initialize Filters Hook
// Pass SEARCH RESULTS in. Get final UI assets out.
const { filteredAssets } = useAssetFilters(
  searchFilteredAssets,
  selectedCollection,
  activeTab,
  sortState,
  filterState
);

const handleFilterUpdate = (updatedFilterState) => {
  Object.assign(filterState, updatedFilterState);
};

const handleVideoClick = (video) => {};

const handleStartEditing = (asset) => {
  editingAssetId.value = asset.id;
};

const handleSaveEditing = async ({ assetId, name }) => {
  try {
    // Find the asset in the current results
    const asset = assets.value.find((item) => item.id === assetId);
    if (!asset) return;

    // Store original name for rollback
    const originalName = asset.name;

    // Optimistically update the name
    asset.name = name;

    // Call the appropriate API based on asset type
    let result;
    if (asset.type === 'video') {
      result = await context.callApi(
        `/videodb/collection/${asset.collectionId || asset.collection_id}/video/${assetId}`,
        {
          method: 'PATCH',
          payload: { name: name },
        }
      );
    } else if (asset.type === 'audio') {
      result = await context.callApi(
        `/videodb/collection/${asset.collectionId || asset.collection_id}/audio/${assetId}`,
        {
          method: 'PATCH',
          payload: { name: name },
        }
      );
    } else if (asset.type === 'image') {
      result = await context.callApi(
        `/videodb/collection/${asset.collectionId || asset.collection_id}/image/${assetId}`,
        {
          method: 'PATCH',
          payload: { name: name },
        }
      );
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
