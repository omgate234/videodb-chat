import { ref, reactive } from "vue";

export function useChatInterface(initialPage = "default", initialParams = null) {
  const messageHandlers = {};
  const chatInput = ref("");
  const chatAttachments = reactive([]);

  const canvasHandlers = {};
  const canvasState = reactive({
    show: false,
    type: null,
    content: null,
  });

  const navState = reactive({
    currentPage: initialPage,
    activeParams: initialParams,
  });

  const registerMessageHandler = (contentType, handler) => {
    messageHandlers[contentType] = handler;
  };

  const registerCanvasHandler = (canvasType, handler) => {
    canvasHandlers[canvasType] = handler;
  };

  const setChatInput = (input) => {
    chatInput.value = input;
  };

  const openCanvas = (type, content) => {
    canvasState.show = true;
    canvasState.type = type;
    canvasState.content = content || null;
  };

  const closeCanvas = () => {
    canvasState.show = false;
    canvasState.type = null;
    canvasState.content = null;
  };

  const actions = {
    goToDefault: () => {
      navState.currentPage = "default";
      navState.activeParams = null;
    },

    goToChat: (sessionId) => {
      navState.currentPage = "chat";
      navState.activeParams = sessionId ? { sessionId } : null;
    },

    goToCollection: (collectionId) => {
      navState.currentPage = "collection";
      navState.activeParams = { id: collectionId };
    },

    goToAssets: () => {
      navState.currentPage = "assets";
      navState.activeParams = null;
    },

    goToAgents: () => {
      navState.currentPage = "agents";
      navState.activeParams = null;
    },
  };

  return {
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
  };
}
