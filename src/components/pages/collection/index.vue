<template>
  <div class="collection-page vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col">
    <header
      class="vdb-c-flex vdb-c-h-60 vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-end vdb-c-gap-12 vdb-c-border-b vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-24"
    >
      <div
        v-if="showMore"
        class="vdb-c-flex vdb-c-flex-1 vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-[6px] vdb-c-pl-[10px]"
        @click="handleCollapse"
      >
        <HeavyFolderIcon
          :stroke-color="'#1E1E1E'"
          class="vdb-c-h-[24px] vdb-c-w-[24px] vdb-c-shrink-0"
        />
        <h1
          class="vdb-c-whitespace-nowrap vdb-c-text-[16px] vdb-c-font-semibold vdb-c-leading-[24px] vdb-c-text-vdb-darkishgrey"
        >
          {{ collectionName || 'Collection' }}
        </h1>
      </div>
      <SearchInput
        v-if="showMore"
        :items="assets"
        @select-item="handleSelectItem"
        @update:query="handleSearchQueryUpdate"
        :placeholder="collectionName ? `Search files in '${collectionName}'` : 'Search files'"
      />
      <button
        :disabled="uploadDisabled"
        @click="handleRecordAudioClick"
        :class="[
          'vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-4 vdb-c-rounded-8 vdb-c-border vdb-c-p-8 vdb-c-pr-12 vdb-c-text-sm vdb-c-font-medium vdb-c-transition-colors vdb-c-duration-200',
          uploadDisabled
            ? 'vdb-c-cursor-not-allowed vdb-c-border-[#D9D9D9] vdb-c-bg-[#F7F7F7] vdb-c-text-[#969696]'
            : 'vdb-c-border-[#D9D9D9] vdb-c-bg-white vdb-c-text-[#1E1E1E] hover:vdb-c-border-vdb-orange hover:vdb-c-bg-[#FFF5F0]',
        ]"
      >
        <MicrophoneIcon
          :fill="uploadDisabled ? '#969696' : '#1E1E1E'"
          class="vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-shrink-0"
        />
        <span class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px]">Record Audio</span>
      </button>
      <PrimaryButton :disabled="uploadDisabled" @click="handleUploadClick">
        <AddIcon stroke-color="white" class="vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-shrink-0" />
        <span class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px]">Upload file</span>
      </PrimaryButton>
    </header>
    <div
      v-if="!showMore"
      :class="[!hasAssets && !isLoadingAssets ? 'vdb-c-mb-[60px]' : '']"
      class="vdb-c-flex vdb-c-h-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-[60px] vdb-c-p-[40px]"
    >
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

      <div
        v-if="hasAssets || isLoadingAssets"
        class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-[30px]"
      >
        <div
          class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-between vdb-c-gap-[10px]"
        >
          <AssetTabs :tabs="['Video', 'Audio', 'Images']" v-model="activeTab" />
          <div class="vdb-c-flex-1"></div>
          <SearchInput
            :items="assets"
            @select-item="handleSelectItem"
            @update:query="handleSearchQueryUpdate"
            :placeholder="`Search files in &quot;${collectionName}&quot;`"
            :disabled="isLoadingAssets"
          />
        </div>

        <div class="vdb-c-w-full">
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
            v-if="assets.length > 0"
            :asset-results="assets"
            :is-loading="isLoadingAssets"
            :get-image-url="getImageUrl"
            :get-audio-url="getAudioUrl"
            :handle-add-message="handleAddMessage"
            :editing-asset-id="editingAssetId"
            :show-pagination="false"
            @video-click="handleVideoClick"
            @delete-video="handleDeleteVideo"
            @delete-image="handleDeleteImage"
            @delete-audio="handleDeleteAudio"
            @delete-voice="handleDeleteVoice"
            @start-editing="handleStartEditing"
            @save-editing="handleSaveEditing"
            @cancel-editing="handleCancelEditing"
          />

          <div
            v-if="totalCount > 4 && !isLoadingAssets"
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

    <div
      v-if="showMore"
      class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col vdb-c-overflow-hidden"
    >
      <div
        class="vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-items-center vdb-c-justify-start vdb-c-gap-[40px] vdb-c-overflow-y-auto vdb-c-pt-[30px]"
      >
        <div
          class="vdb-c-flex vdb-c-w-full vdb-c-flex-wrap vdb-c-items-center vdb-c-justify-between vdb-c-gap-16 vdb-c-px-[40px]"
        >
          <AssetTabs :tabs="['Video', 'Audio', 'Images']" v-model="activeTab" />

          <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-12">
            <div ref="sortRef">
              <SortDropdown
                :is-open="activeDropdown === 'sort'"
                :active-tab="activeTab"
                v-model="sortState"
                @toggle="toggleDropdown('sort')"
              />
            </div>

            <div v-if="activeTab !== 'Images'" ref="filterRef">
              <FilterDropdown
                :is-open="activeDropdown === 'filter'"
                :model-value="filterState"
                @update:model-value="handleFilterUpdate"
                @toggle="toggleDropdown('filter')"
              />
            </div>
          </div>
        </div>

        <div class="vdb-c-w-full vdb-c-flex-1 vdb-c-p-24 vdb-c-px-[40px]">
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
            :total-count="totalCount"
            :current-page="currentPage"
            :items-per-page="itemsPerPage"
            :is-loading="isLoadingAssets"
            :get-image-url="getImageUrl"
            :get-audio-url="getAudioUrl"
            :handle-add-message="handleAddMessage"
            :editing-asset-id="editingAssetId"
            :show-pagination="true"
            @update:currentPage="handlePageChange"
            @video-click="handleVideoClick"
            @delete-video="handleDeleteVideo"
            @delete-image="handleDeleteImage"
            @delete-audio="handleDeleteAudio"
            @delete-voice="handleDeleteVoice"
            @start-editing="handleStartEditing"
            @save-editing="handleSaveEditing"
            @cancel-editing="handleCancelEditing"
          />
        </div>
      </div>

      <ShowMoreChatInput :context="context" />
    </div>

    <DeleteCollectionModal
      :is-open="showDeleteCollectionModal"
      :collection-name="collectionToDelete?.name || ''"
      :total-files="totalFilesCount"
      @close="cancelDeleteCollection"
      @delete="confirmDeleteCollection"
    />

    <UploadModal
      :showUploadDialog="showUploadModal"
      :collections="currentCollectionArray"
      :defaultSelectedCollectionId="currentCollection?.id || null"
      @cancel-upload="handleCancelUpload"
      @upload="handleUploadWrapper"
    />

    <RecordAudioModal
      :isOpen="showRecordAudioModal"
      :collectionId="currentCollection?.id || ''"
      :uploadMedia="context?.uploadMedia"
      @close="handleCloseRecordAudio"
      @upload-complete="handleRecordAudioUploadComplete"
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
import ShowMoreChatInput from './components/ShowMoreChatInput.vue';
import DeleteCollectionModal from './DeleteCollectionModal.vue';
import NotificationCenter from '../../chat/elements/NotificationCenter.vue';
import ErrorIcon from '../../chat/v2/icons/ErrorIcon.vue';
import UploadModal from '../../chat/v2/UploadModal.vue';
import RecordAudioModal from '../../chat/v2/RecordAudioModal.vue';
import AddIcon from '../../chat/v2/icons/AddIcon.vue';
import MicrophoneIcon from '../../chat/v2/icons/MicrophoneIcon.vue';
import HeavyFolderIcon from '../../chat/v2/icons/HeavyFolderIcon.vue';

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
  handleAddMessage,
  handleTagAgent,
  showChatInput = true,
  configStatus = null,
  isSetupComplete = false,
  handleUpdateCollectionName,
  deleteCollection,
  fetchAssets,
  navState,
  actions,
  generateImageUrl,
  generateAudioUrl,
  deleteVideo,
  deleteAudio,
  deleteImage,
  deleteVoice,
} = context || {};

const showMore = ref(false);
const showDeleteCollectionModal = ref(false);
const collectionToDelete = ref(null);
const notificationCenterRef = ref(null);

const uploadDisabled = computed(() => !(configStatus !== null && isSetupComplete));

const showUploadModal = ref(false);
const showRecordAudioModal = ref(false);

const handleUploadClick = () => {
  showUploadModal.value = true;
};

const handleCancelUpload = () => {
  showUploadModal.value = false;
};

const handleRecordAudioClick = () => {
  showRecordAudioModal.value = true;
};

const handleCloseRecordAudio = () => {
  showRecordAudioModal.value = false;
};

const handleRecordAudioUploadComplete = async (result) => {
  await loadCollectionAssets();
};

const handleUploadWrapper = async (uploadData) => {
  showUploadModal.value = false;
  try {
    await context?.handleUpload(uploadData);
    await loadCollectionAssets();
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};

const currentCollectionArray = computed(() => {
  return currentCollection.value ? [currentCollection.value] : [];
});

const currentCollection = computed(() => {
  const collection = activeCollectionData?.value ?? activeCollectionData;
  return collection || null;
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
  },
  { immediate: true }
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

const handleRenameCollection = () => {
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
      if (currentCollection.value) {
        currentCollection.value.name = trimmed;
      }
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

const assets = ref([]);
const totalCount = ref(0);
const isLoadingAssets = ref(false);
const activeTab = ref('Video');
const editingAssetId = ref(null);
const sortState = ref('');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 8;
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

const activeDropdown = ref(null);
const sortRef = ref(null);
const filterRef = ref(null);

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
};

const handleFilterUpdate = (updatedFilterState) => {
  Object.assign(filterState, updatedFilterState);
};

const typeMap = { Video: 'video', Audio: 'audio', Images: 'image' };

const apiParams = computed(() => {
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
    collection_id: currentCollection.value?.id,
    name_pattern: searchQuery.value.trim() || null,
    sort_by,
    sort_order,
    min_duration,
    max_duration,
    min_size,
    max_size,
    page: showMore.value ? currentPage.value : 1,
    page_size: showMore.value ? itemsPerPage : 4,
  };
});

let currentRequestId = 0;

const loadCollectionAssets = async () => {
  const collectionId = currentCollection.value?.id;
  if (!collectionId || !fetchAssets) return;

  const requestId = ++currentRequestId;
  isLoadingAssets.value = true;

  try {
    const response = await fetchAssets(apiParams.value);

    if (requestId !== currentRequestId) return;

    if (response.status === 'success') {
      const rawAssets = response.data?.data?.assets || [];
      assets.value = rawAssets.map((asset) => ({
        ...asset,
        type: asset.asset_type || typeMap[activeTab.value],
        collectionId: asset.collection_id || collectionId,
        collectionName: collectionName.value,
      }));
      totalCount.value =
        response.data?.data?.pagination?.total_count ||
        response.data?.data?.total_count ||
        assets.value.length;
    } else {
      assets.value = [];
      totalCount.value = 0;
    }
  } catch (error) {
    console.error('Error loading collection assets:', error);
    if (requestId === currentRequestId) {
      assets.value = [];
      totalCount.value = 0;
    }
  } finally {
    if (requestId === currentRequestId) {
      isLoadingAssets.value = false;
    }
  }
};

let searchDebounceTimer = null;

watch(
  [activeTab, sortState, filterState, showMore],
  () => {
    currentPage.value = 1;
    loadCollectionAssets();
  },
  { deep: true }
);

watch(searchQuery, () => {
  currentPage.value = 1;
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    loadCollectionAssets();
  }, 300);
});

watch(currentPage, () => {
  loadCollectionAssets();
});

watch(
  () => ({
    currentPage: navState?.currentPage,
    collectionId: currentCollection.value?.id,
  }),
  async (newState, oldState) => {
    const isCollectionPage = newState.currentPage === 'collection';
    const wasCollectionPage = oldState?.currentPage === 'collection';
    const collectionChanged = newState.collectionId !== oldState?.collectionId;
    const pageJustOpened = isCollectionPage && !wasCollectionPage;

    if (collectionChanged) {
      assets.value = [];
      totalCount.value = 0;
      showMore.value = false;
      currentPage.value = 1;
      searchQuery.value = '';
    }

    if (isCollectionPage && newState.collectionId && (pageJustOpened || collectionChanged)) {
      await loadCollectionAssets();
    }
  },
  { immediate: true, deep: true }
);

const hasAssets = computed(() => {
  return assets.value.length > 0 || totalCount.value > 0;
});

const totalFilesCount = computed(() => {
  return totalCount.value;
});

const handleSelectItem = (item) => {
  searchQuery.value = item.name || '';
};

const handleSearchQueryUpdate = (value) => {
  searchQuery.value = value;
};

const getImageUrl = async (collectionId, imageId) => {
  if (!generateImageUrl) return null;
  const result = await generateImageUrl(collectionId, imageId);
  return result?.url || null;
};

const getAudioUrl = async (collectionId, audioId) => {
  if (!generateAudioUrl) return null;
  const result = await generateAudioUrl(collectionId, audioId);
  return result?.url || null;
};

const handleDeleteVideo = async (video) => {
  if (deleteVideo && video.collectionId && video.id) {
    try {
      await deleteVideo(video.collectionId, video.id);
      await loadCollectionAssets();
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  }
};

const handleDeleteAudio = async (audio) => {
  if (deleteAudio && audio.collectionId && audio.id) {
    try {
      await deleteAudio(audio.collectionId, audio.id);
      await loadCollectionAssets();
    } catch (error) {
      console.error('Error deleting audio:', error);
    }
  }
};

const handleDeleteImage = async (image) => {
  if (deleteImage && image.collectionId && image.id) {
    try {
      await deleteImage(image.collectionId, image.id);
      await loadCollectionAssets();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
};

const handleDeleteVoice = async (voice) => {
  if (deleteVoice && voice.collectionId && voice.id) {
    try {
      await deleteVoice(voice.collectionId, voice.id);
      await loadCollectionAssets();
    } catch (error) {
      console.error('Error deleting voice:', error);
    }
  }
};

const handleVideoClick = (video) => {
  if (handleAddMessage) {
    handleAddMessage({ text: video.name, video_id: video.id, from_event: true });
  }
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
    } else if (asset.type === 'voices') {
      result = await context.callApi(`/videodb/collection/${collectionId}/voice/${assetId}`, {
        method: 'PATCH',
        payload: { name: name },
      });
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

const handleShowMore = () => {
  showMore.value = true;
};

const handleCollapse = () => {
  showMore.value = false;
  currentPage.value = 1;
  assets.value = [];
  loadCollectionAssets();
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
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
