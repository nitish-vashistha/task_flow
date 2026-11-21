import client from './client'

export interface AuthResponseData {
  token: string
  id: number
  name: string
  email: string
}

export const loginApi = async (email: string, password: string): Promise<AuthResponseData> => {
  const response = await client.post<AuthResponseData>('/auth/login', { email, password })
  return response.data
}

export const registerApi = async (name: string, email: string, password: string): Promise<AuthResponseData> => {
  const response = await client.post<AuthResponseData>('/auth/register', { name, email, password })
  return response.data
}
