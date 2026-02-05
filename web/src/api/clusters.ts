import apiClient from './client'
import type {
  Cluster,
  CreateClusterDto,
  KubeconfigResponse,
  ImportKubeconfigDto,
  ClusterPermissionsResponse,
  UpdateClusterPermissionsDto
} from '@/types'

/**
 * 集群相关 API
 */
export const clustersApi = {
  /**
   * 获取集群列表
   */
  getClusters: async (): Promise<Cluster[]> => {
    const response = await apiClient.get<Cluster[]>('/clusters')
    return response.data
  },

  /**
   * 创建集群
   */
  createCluster: async (data: CreateClusterDto): Promise<Cluster> => {
    const response = await apiClient.post<Cluster>('/clusters', data)
    return response.data
  },

  /**
   * 删除集群
   */
  deleteCluster: async (id: number): Promise<void> => {
    await apiClient.delete(`/clusters/${id}`)
  },

  /**
   * 获取集群的 Kubeconfig
   */
  getKubeconfig: async (id: number): Promise<string> => {
    const response = await apiClient.get<KubeconfigResponse>(`/clusters/${id}/config`)
    return response.data.kubeconfig
  },

  /**
   * 导入 Kubeconfig
   */
  importKubeconfig: async (id: number, data: ImportKubeconfigDto): Promise<void> => {
    await apiClient.post(`/clusters/${id}/import`, data)
  },

  /**
   * 获取集群权限（哪些用户可以访问）
   */
  getClusterPermissions: async (id: number): Promise<number[]> => {
    const response = await apiClient.get<ClusterPermissionsResponse>(`/clusters/${id}/permissions`)
    return response.data.user_ids || []
  },

  /**
   * 更新集群权限
   */
  updateClusterPermissions: async (id: number, data: UpdateClusterPermissionsDto): Promise<void> => {
    await apiClient.post(`/clusters/${id}/permissions`, data)
  }
}
