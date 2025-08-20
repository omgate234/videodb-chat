<template>
  <div
    v-if="show"
    class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-[70] vdb-c-flex vdb-c-items-center vdb-c-justify-center"
    @click="handleBackdropClick"
    :style="backdropStyle"
  >
    <div
      class="vdb-c-relative vdb-c-flex vdb-c-h-[80vh] vdb-c-w-[50vw] vdb-c-flex-col vdb-c-overflow-hidden vdb-c-rounded-20 vdb-c-bg-white vdb-c-text-[#242424] vdb-c-outline vdb-c-outline-1 vdb-c-outline-[#E5E7EB]"
      @click.stop
    >
      <!-- Header -->
      <div
        class="vdb-c-flex vdb-c-items-center vdb-c-justify-between vdb-c-border-b vdb-c-border-[#E5E7EB] vdb-c-px-20 vdb-c-py-16"
      >
        <h2 class="vdb-c-text-[18px] vdb-c-font-semibold">
          Edit Meta Information
        </h2>
        <button @click="emit('close')" aria-label="Close" title="Close">
          <CrossIcon
            fill="#000"
            class="vdb-c-h-20 vdb-c-w-20 vdb-c-text-black"
          />
        </button>
      </div>

      <!-- Content -->
      <div
        class="vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-gap-16 vdb-c-overflow-auto vdb-c-p-20"
      >
        <template v-if="hasMetadata">
          <!-- Actors -->
          <section
            v-if="localActors.length"
            class="vdb-c-rounded-[10px] vdb-c-border vdb-c-border-[#EFEFEF]"
          >
            <header
              class="vdb-c-flex vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-t-[10px] vdb-c-border-b vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-16 vdb-c-py-12"
            >
              <StarOutlined
                class="vdb-c-h-24 vdb-c-w-24 vdb-c-text-[#242424]"
              />
              <h3 class="vdb-c-text-[16px] vdb-c-font-semibold">Actors</h3>
            </header>
            <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-12 vdb-c-p-16">
              <div
                v-for="(actor, idx) in localActors"
                :key="idx"
                class="vdb-c-flex vdb-c-items-center vdb-c-gap-12"
              >
                <div
                  class="vdb-c-flex vdb-c-aspect-square vdb-c-h-28 vdb-c-w-28 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[#D9D9D9]"
                >
                  <PersonIcon class="vdb-c-h-16 vdb-c-w-16 vdb-c-text-white" />
                </div>
                <ModalInput v-model="localActors[idx]" />
              </div>
            </div>
          </section>

          <!-- Objects -->
          <section
            class="vdb-c-rounded-[10px] vdb-c-border vdb-c-border-[#EFEFEF]"
          >
            <header
              class="vdb-c-flex vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-t-[10px] vdb-c-border-b vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-16 vdb-c-py-12"
            >
              <ObjectIcon class="vdb-c-h-24 vdb-c-w-24 vdb-c-text-[#242424]" />
              <h3 class="vdb-c-text-[16px] vdb-c-font-semibold">Objects</h3>
            </header>
            <div class="vdb-c-flex vdb-c-flex-wrap vdb-c-gap-12 vdb-c-p-16">
              <div
                v-for="(obj, idx) in localObjects"
                :key="idx"
                class="vdb-c-min-w-[180px] vdb-c-basis-[calc(25%-9px)]"
              >
                <ModalInput v-model="localObjects[idx]" />
              </div>
            </div>
          </section>

          <!-- Emotions -->
          <section
            class="vdb-c-rounded-[10px] vdb-c-border vdb-c-border-[#EFEFEF]"
          >
            <header
              class="vdb-c-flex vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-t-[10px] vdb-c-border-b vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-16 vdb-c-py-12"
            >
              <EmotionIcon class="vdb-c-h-24 vdb-c-w-24 vdb-c-text-[#242424]" />
              <h3 class="vdb-c-text-[16px] vdb-c-font-semibold">Emotions</h3>
            </header>
            <div class="vdb-c-p-16">
              <ModalInput v-model="localEmotion" placeholder="Enter emotion" />
            </div>
          </section>

          <!-- Shot Type -->
          <section
            class="vdb-c-rounded-[10px] vdb-c-border vdb-c-border-[#EFEFEF]"
          >
            <header
              class="vdb-c-flex vdb-c-items-center vdb-c-gap-8 vdb-c-rounded-t-[10px] vdb-c-border-b vdb-c-border-[#EFEFEF] vdb-c-bg-[#F7F7F7] vdb-c-px-16 vdb-c-py-12"
            >
              <ShotIcon class="vdb-c-h-24 vdb-c-w-24 vdb-c-text-[#242424]" />
              <h3 class="vdb-c-text-[16px] vdb-c-font-semibold">Shot Type</h3>
            </header>
            <div class="vdb-c-p-16">
              <ModalInput
                v-model="localShotType"
                placeholder="Enter shot type"
              />
            </div>
          </section>
        </template>
        <template v-else>
          <div class="vdb-c-text-[#6B7280]">No metadata available.</div>
        </template>
      </div>

      <!-- Footer -->
      <div
        class="vdb-c-flex vdb-c-justify-end vdb-c-gap-12 vdb-c-border-t vdb-c-border-[#E5E7EB] vdb-c-p-16"
      >
        <Button
          variant="tertiary"
          class="!vdb-c-px-20 !vdb-c-py-8"
          :disabled="!hasMetadata"
          @click="emit('save')"
        >
          Save
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import Button from "../buttons/Button.vue";
import CrossIcon from "../icons/Cross.vue";
import ModalInput from "../atoms/ModalInput.vue";
import PersonIcon from "../icons/PersonIcon.vue";
import ObjectIcon from "../icons/ObjectIcon.vue";
import EmotionIcon from "../icons/EmotionIcon.vue";
import ShotIcon from "../icons/ShotIcon.vue";
import StarOutlined from "../icons/StarOutlined.vue";

const emit = defineEmits(["close", "save"]);

const props = defineProps({
  show: { type: Boolean, default: false },
  metadata: { type: [Object, null], default: null },
});

const hasMetadata = computed(() => !!props.metadata);

// Local editable state derived from incoming metadata
const localActors = ref([]);
const localObjects = ref([]);
const localEmotion = ref("");
const localShotType = ref("");
const localIsSong = ref(false);

// Formatting helpers
const toTitleCase = (value) => {
  if (typeof value !== "string") return "";
  return value
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

const humanize = (value) => {
  if (typeof value !== "string") return "";
  return toTitleCase(value.replace(/_/g, " "));
};

watch(
  () => props.metadata,
  (val) => {
    if (!val) return;
    localActors.value = Array.isArray(val.actors)
      ? val.actors.map((n) => toTitleCase(String(n)))
      : [];
    localObjects.value = Array.isArray(val.objects) ? [...val.objects] : [];
    localEmotion.value = humanize(val.emotion);
    localShotType.value = humanize(val.shot_type);
    localIsSong.value = Boolean(val.is_song);
  },
  { immediate: true },
);

const backdropStyle = {
  background: "rgba(0, 0, 0, 0.60)",
  backdropFilter: "blur(7.5px)",
};

const handleBackdropClick = () => {
  emit("close");
};
</script>
