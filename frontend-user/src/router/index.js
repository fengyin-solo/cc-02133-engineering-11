import { createRouter, createWebHistory } from 'vue-router'
import { ROUTES } from '@/config/routes.js'
import { SITE } from '@/config/site.js'

const viewModules = {
  Home: () => import('@/views/HomeView.vue'),
  About: () => import('@/views/AboutView.vue'),
  Products: () => import('@/views/ProductView.vue'),
  Cases: () => import('@/views/CaseView.vue'),
  Contact: () => import('@/views/ContactView.vue')
}

const routes = ROUTES.map((route) => ({
  path: route.path,
  name: route.name,
  component: viewModules[route.name],
  meta: { title: route.title }
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
  document.title = SITE.pageTitleTemplate.replace('%s', to.meta.title)
  next()
})

export default router
