<template>
  <div
    class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-8 vdb-c-bg-white vdb-c-py-14 vdb-c-text-left"
  >
    <div class="vdb-c-flex vdb-c-flex-col">
      <p
        :class="[
          'markdown-body vdb-c-overflow-hidden vdb-c-text-kilvish-900',
          isUser ? 'vdb-c-font-semibold' : 'vdb-c-font-normal',
        ]"
        v-html="getMarkedMsg(text)"
      ></p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Prism from 'prismjs';
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-python';

const options = {
  nonStandard: true,
};

const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
  isUser: {
    type: Boolean,
    default: false,
  },
});

const text = computed(() => props.content?.text || '');

marked.setOptions({
  highlight: function (code, lang) {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    }
    return code;
  },
});

marked.use(markedKatex(options));

const getMarkedMsg = (msg) => {
  if (!msg) return '';
  return marked.parse(msg);
};
</script>

<style>
.vdb-c-readMoreGradient {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 1) 100%);
}
</style>
