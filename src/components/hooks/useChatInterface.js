import { ref, reactive } from "vue";

export function useChatInterface() {
  const messageHandlers = {};
  const stepActionHandlers = {};
  const chatInput = ref("");
  const chatAttachments = reactive([]);

  const registerMessageHandler = (contentType, handler) => {
    messageHandlers[contentType] = handler;
  };

  const registerStepActionHandler = (typeKey, renderer) => {
    stepActionHandlers[typeKey] = renderer;
  };

  const setChatInput = (input) => {
    chatInput.value = input;
  };

  return {
    chatInput,
    chatAttachments,
    setChatInput,
    messageHandlers,
    registerMessageHandler,
    stepActionHandlers,
    registerStepActionHandler,
  };
}
