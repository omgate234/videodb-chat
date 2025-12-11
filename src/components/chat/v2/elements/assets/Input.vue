<template>
  <div
    :class="[isFocused ? 'vdb-c-bg-orange-100' : 'vdb-c-bg-white']"
    class="vdb-c-flex vdb-c-flex-col vdb-c-items-start vdb-c-gap-10 vdb-c-rounded-12 vdb-c-p-2"
  >
    <div
      :class="[
        isFocused
          ? 'vdb-c-bg-white vdb-c-outline vdb-c-outline-1 vdb-c-outline-vdb-orange'
          : 'vdb-c-bg-white',
      ]"
      class="vdb-c-border-1 vdb-c-box-border vdb-c-flex vdb-c-items-center vdb-c-gap-4 vdb-c-self-stretch vdb-c-rounded-12 vdb-c-border vdb-c-border-[#E1E1E1] vdb-c-bg-roy vdb-c-px-10 vdb-c-py-[9px] vdb-c-transition-colors vdb-c-duration-200"
    >
      <SearchIcon :class="isFocused ? 'vdb-c-text-vdb-orange' : 'vdb-c-text-[#969696]'" />

      <input
        tabindex="0"
        @focus="isFocused = true"
        @blur="isFocused = false"
        placeholder="Search file"
        class="vdb-c-bg-transparent vdb-c-text-sm vdb-c-text-vdb-darkishgrey vdb-c-outline-none vdb-c-transition-colors vdb-c-duration-200"
      />
    </div>
  </div>
</template>

<script setup>
import SearchIcon from '../../icons/SearchIcon.vue';
import { ref } from 'vue';

const props = defineProps({
  placeholder: { type: String, default: '' },
  value: { type: String, default: '' },
});

const isFocused = ref(false);
</script>
