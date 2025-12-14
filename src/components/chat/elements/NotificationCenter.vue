<template>
  <div
    class="vdb-c-pointer-events-none vdb-c-fixed vdb-c-left-1/2 vdb-c-top-20 vdb-c-z-50 vdb-c-flex -vdb-c-translate-x-1/2 vdb-c-flex-col vdb-c-gap-10"
  >
    <TransitionGroup name="notification" tag="div" class="vdb-c-flex vdb-c-flex-col vdb-c-gap-10">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="vdb-c-pointer-events-auto vdb-c-flex vdb-c-transform vdb-c-items-center vdb-c-rounded-[8px] vdb-c-text-base vdb-c-font-medium"
        :class="{
          'vdb-c-shadow-sm vdb-c-border vdb-c-border-vdb-green vdb-c-bg-green-50 vdb-c-px-20 vdb-c-py-10 vdb-c-text-black':
            notification.type === 'success',
          'vdb-c-gap-[10px] vdb-c-border vdb-c-border-[#E02424] vdb-c-bg-[#FDF2F2] vdb-c-py-[10px] vdb-c-pl-[10px] vdb-c-pr-[12px] vdb-c-text-black vdb-c-shadow-[0px_122px_34px_0px_rgba(0,0,0,0),0px_78px_31px_0px_rgba(0,0,0,0.01),0px_44px_26px_0px_rgba(0,0,0,0.02),0px_20px_20px_0px_rgba(0,0,0,0.03),0px_5px_11px_0px_rgba(0,0,0,0.04)]':
            notification.type === 'error',
        }"
        role="alert"
      >
        <div
          v-if="notification.icon"
          class="vdb-c-flex vdb-c-shrink-0 vdb-c-items-center vdb-c-justify-center"
          :class="{
            'vdb-c-w-24': notification.type === 'success',
          }"
        >
          <component :is="notification.icon" class="" />
        </div>
        <span
          class="vdb-c-text-[16px] vdb-c-font-medium vdb-c-leading-normal vdb-c-tracking-[0.08px]"
          :class="{
            'vdb-c-text-sm md:vdb-c-text-base': notification.type === 'success',
          }"
        >
          {{ notification.message }}
        </span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const notifications = ref([]);
let notificationId = 0;

const addNotification = (message, { type = 'success', icon = null, duration = 5000 } = {}) => {
  const id = notificationId++;
  const notification = {
    id,
    message,
    type,
    icon,
  };

  notifications.value.push(notification);

  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, duration);
};

defineExpose({
  addNotification,
});
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-30px) translateX(-50%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-30px) translateX(-50%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>
