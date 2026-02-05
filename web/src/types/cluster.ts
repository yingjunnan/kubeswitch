export interface Cluster {
  id: number
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface CreateClusterDto {
  name: string
  description?: string
  kubeconfig: string
}

export interface KubeconfigResponse {
  kubeconfig: string
}

export interface ImportKubeconfigDto {
  kubeconfig: string
}
