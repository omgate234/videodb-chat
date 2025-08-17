<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-8 vdb-c-bg-white vdb-c-py-14 vdb-c-text-left"
  >
    <LoadingMessage
      v-if="!isUser"
      :status="
        isMainReponse && message.status === 'error' ? 'error' : content.status
      "
      :message="content?.status_message"
      :is-focused="isMainReponse"
      :is-last-conv="isLastConv"
    />

    <transition name="fade" mode="out-in">
      <div
        v-if="
          content.status === 'success' || content.status === 'error' || isUser
        "
        class="vdb-c-flex vdb-c-flex-col"
      >
        <p
          :class="[
            'markdown-body vdb-c-overflow-hidden vdb-c-text-kilvish-900',
            isUser ? 'vdb-c-font-semibold' : 'vdb-c-font-normal',
          ]"
          v-html="getMarkedMsg(text)"
        ></p>

        <!-- MCQ options -->
        <div
          v-if="
            !isUser &&
            content?.mcq_data &&
            Array.isArray(content.mcq_data.choices) &&
            content.mcq_data.choices.length
          "
          class="vdb-c-mt-12 vdb-c-flex vdb-c-flex-col vdb-c-gap-10"
        >
          <div
            class="vdb-c-text-[14px] vdb-c-font-medium vdb-c-text-kilvish-900"
          >
            {{ content.mcq_data.question }}
          </div>

          <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-8">
            <label
              v-for="choice in content.mcq_data.choices"
              :key="choice.id"
              class="vdb-c-flex vdb-c-cursor-pointer vdb-c-items-center vdb-c-gap-8 vdb-c-text-kilvish-900"
            >
              <input
                type="radio"
                class="vdb-c-h-16 vdb-c-w-16"
                name="mcq-radio-group"
                :value="choice.id"
                v-model="selectedOption"
                :disabled="isSendDisabled"
              />
              <span class="vdb-c-text-[14px] vdb-c-font-normal">
                <span class="vdb-c-mr-6 vdb-c-font-medium"
                  >{{ choice.label }}.</span
                >
                {{ choice.text }}
              </span>
            </label>
          </div>

          <div class="vdb-c-mt-4">
            <button
              :disabled="isSendDisabled"
              :class="[
                'vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-lg vdb-c-px-16 vdb-c-py-8 vdb-c-transition-colors vdb-c-duration-300 vdb-c-ease-in-out',
                isSendDisabled
                  ? 'vdb-c-cursor-not-allowed vdb-c-bg-kilvish-400 vdb-c-text-white hover:vdb-c-bg-kilvish-400'
                  : 'vdb-c-bg-orange vdb-c-text-white hover:vdb-c-bg-orange-400',
              ]"
              @click="onSendMCQ"
            >
              Send
            </button>
          </div>
        </div>
      </div>
      <div
        v-else-if="content.status === 'progress'"
        class="vdb-c-flex-start vdb-c-flex vdb-c-flex-col"
      >
        <div
          class="vdb-c-mb-2 vdb-c-h-16 vdb-c-w-3/4 vdb-c-animate-pulse vdb-c-rounded vdb-c-bg-gray-200"
        ></div>
        <div
          class="vdb-c-mb-2 vdb-c-h-16 vdb-c-w-1/2 vdb-c-animate-pulse vdb-c-rounded vdb-c-bg-gray-200"
        ></div>
        <div
          class="vdb-c-h-16 vdb-c-w-2/3 vdb-c-animate-pulse vdb-c-rounded vdb-c-bg-gray-200"
        ></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import Prism from "prismjs";
import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-python";
import LoadingMessage from "./elements/LoadingMessage.vue";
import { useVideoDBChat } from "../../context.js";
const options = {
  nonStandard: true,
};

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  isUser: {
    type: Boolean,
    default: false,
  },
  mediaTypesObject: {
    type: Object,
    default: () => ({}),
  },
  isLastConv: {
    type: Boolean,
    default: false,
  },
  convId: {
    type: String,
    default: "",
  },
  msgId: {
    type: String,
    default: "",
  },
});

const text = computed(() => props.content?.text || "");
const { conversations, addMessage } = useVideoDBChat();

marked.setOptions({
  highlight: function (code, lang) {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    }
    return code; // Fallback
  },
});

const getMarkedMsg = (msg) => {
  marked.use(markedKatex(options));
  return marked.parse(msg);
};

const isMainReponse = computed(() => props.content.agent_name === "assistant");

const message = computed(() => {
  return conversations?.[props.convId]?.[props.msgId];
});

// MCQ state
const hasSentMCQ = ref(false);
const selectedOption = ref("");

// Initialize default choice when mcq_data present
watch(
  () => props.content?.mcq_data,
  (mcq) => {
    if (mcq && mcq.default_choice && !selectedOption.value) {
      selectedOption.value = mcq.default_choice;
    }
  },
  { immediate: true },
);

const isSendDisabled = computed(() => {
  const notLastConversation = !props.isLastConv;
  const alreadySent = hasSentMCQ.value;
  const nothingSelected = !selectedOption.value;
  return notLastConversation || alreadySent || nothingSelected;
});

const onSendMCQ = () => {
  if (isSendDisabled.value) return;
  const mcq = props.content?.mcq_data || {};
  const choices = Array.isArray(mcq.choices) ? mcq.choices : [];
  const choice = choices.find((c) => c.id === selectedOption.value);
  if (!choice) return;

  const agent = props.content?.agent_name || "assistant";
  const messageText = `@${agent} For the question ${mcq.question} I select option ${choice.label}`;

  addMessage?.({
    content: [{ type: "text", text: messageText }],
    additional_data: {
      response_type: "clarify_question_mcq_answer",
      cid: choice.id,
      label: choice.label,
      delta: choice.delta ?? {},
    },
  });
  hasSentMCQ.value = true;
};
</script>

<style>
.vdb-c-readMoreGradient {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 1) 100%
  );
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
