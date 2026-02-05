export interface AuditLog {
  id: number
  user_id: number
  user: {
    username: string
  }
  action: string
  detail: string
  ip_address: string
  created_at: string
}

export interface AuditLogListResponse {
  logs: AuditLog[]
  total?: number
  page?: number
  page_size?: number
}
