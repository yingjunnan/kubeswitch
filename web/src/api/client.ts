import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { message } from 'ant-design-vue'
import { getToken, clearAuth } from '@/utils/token'

// 创建 Axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加 JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    const { response } = error

    // 网络错误
    if (!response) {
      message.error('网络连接失败，请检查您的网络设置')
      return Promise.reject(error)
    }

    // 根据状态码处理错误
    switch (response.status) {
      case 400:
        // 显示具体的验证错误
        if (response.data && typeof response.data === 'object') {
          const data = response.data as any
          if (data.errors) {
            Object.keys(data.errors).forEach(key => {
              message.error(`${key}: ${data.errors[key]}`)
            })
          } else if (data.message) {
            message.error(data.message)
          } else {
            message.error('请求参数错误')
          }
        } else {
          message.error('请求参数错误')
        }
        break

      case 401:
        // 清除认证信息并重定向到登录页
        message.error('登录已过期，请重新登录')
        clearAuth()
        // 延迟跳转，确保消息显示
        setTimeout(() => {
          window.location.href = '/login'
        }, 1000)
        break

      case 403:
        message.error('您没有权限执行此操作')
        break

      case 404:
        message.error('请求的资源不存在')
        break

      case 500:
        message.error('服务器错误，请稍后重试')
        break

      default:
        const data = response.data as any
        message.error(data?.message || '操作失败')
    }

    return Promise.reject(error)
  }
)

export default apiClient
