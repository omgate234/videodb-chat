<template>
  <div class="vdb-c-relative">
    <button
      @click="$emit('toggle')"
      :class="[
        'vdb-c-flex vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-8 vdb-c-border vdb-c-px-12 vdb-c-py-8 vdb-c-text-body vdb-c-font-medium vdb-c-text-kilvish-900 hover:vdb-c-bg-roy',
        isOpen
          ? 'vdb-c-border-[#B9B9B9] vdb-c-bg-[#EFEFEF]'
          : 'vdb-c-border-[#EFEFEF] vdb-c-bg-white',
      ]"
    >
      <FolderIcon class="vdb-c-h-16 vdb-c-w-16 vdb-c-text-kilvish-500" />
      <span>{{ selectedName }}</span>
      <ChevronDownIcon
        :class="[
          'vdb-c-h-20 vdb-c-w-20 vdb-c-text-vdb-darkishgrey vdb-c-transition-transform vdb-c-duration-200',
          isOpen ? 'vdb-c-rotate-180' : '',
        ]"
      />
    </button>

    <div
      v-if="isOpen"
      class="vdb-c-absolute vdb-c-right-0 vdb-c-top-full vdb-c-z-20 vdb-c-mt-8 vdb-c-max-h-[232px] vdb-c-w-[238px] vdb-c-overflow-y-auto vdb-c-rounded-12 vdb-c-bg-white vdb-c-p-8 vdb-c-shadow-lg vdb-c-ring-1 vdb-c-ring-black-4"
    >
      <ul class="vdb-c-flex vdb-c-flex-col">
        <!-- Default Option -->
        <li
          @click="select(null)"
          class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-[10px] vdb-c-px-[10px] vdb-c-py-8 vdb-c-transition-colors vdb-c-duration-200"
          :class="modelValue === null ? 'vdb-c-bg-[#FFE9D3]' : 'hover:vdb-c-bg-[#EFEFEF]'"
        >
          <FolderIcon
            :stroke-color="modelValue === null ? '#821F0C' : '#1E1E1E'"
            :class="[
              'vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0',
              modelValue === null ? 'vdb-c-text-[#821F0C]' : '',
            ]"
          />
          <span
            class="vdb-c-flex-1 vdb-c-truncate vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px]"
            :class="modelValue === null ? 'vdb-c-text-[#821F0C]' : 'vdb-c-text-vdb-darkishgrey'"
          >
            All Collections
          </span>
          <CheckIcon
            v-if="modelValue === null"
            class="vdb-c-ml-auto vdb-c-h-16 vdb-c-w-16 vdb-c-text-[#821F0C]"
          />
        </li>

        <!-- List -->
        <li
          v-for="col in collections"
          :key="col.id"
          @click="select(col)"
          class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-[10px] vdb-c-px-[10px] vdb-c-py-8 vdb-c-transition-colors vdb-c-duration-200"
          :class="modelValue?.id === col.id ? 'vdb-c-bg-[#FFE9D3]' : 'hover:vdb-c-bg-[#EFEFEF]'"
        >
          <FolderIcon
            :stroke-color="modelValue?.id === col.id ? '#821F0C' : '#1E1E1E'"
            class="vdb-c-h-20 vdb-c-w-20 vdb-c-flex-shrink-0"
          />
          <span
            class="vdb-c-flex-1 vdb-c-truncate vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px]"
            :class="
              modelValue?.id === col.id ? 'vdb-c-text-[#821F0C]' : 'vdb-c-text-vdb-darkishgrey'
            "
          >
            {{ col.name }}
          </span>
          <CheckIcon
            v-if="modelValue?.id === col.id"
            class="vdb-c-ml-auto vdb-c-h-16 vdb-c-w-16 vdb-c-text-[#821F0C]"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import FolderIcon from '../../chat/v2/icons/FolderIcon.vue';
import ChevronDownIcon from '../../chat/v2/icons/ChevronDownIcon.vue';
import CheckIcon from '../../chat/v2/icons/CheckIcon.vue';

const props = defineProps({
  isOpen: Boolean,
  collections: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['toggle', 'update:modelValue']);

const selectedName = computed(() => (props.modelValue ? props.modelValue.name : 'All Collections'));

const select = (col) => {
  emit('update:modelValue', col);
  emit('toggle');
};
</script>
