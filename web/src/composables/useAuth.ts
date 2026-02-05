import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import type { LoginDto } from '@/types'

/**
 * 认证相关的组合式函数
 */
export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  // 响应式状态
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)
  const currentUser = computed(() => authStore.currentUser)

  // 登录
  const login = async (credentials: LoginDto) => {
    await authStore.login(credentials)
    // 登录成功后跳转
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/')
  }

  // 登出
  const logout = async () => {
    await authStore.logout()
    router.push('/login')
  }

  // 刷新用户信息
  const refreshUser = async () => {
    await authStore.refreshUser()
  }

  // 修改密码
  const updatePassword = async (oldPassword: string, newPassword: string) => {
    await authStore.updatePassword(oldPassword, newPassword)
  }

  return {
    // 状态
    isAuthenticated,
    isAdmin,
    currentUser,
    // 方法
    login,
    logout,
    refreshUser,
    updatePassword
  }
}
