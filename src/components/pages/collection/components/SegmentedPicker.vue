<template>
  <div
    class="vdb-c-flex vdb-c-w-full vdb-c-gap-[2px] vdb-c-rounded-[38px] vdb-c-bg-[#EFEFEF] vdb-c-p-[2px]"
  >
    <button
      v-for="option in options"
      :key="option.value"
      @click="$emit('update:modelValue', option.value)"
      :class="[
        'vdb-c-flex vdb-c-h-[30px] vdb-c-w-full vdb-c-items-center vdb-c-justify-center vdb-c-rounded-[57px] vdb-c-transition-all md:vdb-c-w-[150.5px]',
        modelValue === option.value
          ? 'vdb-c-border-[0.5px] vdb-c-border-[#C14103] vdb-c-bg-[#EC5B16]'
          : 'vdb-c-bg-transparent',
      ]"
    >
      <span
        :class="[
          'vdb-c-whitespace-nowrap vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px]',
          modelValue === option.value ? 'vdb-c-text-white' : 'vdb-c-text-vdb-darkishgrey',
        ]"
      >
        {{ option.label }}
      </span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
    validator: (options) => {
      return options.every((opt) => opt.value && opt.label);
    },
  },
});

defineEmits(['update:modelValue']);
</script>
