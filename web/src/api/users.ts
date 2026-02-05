import apiClient from './client'
import type {
  User,
  CreateUserDto,
  UpdateUserRoleDto,
  UserPermissionsResponse,
  UpdateUserPermissionsDto
} from '@/types'

/**
 * 用户管理相关 API
 */
export const usersApi = {
  /**
   * 获取用户列表
   */
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users')
    return response.data
  },

  /**
   * 创建用户
   */
  createUser: async (data: CreateUserDto): Promise<User> => {
    const response = await apiClient.post<User>('/users', data)
    return response.data
  },

  /**
   * 删除用户
   */
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },

  /**
   * 重置用户密码（管理员操作）
   */
  resetPassword: async (id: number, newPassword: string): Promise<void> => {
    await apiClient.post(`/users/${id}/password`, { new_password: newPassword })
  },

  /**
   * 更新用户角色
   */
  updateUserRole: async (id: number, data: UpdateUserRoleDto): Promise<void> => {
    await apiClient.post(`/users/${id}/role`, data)
  },

  /**
   * 获取用户权限（用户可以访问哪些集群）
   */
  getUserPermissions: async (id: number): Promise<number[]> => {
    const response = await apiClient.get<UserPermissionsResponse>(`/users/${id}/permissions`)
    return response.data.cluster_ids || []
  },

  /**
   * 更新用户权限
   */
  updateUserPermissions: async (id: number, data: UpdateUserPermissionsDto): Promise<void> => {
    await apiClient.post(`/users/${id}/permissions`, data)
  }
}
