'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Wallet, Clock3, ShieldCheck, Copy, AlertTriangle, Check, Sparkles, Sliders } from 'lucide-react'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import StatCard from '@/components/Dashboard/StatCard'
import SuccessModal from '@/components/Profile/SuccessModal'
import RequireEmployeesGate from '@/components/Dashboard/RequireEmployeesGate'
import { useWallet } from '@/context/WalletContext'
import { useGifting } from '@/context/GiftingContext'
import { useEmployees } from '@/context/EmployeesContext'
import { useAuth } from '@/context/AuthContext'
import { GIFTING_TYPE_DEFINITIONS } from '@/lib/mockGiftingTypes'
import { computeAutoAllocation, scaleAllocationToFit } from '@/lib/autoAllocate'
import type { CompanyPlan } from '@/types/Company'

const PLANS: CompanyPlan[] = ['Starter', 'Growth', 'Enterprise']

export default function BudgetContent() {
  const { wallet, spendLimits, topUp, setBudgetCap, setLowBalanceThreshold, setSpendLimit, setSpendLimits } = useWallet()
  const { rules } = useGifting()
  const { employees } = useEmployees()
  const { company, updateCompany } = useAuth()

  const [showTopUp, setShowTopUp] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpError, setTopUpError] = useState('')
  const [showTopUpSuccess, setShowTopUpSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const [budgetCapInput, setBudgetCapInput] = useState(String(wallet.budgetCap))
  const [budgetPeriodInput, setBudgetPeriodInput] = useState(wallet.budgetPeriod)
  const [showBudgetSuccess, setShowBudgetSuccess] = useState(false)

  const [thresholdInput, setThresholdInput] = useState(String(wallet.lowBalanceThreshold))
  const [showThresholdSuccess, setShowThresholdSuccess] = useState(false)

  const [limitEdits, setLimitEdits] = useState<Record<string, string>>(
    Object.fromEntries(spendLimits.map((s) => [s.typeKey, String(s.maxPerGift)]))
  )
  const [showLimitsSuccess, setShowLimitsSuccess] = useState(false)

  const [allocationMode, setAllocationMode] = useState<'manual' | 'auto'>('manual')
  const [showAllocationSuccess, setShowAllocationSuccess] = useState(false)

  const handleCopyAccount = () => {
    navigator.clipboard?.writeText(wallet.virtualAccountNumber).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTopUpContinue = () => {
    const amount = Number(topUpAmount.replace(/,/g, ''))
    if (!amount || amount <= 0) {
      setTopUpError('Enter a valid top-up amount')
      return
    }
    topUp(amount)
    setShowTopUp(false)
    setShowTopUpSuccess(true)
    setTopUpAmount('')
    setTopUpError('')
  }

  const handleSaveBudgetCap = () => {
    const amount = Number(budgetCapInput)
    if (!amount || amount <= 0) return
    setBudgetCap(amount, budgetPeriodInput)
    setShowBudgetSuccess(true)
  }

  const handleSaveThreshold = () => {
    const amount = Number(thresholdInput)
    if (!amount || amount < 0) return
    setLowBalanceThreshold(amount)
    setShowThresholdSuccess(true)
  }

  const handleSaveLimits = () => {
    Object.entries(limitEdits).forEach(([typeKey, value]) => {
      const amount = Number(value)
      if (!Number.isNaN(amount) && amount >= 0) setSpendLimit(typeKey, amount)
    })
    setShowLimitsSuccess(true)
  }

  const isLowBalance = wallet.available < wallet.lowBalanceThreshold

  // Configured vs unconfigured gifting types — §6e
  const enabledRules = rules.filter((r) => r.enabled)
  const unconfiguredTypes = GIFTING_TYPE_DEFINITIONS.filter(
    (def) => def.key !== 'custom' && !rules.some((r) => r.typeKey === def.key)
  )

  // Auto-allocation — §6a/6b/6c
  const plan = company?.plan ?? 'Growth'
  const [isScaled, setIsScaled] = useState(false)

  const baseAllocation = useMemo(
    () => computeAutoAllocation({ budgetCap: wallet.budgetCap, employeeCount: employees.length, enabledRules, plan }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wallet.budgetCap, employees.length, rules, plan]
  )

  const activeAllocation = useMemo(() => {
    if (!isScaled) return baseAllocation
    const scaled = scaleAllocationToFit(baseAllocation.suggestions, wallet.budgetCap)
    const total = scaled.reduce((sum, s) => sum + s.poolAmount, 0)
    return { suggestions: scaled, totalAllocated: total, isSufficient: total <= wallet.budgetCap, shortfall: Math.max(0, total - wallet.budgetCap) }
  }, [isScaled, baseAllocation, wallet.budgetCap])

  const handleScaleToFit = () => setIsScaled(true)

  const handleApplyAllocation = () => {
    setSpendLimits(activeAllocation.suggestions.map((s) => ({ typeKey: s.typeKey, label: s.label, maxPerGift: s.suggestedMaxPerGift })))
    setLimitEdits((prev) => {
      const next = { ...prev }
      activeAllocation.suggestions.forEach((s) => { next[s.typeKey] = String(s.suggestedMaxPerGift) })
      return next
    })
    setShowAllocationSuccess(true)
  }

  return (
    <div className='flex flex-col'>
      <DashboardHeader title='Budget & Wallet' />
      <div className='p-6 lg:p-8'>
      <RequireEmployeesGate pageLabel='Budget & Wallet'>
      <div className='space-y-6'>
        <div className='rounded-lg border border-information-100 bg-information-50/60 px-4 py-3 text-xs text-information-700'>
          Your company wallet is separate from individual employees&apos; personal Giftseon wallets — it exclusively funds gifts your company sends.
        </div>

        {isLowBalance && (
          <div className='flex items-center gap-2 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-600'>
            <AlertTriangle className='h-4 w-4 shrink-0' />
            Low balance alert: your available balance (&#8358;{wallet.available.toLocaleString()}) has dropped below your threshold of &#8358;{wallet.lowBalanceThreshold.toLocaleString()}. Top up soon to avoid delayed gifts.
          </div>
        )}

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <StatCard label='Available balance' value={`₦${wallet.available.toLocaleString()}`} subtitle='Ready to fund gifts' icon={<Wallet className='h-4 w-4 text-primary-500' />} />
          <StatCard label='Amount spent' value={`₦${wallet.spent.toLocaleString()}`} subtitle={`This ${wallet.budgetPeriod} period`} icon={<Check className='h-4 w-4 text-success-500' />} iconBg='bg-success-50' />
          <StatCard label='Held in escrow' value={`₦${wallet.escrow.toLocaleString()}`} subtitle='Pending gifts not yet claimed' icon={<Clock3 className='h-4 w-4 text-warning-500' />} iconBg='bg-warning-50' />
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Top up */}
          <div className='rounded-xl border border-grey-100 bg-white p-5'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-semibold text-blackish'>Top Up via Bank Transfer</p>
              <ShieldCheck className='h-4 w-4 text-success-500' />
            </div>
            <p className='mt-1 text-xs text-grey-500'>Transfer to your dedicated company virtual account to fund your wallet instantly.</p>
            <div className='mt-4 space-y-2 rounded-lg border border-grey-100 bg-grey-50/50 p-4 text-sm'>
              <div className='flex items-center justify-between'>
                <span className='text-grey-400'>Account Number</span>
                <button onClick={handleCopyAccount} className='flex items-center gap-1.5 font-medium text-blackish hover:text-primary-500'>
                  {wallet.virtualAccountNumber} <Copy className='h-3.5 w-3.5' />
                </button>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-grey-400'>Bank Name</span>
                <span className='font-medium text-blackish'>{wallet.virtualAccountBank}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-grey-400'>Reference</span>
                <span className='font-medium text-blackish'>{wallet.virtualAccountReference}</span>
              </div>
              {copied && <p className='text-xs text-success-500'>Account number copied!</p>}
            </div>
            <button
              onClick={() => setShowTopUp(true)}
              className='mt-4 w-full rounded-lg py-2.5 text-sm font-medium text-white transition-all'
              style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
            >
              I&apos;ve made a transfer
            </button>
          </div>

          {/* Budget cap */}
          <div className='rounded-xl border border-grey-100 bg-white p-5'>
            <p className='text-sm font-semibold text-blackish'>Gifting Budget Cap</p>
            <p className='mt-1 text-xs text-grey-500'>Set a spending ceiling for your company&apos;s gifting activity.</p>
            <div className='mt-4 space-y-4'>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-grey-600'>Budget Amount (₦)</label>
                <input type='number' min={0} value={budgetCapInput} onChange={(e) => setBudgetCapInput(e.target.value)} className='form-input' />
              </div>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-grey-600'>Period</label>
                <div className='flex gap-2'>
                  {(['monthly', 'annual'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setBudgetPeriodInput(p)}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition-colors ${
                        budgetPeriodInput === p ? 'border-primary-400 bg-primary-50 text-primary-500' : 'border-grey-200 text-grey-600 hover:bg-grey-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleSaveBudgetCap} className='w-full rounded-lg border border-grey-200 py-2.5 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'>
                Save budget cap
              </button>
            </div>
          </div>
        </div>

        {/* Low balance threshold */}
        <div className='rounded-xl border border-grey-100 bg-white p-5'>
          <p className='text-sm font-semibold text-blackish'>Low Balance Alerts</p>
          <p className='mt-1 text-xs text-grey-500'>Get notified when your available balance dips below this amount.</p>
          <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-end'>
            <div className='flex-1'>
              <label className='mb-1.5 block text-sm font-medium text-grey-600'>Threshold (₦)</label>
              <input type='number' min={0} value={thresholdInput} onChange={(e) => setThresholdInput(e.target.value)} className='form-input' />
            </div>
            <button onClick={handleSaveThreshold} className='rounded-lg border border-grey-200 px-5 py-2.5 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'>
              Save threshold
            </button>
          </div>
          {Number(thresholdInput) > 0 && wallet.available < Number(thresholdInput) && (
            <div className='mt-4 flex items-center gap-2 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-600'>
              <AlertTriangle className='h-4 w-4 shrink-0' />
              Preview: with this threshold, you&apos;d see a low-balance warning right now (balance &#8358;{wallet.available.toLocaleString()}).
            </div>
          )}
        </div>

        {/* Configured gift types tracker */}
        <div className='rounded-xl border border-grey-100 bg-white'>
          <div className='border-b border-grey-100 px-5 py-4'>
            <p className='text-sm font-semibold text-blackish'>Configured Gift Types</p>
            <p className='mt-0.5 text-xs text-grey-500'>Budgeting only works for gifting types you&apos;ve set up in Gifting Configuration.</p>
          </div>
          <div className='divide-y divide-grey-50'>
            {enabledRules.map((rule) => {
              const limit = spendLimits.find((s) => s.typeKey === rule.typeKey)
              return (
                <div key={rule.id} className='flex items-center justify-between gap-4 px-5 py-3'>
                  <div className='flex items-center gap-2'>
                    <span className='h-1.5 w-1.5 rounded-full bg-success-500' />
                    <span className='text-sm text-blackish'>{rule.label}</span>
                  </div>
                  <span className='text-xs text-grey-400'>{limit ? `Max ₦${limit.maxPerGift.toLocaleString()}/gift` : 'No limit set'}</span>
                </div>
              )
            })}
            {unconfiguredTypes.map((def) => (
              <div key={def.key} className='flex items-center justify-between gap-4 px-5 py-3'>
                <div className='flex items-center gap-2'>
                  <span className='h-1.5 w-1.5 rounded-full bg-grey-300' />
                  <span className='text-sm text-grey-400'>{def.label}</span>
                </div>
                <Link href={`/gifting/new?type=${def.key}`} className='text-xs font-medium text-primary-500 hover:text-primary-600'>
                  Configure now →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Per-gift-type spend limits — manual vs auto-allocate */}
        <div className='rounded-xl border border-grey-100 bg-white'>
          <div className='flex flex-wrap items-center justify-between gap-3 border-b border-grey-100 px-5 py-4'>
            <div>
              <p className='text-sm font-semibold text-blackish'>Per-Gift-Type Spending Limits</p>
              <p className='mt-0.5 text-xs text-grey-500'>Cap how much can be spent per individual gift for each gifting type.</p>
            </div>
            <div className='flex gap-1 rounded-lg bg-grey-50 p-1'>
              <button
                onClick={() => setAllocationMode('manual')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${allocationMode === 'manual' ? 'bg-white text-primary-500 shadow-sm' : 'text-grey-500 hover:text-blackish'}`}
              >
                <Sliders className='h-3.5 w-3.5' /> Manual
              </button>
              <button
                onClick={() => setAllocationMode('auto')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${allocationMode === 'auto' ? 'bg-white text-primary-500 shadow-sm' : 'text-grey-500 hover:text-blackish'}`}
              >
                <Sparkles className='h-3.5 w-3.5' /> Auto-allocate
              </button>
            </div>
          </div>

          {allocationMode === 'manual' ? (
            <>
              <div className='divide-y divide-grey-50'>
                {spendLimits.map((limit) => (
                  <div key={limit.typeKey} className='flex items-center justify-between gap-4 px-5 py-3.5'>
                    <span className='text-sm text-blackish'>{limit.label}</span>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-grey-400'>Max ₦</span>
                      <input
                        type='number'
                        min={0}
                        value={limitEdits[limit.typeKey] ?? ''}
                        onChange={(e) => setLimitEdits((prev) => ({ ...prev, [limit.typeKey]: e.target.value }))}
                        className='w-32 rounded-lg border border-grey-200 px-3 py-1.5 text-sm text-blackish outline-none focus:border-primary-400'
                      />
                      <span className='text-sm text-grey-400'>per gift</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className='border-t border-grey-100 px-5 py-4'>
                <button onClick={handleSaveLimits} className='rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all' style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}>
                  Save spend limits
                </button>
              </div>
            </>
          ) : (
            <div className='px-5 py-4'>
              {enabledRules.length === 0 ? (
                <p className='rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-600'>
                  Auto-allocate needs at least one enabled gifting rule. <Link href='/gifting/new' className='font-medium underline'>Set one up</Link> to get a suggestion.
                </p>
              ) : (
                <>
                  <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
                    <p className='text-xs text-grey-500'>
                      Suggests a per-gift budget for each enabled type from your <strong className='text-blackish'>₦{wallet.budgetCap.toLocaleString()}</strong> {wallet.budgetPeriod} cap, <strong className='text-blackish'>{employees.length}</strong> employees, and your plan.
                    </p>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-grey-500'>Plan:</span>
                      <select
                        value={plan}
                        onChange={(e) => updateCompany({ plan: e.target.value as CompanyPlan })}
                        className='rounded-lg border border-grey-200 px-2.5 py-1.5 text-xs text-blackish outline-none focus:border-primary-400'
                      >
                        {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className='overflow-x-auto'>
                    <table className='w-full text-left text-sm'>
                      <thead>
                        <tr className='border-b border-grey-100 text-xs text-grey-400'>
                          <th className='pb-2 pr-3 font-medium'>Gift Type</th>
                          <th className='pb-2 px-3 font-medium'>Est. Gifts</th>
                          <th className='pb-2 px-3 font-medium'>Suggested Max/Gift</th>
                          <th className='pb-2 pl-3 font-medium'>Pool</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeAllocation.suggestions.map((s) => (
                          <tr key={s.typeKey} className='border-b border-grey-50'>
                            <td className='py-2.5 pr-3 text-blackish'>{s.label}</td>
                            <td className='py-2.5 px-3 text-grey-600'>{s.estimatedGifts}</td>
                            <td className='py-2.5 px-3 text-blackish'>₦{s.suggestedMaxPerGift.toLocaleString()}</td>
                            <td className='py-2.5 pl-3 text-grey-600'>₦{s.poolAmount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className='mt-3 flex items-center justify-between border-t border-grey-100 pt-3 text-sm'>
                    <span className='text-grey-500'>Total allocated</span>
                    <span className={`font-semibold ${activeAllocation.isSufficient ? 'text-blackish' : 'text-error-500'}`}>
                      ₦{activeAllocation.totalAllocated.toLocaleString()} / ₦{wallet.budgetCap.toLocaleString()}
                    </span>
                  </div>

                  {!activeAllocation.isSufficient && (
                    <div className='mt-3 rounded-lg border border-error-200 bg-error-50 px-4 py-3'>
                      <p className='flex items-start gap-2 text-sm text-error-600'>
                        <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0' />
                        Insufficient budget: this allocation needs ₦{activeAllocation.shortfall.toLocaleString()} more than your current cap.
                      </p>
                      <div className='mt-2 flex gap-2'>
                        <button onClick={handleScaleToFit} className='rounded-lg border border-error-300 px-3 py-1.5 text-xs font-medium text-error-600 hover:bg-error-100 transition-colors'>
                          Scale to fit
                        </button>
                        <button onClick={() => setShowTopUp(true)} className='rounded-lg bg-error-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-error-600 transition-colors'>
                          Top up wallet
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleApplyAllocation}
                    disabled={!activeAllocation.isSufficient}
                    className='mt-4 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-40'
                    style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
                  >
                    Apply allocation
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      </RequireEmployeesGate>
      </div>

      {/* Top up modal */}
      {showTopUp && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='w-full max-w-sm rounded-xl bg-white p-6 shadow-xl'>
            <h3 className='text-lg font-semibold text-blackish'>Company Wallet Top-Up</h3>
            <p className='mt-1 mb-5 text-sm text-grey-400'>Confirm the amount you transferred to credit your wallet.</p>
            <label className='mb-1.5 block text-sm font-medium text-grey-600'>Amount Transferred</label>
            <input
              type='text'
              value={topUpAmount ? `₦${topUpAmount}` : ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[₦,]/g, '').replace(/[^0-9]/g, '')
                setTopUpAmount(val ? Number(val).toLocaleString() : '')
                setTopUpError('')
              }}
              placeholder='₦0'
              className={`form-input ${topUpError ? 'border-error-400' : ''}`}
            />
            {topUpError && <p className='mt-1 text-xs text-error-500'>{topUpError}</p>}
            <div className='mt-5 flex gap-3'>
              <button onClick={() => setShowTopUp(false)} className='flex-1 rounded-lg border border-grey-200 py-2.5 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'>Cancel</button>
              <button onClick={handleTopUpContinue} className='flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-all' style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}>Confirm Top-Up</button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal open={showTopUpSuccess} onClose={() => setShowTopUpSuccess(false)} message='Your wallet has been credited successfully.' />
      <SuccessModal open={showBudgetSuccess} onClose={() => setShowBudgetSuccess(false)} message='Your gifting budget cap has been updated.' />
      <SuccessModal open={showThresholdSuccess} onClose={() => setShowThresholdSuccess(false)} message='Low balance alert threshold updated.' />
      <SuccessModal open={showLimitsSuccess} onClose={() => setShowLimitsSuccess(false)} message='Per-gift-type spending limits updated.' />
      <SuccessModal open={showAllocationSuccess} onClose={() => setShowAllocationSuccess(false)} message='Auto-allocated spending limits applied across your configured gift types.' />
    </div>
  )
}
