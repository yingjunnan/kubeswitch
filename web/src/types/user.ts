export const UserRole = {
  ADMIN: 'admin',
  USER: 'user'
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

export interface User {
  id: number
  username: string
  role: UserRole
  created_at?: string
  updated_at?: string
}

export interface CreateUserDto {
  username: string
  password: string
  role: UserRole
}

export interface UpdatePasswordDto {
  old_password: string
  new_password: string
}

export interface ResetPasswordDto {
  new_password: string
}

export interface UpdateUserRoleDto {
  role: UserRole
}
