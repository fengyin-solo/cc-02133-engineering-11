import { createRouter, createWebHistory } from 'vue-router'
import { nav, site } from '@/config/site.config'

/**
 * 路由表由统一配置 site.config.js 的 nav 唯一生成，
 * 禁止在此处另写路径或标题，避免导航、页脚、校验器出现不一致。
 */
const viewModules = {
  HomeView: () => import('@/views/HomeView.vue'),
  AboutView: () => import('@/views/AboutView.vue'),
  ProductView: () => import('@/views/ProductView.vue'),
  CaseView: () => import('@/views/CaseView.vue'),
  ContactView: () => import('@/views/ContactView.vue')
}

const routes = nav.map((item) => ({
  path: item.path,
  name: item.view,
  component: viewModules[item.view],
  meta: { title: item.title }
}))

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 80 }
    }
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} - ${site.name}`
  next()
})

export default router
