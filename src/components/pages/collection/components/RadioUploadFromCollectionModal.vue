<template>
  <div
    v-if="isOpen"
    id="upload-from-collection-modal"
    class="vdb-c-fixed vdb-c-inset-0 vdb-c-left-0 vdb-c-top-0 vdb-c-z-[2000] vdb-c-flex vdb-c-h-screen vdb-c-w-screen vdb-c-items-center vdb-c-justify-center"
    @click="$emit('close')"
  >
    <div
      class="vdb-c-fixed vdb-c-left-0 vdb-c-top-0 vdb-c-z-[-10] vdb-c-h-screen vdb-c-w-screen vdb-c-bg-[#1e1e1e] vdb-c-opacity-70"
    ></div>
    <div
      class="vdb-c-shadow-xl vdb-c-mx-16 vdb-c-flex vdb-c-h-[90vh] vdb-c-w-full vdb-c-max-w-[1200px] vdb-c-flex-col vdb-c-overflow-hidden vdb-c-rounded-16 vdb-c-bg-white"
      @click.stop
    >
      <div
        class="vdb-c-flex vdb-c-h-60 vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-between vdb-c-gap-16 vdb-c-border-b vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-24"
      >
        <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
          <FolderIcon :stroke-color="'#1E1E1E'" class="vdb-c-h-24 vdb-c-w-24" />
          <h2 class="vdb-c-text-[18px] vdb-c-font-semibold vdb-c-leading-6 vdb-c-text-[#1A1A1A]">
            {{ collectionName }} Asset library
          </h2>
        </div>
        <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-16">
          <SearchInput
            :items="assets"
            @select-item="handleSelectItem"
            @update:query="handleSearchQueryUpdate"
            placeholder="Search files by title"
          />
          <button
            @click="$emit('close')"
            class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-text-[#4D4D4D] vdb-c-transition-colors hover:vdb-c-text-[#1A1A1A]"
          >
            <CrossIcon fill="#4D4D4D" />
          </button>
        </div>
      </div>

      <div
        class="vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-items-center vdb-c-justify-start vdb-c-gap-[40px] vdb-c-overflow-hidden vdb-c-px-[40px] vdb-c-py-[30px]"
      >
        <div
          class="vdb-c-flex vdb-c-w-full vdb-c-flex-wrap vdb-c-items-center vdb-c-justify-between vdb-c-gap-16"
        >
          <AssetTabs :tabs="['Video', 'Audio']" v-model="activeTab" />

          <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-12">
            <div ref="sortRef">
              <SortDropdown
                :is-open="activeDropdown === 'sort'"
                :active-tab="activeTab"
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

        <div
          class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-1 vdb-c-flex-col vdb-c-overflow-hidden"
        >
          <div
            v-if="isLoading && filteredAssets.length === 0"
            class="vdb-c-flex vdb-c-h-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-12 vdb-c-py-60 vdb-c-text-center"
          >
            <EmptyFolderIcon />
            <p class="vdb-c-font-medium vdb-c-text-vdb-darkishgrey">Loading assets...</p>
          </div>
          <div
            v-else-if="!isLoading && filteredAssets.length === 0"
            class="vdb-c-flex vdb-c-h-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-12 vdb-c-py-60 vdb-c-text-center"
          >
            <EmptyFolderIcon />
            <p class="vdb-c-font-medium vdb-c-text-vdb-darkishgrey">No files found</p>
          </div>
          <template v-else>
            <div
              v-if="isLoading"
              class="vdb-c-pointer-events-none vdb-c-absolute vdb-c-inset-0 vdb-c-z-[100] vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-lg vdb-c-bg-white/60 vdb-c-backdrop-blur-[2px]"
            >
              <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
                <div class="vdb-c-h-[24px] vdb-c-w-[24px]">
                  <SpinnerIcon />
                </div>
                <span class="vdb-c-text-sm vdb-c-font-medium vdb-c-text-[#1E1E1E]">Loading...</span>
              </div>
            </div>
            <div class="vdb-c-grid vdb-c-grid-cols-4 vdb-c-gap-20 vdb-c-overflow-y-auto vdb-c-pb-4">
              <div
                v-for="(asset, index) in filteredAssets"
                :key="`asset-${asset.id}-${index}`"
                class="vdb-c-col-span-1"
              >
                <VideoCard
                  v-if="asset.type === 'video'"
                  :item="asset"
                  :index="index"
                  :enabled-selection="true"
                  :is-selected="isAssetSelected(asset)"
                  :selection-mode="props.singleSelection ? 'radio' : 'checkbox'"
                  :disable-options="true"
                  @select="handleAssetSelect"
                />
                <AudioCard
                  v-else-if="asset.type === 'audio'"
                  :item="asset"
                  :index="index"
                  :get-audio-url="getAudioUrl"
                  :enabled-selection="true"
                  :is-selected="isAssetSelected(asset)"
                  :selection-mode="props.singleSelection ? 'radio' : 'checkbox'"
                  :disable-options="true"
                  @select="handleAssetSelect"
                />
                <AudioCard
                  v-else-if="asset.type === 'voices'"
                  :item="asset"
                  :index="index"
                  :get-audio-url="getAudioUrl"
                  :enabled-selection="true"
                  :is-selected="isAssetSelected(asset)"
                  :selection-mode="props.singleSelection ? 'radio' : 'checkbox'"
                  :disable-options="true"
                  @select="handleAssetSelect"
                />
              </div>
            </div>
          </template>
        </div>
      </div>

      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-end vdb-c-gap-10 vdb-c-rounded-b-16 vdb-c-border-t vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-20 vdb-c-py-12"
      >
        <button
          @click="$emit('close')"
          class="vdb-c-rounded-10 vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-16 vdb-c-py-8 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-[#1A1A1A] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#F7F7F7]"
        >
          Cancel
        </button>
        <button
          @click="handleSelect"
          :disabled="selectedAssets.length === 0"
          :class="[
            'vdb-c-rounded-10 vdb-c-px-16 vdb-c-py-8 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-transition-all vdb-c-duration-200',
            selectedAssets.length === 0
              ? 'vdb-c-cursor-not-allowed vdb-c-bg-[#B9B9B9] vdb-c-text-white'
              : 'vdb-c-bg-[#EC5B16] vdb-c-text-white hover:vdb-c-bg-[#D94E14]',
          ]"
        >
          Select
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted, onBeforeUnmount, watch } from 'vue';
import FolderIcon from '../../../chat/v2/icons/FolderIcon.vue';
import CrossIcon from '../../../icons/Cross.vue';
import SearchInput from '../../assets/SearchInput.vue';
import AssetTabs from '../../assets/AssetTabs.vue';
import SortDropdown from '../../assets/SortDropdown.vue';
import FilterDropdown from '../../assets/FilterDropdown.vue';
import EmptyFolderIcon from '../../../chat/v2/icons/EmptyFolderIcon.vue';
import SpinnerIcon from '../../../chat/v2/icons/SpinnerIcon.vue';
import VideoCard from '../../../chat/v2/collection/VideoCard.vue';
import AudioCard from '../../../chat/v2/collection/AudioCard.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  context: {
    type: Object,
    default: undefined,
  },
  singleSelection: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'select']);

const context = props.context || inject('videodb-chat-context', {});

const { activeCollectionData, generateAudioUrl, fetchAssets } = context || {};

const collectionName = computed(() => {
  const collection = activeCollectionData?.value || activeCollectionData;
  return collection?.name || 'Collection';
});

const assets = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const activeTab = ref('Video');
const sortState = ref('');
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
const selectedAssets = ref([]);

const activeDropdown = ref(null);
const sortRef = ref(null);
const filterRef = ref(null);

const typeMap = { Video: 'video', Audio: 'audio' };

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

  const collectionId = activeCollectionData?.value?.id || activeCollectionData?.id;

  return {
    asset_type: typeMap[activeTab.value],
    collection_id: collectionId,
    name_pattern: searchQuery.value.trim() || null,
    sort_by,
    sort_order,
    min_duration,
    max_duration,
    min_size,
    max_size,
    page: 1,
    page_size: 10000,
  };
});

let currentRequestId = 0;
let searchDebounceTimer = null;

const loadAssets = async () => {
  const collectionId = activeCollectionData?.value?.id || activeCollectionData?.id;
  if (!collectionId || !fetchAssets) return;

  const requestId = ++currentRequestId;
  isLoading.value = true;

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
    } else {
      assets.value = [];
    }
  } catch (error) {
    console.error('Error loading assets:', error);
    if (requestId === currentRequestId) {
      assets.value = [];
    }
  } finally {
    if (requestId === currentRequestId) {
      isLoading.value = false;
    }
  }
};

const filteredAssets = computed(() => {
  return assets.value;
});

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      selectedAssets.value = [];
      activeTab.value = 'Video';
      sortState.value = '';
      searchQuery.value = '';
      Object.keys(filterState).forEach((key) => {
        filterState[key] = false;
      });
      loadAssets();
    } else {
      assets.value = [];
      selectedAssets.value = [];
    }
  },
  { immediate: true }
);

watch(
  [activeTab, sortState, filterState],
  () => {
    if (props.isOpen) {
      loadAssets();
    }
  },
  { deep: true }
);

watch(searchQuery, () => {
  if (!props.isOpen) return;
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    loadAssets();
  }, 300);
});

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

const handleSelectItem = (item) => {
  searchQuery.value = item.name || '';
};

const handleSearchQueryUpdate = (value) => {
  searchQuery.value = value;
};

const getAudioUrl = async (collectionId, audioId) => {
  if (!generateAudioUrl) return null;
  const result = await generateAudioUrl(collectionId, audioId);
  return result?.url || null;
};

const isAssetSelected = (asset) => {
  return selectedAssets.value.some(
    (selected) => selected.id === asset.id && selected.type === asset.type
  );
};

const handleAssetSelect = (asset) => {
  if (props.singleSelection) {
    const index = selectedAssets.value.findIndex(
      (selected) => selected.id === asset.id && selected.type === asset.type
    );
    if (index !== -1) {
      selectedAssets.value = [];
    } else {
      selectedAssets.value = [asset];
    }
  } else {
    const index = selectedAssets.value.findIndex(
      (selected) => selected.id === asset.id && selected.type === asset.type
    );
    if (index !== -1) {
      selectedAssets.value.splice(index, 1);
    } else {
      selectedAssets.value.push(asset);
    }
  }
};

const handleSelect = () => {
  emit('select', [...selectedAssets.value]);
  emit('close');
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
.vdb-c-shadow-xl {
  box-shadow:
    0px 10px 25px rgba(0, 0, 0, 0.1),
    0px 20px 25px rgba(0, 0, 0, 0.16);
}
</style>
