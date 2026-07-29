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
  verificationStatus?: 'not_started' | 'pending' | 'awaiting_document' | 'approved' | 'rejected'
  /** Flips to 'pending' the moment documents/details are submitted — distinct
   * from verificationStatus (Anchor's own automated pipeline state), which
   * can lag behind or never progress if Anchor's side has an issue. */
  kycStatus?: 'pending' | 'verified' | 'rejected'
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
