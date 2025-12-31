<template>
  <div
    ref="footerRef"
    :style="{ width: `${width}px` }"
    :class="[
      'vdb-c-fixed vdb-c-bottom-0 vdb-c-left-0 vdb-c-flex vdb-c-h-[73px] vdb-c-items-center vdb-c-justify-center vdb-c-bg-vdb-lightgrey hover:vdb-c-bg-[#EFEFEF]',
      { '!vdb-c-bg-[#FFE9D3]': active },
    ]"
  >
    <button
      v-if="user"
      @click="$emit('profile-click')"
      :class="[
        'vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-items-center vdb-c-gap-8 vdb-c-px-14 vdb-c-py-12 vdb-c-transition-all vdb-c-duration-200',
        {
          'vdb-c-bg-[#FFE9D3]': active,
        },
      ]"
    >
      <div
        v-if="user.photoUrl"
        class="vdb-c-h-30 vdb-c-w-30 vdb-c-flex-shrink-0 vdb-c-overflow-hidden vdb-c-rounded-full"
      >
        <img
          :src="user.photoUrl"
          :alt="user.name"
          class="vdb-c-h-full vdb-c-w-full vdb-c-object-cover"
        />
      </div>
      <div
        v-else
        class="vdb-c-flex vdb-c-h-30 vdb-c-w-30 vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[#ff7e32] vdb-c-text-[11px] vdb-c-font-semibold vdb-c-leading-[15.62px] vdb-c-text-white"
      >
        {{ userInitials }}
      </div>

      <div class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center vdb-c-overflow-hidden">
        <span
          class="vdb-c-truncate vdb-c-text-sm vdb-c-font-medium vdb-c-leading-5 vdb-c-text-vdb-darkishgrey"
        >
          {{ user.name }}
        </span>
      </div>

      <ChevronRightIcon stroke-color="#1E1E1E" class="vdb-c-flex-shrink-0" />
    </button>

    <Teleport to="body">
      <div
        v-if="active"
        id="footer-modal"
        :class="['vdb-c-absolute vdb-c-inset-0 vdb-c-z-40']"
        @click="$emit('profile-click')"
      ></div>
      <div
        v-if="active"
        :style="{
          bottom: `12px`,
          left: `${position.left}px`,
        }"
        class="vdb-c-fixed vdb-c-z-50 vdb-c-flex vdb-c-min-w-[254px] vdb-c-flex-col vdb-c-gap-[4px] vdb-c-rounded-12 vdb-c-border vdb-c-border-[#EFEFEF] vdb-c-bg-white vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-shadow-[0px_23px_6px_0px_rgba(0,0,0,0),0px_15px_6px_0px_rgba(0,0,0,0.01),0px_8px_5px_0px_rgba(0,0,0,0.02),0px_4px_4px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.03)]"
        @click.stop
      >
        <div
          v-if="user"
          class="vdb-c-flex vdb-c-items-center vdb-c-gap-[8px] vdb-c-rounded-[10px] vdb-c-px-[10px] vdb-c-py-[6px]"
        >
          <div
            v-if="user.photoUrl"
            class="vdb-c-h-[36px] vdb-c-w-[36px] vdb-c-flex-shrink-0 vdb-c-overflow-hidden vdb-c-rounded-full"
          >
            <img
              :src="user.photoUrl"
              :alt="user.name"
              class="vdb-c-h-full vdb-c-w-full vdb-c-object-cover"
            />
          </div>
          <div
            v-else
            class="vdb-c-flex vdb-c-h-[36px] vdb-c-w-[36px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[#ff7e32] vdb-c-text-[11px] vdb-c-font-semibold vdb-c-leading-[15.62px] vdb-c-text-white"
          >
            {{ userInitials }}
          </div>

          <div class="vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-overflow-hidden">
            <span
              class="vdb-c-truncate vdb-c-text-[14px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1e1e1e]"
            >
              {{ user.name }}
            </span>
            <span
              v-if="user.email"
              class="vdb-c-truncate vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#969696]"
            >
              {{ user.email }}
            </span>
          </div>
        </div>

        <div
          v-if="user && (section1Buttons.length > 0 || section2Buttons.length > 0)"
          class="vdb-c-h-0 vdb-c-w-full vdb-c-border-t vdb-c-border-[#EFEFEF]"
        ></div>

        <div v-if="section1Buttons.length > 0" class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[1px]">
          <template v-for="(button, index) in section1Buttons" :key="index">
            <button
              v-if="button.type === 'button'"
              @click="handleButtonClick(button)"
              class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[6px] vdb-c-rounded-[10px] vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#F5F5F5]"
            >
              <div
                v-if="button.icon && isValidComponent(button.icon)"
                class="vdb-c-flex vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center"
              >
                <component
                  :is="button.icon"
                  :stroke-color="button.variant === 'danger' ? '#E2462C' : '#1E1E1E'"
                />
              </div>
              <span
                :class="[
                  'vdb-c-flex-1 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px]',
                  button.variant === 'danger' ? 'vdb-c-text-[#E2462C]' : 'vdb-c-text-[#1e1e1e]',
                ]"
              >
                {{ button.label }}
              </span>
            </button>
            <a
              v-else-if="button.type === 'link'"
              :href="button.href"
              :target="button.target || '_blank'"
              rel="noopener noreferrer"
              @click="$emit('profile-click')"
              class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[6px] vdb-c-rounded-[10px] vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-text-left vdb-c-no-underline vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#F5F5F5]"
            >
              <div
                v-if="button.icon && isValidComponent(button.icon)"
                class="vdb-c-flex vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center"
              >
                <component
                  :is="button.icon"
                  :stroke-color="button.variant === 'danger' ? '#E2462C' : '#1E1E1E'"
                />
              </div>
              <span
                :class="[
                  'vdb-c-flex-1 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px]',
                  button.variant === 'danger' ? 'vdb-c-text-[#E2462C]' : 'vdb-c-text-[#1e1e1e]',
                ]"
              >
                {{ button.label }}
              </span>
            </a>
          </template>
        </div>

        <div
          v-if="section1Buttons.length > 0"
          class="vdb-c-h-0 vdb-c-w-full vdb-c-border-t vdb-c-border-[#EFEFEF]"
        ></div>

        <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[1px]">
          <button
            @click="handleCustomizeAgentsClick"
            class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[6px] vdb-c-rounded-[10px] vdb-c-bg-white vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#EFEFEF]"
          >
            <div
              class="vdb-c-flex vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center"
            >
              <CustomizeAgentsIcon fill="#1E1E1E" />
            </div>
            <span
              class="vdb-c-flex-1 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1e1e1e]"
            >
              Customize Agents
            </span>
          </button>
          <button
            @click="handleCostAnalyticsClick"
            class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[6px] vdb-c-rounded-[10px] vdb-c-bg-white vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#EFEFEF]"
          >
            <div
              class="vdb-c-flex vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.33334 16.6667V10M10 16.6667V3.33337M16.6667 16.6667V8.33337"
                  stroke="#1E1E1E"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span
              class="vdb-c-flex-1 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px] vdb-c-text-[#1e1e1e]"
            >
              Cost Analytics
            </span>
          </button>
        </div>

        <div
          v-if="section2Buttons.length > 0"
          class="vdb-c-h-0 vdb-c-w-full vdb-c-border-t vdb-c-border-[#EFEFEF]"
        ></div>

        <div v-if="section2Buttons.length > 0" class="vdb-c-flex vdb-c-flex-col vdb-c-gap-[1px]">
          <template v-for="(button, index) in section2Buttons" :key="index">
            <button
              v-if="button.type === 'button'"
              @click="handleButtonClick(button)"
              class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[6px] vdb-c-rounded-[10px] vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-text-left vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#F5F5F5]"
            >
              <div
                v-if="button.icon && isValidComponent(button.icon)"
                class="vdb-c-flex vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center"
              >
                <component
                  :is="button.icon"
                  :stroke-color="button.variant === 'danger' ? '#E2462C' : '#1E1E1E'"
                />
              </div>
              <span
                :class="[
                  'vdb-c-flex-1 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px]',
                  button.variant === 'danger' ? 'vdb-c-text-[#E2462C]' : 'vdb-c-text-[#1e1e1e]',
                ]"
              >
                {{ button.label }}
              </span>
            </button>
            <a
              v-else-if="button.type === 'link'"
              :href="button.href"
              :target="button.target || '_blank'"
              rel="noopener noreferrer"
              @click="$emit('profile-click')"
              class="vdb-c-flex vdb-c-w-full vdb-c-items-center vdb-c-gap-[6px] vdb-c-rounded-[10px] vdb-c-px-[10px] vdb-c-py-[8px] vdb-c-text-left vdb-c-no-underline vdb-c-transition-all vdb-c-duration-200 hover:vdb-c-bg-[#F5F5F5]"
            >
              <div
                v-if="button.icon && isValidComponent(button.icon)"
                class="vdb-c-flex vdb-c-h-[20px] vdb-c-w-[20px] vdb-c-flex-shrink-0 vdb-c-items-center vdb-c-justify-center"
              >
                <component
                  :is="button.icon"
                  :stroke-color="button.variant === 'danger' ? '#E2462C' : '#1E1E1E'"
                />
              </div>
              <span
                :class="[
                  'vdb-c-flex-1 vdb-c-text-[13px] vdb-c-font-medium vdb-c-leading-[20px]',
                  button.variant === 'danger' ? 'vdb-c-text-[#E2462C]' : 'vdb-c-text-[#1e1e1e]',
                ]"
              >
                {{ button.label }}
              </span>
            </a>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, watch, ref, onUnmounted, inject } from 'vue';
import ChevronRightIcon from './icons/ChevronRightIcon.vue';
import CustomizeAgentsIcon from './icons/CustomizeAgentsIcon.vue';

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
  width: {
    type: Number,
    default: 260,
  },
  buttons: {
    type: Array,
    default: () => [],
  },
  active: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['profile-click']);

const chatContext = inject('videodb-chat-context', null);

const footerRef = ref(null);
const position = ref({ bottom: 0, left: 0 });

const userInitials = computed(() => {
  if (!props.user || !props.user.name) return 'U';

  const names = props.user.name.trim().split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return names[0][0].toUpperCase();
});

const section1Buttons = computed(() => {
  return props.buttons.filter((button) => button.section === 1);
});

const section2Buttons = computed(() => {
  return props.buttons.filter((button) => button.section === 2);
});

const isValidComponent = (component) => {
  if (!component) return false;
  return typeof component === 'object' || typeof component === 'function';
};

const handleButtonClick = (button) => {
  if (button.onClick) {
    button.onClick();
  }
  emit('profile-click');
};

const handleCustomizeAgentsClick = () => {
  if (chatContext?.handleOpenCustomizeAgentsDrawer) {
    chatContext.handleOpenCustomizeAgentsDrawer();
  }
  emit('profile-click');
};

const handleCostAnalyticsClick = () => {
  if (chatContext?.handleOpenCostDrawer) {
    chatContext.handleOpenCostDrawer();
  }
  emit('profile-click');
};

const updatePosition = () => {
  if (footerRef.value) {
    try {
      const rect = footerRef.value.getBoundingClientRect();
      position.value = {
        bottom: rect.bottom - 12,
        left: rect.right - 24,
      };
    } catch (error) {
      console.warn('Error calculating position:', error);
    }
  }
};

watch(
  () => props.active,
  (newValue) => {
    if (newValue) {
      updatePosition();
    }
  },
  { immediate: true }
);

watch(
  () => props.active,
  (val) => {
    if (val) {
      window.addEventListener('resize', updatePosition);
    } else {
      window.removeEventListener('resize', updatePosition);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  window.removeEventListener('resize', updatePosition);
});
</script>
