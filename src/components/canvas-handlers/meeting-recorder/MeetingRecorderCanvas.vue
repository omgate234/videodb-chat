<template>
  <!-- Meeting Analysis Modal -->
  <MeetingAnalysisModal
    :is-open="isMeetingAnalysisOpen"
    :content="content"
    :is-floating="isFloating"
    @close="handleClose"
    @toggle-floating="makeFloating"
  />

  <!-- Live Analysis Modal -->
  <LiveAnalysisModal
    v-if="isLiveAnalysisOpen"
    :content="content"
    @close="closeLiveAnalysis"
  />

  <!-- Bottom buttons (visible initially) -->
  <TransitionGroup
    name="mr-btn-fade"
    tag="div"
    class="meeting-recorder-canvas-buttons vdb-c-absolute vdb-c-bottom-0 vdb-c-left-0 vdb-c-z-[100] vdb-c-flex vdb-c-h-fit vdb-c-w-full vdb-c-items-center vdb-c-justify-center vdb-c-gap-20 vdb-c-pb-6 vdb-c-pt-20"
  >
    <Button
      key="live-btn"
      :icon="Live"
      label="See Live Analysis"
      :isActive="isLiveAnalysisOpen"
      @click="openLiveAnalysis"
    />
    <Button
      v-if="showMeetingAnalysisButton"
      key="meeting-btn"
      :icon="Robot"
      label="Meeting Analysis"
      :isActive="isMeetingAnalysisOpen"
      @click="openMeetingAnalysis"
    />
  </TransitionGroup>
</template>

<script setup>
import { useVideoDBChat } from "../../../context";
import { ref, watch, computed } from "vue";
import Button from "./Button.vue";
import Robot from "./Robot.vue";
import Live from "./Live.vue";
import LiveAnalysisModal from "./LiveAnalysisModal.vue";
import MeetingAnalysisModal from "./MeetingAnalysisModal.vue";
const { setShrinkChat, canvasState } = useVideoDBChat();

const isFloating = ref(true); // default open mode is floating
const isMeetingAnalysisOpen = ref(false);
const isLiveAnalysisOpen = ref(false);
const showMeetingAnalysisButton = ref(true);

const props = defineProps({
  onClose: { type: Function, default: null },
  isOpen: { type: Boolean, default: false },
});

// Use content from canvas state instead of props
const content = computed(() => canvasState.content || {});

// Watch for content changes to update canvas state
watch(
  () => content.value,
  (newContent) => {
    console.log("MeetingRecorderCanvas content updated:", newContent);

    // If content has live_analysis, we might want to show live analysis button
    if (newContent?.live_analysis && newContent.live_analysis.length > 0) {
      // Live analysis is available
      console.log("Live analysis data available:", newContent.live_analysis);
    }

    // If content has meeting_assistant data, we can show meeting analysis
    if (newContent?.meeting_assistant) {
      console.log(
        "Meeting assistant data available:",
        newContent.meeting_assistant,
      );
    }
  },
  { deep: true, immediate: true },
);

function openMeetingAnalysis() {
  isMeetingAnalysisOpen.value = true;
  isFloating.value = true; // start in floating mode
  setShrinkChat(false);
}

function openLiveAnalysis() {
  isLiveAnalysisOpen.value = true;
}

function closeLiveAnalysis() {
  isLiveAnalysisOpen.value = false;
}

function handleClose() {
  isMeetingAnalysisOpen.value = false;
  showMeetingAnalysisButton.value = true;
  isFloating.value = true;
  setShrinkChat(false);
}

function makeFloating() {
  isFloating.value = !isFloating.value;
  if (!isFloating.value) {
    // Pinned: shrink chat and hide the button
    setShrinkChat(true);
    showMeetingAnalysisButton.value = false;
  } else {
    // Floating: restore chat width
    showMeetingAnalysisButton.value = true;
    setShrinkChat(false);
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.meeting-recorder-canvas-buttons {
  background: linear-gradient(
    175deg,
    rgba(255, 255, 255, 0.5) -11.38%,
    #fff 90%
  );
}

/* Fade/slide for bottom buttons */
.mr-btn-fade-enter-active,
.mr-btn-fade-leave-active {
  transition: all 200ms ease;
}
.mr-btn-fade-enter-from,
.mr-btn-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
.mr-btn-fade-move {
  transition: transform 200ms ease;
}
</style>
