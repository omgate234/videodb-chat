<template>
  <div style="display: none"></div>
</template>

<script setup>
import { watch, defineExpose } from "vue";
import { useVideoDBPlayer } from "@videodb/player-vue";

const emit = defineEmits([
  "time-update",
  "duration",
  "playing",
  "waiting",
  "video-error",
]);

const player = useVideoDBPlayer();

if (player) {
  if (player.time) {
    watch(player.time, (t) => emit("time-update", t), { immediate: true });
  }
  if (player.duration) {
    watch(player.duration, (d) => emit("duration", d), { immediate: true });
  }
  if (player.playing) {
    watch(player.playing, (p) => emit("playing", p), { immediate: true });
  }
}

function seekTo(time) {
  if (player && typeof player.seekTo === "function") {
    player.seekTo(time);
  }
}

function pause() {
  if (player && typeof player.pause === "function") {
    player.pause();
  }
}

function play() {
  if (player && typeof player.play === "function") {
    player.play();
  }
}

defineExpose({ seekTo, pause, play });
</script>
