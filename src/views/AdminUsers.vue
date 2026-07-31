<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { api, type UserInfo } from '../composables/useApi'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { user, isLoggedIn, isAdmin, checkStatus } = useAuth()

const users = ref<UserInfo[]>([])
const newUsername = ref('')
const newPassword = ref('')
const errorMsg = ref('')
const isAdding = ref(false)
const containerRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  await checkStatus()
  if (!isLoggedIn.value || !isAdmin.value) {
    router.replace('/admin')
    return
  }
  await loadUsers()
  if (containerRef.value) {
    gsap.fromTo(containerRef.value, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
  }
})

async function loadUsers() {
  try {
    users.value = await api.users.list()
  } catch { /* empty */ }
}

async function handleAddUser() {
  errorMsg.value = ''
  if (!newUsername.value.trim() || !newPassword.value) {
    errorMsg.value = '请填写用户名和密码'
    return
  }
  if (newPassword.value.length < 6) {
    errorMsg.value = '密码至少需要6位'
    return
  }
  isAdding.value = true
  try {
    await api.users.create(newUsername.value.trim(), newPassword.value)
    newUsername.value = ''
    newPassword.value = ''
    await loadUsers()
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    isAdding.value = false
  }
}

async function handleDeleteUser(targetId: string) {
  const target = users.value.find((u) => u.id === targetId)
  if (!target) return
  if (!confirm(`确定删除用户「${target.username}」?`)) return
  try {
    await api.users.delete(targetId)
    await loadUsers()
  } catch (e: any) {
    alert(e.message)
  }
}
</script>

<template>
  <div class="users-page" ref="containerRef">
    <div class="users-header">
      <button class="md3-btn md3-btn-text" @click="router.push('/admin/dashboard')">
        <span class="md3-icon">arrow_back</span>
        返回管理
      </button>
      <h1>用户管理</h1>
    </div>

    <main class="users-main">
      <!-- 添加用户 -->
      <div class="users-add-card md3-card">
        <h3>创建新用户</h3>
        <div class="users-add-form">
          <div class="md3-text-field">
            <label>用户名</label>
            <input v-model="newUsername" type="text" placeholder="新用户名" />
          </div>
          <div class="md3-text-field">
            <label>密码</label>
            <input v-model="newPassword" type="password" placeholder="至少6位" />
          </div>
          <button class="md3-btn md3-btn-tonal" :disabled="isAdding" @click="handleAddUser">
            {{ isAdding ? '创建中...' : '创建用户' }}
          </button>
        </div>
        <div v-if="errorMsg" class="users-error">{{ errorMsg }}</div>
      </div>

      <!-- 用户列表 -->
      <div class="users-list">
        <div v-for="u in users" :key="u.id" class="user-item md3-card">
          <div class="user-item-info">
            <span class="md3-icon">account_circle</span>
            <span class="user-name">{{ u.username }}</span>
            <span class="user-role-tag" :class="u.role">{{ u.role === 'admin' ? '管理员' : '编辑者' }}</span>
          </div>
          <button
            v-if="u.id !== user?.id"
            class="md3-btn md3-btn-icon"
            title="删除用户"
            @click="handleDeleteUser(u.id)"
          >
            <span class="md3-icon">delete</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.users-page {
  min-height: 100vh;
  background: var(--md-sys-color-background);
}

.users-header {
  display: flex;
  align-items: center;
  gap: var(--md-spacing-md);
  padding: var(--md-spacing-lg) var(--md-spacing-xl);
  background: var(--md-sys-color-surface);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}
.users-header h1 {
  font: var(--md-sys-typescale-headline-small);
  color: var(--md-sys-color-on-surface);
}

.users-main {
  max-width: 700px;
  margin: 0 auto;
  padding: var(--md-spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--md-spacing-xl);
}

.users-add-card {
  padding: var(--md-spacing-xl);
}
.users-add-card h3 {
  font: var(--md-sys-typescale-title-medium);
  margin-bottom: var(--md-spacing-lg);
}

.users-add-form {
  display: flex;
  align-items: flex-end;
  gap: var(--md-spacing-md);
}
.users-add-form .md3-text-field { flex: 1; }

.users-error {
  margin-top: var(--md-spacing-sm);
  font: var(--md-sys-typescale-label-medium);
  color: var(--md-sys-color-error);
  padding: var(--md-spacing-sm) var(--md-spacing-md);
  background: var(--md-sys-color-error-container);
  border-radius: var(--md-sys-shape-corner-extra-small);
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: var(--md-spacing-sm);
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--md-spacing-md) var(--md-spacing-lg);
}

.user-item-info {
  display: flex;
  align-items: center;
  gap: var(--md-spacing-sm);
}

.user-name {
  font: var(--md-sys-typescale-title-small);
  color: var(--md-sys-color-on-surface);
}

.user-role-tag {
  font: var(--md-sys-typescale-label-small);
  padding: 2px 10px;
  border-radius: var(--md-sys-shape-corner-full);
}
.user-role-tag.admin { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); }
.user-role-tag.editor { background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); }
</style>
