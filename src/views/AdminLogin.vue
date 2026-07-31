<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { setupComplete, loading, isLoggedIn, setup, login, checkStatus } = useAuth()

const username = ref('')
const password = ref('')
const errorMsg = ref('')
const isSubmitting = ref(false)
const formRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  await checkStatus()
  if (formRef.value) {
    gsap.fromTo(formRef.value, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
  }
  if (isLoggedIn.value) {
    router.replace('/admin/dashboard')
  }
})

async function handleSubmit() {
  errorMsg.value = ''
  if (!username.value.trim() || !password.value) {
    errorMsg.value = '请填写用户名和密码'
    return
  }
  if (password.value.length < 6) {
    errorMsg.value = '密码至少需要6位'
    return
  }
  isSubmitting.value = true
  try {
    if (setupComplete.value) {
      await login(username.value.trim(), password.value)
    } else {
      await setup(username.value.trim(), password.value)
    }
    router.push('/admin/dashboard')
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card md3-card" ref="formRef">
      <div class="login-header">
        <span class="md3-icon login-icon">shield_person</span>
        <h1 v-if="setupComplete === false">初始化 NekoWiki</h1>
        <h1 v-else>管理员登录</h1>
        <p v-if="setupComplete === false" class="login-desc">首次使用，请创建管理员账户</p>
        <p v-else class="login-desc">请输入管理员账号密码</p>
      </div>

      <div v-if="loading" class="login-loading">检查系统状态...</div>

      <form v-else class="login-form" @submit.prevent="handleSubmit">
        <div class="md3-text-field">
          <label>用户名</label>
          <input v-model="username" type="text" placeholder="输入用户名" autocomplete="username" />
        </div>

        <div class="md3-text-field">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="输入密码" autocomplete="current-password" />
        </div>

        <div v-if="errorMsg" class="login-error">{{ errorMsg }}</div>

        <button type="submit" class="md3-btn md3-btn-filled login-btn" :disabled="isSubmitting">
          {{ isSubmitting ? '处理中...' : (setupComplete ? '登录' : '创建并登录') }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  padding: var(--md-spacing-xl);
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: var(--md-spacing-3xl);
}

.login-header {
  text-align: center;
  margin-bottom: var(--md-spacing-2xl);
}

.login-icon {
  font-size: 48px !important;
  color: var(--md-sys-color-primary);
  margin-bottom: var(--md-spacing-lg);
}

.login-header h1 {
  font: var(--md-sys-typescale-headline-medium);
  color: var(--md-sys-color-on-surface);
  margin-bottom: var(--md-spacing-xs);
}

.login-desc {
  font: var(--md-sys-typescale-body-medium);
  color: var(--md-sys-color-on-surface-variant);
}

.login-loading {
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
  padding: var(--md-spacing-xl) 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--md-spacing-lg);
}

.login-form label {
  font: var(--md-sys-typescale-label-medium);
  color: var(--md-sys-color-on-surface-variant);
}

.login-error {
  font: var(--md-sys-typescale-label-medium);
  color: var(--md-sys-color-error);
  padding: var(--md-spacing-sm) var(--md-spacing-md);
  background: var(--md-sys-color-error-container);
  border-radius: var(--md-sys-shape-corner-extra-small);
}

.login-btn {
  width: 100%;
  margin-top: var(--md-spacing-sm);
}
</style>
