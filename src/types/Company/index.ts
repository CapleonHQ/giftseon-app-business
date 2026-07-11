export type CompanyPlan = 'Starter' | 'Growth' | 'Enterprise'

export interface CompanyProfile {
  id: string
  companyName: string
  businessType?: string
  industry?: string
  plan?: CompanyPlan
  adminFirstName: string
  adminLastName: string
  email: string
  phone?: string
  logo?: string
  brandColor?: string
  isVerified: boolean
  verificationMethod?: 'cac' | 'bvn_nin'
  walletId: string
  createdAt: string
  updatedAt: string
}

export interface CompanyWallet {
  available: number
  spent: number
  escrow: number
  budgetCap: number
  budgetPeriod: 'monthly' | 'annual'
  lowBalanceThreshold: number
  virtualAccountNumber: string
  virtualAccountBank: string
  virtualAccountReference: string
}
