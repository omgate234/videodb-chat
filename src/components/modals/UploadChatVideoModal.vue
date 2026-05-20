<template>
  <div
    v-if="show"
    class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-[60] vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-bg-black/50 vdb-c-p-24"
    @click="onCancel"
  >
    <div
      class="vdb-c-shadow-xl vdb-c-m-10 vdb-c-w-[480px] vdb-c-rounded-lg vdb-c-bg-[#1F1F1F]"
      @click.stop
    >
      <div
        class="vdb-c-flex vdb-c-items-center vdb-c-justify-between vdb-c-p-24"
      >
        <h2 class="vdb-c-text-base vdb-c-font-semibold vdb-c-text-white">
          Add to Collection
        </h2>
        <button
          class="vdb-c-text-gray-400 hover:vdb-c-text-white"
          @click="onCancel"
        >
          <span class="material-symbols-outlined"> close </span>
        </button>
      </div>

      <div class="vdb-c-space-y-16 vdb-c-p-24 vdb-c-pt-0">
        <div>
          <label
            class="vdb-c-mb-8 vdb-c-block vdb-c-text-xs vdb-c-text-gray-400"
          >
            Name
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="Video name"
            class="vdb-c-w-full vdb-c-rounded-lg vdb-c-border vdb-c-border-[#424242] vdb-c-bg-[#0C0C0C] vdb-c-px-16 vdb-c-py-8 vdb-c-text-white placeholder:vdb-c-text-[#424242] focus:vdb-c-outline-none focus:vdb-c-ring-1 focus:vdb-c-ring-[#FF5B0A]"
            :disabled="uploading"
          />
        </div>

        <div>
          <label
            class="vdb-c-mb-8 vdb-c-block vdb-c-text-xs vdb-c-text-gray-400"
          >
            Stream URL
          </label>
          <div
            class="vdb-c-w-full vdb-c-overflow-hidden vdb-c-text-ellipsis vdb-c-rounded-lg vdb-c-border vdb-c-border-[#2C2C2C] vdb-c-bg-[#0C0C0C] vdb-c-px-16 vdb-c-py-8 vdb-c-text-xs vdb-c-text-gray-400"
          >
            {{ streamUrl }}
          </div>
        </div>

        <p v-if="error" class="vdb-c-text-xs vdb-c-text-red-400">
          {{ error }}
        </p>
      </div>

      <div
        class="vdb-c-flex vdb-c-items-center vdb-c-justify-end vdb-c-gap-12 vdb-c-border-t vdb-c-border-[#2C2C2C] vdb-c-p-24"
      >
        <button
          class="vdb-c-rounded-md vdb-c-px-16 vdb-c-py-8 vdb-c-text-sm vdb-c-text-gray-300 hover:vdb-c-text-white"
          :disabled="uploading"
          @click="onCancel"
        >
          Cancel
        </button>
        <button
          class="vdb-c-flex vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-md vdb-c-bg-[#FF5B0A] vdb-c-px-16 vdb-c-py-8 vdb-c-text-sm vdb-c-font-medium vdb-c-text-white hover:vdb-c-bg-[#E04F00] disabled:vdb-c-opacity-60"
          :disabled="uploading || !name.trim()"
          @click="onSubmit"
        >
          <span class="material-symbols-outlined" style="font-size: 18px"
            >cloud_upload</span
          >
          {{ uploading ? "Uploading…" : "Upload" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  show: { type: Boolean, default: false },
  defaultName: { type: String, default: "" },
  streamUrl: { type: String, required: true },
  uploading: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

const emit = defineEmits(["cancel", "submit"]);

const name = ref(props.defaultName);

watch(
  () => props.show,
  (val) => {
    if (val) name.value = props.defaultName;
  },
);

const onCancel = () => {
  if (props.uploading) return;
  emit("cancel");
};

const onSubmit = () => {
  if (props.uploading) return;
  emit("submit", { name: name.value.trim() });
};
</script>
