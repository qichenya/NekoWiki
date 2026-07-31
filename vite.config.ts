import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { localApiMock } from './src/plugins/localApiMock'

export default defineConfig({
  plugins: [vue(), localApiMock()],
})
