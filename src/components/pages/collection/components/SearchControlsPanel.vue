<template>
  <div
    @click.stop
    class="vdb-c-absolute vdb-c-bottom-[calc(100%+10px)] vdb-c-left-1/2 vdb-c-z-50 vdb-c-flex vdb-c-w-[250px] vdb-c-translate-x-[-50%] vdb-c-cursor-default vdb-c-flex-col vdb-c-gap-[8px] vdb-c-rounded-[12px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-p-8 vdb-c-shadow-[0px_0px_4px_0px_rgba(0,0,0,0.04),0px_0px_1px_0px_rgba(0,0,0,0.6)]"
  >
    <div class="w-full vdb-c-flex vdb-c-flex-col vdb-c-items-start vdb-c-gap-[4px]">
      <TitleWithTooltip
        title="Precision"
        tooltip-text="Exact prioritizes accuracy; Wide prioritizes finding more results."
      />
      <div class="w-full vdb-c-ml-10 vdb-c-flex vdb-c-flex-col vdb-c-gap-[2px]">
        <RadioInput
          name="precision"
          value="exact"
          label="Exact"
          :model-value="precision"
          @update:model-value="$emit('update:precision', $event)"
        />
        <RadioInput
          name="precision"
          value="wide"
          label="Wide"
          :model-value="precision"
          @update:model-value="$emit('update:precision', $event)"
        />
      </div>
    </div>

    <div class="w-full vdb-c-flex vdb-c-flex-col vdb-c-items-start vdb-c-gap-[4px]">
      <TitleWithTooltip
        title="Search for"
        tooltip-text="Scenes returns specific moments; Videos returns full matching videos."
      />
      <div class="w-full vdb-c-ml-10 vdb-c-flex vdb-c-flex-col vdb-c-gap-[2px]">
        <RadioInput
          v-if="!hideVideosOption"
          name="searchFor"
          value="videos"
          label="Videos"
          :model-value="searchFor"
          @update:model-value="$emit('update:searchFor', $event)"
        />
        <RadioInput
          name="searchFor"
          value="scenes"
          label="Scenes"
          :model-value="searchFor"
          @update:model-value="$emit('update:searchFor', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import TitleWithTooltip from './TitleWithTooltip.vue';
import RadioInput from '../../../chat/v2/elements/RadioInput.vue';

defineProps({
  precision: {
    type: String,
    required: true,
    validator: (value) => ['exact', 'wide'].includes(value),
  },
  searchFor: {
    type: String,
    required: true,
    validator: (value) => ['videos', 'scenes'].includes(value),
  },
  hideVideosOption: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['update:precision', 'update:searchFor']);
</script>
