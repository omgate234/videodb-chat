<template>
  <label class="radio-input-container">
    <input
      type="radio"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      @change="$emit('update:modelValue', value)"
      class="radio-input"
    />
    <span class="radio-checkmark"></span>
    <span class="radio-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  modelValue: {
    type: String,
    default: '',
  },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.radio-input-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
  width: 100%;
  padding: 10px;
}

.radio-input {
  opacity: 0;
  position: absolute;
  width: 0;
  height: 0;
}

.radio-checkmark {
  width: 16px;
  height: 16px;
  background-color: #ffffff;
  border: 1px solid #b9b9b9;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-sizing: border-box;
  flex-shrink: 0;
}

.radio-input:checked + .radio-checkmark {
  border-color: #ec5b16;
  border-width: 5px;
}

.radio-input-container:hover .radio-checkmark {
  border-color: #ec5b16;
}

.radio-label {
  font-size: 13px;
  font-weight: 400;
  line-height: normal;
  color: #1e1e1e;
}
</style>
