<template>
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
    <!-- Logo Section -->
    <div class="vdb-c-flex vdb-c-items-center vdb-c-justify-between vdb-c-px-10 vdb-c-pt-20">
      <div class="vdb-c-cursor-pointer">
        <component
          v-if="config.icon"
          :is="config.icon"
          @click="$emit('create-new-session')"
          class="vdb-c-h-24"
        />
      </div>
      <button v-if="isMobile" @click="closeSidebar" class="vdb-c-text-2xl vdb-c-font-bold">
        &times;
      </button>
    </div>

    <!-- Action Panel -->
    <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-1 vdb-c-px-6">
      <button
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200"
        :class="{
          'vdb-c-pointer-events-none vdb-c-bg-[#b9b9b9]': newSessionButtonStatus !== 'active',
          'vdb-c-bg-vdb-darkorange hover:vdb-c-bg-vdb-darkorange':
            newSessionButtonStatus === 'active',
        }"
        @click="
          $emit('create-new-session');
          closeSidebar();
        "
      >
        <ComposeAltIcon
          :stroke-color="newSessionButtonStatus === 'active' ? '#FFFFFF' : '#FFFFFF'"
        />
        <span
          class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5"
          :class="{
            'vdb-c-text-white': true,
          }"
          >New chat</span
        >
      </button>

      <button
        @click="
          $emit('navigate-to-assets');
          closeSidebar();
        "
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#FFE9D3]"
        :class="{
          'vdb-c-bg-[#FFE9D3]': currentPage === 'assets',
        }"
      >
        <LibraryIcon stroke-color="#1E1E1E" />
        <span class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
          >Asset Library</span
        >
      </button>

      <button
        @click="
          $emit('navigate-to-agents');
          closeSidebar();
        "
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#FFE9D3]"
        :class="{
          'vdb-c-bg-[#FFE9D3]': currentPage === 'agents',
        }"
      >
        <AgentsIcon stroke-color="#1E1E1E" />
        <span class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
          >Agents</span
        >
      </button>
    </div>

    <div
      class="vdb-c-flex vdb-c-flex-grow vdb-c-flex-col vdb-c-gap-24 vdb-c-overflow-hidden vdb-c-px-6"
      :class="{
        'vdb-c-pointer-events-none vdb-c-opacity-20': status === 'inactive',
      }"
    >
      <template v-for="section in visibleSections" :key="section">
        <!-- Collections -->
        <div
          v-if="section === 'collections'"
          class="sidebar-section vdb-c-flex vdb-c-flex-col vdb-c-gap-0 vdb-c-overflow-hidden"
          :style="{
            'max-height': `calc(100% / ${visibleSections.length})`,
          }"
        >
          <div
            class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-between vdb-c-px-10 vdb-c-py-6"
          >
            <span
              class="vdb-c-text-sm vdb-c-font-semibold vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
              >Collections</span
            >
            <button
              class="vdb-c-flex vdb-c-items-center vdb-c-justify-center"
              aria-label="Create Collection"
              @click="$emit('create-collection')"
            >
              <AddIcon stroke-color="#1E1E1E" />
            </button>
          </div>
          <div v-if="status !== 'inactive' && showCollections" class="vdb-c-overflow-y-auto">
            <template v-for="collection in visibleCollections" :key="collection.id">
              <div
                @mouseenter="hoveredCollection = collection.id"
                @mouseleave="hoveredCollection = null"
                class="vdb-c-relative"
                :data-collection-id="collection.id"
              >
                <button
                  @click="
                    $emit('collection-click', collection.id);
                    closeSidebar();
                  "
                  :class="[
                    'vdb-c-flex vdb-c-h-[36px] vdb-c-w-full vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-6 vdb-c-truncate vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200',
                    {
                      'vdb-c-bg-[#FFE9D3]':
                        showSelectedCollection && collection.id === computedSelectedCollection,
                      'hover:vdb-c-bg-[#FFE9D3]': collection.id !== computedSelectedCollection,
                    },
                  ]"
                >
                  <FolderOpenIcon
                    v-if="showSelectedCollection && collection.id === computedSelectedCollection"
                    stroke-color="#821F0C"
                    class="vdb-c-flex-shrink-0"
                  />
                  <FolderIcon v-else stroke-color="#1E1E1E" class="vdb-c-flex-shrink-0" />
                  <span
                    class="vdb-c-flex-1 vdb-c-truncate vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5"
                    :class="{
                      'vdb-c-text-[#821F0C]':
                        showSelectedCollection && collection.id === computedSelectedCollection,
                      'vdb-c-text-vdb-darkishgrey':
                        !showSelectedCollection || collection.id !== computedSelectedCollection,
                    }"
                  >
                    {{ collection.name }}
                  </span>
                  <button
                    v-if="hoveredCollection === collection.id"
                    @click.stop="toggleCollectionOptions(collection, $event)"
                    class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-6 vdb-c-p-4 vdb-c-transition-all vdb-c-duration-200"
                  >
                    <ThreeDotsIcon stroke-color="#1E1E1E" />
                  </button>
                </button>
              </div>
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
                @delete="handleDeleteCollection"
              />
            </div>
          </div>
        </div>

        <!-- Sessions -->
        <div
          v-if="section === 'sessions'"
          class="sidebar-section vdb-c-flex vdb-c-flex-col vdb-c-gap-0 vdb-c-overflow-hidden"
          :style="{
            'max-height': `calc(100% / ${visibleSections.length})`,
          }"
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
            <transition name="fade" mode="out-in">
              <button
                v-if="addDummySession"
                class="vdb-c-flex vdb-c-w-full vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-6 vdb-c-truncate vdb-c-rounded-10 vdb-c-bg-[#FFE9D3] vdb-c-px-10 vdb-c-py-8 vdb-c-text-left"
              >
                <span
                  class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
                >
                  (new chat)
                </span>
              </button>
            </transition>
            <transition-group name="fade" tag="div">
              <button
                v-for="session in sessions"
                :key="session.session_id"
                @click="
                  $emit('session-click', session.session_id);
                  closeSidebar();
                "
                @mouseenter="hoveredSession = session.session_id"
                @mouseleave="hoveredSession = null"
                :class="[
                  'vdb-c-flex vdb-c-w-full vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-6 vdb-c-truncate vdb-c-rounded-10 vdb-c-px-10 vdb-c-py-8 vdb-c-text-left vdb-c-transition-all vdb-c-duration-200',
                  {
                    'vdb-c-bg-[#FFE9D3]': session.session_id === selectedSession,
                    'hover:vdb-c-bg-[#FFE9D3]': session.session_id !== selectedSession,
                  },
                ]"
              >
                <span
                  class="vdb-c-flex-1 vdb-c-truncate vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
                >
                  {{
                    session.name ||
                    new Date(session.created_at * 1000)
                      .toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                      })
                      .replace(/\//g, '.')
                      .replace(',', ' -')
                  }}
                </span>
              </button>
            </transition-group>
          </div>
        </div>
      </template>
    </div>

    <!-- Footer -->
    <div @click.stop class="">
      <SidebarFooter
        :active="footerActive"
        :user="config.footerConfig?.user"
        :buttons="config.footerConfig?.buttons || []"
        @profile-click="handleProfileClick"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch, inject } from 'vue';

import Button from '../../buttons/Button.vue';
import SidebarFooter from './SidebarFooter.vue';

import ComposeAltIcon from './icons/ComposeAltIcon.vue';
import LibraryIcon from './icons/LibraryIcon.vue';
import AgentsIcon from './icons/AgentsIcon.vue';
import AddIcon from './icons/AddIcon.vue';
import FolderIcon from './icons/FolderIcon.vue';
import FolderOpenIcon from './icons/FolderOpenIcon.vue';
import MoreHorizontalIcon from './icons/MoreHorizontalIcon.vue';
import ThreeDotsIcon from './icons/ThreeDotsIcon.vue';
import CollectionDropdown from './CollectionDropdown.vue';
import CollectionOptionsMenu from './CollectionOptionsMenu.vue';

const context = inject('videodb-chat-context');
const currentPage = computed(() => context?.navState?.currentPage || 'default');

const props = defineProps({
  sessions: {
    type: Array,
    required: true,
  },
  collections: {
    type: Array,
    required: true,
  },
  agents: {
    type: Array,
    required: true,
  },
  status: {
    type: String,
    default: 'active',
  },
  newSessionButtonStatus: {
    type: String,
    default: 'active',
  },
  config: {
    type: Object,
    required: true,
  },
  selectedCollection: {
    type: String,
    default: 'default',
  },
  selectedSession: {
    type: String,
    default: '',
  },
  addDummySession: {
    type: Boolean,
    default: false,
  },
  showSelectedCollection: {
    type: Boolean,
    default: false,
  },
  initialExploreAgentsOpen: {
    type: Boolean,
    default: true,
  },
  initialSessionsOpen: {
    type: Boolean,
    default: true,
  },
  sidebarSections: {
    type: Array,
    default: () => ['collections', 'agents', 'sessions'],
    validator: (value) => {
      return value.every((item) => ['collections', 'agents', 'sessions'].includes(item));
    },
  },
});

const MAX_VISIBLE_COLLECTIONS = 4;

const showExploreAgents = ref(true);
const showSessions = ref(true);
const showCollections = ref(true);
const isExploreAgentsFocused = ref(false);
const exploreAgentsTimeout = ref(null);
const userClickedSessions = ref(false);
const userClickedExploreAgents = ref(false);
const userClickedCollections = ref(false);
const hoveredSession = ref(null);
const isMobile = ref(window?.innerWidth < 1024);
const isOpen = ref(false);
const hoveredCollection = ref(null);
const showSeeMoreDropdown = ref(false);
const showCollectionOptions = ref(false);
const selectedCollectionForOptions = ref(null);
const collectionOptionsButton = ref(null);
const seeMoreButton = ref(null);
const visibleCollectionIds = ref([]);
const footerActive = ref(false);

const visibleSections = computed(() => {
  return props.sidebarSections;
});

const visibleCollections = computed(() => {
  // If we have more than MAX_VISIBLE_COLLECTIONS, show first 3 and maintain the 4th spot for selected
  if (props.collections.length > MAX_VISIBLE_COLLECTIONS) {
    if (visibleCollectionIds.value.length === 0) {
      // Initialize with first 4 collections
      visibleCollectionIds.value = props.collections
        .slice(0, MAX_VISIBLE_COLLECTIONS)
        .map((c) => c.id);
    }

    // Get collections by the tracked IDs
    return visibleCollectionIds.value
      .map((id) => props.collections.find((c) => c.id === id))
      .filter(Boolean);
  }

  return props.collections.slice(0, MAX_VISIBLE_COLLECTIONS);
});

const hiddenCollections = computed(() => {
  if (props.collections.length <= MAX_VISIBLE_COLLECTIONS) {
    return [];
  }

  return props.collections.filter(
    (collection) => !visibleCollectionIds.value.includes(collection.id)
  );
});

const emit = defineEmits([
  'create-new-session',
  'session-click',
  'delete-session',
  'collection-click',
  'agent-click',
  'create-collection',
  'delete-collection',
  'navigate-to-assets',
  'navigate-to-agents',
  'see-more-collections',
  'rename-collection',
]);

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
  if (props.selectedCollection !== 'default') {
    return props.selectedCollection;
  }
  return null;
});

const toggleSeeMoreDropdown = () => {
  showSeeMoreDropdown.value = !showSeeMoreDropdown.value;
  showCollectionOptions.value = false;
};

const toggleCollectionOptions = (collection, event) => {
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

  emit('collection-click', collectionId);
  closeSidebar();
};

const handleRenameCollection = (collection) => {
  emit('rename-collection', collection);
};

const handleDeleteCollection = (collection) => {
  emit('delete-collection', collection);

  // Remove from visible collections if present
  const index = visibleCollectionIds.value.indexOf(collection.id);
  if (index !== -1) {
    visibleCollectionIds.value.splice(index, 1);

    // If there are hidden collections, add the first one to visible
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

watch(
  () => props.initialSessionsOpen,
  (newValue) => {
    if (!userClickedSessions.value) {
      showSessions.value = newValue;
    }
  },
  { immediate: true }
);

watch(
  () => props.initialExploreAgentsOpen,
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
  () => props.collections,
  (newCollections) => {
    if (newCollections.length > 0 && visibleCollectionIds.value.length === 0) {
      visibleCollectionIds.value = newCollections
        .slice(0, MAX_VISIBLE_COLLECTIONS)
        .map((c) => c.id);
    }
  },
  { immediate: true }
);

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
