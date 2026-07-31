import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './styles/md3-theme.css'

import PublicWiki from './views/PublicWiki.vue'
import PublicPage from './views/PublicPage.vue'
import AdminLogin from './views/AdminLogin.vue'
import AdminDashboard from './views/AdminDashboard.vue'
import AdminUsers from './views/AdminUsers.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: PublicWiki },
    { path: '/wiki/:id', component: PublicPage },
    { path: '/admin', component: AdminLogin },
    { path: '/admin/dashboard', component: AdminDashboard },
    { path: '/admin/users', component: AdminUsers },
  ],
})

const app = createApp(App)
app.use(router)
app.mount('#app')
