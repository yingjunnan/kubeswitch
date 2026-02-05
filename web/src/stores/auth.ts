import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import { setToken, setRole, clearAuth } from '@/utils/token'
import type { User, UserRole, LoginDto } from '@/types'

export const useAuthStore = defineStore(
  'auth',
  () => {
    // State
    const token = ref<string | null>(null)
    const role = ref<UserRole | null>(null)
    const user = ref<User | null>(null)

    // Getters
    const isAuthenticated = computed(() => !!token.value)
    const isAdmin = computed(() => role.value === 'admin')
    const currentUser = computed(() => user.value)

    // Actions
    const login = async (credentials: LoginDto) => {
      const response = await authApi.login(credentials)
      token.value = response.token
      role.value = response.role
      
      // 存储到 localStorage
      setToken(response.token)
      setRole(response.role)

      // 获取用户详细信息
      if (response.user) {
        user.value = response.user
      } else {
        await refreshUser()
      }
    }

    const logout = async () => {
      try {
        await authApi.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // 清除状态
        token.value = null
        role.value = null
        user.value = null
        clearAuth()
      }
    }

    const refreshUser = async () => {
      try {
        const userData = await authApi.getCurrentUser()
        user.value = userData
      } catch (error) {
        console.error('Failed to refresh user:', error)
      }
    }

    const updatePassword = async (oldPassword: string, newPassword: string) => {
      await authApi.updateMyPassword({
        old_password: oldPassword,
        new_password: newPassword
      })
    }

    return {
      // State
      token,
      role,
      user,
      // Getters
      isAuthenticated,
      isAdmin,
      currentUser,
      // Actions
      login,
      logout,
      refreshUser,
      updatePassword
    }
  },
  {
    persist: {
      storage: localStorage
    }
  }
)
