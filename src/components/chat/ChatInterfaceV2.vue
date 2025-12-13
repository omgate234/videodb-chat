<template>
  <div class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-overflow-hidden">
    <Sidebar v-if="sidebarConfig.enabled" ref="sidebarRef" class="vdb-c-flex-shrink-0" />
    <PageDisplay class="vdb-c-flex-1 vdb-c-overflow-auto" />
  </div>
</template>
<script setup>
import { computed, nextTick, onUnmounted, provide, ref, watch } from 'vue';

import { useChatInterface } from '../hooks/useChatInterface';
import { useVideoDBAgent } from '../hooks/useVideoDBAgent';

import Sidebar from './v2/Sidebar.vue';
import PageDisplay from './PageDisplay.vue';

import ChatSearchResults from '../message-handlers/ChatSearchResults.vue';
import ChatVideo from '../message-handlers/ChatVideo.vue';
import ChatVideos from '../message-handlers/ChatVideos.vue';
import DeepSearchContent from '../message-handlers/deepsearch/DeepSearchContent.vue';
import ImageHandler from '../message-handlers/ImageHandler.vue';
import TextResponse from '../message-handlers/TextResponse.vue';
import SuggestedQuestionsContent from '../message-handlers/SuggestedQuestionsContent.vue';
import DeleteIcon from '../icons/Delete3.vue';

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

const emit = defineEmits([]);
const chatInputRef = ref(null);
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
  fetchCollectionVideos,
  refetchCollectionVideos,
  activeCollectionAudios,
  activeAudioData,
  fetchCollectionAudios,
  refetchCollectionAudios,
  activeCollectionImages,
  activeImageData,
  fetchCollectionImages,
  refetchCollectionImages,
  deleteVideo,
  deleteAudio,
  deleteImage,
  getVideoDownloadUrl,
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

const selectedSessionId = computed(() =>
  navState.currentPage === 'chat' ? navState.activeParams?.sessionId || null : null
);

const selectedCollectionId = computed(() => {
  if (navState.currentPage === 'collection' && navState.activeParams?.id) {
    return navState.activeParams.id;
  }

  if (navState.currentPage === 'chat' && selectedSessionId.value) {
    const activeSession = sessions.value?.find((s) => s.session_id === selectedSessionId.value);
    if (activeSession?.collection_id) {
      return activeSession.collection_id;
    }
  }

  return collectionId.value || 'default';
});

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
      if (newParams?.sessionId) {
        if (sessionId.value !== newParams.sessionId) {
          sessionId.value = newParams.sessionId;
          loadSession(newParams.sessionId);
        }
      } else {
        sessionId.value = null;
      }
    }

    if (navState.currentPage === 'collection' && newParams?.id) {
      collectionId.value = newParams.id;
    } else if (navState.currentPage !== 'collection' && navState.currentPage !== 'chat') {
      collectionId.value = 'default';
    }
  },
  { deep: true, immediate: true }
);

watch(
  () => navState.currentPage,
  (newPage) => {
    if (newPage !== 'chat' && sessionId.value) {
      sessionId.value = null;
    }
  }
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
registerMessageHandler('deepsearch', DeepSearchContent);
registerMessageHandler('text', TextResponse);
registerMessageHandler('search_results', ChatSearchResults);
registerMessageHandler('image', ImageHandler);
registerMessageHandler('suggested_questions', SuggestedQuestionsContent);

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
  nextTick(() => {
    const userMessages = document.querySelectorAll('[data-msg-type="input"]');

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
  console.log('chatLoading', val);
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
  const targetCollectionId =
    (selectedCollectionId.value && selectedCollectionId.value !== 'default'
      ? selectedCollectionId.value
      : collections.value?.[0]?.id) || 'default';

  actions.goToCollection(targetCollectionId);
};

const handleCreateNewSession = () => {
  createNewSession();
};

const handleSessionClick = (sessionId) => {
  showCollectionView.value = false;
  actions.goToChat(sessionId);
};

const handleCollectionClick = (_collectionId) => {
  actions.goToCollection(_collectionId);
};

const handleNavigateToAssets = () => {
  actions.goToAssets();
};

const handleNavigateToAgents = () => {
  actions.goToAgents();
};

const handleTagAgent = (agent, addToInput = true) => {
  const agentName = agent.name || agent;
  if (agentName) {
    taggedAgent.value.push(agentName);
    if (addToInput) {
      chatInput.value =
        chatInput.value.trim() === '' ? `@${agentName}` : `${chatInput.value} @${agentName}`;
      chatInputRef.value.focus();
    }
  }
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

const handleAddMessage = async ({
  text = '',
  images = [],
  videos = [],
  audios = [],
  video_id = null,
  files = [],
  agents = [],
  additionalInfo = null,
}) => {
  const isCollectionPage = navState.currentPage === 'collection';
  const activeCollectionId =
    selectedCollectionId?.value || navState.activeParams?.id || collectionId.value || null;

  if (!sessionId.value) {
    if (isCollectionPage && activeCollectionId && collectionId.value !== activeCollectionId) {
      collectionId.value = activeCollectionId;
    }
    loadSession();
  } else if (isCollectionPage && activeCollectionId && collectionId.value !== activeCollectionId) {
    collectionId.value = activeCollectionId;
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
  if (videos?.length > 0) {
    for (const video of videos) {
      content.push({
        type: 'video',
        video: {
          video_id: video.id,
        },
      });
    }
  }
  if (audios?.length > 0) {
    for (const audio of audios) {
      content.push({
        type: 'audio',
        audio: {
          audio_id: audio.id,
        },
      });
    }
  }

  // Handle file uploads if files are provided
  // TODO: Implement file upload logic here
  if (files?.length > 0) {
    console.log('Files to upload:', files);
    // Files will be handled here in future implementation
  }

  // Use first video_id if videos array is provided and video_id is not set
  const finalVideoId = video_id || (videos?.length > 0 ? videos[0].id : null);

  addMessage({
    content: content,
    agents: agents,
    video_id: finalVideoId,
    additional_data: additionalInfo,
  });
  taggedAgent.value = [];

  if (actions?.goToChat && sessionId.value) {
    actions.goToChat(sessionId.value);
  }

  scrollToLatestUserMessage();
};

const chatAddMessage = async (messageData) => {
  const isCollectionPage = navState.currentPage === 'collection';
  const activeCollectionId =
    selectedCollectionId?.value || navState.activeParams?.id || collectionId.value || null;

  if (!sessionId.value) {
    if (isCollectionPage && activeCollectionId && collectionId.value !== activeCollectionId) {
      collectionId.value = activeCollectionId;
    }
    loadSession();
  } else if (isCollectionPage && activeCollectionId && collectionId.value !== activeCollectionId) {
    collectionId.value = activeCollectionId;
  }

  addMessage(messageData);
  taggedAgent.value = [];

  if (actions?.goToChat && sessionId.value) {
    actions.goToChat(sessionId.value);
  }

  console.log('Message added via chatAddMessage', messageData);
  scrollToLatestUserMessage();
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
  chatAddMessage,
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
  getVideoDownloadUrl,
  callApi,
  makeSessionPublic,
  fetchCollectionVideos,
  fetchCollectionAudios,
  fetchCollectionImages,
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
  showChatInput: props.showChatInput,
  chatInputPlaceholder: props.chatInputPlaceholder,
  handleAddMessage,
  handleTagAgent,
};

provide('videodb-chat', chatContext);
provide('videodb-chat-context', chatContext);
</script>
