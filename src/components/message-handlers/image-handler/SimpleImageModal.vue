<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-[1000] vdb-c-flex vdb-c-flex-col vdb-c-bg-[#3D3D3D]"
      @click.self="handleClose"
    >
      <!-- Top Bar with Title and Close Button -->
      <div
        class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-between vdb-c-px-24 vdb-c-py-20"
      >
        <!-- Left: Close Button and Title -->
        <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-16">
          <!-- Close Button -->
          <button
            @click="handleClose"
            class="vdb-c-flex vdb-c-h-24 vdb-c-w-24 vdb-c-items-center vdb-c-justify-center vdb-c-transition-opacity hover:vdb-c-opacity-70"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#FFFFFF"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <!-- Title -->
          <h2 class="vdb-c-text-[16px] vdb-c-font-medium vdb-c-leading-6 vdb-c-text-white">
            {{ imageName || 'Image' }}
          </h2>
        </div>
      </div>

      <!-- Image Display Container -->
      <div
        class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center vdb-c-justify-center vdb-c-px-48 vdb-c-pb-48"
      >
        <div
          class="vdb-c-relative vdb-c-flex vdb-c-max-h-full vdb-c-w-full vdb-c-items-center vdb-c-justify-center vdb-c-overflow-hidden vdb-c-rounded-12"
        >
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="imageName || 'Image'"
            class="vdb-c-max-h-full vdb-c-max-w-full vdb-c-rounded-12 vdb-c-object-contain"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  imageName: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};
</script>
