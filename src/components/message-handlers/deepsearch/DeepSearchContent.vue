<template>
  <div
    class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-8 vdb-c-py-14 vdb-c-text-left"
  >
    <LoadingMessage
      :status="content.status"
      :message="content.status_message"
      :is-last-conv="isLastConv"
    />
    <div
      class="vdb-c-flex vdb-c-flex-col vdb-c-gap-8"
      v-if="Array.isArray(content?.videos) && content.videos.length"
    >
      <DeepSearchVideo
        v-for="(item, idx) in visibleItems"
        :key="item?.video?.id || item?.id || idx"
        :content="item"
        :is-last-conv="isLastConv"
      />

      <div
        v-if="showMoreVisible"
        class="show-more-divider vdb-c-mt-4 vdb-c-flex vdb-c-justify-center"
      >
        <button
          class="vdb-c-relative vdb-c-z-10 vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-4 vdb-c-rounded-full vdb-c-bg-[#F7F7F7] vdb-c-px-16 vdb-c-py-12 vdb-c-text-sm vdb-c-text-black vdb-c-outline vdb-c-outline-1 vdb-c-outline-[#EFEFEF] vdb-c-transition-colors vdb-c-duration-100 hover:vdb-c-bg-[#EFEFEF]"
          @click="handleShowMore"
        >
          See more
          <ChevronDown class="vdb-c-h-16 vdb-c-w-16 vdb-c-text-black" />
        </button>
      </div>

      <div
        v-else-if="showLessVisible"
        class="show-more-divider vdb-c-mt-4 vdb-c-flex vdb-c-justify-center"
      >
        <button
          class="vdb-c-relative vdb-c-z-10 vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-4 vdb-c-rounded-full vdb-c-bg-[#F7F7F7] vdb-c-px-16 vdb-c-py-12 vdb-c-text-sm vdb-c-text-black vdb-c-outline vdb-c-outline-1 vdb-c-outline-[#EFEFEF] vdb-c-transition-colors vdb-c-duration-100 hover:vdb-c-bg-[#EFEFEF]"
          @click="handleShowLess"
        >
          See less
          <ChevronDown
            class="vdb-c-h-16 vdb-c-w-16 vdb-c-rotate-180 vdb-c-text-black"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import DeepSearchVideo from "./DeepSearchVideo.vue";
import ChevronDown from "../../icons/ChevronDown.vue";
import LoadingMessage from "../elements/LoadingMessage.vue";

const props = defineProps({
  content: { type: Object, required: true },
  isLastConv: { type: Boolean, default: false },
});

const BATCH_SIZE = 2;
const visibleCount = ref(0);

const total = computed(() =>
  Array.isArray(props.content?.videos) ? props.content.videos.length : 0,
);

watch(
  () => total.value,
  (len, prev) => {
    const initialVisible = Math.min(BATCH_SIZE, len);
    const existing = visibleCount.value ?? 0;
    const desired = Math.max(existing, initialVisible);
    visibleCount.value = Math.min(desired, len);
  },
  { immediate: true },
);

const normalizedItems = computed(() => {
  const list = Array.isArray(props.content?.videos) ? props.content.videos : [];
  const parentStatus = props.content?.status ?? "success";
  const parentStatusMessage = props.content?.status_message ?? "";
  const parentAgent = props.content?.agent_name ?? "deepsearch";
  return list.map((entry) => {
    // If already in expected shape: has status and video
    if (
      entry &&
      typeof entry === "object" &&
      ("video" in entry || "status" in entry)
    ) {
      const videoObj = entry.video ?? entry;
      return {
        type: "video",
        agent_name: entry.agent_name ?? parentAgent,
        status: entry.status ?? parentStatus,
        status_message: entry.status_message ?? parentStatusMessage,
        video: videoObj,
      };
    }
    // Fallback: bare video object
    return {
      type: "video",
      agent_name: parentAgent,
      status: parentStatus,
      status_message: parentStatusMessage,
      video: entry,
    };
  });
});

const visibleItems = computed(() =>
  normalizedItems.value.slice(0, visibleCount.value),
);

const showMoreVisible = computed(() => visibleCount.value < total.value);
const showLessVisible = computed(
  () => !showMoreVisible.value && total.value > BATCH_SIZE,
);

const handleShowMore = () => {
  const next = Math.min(visibleCount.value + BATCH_SIZE, total.value);
  visibleCount.value = next;
};

const handleShowLess = () => {
  visibleCount.value = Math.min(BATCH_SIZE, total.value);
};
</script>

<style scoped>
.show-more-divider {
  position: relative;
}
.show-more-divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb; /* divider line color */
  transform: translateY(-50%);
}
</style>
