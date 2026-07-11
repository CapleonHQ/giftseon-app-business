import type { GiftingTypeDefinition, GiftingTypeKey } from '@/types/Gifting'

export const GIFTING_TYPE_DEFINITIONS: GiftingTypeDefinition[] = [
  {
    key: 'birthday',
    label: 'Birthday Gift',
    trigger: "Employee's date of birth (annual, auto-repeat)",
    whatIsSent: 'Cash, voucher, or marketplace item up to configured budget',
  },
  {
    key: 'work_anniversary',
    label: 'Work Anniversary',
    trigger: "Employee's date of joining (annual, auto-repeat)",
    whatIsSent: 'Configurable gift type and budget',
  },
  {
    key: 'welcome',
    label: 'Welcome / Onboarding',
    trigger: 'New employee first day (manual or HR trigger)',
    whatIsSent: 'Physical onboarding package or voucher bundle',
  },
  {
    key: 'promotion',
    label: 'Promotion',
    trigger: 'Manual trigger by admin',
    whatIsSent: 'Configurable gift — usually higher value',
  },
  {
    key: 'holiday_leave',
    label: 'Holiday & Leave',
    trigger: 'Before major public holidays (Sallah, Christmas, Easter, New Year) or employee leave start',
    whatIsSent: 'Configured voucher or cash gift',
  },
  {
    key: 'performance_bonus',
    label: 'Performance Bonus',
    trigger: 'Manual trigger by admin — single or batch',
    whatIsSent: 'Cash or high-value voucher',
  },
  {
    key: 'compensation',
    label: 'Compensation',
    trigger: 'Manual trigger — welfare-related',
    whatIsSent: 'Cash or practical voucher (superstore, electricity)',
  },
  {
    key: 'custom',
    label: 'Custom Occasion',
    trigger: 'Admin defines occasion name and trigger date',
    whatIsSent: 'Configured gift type and budget',
  },
]

export const getGiftingTypeLabel = (key: GiftingTypeKey) =>
  GIFTING_TYPE_DEFINITIONS.find((g) => g.key === key)?.label ?? key
