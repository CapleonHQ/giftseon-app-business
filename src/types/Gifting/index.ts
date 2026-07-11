export type GiftingTypeKey =
  | 'birthday'
  | 'work_anniversary'
  | 'welcome'
  | 'promotion'
  | 'holiday_leave'
  | 'performance_bonus'
  | 'compensation'
  | 'custom'

export type GiftFormat = 'Cash' | 'Voucher' | 'Marketplace Item' | 'Custom Gift Pack'

export interface GiftingTypeDefinition {
  key: GiftingTypeKey
  label: string
  trigger: string
  whatIsSent: string
}

export interface BudgetTier {
  id: string
  label: string
  amount: number
}

export interface GiftingRule {
  id: string
  typeKey: GiftingTypeKey
  label: string
  trigger: string
  customTriggerDate?: string
  giftFormat: GiftFormat
  budget: number
  message: string
  variesByTier: boolean
  tiers: BudgetTier[]
  enabled: boolean
  createdAt: string
}
