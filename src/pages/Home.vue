<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { marked } from 'marked'

const content = ref('')
const rendered = ref('')

onMounted(async () => {
  try {
    const res = await fetch('/api/wiki/home')
    const text = await res.text()
    content.value = text
    rendered.value = await marked(text)
  } catch {
    content.value = '# NekoWiki\n\n欢迎来到 NekoWiki。'
    rendered.value = await marked(content.value)
  }
})
</script>

<template>
  <div class="wiki-container">
    <header class="wiki-header">
      <h1>NekoWiki</h1>
    </header>
    <main class="wiki-content" v-html="rendered" />
  </div>
</template>

<style scoped>
.wiki-container {
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.wiki-header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.wiki-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
}

.wiki-content :deep(h1) { font-size: 1.75rem; font-weight: 700; margin: 1.5rem 0 0.75rem; }
.wiki-content :deep(h2) { font-size: 1.375rem; font-weight: 600; margin: 1.25rem 0 0.5rem; }
.wiki-content :deep(p)  { line-height: 1.8; margin: 0.5rem 0; }
.wiki-content :deep(a)  { color: #2563eb; text-decoration: underline; }
.wiki-content :deep(code) { background: #f3f4f6; padding: 0.125rem 0.375rem; border-radius: 4px; font-family: 'Roboto Mono', monospace; }
.wiki-content :deep(pre) { background: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 8px; overflow-x: auto; }
.wiki-content :deep(pre code) { background: none; padding: 0; }
</style>
