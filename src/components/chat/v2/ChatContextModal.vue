<template>
  <transition
    enter-active-class="vdb-c-transition-all vdb-c-duration-200 vdb-c-ease-out"
    leave-active-class="vdb-c-transition-all vdb-c-duration-150 vdb-c-ease-in"
    enter-from-class="vdb-c-translate-y-2 vdb-c-opacity-0"
    enter-to-class="vdb-c-translate-y-0 vdb-c-opacity-100"
    leave-from-class="vdb-c-translate-y-0 vdb-c-opacity-100"
    leave-to-class="vdb-c-translate-y-2 vdb-c-opacity-0"
  >
    <div
      v-if="isOpen && !chatLoading"
      class="vdb-c-fixed vdb-c-bottom-[180px] vdb-c-right-[20px] vdb-c-z-50 vdb-c-flex vdb-c-h-[70vh] vdb-c-w-[450px] vdb-c-flex-col vdb-c-overflow-hidden vdb-c-rounded-16 vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white"
    >
      <!-- Header -->
      <div
        class="vdb-c-flex vdb-c-h-48 vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-between vdb-c-gap-12 vdb-c-rounded-t-16 vdb-c-border-b vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-16 vdb-c-py-12"
      >
        <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
          <span class="vdb-c-text-[15px] vdb-c-font-semibold vdb-c-leading-6 vdb-c-text-[#1A1A1A]">
            Chat Context
          </span>
          <span v-if="hasChanges" class="vdb-c-text-[12px] vdb-c-font-medium vdb-c-text-[#EC5B16]">
            (Modified)
          </span>
        </div>
        <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
          <button
            v-if="hasChanges"
            @click="handleRefresh"
            class="vdb-c-flex vdb-c-h-24 vdb-c-w-24 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-4 vdb-c-transition-colors vdb-c-duration-200 hover:vdb-c-bg-[#EFEFEF]"
            title="Revert to original context"
          >
            <Reset class="vdb-c-h-16 vdb-c-w-16 vdb-c-text-[#4D4D4D]" />
          </button>
          <button
            @click="handleClose"
            class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-text-[#4D4D4D] vdb-c-transition-transform vdb-c-duration-200"
          >
            <ChevronDownIcon class="vdb-c-h-20 vdb-c-w-20 vdb-c-text-[#4D4D4D]" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div
        class="vdb-c-relative vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-overflow-hidden vdb-c-bg-white"
      >
        <!-- Loading State -->
        <div
          v-if="isLoading"
          class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-items-center vdb-c-justify-center"
        >
          <div class="vdb-c-text-[14px] vdb-c-text-[#969696]">Loading context...</div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-items-center vdb-c-justify-center vdb-c-p-20"
        >
          <div class="vdb-c-text-center vdb-c-text-[14px] vdb-c-text-[#EC5B16]">
            {{ error }}
          </div>
        </div>

        <!-- Monaco Editor -->
        <div v-else class="vdb-c-h-full vdb-c-w-full">
          <vue-monaco-editor
            v-model:value="contextData"
            language="json"
            :options="editorOptions"
            :theme="editorTheme"
            @mount="handleEditorMount"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed, unref } from 'vue';
import { VueMonacoEditor } from '@guolao/vue-monaco-editor';
import ChevronDownIcon from '../../icons/ChevronDown.vue';
import Reset from '../../icons/Reset.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  sessionId: {
    type: [String, Object],
    default: null,
  },
  fetchSessionContext: {
    type: Function,
    default: null,
  },
  chatLoading: {
    type: [Boolean, Object],
    default: false,
  },
  onContextChange: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(['close', 'context-updated']);

const originalContext = ref('');
const contextData = ref('');
const isLoading = ref(false);
const error = ref(null);
const editorInstance = ref(null);
const currentSessionId = ref(null);

const editorTheme = ref('vs');
const editorOptions = {
  automaticLayout: true,
  formatOnPaste: true,
  formatOnType: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 13,
  lineNumbers: 'on',
  roundedSelection: false,
  readOnly: false,
  cursorStyle: 'line',
  wordWrap: 'on',
  tabSize: 2,
};

const hasChanges = computed(() => {
  return originalContext.value !== contextData.value;
});

const handleEditorMount = (editor) => {
  editorInstance.value = editor;
};

const fetchContext = async (forceRefetch = false) => {
  const sessionIdValue = unref(props.sessionId);

  if (!sessionIdValue || !props.fetchSessionContext) {
    error.value = 'No active session';
    return;
  }

  if (!forceRefetch && originalContext.value) {
    return;
  }

  currentSessionId.value = sessionIdValue;
  isLoading.value = true;
  error.value = null;

  try {
    const result = await props.fetchSessionContext(sessionIdValue);

    if (result.status === 'success' && result.data) {
      console.log('result.data', result.data);
      const contextMessages = result.data.context_messages || [];
      const formattedContext = JSON.stringify(contextMessages, null, 2);
      originalContext.value = formattedContext;
      contextData.value = formattedContext;
    } else {
      error.value = 'Failed to load context';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load context';
  } finally {
    isLoading.value = false;
  }
};

const handleRefresh = () => {
  contextData.value = originalContext.value;
  notifyContextChange();
};

const notifyContextChange = () => {
  if (props.onContextChange) {
    try {
      const parsedContext = JSON.parse(contextData.value);
      const hasEdits = hasChanges.value;
      props.onContextChange({
        editedContext: hasEdits ? parsedContext : null,
        hasChanges: hasEdits,
      });
    } catch (err) {
      console.error('Invalid JSON in context editor:', err);
    }
  }
};

const handleClose = () => {
  emit('close');
};

watch(
  () => contextData.value,
  () => {
    notifyContextChange();
  }
);

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      fetchContext();
    } else {
      if (!hasChanges.value) {
        contextData.value = '';
        originalContext.value = '';
        error.value = null;
        currentSessionId.value = null;
      }
    }
  },
  { immediate: true }
);

watch(
  () => unref(props.sessionId),
  (newSessionId, oldSessionId) => {
    if (newSessionId && newSessionId !== oldSessionId && props.isOpen) {
      fetchContext(true);
    }
  }
);

watch(
  () => unref(props.chatLoading),
  (isLoading, wasLoading) => {
    if (isLoading && props.isOpen) {
      handleClose();
    } else if (!isLoading && wasLoading) {
      const sessionIdValue = unref(props.sessionId);
      if (sessionIdValue && currentSessionId.value === sessionIdValue) {
        fetchContext(true);
      }
    }
  }
);
</script>

<style scoped>
.vdb-c-shadow-xl {
  box-shadow:
    0px 10px 25px rgba(0, 0, 0, 0.1),
    0px 20px 25px rgba(0, 0, 0, 0.16);
}

:deep(.monaco-editor) {
  height: 100% !important;
}

:deep(.monaco-editor .margin),
:deep(.monaco-editor .monaco-editor-background) {
  background-color: #ffffff;
}
</style>
