import { request } from './client'
import type { CompanyProfile } from '@/types/Company'
import type { AuthUser } from './auth'

export interface BackendCompanyAddress {
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

export interface BackendCompany {
  id: string
  userId: string
  businessName: string
  businessType?: string
  industry?: string
  employeeCount?: number
  kycStatus: 'pending' | 'verified' | 'rejected'
  verificationDocuments?: string[]
  logoUrl?: string
  website?: string
  address?: BackendCompanyAddress
  status: 'active' | 'suspended' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateCompanyPayload {
  businessName: string
  businessType?: string
  industry?: string
  employeeCount?: number
  email?: string
  logoUrl?: string
  website?: string
  address?: BackendCompanyAddress
}

/**
 * Backend has no verificationMethod distinction (cac vs bvn_nin) — only a flat
 * verificationDocuments list — so that field is left unset by this adapter.
 */
export const toCompanyProfile = (company: BackendCompany, user: AuthUser): CompanyProfile => ({
  id: user.id,
  companyName: company.businessName,
  businessType: company.businessType,
  industry: company.industry,
  adminFirstName: user.firstName,
  adminLastName: user.lastName,
  email: user.email,
  phone: user.phoneNumber ?? undefined,
  logo: company.logoUrl,
  isVerified: company.kycStatus === 'verified',
  walletId: user.id,
  createdAt: company.createdAt,
  updatedAt: company.updatedAt,
})

export const registerCompany = (payload: CreateCompanyPayload) =>
  request<BackendCompany>({ method: 'POST', url: '/companies/register', data: payload })

export const getCompanyProfile = () =>
  request<BackendCompany>({ method: 'GET', url: '/companies/profile' })

export const updateCompanyProfile = (payload: Partial<CreateCompanyPayload>) =>
  request<BackendCompany>({ method: 'PUT', url: '/companies/profile', data: payload })

export const submitCompanyKyc = (verificationDocuments: string[]) =>
  request<BackendCompany>({ method: 'POST', url: '/companies/kyc', data: { verificationDocuments } })
