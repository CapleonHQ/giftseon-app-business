'use client'

import { useState } from 'react'
import { Wallet, Clock3, ShieldCheck, Copy, AlertTriangle, Check } from 'lucide-react'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import StatCard from '@/components/Dashboard/StatCard'
import SuccessModal from '@/components/Profile/SuccessModal'
import { useWallet } from '@/context/WalletContext'

export default function BudgetContent() {
  const { wallet, spendLimits, topUp, setBudgetCap, setLowBalanceThreshold, setSpendLimit } = useWallet()

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

  return (
    <div className='flex flex-col'>
      <DashboardHeader title='Budget & Wallet' />
      <div className='p-6 lg:p-8 space-y-6'>
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

        {/* Per-gift-type spend limits */}
        <div className='rounded-xl border border-grey-100 bg-white'>
          <div className='border-b border-grey-100 px-5 py-4'>
            <p className='text-sm font-semibold text-blackish'>Per-Gift-Type Spending Limits</p>
            <p className='mt-0.5 text-xs text-grey-500'>Cap how much can be spent per individual gift for each gifting type.</p>
          </div>
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
        </div>
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
    </div>
  )
}
