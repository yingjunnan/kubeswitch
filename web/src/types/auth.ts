import type { User, UserRole } from './user'

export interface LoginDto {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  role: UserRole
  user?: User
}

export interface AuthState {
  token: string | null
  role: UserRole | null
  user: User | null
}
