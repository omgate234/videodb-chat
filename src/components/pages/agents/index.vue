<template>
  <div class="vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col vdb-c-bg-white">
    <!-- Header -->
    <header
      class="vdb-c-sticky vdb-c-top-0 vdb-c-flex vdb-c-h-[62px] vdb-c-w-full vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-end vdb-c-border-b vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-10"
    >
      <div
        class="vdb-c-min-w-0 vdb-c-flex vdb-c-min-h-0 vdb-c-grow vdb-c-basis-0 vdb-c-items-center vdb-c-gap-6 vdb-c-pl-10"
      >
        <div class="vdb-c-relative vdb-c-h-24 vdb-c-w-24 vdb-c-flex-shrink-0">
          <AgentsIcon :strokeColor="'#1E1E1E'" class="vdb-c-h-full vdb-c-w-full" />
        </div>
        <h1
          class="vdb-c-text-[16px] vdb-c-font-semibold vdb-c-leading-[24px] vdb-c-text-vdb-darkishgrey"
        >
          Agents
        </h1>
      </div>
    </header>

    <!-- Main Content -->
    <div
      class="vdb-c-flex vdb-c-w-full vdb-c-flex-1 vdb-c-flex-col vdb-c-items-center vdb-c-overflow-y-auto vdb-c-px-[200px] vdb-c-py-40"
    >
      <!-- Page Header -->
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-flex-shrink-0 vdb-c-flex-col vdb-c-items-center vdb-c-gap-16"
      >
        <div class="vdb-c-w-full vdb-c-flex-shrink-0">
          <h2
            class="vdb-c-w-full vdb-c-text-center vdb-c-text-[32px] vdb-c-font-semibold vdb-c-leading-normal vdb-c-text-[#0D0D0D]"
          >
            Agents Library
          </h2>
        </div>
        <div class="vdb-c-w-full vdb-c-max-w-[650px] vdb-c-flex-shrink-0 vdb-c-pb-[0.75px]">
          <p
            class="vdb-c-w-full vdb-c-text-center vdb-c-text-[14px] vdb-c-font-normal vdb-c-leading-[1.5] vdb-c-text-[#464646]"
          >
            Explore a suite of VideoDB Agents built for every part of your video workflow
          </p>
        </div>
      </div>

      <!-- Configurable Agents Section -->
      <div class="vdb-c-mt-40 vdb-c-flex vdb-c-w-[780px] vdb-c-flex-col">
        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-8">
          <h3
            class="vdb-c-text-[22px] vdb-c-font-semibold vdb-c-leading-[27px] vdb-c-text-[#0D0D0D]"
          >
            Configurable Agents
          </h3>
          <p class="vdb-c-text-[14px] vdb-c-font-normal vdb-c-leading-[17px] vdb-c-text-[#464646]">
            Customize prompts, models, and behavior to match your workflow.
          </p>
        </div>
        <div
          class="vdb-c-mt-30 vdb-c-grid vdb-c-w-[736px] vdb-c-grid-cols-2 vdb-c-gap-16 vdb-c-pl-22"
        >
          <AgentCard
            v-for="agent in configurableAgents"
            :key="agent.name"
            :name="agent.name"
            :icon="agent.icon"
            :description="agent.description"
            :clickable="true"
            @click="handleConfigurableAgentClick(agent)"
          />
        </div>
      </div>

      <!-- System Agents Section -->
      <div class="vdb-c-mt-40 vdb-c-flex vdb-c-w-[780px] vdb-c-flex-col">
        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-8">
          <h3
            class="vdb-c-text-[22px] vdb-c-font-semibold vdb-c-leading-[27px] vdb-c-text-[#0D0D0D]"
          >
            System Agents
          </h3>
          <p class="vdb-c-text-[14px] vdb-c-font-normal vdb-c-leading-[17px] vdb-c-text-[#464646]">
            Pre-configured agents managed and optimized by the system.
          </p>
        </div>
        <div
          class="vdb-c-mt-30 vdb-c-grid vdb-c-w-[736px] vdb-c-grid-cols-2 vdb-c-gap-16 vdb-c-pl-22"
        >
          <AgentCard
            v-for="agent in systemAgents"
            :key="agent.name"
            :name="agent.name"
            :icon="agent.icon"
            :description="agent.description"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import AgentsIcon from '../../chat/v2/icons/AgentsIcon.vue';
import EditIcon from '../../chat/v2/icons/agents/EditIcon.vue';
import ClipIcon from '../../chat/v2/icons/agents/ClipIcon.vue';
import CensorIcon from '../../chat/v2/icons/agents/CensorIcon.vue';
import SearchIcon from '../../chat/v2/icons/agents/SearchIcon.vue';
import DubbingIcon from '../../chat/v2/icons/agents/DubbingIcon.vue';
import SubtitleIcon from '../../chat/v2/icons/agents/SubtitleIcon.vue';
import GenerateIcon from '../../chat/v2/icons/agents/GenerateIcon.vue';
import VoiceIcon from '../../chat/v2/icons/agents/VoiceIcon.vue';
import AgentCard from './AgentCard.vue';

const props = defineProps({
  context: {
    type: Object,
    default: undefined,
  },
});

const context = props.context || inject('videodb-chat-context');

// Configurable Agents - order matches Figma: Orchestration, Edit, Clip, Censor
// Orchestration agent (Reasoning) and Edit share the same icon
// drawerAgentId maps to CustomizeAgentsDrawer AGENT_CONFIGS keys
const configurableAgents = [
  {
    name: 'Orchestration agent',
    icon: EditIcon,
    description:
      'Intelligently coordinates video workflow agents for search, editing, summarization and automation.',
    drawerAgentId: 'reasoning',
  },
  {
    name: 'Edit',
    icon: EditIcon,
    description:
      'Cut, trim, merge, and reformat videos with timeline-based editing and aspect ratio control.',
    drawerAgentId: 'editing',
  },
  {
    name: 'Clip',
    icon: ClipIcon,
    description:
      'Extract and assemble moments into clips using prompts or timestamps, optimized for any platform.',
    drawerAgentId: 'prompt_clip',
  },
  {
    name: 'Censor',
    icon: CensorIcon,
    description:
      'Automatically detect and mask sensitive audio or visuals using context-aware analysis.',
    drawerAgentId: 'censor',
  },
];

const handleConfigurableAgentClick = (agent) => {
  context?.handleOpenCustomizeAgentsDrawer?.(agent.drawerAgentId);
};

// System Agents - order matches Figma: Search, Dubbing, Subtitle, Generate, Voice
const systemAgents = [
  {
    name: 'Search',
    icon: SearchIcon,
    description:
      'Find precise moments, scenes, or videos using natural language across dialogue, visuals, and actions',
  },
  {
    name: 'Dubbing',
    icon: DubbingIcon,
    description:
      'Translate and replace video audio with synced voiceovers for global localization.',
  },
  {
    name: 'Subtitle',
    icon: SubtitleIcon,
    description: 'Add same-language or translated subtitles for accessibility and global reach.',
  },
  {
    name: 'Generate',
    icon: GenerateIcon,
    description:
      'Create new AI-generated videos, images, music, or sound effects as standalone assets.',
  },
  {
    name: 'Voice',
    icon: VoiceIcon,
    description:
      'Clone, synthesize, or replace voices across videos with explicit user authorization.',
  },
];
</script>
