import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(async ({ command }) => {
  const plugins = [vue()]

  // 本地开发 API Mock — 仅 dev 模式加载，用模板字符串绕过 rolldown 静态分析
  if (command === 'serve') {
    try {
      const mod = await import(`./src/plugins/localApiMock.ts`)
      plugins.push(mod.localApiMock())
    } catch { /* 生产构建时此模块不存在 */ }
  }

  return { plugins }
})
