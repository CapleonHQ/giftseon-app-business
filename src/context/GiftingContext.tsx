'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { GiftingRule } from '@/types/Gifting'

const MOCK_RULES: GiftingRule[] = [
  {
    id: 'rule-1',
    typeKey: 'birthday',
    label: 'Birthday Gift',
    trigger: "Employee's date of birth (annual, auto-repeat)",
    giftFormat: 'Voucher',
    budget: 25000,
    message: 'Happy Birthday, {{employeeName}}! From all of us at Acme. 🎉',
    variesByTier: false,
    tiers: [],
    enabled: true,
    createdAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'rule-2',
    typeKey: 'work_anniversary',
    label: 'Work Anniversary',
    trigger: "Employee's date of joining (annual, auto-repeat)",
    giftFormat: 'Cash',
    budget: 20000,
    message: 'Congratulations on another year with us, {{employeeName}}!',
    variesByTier: true,
    tiers: [
      { id: 'tier-1', label: 'Junior', amount: 15000 },
      { id: 'tier-2', label: 'Mid-level', amount: 20000 },
      { id: 'tier-3', label: 'Senior', amount: 35000 },
    ],
    enabled: true,
    createdAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 'rule-3',
    typeKey: 'welcome',
    label: 'Welcome / Onboarding',
    trigger: 'New employee first day (manual or HR trigger)',
    giftFormat: 'Custom Gift Pack',
    budget: 15000,
    message: 'Welcome to the team, {{employeeName}}! We are thrilled to have you.',
    variesByTier: false,
    tiers: [],
    enabled: false,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
]

let idCounter = MOCK_RULES.length + 1

type GiftingContextValue = {
  rules: GiftingRule[]
  addRule: (rule: Omit<GiftingRule, 'id' | 'createdAt'>) => GiftingRule
  updateRule: (id: string, updates: Partial<GiftingRule>) => void
  toggleRule: (id: string) => void
  getRuleForType: (typeKey: string) => GiftingRule | undefined
}

const GiftingContext = createContext<GiftingContextValue | undefined>(undefined)

export const GiftingProvider = ({ children }: { children: ReactNode }) => {
  const [rules, setRules] = useState<GiftingRule[]>(MOCK_RULES)

  const addRule = useCallback((rule: Omit<GiftingRule, 'id' | 'createdAt'>) => {
    const created: GiftingRule = {
      ...rule,
      id: `rule-${idCounter++}`,
      createdAt: new Date().toISOString(),
    }
    setRules((prev) => {
      const existingIndex = prev.findIndex((r) => r.typeKey === rule.typeKey && rule.typeKey !== 'custom')
      if (existingIndex >= 0) {
        const next = [...prev]
        next[existingIndex] = created
        return next
      }
      return [created, ...prev]
    })
    return created
  }, [])

  const updateRule = useCallback((id: string, updates: Partial<GiftingRule>) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)))
  }, [])

  const toggleRule = useCallback((id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  }, [])

  const getRuleForType = useCallback(
    (typeKey: string) => rules.find((r) => r.typeKey === typeKey),
    [rules]
  )

  const value = useMemo(
    () => ({ rules, addRule, updateRule, toggleRule, getRuleForType }),
    [rules, addRule, updateRule, toggleRule, getRuleForType]
  )

  return <GiftingContext.Provider value={value}>{children}</GiftingContext.Provider>
}

export const useGifting = () => {
  const ctx = useContext(GiftingContext)
  if (!ctx) throw new Error('useGifting must be used within GiftingProvider')
  return ctx
}
