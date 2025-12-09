<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-50 vdb-c-flex vdb-c-items-center vdb-c-justify-center"
      @click="$emit('close')"
    >
      <div
        class="vdb-c-fixed vdb-c-left-0 vdb-c-top-0 vdb-c-z-[-10] vdb-c-h-screen vdb-c-w-screen vdb-c-bg-[#1e1e1e] vdb-c-opacity-70"
      ></div>
      <div
        class="vdb-c-shadow-xl vdb-c-mx-16 vdb-c-w-full vdb-c-max-w-[400px] vdb-c-rounded-16 vdb-c-bg-white"
        @click.stop
      >
        <!-- Modal Body -->
        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-16 vdb-c-p-20">
          <div class="vdb-c-flex vdb-c-items-center vdb-c-justify-between">
            <h2 class="vdb-c-text-[20px] vdb-c-font-semibold vdb-c-leading-6 vdb-c-text-[#1E1E1E]">
              Unable to delete this collection
            </h2>
            <button
              @click="$emit('close')"
              class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-text-[#1E1E1E] vdb-c-transition-colors hover:vdb-c-text-[#000000]"
            >
              <CrossIcon fill="currentColor" />
            </button>
          </div>

          <p class="vdb-c-text-sm vdb-c-font-normal vdb-c-leading-5 vdb-c-text-[#2D2D2D]">
            This collection contains videos, if you wish to delete this collection kindly remove all
            the videos individually first.
          </p>
        </div>
        <div
          class="vdb-c-flex vdb-c-items-center vdb-c-justify-end vdb-c-gap-10 vdb-c-rounded-b-10 vdb-c-border-t vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-20 vdb-c-py-12"
        >
          <button
            @click="$emit('close')"
            class="vdb-c-rounded-[8px] vdb-c-bg-[#1E1E1E] vdb-c-px-16 vdb-c-py-12 vdb-c-text-sm vdb-c-font-semibold vdb-c-leading-4 vdb-c-text-white vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#4D4D4D]"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import CrossIcon from '../../icons/Cross.vue';

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['close']);
</script>

<style scoped>
.vdb-c-shadow-xl {
  box-shadow:
    0px 20px 25px -5px rgba(0, 0, 0, 0.1),
    0px 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
