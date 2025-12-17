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
      <!-- Header -->
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
            :items="combinedAssets"
            @select-item="handleSelectItem"
            @update:query="handleSearchQueryUpdate"
            :placeholder="`Search files in '${collectionName}'`"
          />
          <button
            @click="$emit('close')"
            class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-text-[#4D4D4D] vdb-c-transition-colors hover:vdb-c-text-[#1A1A1A]"
          >
            <CrossIcon fill="#4D4D4D" />
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div
        class="vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-items-center vdb-c-justify-start vdb-c-gap-[40px] vdb-c-overflow-hidden vdb-c-px-[40px] vdb-c-py-[30px]"
      >
        <!-- Controls Bar -->
        <div
          class="vdb-c-flex vdb-c-w-full vdb-c-flex-wrap vdb-c-items-center vdb-c-justify-between vdb-c-gap-16"
        >
          <!-- Type Tabs -->
          <AssetTabs :tabs="['Video', 'Audio', 'Voices']" v-model="activeTab" />

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

            <div v-if="activeTab !== 'Voices'" ref="filterRef">
              <FilterDropdown
                :is-open="activeDropdown === 'filter'"
                :model-value="filterState"
                @update:model-value="handleFilterUpdate"
                @toggle="toggleDropdown('filter')"
              />
            </div>
          </div>
        </div>

        <!-- Asset Grid -->
        <div class="vdb-c-flex vdb-c-w-full vdb-c-flex-1 vdb-c-flex-col vdb-c-overflow-hidden">
          <div
            v-if="isLoadingAssets && filteredAssets.length === 0"
            class="vdb-c-flex vdb-c-h-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-12 vdb-c-py-60 vdb-c-text-center"
          >
            <EmptyFolderIcon />
            <p class="vdb-c-font-medium vdb-c-text-vdb-darkishgrey">Loading assets...</p>
          </div>
          <div
            v-else-if="!isLoadingAssets && filteredAssets.length === 0"
            class="vdb-c-flex vdb-c-h-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-12 vdb-c-py-60 vdb-c-text-center"
          >
            <EmptyFolderIcon />
            <p class="vdb-c-font-medium vdb-c-text-vdb-darkishgrey">No files found</p>
          </div>
          <div
            v-else
            class="vdb-c-grid vdb-c-grid-cols-4 vdb-c-gap-20 vdb-c-overflow-y-auto vdb-c-pb-4"
          >
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
        </div>
      </div>

      <!-- Footer -->
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
          {{ props.singleSelection ? 'Select' : 'Select' }}
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
import VideoCard from '../../../chat/v2/collection/VideoCard.vue';
import AudioCard from '../../../chat/v2/collection/AudioCard.vue';
import { useAssetSearch } from '../../assets/hooks/useAssetSearch.js';
import { useAssetFilters } from '../../assets/hooks/useAssetFilters.js';

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

const {
  activeCollectionData,
  activeCollectionVideos,
  activeCollectionAudios,
  activeCollectionImages,
  generateImageUrl,
  generateAudioUrl,
  fetchAssets,
} = context || {};

const collectionName = computed(() => {
  const collection = activeCollectionData?.value || activeCollectionData;
  return collection?.name || 'Collection';
});

// State for voices
const activeCollectionVoices = ref([]);
const isLoadingAssets = ref(false);

// Fetch voices when modal opens
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen && fetchAssets) {
      isLoadingAssets.value = true;
      const collectionId = activeCollectionData?.value?.id || activeCollectionData?.id;
      if (collectionId) {
        try {
          const voicesRes = await fetchAssets({
            collection_id: collectionId,
            asset_type: 'voices',
            page: 1,
            page_size: 10000,
          });
          if (voicesRes?.status === 'success' && voicesRes?.data?.data?.assets) {
            activeCollectionVoices.value = voicesRes.data.data.assets;
          } else {
            activeCollectionVoices.value = [];
          }
        } catch (error) {
          console.error('Error fetching voices:', error);
          activeCollectionVoices.value = [];
        } finally {
          isLoadingAssets.value = false;
        }
      } else {
        isLoadingAssets.value = false;
      }
    } else if (!isOpen) {
      activeCollectionVoices.value = [];
      isLoadingAssets.value = false;
    }
  },
  { immediate: true }
);

// Combine videos, audios, and voices into a single array (no images)
const combinedAssets = computed(() => {
  const assets = [];
  const collectionId = activeCollectionData?.value?.id || activeCollectionData?.id;
  const collectionNameValue = collectionName.value;

  const videos = activeCollectionVideos?.value || activeCollectionVideos || [];
  const audios = activeCollectionAudios?.value || activeCollectionAudios || [];
  const voices = activeCollectionVoices?.value || [];

  if (Array.isArray(videos)) {
    videos.forEach((video) => {
      assets.push({
        ...video,
        type: 'video',
        collectionId: collectionId || video.collection_id,
        collectionName: collectionNameValue,
      });
    });
  }

  if (Array.isArray(audios)) {
    audios.forEach((audio) => {
      assets.push({
        ...audio,
        type: 'audio',
        collectionId: collectionId || audio.collection_id,
        collectionName: collectionNameValue,
      });
    });
  }

  if (Array.isArray(voices)) {
    voices.forEach((voice) => {
      assets.push({
        ...voice,
        type: 'voices',
        collectionId: collectionId || voice.collection_id,
        collectionName: collectionNameValue,
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

// State
const activeTab = ref('Video');
const sortState = ref('');
const filterState = reactive({
  dur_less_1: false,
  dur_1_15: false,
  dur_15_30: false,
  dur_more_30: false,
});

// Selected assets
const selectedAssets = ref([]);

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

// Use filter hook
const { filteredAssets } = useAssetFilters(
  searchFilteredAssets,
  ref(null), // selectedCollection - not used in modal
  activeTab,
  sortState,
  filterState
);

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

// Check if asset is selected
const isAssetSelected = (asset) => {
  return selectedAssets.value.some(
    (selected) => selected.id === asset.id && selected.type === asset.type
  );
};

// Handle asset selection
const handleAssetSelect = (asset) => {
  if (props.singleSelection) {
    // Radio mode: only one selection allowed
    const index = selectedAssets.value.findIndex(
      (selected) => selected.id === asset.id && selected.type === asset.type
    );

    if (index !== -1) {
      // Deselect if already selected
      selectedAssets.value = [];
    } else {
      // Select this asset and deselect others
      selectedAssets.value = [asset];
    }
  } else {
    // Checkbox mode: multiple selections allowed
    const index = selectedAssets.value.findIndex(
      (selected) => selected.id === asset.id && selected.type === asset.type
    );

    if (index !== -1) {
      // Deselect
      selectedAssets.value.splice(index, 1);
    } else {
      // Select
      selectedAssets.value.push(asset);
    }
  }
};

const handleSelect = () => {
  emit('select', [...selectedAssets.value]);
  emit('close');
};

// Reset selection when modal closes
watch(
  () => props.isOpen,
  (newValue) => {
    if (!newValue) {
      selectedAssets.value = [];
    }
  }
);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.vdb-c-shadow-xl {
  box-shadow:
    0px 10px 25px rgba(0, 0, 0, 0.1),
    0px 20px 25px rgba(0, 0, 0, 0.16);
}
</style>
