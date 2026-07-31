<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import { api, type PageFull } from '../composables/useApi'
import { renderMarkdown } from '../composables/useMarkdown'

const route = useRoute()
const router = useRouter()
const page = ref<PageFull | null>(null)
const loading = ref(true)
const containerRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  try {
    page.value = await api.pages.get(route.params.id as string)
  } catch {
    page.value = null
  } finally {
    loading.value = false
  }
  if (containerRef.value) {
    gsap.fromTo(containerRef.value, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' })
  }
})

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="page-view" ref="containerRef">
    <header class="page-header">
      <button class="md3-btn md3-btn-text" @click="goHome">
        <span class="md3-icon">arrow_back</span>
        返回首页
      </button>
    </header>

    <main class="page-main">
      <div v-if="loading" class="loading-state">加载中...</div>

      <div v-else-if="!page" class="empty-state">
        <span class="md3-icon empty-icon">error</span>
        <p>页面不存在</p>
      </div>

      <article v-else class="page-content">
        <h1 class="page-title">{{ page.title }}</h1>
        <div class="markdown-body" v-html="renderMarkdown(page.content)"></div>
      </article>
    </main>
  </div>
</template>

<style scoped>
.page-view {
  min-height: 100vh;
  background: var(--md-sys-color-background);
}

.page-header {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--md-spacing-lg) var(--md-spacing-xl);
}

.page-main {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--md-spacing-xl) var(--md-spacing-3xl);
}

.loading-state, .empty-state {
  text-align: center;
  padding: var(--md-spacing-3xl);
  color: var(--md-sys-color-on-surface-variant);
}

.empty-icon { font-size: 48px !important; margin-bottom: var(--md-spacing-md); opacity: 0.3; }

.page-title {
  font: var(--md-sys-typescale-headline-large);
  color: var(--md-sys-color-on-surface);
  margin-bottom: var(--md-spacing-2xl);
  padding-bottom: var(--md-spacing-lg);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

/* Markdown 内容样式 */
.markdown-body :deep(h1) { font: var(--md-sys-typescale-headline-large); margin-bottom: var(--md-spacing-lg); }
.markdown-body :deep(h2) { font: var(--md-sys-typescale-headline-medium); margin: var(--md-spacing-xl) 0 var(--md-spacing-md); }
.markdown-body :deep(h3) { font: var(--md-sys-typescale-headline-small); margin: var(--md-spacing-lg) 0 var(--md-spacing-sm); }
.markdown-body :deep(p) { margin-bottom: var(--md-spacing-md); line-height: 1.8; }
.markdown-body :deep(code) { font-family: 'Roboto Mono', monospace; background: var(--md-sys-color-surface-variant); padding: 2px 6px; border-radius: var(--md-sys-shape-corner-extra-small); font-size: 0.875em; }
.markdown-body :deep(pre) { background: var(--md-sys-color-surface-container-highest); padding: var(--md-spacing-lg); border-radius: var(--md-sys-shape-corner-small); overflow-x: auto; margin-bottom: var(--md-spacing-md); }
.markdown-body :deep(pre code) { background: transparent; padding: 0; }
.markdown-body :deep(blockquote) { border-left: 4px solid var(--md-sys-color-primary); padding: var(--md-spacing-md) var(--md-spacing-lg); margin: var(--md-spacing-md) 0; background: var(--md-sys-color-surface-container-low); border-radius: 0 var(--md-sys-shape-corner-small) var(--md-sys-shape-corner-small) 0; color: var(--md-sys-color-on-surface-variant); }
.markdown-body :deep(ul), .markdown-body :deep(ol) { margin-bottom: var(--md-spacing-md); padding-left: var(--md-spacing-xl); }
.markdown-body :deep(li) { margin-bottom: var(--md-spacing-xs); line-height: 1.6; }
.markdown-body :deep(a) { color: var(--md-sys-color-primary); text-decoration: none; }
.markdown-body :deep(table) { width: 100%; border-collapse: collapse; margin-bottom: var(--md-spacing-md); }
.markdown-body :deep(th), .markdown-body :deep(td) { border: 1px solid var(--md-sys-color-outline-variant); padding: var(--md-spacing-sm) var(--md-spacing-md); text-align: left; }
.markdown-body :deep(th) { background: var(--md-sys-color-surface-container-low); font-weight: 500; }
.markdown-body :deep(hr) { border: none; height: 1px; background: var(--md-sys-color-outline-variant); margin: var(--md-spacing-xl) 0; }
.markdown-body :deep(img) { max-width: 100%; border-radius: var(--md-sys-shape-corner-small); }
</style>
