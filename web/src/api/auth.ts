import apiClient from './client'
import type { LoginDto, LoginResponse, User } from '@/types'

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 用户登录
   */
  login: async (data: LoginDto): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/login', data)
    return response.data
  },

  /**
   * 用户登出
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/logout')
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/my/user')
    return response.data
  },

  /**
   * 修改当前用户密码
   */
  updateMyPassword: async (data: { old_password: string; new_password: string }): Promise<void> => {
    await apiClient.post('/my/password', data)
  }
}
