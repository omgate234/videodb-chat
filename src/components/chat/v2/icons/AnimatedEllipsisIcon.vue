<template>
  <div
    class="vdb-c-relative vdb-c-flex vdb-c-h-[4px] vdb-c-w-[20px] vdb-c-items-center vdb-c-justify-between"
  >
    <div
      class="vdb-c-dot vdb-c-h-[4px] vdb-c-w-[4px] vdb-c-rounded-full vdb-c-bg-white"
      :style="{ animationDelay: '0ms' }"
    ></div>
    <div
      class="vdb-c-dot vdb-c-h-[4px] vdb-c-w-[4px] vdb-c-rounded-full vdb-c-bg-white"
      :style="{ animationDelay: '160ms' }"
    ></div>
    <div
      class="vdb-c-dot vdb-c-h-[4px] vdb-c-w-[4px] vdb-c-rounded-full vdb-c-bg-white"
      :style="{ animationDelay: '320ms' }"
    ></div>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.vdb-c-dot {
  animation: bounce 800ms ease-in-out infinite;
}
</style>
