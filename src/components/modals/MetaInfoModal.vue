<template>
  <div
    v-if="showModal"
    class="vdb-c-fixed vdb-c-inset-0 vdb-c-z-[10001] vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-bg-black/50"
    @click="$emit('close')"
  >
    <div
      class="vdb-c-shadow-xl vdb-c-m-10 vdb-c-flex vdb-c-w-full vdb-c-max-w-[572px] vdb-c-flex-col vdb-c-overflow-hidden vdb-c-rounded-[20px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-white"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-bg-white vdb-c-p-[20px]">
        <div class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center">
          <p
            class="vdb-c-text-nowrap vdb-c-text-[20px] vdb-c-font-semibold vdb-c-leading-[24px] vdb-c-text-[#1e1e1e]"
          >
            Meta Information for "{{ videoName }}"
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="vdb-c-flex vdb-c-h-[24px] vdb-c-w-[24px] vdb-c-cursor-pointer vdb-c-items-center vdb-c-justify-center vdb-c-transition-opacity hover:vdb-c-opacity-70"
        >
          <Cross fill="#000000" />
        </button>
      </div>

      <!-- Modal Content -->
      <div
        class="vdb-c-flex vdb-c-max-h-[600px] vdb-c-w-full vdb-c-flex-col vdb-c-gap-[20px] vdb-c-overflow-y-auto vdb-c-border-t vdb-c-border-[#efefef] vdb-c-bg-white vdb-c-p-[20px]"
      >
        <!-- No Metadata Message -->
        <div
          v-if="!hasAnyMetadata"
          class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-justify-center vdb-c-py-[40px]"
        >
          <p class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-[#969696]">
            No metadata available for this video.
          </p>
        </div>
        <!-- Cast Section -->
        <div
          v-if="actors && actors.length > 0"
          class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-overflow-hidden vdb-c-rounded-[10px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-white"
        >
          <div
            class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[4px] vdb-c-rounded-tl-[10px] vdb-c-rounded-tr-[10px] vdb-c-bg-[#f7f7f7] vdb-c-py-[8px] vdb-c-pl-[12px] vdb-c-pr-[16px]"
          >
            <StarIcon fill="#242424" />
            <p class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-black">
              Cast
            </p>
          </div>
          <div class="vdb-c-h-[1px] vdb-c-w-full vdb-c-bg-[#e5e7eb]"></div>
          <div
            class="vdb-c-flex vdb-c-w-full vdb-c-flex-wrap vdb-c-items-center vdb-c-gap-[8px] vdb-c-px-[16px] vdb-c-py-[12px]"
          >
            <div
              v-for="(actor, index) in actors"
              :key="index"
              class="vdb-c-flex vdb-c-items-center vdb-c-overflow-hidden vdb-c-rounded-[48px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-[#f7f7f7]"
            >
              <div
                class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-px-[20px] vdb-c-py-[6px]"
              >
                <p
                  class="vdb-c-text-nowrap vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-tracking-[0.065px] vdb-c-text-[#2d2d2d]"
                >
                  {{ actor }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Objects Section -->
        <div
          v-if="objects && objects.length > 0"
          class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-overflow-hidden vdb-c-rounded-[10px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-white"
        >
          <div
            class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[4px] vdb-c-rounded-tl-[10px] vdb-c-rounded-tr-[10px] vdb-c-bg-[#f7f7f7] vdb-c-py-[8px] vdb-c-pl-[12px] vdb-c-pr-[16px]"
          >
            <ObjectIcon fill="#242424" />
            <p class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-black">
              Objects
            </p>
          </div>
          <div class="vdb-c-h-[1px] vdb-c-w-full vdb-c-bg-[#e5e7eb]"></div>
          <div
            class="vdb-c-flex vdb-c-w-full vdb-c-flex-wrap vdb-c-items-center vdb-c-gap-[8px] vdb-c-px-[16px] vdb-c-py-[12px]"
          >
            <div
              v-for="(object, index) in objects"
              :key="index"
              class="vdb-c-flex vdb-c-items-center vdb-c-overflow-hidden vdb-c-rounded-[48px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-[#f7f7f7]"
            >
              <div
                class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-px-[20px] vdb-c-py-[6px]"
              >
                <p
                  class="vdb-c-text-nowrap vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-tracking-[0.065px] vdb-c-text-[#2d2d2d]"
                >
                  {{ capitalizeFirst(object) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Emotions Section -->
        <div
          v-if="emotions && emotions.length > 0"
          class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-overflow-hidden vdb-c-rounded-[10px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-white"
        >
          <div
            class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[4px] vdb-c-rounded-tl-[10px] vdb-c-rounded-tr-[10px] vdb-c-bg-[#f7f7f7] vdb-c-py-[8px] vdb-c-pl-[12px] vdb-c-pr-[16px]"
          >
            <EmotionsIcon fill="#242424" />
            <p class="vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-black">
              Emotions
            </p>
          </div>
          <div class="vdb-c-h-[1px] vdb-c-w-full vdb-c-bg-[#e5e7eb]"></div>
          <div
            class="vdb-c-flex vdb-c-w-full vdb-c-flex-wrap vdb-c-items-center vdb-c-gap-[8px] vdb-c-px-[16px] vdb-c-py-[12px]"
          >
            <div
              v-for="(emotion, index) in emotions"
              :key="index"
              class="vdb-c-flex vdb-c-items-center vdb-c-overflow-hidden vdb-c-rounded-[48px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-[#f7f7f7] vdb-c-px-[16px]"
            >
              <div class="vdb-c-flex vdb-c-items-center vdb-c-px-0 vdb-c-py-[6px]">
                <p
                  class="vdb-c-text-nowrap vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-tracking-[0.065px] vdb-c-text-[#2d2d2d]"
                >
                  {{ capitalizeFirst(emotion) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Shot Type Section -->
        <div
          v-if="shotTypes && shotTypes.length > 0"
          class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-overflow-hidden vdb-c-rounded-[10px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-white"
        >
          <div
            class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[4px] vdb-c-rounded-tl-[10px] vdb-c-rounded-tr-[10px] vdb-c-bg-[#f7f7f7] vdb-c-py-[8px] vdb-c-pl-[12px] vdb-c-pr-[16px]"
          >
            <ShotTypeIcon fill="#242424" />
            <p class="vdb-c-text-[15px] vdb-c-font-medium vdb-c-leading-normal vdb-c-text-black">
              Shot Type
            </p>
          </div>
          <div class="vdb-c-h-[1px] vdb-c-w-full vdb-c-bg-[#e5e7eb]"></div>
          <div
            class="vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-items-start vdb-c-px-[16px] vdb-c-py-[12px]"
          >
            <div
              v-for="(shotType, index) in shotTypes"
              :key="index"
              class="vdb-c-flex vdb-c-items-center vdb-c-overflow-hidden vdb-c-rounded-[48px] vdb-c-border vdb-c-border-[#efefef] vdb-c-bg-[#f7f7f7] vdb-c-px-[16px]"
            >
              <div class="vdb-c-flex vdb-c-items-center vdb-c-px-0 vdb-c-py-[6px]">
                <p
                  class="vdb-c-text-nowrap vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[19.5px] vdb-c-tracking-[0.065px] vdb-c-text-[#2d2d2d]"
                >
                  {{ formatShotType(shotType) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Cross from '../icons/Cross.vue';
import StarIcon from '../chat/v2/icons/deep-search/StarIcon.vue';
import ObjectIcon from '../chat/v2/icons/deep-search/ObjectIcon.vue';
import EmotionsIcon from '../chat/v2/icons/deep-search/EmotionsIcon.vue';
import ShotTypeIcon from '../chat/v2/icons/deep-search/ShotTypeIcon.vue';

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false,
  },
  video: {
    type: Object,
    default: null,
  },
});

defineEmits(['close']);

const videoName = computed(() => {
  const name = props.video?.name || 'Untitled';
  if (name.length > 15) {
    return name.substring(0, 15) + '...';
  }
  return name;
});

const actors = computed(() => {
  return props.video?.metadata?.source?.actors || ['Mark armelis'];
});

const objects = computed(() => {
  return props.video?.metadata?.source?.objects || [];
});

const emotions = computed(() => {
  const emotion = props.video?.metadata?.source?.emotion;
  if (!emotion) return [];
  return Array.isArray(emotion) ? emotion : [emotion];
});

const shotTypes = computed(() => {
  const shotType = props.video?.metadata?.source?.shot_type;
  if (!shotType) return [];
  return Array.isArray(shotType) ? shotType : [shotType];
});

const hasAnyMetadata = computed(() => {
  return (
    (actors.value && actors.value.length > 0) ||
    (objects.value && objects.value.length > 0) ||
    (emotions.value && emotions.value.length > 0) ||
    (shotTypes.value && shotTypes.value.length > 0)
  );
});

const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatShotType = (shotType) => {
  if (!shotType) return '';
  return shotType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
</script>
