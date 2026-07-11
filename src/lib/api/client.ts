import axios, { type AxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

const AUTH_COOKIE = 'giftseon_business_token'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BUSINESS_API_URL || 'http://localhost:3006/api/v1',
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const setAuthToken = (token: string) => {
  Cookies.set(AUTH_COOKIE, token, { expires: 60, sameSite: 'strict' })
}

export const clearAuthToken = () => {
  Cookies.remove(AUTH_COOKIE)
}

export const getAuthToken = (): string | undefined => Cookies.get(AUTH_COOKIE)

export interface ApiError {
  message: string
  statusCode: number
}

const toApiError = (err: unknown): ApiError => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[] } | undefined
    const rawMessage = data?.message
    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage || err.message
    return { message, statusCode: err.response?.status ?? 0 }
  }
  return { message: 'Something went wrong. Please try again.', statusCode: 0 }
}

/** Unwraps the backend's `{status, message, data, meta}` envelope and normalizes errors into ApiError. */
export const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const res = await apiClient.request<{ data?: T; message: string }>(config)
    return res.data.data as T
  } catch (err) {
    throw toApiError(err)
  }
}
