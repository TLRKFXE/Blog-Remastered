<script setup lang="ts">
import { onMounted, ref } from "vue";

const CACHE_KEY = "ascii-html-cache-v1";

function readAsciiCache() {
  if (typeof window === "undefined") return "";

  const memoryCache = (window as any).__ASCII_HTML_CACHE;
  if (typeof memoryCache === "string" && memoryCache) return memoryCache;

  const sessionCache = window.sessionStorage.getItem(CACHE_KEY) || "";
  if (sessionCache) (window as any).__ASCII_HTML_CACHE = sessionCache;

  return sessionCache;
}

function writeAsciiCache(value: string) {
  if (typeof window === "undefined" || !value) return;
  (window as any).__ASCII_HTML_CACHE = value;
  window.sessionStorage.setItem(CACHE_KEY, value);
}

const asciiHtml = ref(readAsciiCache());

onMounted(async () => {
  if (asciiHtml.value) return;

  try {
    const response = await fetch("/ascii-art.html", { cache: "force-cache" });
    if (!response.ok) return;

    const content = await response.text();
    asciiHtml.value = content;
    writeAsciiCache(content);
  } catch {
    asciiHtml.value = "";
  }
});
</script>

<template>
  <div class="ascii-frame notranslate" translate="no" data-no-translate="true">
    <pre
      id="ascii-output"
      class="notranslate"
      translate="no"
      data-no-translate="true"
    >
      <div class="notranslate" translate="no" data-no-translate="true" v-html="asciiHtml" />
    </pre>
  </div>
</template>

<style scoped>
.ascii-frame {
  border-radius: 8px;
  overflow: hidden;
  isolation: isolate;
}

#ascii-output {
  margin: 0;
  padding: 0;
  font-family: monospace;
  font-size: 5.56px;
  line-height: 0.96;
  letter-spacing: 0.5px;
  white-space: pre;
  overflow: hidden;
}

@media (min-width: 1024px) {
  #ascii-output {
    font-size: 8.33px;
  }
}
</style>
