import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores'

/**
 * 设置路由守卫
 */
export function setupRouterGuards(router: Router) {
  // 全局前置守卫
  router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore()

    // 设置页面标题
    if (to.meta.title) {
      document.title = to.meta.title as string
    }

    // 检查是否需要认证
    if (to.meta.requiresAuth) {
      if (!authStore.isAuthenticated) {
        // 未认证，重定向到登录页
        next({
          name: 'Login',
          query: { redirect: to.fullPath }
        })
        return
      }

      // 检查是否需要管理员权限
      if (to.meta.requiresAdmin && !authStore.isAdmin) {
        // 非管理员，重定向到 Dashboard
        next({ name: 'Dashboard' })
        return
      }
    }

    // 如果已登录且访问登录页，重定向到 Dashboard
    if (to.name === 'Login' && authStore.isAuthenticated) {
      next({ name: 'Dashboard' })
      return
    }

    next()
  })

  // 全局后置钩子
  router.afterEach(() => {
    // 可以在这里添加页面加载完成后的逻辑
    // 例如：关闭加载动画等
  })
}
