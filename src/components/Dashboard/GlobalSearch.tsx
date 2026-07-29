'use client'

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, ShoppingBag, Gift, LifeBuoy, Loader2 } from 'lucide-react'
import { listEmployees } from '@/lib/api/employees'
import { browseMarketplace } from '@/lib/api/marketplace'
import { listGiftingRules } from '@/lib/api/giftingRules'
import { listTickets } from '@/lib/api/support'

interface ResultItem {
  id: string
  title: string
  subtitle?: string
  href: string
}

interface ResultGroup {
  key: string
  label: string
  icon: ReactNode
  items: ResultItem[]
}

const useDebouncedValue = (value: string, delayMs: number) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

export default function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [groups, setGroups] = useState<ResultGroup[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebouncedValue(query, 350)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const trimmed = debouncedQuery.trim()
    if (trimmed.length < 2) {
      setGroups([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    const lower = trimmed.toLowerCase()

    Promise.allSettled([
      listEmployees({ search: trimmed, limit: 5 }),
      browseMarketplace({ search: trimmed, limit: 5 }),
      listGiftingRules(),
      listTickets(),
    ]).then(([employeesRes, marketplaceRes, rulesRes, ticketsRes]) => {
      if (cancelled) return

      const nextGroups: ResultGroup[] = []

      if (employeesRes.status === 'fulfilled' && employeesRes.value.data.length > 0) {
        nextGroups.push({
          key: 'employees',
          label: 'Employees',
          icon: <Users className='h-3.5 w-3.5' />,
          items: employeesRes.value.data.map((e) => ({
            id: e.id,
            title: e.name,
            subtitle: [e.department, e.email].filter(Boolean).join(' · ') || undefined,
            href: `/employees/${e.id}`,
          })),
        })
      }

      if (marketplaceRes.status === 'fulfilled' && marketplaceRes.value.data.length > 0) {
        nextGroups.push({
          key: 'marketplace',
          label: 'Marketplace',
          icon: <ShoppingBag className='h-3.5 w-3.5' />,
          items: marketplaceRes.value.data.map((p) => ({
            id: p.id,
            title: p.name,
            subtitle: p.giftOptionType,
            href: '/marketplace',
          })),
        })
      }

      if (rulesRes.status === 'fulfilled') {
        const matches = rulesRes.value.filter((r) => r.label.toLowerCase().includes(lower)).slice(0, 5)
        if (matches.length > 0) {
          nextGroups.push({
            key: 'gifting',
            label: 'Gifting Rules',
            icon: <Gift className='h-3.5 w-3.5' />,
            items: matches.map((r) => ({ id: r.id, title: r.label, subtitle: r.trigger, href: '/gifting' })),
          })
        }
      }

      if (ticketsRes.status === 'fulfilled') {
        const matches = ticketsRes.value
          .filter(
            (t) => t.subject.toLowerCase().includes(lower) || t.description.toLowerCase().includes(lower)
          )
          .slice(0, 5)
        if (matches.length > 0) {
          nextGroups.push({
            key: 'support',
            label: 'Support',
            icon: <LifeBuoy className='h-3.5 w-3.5' />,
            items: matches.map((t) => ({ id: t.id, title: t.subject, subtitle: t.status, href: '/support' })),
          })
        }
      }

      setGroups(nextGroups)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  const handleSelect = useCallback(
    (href: string) => {
      router.push(href)
      setOpen(false)
      setQuery('')
    },
    [router]
  )

  const hasQuery = query.trim().length >= 2
  const hasResults = groups.length > 0

  return (
    <div ref={ref} className='relative hidden sm:block'>
      <div className='flex items-center gap-2 rounded-lg border border-grey-200 bg-grey-50 px-3 py-2'>
        <Search className='h-4 w-4 shrink-0 text-grey-400' />
        <input
          type='text'
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
          }}
          placeholder='Search employees, marketplace, gifting...'
          className='w-40 bg-transparent text-sm text-blackish outline-none placeholder:text-grey-400 lg:w-64'
        />
        {loading && <Loader2 className='h-3.5 w-3.5 shrink-0 animate-spin text-grey-400' />}
      </div>

      {open && hasQuery && (
        <div className='absolute left-0 top-full z-30 mt-2 w-96 rounded-xl border border-grey-100 bg-white shadow-lg'>
          <div className='max-h-96 overflow-y-auto'>
            {!loading && !hasResults && (
              <p className='px-4 py-8 text-center text-sm text-grey-400'>No results for &ldquo;{query}&rdquo;</p>
            )}
            {groups.map((group) => (
              <div key={group.key} className='border-b border-grey-50 last:border-b-0'>
                <p className='flex items-center gap-1.5 px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-grey-400'>
                  {group.icon}
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.href)}
                    className='block w-full px-4 py-2 text-left transition-colors hover:bg-grey-50/60'
                  >
                    <p className='text-sm font-medium text-blackish'>{item.title}</p>
                    {item.subtitle && <p className='text-xs text-grey-400'>{item.subtitle}</p>}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
