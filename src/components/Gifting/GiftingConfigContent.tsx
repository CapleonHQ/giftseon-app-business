'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Gift } from 'lucide-react'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import { useGifting } from '@/context/GiftingContext'
import { GIFTING_TYPE_DEFINITIONS } from '@/lib/mockGiftingTypes'

export default function GiftingConfigContent() {
  const router = useRouter()
  const { rules, toggleRule } = useGifting()

  return (
    <div className='flex flex-col'>
      <DashboardHeader title='Gifting Configuration' />
      <div className='p-6 lg:p-8'>
        <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-semibold text-blackish'>Gifting Types</p>
            <p className='mt-0.5 text-xs text-grey-500'>Configure how and when your company automatically celebrates employees.</p>
          </div>
          <button
            onClick={() => router.push('/gifting/new')}
            className='flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all'
            style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
          >
            <Plus className='h-4 w-4' /> New gifting rule
          </button>
        </div>

        <div className='space-y-3'>
          {GIFTING_TYPE_DEFINITIONS.map((def) => {
            const rule = rules.find((r) => r.typeKey === def.key)
            return (
              <div key={def.key} className='flex flex-col gap-4 rounded-xl border border-grey-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-3'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50'>
                    <Gift className='h-5 w-5 text-primary-500' />
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-blackish'>{def.label}</p>
                    <p className='mt-0.5 text-xs text-grey-500'>{def.trigger}</p>
                    {rule ? (
                      <div className='mt-2 flex flex-wrap items-center gap-2 text-xs'>
                        <span className='rounded-full bg-grey-100 px-2.5 py-0.5 font-medium text-grey-600'>{rule.giftFormat}</span>
                        <span className='rounded-full bg-grey-100 px-2.5 py-0.5 font-medium text-grey-600'>
                          {rule.variesByTier ? 'Varies by tier' : `Up to ₦${rule.budget.toLocaleString()}`}
                        </span>
                      </div>
                    ) : (
                      <p className='mt-2 text-xs text-grey-400'>Not configured yet — {def.whatIsSent}</p>
                    )}
                  </div>
                </div>

                <div className='flex shrink-0 items-center gap-3 pl-13 sm:pl-0'>
                  {rule && (
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${rule.enabled ? 'bg-primary-500' : 'bg-grey-200'}`}
                      aria-label='Toggle rule'
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${rule.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  )}
                  <Link
                    href={`/gifting/new?type=${def.key}${rule ? `&edit=${rule.id}` : ''}`}
                    className='rounded-lg border border-grey-200 px-3.5 py-2 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'
                  >
                    {rule ? 'Edit' : 'Configure'}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
