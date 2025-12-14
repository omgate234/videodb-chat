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
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[24px]">
            <!-- Top Section: Icon and Text -->
            <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[20px]">
              <!-- Folder Icon -->
              <div
                class="vdb-c-relative vdb-c-flex vdb-c-h-[88px] vdb-c-w-[104px] vdb-c-items-center vdb-c-justify-center"
              >
                <FolderImage />
              </div>

              <!-- Copy Section -->
              <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[16px]">
                <!-- Welcome Message -->
                <h1
                  class="vdb-c-w-[412px] vdb-c-text-center vdb-c-text-[36px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-black"
                >
                  Welcome,<span class="vdb-c-font-semibold">{{
                    userName ? ` ${userName}` : ''
                  }}</span>
                </h1>

                <!-- Instructional Text -->
                <div class="vdb-c-flex vdb-c-w-[317.39px] vdb-c-flex-col vdb-c-items-center">
                  <p
                    class="vdb-c-w-[412px] vdb-c-text-center vdb-c-text-[20px] vdb-c-font-normal vdb-c-leading-normal vdb-c-text-[#464646]"
                  >
                    Create a collection to get started
                  </p>
                </div>
              </div>
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
      @cancel="handleCancel"
      @create="handleCreate"
    />
  </div>

  <!-- Collections View -->
  <div
    v-else
    class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-bg-white"
  >
    <!-- Header -->
    <div
      class="vdb-c-sticky vdb-c-top-0 vdb-c-flex vdb-c-h-[62px] vdb-c-w-full vdb-c-items-center vdb-c-justify-end vdb-c-border-0 vdb-c-border-b vdb-c-border-solid vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-[10px]"
    >
      <div
        class="vdb-c-flex vdb-c-grow vdb-c-items-center vdb-c-gap-[6px] vdb-c-py-0 vdb-c-pl-[10px] vdb-c-pr-0"
      >
        <div
          class="vdb-c-flex vdb-c-h-[24px] vdb-c-w-[24px] vdb-c-items-center vdb-c-justify-center vdb-c-text-vdb-darkishgrey"
        >
          <HomeIcon :strokeColor="'#1E1E1E'" />
        </div>
        <p
          class="vdb-c-whitespace-nowrap vdb-c-text-[16px] vdb-c-font-semibold vdb-c-leading-[24px] vdb-c-text-[#1E1E1E]"
        >
          Home | All Collections
        </p>
      </div>
    </div>

    <!-- Main Container -->
    <div
      class="vdb-c-flex vdb-c-w-full vdb-c-grow vdb-c-flex-col vdb-c-items-center vdb-c-gap-[30px] vdb-c-overflow-y-auto vdb-c-p-[40px]"
    >
      <!-- Upload Media Card -->
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[20px] vdb-c-border-2 vdb-c-border-solid vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-[82px] vdb-c-py-[42px]"
      >
        <div class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center">
          <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[20px]">
            <!-- Upload Icon -->
            <div
              class="vdb-c-flex vdb-c-items-center vdb-c-rounded-[127.778px] vdb-c-border-[2.556px] vdb-c-border-solid vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-[15.333px]"
            >
              <div class="vdb-c-h-[61.333px] vdb-c-w-[61.333px]">
                <UploadFileIcon :strokeColor="'#000000'" class="vdb-c-h-full vdb-c-w-full" />
              </div>
            </div>

            <!-- Copy Section -->
            <div class="vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-gap-[8px]">
              <!-- Title -->
              <p
                class="vdb-c-whitespace-nowrap vdb-c-text-center vdb-c-text-[18px] vdb-c-font-medium vdb-c-capitalize vdb-c-leading-[24px] vdb-c-text-black"
              >
                Upload Media
              </p>

              <!-- Description -->
              <div class="vdb-c-flex vdb-c-w-[317.39px] vdb-c-flex-col vdb-c-items-start">
                <p
                  class="vdb-c-w-full vdb-c-text-center vdb-c-text-[12px] vdb-c-font-normal vdb-c-leading-[16px] vdb-c-text-[#464646]"
                >
                  Add your files to a collection.
                </p>
              </div>
            </div>

            <!-- Upload Button -->
            <button
              @click="handleUploadClick"
              class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-[4px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-solid vdb-c-border-transparent vdb-c-bg-[#EC5B16] vdb-c-py-[9px] vdb-c-pl-[9px] vdb-c-pr-[13px] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#D65214]"
            >
              <div
                class="vdb-c-flex vdb-c-h-[16.667px] vdb-c-w-[16.667px] vdb-c-items-center vdb-c-justify-center"
              >
                <UploadFileIcon :strokeColor="'white'" />
              </div>
              <span
                class="vdb-c-whitespace-nowrap vdb-c-text-center vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-white"
              >
                Upload file
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Collections Section -->
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-grow vdb-c-flex-col vdb-c-items-start vdb-c-gap-[20px]"
      >
        <!-- Collections Header -->
        <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[10px]">
          <p
            class="vdb-c-whitespace-nowrap vdb-c-text-[16px] vdb-c-font-semibold vdb-c-leading-[24px] vdb-c-text-[#1E1E1E]"
          >
            Collections
          </p>

          <!-- Spacer -->
          <div class="vdb-c-h-[38px] vdb-c-grow vdb-c-bg-white vdb-c-opacity-0"></div>

          <!-- Search Input -->
          <div class="vdb-c-flex vdb-c-items-center">
            <SearchInput
              :items="collections"
              placeholder="Search collections"
              @select-item="handleSelectCollection"
              @update:query="handleSearchQuery"
            />
          </div>
        </div>

        <!-- Collections Grid -->
        <div class="collections-grid vdb-c-w-full vdb-c-grow">
          <!-- Create New Collection Card -->
          <button
            @click="handleCreateCollection"
            @mouseenter="hoveredNewCollectionButton = true"
            @mouseleave="hoveredNewCollectionButton = false"
            class="vdb-c-flex vdb-c-h-[66px] vdb-c-items-center vdb-c-gap-[12px] vdb-c-rounded-[12px] vdb-c-border vdb-c-border-dashed vdb-c-border-[#969696] vdb-c-bg-[#FBFBFB] vdb-c-p-[12px] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-border-[#FFAD6D] hover:vdb-c-bg-[#FFE9D3]"
          >
            <div
              class="vdb-c-flex vdb-c-h-[40px] vdb-c-w-[40px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-overflow-clip"
            >
              <CreateFolderIcon
                :fill="hoveredNewCollectionButton ? '#C14103' : '#464646'"
                class="vdb-c-h-full vdb-c-w-full"
              />
            </div>
            <div class="vdb-c-flex vdb-c-grow vdb-c-items-center">
              <p
                :class="[
                  'vdb-c-grow vdb-c-overflow-hidden vdb-c-text-ellipsis vdb-c-whitespace-nowrap vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-transition-colors vdb-c-duration-200',
                  hoveredNewCollectionButton ? 'vdb-c-text-[#C14103]' : 'vdb-c-text-[#1E1E1E]',
                ]"
              >
                Create new collection
              </p>
            </div>
          </button>

          <!-- Collection Cards -->
          <div
            v-for="collection in displayedCollections"
            :key="collection.id"
            @mouseenter="hoveredCollectionId = collection.id"
            @mouseleave="hoveredCollectionId = null"
            class="vdb-c-relative"
            :data-collection-id="collection.id"
          >
            <button
              @click="handleCollectionClick(collection)"
              :class="[
                'vdb-c-flex vdb-c-h-[66px] vdb-c-w-full vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-[12px] vdb-c-rounded-[12px] vdb-c-p-[12px] vdb-c-transition-all vdb-c-duration-200',
                {
                  'vdb-c-bg-[#EFEFEF]':
                    hoveredCollectionId === collection.id ||
                    (activeOptionsCollectionId === collection.id && !isEditing(collection.id)),
                  'vdb-c-bg-[#F7F7F7]':
                    hoveredCollectionId !== collection.id &&
                    activeOptionsCollectionId !== collection.id,
                },
              ]"
            >
              <!-- Collection Thumbnail - Centered -->
              <div
                class="vdb-c-flex vdb-c-h-[42px] vdb-c-w-[54.732px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center"
              >
                <EmptyFolderImage :width="54.732" :height="42" />
              </div>

              <!-- Collection Content -->
              <div class="vdb-c-flex vdb-c-grow vdb-c-items-center vdb-c-gap-[8px]">
                <div
                  class="vdb-c-flex vdb-c-grow vdb-c-flex-col vdb-c-items-start vdb-c-justify-center"
                >
                  <template v-if="isEditing(collection.id)">
                    <input
                      :id="`edit-input-${collection.id}`"
                      v-model="editingName"
                      type="text"
                      class="vdb-selection-orange vdb-c-w-full vdb-c-truncate vdb-c-bg-[#F7F7F7] vdb-c-px-6 vdb-c-py-2 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-[#1E1E1E] vdb-c-outline-none focus:vdb-c-border-vdb-darkorange"
                      @click.stop
                      @keydown.enter.prevent="handleSaveEdit"
                      @keydown.esc.stop="handleCancelEdit"
                      @blur="handleSaveEdit"
                    />
                  </template>
                  <template v-else>
                    <p
                      class="vdb-c-w-full vdb-c-overflow-hidden vdb-c-text-ellipsis vdb-c-whitespace-nowrap vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-[#1E1E1E]"
                      @dblclick.stop="handleStartEditing(collection)"
                      title="Double-click to rename"
                    >
                      {{ collection.name }}
                    </p>
                  </template>
                </div>
                <!-- Three Dots Menu -->
                <div
                  v-if="!isEditing(collection.id)"
                  class="vdb-c-relative vdb-c-flex-shrink-0"
                  @mouseenter="handleOptionsHover(collection)"
                  @mouseleave="handleOptionsLeave"
                >
                  <button
                    @click.stop
                    class="vdb-c-flex vdb-c-h-[24px] vdb-c-w-[24px] vdb-c-items-center vdb-c-justify-center vdb-c-overflow-clip vdb-c-rounded-6 vdb-c-transition-all vdb-c-duration-200"
                  >
                    <ThreeDotsIcon stroke-color="#1E1E1E" />
                  </button>

                  <!-- Collection Options Menu -->
                  <CollectionOptionsMenu
                    :is-open="activeOptionsCollectionId === collection.id"
                    :collection="collection"
                    @close="activeOptionsCollectionId = null"
                    @chat="handleChatWithCollection"
                    @rename="handleRename"
                    @delete="handleDeleteClick"
                  />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Collection Modal -->
    <CreateCollectionModal
      :showDialog="showCreateCollectionModal"
      :isFirstCollection="shouldShowEmptyState"
      @cancel="handleCancel"
      @create="handleCreate"
    />

    <!-- Delete Collection Modal -->
    <DeleteCollectionModal
      :is-open="showDeleteModal"
      @close="showDeleteModal = false"
      @confirm="handleConfirmDelete"
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
</template>

<script setup>
import { computed, inject, ref, nextTick } from 'vue';
import FolderImage from '../../chat/v2/icons/FolderImage.vue';
import CreateFolderIcon from '../../chat/v2/icons/CreateFolderIcon.vue';
import CreateCollectionModal from '../../chat/v2/CreateCollectionModal.vue';
import HomeIcon from '../../chat/v2/icons/HomeIcon.vue';
import UploadFileIcon from '../../chat/v2/icons/UploadFileIcon.vue';
import SearchInput from '../assets/SearchInput.vue';
import ThreeDotsIcon from '../../chat/v2/icons/ThreeDotsIcon.vue';
import EmptyFolderImage from '../../chat/v2/icons/EmptyFolderImage.vue';
import CollectionOptionsMenu from './CollectionOptionsMenu.vue';
import DeleteCollectionModal from './DeleteCollectionModal.vue';
import UploadModal from '../../chat/v2/UploadModal.vue';

const props = defineProps({
  context: {
    type: Object,
    default: undefined,
  },
});

const context = props.context || inject('videodb-chat-context');

const showCreateCollectionModal = ref(false);
const searchQuery = ref('');
const hoveredCollectionId = ref(null);
const activeOptionsCollectionId = ref(null);
const editingCollectionId = ref(null);
const editingName = ref('');
const showDeleteModal = ref(false);
const collectionToDelete = ref(null);
const showUploadModal = ref(false);
const newlyCreatedCollectionId = ref(null);
const hoveredNewCollectionButton = ref(false);

const collections = computed(() => context?.collections?.value || []);
const configStatus = computed(() => context?.configStatus?.value);
const isSetupComplete = computed(() => {
  return (
    typeof configStatus.value === 'object' &&
    configStatus.value !== null &&
    Object.values(configStatus.value).every((value) => value === true)
  );
});

const shouldShowEmptyState = computed(() => {
  if (!isSetupComplete.value) {
    return true;
  }
  return collections.value.length === 0;
});

const displayedCollections = computed(() => {
  if (!searchQuery.value.trim()) {
    return collections.value;
  }
  const query = searchQuery.value.toLowerCase();
  return collections.value.filter((collection) => collection.name?.toLowerCase().includes(query));
});

const userName = computed(() => {
  return context?.sidebarConfig?.footerConfig?.user?.name || null;
});

const isEditing = (collectionId) => {
  return editingCollectionId.value === collectionId;
};

const handleCreateCollection = () => {
  showCreateCollectionModal.value = true;
};

const handleCancel = () => {
  showCreateCollectionModal.value = false;
};

const handleCreate = async (newCollection) => {
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

const handleSelectCollection = (collection) => {
  context?.handleCollectionClick(collection.id);
};

const handleSearchQuery = (query) => {
  searchQuery.value = query;
};

const handleCollectionClick = (collection) => {
  if (!isEditing(collection.id)) {
    context?.handleCollectionClick(collection.id);
  }
};

const handleOptionsHover = (collection) => {
  activeOptionsCollectionId.value = collection.id;
};

const handleOptionsLeave = () => {
  activeOptionsCollectionId.value = null;
};

const handleStartEditing = (collection) => {
  editingCollectionId.value = collection.id;
  editingName.value = collection.name;
  activeOptionsCollectionId.value = null;
  nextTick(() => {
    const input = document.getElementById(`edit-input-${collection.id}`);
    if (input) {
      input.focus();
      input.select();
    }
  });
};

const handleRename = (collection) => {
  handleStartEditing(collection);
};

const handleSaveEdit = async () => {
  if (!editingCollectionId.value) return;

  const trimmed = (editingName.value || '').trim();
  if (trimmed.length === 0) {
    handleCancelEdit();
    return;
  }

  try {
    await context?.updateCollection(editingCollectionId.value, { name: trimmed });
    editingCollectionId.value = null;
    editingName.value = '';
  } catch (error) {
    console.error('Error updating collection:', error?.message || error);
    handleCancelEdit();
  }
};

const handleCancelEdit = () => {
  editingCollectionId.value = null;
  editingName.value = '';
};

const handleChatWithCollection = (collection) => {
  activeOptionsCollectionId.value = null;
  context?.handleCollectionClick(collection.id);
};

const handleDeleteClick = (collection) => {
  collectionToDelete.value = collection;
  showDeleteModal.value = true;
};

const handleConfirmDelete = async () => {
  if (!collectionToDelete.value) return;

  try {
    await context?.deleteCollection(collectionToDelete.value.id);
    showDeleteModal.value = false;
    collectionToDelete.value = null;
    activeOptionsCollectionId.value = null;
  } catch (error) {
    console.error('Error deleting collection:', error?.message || error);
  }
};

const handleUploadClick = () => {
  showUploadModal.value = true;
};

const handleCancelUpload = () => {
  showUploadModal.value = false;

  if (newlyCreatedCollectionId.value) {
    context?.handleCollectionClick(newlyCreatedCollectionId.value);
    newlyCreatedCollectionId.value = null;
  }
};

const handleUploadWrapper = async (uploadData) => {
  showUploadModal.value = false;

  const targetCollectionId = newlyCreatedCollectionId.value || uploadData.collectionId;

  if (targetCollectionId) {
    context?.handleCollectionClick(targetCollectionId);
  }

  newlyCreatedCollectionId.value = null;

  await context?.handleUpload(uploadData);
};
</script>

<style scoped>
.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  align-content: start;
}

:global(.vdb-selection-orange::selection) {
  background: #c14103;
  color: #ffffff;
}

:global(.vdb-selection-orange::-moz-selection) {
  background: #c14103;
  color: #ffffff;
}
</style>
