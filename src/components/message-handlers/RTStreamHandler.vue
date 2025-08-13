<template>
  <div class="vdb-c-w-full vdb-c-rounded-20 vdb-c-bg-[#F0F0F0] vdb-c-p-12">
    <!-- Shell -->
    <div class="vdb-c-flex vdb-c-gap-12">
      <!-- LEFT: Transcript -->
      <section
        class="vdb-c-shadow-sm vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-rounded-16 vdb-c-bg-white vdb-c-p-12"
      >
        <header class="vdb-c-mb-8 vdb-c-flex vdb-c-items-center vdb-c-gap-8">
          <span
            class="vdb-c-inline-block vdb-c-h-8 vdb-c-w-8 vdb-c-rounded-full vdb-c-bg-green-500"
          ></span>
          <h3
            class="vdb-c-text-14 vdb-c-font-semibold vdb-c-text-black vdb-c-underline"
          >
            LIVE TRANSCRIPT
          </h3>
        </header>

        <div
          class="vdb-c-max-h-[460px] vdb-c-min-h-[280px] vdb-c-flex-1 vdb-c-space-y-8 vdb-c-overflow-y-auto vdb-c-pr-4"
        >
          <div
            v-for="(line, idx) in content.transcript"
            :key="'t-' + idx"
            class="vdb-c-text-15 vdb-c-leading-[22px] vdb-c-text-black"
          >
            {{ line }}
          </div>
        </div>
      </section>

      <!-- MIDDLE: Summary (shown when toggled) -->
      <section
        v-if="showSummary"
        class="vdb-c-shadow-sm vdb-c-flex vdb-c-flex-1 vdb-c-flex-col vdb-c-rounded-16 vdb-c-bg-white vdb-c-p-12"
      >
        <header
          class="vdb-c-mb-8 vdb-c-flex vdb-c-items-center vdb-c-justify-between vdb-c-gap-12"
        >
          <h3
            class="vdb-c-text-14 vdb-c-font-semibold vdb-c-text-black vdb-c-underline"
          >
            ACTIVE SUMMARY
          </h3>
          <button
            class="vdb-c-grid vdb-c-h-24 vdb-c-w-24 vdb-c-place-items-center vdb-c-rounded-full vdb-c-text-[#6B7280] hover:vdb-c-text-black"
            @click="showSummary = false"
            aria-label="Close summary"
            title="Close"
          >
            ×
          </button>
        </header>

        <div
          class="vdb-c-max-h-[460px] vdb-c-min-h-[280px] vdb-c-flex-1 vdb-c-space-y-8 vdb-c-overflow-y-auto vdb-c-pr-4"
        >
          <div
            v-for="(line, idx) in content.summary"
            :key="'s-' + idx"
            class="vdb-c-text-15 vdb-c-leading-[22px] vdb-c-text-black"
          >
            {{ line }}
          </div>
        </div>
      </section>

      <!-- RIGHT: Controls when chat is closed -->
      <aside
        v-if="!showChat"
        class="vdb-c-flex vdb-c-w-[220px] vdb-c-shrink-0 vdb-c-flex-col vdb-c-gap-12"
      >
        <button
          class="vdb-c-shadow-sm vdb-c-text-14 vdb-c-w-full vdb-c-rounded-12 vdb-c-bg-black vdb-c-py-12 vdb-c-font-medium vdb-c-text-white hover:vdb-c-opacity-90"
          @click="toggleSummary"
        >
          {{ showSummary ? "Hide summary" : "Show live summary" }}
        </button>
        <button
          class="vdb-c-shadow-sm vdb-c-text-14 vdb-c-w-full vdb-c-rounded-12 vdb-c-bg-black vdb-c-py-12 vdb-c-font-medium vdb-c-text-white hover:vdb-c-opacity-90"
          @click="openChat"
        >
          Chat with meeting
        </button>
      </aside>

      <!-- RIGHT: Live Chat panel -->
      <section
        v-else
        class="vdb-c-flex vdb-c-w-[360px] vdb-c-shrink-0 vdb-c-flex-col vdb-c-rounded-20 vdb-c-bg-black vdb-c-p-12"
      >
        <header
          class="vdb-c-mb-12 vdb-c-flex vdb-c-items-center vdb-c-justify-between vdb-c-gap-12"
        >
          <h3
            class="vdb-c-text-14 vdb-c-font-semibold vdb-c-text-white vdb-c-underline"
          >
            LIVE CHAT
          </h3>
          <div class="vdb-c-flex vdb-c-items-center vdb-c-gap-8">
            <button
              class="vdb-c-text-12 vdb-c-h-28 vdb-c-rounded-12 vdb-c-bg-[#333333] vdb-c-px-12 vdb-c-font-medium vdb-c-text-white hover:vdb-c-opacity-90"
              @click="toggleSummary"
              :aria-pressed="showSummary"
            >
              {{ showSummary ? "Hide summary" : "Show summary" }}
            </button>
            <button
              class="vdb-c-grid vdb-c-h-24 vdb-c-w-24 vdb-c-place-items-center vdb-c-rounded-full vdb-c-text-gray-300 hover:vdb-c-text-white"
              @click="closeChat"
              aria-label="Close chat"
              title="Close"
            >
              ×
            </button>
          </div>
        </header>

        <!-- Messages -->
        <div
          ref="chatListRef"
          class="vdb-c-max-h-[420px] vdb-c-min-h-[260px] vdb-c-flex-1 vdb-c-space-y-8 vdb-c-overflow-y-auto vdb-c-rounded-16 vdb-c-bg-[#1A1A1A] vdb-c-p-12"
        >
          <div
            v-for="(msg, idx) in localChat"
            :key="'c-' + idx"
            class="vdb-c-mb-4 vdb-c-flex vdb-c-w-full"
            :class="
              msg.role === 'user' ? 'vdb-c-justify-end' : 'vdb-c-justify-start'
            "
          >
            <div
              class="vdb-c-text-14 vdb-c-max-w-[80%] vdb-c-rounded-[16px] vdb-c-px-12 vdb-c-py-8 vdb-c-leading-[20px] vdb-c-text-[#E8E8E8]"
              :class="[
                msg.role === 'user'
                  ? 'vdb-c-bg-[#333333]'
                  : 'vdb-c-bg-[#1F1F1F]',
                msg._optimistic ? 'vdb-c-opacity-70' : '',
              ]"
              :title="msg._optimistic ? 'Sending…' : null"
            >
              {{ msg.content }}
            </div>
          </div>
        </div>

        <!-- Input -->
        <form
          class="vdb-c-mt-12 vdb-c-flex vdb-c-items-center vdb-c-gap-8"
          @submit.prevent="handleSend"
        >
          <div
            class="vdb-c-flex vdb-c-flex-1 vdb-c-items-center vdb-c-rounded-16 vdb-c-bg-[#1A1A1A] vdb-c-py-8 vdb-c-pl-16 vdb-c-pr-8"
          >
            <input
              v-model="chatInput"
              type="text"
              class="vdb-c-text-14 vdb-c-w-full vdb-c-bg-transparent vdb-c-text-[#E8E8E8] vdb-c-outline-none placeholder:vdb-c-text-[#A0A0A0]"
              placeholder="Ask your bot"
            />
            <button
              type="submit"
              :disabled="
                !chatInput.trim() ||
                (localChat.length > 0 &&
                  localChat[localChat.length - 1].role === 'user')
              "
              class="vdb-c-grid vdb-c-h-32 vdb-c-w-32 vdb-c-place-items-center vdb-c-rounded-full vdb-c-bg-[#333333] vdb-c-text-white hover:vdb-c-opacity-90 disabled:vdb-c-cursor-not-allowed disabled:vdb-c-opacity-50"
              aria-label="Send message"
              title="Send"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M13.902 4.80005C13.7164 4.80005 13.5383 4.8738 13.4071 5.00507C13.2758 5.13635 13.202 5.3144 13.202 5.50005V8.30005C13.202 8.4857 13.1283 8.66375 12.997 8.79502C12.8657 8.9263 12.6877 9.00005 12.502 9.00005H5.78903L6.69903 8.09705C6.83084 7.96524 6.90489 7.78646 6.90489 7.60005C6.90489 7.41364 6.83084 7.23486 6.69903 7.10305C6.56721 6.97124 6.38844 6.89718 6.20203 6.89718C6.01562 6.89718 5.83684 6.97124 5.70503 7.10305L3.60503 9.20305C3.5413 9.26962 3.49134 9.34812 3.45803 9.43405C3.38801 9.60447 3.38801 9.79563 3.45803 9.96605C3.49134 10.052 3.5413 10.1305 3.60503 10.197L5.70503 12.297C5.7701 12.3627 5.84752 12.4147 5.93282 12.4503C6.01812 12.4858 6.10962 12.5041 6.20203 12.5041C6.29444 12.5041 6.38593 12.4858 6.47123 12.4503C6.55653 12.4147 6.63395 12.3627 6.69903 12.297C6.76464 12.232 6.81671 12.1546 6.85225 12.0693C6.88779 11.984 6.90609 11.8925 6.90609 11.8C6.90609 11.7076 6.88779 11.6161 6.85225 11.5308C6.81671 11.4455 6.76464 11.3681 6.69903 11.303L5.78903 10.4H12.502C13.059 10.4 13.5931 10.1788 13.987 9.78497C14.3808 9.39115 14.602 8.857 14.602 8.30005V5.50005C14.602 5.3144 14.5283 5.13635 14.397 5.00507C14.2657 4.8738 14.0877 4.80005 13.902 4.80005Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";

const props = defineProps({
  content: { type: Object, required: true },
  convId: { type: String, required: true },
  msgId: { type: String, required: true },
  sessionId: { type: String, required: true },
});

const emit = defineEmits(["send-chat-message"]);

const showSummary = ref(false);
const showChat = ref(false);
const chatInput = ref("");

// ===== optimistic chat buffer =====
const chatListRef = ref(null);
const localChat = ref(
  Array.isArray(props.content?.chat) ? [...props.content.chat] : [],
);

watch(
  () => props.content?.chat,
  (newVal) => {
    localChat.value = Array.isArray(newVal) ? [...newVal] : [];
    nextTick(scrollChatToBottom);
  },
  { immediate: true, deep: true },
);

function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;

  // 1) Optimistically append
  localChat.value = [
    ...localChat.value,
    { role: "user", content: text, _optimistic: true },
  ];
  nextTick(scrollChatToBottom);

  // 2) Emit; parent will feed back canonical chat
  emit("send-chat-message", text);

  // 3) Clear
  chatInput.value = "";
}

function scrollChatToBottom() {
  const el = chatListRef.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight;
}

// Buttons logic
function toggleSummary() {
  showSummary.value = !showSummary.value;
  nextTick(() => {
    if (showChat.value) scrollChatToBottom();
  });
}
function openChat() {
  showChat.value = true;
  nextTick(scrollChatToBottom);
}
function closeChat() {
  showChat.value = false;
}

watch(
  () => localChat.value.length,
  () => nextTick(scrollChatToBottom),
);
</script>
