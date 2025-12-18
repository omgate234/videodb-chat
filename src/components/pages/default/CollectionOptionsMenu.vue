<template>
  <div
    v-if="isOpen"
    :class="[
      showOnRight ? 'vdb-c-right-0' : 'vdb-c-left-0',
      showOnBottom ? 'vdb-c-bottom-[calc(100%)]' : 'vdb-c-top-[calc(100%)]',
    ]"
    class="vdb-c-absolute vdb-c-z-50 vdb-c-flex vdb-c-min-w-[200px] vdb-c-flex-col vdb-c-gap-[4px] vdb-c-rounded-12 vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-shadow-[0px_23px_6px_0px_rgba(0,0,0,0),0px_15px_6px_0px_rgba(0,0,0,0.01),0px_8px_5px_0px_rgba(0,0,0,0.02),0px_4px_4px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.03)]"
    @click.stop
  >
    <button
      @click="handleChatWithCollection"
      class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[6px] vdb-c-rounded-[10px] vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#F5F5F5]"
    >
      <div
        class="vdb-c-flex vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center"
      >
        <ChatWithCollectionIcon />
      </div>
      <span
        class="vdb-c-flex-1 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1e1e1e]"
      >
        Chat with collection
      </span>
    </button>
    <button
      @click="handleRename"
      class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[6px] vdb-c-rounded-[10px] vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#F5F5F5]"
    >
      <div
        class="vdb-c-flex vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center"
      >
        <EditIcon stroke-color="#1E1E1E" />
      </div>
      <span
        class="vdb-c-flex-1 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1e1e1e]"
      >
        Rename collection
      </span>
    </button>
    <button
      @click="handleDelete"
      class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[6px] vdb-c-rounded-[10px] vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#F5F5F5]"
    >
      <div
        class="vdb-c-flex vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center"
      >
        <TrashIcon stroke-color="#E2462C" />
      </div>
      <span
        class="vdb-c-flex-1 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#E2462C]"
      >
        Delete
      </span>
    </button>
  </div>
</template>

<script setup>
import EditIcon from '../../chat/v2/icons/EditIcon.vue';
import TrashIcon from '../../chat/v2/icons/TrashIcon.vue';
import ChatWithCollectionIcon from '../../chat/v2/icons/ChatWithCollectionIcon.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  collection: {
    type: Object,
    default: null,
  },
  showOnRight: {
    type: Boolean,
    default: false,
  },
  showOnBottom: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'rename', 'delete', 'chat']);

const handleChatWithCollection = () => {
  emit('chat', props.collection);
  emit('close');
};

const handleRename = () => {
  emit('rename', props.collection);
  emit('close');
};

const handleDelete = () => {
  emit('delete', props.collection);
  emit('close');
};
</script>
