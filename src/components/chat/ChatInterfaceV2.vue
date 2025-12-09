<template>
  <div class="vdb-c-flex vdb-c-h-full vdb-c-w-full">
    <Sidebar
      v-if="sidebarConfig.enabled"
      ref="sidebarRef"
      :status="configStatus !== null && isSetupComplete ? 'active' : 'inactive'"
      :new-session-button-status="
        Object.keys(conversations).length === 0 && !showCollectionView ? 'inactive' : 'active'
      "
      :config="sidebarConfig"
      :show-selected-collection="Object.keys(conversations).length === 0 && !showCollectionView"
      :initial-sessions-open="!isFreshUser"
      :initial-explore-agents-open="!isFreshUser"
      :selected-session="sessionId"
      :add-dummy-session="Object.keys(conversations).length === 0"
      :selected-collection="collectionId"
      :agents="agents"
      :sessions="sessions"
      :collections="collections"
      @create-new-session="handleCreateNewSession"
      @create-collection="showCreateCollectionModal = true"
      @delete-session="showDeleteSessionDialog"
      @delete-collection="promptDeleteCollection"
      @update-session-name="handleUpdateSessionName"
      @share-session="handleShareSession"
      @agent-click="handleAgentClick"
      @session-click="handleSessionClick"
      @collection-click="handleCollectionClick"
      @navigate-to-assets="handleNavigateToAssets"
      @navigate-to-agents="handleNavigateToAgents"
    />
    <PageDisplay />
  </div>
</template>
<script setup>
import { computed, nextTick, onUnmounted, provide, ref, watch } from 'vue';

import { useChatInterface } from '../hooks/useChatInterface';
import { useVideoDBAgent } from '../hooks/useVideoDBAgent';

import ChatInput from './ChatInput.vue';
import ChatMessageContainer from './ChatMessageContainer.vue';
import CollectionView from './CollectionView.vue';
import DefaultScreen from './elements/DefaultScreen.vue';
import NotificationCenter from './elements/NotificationCenter.vue';
import SetupScreen from './elements/SetupScreen.vue';
import Sidebar from './v2/Sidebar.vue';
import UploadNotifications from './elements/UploadNotifications.vue';
import UploadVideoQueryCard from './elements/UploadVideoQueryCard.vue';
import PageDisplay from './PageDisplay.vue';

import ConfirmModal from '../modals/ConfirmModal.vue';
import CreateCollectionModal from '../modals/CreateCollectionModal.vue';
import DeleteCollectionErrorModal from '../modals/DeleteCollectionErrorModal.vue';
import UploadModal from '../modals/UploadModal.vue';
import Header from './elements/Header.vue';

import ChatSearchResults from '../message-handlers/ChatSearchResults.vue';
import ChatVideo from '../message-handlers/ChatVideo.vue';
import ChatVideos from '../message-handlers/ChatVideos.vue';
import ImageHandler from '../message-handlers/ImageHandler.vue';
import TextResponse from '../message-handlers/TextResponse.vue';

import CheckIcon from '../icons/Check.vue';
import CollectionIcon from '../icons/Collection.vue';
import DeleteIcon from '../icons/Delete3.vue';
import DirectorIcon from '../icons/Director.vue';
import ExternalLink from '../icons/ExternalLink.vue';
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
        // If collectionId becomes empty, go to default
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
    if (navState.currentPage === 'collection' && newParams?.id) {
      collectionId.value = newParams.id;
    } else if (navState.currentPage !== 'collection') {
      collectionId.value = 'default';
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

const isStaticPage = ref(false);
const chatWindowRef = ref(null);
const headerRef = ref(null);
const headerHeight = ref(0);
const headerObserver = ref(null);
const showDeleteVideoDialog = ref(false);
const videoToDelete = ref(null);
const showDeleteAudioDialog = ref(false);
const audioToDelete = ref(null);
const showDeleteImageDialog = ref(false);
const imageToDelete = ref(null);
const showDeleteCollectionErrorModal = ref(false);
const deleteCollectionErrorCode = ref(null);
const showShareModal = ref(false);
const sessionToShare = ref(null);

const isSetupComplete = computed(() => {
  return (
    typeof configStatus.value === 'object' &&
    configStatus.value !== null &&
    Object.values(configStatus.value).every((value) => value === true)
  );
});

const isContentLoading = computed(() => {
  return !(
    Array.isArray(activeCollectionVideos.value) &&
    Array.isArray(activeCollectionImages.value) &&
    Array.isArray(activeCollectionAudios.value)
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

const isDefaultScreen = computed(
  () => Object.keys(conversations).length === 0 && !showCollectionView.value
);

const isCollectionView = computed(
  () => Object.keys(conversations).length === 0 && showCollectionView.value
);

const isScrolled = ref(false);

const handleScroll = () => {
  if (chatWindowRef.value) {
    isScrolled.value = chatWindowRef.value.scrollTop > 0;
  }
};

const dynamicActionCards = computed(() => {
  return (
    props.defaultScreenConfig.actionCardQueries ||
    (!isFreshUser.value && activeCollectionData.value && activeCollectionVideos?.value?.length > 0
      ? [
          {
            component: UploadVideoQueryCard,
            content:
              "Upload <a href='https://www.youtube.com/watch?v=FgrO9ADPZSA' target='_blank'>https://youtu.be/FgrO9ADPZSA</a> and generate a bullet point summary.",
            type: 'primary',
            action: 'chat',
            icon: QueryIcon,
          },
          {
            content: 'What are the pre-built agents I can use right now?',
            type: 'primary',
            action: 'chat',
          },
          {
            content: 'Categorize all videos in this collection',
            type: 'primary',
            action: 'chat',
            icon: CollectionIcon,
          },
        ]
      : [
          {
            component: UploadVideoQueryCard,
            content:
              "Upload <a href='https://www.youtube.com/watch?v=FgrO9ADPZSA' target='_blank'>https://youtu.be/FgrO9ADPZSA</a> and generate a bullet point summary.",
            type: 'primary',
            action: 'chat',
            icon: QueryIcon,
          },
          {
            content: 'What are the pre-built agents I can use right now?',
            type: 'primary',
            action: 'chat',
          },
          {
            content: 'Show me how the search agent works? ',
            type: 'primary',
            action: 'chat',
            icon: SearchIcon,
          },
        ])
  );
});

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

// -- Header Click handlers --
const toggleSidebar = () => {
  sidebarRef.value?.toggleSidebar();
};

// --- Sidebar Click Handlers ---
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

const handleAgentClick = (agent) => {
  if (!chatLoading.value) {
    handleTagAgent(agent, false);
    handleAddMessage({ text: `@${agent.name} ` });
  }
};

const handleUpdateSessionName = (data) => {
  // TODO: Implement session name update
  console.log('Update session name:', data);
};

const handleShareSession = (session) => {
  sessionToShare.value = session;
  showShareModal.value = true;
};

const showDeleteDialog = ref(false);
const sessionToDelete = ref(null);

const showDeleteSessionDialog = (_sessionId) => {
  sessionToDelete.value = _sessionId;
  showDeleteDialog.value = true;
};

const confirmDeleteSession = () => {
  if (sessionToDelete.value === sessionId.value) {
    createNewSession();
  }
  deleteSession(sessionToDelete.value);
  showDeleteDialog.value = false;
  sessionToDelete.value = null;
};

// --- Upload Dialog Handlers ---
const showUploadDialog = ref(false);
const handleUpload = async (uploadData) => {
  showUploadDialog.value = false;
  let name = 'Media';
  if (uploadData.sourceType === 'file') {
    name = uploadData.source.name;
  } else {
    name = uploadData.source.url;
  }
  const uploadId = uploadNotificationsRef.value.addUpload(name);
  try {
    const res = await uploadMedia(uploadData);
    if (res.ok) {
      uploadNotificationsRef.value.updateUploadStatus(uploadId, 'success');
      refetchCollectionVideos();
      refetchCollectionAudios();
      refetchCollectionImages();
    } else {
      uploadNotificationsRef.value.updateUploadStatus(uploadId, 'error');
    }
  } catch (e) {
    uploadNotificationsRef.value.updateUploadStatus(uploadId, 'error');
  }
};

// --- Handle Default Screen Click Handlers ---
const handleQueryCardClick = (query) => {
  if (query.action === 'show-collection') {
    showCollectionView.value = true;
    chatInput.value = '';
  } else if (query.action === 'chat') {
    chatInput.value = '';
    handleAddMessage({ text: query.content });
  }
};

const handleViewAllVideosClick = (redirectTo = '') => {
  if (redirectTo.includes('youtube.com')) {
    window.open(redirectTo, '_blank');
  } else {
    showCollectionView.value = true;
    chatInput.value = '';
  }
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

// --- CollectionView/VideoView Click Handlers ---
const handleVideoClick = (video) => {
  if (video.external_url) {
    window.open(video.external_url, '_blank');
  } else {
    videoId.value = video.id;
    handleAddMessage({ text: `@stream_video ${video.name}` });
  }
};

const promptDeleteVideo = (video) => {
  videoToDelete.value = video;
  showDeleteVideoDialog.value = true;
};

const promptDeleteAudio = (audio) => {
  audioToDelete.value = audio;
  showDeleteAudioDialog.value = true;
};

const promptDeleteImage = (image) => {
  imageToDelete.value = image;
  showDeleteImageDialog.value = true;
};

const confirmDeleteVideo = async () => {
  if (!videoToDelete.value) {
    console.error('No video to delete.');
    return;
  }

  showDeleteVideoDialog.value = false;

  const { collection_id, id } = videoToDelete.value;
  videoToDelete.value = null;

  try {
    await deleteVideo(collection_id, id);
    notificationCenterRef.value.addNotification('Video deleted successfully.', {
      type: 'error',
      icon: DeleteIcon,
    });
  } catch (error) {
    console.error(`Error deleting video: ${error.message}`);
    notificationCenterRef.value.addNotification('Error deleting video', {
      type: 'error',
      icon: DeleteIcon,
    });
  }
};

const confirmDeleteAudio = async () => {
  if (!audioToDelete.value) {
    console.error('No video to delete.');
    return;
  }

  showDeleteAudioDialog.value = false;

  const { collection_id, id } = audioToDelete.value;
  audioToDelete.value = null;

  try {
    await deleteAudio(collection_id, id);
    notificationCenterRef.value.addNotification('Audio deleted successfully.', {
      type: 'error',
      icon: DeleteIcon,
    });
  } catch (error) {
    console.error(`Error deleting audio: ${error.message}`);
    notificationCenterRef.value.addNotification('Error deleting audio', {
      type: 'error',
      icon: DeleteIcon,
    });
  }
};

const confirmDeleteImage = async () => {
  if (!imageToDelete.value) {
    console.error('No video to delete.');
    return;
  }

  showDeleteImageDialog.value = false;

  const { collection_id, id } = imageToDelete.value;
  imageToDelete.value = null;

  try {
    await deleteImage(collection_id, id);
    notificationCenterRef.value.addNotification('Image deleted successfully.', {
      type: 'error',
      icon: DeleteIcon,
    });
  } catch (error) {
    console.error(`Error deleting image: ${error.message}`);
    notificationCenterRef.value.addNotification('Error deleting image', {
      type: 'error',
      icon: DeleteIcon,
    });
  }
};

const showCreateCollectionModal = ref(false);

const promptCreateCollection = async (newCollection) => {
  showCreateCollectionModal.value = false;
  try {
    const createdCollection = await createCollection(
      newCollection.name,
      newCollection.description || ' '
    );
    notificationCenterRef.value.addNotification('Collection has been created successfully!', {
      type: 'success',
      icon: CheckIcon,
    });
  } catch (error) {
    console.error('Error creating collection:', error.message);
    notificationCenterRef.value.addNotification('Failed to create collection', {
      type: 'error',
    });
  }
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
};

provide('videodb-chat', chatContext);
provide('videodb-chat-context', chatContext);
</script>
