<template>
  <div class="vdb-c-flex vdb-c-flex-col vdb-c-gap-12">
    <!-- Code Header -->
    <button
      type="button"
      class="vdb-c-flex vdb-c-w-fit vdb-c-items-center vdb-c-gap-8 vdb-c-bg-transparent vdb-c-text-left"
      @click="toggle && toggle()"
    >
      <span class="vdb-c-w-fit vdb-c-text-[16px] vdb-c-font-medium vdb-c-text-kilvish-800">
        {{ step.title }}
      </span>

      <ChevronDown
        class="vdb-c-ml-auto"
        :class="{ 'vdb-c-rotate-180 vdb-c-transform': isExpanded }"
        :stroke-width="2"
        :stroke-color="'#343E4F'"
      />
    </button>

    <!-- Code Content -->
    <div
      v-if="isExpanded"
      class="vdb-c-max-h-[400px] vdb-c-overflow-y-auto vdb-c-rounded-lg vdb-c-bg-[#FAFAFA] vdb-c-p-16"
    >
      <div
        class="markdown-body vdb-c-overflow-hidden vdb-c-text-kilvish-900"
        v-html="getMarkedMsg(step.text)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import ChevronDown from '../../icons/ChevronDown.vue';

const props = defineProps({
  step: { type: Object, required: true },
  index: { type: Number, required: true },
  status: { type: String, required: true },
  activeIndex: { type: Number, required: true },
  isExpanded: { type: Boolean, default: false },
  toggle: { type: Function, default: () => {} },
});

const options = {
  nonStandard: true,
};

marked.setOptions({
  highlight: function (code, lang) {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    }
    return code;
  },
});

const getMarkedMsg = (msg) => {
  marked.use(markedKatex(options));
  return marked.parse(msg);
};
</script>

<style scoped>
.markdown-body {
  font-size: 14px;
  line-height: 1.6;
}

.markdown-body pre {
  background: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
}

.markdown-body code {
  background: #f6f8fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 85%;
}

.markdown-body pre code {
  background: transparent;
  padding: 0;
}
</style>
