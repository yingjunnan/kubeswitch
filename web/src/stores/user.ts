import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usersApi } from '@/api'
import type { User, CreateUserDto, UserRole } from '@/types'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([])
  const loading = ref(false)

  // Getters
  const getUsers = computed(() => users.value)
  const getUserById = computed(() => (id: number) => {
    return users.value.find(u => u.id === id)
  })

  // Actions
  const fetchUsers = async () => {
    loading.value = true
    try {
      users.value = await usersApi.getUsers()
    } finally {
      loading.value = false
    }
  }

  const createUser = async (data: CreateUserDto) => {
    const newUser = await usersApi.createUser(data)
    users.value.push(newUser)
    return newUser
  }

  const deleteUser = async (id: number) => {
    await usersApi.deleteUser(id)
    users.value = users.value.filter(u => u.id !== id)
  }

  const resetPassword = async (id: number, newPassword: string) => {
    await usersApi.resetPassword(id, newPassword)
  }

  const updateUserRole = async (id: number, role: UserRole) => {
    await usersApi.updateUserRole(id, { role })
    // 更新本地状态
    const user = users.value.find(u => u.id === id)
    if (user) {
      user.role = role
    }
  }

  const fetchUserPermissions = async (id: number): Promise<number[]> => {
    return await usersApi.getUserPermissions(id)
  }

  const updateUserPermissions = async (id: number, clusterIds: number[]) => {
    await usersApi.updateUserPermissions(id, { cluster_ids: clusterIds })
  }

  return {
    // State
    users,
    loading,
    // Getters
    getUsers,
    getUserById,
    // Actions
    fetchUsers,
    createUser,
    deleteUser,
    resetPassword,
    updateUserRole,
    fetchUserPermissions,
    updateUserPermissions
  }
})
