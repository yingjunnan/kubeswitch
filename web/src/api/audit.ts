import apiClient from './client'
import type { AuditLog } from '@/types'

/**
 * 审计日志相关 API
 */
export const auditApi = {
  /**
   * 获取审计日志列表
   */
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>('/audit')
    return response.data
  }
}
