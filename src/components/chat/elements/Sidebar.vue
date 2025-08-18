<template>
  <div
    :class="[
      'vdb-c-flex vdb-c-h-full vdb-c-flex-col vdb-c-gap-16 vdb-c-border-l vdb-c-bg-white vdb-c-p-16 vdb-c-pl-12 vdb-c-pr-20 vdb-c-text-black',
      {
        'vdb-c-w-1/5': !isMobile,
        'vdb-c-fixed vdb-c-left-0 vdb-c-top-0 vdb-c-z-50 vdb-c-h-full vdb-c-w-4/5 vdb-c-transform vdb-c-transition-transform vdb-c-duration-300 vdb-c-ease-in-out md:vdb-c-w-2/5':
          isMobile,
        'vdb-c--translate-x-full': isMobile && !isOpen,
      },
    ]"
  >
    <div class="vdb-c-flex vdb-c-items-center vdb-c-justify-between">
      <div class="vdb-c-cursor-pointer vdb-c-text-2xl vdb-c-font-bold">
        <component
          v-if="config.icon"
          :is="config.icon"
          @click="$emit('create-new-session')"
        />
      </div>
      <button
        v-if="isMobile"
        @click="closeSidebar"
        class="vdb-c-text-2xl vdb-c-font-bold"
      >
        &times;
      </button>
    </div>
    <Button
      variant="primary"
      class="vdb-c-px-10 vdb-c-py-12"
      :class="{
        'vdb-c-pointer-events-none vdb-c-opacity-20':
          newSessionButtonStatus !== 'active',
      }"
      @click="
        $emit('create-new-session');
        closeSidebar();
      "
    >
      <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-6">
        <ComposeIcon />
        <span class="vdb-c-block vdb-c-text-sm vdb-c-font-medium"
          >New Chat</span
        >
      </div>
    </Button>
    <div
      class="vdb-c-flex vdb-c-flex-grow vdb-c-flex-col vdb-c-gap-16 vdb-c-overflow-hidden"
      :class="{
        'vdb-c-pointer-events-none vdb-c-opacity-20': status === 'inactive',
      }"
    >
      <template v-for="section in visibleSections" :key="section">
        <!-- Collections -->
        <div
          v-if="section === 'collections'"
          class="sidebar-section vdb-c-flex vdb-c-flex-col vdb-c-overflow-hidden"
          :style="{
            'max-height': `calc(100% / ${visibleSections.length})`,
          }"
        >
          <div
            class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-between vdb-c-rounded-lg vdb-c-px-12 vdb-c-py-6 vdb-c-text-pam hover:vdb-c-bg-roy"
          >
            <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
              <CollectionIcon class="vdb-c-mr-8" fill="#464646" />
              <span class="vdb-c-font-semibold vdb-c-leading-5"
                >Collections</span
              >
            </div>
            <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-4">
              <button
                class="vdb-c-flex vdb-c-items-center vdb-c-gap-4"
                aria-label="Create Collection"
                @click="$emit('create-collection')"
              >
                <PlusIcon stroke-color="#464646" />
              </button>
            </div>
          </div>
          <div
            v-if="status !== 'inactive' && showCollections"
            class="vdb-c-mt-4 vdb-c-overflow-y-auto"
          >
            <template v-for="collection in collections" :key="collection.id">
              <div
                @mouseenter="hoveredCollection = collection.id"
                @mouseleave="hoveredCollection = null"
              >
                <!-- Collection Item -->
                <div
                  @click="
                    $emit('collection-click', collection.id);
                    closeSidebar();
                  "
                  :class="[
                    'vdb-c-ml-24 vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-between vdb-c-truncate vdb-c-rounded-lg vdb-c-p-8 vdb-c-text-sm vdb-c-font-medium vdb-c-text-vdb-darkishgrey',
                    {
                      'vdb-c-bg-[#FFF5EC]':
                        showSelectedCollection &&
                        collection.id === computedSelectedCollection,
                      'hover:vdb-c-bg-[#FFF5EC]':
                        collection.id !== computedSelectedCollection,
                    },
                  ]"
                >
                  <span class="vdb-c-w-[90%] vdb-c-truncate">
                    {{ collection.name }}
                  </span>
                  <!-- Delete Button -->
                  <span
                    @click.stop="$emit('delete-collection', collection)"
                    class="vdb-c-transition-all vdb-c-duration-300 hover:vdb-c-scale-110"
                  >
                    <DeleteIcon
                      :fill="
                        hoveredCollection === collection.id
                          ? 'black'
                          : '#CCCCCC'
                      "
                    />
                  </span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Explore Agents -->
        <div
          v-if="section === 'agents'"
          class="sidebar-section vdb-c-flex vdb-c-flex-col vdb-c-gap-4 vdb-c-rounded-lg vdb-c-border vdb-c-border-transparent"
          :style="{
            'max-height': `calc(100% / ${visibleSections.length})`,
          }"
        >
          <button
            @click="toggleExploreAgents()"
            :class="[
              'vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-between vdb-c-rounded-lg vdb-c-px-12 vdb-c-py-6 vdb-c-font-medium vdb-c-text-pam vdb-c-transition-all vdb-c-duration-300 hover:vdb-c-bg-roy',
            ]"
          >
            <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
              <AgentIcon class="vdb-c-mr-8" />
              <span class="vdb-c-font-semibold vdb-c-leading-5"
                >Explore Agents</span
              >
            </div>
            <div class="vdb-c-p-4">
              <ChevronDown
                :class="[
                  'vdb-c-h-16 vdb-c-w-16 vdb-c-transition-transform vdb-c-duration-300',
                  { 'vdb-c-rotate-180': showExploreAgents },
                ]"
                stroke-color="#464646"
                :stroke-width="2"
              />
            </div>
          </button>
          <div
            v-if="status !== 'inactive' && showExploreAgents"
            class="vdb-c-overflow-y-scroll vdb-c-rounded-lg vdb-c-px-8 vdb-c-py-4"
            style="scrollbar-gutter: stable"
          >
            <template v-for="(agent, index) in agents" :key="index">
              <div
                @click="
                  $emit('agent-click', agent);
                  closeSidebar();
                "
                :class="[
                  'vdb-c-ml-18 vdb-c-cursor-pointer vdb-c-truncate vdb-c-rounded-lg vdb-c-border vdb-c-border-transparent vdb-c-bg-white vdb-c-p-8 vdb-c-text-sm vdb-c-font-medium vdb-c-text-black vdb-c-transition-all vdb-c-duration-75 hover:vdb-c-bg-[#FFF5EC]',
                ]"
              >
                <span class="vdb-c-text-orange"> @ </span>
                <span> {{ agent.name }} </span>
              </div>
            </template>
          </div>
        </div>

        <!-- Sessions -->
        <div
          v-if="section === 'sessions'"
          class="sidebar-section vdb-c-flex vdb-c-flex-col vdb-c-overflow-hidden"
          :style="{
            'max-height': `calc(100% / ${visibleSections.length})`,
          }"
        >
          <button
            @click="toggleSessions()"
            class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-between vdb-c-rounded vdb-c-px-12 vdb-c-py-6 vdb-c-text-pam hover:vdb-c-bg-roy"
          >
            <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
              <ChatIcon class="vdb-c-mr-8" fill="#464646" />
              <span class="vdb-c-font-semibold vdb-c-leading-5">Chats</span>
            </div>
            <div class="vdb-c-p-4">
              <ChevronDown
                :class="[
                  'vdb-c-h-16 vdb-c-w-16 vdb-c-transition-transform',
                  { 'vdb-c-rotate-180': showSessions },
                ]"
                stroke-color="#464646"
                :stroke-width="2"
              />
            </div>
          </button>
          <div
            v-if="status !== 'inactive' && showSessions"
            class="vdb-c-mt-4 vdb-c-overflow-y-auto"
          >
            <transition name="fade" mode="out-in">
              <div v-if="addDummySession">
                <div
                  class="vdb-c-ml-24 vdb-c-cursor-pointer vdb-c-truncate vdb-c-rounded-lg vdb-c-bg-[#FFF5EC] vdb-c-p-8 vdb-c-text-sm vdb-c-font-medium vdb-c-text-vdb-darkishgrey"
                >
                  (new chat)
                </div>
              </div>
            </transition>
            <transition-group name="fade" tag="div">
              <div
                v-for="session in sessions"
                :key="session.session_id"
                @click="
                  $emit('session-click', session.session_id);
                  closeSidebar();
                "
                @mouseenter="hoveredSession = session.session_id"
                @mouseleave="hoveredSession = null"
                :class="[
                  'vdb-c-ml-24 vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-between vdb-c-truncate vdb-c-rounded-lg vdb-c-p-8 vdb-c-px-12 vdb-c-text-sm vdb-c-font-medium vdb-c-text-vdb-darkishgrey',
                  {
                    'vdb-c-bg-[#FFF5EC]':
                      session.session_id === selectedSession,
                    'hover:vdb-c-bg-[#FFF5EC]':
                      session.session_id !== selectedSession,
                  },
                ]"
              >
                <span class="vdb-c-w-[90%] vdb-c-truncate">
                  <template v-if="editingSessionId === session.session_id">
                    <input
                      :id="`edit-input-${session.session_id}`"
                      v-model="editingName"
                      type="text"
                      class="vdb-c-w-full vdb-c-truncate vdb-c-rounded vdb-c-border vdb-c-border-[#E5E5E5] vdb-c-bg-white vdb-c-px-6 vdb-c-py-2 vdb-c-text-sm vdb-c-text-black vdb-c-outline-none"
                      @click.stop
                      @keydown.enter.prevent="saveSessionName(session)"
                      @keydown.esc.stop="cancelEditing()"
                      @blur="saveSessionName(session)"
                    />
                  </template>
                  <template v-else>
                    {{
                      session.name ||
                      session?.metadata?.name ||
                      new Date(session.created_at * 1000)
                        .toLocaleString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })
                        .replace(/\//g, ".")
                        .replace(",", " -")
                    }}
                  </template>
                </span>
                <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-4">
                  <span
                    @click.stop="copySessionId(session.session_id)"
                    class="vdb-c-transition-all vdb-c-duration-300 hover:vdb-c-scale-110"
                    :style="{
                      color:
                        hoveredSession === session.session_id
                          ? 'black'
                          : '#CCCCCC',
                    }"
                    aria-label="Copy session ID"
                    title="Copy session ID"
                  >
                    <CopyIcon />
                  </span>
                  <span
                    @click.stop="startEditing(session)"
                    class="vdb-c-mr-2 vdb-c-transition-all vdb-c-duration-300 hover:vdb-c-scale-110"
                    :style="{
                      color:
                        hoveredSession === session.session_id
                          ? 'black'
                          : '#CCCCCC',
                    }"
                    aria-label="Rename session"
                    title="Rename"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="CCCCCC"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.1464 1.14645C12.3417 0.951184 12.6583 0.951184 12.8535 1.14645L14.8535 3.14645C15.0488 3.34171 15.0488 3.65829 14.8535 3.85355L10.9109 7.79618C10.8349 7.87218 10.7471 7.93543 10.651 7.9835L6.72359 9.94721C6.53109 10.0435 6.29861 10.0057 6.14643 9.85355C5.99425 9.70137 5.95652 9.46889 6.05277 9.27639L8.01648 5.34897C8.06455 5.25283 8.1278 5.16507 8.2038 5.08907L12.1464 1.14645ZM12.5 2.20711L8.91091 5.79618L7.87266 7.87267L8.12731 8.12732L10.2038 7.08907L13.7929 3.5L12.5 2.20711ZM9.99998 2L8.99998 3H4.9C4.47171 3 4.18056 3.00039 3.95552 3.01877C3.73631 3.03668 3.62421 3.06915 3.54601 3.10899C3.35785 3.20487 3.20487 3.35785 3.10899 3.54601C3.06915 3.62421 3.03669 3.73631 3.01878 3.95552C3.00039 4.18056 3 4.47171 3 4.9V11.1C3 11.5283 3.00039 11.8194 3.01878 12.0445C3.03669 12.2637 3.06915 12.3758 3.10899 12.454C3.20487 12.6422 3.35785 12.7951 3.54601 12.891C3.62421 12.9309 3.73631 12.9633 3.95552 12.9812C4.18056 12.9996 4.47171 13 4.9 13H11.1C11.5283 13 11.8194 12.9996 12.0445 12.9812C12.2637 12.9633 12.3758 12.9309 12.454 12.891C12.6422 12.7951 12.7951 12.6422 12.891 12.454C12.9309 12.3758 12.9633 12.2637 12.9812 12.0445C12.9996 11.8194 13 11.5283 13 11.1V6.99998L14 5.99998V11.1V11.1207C14 11.5231 14 11.8553 13.9779 12.1259C13.9549 12.407 13.9057 12.6653 13.782 12.908C13.5903 13.2843 13.2843 13.5903 12.908 13.782C12.6653 13.9057 12.407 13.9549 12.1259 13.9779C11.8553 14 11.5231 14 11.1207 14H11.1H4.9H4.87934C4.47686 14 4.14468 14 3.87409 13.9779C3.59304 13.9549 3.33469 13.9057 3.09202 13.782C2.7157 13.5903 2.40973 13.2843 2.21799 12.908C2.09434 12.6653 2.04506 12.407 2.0221 12.1259C1.99999 11.8553 1.99999 11.5231 2 11.1207V11.1206V11.1V4.9V4.87935V4.87932V4.87931C1.99999 4.47685 1.99999 4.14468 2.0221 3.87409C2.04506 3.59304 2.09434 3.33469 2.21799 3.09202C2.40973 2.71569 2.7157 2.40973 3.09202 2.21799C3.33469 2.09434 3.59304 2.04506 3.87409 2.0221C4.14468 1.99999 4.47685 1.99999 4.87932 2H4.87935H4.9H9.99998Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </span>
                  <span
                    @click.stop="
                      $emit('delete-session', session.session_id);
                      closeSidebar();
                    "
                    class="vdb-c-transition-all vdb-c-duration-300 hover:vdb-c-scale-110"
                  >
                    <DeleteIcon
                      :fill="
                        hoveredSession === session.session_id
                          ? 'black'
                          : '#CCCCCC'
                      "
                    />
                  </span>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </template>
    </div>
    <div class="vdb-c-mt-auto vdb-c-flex vdb-c-flex-col">
      <a
        v-for="(link, index) in config.links"
        :key="index"
        class="vdb-c-mx-8 vdb-c-my-10 vdb-c-flex vdb-c-items-center vdb-c-gap-12 vdb-c-pl-8 vdb-c-text-sm vdb-c-font-medium vdb-c-text-vdb-darkishgrey hover:vdb-c-text-black hover:vdb-c-no-underline"
        :href="link.href"
        :target="link.target || '_blank'"
        rel="noopener noreferrer"
      >
        <span> {{ link.text }} </span>
        <component v-if="link.icon" :is="link.icon" />
      </a>
      <Button
        v-if="config.primaryLink"
        class="vdb-c-mt-16 vdb-c-w-full"
        variant="tertiary"
        :class="{
          'vdb-c-pointer-events-none vdb-c-opacity-20': status === 'inactive',
        }"
      >
        <div
          class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-center vdb-c-gap-6"
        >
          <a
            :href="config.primaryLink.href"
            :target="config.primaryLink.target || '_blank'"
            rel="noopener noreferrer"
            class="vdb-c-flex vdb-c-items-center vdb-c-text-white hover:vdb-c-text-white hover:vdb-c-no-underline"
          >
            <template v-if="config.primaryLink.icon">
              <img
                v-if="typeof config.primaryLink.icon === 'string'"
                :src="config.primaryLink.icon"
                alt="Primary Link Icon"
                class="vdb-c-mr-8 vdb-c-h-20 vdb-c-w-20"
              />
              <component
                v-else-if="typeof config.primaryLink.icon === 'object'"
                :is="config.primaryLink.icon"
                class="vdb-c-mr-8 vdb-c-h-20 vdb-c-w-20"
              />
            </template>
            {{ config.primaryLink.text }}
          </a>
        </div>
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";

import Button from "../../buttons/Button.vue";

import AgentIcon from "../../icons/Agent.vue";
import ChatIcon from "../../icons/Chat.vue";
import ChevronDown from "../../icons/ChevronDown.vue";
import CollectionIcon from "../../icons/Collection.vue";
import ComposeIcon from "../../icons/Compose.vue";
import DeleteIcon from "../../icons/Delete.vue";
import PlusIcon from "../../icons/Plus.vue";
import CopyIcon from "../../icons/CopyIcon.vue";

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
    default: "active",
  },
  newSessionButtonStatus: {
    type: String,
    default: "active",
  },
  config: {
    type: Object,
    required: true,
  },
  selectedCollection: {
    type: String,
    default: "default",
  },
  selectedSession: {
    type: String,
    default: "",
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
    default: () => ["collections", "agents", "sessions"],
    validator: (value) => {
      return value.every((item) =>
        ["collections", "agents", "sessions"].includes(item),
      );
    },
  },
});

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
const editingSessionId = ref(null);
const editingName = ref("");

const visibleSections = computed(() => {
  return props.sidebarSections;
});

const emit = defineEmits([
  "create-new-session",
  "session-click",
  "delete-session",
  "collection-click",
  "agent-click",
  "create-collection",
  "delete-collection",
  "update-session-name",
]);

const closeSidebar = () => {
  if (isMobile.value) {
    isOpen.value = false;
  }
};

const toggleExploreAgents = (value) => {
  userClickedExploreAgents.value = true;
  showExploreAgents.value =
    value !== undefined ? value : !showExploreAgents.value;
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
  if (props.selectedCollection !== "default") {
    return props.selectedCollection;
  }
  return props.collections.length > 0 ? props.collections[0].id : null;
});

watch(
  () => props.initialSessionsOpen,
  (newValue) => {
    if (!userClickedSessions.value) {
      showSessions.value = newValue;
    }
  },
  { immediate: true },
);

watch(
  () => props.initialExploreAgentsOpen,
  (newValue) => {
    if (!userClickedExploreAgents.value) {
      showExploreAgents.value = newValue;
    }
  },
  { immediate: true },
);

watch(showExploreAgents, (newValue) => {
  if (newValue) {
    // triggerExploreAgentsFocusAnimation();
  }
});

defineExpose({
  toggleExploreAgents,
  toggleSessions,
  triggerExploreAgentsFocusAnimation,
  toggleSidebar,
});

const startEditing = (session) => {
  editingSessionId.value = session.session_id;
  editingName.value = session.name || "";
  nextTick(() => {
    const input = document.getElementById(`edit-input-${session.session_id}`);
    if (input) {
      input.focus();
      input.select();
    }
  });
};

const cancelEditing = () => {
  editingSessionId.value = null;
  editingName.value = "";
};

const saveSessionName = (session) => {
  if (editingSessionId.value !== session.session_id) return;
  const trimmed = (editingName.value || "").trim();
  emit("update-session-name", { sessionId: session.session_id, name: trimmed });
  cancelEditing();
};

const copySessionId = async (sessionId) => {
  try {
    await navigator.clipboard.writeText(String(sessionId));
  } catch (error) {
    console.error("Failed to copy session ID", error);
  }
};
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
    background-color: #fff5ec;
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
