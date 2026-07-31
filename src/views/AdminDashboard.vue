<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { api, type PageSummary, type PageFull } from '../composables/useApi'
import { useAuth } from '../composables/useAuth'
import { renderMarkdown } from '../composables/useMarkdown'

const router = useRouter()
const { user, isLoggedIn, checkStatus, logout } = useAuth()

const pages = ref<PageSummary[]>([])
const activePage = ref<PageFull | null>(null)
const editTitle = ref('')
const editContent = ref('')
const isSaving = ref(false)
const isNewPage = ref(false)
const saveMsg = ref('')
const containerRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  await checkStatus()
  if (!isLoggedIn.value) {
    router.replace('/admin')
    return
  }
  await loadPages()
  if (containerRef.value) {
    gsap.fromTo(containerRef.value, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' })
  }
})

async function loadPages() {
  try {
    pages.value = await api.pages.list()
  } catch { /* empty */ }
}

async function selectPage(id: string) {
  try {
    activePage.value = await api.pages.get(id)
    editTitle.value = activePage.value.title
    editContent.value = activePage.value.content
    isNewPage.value = false
  } catch { /* not found */ }
}

function newPage() {
  activePage.value = null
  editTitle.value = ''
  editContent.value = ''
  isNewPage.value = true
}

async function handleSave() {
  if (!editTitle.value.trim()) {
    alert('请输入页面标题')
    return
  }
  isSaving.value = true
  saveMsg.value = ''
  try {
    if (isNewPage.value) {
      const created = await api.pages.create(editTitle.value.trim(), editContent.value)
      activePage.value = created
    } else if (activePage.value) {
      await api.pages.update(activePage.value.id, { title: editTitle.value.trim(), content: editContent.value })
    }
    await loadPages()
    isNewPage.value = false
    saveMsg.value = '已保存'
    // 重新选中当前页面
    const current = activePage.value
    if (current) {
      const updated = pages.value.find((p) => p.id === current.id)
      if (updated) await selectPage(updated.id)
    }
  } catch (e: any) {
    console.error('保存失败', e)
    alert('保存失败: ' + (e?.message ?? '未知错误'))
  } finally {
    isSaving.value = false
    if (saveMsg.value) {
      setTimeout(() => { saveMsg.value = '' }, 2000)
    }
  }
}

async function handleDelete() {
  if (!activePage.value) return
  if (!confirm(`确定删除页面「${activePage.value.title}」?`)) return
  try {
    await api.pages.delete(activePage.value.id)
    activePage.value = null
    editTitle.value = ''
    editContent.value = ''
    await loadPages()
  } catch (e: any) {
    alert(e.message)
  }
}

async function handleLogout() {
  await logout()
  router.push('/admin')
}
</script>

<template>
  <div class="dashboard" ref="containerRef">
    <!-- 侧边栏 -->
    <aside class="dash-sidebar">
      <div class="dash-sidebar-header">
        <h2 class="dash-logo">
          <span class="md3-icon">menu_book</span>
          NekoWiki
        </h2>
        <span class="dash-badge">管理端</span>
      </div>

      <div class="dash-sidebar-actions">
        <button class="md3-btn md3-btn-filled dash-new-btn" @click="newPage">
          <span class="md3-icon">add</span>
          新建页面
        </button>
      </div>

      <hr class="md3-divider" />

      <nav class="dash-page-list">
        <div
          v-for="page in pages"
          :key="page.id"
          class="dash-page-item"
          :class="{ active: activePage?.id === page.id }"
          @click="selectPage(page.id)"
        >
          <span class="md3-icon">article</span>
          <span class="dash-page-title">{{ page.title }}</span>
        </div>
        <div v-if="pages.length === 0" class="dash-empty">暂无页面</div>
      </nav>

      <div class="dash-sidebar-footer">
        <button v-if="user?.role === 'admin'" class="md3-btn md3-btn-text dash-nav-btn" @click="router.push('/admin/users')">
          <span class="md3-icon">group</span>
          用户管理
        </button>
        <button class="md3-btn md3-btn-text dash-nav-btn" @click="router.push('/')">
          <span class="md3-icon">open_in_new</span>
          查看前台
        </button>
        <div class="dash-user-info">
          <span class="md3-icon">account_circle</span>
          <span>{{ user?.username }}</span>
          <span class="dash-role-tag">{{ user?.role === 'admin' ? '管理员' : '编辑者' }}</span>
        </div>
        <button class="md3-btn md3-btn-outlined dash-logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </aside>

    <!-- 编辑器 -->
    <div class="dash-editor">
      <div v-if="!activePage && !isNewPage" class="dash-editor-empty">
        <span class="md3-icon">edit_note</span>
        <p>选择一个页面开始编辑，或点击"新建页面"</p>
      </div>

      <div v-else class="dash-editor-body">
        <div class="dash-editor-toolbar">
          <input
            v-model="editTitle"
            class="dash-title-input"
            placeholder="页面标题"
          />
          <div class="dash-toolbar-actions">
            <span v-if="saveMsg" class="save-msg">{{ saveMsg }}</span>
            <button class="md3-btn md3-btn-tonal" :disabled="isSaving" @click="handleSave">
              <span class="md3-icon">save</span>
              {{ isSaving ? '保存中...' : '保存' }}
            </button>
            <button v-if="!isNewPage" class="md3-btn md3-btn-outlined" @click="handleDelete">
              <span class="md3-icon">delete</span>
            </button>
          </div>
        </div>

        <div class="dash-editor-panes">
          <div class="dash-pane">
            <div class="dash-pane-header">
              <span class="md3-icon">edit_note</span>
              Markdown
            </div>
            <textarea
              v-model="editContent"
              class="dash-textarea"
              placeholder="输入 Markdown 内容..."
            ></textarea>
          </div>
          <div class="dash-pane">
            <div class="dash-pane-header">
              <span class="md3-icon">visibility</span>
              预览
            </div>
            <div
              class="dash-preview markdown-body"
              v-html="editContent ? renderMarkdown(editContent) : '<p style=\'color:var(--md-sys-color-on-surface-variant);font-style:italic\'>预览将显示在这里...</p>'"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
  background: var(--md-sys-color-surface);
}

/* 侧边栏 */
.dash-sidebar {
  width: 260px;
  display: flex;
  flex-direction: column;
  background: var(--md-sys-color-surface-container-low);
  border-right: 1px solid var(--md-sys-color-outline-variant);
  flex-shrink: 0;
}

.dash-sidebar-header {
  padding: var(--md-spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--md-spacing-xs);
}

.dash-logo {
  display: flex;
  align-items: center;
  gap: var(--md-spacing-sm);
  font: var(--md-sys-typescale-title-large);
  color: var(--md-sys-color-on-surface);
}

.dash-badge {
  font: var(--md-sys-typescale-label-small);
  color: var(--md-sys-color-on-primary-container);
  background: var(--md-sys-color-primary-container);
  padding: 2px 10px;
  border-radius: var(--md-sys-shape-corner-full);
  width: fit-content;
}

.dash-sidebar-actions {
  padding: var(--md-spacing-sm) var(--md-spacing-md);
}

.dash-new-btn {
  width: 100%;
  justify-content: center;
}

.dash-page-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--md-spacing-sm);
}

.dash-page-item {
  display: flex;
  align-items: center;
  gap: var(--md-spacing-sm);
  padding: 10px var(--md-spacing-md);
  border-radius: var(--md-sys-shape-corner-full);
  cursor: pointer;
  font: var(--md-sys-typescale-title-small);
  color: var(--md-sys-color-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background 0.15s;
}
.dash-page-item:hover { background: rgba(103,80,164,0.08); }
.dash-page-item.active { background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); }

.dash-page-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dash-empty {
  text-align: center;
  padding: var(--md-spacing-xl);
  color: var(--md-sys-color-on-surface-variant);
  font: var(--md-sys-typescale-body-small);
}

.dash-sidebar-footer {
  padding: var(--md-spacing-md);
  border-top: 1px solid var(--md-sys-color-outline-variant);
  display: flex;
  flex-direction: column;
  gap: var(--md-spacing-xs);
}

.dash-nav-btn { justify-content: flex-start; font: var(--md-sys-typescale-label-medium) !important; }

.dash-user-info {
  display: flex;
  align-items: center;
  gap: var(--md-spacing-sm);
  padding: var(--md-spacing-sm) var(--md-spacing-md);
  font: var(--md-sys-typescale-label-medium);
  color: var(--md-sys-color-on-surface-variant);
}

.dash-role-tag {
  font: var(--md-sys-typescale-label-small);
  color: var(--md-sys-color-on-secondary-container);
  background: var(--md-sys-color-secondary-container);
  padding: 1px 8px;
  border-radius: var(--md-sys-shape-corner-full);
}

.dash-logout-btn { width: 100%; justify-content: center; }

/* 编辑器 */
.dash-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dash-editor-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--md-spacing-md);
  color: var(--md-sys-color-on-surface-variant);
}
.dash-editor-empty .md3-icon { font-size: 56px !important; opacity: 0.3; }

.dash-editor-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dash-editor-toolbar {
  display: flex;
  align-items: center;
  gap: var(--md-spacing-md);
  padding: var(--md-spacing-md) var(--md-spacing-lg);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.dash-title-input {
  flex: 1;
  border: none;
  outline: none;
  font: var(--md-sys-typescale-headline-small);
  color: var(--md-sys-color-on-surface);
  background: transparent;
}
.dash-title-input::placeholder { color: var(--md-sys-color-on-surface-variant); }

.dash-toolbar-actions {
  display: flex;
  gap: var(--md-spacing-sm);
  align-items: center;
}

.save-msg {
  font: var(--md-sys-typescale-label-medium);
  color: #2E7D32;
  padding: 4px 12px;
  border-radius: var(--md-sys-shape-corner-full);
  background: #E8F5E9;
}

.dash-editor-panes {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.dash-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--md-sys-color-outline-variant);
}
.dash-pane:last-child { border-right: none; }

.dash-pane-header {
  display: flex;
  align-items: center;
  gap: var(--md-spacing-sm);
  padding: var(--md-spacing-sm) var(--md-spacing-lg);
  font: var(--md-sys-typescale-label-medium);
  color: var(--md-sys-color-on-surface-variant);
  background: var(--md-sys-color-surface-container-low);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.dash-textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  padding: var(--md-spacing-lg);
  font: var(--md-sys-typescale-body-large);
  font-family: 'Roboto Mono', monospace;
  color: var(--md-sys-color-on-surface);
  background: var(--md-sys-color-surface);
  line-height: 1.7;
}
.dash-textarea::placeholder { color: var(--md-sys-color-on-surface-variant); }

.dash-preview {
  flex: 1;
  overflow-y: auto;
  padding: var(--md-spacing-lg);
  background: var(--md-sys-color-surface);
}

/* Markdown 预览样式 */
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
.markdown-body :deep(a) { color: var(--md-sys-color-primary); }
.markdown-body :deep(table) { width: 100%; border-collapse: collapse; margin-bottom: var(--md-spacing-md); }
.markdown-body :deep(th), .markdown-body :deep(td) { border: 1px solid var(--md-sys-color-outline-variant); padding: var(--md-spacing-sm) var(--md-spacing-md); text-align: left; }
.markdown-body :deep(th) { background: var(--md-sys-color-surface-container-low); font-weight: 500; }
.markdown-body :deep(hr) { border: none; height: 1px; background: var(--md-sys-color-outline-variant); margin: var(--md-spacing-xl) 0; }
</style>
