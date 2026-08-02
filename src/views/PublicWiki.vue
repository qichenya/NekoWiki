<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { api, type PageSummary } from '../composables/useApi'

const router = useRouter()
const pages = ref<PageSummary[]>([])
const loading = ref(true)
const containerRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  try {
    pages.value = await api.pages.list()
  } catch {
    // 无数据
  } finally {
    loading.value = false
  }
  if (containerRef.value) {
    gsap.fromTo(containerRef.value, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' })
  }
})

function goToPage(id: string) {
  router.push(`/wiki/${id}`)
}

function onCardEnter(e: MouseEvent) {
  const card = e.currentTarget as HTMLElement
  const title = card.querySelector('.page-card-title') as HTMLElement
  const startHeight = card.offsetHeight
  title.style.whiteSpace = 'normal'
  title.style.overflow = 'visible'
  gsap.fromTo(card, { height: startHeight }, { height: 'auto', duration: 0.3, ease: 'power2.out', clearProps: 'height' })
}

function onCardLeave(e: MouseEvent) {
  const card = e.currentTarget as HTMLElement
  const title = card.querySelector('.page-card-title') as HTMLElement
  const startHeight = card.offsetHeight
  title.style.whiteSpace = 'nowrap'
  title.style.overflow = 'hidden'
  gsap.fromTo(card, { height: startHeight }, { height: 'auto', duration: 0.3, ease: 'power2.out', clearProps: 'height' })
}
</script>

<template>
  <div class="public-wiki" ref="containerRef">
    <header class="public-header">
      <div class="header-content">
        <span class="header-icon md3-icon">menu_book</span>
        <h1 class="header-title">NekoWiki</h1>
      </div>
    </header>

    <main class="public-main">
      <div v-if="loading" class="loading-state">加载中...</div>

      <div v-else-if="pages.length === 0" class="empty-state">
        <span class="md3-icon empty-icon">article</span>
        <p>暂无内容</p>
      </div>

      <div v-else class="page-grid">
        <article
          v-for="page in pages"
          :key="page.id"
          class="page-card md3-card"
          @click="goToPage(page.id)"
          @mouseenter="onCardEnter"
          @mouseleave="onCardLeave"
        >
          <h2 class="page-card-title">{{ page.title }}</h2>
          <time class="page-card-time">
            {{ new Date(page.updatedAt).toLocaleDateString('zh-CN') }}
          </time>
        </article>
      </div>
    </main>
  </div>
</template>

<style scoped>
.public-wiki {
  min-height: 100vh;
  background: var(--md-sys-color-background);
}

.public-header {
  background: var(--md-sys-color-surface);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  padding: var(--md-spacing-xl) var(--md-spacing-3xl);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--md-spacing-md);
  max-width: 900px;
  margin: 0 auto;
}

.header-icon {
  font-size: 32px !important;
  color: var(--md-sys-color-primary);
}

.header-title {
  font: var(--md-sys-typescale-headline-large);
  color: var(--md-sys-color-on-surface);
}

.public-main {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--md-spacing-3xl) var(--md-spacing-xl);
}

.loading-state {
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
  padding: var(--md-spacing-3xl);
}

.empty-state {
  text-align: center;
  padding: var(--md-spacing-3xl);
  color: var(--md-sys-color-on-surface-variant);
}

.empty-icon {
  font-size: 64px !important;
  opacity: 0.3;
  margin-bottom: var(--md-spacing-lg);
}

.empty-state p {
  font: var(--md-sys-typescale-body-large);
}

.page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--md-spacing-lg);
}

.page-card {
  padding: var(--md-spacing-xl);
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.page-card:hover {
  box-shadow: var(--md-sys-elevation-2);
  transform: translateY(-2px);
}

.page-card-title {
  font: var(--md-sys-typescale-title-large);
  color: var(--md-sys-color-on-surface);
  margin-bottom: var(--md-spacing-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-card-time {
  font: var(--md-sys-typescale-label-small);
  color: var(--md-sys-color-on-surface-variant);
}
</style>
