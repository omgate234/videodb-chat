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
        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-16 vdb-c-p-20">
          <div class="vdb-c-flex vdb-c-items-center vdb-c-justify-between">
            <h2 class="vdb-c-text-xl vdb-c-font-semibold vdb-c-leading-6 vdb-c-text-[#1A1A1A]">
              Are you sure
            </h2>
            <button
              @click="$emit('close')"
              class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-text-[#4D4D4D] vdb-c-transition-colors hover:vdb-c-text-[#1A1A1A]"
            >
              <CrossIcon fill="#4D4D4D" />
            </button>
          </div>

          <p class="vdb-c-text-base vdb-c-font-normal vdb-c-leading-6 vdb-c-text-[#4D4D4D]">
            Are you sure you want to delete this collection?
          </p>
        </div>

        <div
          class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-end vdb-c-gap-10 vdb-c-rounded-b-16 vdb-c-border-t vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-20 vdb-c-py-12"
        >
          <button
            @click="$emit('close')"
            class="vdb-c-rounded-10 vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-16 vdb-c-py-8 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-[#1A1A1A] vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#F7F7F7]"
          >
            Cancel
          </button>
          <button
            @click="$emit('confirm')"
            class="vdb-c-rounded-10 vdb-c-bg-[#E92329] vdb-c-px-16 vdb-c-py-8 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-5 vdb-c-text-white vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#C14103]"
          >
            Yes, delete
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

defineEmits(['close', 'confirm']);
</script>

<style scoped>
.vdb-c-shadow-xl {
  box-shadow:
    0px 10px 25px rgba(0, 0, 0, 0.1),
    0px 20px 25px rgba(0, 0, 0, 0.16);
}
</style>
