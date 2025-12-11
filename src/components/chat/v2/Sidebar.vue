<template>
  <div
    ref="sidebarRef"
    id="sidebar-container"
    class="vdb-c-border-r-1 vdb-c-border-r-solid vdb-c-relative vdb-c-overflow-auto vdb-c-border-r vdb-c-border-r-[#E5E7EB] vdb-c-pl-6 vdb-c-pr-16"
  >
    <div class="vdb-c-sticky vdb-c-top-0 vdb-c-z-10 vdb-c-bg-white">
      <div class="vdb-c-flex vdb-c-items-center vdb-c-justify-between vdb-c-px-10 vdb-c-pt-20">
        <div class="vdb-c-cursor-pointer">
          <component
            v-if="config.icon"
            :is="config.icon"
            @click="context.handleCreateNewSession()"
            class="vdb-c-h-24"
          />
        </div>
        <button v-if="isMobile" @click="closeSidebar" class="vdb-c-text-2xl vdb-c-font-bold">
          &times;
        </button>
      </div>

      <!-- Action Panel -->
      <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-1">
        <button
          class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-bg-black vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-pam disabled:vdb-c-bg-[#B9B9B9]"
          :disabled="newSessionButtonDisabled"
          @click="
            context.handleCreateNewSession();
            closeSidebar();
          "
        >
          <ComposeAltIcon :stroke-color="'white'" />
          <span class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-white"
            >New chat</span
          >
        </button>

        <button
          @click="
            context.handleNavigateToAssets();
            closeSidebar();
          "
          class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-text-vdb-darkishgrey vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#FFE9D3] hover:vdb-c-text-orange-900"
          :class="{
            'vdb-c-bg-[#FFE9D3]': currentPage === 'assets',
          }"
        >
          <LibraryIcon />
          <span class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5">Asset Library</span>
        </button>

        <button
          @click="
            context.handleNavigateToAgents();
            closeSidebar();
          "
          class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-text-vdb-darkishgrey vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#FFE9D3] hover:vdb-c-text-orange-900"
          :class="{
            'vdb-c-bg-[#FFE9D3]': currentPage === 'agents',
          }"
        >
          <AgentsIcon />
          <span class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5">Agents</span>
        </button>
      </div>
    </div>
    <div
      @click="handleSidebarClick"
      :class="[
        'vdb-c-flex vdb-c-h-full vdb-c-flex-col vdb-c-gap-24 vdb-c-bg-white vdb-c-text-black',
        {
          'vdb-c-w-[260px]': !isMobile,
          'vdb-c-fixed vdb-c-left-0 vdb-c-top-0 vdb-c-z-50 vdb-c-h-full vdb-c-w-4/5 vdb-c-transform vdb-c-transition-transform vdb-c-duration-300 vdb-c-ease-in-out md:vdb-c-w-2/5':
            isMobile,
          'vdb-c--translate-x-full': isMobile && !isOpen,
        },
      ]"
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
                class="cursor-pointer vdb-c-flex vdb-c-h-20 vdb-c-w-20 vdb-c-items-center vdb-c-justify-center"
                aria-label="Create Collection"
                @click="openCreateCollectionModal"
              >
                <AddIcon stroke-color="#1E1E1E" />
              </button>
            </div>
            <div v-if="status !== 'inactive' && showCollections" class="vdb-c-overflow-y-auto">
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
      @cancel="showCreateCollectionModal = false"
      @create="handleCreateCollection"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch, inject, onMounted, onBeforeUnmount } from 'vue';

import SidebarFooter from './SidebarFooter.vue';

import ComposeAltIcon from './icons/ComposeAltIcon.vue';
import LibraryIcon from './icons/LibraryIcon.vue';
import AgentsIcon from './icons/AgentsIcon.vue';
import AddIcon from './icons/AddIcon.vue';
import MoreHorizontalIcon from './icons/MoreHorizontalIcon.vue';
import CollectionDropdown from './CollectionDropdown.vue';
import CollectionOptionsMenu from './CollectionOptionsMenu.vue';
import CollectionPill from './CollectionPill.vue';
import SessionPill from './SessionPill.vue';
import CreateCollectionModal from './CreateCollectionModal.vue';

const context = inject('videodb-chat-context');
const currentPage = computed(() => context?.navState?.currentPage || 'default');

const config = computed(() => context?.sidebarConfig || {});
const collections = computed(() => context?.collections?.value || []);
const sessions = computed(() => context?.sessions?.value || []);
const status = computed(() =>
  context?.configStatus?.value !== null && context?.isSetupComplete?.value ? 'active' : 'inactive'
);
const newSessionButtonDisabled = computed(() =>
  currentPage.value === 'collection' ? true : false
);
const selectedSession = computed(
  () => context?.selectedSessionId?.value ?? context?.sessionId?.value
);
const selectedCollection = computed(
  () => context?.selectedCollectionId?.value ?? context?.collectionId?.value
);
const showSelectedCollection = computed(() => Boolean(computedSelectedCollection.value));
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
const isMobile = ref(window?.innerWidth < 1024);
const isOpen = ref(false);
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
const sidebarWidth = ref(260);
let resizeObserver = null;

const visibleSections = computed(() => sidebarSections);

const visibleCollections = computed(() => {
  const list = collections.value;
  // If we have more than MAX_VISIBLE_COLLECTIONS, show first 3 and maintain the 4th spot for selected
  if (list.length > MAX_VISIBLE_COLLECTIONS) {
    if (visibleCollectionIds.value.length === 0) {
      // Initialize with first 4 collections
      visibleCollectionIds.value = list.slice(0, MAX_VISIBLE_COLLECTIONS).map((c) => c.id);
    }

    // Get collections by the tracked IDs
    return visibleCollectionIds.value.map((id) => list.find((c) => c.id === id)).filter(Boolean);
  }

  return list.slice(0, MAX_VISIBLE_COLLECTIONS);
});

const hiddenCollections = computed(() => {
  const list = collections.value;
  if (list.length <= MAX_VISIBLE_COLLECTIONS) {
    return [];
  }

  return list.filter((collection) => !visibleCollectionIds.value.includes(collection.id));
});

const closeSidebar = () => {
  if (isMobile.value) {
    isOpen.value = false;
  }
};

const toggleExploreAgents = (value) => {
  userClickedExploreAgents.value = true;
  showExploreAgents.value = value !== undefined ? value : !showExploreAgents.value;
};

const toggleSessions = (value) => {
  userClickedSessions.value = true;
  showSessions.value = value !== undefined ? value : !showSessions.value;
};

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
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
  showCreateCollectionModal.value = false;
  try {
    await context?.createCollection(newCollection.name, newCollection.description || ' ');
  } catch (error) {
    console.error('Error creating collection:', error?.message || error);
  }
};

const handleCollectionClick = (collectionId) => {
  context?.handleCollectionClick(collectionId);
  closeSidebar();
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
  closeSidebar();
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

const handleDeleteCollection = (collection) => {
  context?.promptDeleteCollection(collection);

  const index = visibleCollectionIds.value.indexOf(collection.id);
  if (index !== -1) {
    visibleCollectionIds.value.splice(index, 1);

    if (hiddenCollections.value.length > 0) {
      visibleCollectionIds.value.push(hiddenCollections.value[0].id);
    }
  }
};

const handleProfileClick = () => {
  footerActive.value = !footerActive.value;
};

const handleSidebarClick = () => {
  footerActive.value = false;
};

const handleSessionClick = (sessionId) => {
  context?.handleSessionClick(sessionId);
  closeSidebar();
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
  closeSidebar();
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
    if (newCollections.length > 0 && visibleCollectionIds.value.length === 0) {
      visibleCollectionIds.value = newCollections
        .slice(0, MAX_VISIBLE_COLLECTIONS)
        .map((c) => c.id);
    }
  },
  { immediate: true }
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
  toggleSidebar,
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
