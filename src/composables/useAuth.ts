import { reactive, computed } from 'vue'
import { api, type UserInfo } from './useApi'

interface AuthState {
  user: UserInfo | null
  loading: boolean
  setupComplete: boolean | null
}

const state = reactive<AuthState>({
  user: null,
  loading: true,
  setupComplete: null,
})

export function useAuth() {
  const isLoggedIn = computed(() => !!state.user)
  const isAdmin = computed(() => state.user?.role === 'admin')

  async function checkStatus() {
    state.loading = true
    try {
      const s = await api.auth.status()
      state.setupComplete = s.setupComplete
      if (s.setupComplete) {
        try {
          const me = await api.auth.me()
          state.user = me
        } catch {
          // 未登录或 token 过期，保持 setupComplete=true，显示登录表单
          state.user = null
        }
      }
    } catch {
      state.setupComplete = false
    } finally {
      state.loading = false
    }
  }

  async function setup(username: string, password: string) {
    const res = await api.auth.setup(username, password)
    state.user = res.user
    state.setupComplete = true
  }

  async function login(username: string, password: string) {
    const res = await api.auth.login(username, password)
    state.user = res.user
  }

  async function logout() {
    await api.auth.logout()
    state.user = null
  }

  return { user: computed(() => state.user), isLoggedIn, isAdmin, loading: computed(() => state.loading), setupComplete: computed(() => state.setupComplete), checkStatus, setup, login, logout }
}
