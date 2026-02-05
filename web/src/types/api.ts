export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}
