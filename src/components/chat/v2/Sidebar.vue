<template>
  <div
    ref="sidebarRef"
    id="sidebar-container"
    class="vdb-c-border-r-1 vdb-c-border-r-solid vdb-c-relative vdb-c-overflow-auto vdb-c-border-r vdb-c-border-r-[#E5E7EB] vdb-c-pl-6 vdb-c-pr-16"
  >
    <div class="vdb-c-sticky vdb-c-top-0 vdb-c-z-10 vdb-c-bg-white">
      <div class="vdb-c-flex vdb-c-items-center vdb-c-justify-between vdb-c-px-10 vdb-c-pt-20">
        <div class="vdb-c-cursor-pointer">
          <component v-if="config.icon" :is="config.icon" class="vdb-c-mb-20 vdb-c-h-24" />
        </div>
      </div>

      <!-- Action Panel -->
      <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-1">
        <div class="vdb-c-relative">
          <button
            ref="newChatButtonRef"
            class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-bg-black vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-pam disabled:vdb-c-bg-[#B9B9B9]"
            :disabled="newSessionButtonDisabled"
            @click="context.handleCreateNewSession()"
            @mouseenter="showNewChatTooltip = hasNoCollections"
            @mouseleave="showNewChatTooltip = false"
          >
            <ComposeAltIcon :stroke-color="'white'" />
            <span class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-white"
              >New chat</span
            >
          </button>
          <Teleport to="body">
            <div
              v-if="showNewChatTooltip && newChatButtonRef"
              class="vdb-c-fixed"
              :style="{
                top: `${newChatButtonRef.getBoundingClientRect().top + newChatButtonRef.getBoundingClientRect().height / 2 - 16}px`,
                left: `${newChatButtonRef.getBoundingClientRect().right + 8}px`,
              }"
            >
              <Tooltip text="Please create collection and upload content to chat" />
            </div>
          </Teleport>
        </div>

        <button
          @click="context.handleNavigateToDefault()"
          class="vdb-c-mt-8 vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200"
          :class="{
            'vdb-c-bg-[#FFE9D3]': currentPage === 'default',
            'vdb-c-text-[#821F0C]': currentPage === 'default',
            'vdb-c-text-vdb-darkishgrey hover:vdb-c-bg-[#EFEFEF] hover:vdb-c-text-black':
              currentPage !== 'default',
          }"
        >
          <HomeIcon />
          <span class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5">Home</span>
        </button>

        <div class="vdb-c-relative">
          <button
            ref="assetLibraryButtonRef"
            @click="!assetLibraryButtonDisabled && context.handleNavigateToAssets()"
            class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200"
            :class="{
              'vdb-c-bg-[#FFE9D3] vdb-c-text-[#821F0C]':
                currentPage === 'assets' && !assetLibraryButtonDisabled,
              'vdb-c-text-vdb-darkishgrey hover:vdb-c-bg-[#EFEFEF] hover:vdb-c-text-black':
                !assetLibraryButtonDisabled && currentPage !== 'assets',
              'vdb-c-cursor-not-allowed vdb-c-text-[#B9B9B9]': assetLibraryButtonDisabled,
            }"
            @mouseenter="showAssetLibraryTooltip = hasNoCollections"
            @mouseleave="showAssetLibraryTooltip = false"
          >
            <LibraryIcon :stroke-color="assetLibraryButtonDisabled ? '#B9B9B9' : undefined" />
            <span class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5">Asset Library</span>
          </button>
          <Teleport to="body">
            <div
              v-if="showAssetLibraryTooltip && assetLibraryButtonRef"
              class="vdb-c-fixed"
              :style="{
                top: `${assetLibraryButtonRef.getBoundingClientRect().top + assetLibraryButtonRef.getBoundingClientRect().height / 2 - 16}px`,
                left: `${assetLibraryButtonRef.getBoundingClientRect().right + 8}px`,
              }"
            >
              <Tooltip text="Please create collection and upload content to view assets" />
            </div>
          </Teleport>
        </div>

        <div class="vdb-c-relative">
          <button
            ref="agentsButtonRef"
            @click="!agentsButtonDisabled && context.handleNavigateToAgents()"
            class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200"
            :class="{
              'vdb-c-bg-[#FFE9D3] vdb-c-text-[#821F0C]':
                currentPage === 'agents' && !agentsButtonDisabled,
              'vdb-c-text-vdb-darkishgrey hover:vdb-c-bg-[#EFEFEF] hover:vdb-c-text-black':
                !agentsButtonDisabled && currentPage !== 'agents',
              'vdb-c-cursor-not-allowed vdb-c-text-[#B9B9B9]': agentsButtonDisabled,
            }"
            @mouseenter="showAgentsTooltip = hasNoCollections"
            @mouseleave="showAgentsTooltip = false"
          >
            <AgentsIcon :stroke-color="agentsButtonDisabled ? '#B9B9B9' : undefined" />
            <span class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5">Agents</span>
          </button>
          <Teleport to="body">
            <div
              v-if="showAgentsTooltip && agentsButtonRef"
              class="vdb-c-fixed"
              :style="{
                top: `${agentsButtonRef.getBoundingClientRect().top + agentsButtonRef.getBoundingClientRect().height / 2 - 16}px`,
                left: `${agentsButtonRef.getBoundingClientRect().right + 8}px`,
              }"
            >
              <Tooltip text="Please create collection and upload content to use agents" />
            </div>
          </Teleport>
        </div>
      </div>
    </div>
    <div
      @click="handleSidebarClick"
      class="vdb-c-flex vdb-c-h-full vdb-c-w-[260px] vdb-c-flex-col vdb-c-gap-24 vdb-c-bg-white vdb-c-text-black"
    >
      <div
        class="vdb-c-mt-24 vdb-c-flex vdb-c-flex-grow vdb-c-flex-col vdb-c-gap-24 vdb-c-px-6"
        :class="{
          'vdb-c-pointer-events-none vdb-c-opacity-20': status === 'inactive',
        }"
      >
        <template v-for="section in visibleSections" :key="section">
          <!-- Collections -->
          <div
            v-if="section === 'collections'"
            class="sidebar-section vdb-c-flex vdb-c-flex-col vdb-c-gap-0"
          >
            <div
              class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-between vdb-c-px-10 vdb-c-py-6"
            >
              <span
                class="vdb-c-text-sm vdb-c-font-semibold vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
                >Collections</span
              >
              <button
                v-if="collections.length > 0"
                class="cursor-pointer vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-items-center vdb-c-justify-center"
                aria-label="Create Collection"
                @click="openCreateCollectionModal"
                @mouseenter="isAddIconHovered = true"
                @mouseleave="isAddIconHovered = false"
              >
                <HoveredAddIcon v-if="isAddIconHovered" />
                <AddIcon v-else stroke-color="#1E1E1E" />
              </button>
            </div>
            <div v-if="status !== 'inactive' && showCollections" class="vdb-c-overflow-y-auto">
              <template v-if="collections.length === 0">
                <button
                  class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#EFEFEF]"
                  @click="openCreateCollectionModal"
                >
                  <CreateFolderIcon fill="#1E1E1E" class="vdb-c-size-20 vdb-c-flex-shrink-0" />
                  <span
                    class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
                    >Create New Collection</span
                  >
                </button>
              </template>
              <template v-else>
                <template v-for="collection in visibleCollections" :key="collection.id">
                  <CollectionPill
                    :ref="(el) => setCollectionPillRef(collection.id, el)"
                    :collection="collection"
                    :is-selected="
                      showSelectedCollection && collection.id === computedSelectedCollection
                    "
                    :editing-collection-id="editingCollectionId"
                    :is-options-menu-open="
                      showCollectionOptions && selectedCollectionForOptions?.id === collection.id
                    "
                    :fetch-collection-videos="context.fetchCollectionVideos"
                    @click="handleCollectionClick"
                    @options-click="handleCollectionOptionsClick"
                    @start-editing="handleStartEditingCollection"
                    @save-editing="handleSaveEditingCollection"
                    @cancel-editing="handleCancelEditingCollection"
                    @delete-collection="handleDeleteCollection"
                  />
                </template>
                <div class="vdb-c-relative">
                  <button
                    v-if="collections.length > MAX_VISIBLE_COLLECTIONS"
                    ref="seeMoreButton"
                    data-compid="see-more-button"
                    class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-roy"
                    @click="toggleSeeMoreDropdown"
                  >
                    <MoreHorizontalIcon stroke-color="#1E1E1E" class="vdb-c-flex-shrink-0" />
                    <span
                      class="vdb-c-flex-1 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
                      >See more</span
                    >
                  </button>
                  <CollectionDropdown
                    v-if="seeMoreButton"
                    :is-open="showSeeMoreDropdown"
                    :collections="hiddenCollections"
                    :trigger-element="seeMoreButton"
                    @close="showSeeMoreDropdown = false"
                    @collection-select="handleCollectionFromSeeMore"
                  />

                  <CollectionOptionsMenu
                    v-if="collectionOptionsButton"
                    :is-open="showCollectionOptions"
                    :collection="selectedCollectionForOptions"
                    :trigger-element="collectionOptionsButton"
                    @close="showCollectionOptions = false"
                    @rename="handleRenameCollection"
                    @delete="handleDeleteCollectionFromOptions"
                  />
                </div>
              </template>
            </div>
          </div>

          <!-- Sessions -->
          <div
            v-if="section === 'sessions'"
            class="sidebar-section vdb-c-flex vdb-c-flex-col vdb-c-gap-0"
          >
            <div
              class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-start vdb-c-px-10 vdb-c-py-6"
            >
              <span
                class="vdb-c-text-sm vdb-c-font-semibold vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
                >Your chats</span
              >
            </div>
            <div v-if="status !== 'inactive' && showSessions" class="vdb-c-overflow-y-auto">
              <transition-group name="fade" tag="div">
                <SessionPill
                  v-for="session in sessions"
                  :key="session.session_id"
                  :session="session"
                  :is-selected="session.session_id === selectedSession"
                  :editing-session-id="editingSessionId"
                  :on-make-public="context.makeSessionPublic"
                  @click="handleSessionClick"
                  @start-editing="handleStartEditing"
                  @save-editing="handleSaveEditing"
                  @cancel-editing="handleCancelEditing"
                  @delete-session="handleDeleteSession"
                />
              </transition-group>
              <div class="vdb-c-h-[78px]"></div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <SidebarFooter
      :width="sidebarWidth"
      :active="footerActive"
      :user="config.footerConfig?.user"
      :buttons="config.footerConfig?.buttons || []"
      @profile-click="handleProfileClick"
    />
    <CreateCollectionModal
      :showDialog="showCreateCollectionModal"
      :isCreating="isCreatingCollection"
      @cancel="showCreateCollectionModal = false"
      @create="handleCreateCollection"
    />

    <!-- Delete Collection Modal -->
    <DeleteCollectionModal
      :is-open="showDeleteCollectionModal"
      :collection-name="collectionToDelete?.name || ''"
      :total-files="totalFilesCount"
      @close="cancelDeleteCollection"
      @delete="confirmDeleteCollection"
    />

    <NotificationCenter ref="notificationCenterRef" />
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  ref,
  watch,
  inject,
  onMounted,
  onBeforeUnmount,
  markRaw,
  Teleport,
} from 'vue';

import SidebarFooter from './SidebarFooter.vue';

import ComposeAltIcon from './icons/ComposeAltIcon.vue';
import HomeIcon from './icons/HomeIcon.vue';
import LibraryIcon from './icons/LibraryIcon.vue';
import AgentsIcon from './icons/AgentsIcon.vue';
import AddIcon from './icons/AddIcon.vue';
import HoveredAddIcon from './icons/HoveredAddIcon.vue';
import MoreHorizontalIcon from './icons/MoreHorizontalIcon.vue';
import FolderIcon from './icons/FolderIcon.vue';
import CollectionDropdown from './CollectionDropdown.vue';
import CollectionOptionsMenu from './CollectionOptionsMenu.vue';
import CollectionPill from './CollectionPill.vue';
import SessionPill from './SessionPill.vue';
import CreateCollectionModal from './CreateCollectionModal.vue';
import CreateFolderIcon from './icons/CreateFolderIcon.vue';
import DeleteCollectionModal from '../../pages/collection/DeleteCollectionModal.vue';
import NotificationCenter from '../elements/NotificationCenter.vue';
import ErrorIcon from './icons/ErrorIcon.vue';
import CheckIcon from './icons/CheckIcon.vue';
import Tooltip from './elements/Tooltip.vue';

const context = inject('videodb-chat-context');
const currentPage = computed(() => context?.navState?.currentPage || 'default');

const config = computed(() => context?.sidebarConfig || {});
const collections = computed(() => context?.collections?.value || []);
const sessions = computed(() => {
  const allSessions = context?.sessions?.value || [];
  return allSessions.filter((session) => {
    if (session.isUploading && session.isExistingSession) {
      return false;
    }
    return true;
  });
});
const status = computed(() =>
  context?.configStatus?.value !== null && context?.isSetupComplete?.value ? 'active' : 'inactive'
);
const isLoadingCollections = computed(() => {
  if (status.value === 'inactive') {
    return true;
  }
  if (context?.collections?.value === null || context?.collections?.value === undefined) {
    return true;
  }
  return false;
});

const hasNoCollections = computed(() => {
  return !isLoadingCollections.value && collections.value.length === 0;
});

const newSessionButtonDisabled = computed(() => {
  if (currentPage.value === 'collection') return true;
  if (isLoadingCollections.value || hasNoCollections.value) return true;
  return false;
});

const assetLibraryButtonDisabled = computed(() => {
  return isLoadingCollections.value || hasNoCollections.value;
});

const agentsButtonDisabled = computed(() => {
  return isLoadingCollections.value || hasNoCollections.value;
});
const selectedSession = computed(
  () => context?.selectedSessionId?.value ?? context?.sessionId?.value
);
const selectedCollection = computed(
  () => context?.selectedCollectionId?.value ?? context?.collectionId?.value
);
const showSelectedCollection = computed(() => {
  const isRelevantPage = currentPage.value === 'chat' || currentPage.value === 'collection';
  return isRelevantPage && Boolean(computedSelectedCollection.value);
});
const initialExploreAgentsOpen = computed(() => !context?.isFreshUser?.value);
const initialSessionsOpen = computed(() => !context?.isFreshUser?.value);
const sidebarSections = ['collections', 'agents', 'sessions'];

const MAX_VISIBLE_COLLECTIONS = 4;

const showExploreAgents = ref(true);
const showSessions = ref(true);
const showCollections = ref(true);
const isExploreAgentsFocused = ref(false);
const exploreAgentsTimeout = ref(null);
const userClickedSessions = ref(false);
const userClickedExploreAgents = ref(false);
const showSeeMoreDropdown = ref(false);
const showCollectionOptions = ref(false);
const selectedCollectionForOptions = ref(null);
const collectionOptionsButton = ref(null);
const seeMoreButton = ref(null);
const visibleCollectionIds = ref([]);
const footerActive = ref(false);
const editingSessionId = ref(null);
const editingCollectionId = ref(null);
const collectionPillRefs = ref({});
const sidebarRef = ref(null);
const showCreateCollectionModal = ref(false);
const isCreatingCollection = ref(false);
const sidebarWidth = ref(260);
const isAddIconHovered = ref(false);
const showDeleteCollectionModal = ref(false);
const collectionToDelete = ref(null);
const collectionAssetsCache = ref({});
const notificationCenterRef = ref(null);
const newChatButtonRef = ref(null);
const assetLibraryButtonRef = ref(null);
const agentsButtonRef = ref(null);
const showNewChatTooltip = ref(false);
const showAssetLibraryTooltip = ref(false);
const showAgentsTooltip = ref(false);
let resizeObserver = null;

const visibleSections = computed(() => sidebarSections);

const totalFilesCount = computed(() => {
  if (!collectionToDelete.value) return 0;

  const assets = collectionAssetsCache.value[collectionToDelete.value.id];
  if (!assets) return 0;

  return (
    (Array.isArray(assets.videos) ? assets.videos.length : 0) +
    (Array.isArray(assets.audios) ? assets.audios.length : 0) +
    (Array.isArray(assets.images) ? assets.images.length : 0) +
    (Array.isArray(assets.voices) ? assets.voices.length : 0)
  );
});

const visibleCollections = computed(() => {
  const list = collections.value;

  // If we have fewer collections than the max, show all
  if (list.length <= MAX_VISIBLE_COLLECTIONS) {
    return list;
  }

  // If we have more than MAX_VISIBLE_COLLECTIONS, use tracked IDs
  if (visibleCollectionIds.value.length === 0) {
    // Not yet initialized, return empty to avoid flickering
    return [];
  }

  return visibleCollectionIds.value.map((id) => list.find((c) => c.id === id)).filter(Boolean);
});

const hiddenCollections = computed(() => {
  const list = collections.value;
  if (list.length <= MAX_VISIBLE_COLLECTIONS) {
    return [];
  }

  return list.filter((collection) => !visibleCollectionIds.value.includes(collection.id));
});

const toggleExploreAgents = (value) => {
  userClickedExploreAgents.value = true;
  showExploreAgents.value = value !== undefined ? value : !showExploreAgents.value;
};

const toggleSessions = (value) => {
  userClickedSessions.value = true;
  showSessions.value = value !== undefined ? value : !showSessions.value;
};

const triggerExploreAgentsFocusAnimation = () => {
  if (exploreAgentsTimeout.value) {
    clearTimeout(exploreAgentsTimeout.value);
  }
  isExploreAgentsFocused.value = false;
  nextTick(() => {
    isExploreAgentsFocused.value = true;
    exploreAgentsTimeout.value = setTimeout(() => {
      isExploreAgentsFocused.value = false;
    }, 1000);
  });
};

const computedSelectedCollection = computed(() => {
  if (selectedCollection.value !== 'default') {
    return selectedCollection.value;
  }
  return null;
});

const updateSidebarWidth = () => {
  sidebarWidth.value = sidebarRef.value?.clientWidth || 260;
};
const toggleSeeMoreDropdown = () => {
  showSeeMoreDropdown.value = !showSeeMoreDropdown.value;
  showCollectionOptions.value = false;
};

const openCreateCollectionModal = () => {
  showCreateCollectionModal.value = true;
};

const handleCreateCollection = async (newCollection) => {
  try {
    isCreatingCollection.value = true;

    const createdCollection = await context?.createCollection(
      newCollection.name,
      newCollection.description || ' '
    );

    showCreateCollectionModal.value = false;

    if (createdCollection?.id) {
      const list = collections.value;
      if (list.length > MAX_VISIBLE_COLLECTIONS) {
        if (visibleCollectionIds.value.length >= MAX_VISIBLE_COLLECTIONS) {
          visibleCollectionIds.value[MAX_VISIBLE_COLLECTIONS - 1] = createdCollection.id;
        } else {
          visibleCollectionIds.value.push(createdCollection.id);
        }
      }

      context?.handleCollectionClick(createdCollection.id);
    }
  } catch (error) {
    console.error('Error creating collection:', error?.message || error);
  } finally {
    isCreatingCollection.value = false;
  }
};

const handleCollectionClick = (collectionId) => {
  context?.handleCollectionClick(collectionId);
};

const handleCollectionOptionsClick = (collection, event) => {
  selectedCollectionForOptions.value = collection;
  collectionOptionsButton.value = event.currentTarget;
  showCollectionOptions.value = !showCollectionOptions.value;
  showSeeMoreDropdown.value = false;
};

const handleCollectionFromSeeMore = (collectionId) => {
  // Replace the 4th visible collection with the selected one from "See More"
  if (visibleCollectionIds.value.length >= MAX_VISIBLE_COLLECTIONS) {
    visibleCollectionIds.value[MAX_VISIBLE_COLLECTIONS - 1] = collectionId;
  } else {
    visibleCollectionIds.value.push(collectionId);
  }

  context?.handleCollectionClick(collectionId);
};

const setCollectionPillRef = (collectionId, el) => {
  if (el) {
    collectionPillRefs.value[collectionId] = el;
  }
};

const handleStartEditingCollection = (collection) => {
  editingCollectionId.value = collection.id;
};

const handleSaveEditingCollection = ({ collectionId, name }) => {
  context?.handleUpdateCollectionName({ collectionId, name });
  editingCollectionId.value = null;
};

const handleCancelEditingCollection = () => {
  editingCollectionId.value = null;
};

const handleRenameCollection = (collection) => {
  handleStartEditingCollection(collection);
};

const handleDeleteCollectionFromOptions = (collection) => {
  showCollectionOptions.value = false;
  const pillRef = collectionPillRefs.value[collection.id];
  if (pillRef && pillRef.handleDelete) {
    pillRef.handleDelete();
  }
};

const handleDeleteCollection = async (collection) => {
  collectionToDelete.value = collection;

  try {
    const collectionId = collection.id;
    const [videosRes, audiosRes, imagesRes, voicesRes] = await Promise.all([
      context?.fetchCollectionVideos?.(collectionId) || Promise.resolve({ data: null }),
      context?.fetchCollectionAudios?.(collectionId) || Promise.resolve({ data: null }),
      context?.fetchCollectionImages?.(collectionId) || Promise.resolve({ data: null }),
      context?.fetchAssets?.({
        collection_id: collectionId,
        asset_type: 'voices',
        page: 1,
        page_size: 10000,
      }) || Promise.resolve({ status: 'success', data: { data: { assets: null } } }),
    ]);

    collectionAssetsCache.value[collectionId] = {
      videos: videosRes?.data || [],
      audios: audiosRes?.data || [],
      images: imagesRes?.data || [],
      voices:
        voicesRes?.status === 'success' && voicesRes?.data?.data?.assets
          ? voicesRes.data.data.assets
          : [],
    };
  } catch (error) {
    console.error('Error fetching collection assets:', error);
    collectionAssetsCache.value[collection.id] = {
      videos: [],
      audios: [],
      images: [],
      voices: [],
    };
  }

  showDeleteCollectionModal.value = true;
};

const confirmDeleteCollection = async () => {
  if (!collectionToDelete.value) return;

  try {
    if (context?.deleteCollection) {
      await context.deleteCollection(collectionToDelete.value.id);

      // Show success notification
      if (notificationCenterRef.value) {
        notificationCenterRef.value.addNotification('Collection deleted successfully', {
          type: 'success',
          icon: markRaw(CheckIcon),
          duration: 5000,
        });
      }

      const index = visibleCollectionIds.value.indexOf(collectionToDelete.value.id);
      if (index !== -1) {
        visibleCollectionIds.value.splice(index, 1);

        if (hiddenCollections.value.length > 0) {
          visibleCollectionIds.value.push(hiddenCollections.value[0].id);
        }
      }

      delete collectionAssetsCache.value[collectionToDelete.value.id];

      // Navigate to default if needed
      if (context?.actions?.goToDefault) {
        context.actions.goToDefault();
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

const handleProfileClick = () => {
  footerActive.value = !footerActive.value;
};

const handleSidebarClick = () => {
  footerActive.value = false;
};

const handleSessionClick = (sessionId) => {
  context?.handleSessionClick(sessionId);
};

const handleStartEditing = (session) => {
  editingSessionId.value = session.session_id;
};

const handleSaveEditing = ({ sessionId, name }) => {
  context?.handleUpdateSessionName({ sessionId, name });
  editingSessionId.value = null;
};

const handleCancelEditing = () => {
  editingSessionId.value = null;
};

const handleDeleteSession = (sessionId) => {
  context?.showDeleteSessionDialog(sessionId);
};

watch(
  initialSessionsOpen,
  (newValue) => {
    if (!userClickedSessions.value) {
      showSessions.value = newValue;
    }
  },
  { immediate: true }
);

watch(
  initialExploreAgentsOpen,
  (newValue) => {
    if (!userClickedExploreAgents.value) {
      showExploreAgents.value = newValue;
    }
  },
  { immediate: true }
);

watch(showExploreAgents, (newValue) => {
  if (newValue) {
    // triggerExploreAgentsFocusAnimation();
  }
});

// Initialize visible collections when collections change
watch(
  () => collections.value,
  (newCollections) => {
    if (newCollections.length === 0) return;

    // 1. Filter out IDs that no longer exist in the source list
    let validIds = visibleCollectionIds.value.filter((id) =>
      newCollections.some((c) => c.id === id)
    );

    // 2. REFILL LOGIC: If we have room (less than 4) and there are more collections available
    if (validIds.length < MAX_VISIBLE_COLLECTIONS && newCollections.length > validIds.length) {
      // Find collections that are NOT currently visible
      const availableCollections = newCollections.filter((c) => !validIds.includes(c.id));

      // Fill the empty slots
      while (validIds.length < MAX_VISIBLE_COLLECTIONS && availableCollections.length > 0) {
        validIds.push(availableCollections.shift().id);
      }
    }

    visibleCollectionIds.value = validIds;
  },
  { immediate: true }
);

watch(
  () => computedSelectedCollection.value,
  (newSelectedCollectionId) => {
    if (!newSelectedCollectionId) return;

    const list = collections.value;
    if (list.length <= MAX_VISIBLE_COLLECTIONS) return;

    // Check if selected collection is already visible
    if (visibleCollectionIds.value.includes(newSelectedCollectionId)) return;

    // Check if the selected collection exists in the full list
    const collectionExists = list.some((c) => c.id === newSelectedCollectionId);
    if (!collectionExists) return;

    // Replace the last visible collection with the selected one
    if (visibleCollectionIds.value.length >= MAX_VISIBLE_COLLECTIONS) {
      visibleCollectionIds.value[MAX_VISIBLE_COLLECTIONS - 1] = newSelectedCollectionId;
    } else {
      visibleCollectionIds.value.push(newSelectedCollectionId);
    }
  }
);

onMounted(() => {
  updateSidebarWidth();

  resizeObserver = new ResizeObserver(updateSidebarWidth);
  if (sidebarRef.value) {
    resizeObserver.observe(sidebarRef.value);
  }

  window.addEventListener('resize', updateSidebarWidth);
});

onBeforeUnmount(() => {
  if (resizeObserver && sidebarRef.value) {
    resizeObserver.unobserve(sidebarRef.value);
  }
  resizeObserver?.disconnect?.();
  window.removeEventListener('resize', updateSidebarWidth);
});

defineExpose({
  toggleExploreAgents,
  toggleSessions,
  triggerExploreAgentsFocusAnimation,
});
</script>

<style>
.vdb-c-explore-agents-animation {
  animation: exploreAgentsFade 1s ease-out;
}

.vdb-c-explore-agents-animation button {
  animation: exploreAgentButtonFade 1s ease-out;
}

@keyframes exploreAgentsFade {
  0% {
    border-color: #ff7e32;
    background-color: #ffe9d3;
  }
  100% {
    border-color: transparent;
    background-color: transparent;
  }
}

@keyframes exploreAgentButtonFade {
  0% {
    background-color: #ffe9d3;
  }
  100% {
    background-color: transparent;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sidebar-section {
  overflow: auto;
}
</style>
