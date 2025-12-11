<template>
  <AssetsPage v-if="navState.currentPage === 'assets'" :context="context" />
  <AgentsPage v-else-if="navState.currentPage === 'agents'" :context="context" />
  <CollectionPage
    v-else-if="navState.currentPage === 'collection' && navState.activeParams?.id"
    :context="context"
  />
  <ChatPage v-else-if="navState.currentPage === 'chat'" :context="context" />
  <DefaultPage v-else :context="context" />
</template>

<script setup>
import { inject, computed } from 'vue';
import DefaultPage from '../pages/default/index.vue';
import ChatPage from '../pages/chat/index.vue';
import CollectionPage from '../pages/collection/index.vue';
import AssetsPage from '../pages/assets/index.vue';
import AgentsPage from '../pages/agents/index.vue';

const context = inject('videodb-chat-context');
const navState = computed(() => {
  if (!context?.navState) {
    return { currentPage: 'default', activeParams: null };
  }
  return context.navState;
});
</script>
