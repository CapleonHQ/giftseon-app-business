'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { GiftingRule } from '@/types/Gifting'
import * as giftingRulesApi from '@/lib/api/giftingRules'

type GiftingContextValue = {
  rules: GiftingRule[]
  isLoading: boolean
  addRule: (rule: Omit<GiftingRule, 'id' | 'createdAt' | 'trigger'>) => Promise<GiftingRule>
  updateRule: (id: string, updates: Partial<GiftingRule>) => void
  toggleRule: (id: string) => void
  getRuleForType: (typeKey: string) => GiftingRule | undefined
}

const GiftingContext = createContext<GiftingContextValue | undefined>(undefined)

const GIFTING_RULES_QUERY_KEY = ['gifting-rules'] as const

export const GiftingProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: GIFTING_RULES_QUERY_KEY,
    queryFn: giftingRulesApi.listGiftingRules,
  })
  const rules = useMemo(() => data ?? [], [data])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: GIFTING_RULES_QUERY_KEY })

  const createMutation = useMutation({
    mutationFn: giftingRulesApi.createGiftingRule,
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<giftingRulesApi.GiftingRulePayload> }) =>
      giftingRulesApi.updateGiftingRule(id, updates),
    onSuccess: invalidate,
  })

  const toggleMutation = useMutation({
    mutationFn: giftingRulesApi.toggleGiftingRule,
    onSuccess: invalidate,
  })

  const addRule: GiftingContextValue['addRule'] = async (rule) =>
    createMutation.mutateAsync({
      label: rule.label,
      typeKey: rule.typeKey,
      customTriggerDate: rule.customTriggerDate,
      giftFormat: rule.giftFormat,
      budget: rule.budget,
      message: rule.message,
      variesByTier: rule.variesByTier,
      tiers: rule.tiers,
      isActive: rule.enabled,
    })

  const updateRule = (id: string, updates: Partial<GiftingRule>) => {
    updateMutation.mutate({
      id,
      updates: {
        ...(updates.label !== undefined && { label: updates.label }),
        ...(updates.typeKey !== undefined && { typeKey: updates.typeKey }),
        ...(updates.customTriggerDate !== undefined && { customTriggerDate: updates.customTriggerDate }),
        ...(updates.giftFormat !== undefined && { giftFormat: updates.giftFormat }),
        ...(updates.budget !== undefined && { budget: updates.budget }),
        ...(updates.message !== undefined && { message: updates.message }),
        ...(updates.variesByTier !== undefined && { variesByTier: updates.variesByTier }),
        ...(updates.tiers !== undefined && { tiers: updates.tiers }),
        ...(updates.enabled !== undefined && { isActive: updates.enabled }),
      },
    })
  }

  const toggleRule = (id: string) => {
    toggleMutation.mutate(id)
  }

  const getRuleForType = (typeKey: string) => rules.find((r) => r.typeKey === typeKey)

  const value = useMemo<GiftingContextValue>(
    () => ({ rules, isLoading, addRule, updateRule, toggleRule, getRuleForType }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rules, isLoading]
  )

  return <GiftingContext.Provider value={value}>{children}</GiftingContext.Provider>
}

export const useGifting = () => {
  const ctx = useContext(GiftingContext)
  if (!ctx) throw new Error('useGifting must be used within GiftingProvider')
  return ctx
}
