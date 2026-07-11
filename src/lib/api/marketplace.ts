import { request } from './client'
import type { MarketplaceProduct, GiftOptionType } from '@/types/Marketplace'

interface BackendListing {
  id: string
  storeId: string
  categoryId: string
  productType: string
  productName: string
  description: string
  unitPrice: number
  images: string[]
  occasionTags?: string[]
  departmentTags?: string[]
  corporateOnly: boolean
  wholesaleMinQty?: number
  wholesaleUnitPrice?: number
}

const GIFT_OPTION_TYPES: GiftOptionType[] = [
  'Voucher',
  'Prepaid Card',
  'Curated Pack',
  'Wholesale Pack',
  'Physical Item',
  'Extra',
]

/**
 * Backend has no rating/deliveryEstimate/category-name fields yet (categoryId
 * only, no eager-loaded relation) — defaulted here (known display gap).
 */
const toMarketplaceProduct = (listing: BackendListing): MarketplaceProduct => ({
  id: listing.id,
  name: listing.productName,
  description: listing.description,
  category: listing.categoryId,
  giftOptionType: GIFT_OPTION_TYPES.find((t) => t.toLowerCase() === listing.productType?.toLowerCase()) ?? 'Extra',
  price: Number(listing.unitPrice),
  wholesaleMinQty: listing.wholesaleMinQty,
  wholesaleUnitPrice: listing.wholesaleUnitPrice ? Number(listing.wholesaleUnitPrice) : undefined,
  occasionTags: listing.occasionTags ?? [],
  departmentTags: listing.departmentTags ?? [],
  corporateOnly: listing.corporateOnly,
  rating: 0,
  deliveryEstimate: '',
})

export interface MarketplaceQuery {
  search?: string
  categoryId?: string
  occasion?: string
  department?: string
  page?: number
  limit?: number
}

export interface MarketplaceListResult {
  total: number
  page: number
  limit: number
  data: MarketplaceProduct[]
}

export const browseMarketplace = async (query?: MarketplaceQuery): Promise<MarketplaceListResult> => {
  const result = await request<{ total: number; page: number; limit: number; data: BackendListing[] }>({
    method: 'GET',
    url: '/marketplace/listings',
    params: query,
  })
  return { ...result, data: result.data.map(toMarketplaceProduct) }
}

export const getMarketplaceListing = async (id: string) =>
  toMarketplaceProduct(await request<BackendListing>({ method: 'GET', url: `/marketplace/listings/${id}` }))
