import type { GiftingRule } from '@/types/Gifting'
import type { CompanyPlan } from '@/types/Company'

export interface AllocationSuggestion {
  typeKey: string
  label: string
  estimatedGifts: number
  suggestedMaxPerGift: number
  poolAmount: number
}

export interface AllocationResult {
  suggestions: AllocationSuggestion[]
  totalAllocated: number
  isSufficient: boolean
  shortfall: number
}

// Birthdays and anniversaries recur for every employee, every period.
// Everything else is manually/occasionally triggered — we estimate how many
// employees are likely to trigger it per period rather than assuming all of them.
const PER_EMPLOYEE_TYPES = new Set(['birthday', 'work_anniversary'])
const AD_HOC_RATE = 0.15

const BASE_WEIGHTS: Record<string, number> = {
  birthday: 1,
  work_anniversary: 0.8,
  welcome: 0.4,
  promotion: 0.3,
  holiday_leave: 0.6,
  performance_bonus: 0.3,
  compensation: 0.2,
  custom: 0.2,
}

const PLAN_MULTIPLIER: Record<CompanyPlan, number> = {
  Starter: 0.85,
  Growth: 1,
  Enterprise: 1.2,
}

const roundToNearest = (value: number, nearest = 500) =>
  Math.max(nearest, Math.round(value / nearest) * nearest)

export const computeAutoAllocation = (params: {
  budgetCap: number
  employeeCount: number
  enabledRules: GiftingRule[]
  plan?: CompanyPlan
}): AllocationResult => {
  const { budgetCap, employeeCount, enabledRules, plan = 'Growth' } = params

  if (enabledRules.length === 0 || employeeCount === 0) {
    return { suggestions: [], totalAllocated: 0, isSufficient: true, shortfall: 0 }
  }

  const planMultiplier = PLAN_MULTIPLIER[plan]

  const weighted = enabledRules.map((rule) => {
    const baseWeight = BASE_WEIGHTS[rule.typeKey] ?? 0.2
    const estimatedGifts = PER_EMPLOYEE_TYPES.has(rule.typeKey)
      ? employeeCount
      : Math.max(1, Math.round(employeeCount * AD_HOC_RATE))
    return { rule, estimatedGifts, weight: baseWeight * planMultiplier * estimatedGifts }
  })

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0)

  const suggestions: AllocationSuggestion[] = weighted.map(({ rule, estimatedGifts, weight }) => {
    const pool = totalWeight > 0 ? (weight / totalWeight) * budgetCap : 0
    const suggestedMaxPerGift = roundToNearest(pool / estimatedGifts)
    return {
      typeKey: rule.typeKey,
      label: rule.label,
      estimatedGifts,
      suggestedMaxPerGift,
      poolAmount: suggestedMaxPerGift * estimatedGifts,
    }
  })

  const totalAllocated = suggestions.reduce((sum, s) => sum + s.poolAmount, 0)
  const shortfall = Math.max(0, totalAllocated - budgetCap)

  return { suggestions, totalAllocated, isSufficient: shortfall === 0, shortfall }
}

export const scaleAllocationToFit = (
  suggestions: AllocationSuggestion[],
  budgetCap: number
): AllocationSuggestion[] => {
  const total = suggestions.reduce((sum, s) => sum + s.poolAmount, 0)
  if (total <= budgetCap || total === 0) return suggestions
  const factor = budgetCap / total
  return suggestions.map((s) => {
    const suggestedMaxPerGift = roundToNearest(s.suggestedMaxPerGift * factor)
    return { ...s, suggestedMaxPerGift, poolAmount: suggestedMaxPerGift * s.estimatedGifts }
  })
}
