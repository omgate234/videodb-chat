<template>
  <div class="relative">
    <div
      ref="containerRef"
      class="vdb-c-relative vdb-c-h-[170px] vdb-c-w-[560px] vdb-c-select-none vdb-c-overflow-hidden vdb-c-bg-black"
      :style="{ borderRadius: '20px' }"
    >
      <!-- Dynamic thumbnail rendering -->
      <img
        v-for="(thumbnail, index) in relevantThumbnails"
        :key="`${thumbnail.timestamp}-${index}`"
        :src="thumbnail.thumbnail_url"
        :alt="`Frame at ${thumbnail.timestamp}s`"
        class="vdb-c-absolute vdb-c-h-full vdb-c-object-cover"
        :style="{
          left: `${index * thumbnailWidth}px`,
          width: `${thumbnailWidth}px`,
          zIndex: 0,
        }"
      />

      <!-- Non-selected area (left side) -->
      <div
        id="left-side"
        class="vdb-c-absolute vdb-c-top-0 vdb-c-h-full"
        :style="{
          left: '0',
          width: `${startLeft}px`,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: -100,
        }"
      ></div>

      <!-- Non-selected area (right side) -->
      <div
        id="right-side"
        class="vdb-c-absolute vdb-c-top-0 vdb-c-h-full"
        :style="{
          left: `${endLeft}px`,
          right: '0',
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 0,
        }"
      ></div>

      <!-- Start handle -->
      <div
        class="vdb-c-absolute vdb-c-top-0 vdb-c-flex vdb-c-h-full vdb-c-w-24 vdb-c-cursor-ew-resize vdb-c-items-center vdb-c-justify-center vdb-c-transition-colors"
        id="start-handle"
        :style="{
          left: `${startLeft}px`,
          width: '24px',
          borderRadius: '20px 0 0 20px',
          backgroundColor: '#EC5B16',
          zIndex: 0,
        }"
        @mousedown="(e) => handleMouseDown(e, true)"
      >
        <ThreeDots />
      </div>

      <!-- End handle -->
      <div
        class="vdb-c-absolute vdb-c-top-0 vdb-c-flex vdb-c-h-full vdb-c-w-24 vdb-c-cursor-ew-resize vdb-c-items-center vdb-c-justify-center vdb-c-transition-colors"
        id="end-handle"
        :style="{
          left: `${endLeft}px`,
          width: '24px',
          borderRadius: '0 20px 20px 0',
          backgroundColor: '#EC5B16',
          zIndex: 0,
        }"
        @mousedown="(e) => handleMouseDown(e, false)"
      >
        <ThreeDots />
      </div>

      <!-- Top horizontal bar -->
      <div
        id="top-bar"
        class="vdb-c-absolute vdb-c-cursor-grab"
        :style="{
          left: `${startLeft + 24}px`,
          right: `${560 - endLeft}px`,
          top: '0',
          height: '10px',
          backgroundColor: '#EC5B16',
          zIndex: 0,
        }"
        @mousedown="(e) => handleBlockMouseDown(e)"
      ></div>

      <!-- Bottom horizontal bar -->
      <div
        id="bottom-bar"
        class="vdb-c-absolute vdb-c-cursor-grab"
        :style="{
          left: `${startLeft + 24}px`,
          right: `${560 - endLeft}px`,
          bottom: '0',
          height: '10px',
          backgroundColor: '#EC5B16',
          zIndex: 0,
        }"
        @mousedown="(e) => handleBlockMouseDown(e)"
      ></div>

      <!-- Inside corner arcs - Top Left -->
      <div
        :style="{
          position: 'absolute',
          left: `${startLeft + 24}px`,
          top: '10px',
        }"
      >
        <CornerArc class="vdb-c-rotate-180" />
      </div>

      <!-- Inside corner arcs - Top Right -->
      <div
        :style="{
          position: 'absolute',
          right: `${560 - endLeft + 20}px`,
          top: '10px',
        }"
      >
        <CornerArc class="vdb-c-rotate-[270deg]" />
      </div>

      <!-- Inside corner arcs - Bottom Left -->
      <div
        :style="{
          position: 'absolute',
          left: `${startLeft + 24}px`,
          bottom: '30px',
        }"
      >
        <CornerArc class="vdb-c-rotate-90" />
      </div>

      <!-- Inside corner arcs - Bottom Right -->
      <div
        :style="{
          position: 'absolute',
          right: `${560 - endLeft + 20}px`,
          bottom: '30px',
        }"
      >
        <CornerArc />
      </div>
    </div>

    <!-- Tooltips positioned outside container -->
    <div
      v-if="showStartTooltip"
      class="vdb-c-absolute vdb-c-whitespace-nowrap vdb-c-rounded vdb-c-bg-black vdb-c-px-8 vdb-c-py-4 vdb-c-text-xs vdb-c-text-white"
      :style="{
        left: `${startLeft + 12}px`,
        top: '0px',
        transform: 'translate(-50%, calc(-100% - 10px))',
        zIndex: 300,
      }"
    >
      {{ formatTime(start) }}
    </div>

    <div
      v-if="showEndTooltip"
      class="vdb-c-absolute vdb-c-whitespace-nowrap vdb-c-rounded vdb-c-bg-black vdb-c-px-8 vdb-c-py-4 vdb-c-text-xs vdb-c-text-white"
      :style="{
        left: `${endLeft + 12}px`,
        top: '0px',
        transform: 'translate(-50%, calc(-100% - 10px))',
        zIndex: 300,
      }"
    >
      {{ formatTime(end) }}
    </div>
  </div>
</template>

<script>
import CornerArc from "../../icons/CornerArc.vue";
import ThreeDots from "../../icons/ThreeDots.vue";

export default {
  name: "VideoTrimmer",
  components: { CornerArc, ThreeDots },
  props: {
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    onStartChange: { type: Function, default: null },
    onEndChange: { type: Function, default: null },
    minTime: { type: Number, default: 0 },
    maxTime: { type: Number, default: 100 },
    thumbnails: {
      type: Array,
      default: () => [],
    },
    onMinTimeChange: { type: Function, default: null },
    onMaxTimeChange: { type: Function, default: null },
    maxExtension: { type: Number, default: 60 },
    streamUrl: { type: String, default: "" },
    // Absolute video length hard cap. If provided, right extension will not exceed this.
    videoLength: { type: Number, default: null },
  },
  data() {
    return {
      isDraggingStart: false,
      isDraggingEnd: false,
      isDraggingBlock: false,
      dragOffset: 0,
      showStartTooltip: false,
      showEndTooltip: false,
      handleWidth: 24, // w-6 = 24px
      containerWidth: 560, // w-[560px]
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.updateDocumentListeners();
    });
  },
  computed: {
    availableWidth() {
      return this.containerWidth - this.handleWidth * 2;
    },
    // Convert time values to percentage positions (0-100)
    startPercent() {
      if (this.maxTime === this.minTime) return 0;
      return this.timeToPercent(this.start);
    },
    endPercent() {
      if (this.maxTime === this.minTime) return 0;
      return this.timeToPercent(this.end);
    },
    // Convert time values to pixel positions
    startLeft() {
      if (!isFinite(this.startPercent)) return 0;
      return (this.startPercent / 100) * this.availableWidth;
    },
    endLeft() {
      if (!isFinite(this.endPercent)) return this.handleWidth;
      return Math.min(
        (this.endPercent / 100) * this.availableWidth + this.handleWidth,
        this.containerWidth - this.handleWidth,
      );
    },
    // Calculate thumbnail positioning for dynamic display
    sortedThumbnails() {
      const sorted = [...this.thumbnails].sort(
        (a, b) => a.timestamp - b.timestamp,
      );
      return sorted;
    },
    // Filter thumbnails that are within the current range (minTime to maxTime)
    relevantThumbnails() {
      const relevant = this.sortedThumbnails.filter((thumbnail) => {
        return (
          thumbnail.timestamp >= this.minTime &&
          thumbnail.timestamp <= this.maxTime
        );
      });
      return relevant;
    },
    // Calculate dynamic thumbnail width based on number of thumbnails
    thumbnailWidth() {
      return this.relevantThumbnails.length > 0
        ? this.containerWidth / this.relevantThumbnails.length
        : this.containerWidth / 3;
    },
  },
  methods: {
    buildStateSnapshot() {
      const container = this.$refs.containerRef;
      const rect = container ? container.getBoundingClientRect() : null;
      return {
        streamUrl: this.streamUrl,
        props: {
          start: this.start,
          end: this.end,
          minTime: this.minTime,
          maxTime: this.maxTime,
          maxExtension: this.maxExtension,
          hasOnStartChange: Boolean(this.onStartChange),
          hasOnEndChange: Boolean(this.onEndChange),
          hasOnMinTimeChange: Boolean(this.onMinTimeChange),
          hasOnMaxTimeChange: Boolean(this.onMaxTimeChange),
        },
        dimensions: {
          configuredContainerWidth: this.containerWidth,
          measuredContainerWidth: rect ? rect.width : null,
          handleWidth: this.handleWidth,
          availableWidth: this.availableWidth,
        },
        times: {
          start: this.start,
          end: this.end,
          minTime: this.minTime,
          maxTime: this.maxTime,
          startPercent: this.startPercent,
          endPercent: this.endPercent,
        },
        handles: {
          startLeft: this.startLeft,
          endLeft: this.endLeft,
        },
        thumbnails: {
          total: this.thumbnails.length,
          sortedThumbnails: this.sortedThumbnails,
          relevantThumbnails: this.relevantThumbnails,
          thumbnailWidth: this.thumbnailWidth,
        },
      };
    },
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    },
    timeToPercent(time) {
      if (this.maxTime === this.minTime) return 0;
      return ((time - this.minTime) / (this.maxTime - this.minTime)) * 100;
    },
    percentToTime(percent) {
      return (
        this.minTime + (percent / 100) * (this.maxTime - this.minTime || 1)
      );
    },
    handleMouseDown(e, isStart) {
      e.preventDefault();
      if (isStart) {
        this.isDraggingStart = true;
        this.showStartTooltip = true;
      } else {
        this.isDraggingEnd = true;
        this.showEndTooltip = true;
      }
      this.updateDocumentListeners();
    },
    handleBlockMouseDown(e) {
      e.preventDefault();
      this.isDraggingBlock = true;
      const container = this.$refs.containerRef;
      if (container) {
        const rect = container.getBoundingClientRect();
        this.dragOffset = e.clientX - (rect.left + this.startLeft);
      }
      this.updateDocumentListeners();
    },
    handleMouseMove(e) {
      const container = this.$refs.containerRef;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const handleWidth = 24; // w-6 = 24px
      const availableWidth = containerWidth - handleWidth * 2;

      if (this.isDraggingStart) {
        const mouseX = e.clientX - containerRect.left;
        let newStartTime;

        if (mouseX < 0) {
          // Dragging outside left - extend minTime
          const extensionRatio = Math.abs(mouseX) / availableWidth;
          const timeExtension = Math.min(
            (this.maxTime - this.minTime) * extensionRatio,
            this.maxExtension,
          );
          newStartTime = this.minTime - timeExtension;

          // Safeguard: prevent minTime from going below (original minTime - maxExtension)
          const minAllowedTime = Math.max(0, this.minTime - this.maxExtension);
          const newMinTime = Math.max(minAllowedTime, newStartTime);
          if (this.onMinTimeChange) this.onMinTimeChange(newMinTime);

          // Use the constrained value for start time
          newStartTime = newMinTime;
        } else if (mouseX > availableWidth) {
          // Dragging outside right - constrain to end
          newStartTime = this.end;
        } else {
          // Normal dragging within container
          const newStartPercent = (mouseX / availableWidth) * 100;
          newStartTime = this.percentToTime(newStartPercent);
        }

        // Ensure start time doesn't exceed end time
        const constrainedStartTime = Math.min(newStartTime, this.end);
        if (this.onStartChange) this.onStartChange(constrainedStartTime);
      }

      if (this.isDraggingEnd) {
        const mouseX = e.clientX - containerRect.left;
        let newEndTime;

        if (mouseX > containerWidth) {
          // Dragging outside right - extend maxTime
          const extensionRatio = (mouseX - containerWidth) / availableWidth;
          const timeExtension = Math.min(
            (this.maxTime - this.minTime) * extensionRatio,
            this.maxExtension,
          );
          newEndTime = this.maxTime + timeExtension;

          // Safeguard: prevent maxTime from exceeding (original maxTime + maxExtension)
          const maxAllowedTime = this.maxTime + this.maxExtension;
          let newMaxTime = Math.min(maxAllowedTime, newEndTime);

          // Absolute cap: do not extend beyond full video length if provided
          if (
            typeof this.videoLength === "number" &&
            isFinite(this.videoLength)
          ) {
            newMaxTime = Math.min(newMaxTime, this.videoLength);
          }
          if (this.onMaxTimeChange) this.onMaxTimeChange(newMaxTime);

          // Use the constrained value for end time
          newEndTime = newMaxTime;
        } else if (mouseX < handleWidth) {
          // Dragging outside left - constrain to start
          newEndTime = this.start;
        } else {
          // Normal dragging within container
          const newEndPercent = ((mouseX - handleWidth) / availableWidth) * 100;
          newEndTime = this.percentToTime(newEndPercent);
        }

        // Ensure end time doesn't go below start time
        const constrainedEndTime = Math.max(newEndTime, this.start);
        if (this.onEndChange) this.onEndChange(constrainedEndTime);
      }

      if (this.isDraggingBlock) {
        const mouseX = e.clientX - containerRect.left;
        const blockWidthPx = this.endLeft - this.startLeft;
        let newStartLeft = mouseX - this.dragOffset;
        const maxStartLeft = this.availableWidth - blockWidthPx;
        newStartLeft = Math.max(0, Math.min(newStartLeft, maxStartLeft));
        const newStartPercent = (newStartLeft / this.availableWidth) * 100;
        const newStartTime = this.percentToTime(newStartPercent);
        const duration = this.end - this.start;
        let newEndTime = newStartTime + duration;
        // clamp by videoLength if provided
        const videoLength =
          typeof this.videoLength === "number" && isFinite(this.videoLength)
            ? this.videoLength
            : null;
        if (videoLength !== null) {
          if (newEndTime > videoLength) {
            const overshoot = newEndTime - videoLength;
            newEndTime = videoLength;
            // shift back start to keep duration if needed
            const adjustedStart = Math.max(0, newStartTime - overshoot);
            if (this.onStartChange) this.onStartChange(adjustedStart);
            if (this.onEndChange) this.onEndChange(newEndTime);
            return;
          }
          if (newStartTime < 0) {
            const shift = -newStartTime;
            const adjustedEnd = Math.min(videoLength, newEndTime + shift);
            if (this.onStartChange) this.onStartChange(0);
            if (this.onEndChange) this.onEndChange(adjustedEnd);
            return;
          }
        }
        if (this.onStartChange) this.onStartChange(newStartTime);
        if (this.onEndChange) this.onEndChange(newEndTime);
      }
    },
    handleMouseUp() {
      this.isDraggingStart = false;
      this.isDraggingEnd = false;
      this.isDraggingBlock = false;
      this.showStartTooltip = false;
      this.showEndTooltip = false;
      this.updateDocumentListeners();
    },
    updateDocumentListeners() {
      const dragging =
        this.isDraggingStart || this.isDraggingEnd || this.isDraggingBlock;
      if (dragging) {
        document.addEventListener("mousemove", this.handleMouseMove);
        document.addEventListener("mouseup", this.handleMouseUp);
      } else {
        document.removeEventListener("mousemove", this.handleMouseMove);
        document.removeEventListener("mouseup", this.handleMouseUp);
      }
    },
  },
  watch: {
    isDraggingStart() {
      this.updateDocumentListeners();
    },
    isDraggingEnd() {
      this.updateDocumentListeners();
    },
    isDraggingBlock() {
      this.updateDocumentListeners();
    },
  },
  beforeUnmount() {
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
  },
};
</script>
