<template>
  <div
    class="vdb-c-relative vdb-c-box-border vdb-c-flex vdb-c-w-full vdb-c-justify-between vdb-c-pl-2 vdb-c-text-sm"
  >
    <div
      ref="inputContainer"
      :class="[
        'vdb-c-box-border vdb-c-flex vdb-c-w-[354px] vdb-c-max-w-[400px] vdb-c-items-center vdb-c-rounded-[10px] vdb-c-border vdb-c-bg-gray-50 vdb-c-py-[8px] vdb-c-pl-10 vdb-c-pr-8 vdb-c-text-sm vdb-c-text-black',
        isFocused
          ? 'vdb-c-border-[#EC5B16] vdb-c-shadow-[0_0_0_2px_rgba(236,91,22,0.25)]'
          : 'vdb-c-border-gray-300',
      ]"
    >
      <SearchIcon class="vdb-c-text-gray-700" />
      <input
        v-model="searchQuery"
        @input="handleInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
        class="vdb-c-block vdb-c-h-full vdb-c-w-[100%] vdb-c-bg-gray-50 vdb-c-px-8 vdb-c-text-sm vdb-c-text-black vdb-c-placeholder-gray-700 vdb-c-outline-none"
        type="text"
        placeholder="Search"
      />
      <button
        class="vdb-c-flex vdb-c-size-[20px] vdb-c-items-center vdb-c-justify-center vdb-c-opacity-20 hover:vdb-c-opacity-100"
        v-if="searchQuery"
        @click="clearSearch"
      >
        <div class="vdb-c-flex vdb-c-size-[20px] vdb-c-items-center vdb-c-justify-center">
          <SearchCrossIcon class="vdb-c-size-20" />
        </div>
      </button>
    </div>
    <ul
      ref="autocompleteContainer"
      v-if="showAutocomplete"
      class="autocomplete-drop-shadow vdb-c-absolute vdb-c-top-full vdb-c-z-10 vdb-c-mt-8 vdb-c-max-h-[60vh] vdb-c-w-[90%] vdb-c-max-w-[400px] vdb-c-cursor-pointer vdb-c-overflow-hidden vdb-c-overflow-y-scroll vdb-c-rounded-12 vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-p-8 vdb-c-text-sm md:vdb-c-w-[60%]"
    >
      <li
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-10 vdb-c-overflow-x-hidden vdb-c-rounded-8 vdb-c-bg-white vdb-c-px-10 vdb-c-py-8 vdb-c-text-sm vdb-c-text-black hover:vdb-c-bg-roy"
        v-for="item in filteredAssets.slice(0, 5)"
        :key="item.id"
        @click="selectItem(item)"
      >
        <SearchIcon class="vdb-c-size-[15px] vdb-c-text-black" />
        <div class="vdb-c-w-4/5 md:vdb-c-w-11/12">
          <span v-for="(part, idx) in getHighlightedParts(item.name)" :key="idx">
            <span class="vdb-c-font-semibold" v-if="part.bold">{{ part.text }}</span>
            <span v-else>{{ part.text }}</span>
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import SearchIcon from '../../chat/v2/icons/SearchIcon.vue';
import SearchCrossIcon from '../../icons/SearchCross.vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['select-item', 'update:query']);

const isFocused = ref(false);
const searchQuery = ref('');
const showAutocomplete = ref(false);
const inputContainer = ref(null);
const autocompleteContainer = ref(null);

const filteredAssets = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return [];
  return props.items.filter((asset) => asset.name?.toLowerCase().includes(query));
});

const handleInput = () => {
  showAutocomplete.value = searchQuery.value.trim() !== '';
  emit('update:query', searchQuery.value);
};

const clearSearch = () => {
  searchQuery.value = '';
  showAutocomplete.value = false;
  emit('update:query', '');
};

const selectItem = (item) => {
  searchQuery.value = item.name;
  showAutocomplete.value = false;
  emit('select-item', item);
  emit('update:query', item.name);
};

const getHighlightedParts = (text) => {
  const query = searchQuery.value.trim();
  if (!query) return [{ text, bold: false }];

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  let parts = [];

  let matchIndex = lowerText.indexOf(lowerQuery);
  if (matchIndex === -1) {
    return [{ text, bold: false }];
  }

  if (matchIndex > 0) {
    parts.push({ text: text.slice(0, matchIndex), bold: true });
  }

  parts.push({
    text: text.slice(matchIndex, matchIndex + query.length),
    bold: false,
  });

  if (matchIndex + query.length < text.length) {
    parts.push({ text: text.slice(matchIndex + query.length), bold: true });
  }

  return parts;
};

const handleClickOutside = (event) => {
  if (autocompleteContainer.value && !autocompleteContainer.value.contains(event.target)) {
    showAutocomplete.value = false;
  }

  if (inputContainer.value && !inputContainer.value.contains(event.target)) {
    showAutocomplete.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.autocomplete-drop-shadow {
  box-shadow:
    5px 5px 11px 0px rgba(0, 0, 0, 0.06),
    10px 21px 21px 0px rgba(0, 0, 0, 0.05),
    20px 47px 28px 0px rgba(0, 0, 0, 0.03),
    30px 83px 33px 0px rgba(0, 0, 0, 0.01),
    40px 130px 36px 0px rgba(0, 0, 0, 0);
}
</style>
