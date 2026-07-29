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

export interface BackendRegisteredAddress {
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type BackendRegistrationType =
  | 'Private_Incorporated'
  | 'Incorporated_Trustees'
  | 'Business_Name'
  | 'Free_Zone'
  | 'Gov'
  | 'Private_Incorporated_Gov'
  | 'Cooperative_Society'
  | 'Public_Incorporated'

export interface BackendCompanyOfficer {
  role: 'OWNER' | 'DIRECTOR'
  firstName: string
  lastName: string
  middleName?: string
  nationality: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  dateOfBirth: string
  email: string
  phoneNumber: string
  bvn: string
  percentageOwned?: number
  title?: string
}

export type BackendAnchorKybStatus =
  | 'not_started'
  | 'pending'
  | 'awaiting_document'
  | 'approved'
  | 'rejected'

export type BackendAnchorCustomerType = 'business' | 'individual'

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
  registrationNumber?: string | null
  anchorCustomerId?: string | null
  anchorCustomerType?: BackendAnchorCustomerType | null
  anchorKybStatus: BackendAnchorKybStatus
  businessBvn?: string | null
  businessPhoneNumber?: string | null
  registrationType?: BackendRegistrationType | null
  dateOfRegistration?: string | null
  businessDescription?: string | null
  registeredAddress?: BackendRegisteredAddress | null
  officers?: BackendCompanyOfficer[] | null
  ownerFirstName?: string | null
  ownerLastName?: string | null
  ownerMiddleName?: string | null
  ownerDateOfBirth?: string | null
  ownerGender?: 'Male' | 'Female' | null
  ownerBvn?: string | null
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
  registrationNumber?: string
}

/** Full business KYB submission — every field here is required by Anchor's
 * real API contract (confirmed against the live sandbox), not assumed. */
export interface SubmitBusinessKycPayload {
  verificationDocuments: string[]
  businessBvn: string
  businessPhoneNumber: string
  registrationType: BackendRegistrationType
  dateOfRegistration: string
  businessDescription: string
  registeredAddress: BackendRegisteredAddress
  officers: BackendCompanyOfficer[]
}

/** For businesses with no CAC registration — verifies the owner directly via
 * BVN instead of full business KYB. */
export interface SubmitIndividualKycPayload {
  ownerFirstName: string
  ownerLastName: string
  ownerMiddleName?: string
  ownerDateOfBirth: string
  ownerGender: 'Male' | 'Female'
  ownerBvn: string
  businessPhoneNumber: string
  businessDescription?: string
}

/**
 * Backend has no verificationMethod distinction stored directly — it's
 * derived here from anchorCustomerType (set once verification is actually
 * submitted via one of the two paths below).
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
  isVerified: company.anchorKybStatus === 'approved',
  verificationMethod: company.anchorCustomerType === 'individual' ? 'bvn_nin' : company.anchorCustomerType === 'business' ? 'cac' : undefined,
  verificationStatus: company.anchorKybStatus,
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

export const submitCompanyKyc = (payload: SubmitBusinessKycPayload) =>
  request<BackendCompany>({ method: 'POST', url: '/companies/kyc', data: payload })

export const submitIndividualKyc = (payload: SubmitIndividualKycPayload) =>
  request<BackendCompany>({ method: 'POST', url: '/companies/kyc/individual', data: payload })
