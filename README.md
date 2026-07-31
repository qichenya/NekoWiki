# NekoWiki

基于 Markdown 的个人 Wiki 系统，Material Design 3 风格，GSAP 动画驱动。

## 技术栈

- **前端**：Vue 3 + TypeScript + Vite + vue-router
- **设计**：Material Design 3（自定义 CSS Token 体系）
- **动画**：GSAP
- **后端**：Cloudflare Pages Functions + KV
- **Markdown**：marked

## 功能

- Markdown 编辑 + 实时预览（分栏布局）
- 公开前台：只读 Wiki，卡片式页面列表
- 管理后台：密码保护，页面 CRUD，多用户支持
- 首次访问需创建管理员账户，之后凭用户名密码登录
- 仅管理员可创建新用户，无注册入口
- PBKDF2 密码哈希，JWT Cookie 认证

## 路由

| 路径 | 权限 | 说明 |
|------|------|------|
| `/` | 公开 | Wiki 首页 |
| `/wiki/:id` | 公开 | 单页阅读 |
| `/admin` | 公开 | 首次初始化 / 登录 |
| `/admin/dashboard` | 需登录 | 分栏编辑器 + 页面管理 |
| `/admin/users` | 管理员 | 用户管理 |

## 本地开发

```bash
npm install
npm run dev
```

本地开发内置 API Mock，数据存储在 `node_modules/.nekowiki-local-db.json`。

## 部署（Cloudflare Pages）

```bash
# 1. 创建 KV 命名空间
wrangler kv:namespace create "NEKOWIKI_KV"
wrangler kv:namespace create "NEKOWIKI_KV" --preview

# 2. 将输出的 id 填入 wrangler.toml

# 3. 部署
npm run cf:deploy
```

部署后通过 Cloudflare Dashboard 绑定 KV 到 Pages 项目。

## 项目结构

```
src/
├── views/           # 页面视图
│   ├── PublicWiki.vue      # 前台首页
│   ├── PublicPage.vue      # 前台单页
│   ├── AdminLogin.vue      # 登录/初始化
│   ├── AdminDashboard.vue  # 管理仪表盘
│   └── AdminUsers.vue      # 用户管理
├── composables/     # 组合式函数
│   ├── useApi.ts           # API 客户端
│   ├── useAuth.ts          # 认证状态
│   └── useMarkdown.ts      # Markdown 渲染
├── plugins/         # Vite 插件
│   └── localApiMock.ts     # 本地 API Mock
├── styles/          # 样式
│   └── md3-theme.css       # MD3 设计系统
└── router/          # 路由配置
functions/api/       # Cloudflare Pages Functions
├── auth/            # 认证接口
├── pages/           # 页面 CRUD
└── users/           # 用户管理
```
