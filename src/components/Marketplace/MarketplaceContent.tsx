'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Package, Gift } from 'lucide-react'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import SendGiftModal from '@/components/Employees/SendGiftModal'
import { browseMarketplace } from '@/lib/api/marketplace'
import type { MarketplaceProduct } from '@/types/Marketplace'

const OCCASIONS = ['Birthday', 'Wedding', 'Graduation', 'Promotion', 'New Baby', 'Just Because']

const BUDGET_RANGES = [
  { label: 'Any budget', min: 0, max: Infinity },
  { label: 'Under ₦20,000', min: 0, max: 20000 },
  { label: '₦20,000 – ₦50,000', min: 20000, max: 50000 },
  { label: 'Above ₦50,000', min: 50000, max: Infinity },
]

const useDebouncedValue = (value: string, delayMs: number) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

export default function MarketplaceContent() {
  const [occasion, setOccasion] = useState('All')
  const [search, setSearch] = useState('')
  const [budgetIndex, setBudgetIndex] = useState(0)
  const [sendGiftProduct, setSendGiftProduct] = useState<MarketplaceProduct | null>(null)

  const debouncedSearch = useDebouncedValue(search, 400)
  const budgetRange = BUDGET_RANGES[budgetIndex]

  const { data, isLoading } = useQuery({
    queryKey: ['marketplace', { search: debouncedSearch, occasion }],
    queryFn: () =>
      browseMarketplace({
        search: debouncedSearch || undefined,
        occasion: occasion === 'All' ? undefined : occasion,
        limit: 60,
      }),
  })

  const products = data?.data ?? []
  const filtered = products.filter((product) => {
    const effectivePrice = product.wholesaleUnitPrice ?? product.price
    return effectivePrice >= budgetRange.min && effectivePrice <= budgetRange.max
  })

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
              {['All', ...OCCASIONS].map((o) => (
                <button
                  key={o}
                  onClick={() => setOccasion(o)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    occasion === o ? 'border-primary-400 bg-primary-50 text-primary-600' : 'border-grey-200 text-grey-600 hover:bg-grey-50'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className='flex justify-center py-16'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500' />
            </div>
          ) : filtered.length === 0 ? (
            <div className='rounded-xl border border-grey-100 bg-white py-16 text-center text-sm text-grey-400'>
              No products match your filters. Try a different occasion or budget range.
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
              {filtered.map((product) => {
                const isPhysical = product.giftOptionType === 'Physical Item' || product.giftOptionType === 'Wholesale Pack'
                const outOfStock = isPhysical && (product.stockQuantity ?? 0) <= 0
                return (
                <div key={product.id} className='flex flex-col rounded-xl border border-grey-100 bg-white p-4'>
                  <div className='flex h-32 w-full items-center justify-center overflow-hidden rounded-lg bg-primary-50'>
                    {product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0]} alt={product.name} className='h-full w-full object-cover' />
                    ) : (
                      <Package className='h-8 w-8 text-primary-500' />
                    )}
                  </div>
                  <p className='mt-3 text-sm font-semibold text-blackish'>{product.name}</p>
                  <p className='mt-1 flex-1 text-xs text-grey-500'>{product.description}</p>
                  <div className='mt-3 flex flex-wrap items-center gap-1.5'>
                    <span className='rounded-full bg-grey-100 px-2 py-0.5 text-[11px] font-medium text-grey-600'>{product.giftOptionType}</span>
                    {product.corporateOnly && (
                      <span className='rounded-full bg-information-50 px-2 py-0.5 text-[11px] font-medium text-information-600'>Corporate</span>
                    )}
                    {isPhysical && (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${outOfStock ? 'bg-error-50 text-error-500' : 'bg-success-50 text-success-600'}`}>
                        {outOfStock ? 'Out of stock' : `${product.stockQuantity} in stock`}
                      </span>
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
                  </div>
                  <button
                    onClick={() => setSendGiftProduct(product)}
                    disabled={outOfStock}
                    className='mt-3 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-50'
                    style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
                  >
                    <Gift className='h-3.5 w-3.5' /> Send as gift
                  </button>
                </div>
                )
              })}
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
