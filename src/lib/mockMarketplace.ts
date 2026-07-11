import type { MarketplaceProduct } from '@/types/Marketplace'
import type { Employee } from '@/types/Employee'
import type { CompanyProfile } from '@/types/Company'

export const MARKETPLACE_CATEGORIES = [
  'Vouchers',
  'Prepaid Cards',
  'Curated Packs',
  'Wholesale Packs',
  'Tech & Gadgets',
  'Corporate Gift Packs',
  'Extras',
] as const

export const MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'mp-1',
    name: 'Superstore Gift Voucher',
    description: 'Redeemable at Justrite, Shoprite, and Jendol — a safe, flexible choice for any occasion.',
    category: 'Vouchers',
    giftOptionType: 'Voucher',
    price: 15000,
    occasionTags: ['Birthday', 'Compensation', 'Holiday & Leave'],
    departmentTags: [],
    corporateOnly: false,
    rating: 4.8,
    deliveryEstimate: 'Instant (digital)',
  },
  {
    id: 'mp-2',
    name: 'Restaurant Voucher — Dinner for Two',
    description: 'A curated list of partner restaurants across Lagos, Abuja, and Port Harcourt.',
    category: 'Vouchers',
    giftOptionType: 'Voucher',
    price: 25000,
    occasionTags: ['Promotion', 'Work Anniversary'],
    departmentTags: [],
    corporateOnly: false,
    rating: 4.9,
    deliveryEstimate: 'Instant (digital)',
  },
  {
    id: 'mp-3',
    name: 'One-Time Prepaid Card — ₦20,000',
    description: 'A single-use virtual card employees can spend anywhere Visa/Mastercard is accepted.',
    category: 'Prepaid Cards',
    giftOptionType: 'Prepaid Card',
    price: 20000,
    occasionTags: ['Birthday', 'Performance Bonus', 'Compensation'],
    departmentTags: [],
    corporateOnly: false,
    rating: 4.7,
    deliveryEstimate: 'Instant (digital)',
  },
  {
    id: 'mp-4',
    name: 'One-Time Prepaid Card — ₦50,000',
    description: 'Higher-value virtual card for milestone celebrations and bonuses.',
    category: 'Prepaid Cards',
    giftOptionType: 'Prepaid Card',
    price: 50000,
    occasionTags: ['Performance Bonus', 'Promotion'],
    departmentTags: [],
    corporateOnly: false,
    rating: 4.8,
    deliveryEstimate: 'Instant (digital)',
  },
  {
    id: 'mp-5',
    name: 'Welcome Onboarding Pack',
    description: 'Branded notebook, water bottle, tote bag, and welcome card — first-day ready.',
    category: 'Curated Packs',
    giftOptionType: 'Curated Pack',
    price: 18000,
    occasionTags: ['Welcome / Onboarding'],
    departmentTags: [],
    corporateOnly: true,
    rating: 4.9,
    deliveryEstimate: '3-5 days',
  },
  {
    id: 'mp-6',
    name: 'Tech Desk Bundle',
    description: 'Wireless mouse, USB-C hub, and a laptop sleeve — built for engineering and design teams.',
    category: 'Tech & Gadgets',
    giftOptionType: 'Physical Item',
    price: 45000,
    occasionTags: ['Birthday', 'Work Anniversary', 'Welcome / Onboarding'],
    departmentTags: ['Engineering'],
    corporateOnly: false,
    rating: 4.7,
    deliveryEstimate: '3-5 days',
  },
  {
    id: 'mp-7',
    name: 'Wireless Earbuds',
    description: 'A crowd-pleasing tech gift for any department.',
    category: 'Tech & Gadgets',
    giftOptionType: 'Physical Item',
    price: 35000,
    occasionTags: ['Birthday', 'Performance Bonus'],
    departmentTags: ['Engineering'],
    corporateOnly: false,
    rating: 4.6,
    deliveryEstimate: '3-5 days',
  },
  {
    id: 'mp-8',
    name: 'Client-Ready Portfolio Set',
    description: 'Leather-bound portfolio and pen set — sharp gifting for client-facing teams.',
    category: 'Corporate Gift Packs',
    giftOptionType: 'Curated Pack',
    price: 32000,
    occasionTags: ['Promotion', 'Work Anniversary'],
    departmentTags: ['Sales', 'Customer Success'],
    corporateOnly: true,
    rating: 4.8,
    deliveryEstimate: '3-5 days',
  },
  {
    id: 'mp-9',
    name: 'Wellness & Self-Care Pack',
    description: 'Spa voucher, scented candle, and herbal tea set — a compensation and welfare favourite.',
    category: 'Curated Packs',
    giftOptionType: 'Curated Pack',
    price: 28000,
    occasionTags: ['Compensation', 'Holiday & Leave'],
    departmentTags: ['Human Resources', 'Customer Success'],
    corporateOnly: false,
    rating: 4.9,
    deliveryEstimate: '3-5 days',
  },
  {
    id: 'mp-10',
    name: 'Creative Studio Kit',
    description: 'Sketchbook, marker set, and a mini ring light — for marketing and design teams.',
    category: 'Curated Packs',
    giftOptionType: 'Curated Pack',
    price: 22000,
    occasionTags: ['Birthday', 'Welcome / Onboarding'],
    departmentTags: ['Marketing'],
    corporateOnly: false,
    rating: 4.6,
    deliveryEstimate: '3-5 days',
  },
  {
    id: 'mp-11',
    name: 'Bulk Branded Hoodies (Wholesale)',
    description: 'Company-branded hoodies for team-wide rollouts — minimum order 20 units.',
    category: 'Wholesale Packs',
    giftOptionType: 'Wholesale Pack',
    price: 500000,
    wholesaleMinQty: 20,
    wholesaleUnitPrice: 25000,
    occasionTags: ['Holiday & Leave', 'Custom Occasion'],
    departmentTags: [],
    corporateOnly: true,
    rating: 4.7,
    deliveryEstimate: '7-10 days',
  },
  {
    id: 'mp-12',
    name: 'Bulk Superstore Vouchers (Wholesale)',
    description: 'Batch-purchase superstore vouchers at a discounted per-unit rate — minimum 50 units.',
    category: 'Wholesale Packs',
    giftOptionType: 'Wholesale Pack',
    price: 750000,
    wholesaleMinQty: 50,
    wholesaleUnitPrice: 15000,
    occasionTags: ['Holiday & Leave'],
    departmentTags: [],
    corporateOnly: true,
    rating: 4.8,
    deliveryEstimate: 'Instant (digital)',
  },
  {
    id: 'mp-13',
    name: 'Cinema & Entertainment Voucher',
    description: 'Filmhouse cinema tickets for two, plus a snack combo.',
    category: 'Extras',
    giftOptionType: 'Extra',
    price: 12000,
    occasionTags: ['Just Because', 'Birthday'],
    departmentTags: [],
    corporateOnly: false,
    rating: 4.5,
    deliveryEstimate: 'Instant (digital)',
  },
  {
    id: 'mp-14',
    name: 'Airtime & Data Bundle',
    description: 'A practical, always-welcome top-up across all major networks.',
    category: 'Extras',
    giftOptionType: 'Extra',
    price: 5000,
    occasionTags: ['Just Because', 'Compensation'],
    departmentTags: [],
    corporateOnly: false,
    rating: 4.4,
    deliveryEstimate: 'Instant (digital)',
  },
]

export interface RecommendedProduct {
  product: MarketplaceProduct
  score: number
  reason: string
}

/**
 * Ranks products for a specific employee without ever reading their private
 * interest selections — scoring uses only admin-visible signals (department,
 * company industry/business type, occasion) plus a deterministic per-employee
 * nudge that stands in for "their interest profile" without exposing it.
 */
export const getRecommendedProducts = (
  employee: Pick<Employee, 'id' | 'department' | 'interestsSet'>,
  company: Pick<CompanyProfile, 'industry' | 'businessType'> | null,
  occasionLabel?: string,
  products: MarketplaceProduct[] = MARKETPLACE_PRODUCTS
): RecommendedProduct[] => {
  const industryKeyword = (company?.industry || company?.businessType || '').toLowerCase()

  const personalNudge = employee.id
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 3

  return products
    .map((product) => {
      let score = 0
      const reasons: string[] = []

      if (product.departmentTags.length === 0 || product.departmentTags.includes(employee.department)) {
        score += product.departmentTags.includes(employee.department) ? 3 : 1
        if (product.departmentTags.includes(employee.department)) reasons.push(`suited to ${employee.department}`)
      }

      if (occasionLabel && product.occasionTags.some((t) => occasionLabel.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(occasionLabel.toLowerCase()))) {
        score += 2
        reasons.push(`fits ${occasionLabel}`)
      }

      if (industryKeyword && product.description.toLowerCase().includes(industryKeyword)) {
        score += 1
      }

      if (employee.interestsSet) {
        score += personalNudge
        if (personalNudge > 0) reasons.push('matches their interest profile')
      }

      return {
        product,
        score,
        reason: reasons.length > 0 ? reasons.join(' · ') : 'popular pick',
      }
    })
    .sort((a, b) => b.score - a.score)
}
