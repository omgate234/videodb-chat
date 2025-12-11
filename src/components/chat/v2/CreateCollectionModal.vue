<template>
  <div
    v-if="showDialog"
    class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-50 vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-bg-black/50"
    @click.self="handleCancel"
  >
    <div
      class="vdb-c-flex vdb-c-w-[500px] vdb-c-max-w-[90vw] vdb-c-flex-col vdb-c-overflow-hidden vdb-c-rounded-[20px] vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
    >
      <header
        class="vdb-c-flex vdb-c-items-center vdb-c-justify-between vdb-c-px-[20px] vdb-c-py-[20px]"
      >
        <h2 class="vdb-c-text-[20px] vdb-c-font-semibold vdb-c-leading-[1.5] vdb-c-text-[#1E1E1E]">
          New Collection
        </h2>
        <button
          aria-label="Close"
          class="vdb-c-flex vdb-c-h-[24px] vdb-c-w-[24px] vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full hover:vdb-c-bg-black/5"
          @click="handleCancel"
        >
          <svg
            class="vdb-c-h-[16px] vdb-c-w-[16px] vdb-c-text-[#1E1E1E]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </header>

      <section
        class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[20px] vdb-c-border vdb-c-border-[#E5E7EB] vdb-c-px-[20px] vdb-c-py-[30px]"
      >
        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[8px]">
          <label class="vdb-c-text-[16px] vdb-c-font-medium vdb-c-text-[#1E1E1E]">
            Collection name
          </label>
          <Input
            v-model="name"
            :maxlength="NAME_LIMIT"
            placeholder="Collection name (required)"
            wrapper-class="vdb-c-h-[52px]"
            :error="isNameAtLimit"
            :show-character-count="false"
          />
          <div
            class="vdb-c-mt-[4px] vdb-c-text-right vdb-c-text-[14px] vdb-c-leading-[14px] vdb-c-tracking-[-0.24px]"
            :class="isNameAtLimit ? 'vdb-c-text-[#E02424]' : 'vdb-c-text-[#969696]'"
          >
            {{ nameLength }}/{{ NAME_LIMIT }}
          </div>
        </div>

        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[8px]">
          <label class="vdb-c-text-[16px] vdb-c-font-medium vdb-c-text-[#1E1E1E]">
            Description
          </label>
          <TextArea
            v-model="description"
            :maxlength="DESCRIPTION_LIMIT"
            placeholder="Collection description..."
            wrapper-class="vdb-c-min-h-[104px]"
            :error="isDescriptionAtLimit"
          />
          <div
            class="vdb-c-mt-[4px] vdb-c-text-right vdb-c-text-[14px] vdb-c-leading-[14px] vdb-c-tracking-[-0.24px]"
            :class="isDescriptionAtLimit ? 'vdb-c-text-[#E02424]' : 'vdb-c-text-[#969696]'"
          >
            {{ descriptionLength }}/{{ DESCRIPTION_LIMIT }}
          </div>
        </div>
      </section>

      <footer
        class="vdb-c-flex vdb-c-items-center vdb-c-justify-end vdb-c-gap-[10px] vdb-c-border-t vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-[20px] vdb-c-py-[12px]"
      >
        <button
          class="vdb-c-rounded-[8px] vdb-c-border vdb-c-border-[#D9D9D9] vdb-c-bg-white vdb-c-px-[16px] vdb-c-py-[12px] vdb-c-text-[14px] vdb-c-font-semibold vdb-c-text-[#1E1E1E] hover:vdb-c-bg-[#F2F2F2]"
          @click="handleCancel"
        >
          Cancel
        </button>
        <button
          :disabled="!canSubmit"
          class="vdb-c-rounded-[8px] vdb-c-px-[16px] vdb-c-py-[12px] vdb-c-text-[14px] vdb-c-font-semibold vdb-c-text-white"
          :class="
            canSubmit
              ? 'vdb-c-bg-[#EC5B16] hover:vdb-c-bg-[#d94e14]'
              : 'vdb-c-cursor-not-allowed vdb-c-bg-[#969696]'
          "
          @click="handleCreate"
        >
          Create
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import Input from './elements/BigInput.vue';
import TextArea from './elements/TextArea.vue';

const NAME_LIMIT = 50;
const DESCRIPTION_LIMIT = 250;

const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['cancel', 'create']);

const name = ref('');
const description = ref('');

const nameLength = computed(() => name.value.length);
const descriptionLength = computed(() => description.value.length);

const isNameAtLimit = computed(() => nameLength.value > NAME_LIMIT);
const isDescriptionAtLimit = computed(() => descriptionLength.value > DESCRIPTION_LIMIT);

const canSubmit = computed(() => {
  const hasName = name.value.trim().length > 0;
  return hasName && !isNameAtLimit.value && !isDescriptionAtLimit.value;
});

const handleCancel = () => {
  name.value = '';
  description.value = '';
  emit('cancel');
};

const handleCreate = () => {
  if (!canSubmit.value) return;
  emit('create', {
    name: name.value.trim(),
    description: description.value.trim(),
  });
  name.value = '';
  description.value = '';
};
</script>
