export interface StoredUser {
  id: number
  name: string
  email: string
}

export const getToken = (): string | null => {
  return localStorage.getItem('token')
}

export const setToken = (token: string): void => {
  localStorage.setItem('token', token)
}

export const getUser = (): StoredUser | null => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const setUser = (user: StoredUser): void => {
  localStorage.setItem('user', JSON.stringify(user))
}

export const clearAuth = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
