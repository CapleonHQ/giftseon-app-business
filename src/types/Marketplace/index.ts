export type GiftOptionType =
  | 'Voucher'
  | 'Prepaid Card'
  | 'Curated Pack'
  | 'Wholesale Pack'
  | 'Physical Item'
  | 'Extra'

export interface MarketplaceProduct {
  id: string
  name: string
  description: string
  category: string
  giftOptionType: GiftOptionType
  price: number
  wholesaleMinQty?: number
  wholesaleUnitPrice?: number
  occasionTags: string[]
  departmentTags: string[]
  corporateOnly: boolean
  rating: number
  deliveryEstimate: string
}
