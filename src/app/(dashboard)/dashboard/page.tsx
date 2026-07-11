'use client'

import Link from 'next/link'
import { Gift, Clock, CheckCircle2, Wallet as WalletIcon, ArrowRight, Sparkles } from 'lucide-react'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import StatCard from '@/components/Dashboard/StatCard'
import EmptyState from '@/components/Dashboard/EmptyState'
import RequireEmployeesGate from '@/components/Dashboard/RequireEmployeesGate'
import { useAuth } from '@/context/AuthContext'
import { useGifting } from '@/context/GiftingContext'
import { useEmployees } from '@/context/EmployeesContext'
import { useWallet } from '@/context/WalletContext'

const RECENT_ACTIVITY = [
  { id: 'act-1', employee: 'Adaeze Okonkwo', occasion: 'Birthday Gift', amount: 25000, status: 'Delivered', date: 'Jul 8, 2026' },
  { id: 'act-2', employee: 'Ngozi Umeh', occasion: 'Performance Bonus', amount: 100000, status: 'Claimed', date: 'Jun 28, 2026' },
  { id: 'act-3', employee: 'Funmilayo Adewale', occasion: 'Work Anniversary', amount: 25000, status: 'Pending', date: 'Jun 20, 2026' },
  { id: 'act-4', employee: 'Blessing Effiong', occasion: 'Compensation', amount: 50000, status: 'Delivered', date: 'Jun 15, 2026' },
]

const STATUS_STYLES: Record<string, string> = {
  Delivered: 'bg-success-50 text-success-500',
  Claimed: 'bg-information-50 text-information-500',
  Pending: 'text-warning-500',
}

export default function DashboardPage() {
  const { company } = useAuth()
  const { rules } = useGifting()
  const { employees } = useEmployees()
  const { wallet } = useWallet()

  const enabledRules = rules.filter((r) => r.enabled)
  const hasGiftingConfigured = enabledRules.length > 0

  const giftsSent = RECENT_ACTIVITY.length + 41
  const giftsClaimed = 28
  const giftsPending = RECENT_ACTIVITY.filter((a) => a.status === 'Pending').length + 2

  return (
    <div className='flex flex-col'>
      <DashboardHeader title='Dashboard' />

      <div className='p-6 lg:p-8'>
      <RequireEmployeesGate pageLabel='Your dashboard'>
      <div className='space-y-6'>
        {!hasGiftingConfigured && (
          <div className='flex flex-col items-start gap-4 rounded-xl border border-primary-100 bg-primary-50/40 p-5 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-start gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100'>
                <Sparkles className='h-5 w-5 text-primary-500' />
              </div>
              <div>
                <p className='text-sm font-semibold text-blackish'>Set up your first gifting rule</p>
                <p className='mt-0.5 text-xs text-grey-500'>
                  {company?.companyName || 'Your company'} doesn&apos;t have any active gifting rules yet. Configure birthdays, anniversaries, or a custom occasion to start celebrating your team automatically.
                </p>
              </div>
            </div>
            <Link
              href='/gifting/new'
              className='flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all'
              style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
            >
              Configure gifting <ArrowRight className='h-4 w-4' />
            </Link>
          </div>
        )}

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <StatCard label='Gifts sent' value={String(giftsSent)} subtitle='All-time gifts triggered' icon={<Gift className='h-4 w-4 text-primary-500' />} />
          <StatCard label='Gifts claimed' value={String(giftsClaimed)} subtitle='Successfully redeemed' icon={<CheckCircle2 className='h-4 w-4 text-success-500' />} iconBg='bg-success-50' />
          <StatCard label='Gifts pending' value={String(giftsPending)} subtitle='Awaiting delivery or claim' icon={<Clock className='h-4 w-4 text-warning-500' />} iconBg='bg-warning-50' />
          <StatCard label='Wallet spend' value={`₦${wallet.spent.toLocaleString()}`} subtitle={`Of ₦${wallet.budgetCap.toLocaleString()} ${wallet.budgetPeriod} budget`} icon={<WalletIcon className='h-4 w-4 text-information-500' />} iconBg='bg-information-50' />
        </div>

        <div className='grid grid-cols-1 gap-6 xl:grid-cols-5'>
          <div className='rounded-xl border border-grey-100 bg-white xl:col-span-3'>
            <div className='flex items-center justify-between border-b border-grey-100 px-5 py-4'>
              <p className='text-sm font-semibold text-blackish'>Recent Gifting Activity</p>
              <Link href='/reports' className='text-xs font-medium text-primary-500 hover:text-primary-600'>View all</Link>
            </div>
            {RECENT_ACTIVITY.length === 0 ? (
              <EmptyState message='No gifting activity yet. Configure a rule to get started.' />
            ) : (
              <div className='divide-y divide-grey-50'>
                {RECENT_ACTIVITY.map((a) => (
                  <div key={a.id} className='flex items-center justify-between px-5 py-3.5'>
                    <div>
                      <p className='text-sm font-medium text-blackish'>{a.employee}</p>
                      <p className='text-xs text-grey-400'>{a.occasion} &bull; {a.date}</p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='text-sm text-blackish'>&#8358;{a.amount.toLocaleString()}</span>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[a.status]}`}>{a.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='rounded-xl border border-grey-100 bg-white p-5 xl:col-span-2'>
            <p className='text-sm font-semibold text-blackish'>Team Snapshot</p>
            <div className='mt-4 space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-grey-500'>Total employees</span>
                <span className='text-sm font-semibold text-blackish'>{employees.length}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-grey-500'>Profiles complete</span>
                <span className='text-sm font-semibold text-blackish'>
                  {employees.filter((e) => e.profileCompletion === 'Complete').length} / {employees.length}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-grey-500'>Active gifting rules</span>
                <span className='text-sm font-semibold text-blackish'>{enabledRules.length} / {rules.length}</span>
              </div>
            </div>
            <Link
              href='/employees'
              className='mt-5 block rounded-lg border border-grey-200 py-2.5 text-center text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'
            >
              Manage employees
            </Link>
          </div>
        </div>
      </div>
      </RequireEmployeesGate>
      </div>
    </div>
  )
}
