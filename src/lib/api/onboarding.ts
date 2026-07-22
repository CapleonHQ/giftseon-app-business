import { request } from './client'

export interface OnboardingInvite {
  company: {
    businessName: string
    logoUrl?: string | null
  }
  employee: {
    name: string
    email?: string | null
  }
}

export interface OnboardingAddress {
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

export interface OnboardingRegisterPayload {
  fullName: string
  email: string
  password: string
  address?: OnboardingAddress
  interests?: string[]
}

export const getOnboardingInvite = (token: string) =>
  request<OnboardingInvite>({ method: 'GET', url: `/onboard/${token}` })

export const registerOnboarding = (token: string, payload: OnboardingRegisterPayload) =>
  request<void>({ method: 'POST', url: `/onboard/${token}/register`, data: payload })

export const verifyOnboarding = (token: string, otp: string) =>
  request<void>({ method: 'POST', url: `/onboard/${token}/verify`, data: { otp } })
