<template>
  <div
    class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-justify-center vdb-c-gap-[20px] vdb-c-rounded-[17px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-[20px] md:vdb-c-flex-row"
  >
    <!-- Precision Section -->
    <div class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-[8px]">
      <div
        class="vdb-c-flex vdb-c-items-center vdb-c-gap-[4px]"
        @mouseenter="hoveredIcon = 'precision'"
        @mouseleave="hoveredIcon = null"
      >
        <span
          class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-vdb-darkishgrey"
        >
          Precision
        </span>

        <div
          class="group vdb-c-group vdb-c-relative vdb-c-hidden vdb-c-h-16 vdb-c-w-16 md:vdb-c-block"
        >
          <Tooltip
            class="vdb-c-absolute vdb-c-bottom-full vdb-c-left-1/2 vdb-c-hidden vdb-c-translate-x-[-50%] group-hover:vdb-c-block"
            text="Exact prioritizes accuracy; Wide prioritizes finding more results."
          />
          <InfoIcon
            :fill="precisionIconColor"
            class="vdb-c-h-16 vdb-c-w-16 vdb-c-transition-colors vdb-c-duration-100"
          />
        </div>
      </div>
      <SegmentedPicker
        :model-value="precision"
        :options="precisionOptions"
        @update:model-value="updatePrecision"
      />
    </div>

    <!-- Search For Section -->
    <div class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-gap-[8px]">
      <div
        class="vdb-c-flex vdb-c-items-center vdb-c-gap-[4px]"
        @mouseenter="hoveredIcon = 'searchFor'"
        @mouseleave="hoveredIcon = null"
      >
        <span
          class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-vdb-darkishgrey"
        >
          Search for
        </span>

        <div
          class="group vdb-c-group vdb-c-relative vdb-c-hidden vdb-c-h-16 vdb-c-w-16 md:vdb-c-block"
        >
          <Tooltip
            class="vdb-c-absolute vdb-c-bottom-full vdb-c-left-1/2 vdb-c-hidden vdb-c-w-[80vw] vdb-c-translate-x-[-50%] group-hover:vdb-c-block"
            text="Scenes returns specific moments; Videos returns full matching videos."
          />
          <InfoIcon
            :fill="searchForIconColor"
            class="vdb-c-h-16 vdb-c-w-16 vdb-c-transition-colors vdb-c-duration-100"
          />
        </div>
      </div>
      <SegmentedPicker
        :model-value="searchFor || 'videos'"
        :options="searchForOptions"
        @update:model-value="updateSearchFor"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import SegmentedPicker from './SegmentedPicker.vue';
import InfoIcon from '../../../chat/v2/icons/InfoIcon.vue';
import Tooltip from '../../../chat/v2/elements/Tooltip.vue';

const props = defineProps({
  precision: {
    type: String,
    required: true,
    validator: (value) => ['exact', 'wide'].includes(value),
  },
  searchFor: {
    type: String,
    required: true,
    validator: (value) => ['videos', 'scenes', null].includes(value),
  },
});

const emit = defineEmits(['update:precision', 'update:searchFor']);

const hoveredIcon = ref(null);

const precisionIconColor = computed(() => {
  if (hoveredIcon.value === 'precision') {
    return '#1E1E1E';
  } else if (hoveredIcon.value === 'searchFor') {
    return '#969696';
  }
  return '#1E1E1E';
});

const searchForIconColor = computed(() => {
  if (hoveredIcon.value === 'searchFor') {
    return '#1E1E1E';
  } else if (hoveredIcon.value === 'precision') {
    return '#969696';
  }
  return '#1E1E1E';
});

const precisionOptions = [
  { value: 'exact', label: 'Exact' },
  { value: 'wide', label: 'Wide' },
];

const searchForOptions = [
  { value: 'videos', label: 'Videos' },
  { value: 'scenes', label: 'Scenes' },
];

const updatePrecision = (value) => {
  emit('update:precision', value);
};

const updateSearchFor = (value) => {
  emit('update:searchFor', value);
};
</script>
