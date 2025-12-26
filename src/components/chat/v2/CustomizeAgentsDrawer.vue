<template>
  <Teleport to="body">
    <Transition name="drawer-backdrop">
      <div
        v-if="isOpen"
        class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-[100] vdb-c-bg-black/20"
        @click="handleBackdropClick"
      ></div>
    </Transition>

    <Transition name="drawer-slide">
      <div
        v-if="isOpen"
        class="vdb-c-fixed vdb-c-right-0 vdb-c-top-0 vdb-c-z-[101] vdb-c-flex vdb-c-h-full vdb-c-w-[620px] vdb-c-flex-col vdb-c-bg-white vdb-c-shadow-[-23px_0px_6px_0px_rgba(0,0,0,0),-15px_0px_6px_0px_rgba(0,0,0,0.01),-8px_0px_5px_0px_rgba(0,0,0,0.02),-4px_0px_4px_0px_rgba(0,0,0,0.03),-1px_0px_2px_0px_rgba(0,0,0,0.03)]"
      >
        <!-- Agent List View -->
        <div v-if="!selectedAgent" class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col">
          <div
            class="vdb-c-flex vdb-c-shrink-0 vdb-c-flex-col vdb-c-items-start vdb-c-border-b vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-[20px] vdb-c-py-[16px]"
          >
            <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[6px]">
              <div
                class="vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-justify-center vdb-c-text-[16px] vdb-c-font-semibold vdb-c-leading-[24px] vdb-c-text-[#1E1E1E]"
              >
                Customize Agents
              </div>
              <button
                @click="$emit('close')"
                class="vdb-c-flex vdb-c-h-[18px] vdb-c-w-[18px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-transition-opacity hover:vdb-c-opacity-70"
              >
                <CrossIcon :fill="'#1E1E1E'" />
              </button>
            </div>
          </div>

          <div
            class="vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-items-start vdb-c-overflow-y-auto vdb-c-bg-white vdb-c-px-[20px] vdb-c-py-[30px]"
          >
            <div class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-[8px]">
              <button
                v-for="(agent, index) in agents"
                :key="index"
                @click="handleAgentSelect(agent)"
                class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[60px] vdb-c-rounded-[10px] vdb-c-border vdb-c-border-transparent vdb-c-p-[8px] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-border-[#EFEFEF] hover:vdb-c-bg-[#F7F7F7]"
              >
                <div class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center vdb-c-gap-[16px]">
                  <div
                    class="vdb-c-flex vdb-c-h-[32px] vdb-c-w-[32px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[8px] vdb-c-bg-[#F7F7F7]"
                    :class="{ 'vdb-c-border vdb-c-border-[#EFEFEF]': agent.showBorder }"
                  >
                    <component :is="agent.icon" :color="'#1E1E1E'" />
                  </div>
                  <div
                    class="vdb-c-flex vdb-c-flex-col vdb-c-items-start vdb-c-justify-center vdb-c-gap-[4px]"
                  >
                    <div
                      class="vdb-c-flex vdb-c-flex-col vdb-c-justify-center vdb-c-whitespace-nowrap vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[normal] vdb-c-tracking-[0.08px] vdb-c-text-[#1E1E1E]"
                    >
                      {{ agent.title }}
                    </div>
                    <div
                      class="vdb-c-flex vdb-c-flex-col vdb-c-justify-center vdb-c-whitespace-nowrap vdb-c-text-[12px] vdb-c-font-normal vdb-c-leading-[16px] vdb-c-tracking-[0.08px] vdb-c-text-[#464646] vdb-c-opacity-70"
                    >
                      {{ agent.description }}
                    </div>
                  </div>
                </div>
                <ChevronRightIcon :stroke-color="agent.chevronColor" class="vdb-c-flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>

        <!-- Agent Edit View -->
        <div v-else class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col vdb-c-bg-[#F7F7F7]">
          <div
            class="vdb-c-flex vdb-c-shrink-0 vdb-c-flex-col vdb-c-items-start vdb-c-border-b vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-[20px] vdb-c-py-[16px]"
          >
            <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[6px]">
              <button
                @click="handleBack"
                class="vdb-c-flex vdb-c-h-[18px] vdb-c-w-[18px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-overflow-hidden vdb-c-transition-opacity hover:vdb-c-opacity-70"
              >
                <BackArrowIcon :fill="'#1E1E1E'" />
              </button>
              <div
                class="vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-justify-center vdb-c-text-[16px] vdb-c-font-semibold vdb-c-leading-[24px] vdb-c-text-[#1E1E1E]"
              >
                {{ selectedAgent.title }}
              </div>
              <button
                @click="$emit('close')"
                class="vdb-c-flex vdb-c-h-[18px] vdb-c-w-[18px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-transition-opacity hover:vdb-c-opacity-70"
              >
                <CrossIcon :fill="'#1E1E1E'" />
              </button>
            </div>
          </div>

          <div
            class="vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-gap-[30px] vdb-c-overflow-y-auto vdb-c-bg-white vdb-c-px-[20px] vdb-c-py-[30px]"
            @click="closeModelDropdown"
          >
            <!-- Model Selector -->
            <div
              v-if="selectedAgent.showModelSelector"
              class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-between vdb-c-rounded-[8px] vdb-c-px-0 vdb-c-py-[4px]"
            >
              <div class="vdb-c-flex vdb-c-h-full vdb-c-w-[42px] vdb-c-flex-col vdb-c-items-start">
                <div
                  class="vdb-c-flex vdb-c-flex-col vdb-c-justify-center vdb-c-whitespace-nowrap vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[normal] vdb-c-tracking-[0.07px] vdb-c-text-[#1E1E1E]"
                >
                  Model
                </div>
              </div>
              <div class="vdb-c-relative">
                <button
                  @click.stop="toggleModelDropdown"
                  class="vdb-c-flex vdb-c-items-center vdb-c-gap-[4px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-[15px] vdb-c-py-[7px] vdb-c-pl-[15px] vdb-c-pr-[9px] vdb-c-transition-all hover:vdb-c-bg-[#F7F7F7]"
                >
                  <span
                    class="vdb-c-text-nowrap vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1E1E1E]"
                  >
                    {{ selectedModelName || 'Default Model' }}
                  </span>
                  <ChevronDownIcon
                    class="vdb-c-h-[16.667px] vdb-c-w-[16.667px] vdb-c-text-[#1E1E1E]"
                  />
                </button>
                <div
                  v-if="showModelDropdown"
                  @click.stop
                  class="vdb-c-absolute vdb-c-right-0 vdb-c-top-[calc(100%+4px)] vdb-c-z-10 vdb-c-max-h-[300px] vdb-c-min-w-[200px] vdb-c-overflow-y-auto vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-py-[4px] vdb-c-shadow-lg"
                >
                  <button
                    v-for="model in availableModels"
                    :key="model.model_name"
                    @click="selectModel(model.model_name)"
                    class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-px-[12px] vdb-c-py-[8px] vdb-c-text-left vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1E1E1E] vdb-c-transition-colors hover:vdb-c-bg-[#F7F7F7]"
                  >
                    {{ model.display_name }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Prompts -->
            <div
              v-for="(promptConfig, index) in selectedAgent.prompts"
              :key="promptConfig.promptName"
              class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[10px]"
            >
              <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-[20px]">
                <div
                  class="vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-justify-center vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[normal] vdb-c-tracking-[0.07px] vdb-c-text-[#1E1E1E]"
                >
                  {{ promptConfig.label }}
                </div>
                <button
                  @click="resetPrompt(promptConfig)"
                  :disabled="isResettingPrompt"
                  class="vdb-c-flex vdb-c-items-center vdb-c-gap-[4px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-[9px] vdb-c-py-[7px] vdb-c-transition-all hover:vdb-c-bg-[#F7F7F7] disabled:vdb-c-opacity-50"
                >
                  <ResetIcon
                    :fill="'#1E1E1E'"
                    class="vdb-c-h-[16px] vdb-c-w-[16px] vdb-c-text-[#1E1E1E]"
                  />
                  <span
                    class="vdb-c-text-nowrap vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1E1E1E]"
                  >
                    Reset to default
                  </span>
                </button>
              </div>
              <TextArea
                v-model="promptConfig.value"
                @update:modelValue="markAsModified"
                :placeholder="promptConfig.label"
                :wrapper-class="'vdb-c-rounded-[12px]'"
                :textarea-class="'vdb-c-h-[50vh]'"
              />
            </div>
          </div>

          <div
            class="vdb-c-flex vdb-c-shrink-0 vdb-c-flex-col vdb-c-items-end vdb-c-justify-center vdb-c-border-t vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-[20px] vdb-c-py-[16px]"
          >
            <button
              @click="handleSave"
              :disabled="!hasModifications || isSaving || hasEmptyPrompts"
              class="vdb-c-flex vdb-c-items-center vdb-c-gap-[4px] vdb-c-rounded-[8px] vdb-c-border vdb-c-border-transparent vdb-c-px-[11px] vdb-c-py-[7px] vdb-c-text-center vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-white vdb-c-transition-all"
              :class="
                hasModifications && !isSaving && !hasEmptyPrompts
                  ? 'vdb-c-bg-[#FF7E32] hover:vdb-c-bg-[#E67129]'
                  : 'vdb-c-cursor-not-allowed vdb-c-bg-[#B9B9B9]'
              "
            >
              {{ isSaving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue';
import CrossIcon from './icons/CrossIcon.vue';
import BackArrowIcon from './icons/BackArrowIcon.vue';
import ChevronRightIcon from './icons/ChevronRightIcon.vue';
import ChevronDownIcon from './icons/ChevronDownIcon.vue';
import MixerHorizontalIcon from '../../icons/MixerHorizontalIcon.vue';
import CensorIcon from './icons/agents/CensorIcon.vue';
import ClipIcon from './icons/agents/ClipIcon.vue';
import EditIcon from './icons/agents/EditIcon.vue';
import ResetIcon from '../../icons/Reset.vue';
import TextArea from './elements/TextArea.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

const chatContext = inject('videodb-chat-context', null);

const selectedAgent = ref(null);
const hasModifications = ref(false);
const isSaving = ref(false);
const isResettingPrompt = ref(false);
const selectedModelName = ref(null);
const showModelDropdown = ref(false);
const allProviders = ref([]);

const availableModels = computed(() => {
  if (!selectedAgent.value) return [];

  if (selectedAgent.value.useAllProviders) {
    return allProviders.value.flatMap((provider) =>
      provider.models.map((model) => ({
        model_name: model.id,
        display_name: model.name,
        provider: provider.name,
      }))
    );
  } else {
    const openaiProvider = allProviders.value.find((p) => p.provider === 'openai');
    return (
      openaiProvider?.models.map((model) => ({
        model_name: model.id,
        display_name: model.name,
      })) || []
    );
  }
});

const AGENT_CONFIGS = {
  reasoning: {
    id: 'reasoning',
    title: 'Reasoning Engine',
    description: 'Core orchestration and decision-making',
    icon: MixerHorizontalIcon,
    showBorder: true,
    chevronColor: '#1E1E1E',
    showModelSelector: true,
    useAllProviders: true,
    prompts: [
      { promptName: 'system_prompt', label: 'System Prompt' },
      { promptName: 'final_cut_prompt', label: 'Final Cut Prompt' },
    ],
  },
  censor: {
    id: 'censor',
    title: 'Censor Agent',
    description: 'Content moderation and filtering',
    icon: CensorIcon,
    showBorder: false,
    chevronColor: '#969696',
    showModelSelector: true,
    useAllProviders: false,
    prompts: [{ promptName: 'censor_prompt', label: 'Censor Prompt' }],
  },
  prompt_clip: {
    id: 'prompt_clip',
    title: 'Clip Agent',
    description: 'Prompt-based video clip generation',
    icon: ClipIcon,
    showBorder: false,
    chevronColor: '#969696',
    showModelSelector: true,
    useAllProviders: false,
    prompts: [
      { promptName: 'text_prompt', label: 'Text Prompt' },
      { promptName: 'scene_prompt', label: 'Scene Prompt' },
      { promptName: 'multimodal_prompt', label: 'Multimodal Prompt' },
    ],
  },
  editing: {
    id: 'editing',
    title: 'Editing Agent',
    description: 'Video editing and manipulation',
    icon: EditIcon,
    showBorder: false,
    chevronColor: '#969696',
    showModelSelector: true,
    useAllProviders: false,
    prompts: [{ promptName: 'editing_prompt', label: 'Editing Prompt' }],
  },
};

const agents = computed(() => Object.values(AGENT_CONFIGS));

const hasEmptyPrompts = computed(() => {
  if (!selectedAgent.value) return false;
  return selectedAgent.value.prompts.some((p) => !p.value || p.value.trim() === '');
});

const fetchModels = async () => {
  if (!chatContext?.fetchLLMModels) return;

  try {
    const res = await chatContext.fetchLLMModels();
    if (res.status !== 'success') return;

    allProviders.value = res.data?.data?.providers || res.data?.providers || [];
  } catch (error) {
    console.error('Error fetching models:', error);
  }
};

const getPromptValue = (agentId, promptName) => {
  const userPrompt = chatContext?.userPrompts?.value?.[agentId]?.[promptName];
  const defaultPrompt = chatContext?.defaultPrompts?.value?.[agentId]?.[promptName];

  if (userPrompt) {
    return typeof userPrompt === 'object' ? userPrompt.prompt : userPrompt;
  }

  return defaultPrompt || '';
};

const getModelName = (agentId, promptNames) => {
  for (const promptName of promptNames) {
    console.log(chatContext?.userPrompts);
    const userPrompt = chatContext?.userPrompts?.value?.[agentId]?.[promptName];
    if (userPrompt?.model_name) {
      return userPrompt.model_name;
    }
  }
  return null;
};

const loadAgentPrompts = (agentConfig) => {
  const promptNames = agentConfig.prompts.map((p) => p.promptName);

  agentConfig.prompts.forEach((promptConfig) => {
    promptConfig.value = getPromptValue(agentConfig.id, promptConfig.promptName);
  });

  selectedModelName.value = getModelName(agentConfig.id, promptNames);
};

const handleAgentSelect = (agent) => {
  const agentConfig = JSON.parse(JSON.stringify(agent));
  agentConfig.prompts = agentConfig.prompts.map((p) => ({ ...p, value: '' }));

  selectedAgent.value = agentConfig;
  hasModifications.value = false;

  loadAgentPrompts(selectedAgent.value);
};

const toggleModelDropdown = () => {
  showModelDropdown.value = !showModelDropdown.value;
};

const closeModelDropdown = () => {
  showModelDropdown.value = false;
};

const handleBack = () => {
  selectedAgent.value = null;
  hasModifications.value = false;
  selectedModelName.value = null;
};

const handleBackdropClick = () => {
  emit('close');
};

const markAsModified = () => {
  hasModifications.value = true;
};

const selectModel = (modelName) => {
  selectedModelName.value = modelName;
  showModelDropdown.value = false;
  markAsModified();
};

const resetPrompt = async (promptConfig) => {
  if (!chatContext?.deletePrompt || !selectedAgent.value) return;

  isResettingPrompt.value = true;
  try {
    await chatContext.deletePrompt(selectedAgent.value.id, promptConfig.promptName);
    loadAgentPrompts(selectedAgent.value);
    hasModifications.value = false;
  } catch (error) {
    console.error('Error resetting prompt:', error);
  } finally {
    isResettingPrompt.value = false;
  }
};

const handleSave = async () => {
  if (!chatContext?.createOrUpdatePrompt || !selectedAgent.value) return;

  isSaving.value = true;
  try {
    const savePromises = selectedAgent.value.prompts.map((promptConfig) =>
      chatContext.createOrUpdatePrompt(
        selectedAgent.value.id,
        promptConfig.promptName,
        promptConfig.value,
        selectedModelName.value || null
      )
    );

    await Promise.all(savePromises);
    hasModifications.value = false;
  } catch (error) {
    console.error('Error saving prompts:', error);
  } finally {
    isSaving.value = false;
  }
};

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (allProviders.value.length === 0) {
        fetchModels();
      }
    } else {
      selectedAgent.value = null;
      hasModifications.value = false;
      selectedModelName.value = null;
      showModelDropdown.value = false;
    }
  }
);

onMounted(() => {
  if (props.isOpen) {
    fetchModels();
  }
});
</script>

<style scoped>
.drawer-backdrop-enter-active,
.drawer-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-backdrop-enter-from,
.drawer-backdrop-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s ease;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
