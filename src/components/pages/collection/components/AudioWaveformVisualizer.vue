<template>
  <div
    ref="containerRef"
    class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-items-center"
    style="height: 48px;"
  >
    <canvas ref="canvasRef" style="width: 100%; height: 100%;" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  analyserNode: {
    type: Object,
    default: null,
  },
  isRecording: {
    type: Boolean,
    default: false,
  },
});

const containerRef = ref(null);
const canvasRef = ref(null);
let animationFrameId = null;
let dataArray = null;

const draw = () => {
  const canvas = canvasRef.value;
  const analyser = props.analyserNode;

  if (!canvas || !analyser) {
    animationFrameId = requestAnimationFrame(draw);
    return;
  }

  const ctx = canvas.getContext('2d');
  const container = containerRef.value;

  // Set canvas size to match container
  const rect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Get frequency data
  const bufferLength = analyser.frequencyBinCount;
  if (!dataArray || dataArray.length !== bufferLength) {
    dataArray = new Uint8Array(bufferLength);
  }
  analyser.getByteFrequencyData(dataArray);

  // Draw dotted baseline
  const baselineY = height / 2;
  ctx.strokeStyle = '#6B6B6B';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.moveTo(0, baselineY);
  ctx.lineTo(width, baselineY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Calculate the center area for waveform bars
  const barCount = 40;
  const barWidth = 3;
  const barGap = 2;
  const totalBarsWidth = barCount * (barWidth + barGap) - barGap;
  const startX = (width - totalBarsWidth) / 2;

  // Calculate average amplitude for overall scaling
  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i];
  }
  const avgAmplitude = sum / bufferLength;

  // Draw bars
  ctx.fillStyle = '#6B6B6B';
  ctx.strokeStyle = '#6B6B6B';
  ctx.lineWidth = barWidth;
  ctx.lineCap = 'round';

  for (let i = 0; i < barCount; i++) {
    // Sample from different parts of the frequency spectrum
    const dataIndex = Math.floor((i / barCount) * bufferLength * 0.7);
    const value = dataArray[dataIndex] || 0;

    // Calculate bar height with some minimum and maximum
    const normalizedValue = value / 255;
    const maxBarHeight = height / 2 - 4;
    const minBarHeight = 2;

    // Add some variation based on position (center bars slightly taller)
    const positionFactor = 1 - (Math.abs(i - barCount / 2) / (barCount / 2)) * 0.3;
    let barHeight = Math.max(minBarHeight, normalizedValue * maxBarHeight * positionFactor);

    // If not recording much sound, show minimal bars
    if (avgAmplitude < 10) {
      barHeight = minBarHeight;
    }

    const x = startX + i * (barWidth + barGap) + barWidth / 2;

    // Draw bar extending from center both up and down
    ctx.beginPath();
    ctx.moveTo(x, baselineY - barHeight);
    ctx.lineTo(x, baselineY + barHeight);
    ctx.stroke();
  }

  animationFrameId = requestAnimationFrame(draw);
};

const startAnimation = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  draw();
};

const stopAnimation = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

onMounted(() => {
  startAnimation();
});

onUnmounted(() => {
  stopAnimation();
});

watch(
  () => props.analyserNode,
  () => {
    if (props.analyserNode) {
      startAnimation();
    }
  }
);
</script>
