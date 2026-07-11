'use client'

import { useMemo, useState } from 'react'
import { Search, Star, Gift, Package } from 'lucide-react'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import SendGiftModal from '@/components/Employees/SendGiftModal'
import { MARKETPLACE_CATEGORIES, MARKETPLACE_PRODUCTS } from '@/lib/mockMarketplace'
import type { MarketplaceProduct } from '@/types/Marketplace'

const BUDGET_RANGES = [
  { label: 'Any budget', min: 0, max: Infinity },
  { label: 'Under ₦20,000', min: 0, max: 20000 },
  { label: '₦20,000 – ₦50,000', min: 20000, max: 50000 },
  { label: 'Above ₦50,000', min: 50000, max: Infinity },
]

export default function MarketplaceContent() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [budgetIndex, setBudgetIndex] = useState(0)
  const [sendGiftProduct, setSendGiftProduct] = useState<MarketplaceProduct | null>(null)

  const budgetRange = BUDGET_RANGES[budgetIndex]

  const filtered = useMemo(() => {
    return MARKETPLACE_PRODUCTS.filter((product) => {
      const matchCategory = category === 'All' || product.category === category
      const matchSearch = product.name.toLowerCase().includes(search.toLowerCase()) || product.description.toLowerCase().includes(search.toLowerCase())
      const effectivePrice = product.wholesaleUnitPrice ?? product.price
      const matchBudget = effectivePrice >= budgetRange.min && effectivePrice <= budgetRange.max
      return matchCategory && matchSearch && matchBudget
    })
  }, [category, search, budgetRange])

  return (
    <>
      <div className='flex flex-col'>
        <DashboardHeader title='Marketplace' />
        <div className='p-6 lg:p-8'>
          <p className='mb-5 max-w-2xl text-xs text-grey-500'>
            A curated catalog for corporate gifting — vouchers, prepaid cards, curated packs, and wholesale bundles for team-wide rollouts. Send any item straight to an employee, group, or department.
          </p>

          <div className='mb-5 flex flex-wrap items-center gap-3'>
            <div className='flex items-center gap-2 rounded-lg border border-grey-200 bg-grey-50/50 px-3 py-2'>
              <Search className='h-4 w-4 text-grey-400' />
              <input
                type='text'
                placeholder='Search products'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-40 bg-transparent text-sm text-blackish outline-none placeholder:text-grey-400 lg:w-56'
              />
            </div>
            <select value={budgetIndex} onChange={(e) => setBudgetIndex(Number(e.target.value))} className='form-input w-auto text-sm'>
              {BUDGET_RANGES.map((range, i) => <option key={range.label} value={i}>{range.label}</option>)}
            </select>
            <div className='flex flex-wrap gap-1.5'>
              {['All', ...MARKETPLACE_CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    category === c ? 'border-primary-400 bg-primary-50 text-primary-600' : 'border-grey-200 text-grey-600 hover:bg-grey-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className='rounded-xl border border-grey-100 bg-white py-16 text-center text-sm text-grey-400'>
              No products match your filters. Try a different category or budget range.
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
              {filtered.map((product) => (
                <div key={product.id} className='flex flex-col rounded-xl border border-grey-100 bg-white p-4'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50'>
                      <Package className='h-5 w-5 text-primary-500' />
                    </div>
                    <span className='flex items-center gap-1 text-xs text-grey-400'>
                      <Star className='h-3 w-3 fill-warning-400 text-warning-400' /> {product.rating}
                    </span>
                  </div>
                  <p className='mt-3 text-sm font-semibold text-blackish'>{product.name}</p>
                  <p className='mt-1 flex-1 text-xs text-grey-500'>{product.description}</p>
                  <div className='mt-3 flex flex-wrap items-center gap-1.5'>
                    <span className='rounded-full bg-grey-100 px-2 py-0.5 text-[11px] font-medium text-grey-600'>{product.giftOptionType}</span>
                    {product.corporateOnly && (
                      <span className='rounded-full bg-information-50 px-2 py-0.5 text-[11px] font-medium text-information-600'>Corporate</span>
                    )}
                  </div>
                  <div className='mt-3 flex items-center justify-between'>
                    <div>
                      {product.wholesaleMinQty ? (
                        <>
                          <p className='text-sm font-semibold text-blackish'>₦{product.wholesaleUnitPrice?.toLocaleString()}/unit</p>
                          <p className='text-[11px] text-grey-400'>Min. {product.wholesaleMinQty} units</p>
                        </>
                      ) : (
                        <p className='text-sm font-semibold text-blackish'>₦{product.price.toLocaleString()}</p>
                      )}
                    </div>
                    <p className='text-[11px] text-grey-400'>{product.deliveryEstimate}</p>
                  </div>
                  <button
                    onClick={() => setSendGiftProduct(product)}
                    className='mt-3 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-white transition-all'
                    style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
                  >
                    <Gift className='h-3.5 w-3.5' /> Send as gift
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SendGiftModal
        open={!!sendGiftProduct}
        onClose={() => setSendGiftProduct(null)}
        initialProductId={sendGiftProduct?.id}
      />
    </>
  )
}
