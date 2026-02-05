const TOKEN_KEY = 'kubeswitch_token'
const ROLE_KEY = 'kubeswitch_role'

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

export const getRole = (): string | null => {
  return localStorage.getItem(ROLE_KEY)
}

export const setRole = (role: string): void => {
  localStorage.setItem(ROLE_KEY, role)
}

export const removeRole = (): void => {
  localStorage.removeItem(ROLE_KEY)
}

export const clearAuth = (): void => {
  removeToken()
  removeRole()
}
