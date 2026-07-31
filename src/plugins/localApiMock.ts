import type { Plugin } from 'vite'
import type { ViteDevServer } from 'vite'

export function localApiMock(): Plugin {
  return {
    name: 'local-api-mock',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/wiki/home', (_req, res) => {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
        res.end(`# NekoWiki

欢迎来到 **NekoWiki**，一个轻量级的 Wiki 站点。

## 快速开始

- 编辑 \`src/pages/Home.vue\` 修改首页
- 在 \`src/router/index.ts\` 中添加新路由
- 使用 \`marked\` 渲染 Markdown 内容

## 技术栈

- **Vue 3** + Composition API
- **Vue Router** 路由
- **Vite** 构建工具
- **GSAP** 动画
- **Marked** Markdown 渲染
`)
      })
    },
  }
}
