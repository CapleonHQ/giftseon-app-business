import { request } from './client'

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string | null
  emailVerifiedAt?: string | null
  giftseonTag?: string | null
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  gender: string
  country: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}

interface LoginResult {
  user?: AuthUser
  token?: string
  type?: string
}

interface VerifyOtpResult {
  user: AuthUser
  token: string
}

export const register = (payload: RegisterPayload) =>
  request<AuthUser>({ method: 'POST', url: '/company/auth/register', data: payload })

export const login = (payload: LoginPayload) =>
  request<LoginResult>({ method: 'POST', url: '/company/auth/login', data: payload })

export const verifyOtp = (payload: VerifyOtpPayload) =>
  request<VerifyOtpResult>({ method: 'POST', url: '/company/auth/verify-otp', data: payload })

export const forgotPassword = (email: string) =>
  request<void>({ method: 'POST', url: '/company/auth/forgot-password', data: { email } })

export const resetPassword = (token: string, newPassword: string) =>
  request<void>({ method: 'POST', url: '/company/auth/reset-password', data: { token, newPassword } })

export const resendVerification = (email: string) =>
  request<void>({ method: 'POST', url: '/company/auth/resend-verification', data: { email } })

export const logout = () => request<void>({ method: 'POST', url: '/company/auth/logout' })
