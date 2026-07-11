'use client'

import { useMemo, useState } from 'react'
import { Search, Star, Sparkles } from 'lucide-react'
import { MARKETPLACE_CATEGORIES, MARKETPLACE_PRODUCTS, getRecommendedProducts } from '@/lib/mockMarketplace'
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
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('')

  const ranked = useMemo(() => {
    if (recipientEmployee) {
      return getRecommendedProducts(recipientEmployee, company ?? null, occasionLabel).map((r) => ({ product: r.product, reason: r.reason }))
    }
    return [...MARKETPLACE_PRODUCTS]
      .sort((a, b) => b.rating - a.rating)
      .map((product) => ({ product, reason: undefined as string | undefined }))
  }, [recipientEmployee, company, occasionLabel])

  const filtered = ranked.filter(({ product }) => {
    const matchCategory = category === 'All' || product.category === category
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

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
        <div className='flex flex-wrap gap-1.5'>
          {['All', ...MARKETPLACE_CATEGORIES].map((c) => (
            <button
              key={c}
              type='button'
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                category === c ? 'border-primary-400 bg-primary-50 text-primary-600' : 'border-grey-200 text-grey-600 hover:bg-grey-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className='grid max-h-80 grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2'>
        {filtered.length === 0 && (
          <p className='col-span-2 py-6 text-center text-sm text-grey-400'>No products match your filters.</p>
        )}
        {filtered.map(({ product, reason }) => (
          <button
            key={product.id}
            type='button'
            onClick={() => onSelect(product)}
            className={`rounded-xl border-2 p-3.5 text-left transition-colors ${
              selectedId === product.id ? 'border-primary-400 bg-primary-50/30' : 'border-grey-100 hover:border-grey-200'
            }`}
          >
            <div className='flex items-start justify-between gap-2'>
              <p className='text-sm font-semibold text-blackish'>{product.name}</p>
              <span className='flex shrink-0 items-center gap-0.5 text-xs text-grey-400'>
                <Star className='h-3 w-3 fill-warning-400 text-warning-400' />
                {product.rating}
              </span>
            </div>
            <p className='mt-1 line-clamp-2 text-xs text-grey-500'>{product.description}</p>
            <div className='mt-2 flex items-center justify-between'>
              <span className='rounded-full bg-grey-100 px-2 py-0.5 text-[11px] font-medium text-grey-600'>{product.giftOptionType}</span>
              <span className='text-sm font-semibold text-blackish'>
                {product.wholesaleMinQty ? `From ₦${product.wholesaleUnitPrice?.toLocaleString()}/unit` : `₦${product.price.toLocaleString()}`}
              </span>
            </div>
            {reason && <p className='mt-1.5 text-[11px] text-primary-500'>Recommended — {reason}</p>}
          </button>
        ))}
      </div>
    </div>
  )
}
