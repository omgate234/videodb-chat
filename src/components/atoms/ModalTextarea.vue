<template>
  <div class="vdb-c-w-full">
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
      @focus="isFocused = true"
      @blur="onBlur"
      rows="4"
      class="vdb-c-w-full vdb-c-resize-none vdb-c-px-16 vdb-c-py-12 vdb-c-text-[14px] vdb-c-leading-[20px] vdb-c-outline-none vdb-c-transition vdb-c-duration-150"
      :class="[
        'vdb-c-rounded-[8px] vdb-c-bg-[#F7F7F7] vdb-c-outline vdb-c-outline-1 vdb-c-outline-[#EFEFEF]',
        isFocused
          ? 'vdb-c-bg-white vdb-c-shadow-[0_0_0_3px_rgba(236,91,22,0.25)] vdb-c-outline-[#EC5B16]'
          : isFilled
            ? 'vdb-c-bg-white vdb-c-outline-[#EFEFEF]'
            : 'vdb-c-bg-[#F7F7F7] vdb-c-outline-[#EFEFEF]',
        disabled && 'vdb-c-cursor-not-allowed vdb-c-bg-[#EFEFEF]',
      ]"
      @mouseenter="isHover = true"
      @mouseleave="isHover = false"
      :style="hoverStyle"
    />
  </div>
</template>

<script>
export default {
  name: "ModalTextarea",
  props: {
    modelValue: { type: [String, Number], default: "" },
    placeholder: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      isFocused: false,
      isHover: false,
    };
  },
  computed: {
    isFilled() {
      return (
        this.modelValue !== null &&
        this.modelValue !== undefined &&
        String(this.modelValue).length > 0
      );
    },
    hoverStyle() {
      if (this.disabled) return {};
      if (this.isFocused) return {};
      if (this.isHover) {
        return { outlineColor: "#969696", background: "#FFFFFF" };
      }
      return {};
    },
  },
  methods: {
    onInput(event) {
      this.$emit("update:modelValue", event.target.value);
    },
    onBlur() {
      this.isFocused = false;
    },
  },
};
</script>
