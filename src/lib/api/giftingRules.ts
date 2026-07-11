import { request } from './client'
import type { GiftingRule, GiftingTypeKey, GiftFormat, BudgetTier } from '@/types/Gifting'
import { GIFTING_TYPE_DEFINITIONS } from '@/lib/mockGiftingTypes'

type BackendGiftFormat = 'cash' | 'voucher' | 'marketplace_item' | 'custom_gift_pack'
type BackendTargetScope = 'all_employees' | 'department' | 'specific_contacts'

const FORMAT_TO_BACKEND: Record<GiftFormat, BackendGiftFormat> = {
  Cash: 'cash',
  Voucher: 'voucher',
  'Marketplace Item': 'marketplace_item',
  'Custom Gift Pack': 'custom_gift_pack',
}

const FORMAT_FROM_BACKEND: Record<BackendGiftFormat, GiftFormat> = {
  cash: 'Cash',
  voucher: 'Voucher',
  marketplace_item: 'Marketplace Item',
  custom_gift_pack: 'Custom Gift Pack',
}

export interface BackendGiftingRule {
  id: string
  companyId: string
  label: string
  typeKey: GiftingTypeKey
  customTriggerDate?: string
  giftFormat: BackendGiftFormat
  amount: number
  currency: string
  message?: string
  variesByTier: boolean
  tiers?: BudgetTier[]
  targetScope: BackendTargetScope
  targetDepartments?: string[]
  targetContactIds?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const deriveTrigger = (rule: BackendGiftingRule): string => {
  if (rule.typeKey === 'custom' && rule.customTriggerDate) {
    return `Custom occasion on ${rule.customTriggerDate}`
  }
  return GIFTING_TYPE_DEFINITIONS.find((d) => d.key === rule.typeKey)?.trigger ?? ''
}

const toGiftingRule = (rule: BackendGiftingRule): GiftingRule => ({
  id: rule.id,
  typeKey: rule.typeKey,
  label: rule.label,
  trigger: deriveTrigger(rule),
  customTriggerDate: rule.customTriggerDate,
  giftFormat: FORMAT_FROM_BACKEND[rule.giftFormat],
  budget: Number(rule.amount),
  message: rule.message ?? '',
  variesByTier: rule.variesByTier,
  tiers: rule.tiers ?? [],
  enabled: rule.isActive,
  createdAt: rule.createdAt,
})

export interface GiftingRulePayload {
  label: string
  typeKey: GiftingTypeKey
  customTriggerDate?: string
  giftFormat: GiftFormat
  budget: number
  currency?: string
  message?: string
  variesByTier: boolean
  tiers: BudgetTier[]
  isActive?: boolean
}

const toBackendPayload = (payload: GiftingRulePayload) => ({
  label: payload.label,
  typeKey: payload.typeKey,
  customTriggerDate: payload.customTriggerDate,
  giftFormat: FORMAT_TO_BACKEND[payload.giftFormat],
  amount: payload.budget,
  currency: payload.currency,
  message: payload.message,
  variesByTier: payload.variesByTier,
  tiers: payload.tiers,
  isActive: payload.isActive,
})

const toBackendPatch = (payload: Partial<GiftingRulePayload>) => ({
  ...(payload.label !== undefined && { label: payload.label }),
  ...(payload.typeKey !== undefined && { typeKey: payload.typeKey }),
  ...(payload.customTriggerDate !== undefined && { customTriggerDate: payload.customTriggerDate }),
  ...(payload.giftFormat !== undefined && { giftFormat: FORMAT_TO_BACKEND[payload.giftFormat] }),
  ...(payload.budget !== undefined && { amount: payload.budget }),
  ...(payload.currency !== undefined && { currency: payload.currency }),
  ...(payload.message !== undefined && { message: payload.message }),
  ...(payload.variesByTier !== undefined && { variesByTier: payload.variesByTier }),
  ...(payload.tiers !== undefined && { tiers: payload.tiers }),
  ...(payload.isActive !== undefined && { isActive: payload.isActive }),
})

export const listGiftingRules = async (): Promise<GiftingRule[]> => {
  const rules = await request<BackendGiftingRule[]>({ method: 'GET', url: '/gifting-rules' })
  return rules.map(toGiftingRule)
}

export const createGiftingRule = async (payload: GiftingRulePayload) =>
  toGiftingRule(
    await request<BackendGiftingRule>({
      method: 'POST',
      url: '/gifting-rules',
      data: toBackendPayload(payload),
    })
  )

export const updateGiftingRule = async (id: string, payload: Partial<GiftingRulePayload>) =>
  toGiftingRule(
    await request<BackendGiftingRule>({
      method: 'PUT',
      url: `/gifting-rules/${id}`,
      data: toBackendPatch(payload),
    })
  )

export const toggleGiftingRule = async (id: string) =>
  toGiftingRule(await request<BackendGiftingRule>({ method: 'POST', url: `/gifting-rules/${id}/toggle` }))

export const removeGiftingRule = (id: string) =>
  request<void>({ method: 'DELETE', url: `/gifting-rules/${id}` })
