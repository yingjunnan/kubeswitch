import { computed } from 'vue'
import { useAuthStore } from '@/stores'

/**
 * 权限检查相关的组合式函数
 */
export function usePermission() {
  const authStore = useAuthStore()

  // 是否可以管理集群
  const canManageClusters = computed(() => authStore.isAdmin)

  // 是否可以管理用户
  const canManageUsers = computed(() => authStore.isAdmin)

  // 是否可以查看审计日志
  const canViewAudit = computed(() => authStore.isAdmin)

  // 是否可以管理权限
  const canManagePermissions = computed(() => authStore.isAdmin)

  // 检查是否有特定权限
  const hasPermission = (permission: string): boolean => {
    if (!authStore.isAuthenticated) {
      return false
    }

    // 管理员拥有所有权限
    if (authStore.isAdmin) {
      return true
    }

    // 根据权限名称检查
    switch (permission) {
      case 'view:clusters':
        return true // 所有认证用户都可以查看集群
      case 'manage:clusters':
        return authStore.isAdmin
      case 'manage:users':
        return authStore.isAdmin
      case 'view:audit':
        return authStore.isAdmin
      case 'manage:permissions':
        return authStore.isAdmin
      default:
        return false
    }
  }

  return {
    canManageClusters,
    canManageUsers,
    canViewAudit,
    canManagePermissions,
    hasPermission
  }
}
