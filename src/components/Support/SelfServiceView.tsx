'use client'

import { useState } from 'react'
import { ArrowLeft, Search, Plus, Minus } from 'lucide-react'
import { FAQ_DATA } from '@/lib/mockSupport'

interface SelfServiceViewProps {
  onBack: () => void
}

export default function SelfServiceView({ onBack }: SelfServiceViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleItem = (key: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const filteredData = FAQ_DATA.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.items.length > 0)

  return (
    <div className='mx-auto max-w-3xl'>
      <button
        onClick={onBack}
        className='mb-4 flex items-center gap-2 text-sm font-medium text-grey-600 hover:text-blackish transition-colors'
      >
        <ArrowLeft className='h-4 w-4' />
        Self-service
      </button>

      <div className='rounded-xl border border-grey-100 bg-white'>
        <div className='border-b border-grey-100 px-6 pt-4'>
          <button className='relative px-4 py-3 text-sm font-medium text-primary-500'>
            FAQs
            <span className='absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary-500' />
          </button>
        </div>

        <div className='p-6'>
          <div className='mb-6 text-center'>
            <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center'>
              <svg width='40' height='40' viewBox='0 0 40 40' fill='none'>
                <circle cx='20' cy='20' r='18' stroke='var(--primary-200)' strokeWidth='1.5' />
                <text x='20' y='25' textAnchor='middle' fill='var(--primary-500)' fontSize='18' fontWeight='600'>?</text>
              </svg>
            </div>
            <p className='text-sm text-grey-500'>
              Find answers about employees, gifting configuration, budget, and your account.
            </p>
          </div>

          <div className='mb-6 flex items-center gap-2 rounded-lg border border-grey-200 bg-grey-50/50 px-3 py-2.5'>
            <Search className='h-4 w-4 text-grey-400' />
            <input
              type='text'
              placeholder='Search'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full bg-transparent text-sm text-blackish outline-none placeholder:text-grey-400'
            />
          </div>

          <div className='space-y-6'>
            {filteredData.map((category) => (
              <div key={category.title}>
                <p className='mb-3 text-xs font-semibold tracking-wide text-grey-500'>
                  {category.title}
                </p>
                <div className='space-y-1'>
                  {category.items.map((item) => {
                    const key = `${category.title}-${item.question}`
                    const isExpanded = expandedItems.has(key)
                    return (
                      <div key={key} className='border-b border-grey-50'>
                        <button
                          onClick={() => toggleItem(key)}
                          className='flex w-full items-center justify-between py-3 text-left'
                        >
                          <span className='text-sm text-blackish pr-4'>{item.question}</span>
                          {isExpanded ? (
                            <Minus className='h-4 w-4 shrink-0 text-grey-400' />
                          ) : (
                            <Plus className='h-4 w-4 shrink-0 text-grey-400' />
                          )}
                        </button>
                        {isExpanded && (
                          <div className='pb-3 pr-8'>
                            <p className='text-sm text-grey-500 leading-relaxed'>{item.answer}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {filteredData.length === 0 && (
              <p className='py-8 text-center text-sm text-grey-400'>
                No results found for &quot;{searchQuery}&quot;
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
