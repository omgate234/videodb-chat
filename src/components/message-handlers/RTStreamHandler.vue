<template>
  <div class="rtstream-tabs-container">
    <div class="rtstream-tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="['rtstream-tab', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>
    <div class="rtstream-tab-content">
      <div v-if="activeTab === 'Transcript'" class="rtstream-column">
        <h3>Transcript</h3>
        <div class="rtstream-list">
          <div
            v-for="(line, idx) in content.transcript"
            :key="'t-' + idx"
            class="rtstream-line"
          >
            {{ line }}
          </div>
        </div>
      </div>
      <div v-else-if="activeTab === 'Summary'" class="rtstream-column">
        <h3>Summary</h3>
        <div class="rtstream-list">
          <div
            v-for="(line, idx) in content.summary"
            :key="'s-' + idx"
            class="rtstream-line"
          >
            {{ line }}
          </div>
        </div>
      </div>
      <div v-else-if="activeTab === 'Chat'" class="rtstream-column">
        <h3>Chat</h3>
        <div class="rtstream-list chat-list vdb-c-text-black">
          <div
            v-for="(msg, idx) in content.chat"
            :key="'c-' + idx"
            :class="['chat-message', msg.role]"
          >
            <span class="chat-role"
              >{{ msg.role === "user" ? "You" : "Assistant" }}:</span
            >
            <span class="chat-content">{{ msg.content }}</span>
          </div>
        </div>
        <form class="chat-input-row" @submit.prevent="handleSend">
          <input
            v-model="chatInput"
            class="chat-input vdb-c-text-black"
            type="text"
            placeholder="Type your message..."
          />
          <button
            class="chat-submit vdb-c-text-black"
            type="submit"
            :disabled="!chatInput.trim()"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  convId: {
    type: String,
    required: true,
  },
  msgId: {
    type: String,
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["send-chat-message"]);

const tabs = ["Transcript", "Summary", "Chat"];
const activeTab = ref("Transcript");

const chatInput = ref("");

function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;
  emit("send-chat-message", text);
  chatInput.value = "";
}
</script>

<style scoped>
.rtstream-tabs-container {
  max-height: 600px;
  display: flex;
  flex-direction: column;
}
.rtstream-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.rtstream-tab {
  padding: 8px 18px;
  border: none;
  background: #eee;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  font-weight: 500;
  color: #444;
  outline: none;
  transition: background 0.15s;
}
.rtstream-tab.active {
  background: #fff;
  color: #111;
  border-bottom: 2px solid #007bff;
}
.rtstream-tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.rtstream-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.rtstream-list {
  flex: 1;
  overflow-y: auto;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  min-height: 0;
  max-height: 480px;
}
.rtstream-line {
  margin-bottom: 0.5em;
  font-size: 1em;
  color: #222;
}
h3 {
  margin-bottom: 8px;
  font-size: 1.1em;
  font-weight: bold;
}
.chat-list {
  margin-bottom: 10px;
}
.chat-message {
  margin-bottom: 0.5em;
  display: flex;
  align-items: flex-start;
}
.chat-message.user .chat-role {
  color: #007bff;
  font-weight: 600;
}
.chat-message.assistant .chat-role {
  color: #28a745;
  font-weight: 600;
}
.chat-role {
  margin-right: 0.5em;
}
.chat-content {
  word-break: break-word;
}
.chat-input-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.chat-input {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1em;
}
.chat-submit {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: #007bff;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.chat-submit:disabled {
  background: #aaa;
  cursor: not-allowed;
}
</style>
