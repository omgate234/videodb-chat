<template>
  <div class="vdb-c-flex vdb-c-h-full vdb-c-w-full">
    <Sidebar v-if="sidebarConfig.enabled" ref="sidebarRef" />
    <PageDisplay />
  </div>
</template>
<script setup>
import { computed, nextTick, onUnmounted, provide, ref, watch } from 'vue';

import { useChatInterface } from '../hooks/useChatInterface';
import { useVideoDBAgent } from '../hooks/useVideoDBAgent';

import Sidebar from './v2/Sidebar.vue';
import UploadVideoQueryCard from './elements/UploadVideoQueryCard.vue';
import PageDisplay from './PageDisplay.vue';

import ChatSearchResults from '../message-handlers/ChatSearchResults.vue';
import ChatVideo from '../message-handlers/ChatVideo.vue';
import ChatVideos from '../message-handlers/ChatVideos.vue';
import ImageHandler from '../message-handlers/ImageHandler.vue';
import TextResponse from '../message-handlers/TextResponse.vue';

import CheckIcon from '../icons/Check.vue';
import CollectionIcon from '../icons/Collection.vue';
import DeleteIcon from '../icons/Delete3.vue';
import QueryIcon from '../icons/Query.vue';
import SearchIcon from '../icons/SearchIcon.vue';

const props = defineProps({
  currentPage: {
    type: String,
    default: 'default',
  },
  chatInputPlaceholder: {
    type: String,
    default: 'Ask Director',
  },
  customChatHook: {
    type: Function,
    default: null,
  },
  chatHookConfig: {
    type: Object,
    default: () => ({
      currentPage: 'default',
      chatInputPlaceholder: 'Ask Director',
      customChatHook: null,
      socketUrl: 'http://127.0.0.1:8000/chat',
      httpUrl: 'http://127.0.0.1:8000',
      debug: false,
    }),
  },
  size: {
    type: String,
    default: 'full',
    validator: (value) => ['full', 'embedded'].includes(value),
  },
  headerConfig: {
    type: Object,
    default: () => ({
      uploadButton: true,
    }),
  },
  sidebarConfig: {
    type: Object,
    default: () => ({
      enabled: true,
      links: [
        {
          href: 'https://www.youtube.com/playlist?list=PLhxAMFLSSK039xl1UgcZmoFLnb-qNRYQw',
          text: 'Watch Demos',
        },
        {
          href: 'https://console.dev.videodb.io',
          text: 'VideoDB Console',
        },
      ],
      footerConfig: {
        user: null,
        buttons: [],
      },
    }),
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showChatInput: {
    type: Boolean,
    default: true,
  },
  defaultScreenConfig: {
    type: Object,
    default: () => ({
      actionCardQueries: null,
      enableVideoView: true,
      demoVideos: [
        {
          id: 1,
          external_url: 'https://www.youtube.com/watch?v=Dncn_0RWrro',
          thumbnail_url:
            'https://raw.githubusercontent.com/video-db/videodb-cookbook-assets/main/images/thumbnail_automated.png',
        },
        {
          id: 2,
          external_url: 'https://www.youtube.com/watch?v=bct8Vvl2acU',
          thumbnail_url:
            'https://raw.githubusercontent.com/video-db/videodb-cookbook-assets/main/images/thumbnail_gen_ai.png',
        },
        {
          id: 3,
          external_url: 'https://www.youtube.com/watch?v=KcoA0eio1Zo',
          thumbnail_url:
            'https://raw.githubusercontent.com/video-db/videodb-cookbook-assets/main/images/thumbnail_profanity.png',
        },
        {
          id: 4,
          external_url: 'https://www.youtube.com/watch?v=7J7oBIv4eOY',
          thumbnail_url:
            'https://raw.githubusercontent.com/video-db/videodb-cookbook-assets/main/images/thumbnail_keyword.png',
        },
      ],
    }),
  },
  customMessageHandlers: {
    type: Array,
    default: () => [],
  },
  customCanvasHandlers: {
    type: Array,
    default: () => [],
  },
  sessionId: {
    type: String,
    default: undefined,
  },
  collectionId: {
    type: String,
    default: 'default',
  },
  onNavConfigChange: {
    type: Function,
    default: undefined,
  },
});

const selectedSessionId = ref(props.sessionId || null);
const selectedCollectionId = ref(props.collectionId || null);

const emit = defineEmits([]);
const sidebarRef = ref(null);
const chatInputRef = ref(null);
const uploadNotificationsRef = ref(null);
const notificationCenterRef = ref(null);

const showCollectionView = ref(false);
const taggedAgent = ref([]);

const useChatHook = props.customChatHook || useVideoDBAgent;
const agentHook = useChatHook(props.chatHookConfig);
const {
  configStatus,
  sessionId,
  collectionId,
  videoId,
  collections,
  sessions,
  agents,
  activeCollectionData,
  activeCollectionVideos,
  activeVideoData,
  addMessage,
  deleteSession,
  conversations,
  loadSession,
  generateImageUrl,
  generateAudioUrl,
  uploadMedia,
  createCollection,
  deleteCollection,
  refetchCollectionVideos,
  activeCollectionAudios,
  activeAudioData,
  refetchCollectionAudios,
  activeCollectionImages,
  activeImageData,
  refetchCollectionImages,
  deleteVideo,
  deleteAudio,
  deleteImage,
  renameSession,
  makeSessionPublic,
  updateCollection,
  callApi,
} = agentHook;

const getInitialParams = () => {
  if (props.currentPage === 'chat') {
    if (!props.sessionId) {
      return null;
    }
    return { sessionId: props.sessionId };
  }
  if (props.currentPage === 'collection') {
    if (!props.collectionId) {
      return null;
    }
    return { id: props.collectionId };
  }
  return null;
};

const getInitialPage = () => {
  if (props.currentPage === 'chat' && !props.sessionId) {
    return 'default';
  }
  if (props.currentPage === 'collection' && !props.collectionId) {
    return 'default';
  }
  return props.currentPage || 'default';
};

const {
  chatInput,
  chatAttachments,
  setChatInput,
  messageHandlers,
  registerMessageHandler,
  canvasHandlers,
  registerCanvasHandler,
  canvasState,
  openCanvas,
  closeCanvas,
  navState,
  actions,
} = useChatInterface(getInitialPage(), getInitialParams());

watch(
  () => ({ currentPage: navState.currentPage, activeParams: navState.activeParams }),
  (newNavState) => {
    if (props.onNavConfigChange) {
      props.onNavConfigChange(newNavState);
    }
  },
  { deep: true }
);

watch(
  () => props.currentPage,
  (newPage) => {
    if (!newPage) return;

    if (newPage === 'chat' && !props.sessionId) {
      actions.goToDefault();
      return;
    }
    if (newPage === 'collection' && !props.collectionId) {
      actions.goToDefault();
      return;
    }

    if (navState.currentPage !== newPage) {
      navState.currentPage = newPage;
      if (newPage === 'chat' && props.sessionId) {
        navState.activeParams = { sessionId: props.sessionId };
      } else if (newPage === 'collection' && props.collectionId) {
        navState.activeParams = { id: props.collectionId };
      } else {
        navState.activeParams = null;
      }
    }
  },
  { immediate: true }
);

watch(
  () => props.sessionId,
  (newSessionId) => {
    selectedSessionId.value = newSessionId || null;

    if (navState.currentPage === 'chat') {
      if (!newSessionId) {
        // If sessionId becomes empty, go to default
        actions.goToDefault();
      } else {
        navState.activeParams = { sessionId: newSessionId };
      }
    }
  }
);

watch(
  () => props.collectionId,
  (newCollectionId) => {
    selectedCollectionId.value = newCollectionId || null;

    if (navState.currentPage === 'collection') {
      if (!newCollectionId) {
        actions.goToDefault();
      } else {
        navState.activeParams = { id: newCollectionId };
      }
    }
  }
);

watch(
  () => navState.activeParams,
  (newParams) => {
    if (navState.currentPage === 'chat') {
      selectedSessionId.value = newParams?.sessionId || null;
    }

    if (navState.currentPage === 'collection' && newParams?.id) {
      collectionId.value = newParams.id;
      selectedCollectionId.value = newParams.id;
    } else if (navState.currentPage !== 'collection') {
      collectionId.value = 'default';
      selectedCollectionId.value = 'default';
    }
  },
  { deep: true }
);

watch(chatAttachments, async (newAttachments) => {
  for (const attachment of newAttachments) {
    if (attachment.upload && attachment.upload_status === 'in_queue') {
      attachment.upload_status = 'uploading';

      try {
        const uploadData = {
          source: attachment.image_data,
          sourceType: 'file',
          collectionId: activeCollectionData.value?.id,
        };

        const res = await uploadMedia(uploadData);
        if (res.ok) {
          const uploadResData = await res.json();
          const generateUrlData = await generateImageUrl(
            uploadResData.collection_id,
            uploadResData.id
          );

          // Update attachment with image data
          attachment.image_id = uploadResData.id;
          attachment.url = generateUrlData.url;
          attachment.upload_status = 'complete';
        } else {
          throw Error('Upload failed');
        }
      } catch (e) {
        console.log('something went wrong', e);
        attachment.upload_status = 'error';
      }
    }
  }
});

registerMessageHandler('video', ChatVideo);
registerMessageHandler('videos', ChatVideos);
registerMessageHandler('text', TextResponse);
registerMessageHandler('search_results', ChatSearchResults);
registerMessageHandler('image', ImageHandler);

if (Array.isArray(props.customMessageHandlers)) {
  for (const handler of props.customMessageHandlers) {
    registerMessageHandler(handler.type, handler.component);
  }
}

if (Array.isArray(props.customCanvasHandlers)) {
  for (const handler of props.customCanvasHandlers) {
    if (handler && typeof handler.type === 'string' && handler.component) {
      registerCanvasHandler(handler.type, handler.component);
    }
  }
}

const chatWindowRef = ref(null);
const headerRef = ref(null);
const headerHeight = ref(0);
const headerObserver = ref(null);
const showDeleteCollectionErrorModal = ref(false);
const deleteCollectionErrorCode = ref(null);

const isSetupComplete = computed(() => {
  return (
    typeof configStatus.value === 'object' &&
    configStatus.value !== null &&
    Object.values(configStatus.value).every((value) => value === true)
  );
});

const isFreshUser = computed(() => {
  if (
    collections.value &&
    activeCollectionVideos.value &&
    activeCollectionAudios.value &&
    activeCollectionImages.value
  ) {
    return (
      collections.value.length < 2 &&
      activeCollectionVideos.value.length < 1 &&
      activeCollectionAudios.value.length < 1 &&
      activeCollectionImages.value.length < 1
    );
  }
  return false;
});

const chatLoading = computed(() =>
  Object.values(conversations.value || {}).some((conv) =>
    Object.values(conv || {}).some(
      (content) => content?.status === 'progress' || content?.clientLoading
    )
  )
);

const isScrolled = ref(false);

watch(
  headerRef,
  (val) => {
    if (val) {
      if (headerObserver.value) {
        headerObserver.value.disconnect();
      }
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          headerHeight.value = entry.contentRect.height;
        }
      });
      headerObserver.value = observer;
      observer.observe(val);
    }
  },
  { immediate: true }
);

watch(
  headerHeight,
  (val) => {
    document.documentElement.style.setProperty('--header-height', `${val}px`);
  },
  { immediate: true }
);

const scrollToLatestUserMessage = () => {
  const chatWindow = chatWindowRef.value;
  if (!chatWindow) return;
  nextTick(() => {
    const userMessages = chatWindow.querySelectorAll('[data-msg-type="input"]');

    if (userMessages.length > 0) {
      const latestUserMessage = userMessages[userMessages.length - 1];

      latestUserMessage.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  });
};

watch(chatLoading, (val) => {
  if (val) {
    scrollToLatestUserMessage();
  }
});

watch(sessionId, () => {
  if (canvasState.show) {
    closeCanvas();
  }
});

watch(
  () => Object.keys(conversations).length,
  (newLength, oldLength) => {
    if (oldLength > 0 && newLength === 0 && canvasState.show) {
      closeCanvas();
    }
  }
);

const createNewSession = () => {
  videoId.value = null;
  showCollectionView.value = false;
  taggedAgent.value = [];
  actions.goToChat();
};

const handleCreateNewSession = () => {
  createNewSession();
};

const handleSessionClick = (sessionId) => {
  selectedSessionId.value = sessionId || null;
  showCollectionView.value = false;
  actions.goToChat(sessionId);
};

const handleCollectionClick = (_collectionId) => {
  selectedCollectionId.value = _collectionId || null;
  actions.goToCollection(_collectionId);
};

const handleNavigateToAssets = () => {
  actions.goToAssets();
};

const handleNavigateToAgents = () => {
  actions.goToAgents();
};

const handleAgentClick = (agent) => {
  if (!chatLoading.value) {
    handleTagAgent(agent, false);
    handleAddMessage({ text: `@${agent.name} ` });
  }
};

const handleUpdateSessionName = async ({ sessionId: _sessionId, name }) => {
  const sessionIndex = sessions.value.findIndex((s) => s.session_id === _sessionId);
  const previousName = sessionIndex !== -1 ? sessions.value[sessionIndex].name : null;

  if (sessionIndex !== -1) {
    sessions.value[sessionIndex] = { ...sessions.value[sessionIndex], name };
  }

  try {
    await renameSession(_sessionId, name);
  } catch (error) {
    if (sessionIndex !== -1) {
      sessions.value[sessionIndex] = { ...sessions.value[sessionIndex], name: previousName };
    }
    console.error('Error renaming session:', error?.message || error);
  }
};

const fetchCollectionVideos = async (collectionId) => {
  try {
    const result = await callApi(`/videodb/collection/${collectionId}/video`, {
      method: 'GET',
    });
    return { data: result.data || result || [] };
  } catch (error) {
    console.error('Error fetching collection videos:', error);
    return { data: [] };
  }
};

const handleUpdateCollectionName = async ({ collectionId, name }) => {
  const collectionIndex = collections.value.findIndex((c) => c.id === collectionId);
  const previousName = collectionIndex !== -1 ? collections.value[collectionIndex].name : null;

  if (collectionIndex !== -1) {
    collections.value[collectionIndex] = { ...collections.value[collectionIndex], name };
  }

  try {
    await callApi(`/videodb/collection/${collectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: {
        name,
      },
    });
    await updateCollection();
  } catch (error) {
    if (collectionIndex !== -1) {
      collections.value[collectionIndex] = {
        ...collections.value[collectionIndex],
        name: previousName,
      };
    }
    console.error('Error renaming collection:', error?.message || error);
  }
};

const showDeleteSessionDialog = (_sessionId) => {
  if (_sessionId === sessionId.value) {
    createNewSession();
  }
  deleteSession(_sessionId);
};

const promptDeleteCollection = async (collection) => {
  try {
    await deleteCollection(collection?.id);
    notificationCenterRef.value.addNotification('Collection deleted successfully.', {
      type: 'error',
      icon: DeleteIcon,
    });
  } catch (error) {
    if (error.message.includes('Invalid request: Your collection has non-zero')) {
      if (error.message.includes('non-zero videos')) {
        deleteCollectionErrorCode.value = 'videos';
      } else if (error.message.includes('non-zero audios')) {
        deleteCollectionErrorCode.value = 'audios';
      } else if (error.message.includes('non-zero images')) {
        deleteCollectionErrorCode.value = 'images';
      }
      showDeleteCollectionErrorModal.value = true;
      return;
    }
    console.error('Unexpected error deleting collection:', error);
  }
};

const handleAddMessage = async ({ text = '', images = [] }) => {
  if (!sessionId.value) {
    loadSession();
  }

  const content = [];
  if (text) {
    content.push({ type: 'text', text: text });
  }
  if (images?.length > 0) {
    for (const image of images) {
      content.push({
        type: 'image',
        image: {
          image_id: image.image_id,
          url: image.url,
        },
      });
    }
  }

  addMessage({
    content: content,
    agents: taggedAgent.value,
  });
  taggedAgent.value = [];
};

onUnmounted(() => {
  if (headerObserver.value) {
    headerObserver.value.disconnect();
  }
});

defineExpose({
  chatInput,
  chatAttachments,
  chatInputRef,
  conversations,
  messageHandlers,
  addMessage,
  loadSession,
  activeCollectionData,
  activeCollectionVideos,
  activeCollectionAudios,
  activeCollectionImages,
  createNewSession,
  setChatInput,
  registerMessageHandler,
  uploadMedia,
  isScrolled,
  canvasState,
  openCanvas,
  closeCanvas,
});

const chatContext = {
  chatInput,
  chatAttachments,
  chatLoading,
  conversations,
  messageHandlers,
  addMessage,
  loadSession,
  activeCollectionData,
  activeCollectionVideos,
  activeCollectionAudios,
  activeCollectionImages,
  setChatInput,
  registerMessageHandler,
  uploadMedia,
  canvasHandlers,
  registerCanvasHandler,
  canvasState,
  openCanvas,
  closeCanvas,
  navState,
  actions,
  configStatus,
  sessionId,
  collectionId,
  videoId,
  collections,
  sessions,
  agents,
  activeVideoData,
  activeAudioData,
  activeImageData,
  selectedSessionId,
  selectedCollectionId,
  deleteSession,
  generateImageUrl,
  generateAudioUrl,
  createCollection,
  deleteCollection,
  refetchCollectionVideos,
  refetchCollectionAudios,
  refetchCollectionImages,
  deleteVideo,
  deleteAudio,
  deleteImage,
  callApi,
  makeSessionPublic,
  fetchCollectionVideos,
  handleCreateNewSession,
  handleSessionClick,
  handleCollectionClick,
  handleAgentClick,
  handleNavigateToAssets,
  handleNavigateToAgents,
  handleUpdateSessionName,
  handleUpdateCollectionName,
  showDeleteSessionDialog,
  promptDeleteCollection,
  showCollectionView,
  isSetupComplete,
  isFreshUser,
  selectedSessionId,
  selectedCollectionId,
  sidebarConfig: props.sidebarConfig,
};

provide('videodb-chat', chatContext);
provide('videodb-chat-context', chatContext);
</script>
