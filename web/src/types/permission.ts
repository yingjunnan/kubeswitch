export interface Permission {
  user_id: number
  cluster_id: number
  username?: string
  cluster_name?: string
  granted_at?: string
}

export interface ClusterPermissionsResponse {
  user_ids: number[]
}

export interface UserPermissionsResponse {
  cluster_ids: number[]
}

export interface UpdateClusterPermissionsDto {
  user_ids: number[]
}

export interface UpdateUserPermissionsDto {
  cluster_ids: number[]
}
