<template>
  <div
    class="vdb-c-flex vdb-c-w-full vdb-c-max-w-[1000px] vdb-c-flex-col vdb-c-items-center vdb-c-rounded-t-16 vdb-c-bg-[#F7F7F7]"
  >
    <!-- VISUAL STRIP -->
    <div
      class="vdb-c-b vdb-c-relative vdb-c-flex vdb-c-h-80 vdb-c-w-full vdb-c-items-center vdb-c-justify-center vdb-c-gap-[1px] vdb-c-border-b vdb-c-border-roy"
    >
      <!-- LEFT SCALE -->
      <div class="left-scale vdb-c-relative vdb-c-h-full vdb-c-w-[300px] vdb-c-overflow-hidden">
        <!-- Ticks Layer (on top of thumbnails) -->
        <div
          class="vdb-c-pointer-events-none vdb-c-absolute vdb-c-left-0 vdb-c-top-0 vdb-c-h-full vdb-c-w-full"
        >
          <div
            v-for="tick in visibleLeftTicks"
            :key="tick.seconds"
            class="tick-mark"
            :style="{ left: tick.position - 2 + 'px' }"
            :class="{
              major: tick.seconds % 10 === 0,
            }"
          >
            <span v-if="tick.seconds % 10 === 0" class="tick-label">
              {{ formatTime(tick.seconds) }}
            </span>
          </div>
        </div>
      </div>

      <!-- CENTER: PILL & ARROWS -->
      <div
        class="vdb-c-relative vdb-c-flex vdb-c-h-full vdb-c-w-[400px] vdb-c-items-center vdb-c-justify-center"
      >
        <div
          class="vdb-c-absolute vdb-c-top-[50%] vdb-c-z-[1] vdb-c-mt-[-1px] vdb-c-h-[1px] vdb-c-w-full vdb-c-bg-[#f25c05]"
        ></div>
        <div
          class="vdb-c-relative vdb-c-z-[2] vdb-c-flex vdb-c-items-center vdb-c-gap-6 vdb-c-rounded-[40px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-[#f7f7f7] vdb-c-px-8 vdb-c-py-6"
        >
          <span
            class="vdb-c-text-[12px] vdb-c-font-medium vdb-c-leading-[12px] vdb-c-text-[#464646]"
            >Clip duration</span
          >
          <span
            class="vdb-c-text-[12px] vdb-c-font-semibold vdb-c-leading-[12px] vdb-c-text-[#464646]"
            >{{ formatDuration(end - start) }}</span
          >
        </div>
        <div class="arrow-head left"></div>
        <div class="arrow-head right"></div>
      </div>

      <!-- RIGHT SCALE -->
      <div class="right-scale vdb-c-relative vdb-c-h-full vdb-c-w-[300px] vdb-c-overflow-hidden">
        <!-- Ticks Layer (on top of thumbnails) -->
        <div
          class="vdb-c-pointer-events-none vdb-c-absolute vdb-c-left-0 vdb-c-top-0 vdb-c-h-full vdb-c-w-full"
        >
          <div
            v-for="tick in visibleRightTicks"
            :key="tick.seconds"
            class="tick-mark"
            :style="{ left: tick.position + 'px' }"
            :class="{
              major: tick.seconds % 10 === 0,
            }"
          >
            <span v-if="tick.seconds % 10 === 0" class="tick-label">
              {{ formatTime(tick.seconds) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div
      class="vdb-c-relative vdb-c-mb-[20px] vdb-c-mt-[16px] vdb-c-flex vdb-c-h-[80px] vdb-c-w-full vdb-c-items-center vdb-c-bg-white"
    >
      <div
        v-if="leftDisabledZoneWidth > 0"
        :style="{ width: leftDisabledZoneWidth + 'px' }"
        class="disabled-zone vdb-c-h-full vdb-c-flex-shrink-0 vdb-c-rounded-8 vdb-c-rounded-l-[0px] vdb-c-border-2 vdb-c-border-l-[0px] vdb-c-border-r-[0px] vdb-c-border-white"
      ></div>
      <div
        :key="'thumb-container-' + thumbnailKey"
        class="vdb-c-relative vdb-c-h-full vdb-c-flex-1 vdb-c-overflow-hidden vdb-c-rounded-8 vdb-c-border-2 vdb-c-border-white vdb-c-bg-black"
      >
        <!-- Thumbnails in bottom black section -->
        <div
          v-for="(thumb, idx) in bottomThumbnails"
          :key="thumb.timestamp + '-bottom-' + idx"
          class="vdb-c-absolute vdb-c-h-full vdb-c-overflow-hidden"
          :style="{
            left: thumb.leftPercent + '%',
            width: thumb.widthPercent + '%',
          }"
        >
          <img
            :src="thumb.url"
            :alt="'Thumbnail at ' + formatTime(thumb.timestamp)"
            class="vdb-c-h-full vdb-c-w-full vdb-c-object-cover"
          />
        </div>
      </div>

      <!-- Orange frame with all buttons -->
      <div
        class="vdb-c-pointer-events-none vdb-c-absolute vdb-c-left-[50%] vdb-c-top-0 vdb-c-h-full vdb-c-w-[400px] vdb-c-translate-x-[-50%] vdb-c-rounded-8 vdb-c-border-[4px] vdb-c-border-vdb-orange"
      >
        <!-- LEFT EXPAND CONTROLS (outside orange frame, to the left) -->
        <div
          class="vdb-c-absolute vdb-c-right-[calc(100%+8px)] vdb-c-top-[50%] vdb-c-z-[3] vdb-c-flex vdb-c-translate-y-[-50%] vdb-c-gap-5"
        >
          <!-- Show 10s button when >= 10s remaining -->
          <button
            v-if="leftExtensionRemaining >= 10"
            @click="updateStart(start - 10)"
            :disabled="start - 10 < minAllowedStart"
            title="Expand Start by 10s"
            class="expand-btn"
          >
            <DoubleChevronIcon :fill="start - 10 < minAllowedStart ? '#969696' : '#1e1e1e'" />
            <span>10s</span>
          </button>

          <!-- Show 5s button when >= 5s remaining -->
          <button
            v-if="leftExtensionRemaining >= 5"
            @click="updateStart(start - 5)"
            :disabled="start - 5 < minAllowedStart"
            title="Expand Start by 5s"
            class="expand-btn"
          >
            <ChevronIcon :fill="start - 5 < minAllowedStart ? '#969696' : '#1e1e1e'" />
            <span>5s</span>
          </button>
        </div>

        <!-- LEFT SHRINK BUTTON (inside orange frame) -->
        <button
          @click="updateStart(start + 1)"
          :disabled="start >= end - 1"
          class="shrink-btn"
          title="Shrink Start by 1s"
        >
          <span>1s</span>
          <ChevronIcon fill="#ffffff" class="vdb-c-rotate-180" />
        </button>

        <!-- RIGHT SHRINK BUTTON (inside orange frame) -->
        <button
          @click="updateEnd(end - 1)"
          :disabled="end <= start + 1"
          class="shrink-btn shrink-btn-right"
          title="Shrink End by 1s"
        >
          <ChevronIcon fill="#ffffff" />
          <span>1s</span>
        </button>

        <!-- RIGHT EXPAND CONTROLS (outside orange frame, to the right) -->
        <div
          class="vdb-c-absolute vdb-c-left-[calc(100%+8px)] vdb-c-top-[50%] vdb-c-z-[3] vdb-c-flex vdb-c-translate-y-[-50%] vdb-c-gap-5"
        >
          <!-- Show 5s button when >= 5s remaining -->
          <button
            v-if="rightExtensionRemaining >= 5"
            @click="updateEnd(end + 5)"
            :disabled="end + 5 > maxAllowedEnd"
            title="Expand End by 5s"
            class="expand-btn expand-btn-right"
          >
            <span>5s</span>
            <ChevronIcon
              :fill="end + 5 > maxAllowedEnd ? '#969696' : '#1e1e1e'"
              class="vdb-c-rotate-180"
            />
          </button>

          <!-- Show 10s button when >= 10s remaining -->
          <button
            v-if="rightExtensionRemaining >= 10"
            @click="updateEnd(end + 10)"
            :disabled="end + 10 > maxAllowedEnd"
            title="Expand End by 10s"
            class="expand-btn expand-btn-right"
          >
            <span>10s</span>
            <DoubleChevronIcon
              :fill="end + 10 > maxAllowedEnd ? '#969696' : '#1e1e1e'"
              class="vdb-c-rotate-180"
            />
          </button>
        </div>
      </div>

      <div
        v-if="rightDisabledZoneWidth > 0"
        :style="{ width: rightDisabledZoneWidth + 'px' }"
        class="disabled-zone vdb-c-h-full vdb-c-flex-shrink-0 vdb-c-rounded-8 vdb-c-rounded-r-[0px] vdb-c-border-2 vdb-c-border-l-[0px] vdb-c-border-r-[0px] vdb-c-border-white"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import ChevronIcon from '../../chat/v2/icons/deep-search/ChevronIcon.vue';
import DoubleChevronIcon from '../../chat/v2/icons/deep-search/DoubleChevronIcon.vue';

const props = defineProps({
  totalDuration: { type: Number, required: true },
  start: { type: Number, required: true }, // Current Start
  end: { type: Number, required: true }, // Current End

  // NEW PROPS FOR LIMITING
  originalStart: { type: Number, required: true },
  originalEnd: { type: Number, required: true },
  maxExtension: { type: Number, default: 20 },
  thumbnails: { type: Array, default: () => [] },
  callApi: { type: Function, default: null },
  videoId: { type: String, default: null },
  collectionId: { type: String, default: null },
});

const localThumbnails = ref([]);
const thumbnailKey = ref(0);

const activeThumbnails = computed(() => {
  return localThumbnails.value.length > 0 ? localThumbnails.value : props.thumbnails;
});

const fetchThumbnails = async () => {
  if (!props.callApi || !props.videoId || !props.collectionId) {
    return;
  }

  try {
    const response = await props.callApi(
      `/videodb/collection/${props.collectionId}/video/${props.videoId}/thumbnails`,
      {
        method: 'POST',
        payload: {
          start: props.start,
          end: props.end,
        },
      }
    );

    if (response.data?.thumbnail_data) {
      localThumbnails.value = response.data.thumbnail_data;
      thumbnailKey.value++;
    }
  } catch (error) {
    console.error('Failed to fetch thumbnails:', error);
  }
};

// Fetch thumbnails on mount
onMounted(() => {
  fetchThumbnails();
});

const emit = defineEmits(['update:start', 'update:end']);

// --- CONFIG ---
const pixelsPerSecond = 10;
const scaleWidth = 300;

// --- LIMIT CALCULATION ---

// The earliest possible start time (Original Start - 20s, but not less than 0)
const minAllowedStart = computed(() => {
  return Math.max(0, props.originalStart - props.maxExtension);
});

// The latest possible end time (Original End + 20s, but not more than total video)
const maxAllowedEnd = computed(() => {
  return Math.min(props.totalDuration, props.originalEnd + props.maxExtension);
});

// Calculate remaining extension space
const leftExtensionRemaining = computed(() => {
  return props.start - minAllowedStart.value;
});

const rightExtensionRemaining = computed(() => {
  return maxAllowedEnd.value - props.end;
});

// Calculate disabled zone widths (areas showing impossible times)
const leftDisabledZoneWidth = computed(() => {
  const secondsInView = scaleWidth / pixelsPerSecond; // 30 seconds
  const startOfScale = props.start - secondsInView;

  if (startOfScale < 0) {
    const negativeSeconds = Math.abs(startOfScale);
    return negativeSeconds * pixelsPerSecond;
  }
  return 0;
});

const rightDisabledZoneWidth = computed(() => {
  const secondsInView = scaleWidth / pixelsPerSecond; // 30 seconds
  const endOfScale = props.end + secondsInView;

  if (endOfScale > props.totalDuration) {
    const beyondSeconds = endOfScale - props.totalDuration;
    return beyondSeconds * pixelsPerSecond;
  }
  return 0;
});

// --- UPDATER FUNCTIONS ---

const updateStart = (val) => {
  let newValue = val;

  if (newValue < minAllowedStart.value) newValue = minAllowedStart.value;
  if (newValue < 0) newValue = 0;

  // 2. Check Logical Limit (Don't cross End)
  if (newValue >= props.end) newValue = props.end - 1;

  emit('update:start', newValue);
};

const updateEnd = (val) => {
  let newValue = val;

  if (newValue > maxAllowedEnd.value) newValue = maxAllowedEnd.value;
  if (newValue > props.totalDuration) newValue = props.totalDuration;

  // 2. Check Logical Limit (Don't cross Start)
  if (newValue <= props.start) newValue = props.start + 1;

  emit('update:end', newValue);
};

// --- VISUALIZATION (TICKS) ---

const visibleLeftTicks = computed(() => {
  const ticks = [];
  const secondsInView = scaleWidth / pixelsPerSecond;
  const startTimeWindow = Math.max(0, props.start - secondsInView);

  for (let s = Math.ceil(startTimeWindow); s <= props.start; s++) {
    const distFromEnd = props.start - s;
    const pxPosition = scaleWidth - distFromEnd * pixelsPerSecond;
    ticks.push({ seconds: s, position: pxPosition });
  }
  return ticks;
});

const visibleRightTicks = computed(() => {
  const ticks = [];
  const secondsInView = scaleWidth / pixelsPerSecond;
  const endTimeWindow = Math.min(props.totalDuration, props.end + secondsInView);

  for (let s = Math.floor(props.end); s <= endTimeWindow; s++) {
    const distFromStart = s - props.end;
    const pxPosition = distFromStart * pixelsPerSecond;
    ticks.push({ seconds: s, position: pxPosition });
  }
  return ticks;
});

// --- THUMBNAIL POSITIONING FOR TOP SCALES ---

const visibleLeftThumbnails = computed(() => {
  const thumbs = activeThumbnails.value;
  if (!thumbs || thumbs.length === 0) return [];

  const secondsInView = scaleWidth / pixelsPerSecond; // 30 seconds
  const startTimeWindow = Math.max(0, props.start - secondsInView);
  const endTimeWindow = props.start;

  // Filter thumbnails that fall within the visible time range
  const visibleThumbs = thumbs.filter(
    (thumb) => thumb.timestamp >= startTimeWindow && thumb.timestamp <= endTimeWindow
  );

  // Calculate position and width for each thumbnail
  return visibleThumbs.map((thumb, index, arr) => {
    // Distance from the start time (right edge of left scale)
    const distFromEnd = props.start - thumb.timestamp;
    const rightPosition = distFromEnd * pixelsPerSecond;

    // Calculate width based on spacing to next thumbnail or edge
    let width;
    if (index < arr.length - 1) {
      const nextThumb = arr[index + 1];
      const timeDiff = nextThumb.timestamp - thumb.timestamp;
      width = timeDiff * pixelsPerSecond;
    } else {
      // Last thumbnail extends to the edge
      const timeDiff = props.start - thumb.timestamp;
      width = timeDiff * pixelsPerSecond;
    }

    // Ensure minimum width for visibility
    width = Math.max(width, 20);

    return {
      url: thumb.thumbnail_url,
      timestamp: thumb.timestamp,
      right: rightPosition,
      width: width,
    };
  });
});

const visibleRightThumbnails = computed(() => {
  const thumbs = activeThumbnails.value;
  if (!thumbs || thumbs.length === 0) return [];

  const secondsInView = scaleWidth / pixelsPerSecond; // 30 seconds
  const startTimeWindow = props.end;
  const endTimeWindow = Math.min(props.totalDuration, props.end + secondsInView);

  // Filter thumbnails that fall within the visible time range
  const visibleThumbs = thumbs.filter(
    (thumb) => thumb.timestamp >= startTimeWindow && thumb.timestamp <= endTimeWindow
  );

  // Calculate position and width for each thumbnail
  return visibleThumbs.map((thumb, index, arr) => {
    // Distance from the end time (left edge of right scale)
    const distFromStart = thumb.timestamp - props.end;
    const leftPosition = distFromStart * pixelsPerSecond;

    // Calculate width based on spacing to next thumbnail or edge
    let width;
    if (index < arr.length - 1) {
      const nextThumb = arr[index + 1];
      const timeDiff = nextThumb.timestamp - thumb.timestamp;
      width = timeDiff * pixelsPerSecond;
    } else {
      // Last thumbnail extends to the edge
      const timeDiff = endTimeWindow - thumb.timestamp;
      width = timeDiff * pixelsPerSecond;
    }

    // Ensure minimum width for visibility
    width = Math.max(width, 20);

    return {
      url: thumb.thumbnail_url,
      timestamp: thumb.timestamp,
      left: leftPosition,
      width: width,
    };
  });
});

const bottomThumbnails = computed(() => {
  const thumbs = activeThumbnails.value;
  if (!thumbs || thumbs.length === 0) return [];

  const secondsInView = scaleWidth / pixelsPerSecond;
  const startTimeWindow = Math.max(0, props.start - secondsInView);
  const endTimeWindow = Math.min(props.totalDuration, props.end + secondsInView);
  const totalVisibleTime = endTimeWindow - startTimeWindow;

  const visibleThumbs = thumbs.filter(
    (thumb) => thumb.timestamp >= startTimeWindow && thumb.timestamp <= endTimeWindow
  );

  if (visibleThumbs.length === 0) return [];

  // Sort by timestamp
  visibleThumbs.sort((a, b) => a.timestamp - b.timestamp);

  // Position thumbnails at their EXACT timestamps and stretch to fill 100%
  const thumbnailSegments = [];

  for (let i = 0; i < visibleThumbs.length; i++) {
    const thumb = visibleThumbs[i];
    const nextThumb = visibleThumbs[i + 1];

    // Determine the TIME segment this thumbnail should cover
    let segmentStartTime, segmentEndTime;

    if (i === 0) {
      // First thumbnail: covers from window start to next thumbnail (or window end)
      segmentStartTime = startTimeWindow;
      segmentEndTime = nextThumb ? nextThumb.timestamp : endTimeWindow;
    } else if (!nextThumb) {
      // Last thumbnail: covers from previous thumbnail to window end
      const prevThumb = visibleThumbs[i - 1];
      segmentStartTime = prevThumb.timestamp;
      segmentEndTime = endTimeWindow;
    } else {
      // Middle thumbnail: covers from previous to next thumbnail
      const prevThumb = visibleThumbs[i - 1];
      segmentStartTime = prevThumb.timestamp;
      segmentEndTime = nextThumb.timestamp;
    }

    // Calculate the percentage of time this segment represents
    const segmentDuration = segmentEndTime - segmentStartTime;
    const segmentStartOffset = segmentStartTime - startTimeWindow;

    // Convert to pixel position and width (percentage-based to fill 100%)
    const leftPositionPercent = (segmentStartOffset / totalVisibleTime) * 100;
    const widthPercent = (segmentDuration / totalVisibleTime) * 100;

    thumbnailSegments.push({
      url: thumb.thumbnail_url,
      timestamp: thumb.timestamp,
      leftPercent: leftPositionPercent,
      widthPercent: widthPercent,
    });
  }

  return thumbnailSegments;
});

const formatTime = (s) => {
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = Math.floor(s % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatDuration = (s) => {
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = Math.floor(s % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.disabled-zone {
  background: repeating-linear-gradient(45deg, #f3f4f6, #f3f4f6 8px, #d9d9d9 8px, #d9d9d9 16px);
}

button.expand-btn {
  display: flex;
  align-items: center;
  gap: 0;
  background: #ffffff;
  border: 1px solid #efefef;
  border-radius: 50px;
  padding: 4px 8px 4px 3px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  color: #1e1e1e;
  line-height: 12px;
  transition:
    background-color 0.2s,
    border-color 0.2s;
  pointer-events: auto;
}

button.expand-btn:hover:not(:disabled) {
  background: #f7f7f7;
  border-color: #dbdbdb;
}

button.expand-btn:disabled {
  cursor: not-allowed;
  background: #efefef;
  border-color: #dbdbdb;
  color: #969696;
}

button.expand-btn-right {
  padding: 4px 3px 4px 8px;
}

button.shrink-btn {
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 0;
  background: #ec5b16;
  border: 1px solid #efefef;
  border-radius: 50px;
  padding: 4px 3px 4px 8px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  color: #ffffff;
  line-height: 12px;
  pointer-events: auto;
  z-index: 4;
  transition: background-color 0.2s;
}

button.shrink-btn:hover:not(:disabled) {
  background: #d94e0f;
}

button.shrink-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.shrink-btn-right {
  left: auto;
  right: 6px;
  padding: 4px 8px 4px 3px;
}

.tick-mark {
  position: absolute;
  top: 50%;
  width: 1px;
  height: 8px;
  background: #ccc;
  transition: none !important;
  transform: translateY(-50%);
}

.tick-mark.major {
  height: 16px;
  background: #999;
  transform: translateY(-50%);
}

.tick-mark.limit {
  height: 24px;
  background: #f25c05;
  top: 20px;
  width: 2px;
}

.limit-label {
  position: absolute;
  top: -15px;
  font-size: 9px;
  color: #f25c05;
  font-weight: bold;
  left: 50%;
  transform: translateX(-50%);
}

.tick-label {
  position: absolute;
  top: -20px;
  font-size: 11px;
  color: #666;
  font-family: sans-serif;
  white-space: nowrap;
}

.left-scale .tick-label {
  right: 0px;
  text-align: right;
}

.right-scale .tick-label {
  left: 0px;
  text-align: left;
}

.arrow-head {
  position: absolute;
  width: 8px;
  height: 8px;
  border-top: 1px solid #f25c05;
  border-right: 1px solid #f25c05;
  top: 50%;
  margin-top: -5px;
  z-index: 1;
}

.arrow-head.left {
  left: 0px;
  transform: rotate(-135deg);
}

.arrow-head.right {
  right: 0px;
  transform: rotate(45deg);
}
</style>
