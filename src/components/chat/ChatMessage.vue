<template>
  <div
    v-if="!isSystem"
    :class="[
      'vdb-c-flex vdb-c-h-auto vdb-c-w-full vdb-c-justify-start vdb-c-py-8 md:vdb-c-py-12',
      {
        'vdb-c-border-b vdb-c-border-kilvish-300 vdb-c-bg-white': isUser,
      },
    ]"
  >
    <div class="message-width">
      <div
        v-if="isUser"
        class="vdb-c-w-full vdb-c-transform vdb-c-transition-all"
      >
        <image-handler
          v-if="message.content.find((c) => c.type === 'image')"
          :content="message.content.find((c) => c.type === 'image')"
          :is-user="true"
          :conv-id="message.conv_id"
          :msg-id="message.msg_id"
        />
        <text-response
          :content="message.content.find((c) => c.type === 'text')"
          :is-user="true"
          :conv-id="message.conv_id"
          :msg-id="message.msg_id"
        />
      </div>

      <div v-else-if="isAssistant">
        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-8">
          <div class="vdb-c-py-14">
            <ChatMessageSteps
              :steps="message.actions"
              :status="finalStatus"
              :expanded="isLastConv && message.status !== 'success'"
            />
          </div>

          <div v-for="content in processedItems">
            <component
              v-if="
                content.__type !== 'show_more' &&
                content.__type !== 'show_less' &&
                Object.keys(messageHandlers).includes(content.type)
              "
              :is="messageHandlers[content.type]"
              :is-last-conv="isLastConv"
              :content="content"
              :is-user="isUser"
              :search-term="searchTerm"
              :conv-id="message.conv_id"
              :msg-id="message.msg_id"
            />
            <div
              v-else-if="content.__type === 'show_more'"
              class="show-more-divider vdb-c-mt-4 vdb-c-flex vdb-c-justify-center"
            >
              <button
                class="vdb-c-relative vdb-c-z-10 vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-4 vdb-c-rounded-full vdb-c-bg-[#F7F7F7] vdb-c-px-16 vdb-c-py-12 vdb-c-text-sm vdb-c-text-black vdb-c-outline vdb-c-outline-1 vdb-c-outline-[#EFEFEF] vdb-c-transition-opacity hover:vdb-c-opacity-90"
                @click="handleShowMore(content.runStartIndex, content.total)"
              >
                See more
                <ChevronDown class="vdb-c-h-16 vdb-c-w-16 vdb-c-text-black" />
              </button>
            </div>
            <div
              v-else-if="content.__type === 'show_less'"
              class="show-more-divider vdb-c-mt-4 vdb-c-flex vdb-c-justify-center"
            >
              <button
                class="vdb-c-relative vdb-c-z-10 vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-gap-4 vdb-c-rounded-full vdb-c-bg-[#F7F7F7] vdb-c-px-16 vdb-c-py-12 vdb-c-text-sm vdb-c-text-black vdb-c-outline vdb-c-outline-1 vdb-c-outline-[#EFEFEF] vdb-c-transition-opacity hover:vdb-c-opacity-90"
                @click="handleShowLess(content.runStartIndex)"
              >
                See less
                <ChevronDown
                  class="vdb-c-h-16 vdb-c-w-16 vdb-c-rotate-180 vdb-c-text-black"
                />
              </button>
            </div>
          </div>

          <div
            v-if="finalStatus === 'success'"
            class="vdb-c-mt-2 vdb-c-flex vdb-c-items-center vdb-c-gap-12"
          >
            <WithPopper
              popper-text="Not helpful"
              tooltip-css="vdb-c-bg-[#3F3F3F] vdb-c-text-white vdb-c-rounded-full vdb-c-px-12 vdb-c-py-8"
            >
              <template #button>
                <button
                  class="vdb-c-flex vdb-c-h-28 vdb-c-w-28 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full hover:vdb-c-bg-[#EFEFEF]"
                  @click="selectFeedback('down')"
                >
                  <component
                    :is="
                      selectedFeedback === 'down'
                        ? ThumbsDownClicked
                        : ThumbsDown
                    "
                    class="vdb-c-h-24 vdb-c-w-24 vdb-c-text-black"
                  />
                </button>
              </template>
            </WithPopper>

            <WithPopper
              popper-text="Helpful"
              tooltip-css="vdb-c-bg-[#3F3F3F] vdb-c-text-white vdb-c-rounded-full vdb-c-px-12 vdb-c-py-8"
            >
              <template #button>
                <button
                  class="vdb-c-flex vdb-c-h-28 vdb-c-w-28 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full hover:vdb-c-bg-[#EFEFEF]"
                  @click="selectFeedback('up')"
                >
                  <component
                    :is="selectedFeedback === 'up' ? ThumbsUpClicked : ThumbsUp"
                    class="vdb-c-h-24 vdb-c-w-24 vdb-c-text-black"
                  />
                </button>
              </template>
            </WithPopper>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import TextResponse from "../message-handlers/TextResponse.vue";
import ImageHandler from "../message-handlers/ImageHandler.vue";
import ChatMessageSteps from "./elements/ChatMessageSteps.vue";

import { useVideoDBChat } from "../../context.js";
import ChevronDown from "../icons/ChevronDown.vue";
import WithPopper from "../atoms/WithPopper.vue";
import ThumbsDown from "../icons/ThumbsDown.vue";
import ThumbsDownClicked from "../icons/ThumbsDownClicked.vue";
import ThumbsUp from "../icons/ThumbsUp.vue";
import ThumbsUpClicked from "../icons/ThumbsUpClicked.vue";

const props = defineProps({
  message: {
    type: Object,
    default: () => ({}),
  },
  isStaticPage: {
    type: Boolean,
    default: false,
  },
  isLastConv: {
    type: Boolean,
    default: false,
  },
  messageList: {
    type: Array,
    required: true,
  },
  currentIndex: {
    type: Number,
    required: true,
  },
  messageLoading: {
    type: Boolean,
    default: false,
  },
  searchTerm: {
    type: String,
    default: "",
  },
  isLastConv: {
    type: Boolean,
    default: false,
  },
});

const { messageHandlers } = useVideoDBChat();

const isUser = computed(() => props.message.msg_type === "input");
const isAssistant = computed(() => props.message.msg_type === "output");
const isSystem = computed(() => props.message.msg_type === "system");

// Preserve content types. Add show-more control for consecutive type=video runs.
const BATCH_SIZE = 2;
const visibleCounts = ref({}); // key: run start index -> visible count

const processedItems = computed(() => {
  const items = props.message?.content || [];
  const output = [];
  let i = 0;
  while (i < items.length) {
    const item = items[i];
    if (item?.type === "video") {
      // Determine run length of consecutive video items
      let j = i;
      while (j < items.length && items[j]?.type === "video") j += 1;
      const runStart = i;
      const runLen = j - i;
      const initialVisible = Math.min(BATCH_SIZE, runLen);
      // Auto-expand visibility up to the current initialVisible as the run grows
      const existingVisible = visibleCounts.value[runStart] ?? 0;
      const desiredVisible = Math.max(existingVisible, initialVisible);
      const currentVisible = Math.min(desiredVisible, runLen);
      if (
        visibleCounts.value[runStart] == null ||
        existingVisible < initialVisible
      ) {
        visibleCounts.value[runStart] = currentVisible;
      }
      // Push visible items
      for (let k = 0; k < visibleCounts.value[runStart]; k += 1) {
        output.push(items[runStart + k]);
      }
      // Add show more control if more remain
      if (visibleCounts.value[runStart] < runLen) {
        output.push({
          __type: "show_more",
          runStartIndex: runStart,
          total: runLen,
        });
      } else if (
        visibleCounts.value[runStart] >= runLen &&
        runLen > BATCH_SIZE
      ) {
        // All videos in this run are visible; allow collapsing back to BATCH_SIZE
        output.push({
          __type: "show_less",
          runStartIndex: runStart,
          total: runLen,
        });
      }
      i = j;
    } else {
      output.push(item);
      i += 1;
    }
  }
  return output;
});

const handleShowMore = (runStartIndex, total) => {
  const current = visibleCounts.value[runStartIndex] ?? 0;
  const next = Math.min(current + BATCH_SIZE, total);
  visibleCounts.value[runStartIndex] = next;
};

const handleShowLess = (runStartIndex) => {
  visibleCounts.value[runStartIndex] = BATCH_SIZE;
};

const finalStatus = computed(() => {
  return props.message.status;
});

// Feedback state for this message
const selectedFeedback = ref("");
const selectFeedback = (val) => {
  selectedFeedback.value = val;
};
</script>

<style>
.message-width {
  width: 100%;
  max-width: 100%;
}

@media (min-width: 768px) {
  .message-width {
    width: 98%;
    max-width: 98%;
  }
}

.show-more-divider {
  position: relative;
  width: 100%;
}

.show-more-divider::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e5e7eb;
  transform: translateY(-50%);
}
</style>
