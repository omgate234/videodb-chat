<template>
  <div
    class="vdb-c-flex vdb-c-items-center vdb-c-gap-20 vdb-c-overflow-hidden vdb-c-rounded-16 vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-p-20"
  >
    <div
      class="vdb-c-relative vdb-c-h-80 vdb-c-w-80 vdb-c-flex-shrink-0 vdb-c-overflow-hidden vdb-c-rounded-full vdb-c-bg-white"
      style="box-shadow: 0px 0px 0px 1px inset rgba(0, 0, 0, 0.1)"
    >
      <div
        class="vdb-c-absolute vdb-c-left-1/2 vdb-c-top-1/2 vdb-c-flex vdb-c-h-[66.667px] vdb-c-w-[66.667px] vdb-c-translate-x-[-50%] vdb-c-translate-y-[-50%] vdb-c-items-center vdb-c-justify-center vdb-c-overflow-hidden"
      >
        <component :is="icon" class="vdb-c-h-[40px] vdb-c-w-[40px] vdb-c-text-vdb-darkishgrey" />
      </div>
    </div>
    <div class="vdb-c-flex vdb-c-w-[208px] vdb-c-flex-shrink-0 vdb-c-flex-col vdb-c-gap-4">
      <div class="vdb-c-w-full vdb-c-overflow-hidden">
        <p
          class="vdb-c-whitespace-nowrap vdb-c-text-[15px] vdb-c-font-medium vdb-c-leading-[28px] vdb-c-text-vdb-darkishgrey"
        >
          {{ name }}
        </p>
      </div>
      <div class="vdb-c-w-full vdb-c-overflow-hidden">
        <p
          class="vdb-c-text-[12px] vdb-c-font-normal vdb-c-leading-[16px] vdb-c-text-[#464646]"
          style="overflow: hidden; text-overflow: ellipsis"
        >
          {{ description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: Object,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});
</script>
