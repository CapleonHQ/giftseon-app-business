'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Sparkles } from 'lucide-react'
import { getRecommendedProducts } from '@/lib/mockMarketplace'
import { browseMarketplace } from '@/lib/api/marketplace'
import type { MarketplaceProduct } from '@/types/Marketplace'
import type { Employee } from '@/types/Employee'
import type { CompanyProfile } from '@/types/Company'

interface ProductPickerProps {
  selectedId?: string
  onSelect: (product: MarketplaceProduct) => void
  /** When set to a single employee, results are ranked for them (privacy-safe — never reads their actual interests). */
  recipientEmployee?: Pick<Employee, 'id' | 'department' | 'interestsSet'> | null
  company?: Pick<CompanyProfile, 'industry' | 'businessType'> | null
  occasionLabel?: string
}

export default function ProductPicker({ selectedId, onSelect, recipientEmployee, company, occasionLabel }: ProductPickerProps) {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['marketplace-picker'],
    queryFn: () => browseMarketplace({ limit: 100 }),
  })
  const products = useMemo(() => data?.data ?? [], [data])

  const ranked = useMemo(() => {
    if (recipientEmployee) {
      return getRecommendedProducts(recipientEmployee, company ?? null, occasionLabel, products).map((r) => ({
        product: r.product,
        reason: r.reason,
      }))
    }
    return products.map((product) => ({ product, reason: undefined as string | undefined }))
  }, [recipientEmployee, company, occasionLabel, products])

  const filtered = ranked.filter(({ product }) => product.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      {recipientEmployee && (
        <div className='mb-3 flex items-center gap-1.5 rounded-lg bg-primary-50/60 px-3 py-2 text-xs text-primary-600'>
          <Sparkles className='h-3.5 w-3.5 shrink-0' />
          Ranked for this recipient using their department and profile — we never show you their private interest selections.
        </div>
      )}

      <div className='mb-3 flex flex-wrap items-center gap-2'>
        <div className='flex items-center gap-2 rounded-lg border border-grey-200 bg-grey-50/50 px-3 py-2'>
          <Search className='h-4 w-4 text-grey-400' />
          <input
            type='text'
            placeholder='Search products'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-36 bg-transparent text-sm text-blackish outline-none placeholder:text-grey-400'
          />
        </div>
      </div>

      <div className='grid max-h-80 grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2'>
        {isLoading && <p className='col-span-2 py-6 text-center text-sm text-grey-400'>Loading products…</p>}
        {!isLoading && filtered.length === 0 && (
          <p className='col-span-2 py-6 text-center text-sm text-grey-400'>No products match your filters.</p>
        )}
        {filtered.map(({ product, reason }) => {
          const isPhysical = product.giftOptionType === 'Physical Item' || product.giftOptionType === 'Wholesale Pack'
          const outOfStock = isPhysical && (product.stockQuantity ?? 0) <= 0
          return (
          <button
            key={product.id}
            type='button'
            onClick={() => !outOfStock && onSelect(product)}
            disabled={outOfStock}
            className={`rounded-xl border-2 p-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              selectedId === product.id ? 'border-primary-400 bg-primary-50/30' : 'border-grey-100 hover:border-grey-200'
            }`}
          >
            <div className='mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded-lg bg-primary-50'>
              {product.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[0]} alt={product.name} className='h-full w-full object-cover' />
              ) : (
                <span className='text-xs font-medium text-primary-400'>No image</span>
              )}
            </div>
            <p className='text-sm font-semibold text-blackish'>{product.name}</p>
            <p className='mt-1 line-clamp-2 text-xs text-grey-500'>{product.description}</p>
            <div className='mt-2 flex flex-wrap items-center justify-between gap-1.5'>
              <span className='rounded-full bg-grey-100 px-2 py-0.5 text-[11px] font-medium text-grey-600'>{product.giftOptionType}</span>
              {isPhysical && (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${outOfStock ? 'bg-error-50 text-error-500' : 'bg-success-50 text-success-600'}`}>
                  {outOfStock ? 'Out of stock' : `${product.stockQuantity} in stock`}
                </span>
              )}
              <span className='text-sm font-semibold text-blackish'>
                {product.wholesaleMinQty ? `From ₦${product.wholesaleUnitPrice?.toLocaleString()}/unit` : `₦${product.price.toLocaleString()}`}
              </span>
            </div>
            {reason && <p className='mt-1.5 text-[11px] text-primary-500'>Recommended — {reason}</p>}
          </button>
          )
        })}
      </div>
    </div>
  )
}
