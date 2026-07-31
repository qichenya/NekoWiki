import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(async ({ command }) => {
  const plugins = [vue()]

  // 本地开发 API Mock — 仅 dev 模式加载
  if (command === 'serve') {
    const { localApiMock } = await import('./src/plugins/localApiMock')
    plugins.push(localApiMock())
  }

  return { plugins }
})
