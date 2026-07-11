'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CompanyWallet } from '@/types/Company'
import type { WalletTransaction, GiftTypeSpendLimit } from '@/types/Wallet'
import { GIFTING_TYPE_DEFINITIONS } from '@/lib/mockGiftingTypes'

const MOCK_WALLET: CompanyWallet = {
  available: 1250000,
  spent: 480000,
  escrow: 95000,
  budgetCap: 2000000,
  budgetPeriod: 'monthly',
  lowBalanceThreshold: 200000,
  virtualAccountNumber: '9012345678',
  virtualAccountBank: 'Providus Bank',
  virtualAccountReference: 'GBIZ-ACME-9021',
}

const MOCK_TRANSACTIONS: WalletTransaction[] = [
  { id: 'tx-1', date: 'Jul 8, 2026', description: 'Birthday Gift — Adaeze Okonkwo', type: 'Debit', amount: 25000, status: 'Completed' },
  { id: 'tx-2', date: 'Jul 5, 2026', description: 'Wallet Top-Up via Bank Transfer', type: 'Credit', amount: 500000, status: 'Completed' },
  { id: 'tx-3', date: 'Jun 28, 2026', description: 'Performance Bonus — Ngozi Umeh', type: 'Debit', amount: 100000, status: 'Completed' },
  { id: 'tx-4', date: 'Jun 20, 2026', description: 'Work Anniversary — Funmilayo Adewale', type: 'Debit', amount: 25000, status: 'Pending' },
  { id: 'tx-5', date: 'Jun 15, 2026', description: 'Compensation — Blessing Effiong', type: 'Debit', amount: 50000, status: 'Completed' },
  { id: 'tx-6', date: 'Jun 1, 2026', description: 'Wallet Top-Up via Bank Transfer', type: 'Credit', amount: 1000000, status: 'Completed' },
]

const MOCK_SPEND_LIMITS: GiftTypeSpendLimit[] = GIFTING_TYPE_DEFINITIONS.map((t, i) => ({
  typeKey: t.key,
  label: t.label,
  maxPerGift: [10000, 15000, 15000, 50000, 20000, 150000, 75000, 20000][i] ?? 20000,
}))

let txCounter = MOCK_TRANSACTIONS.length + 1

type WalletContextValue = {
  wallet: CompanyWallet
  transactions: WalletTransaction[]
  spendLimits: GiftTypeSpendLimit[]
  topUp: (amount: number) => void
  setBudgetCap: (amount: number, period: 'monthly' | 'annual') => void
  setLowBalanceThreshold: (amount: number) => void
  setSpendLimit: (typeKey: string, maxPerGift: number) => void
  setSpendLimits: (limits: { typeKey: string; label: string; maxPerGift: number }[]) => void
  recordGiftSpend: (description: string, amount: number) => { success: boolean; reason?: string }
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<CompanyWallet>(MOCK_WALLET)
  const [transactions, setTransactions] = useState<WalletTransaction[]>(MOCK_TRANSACTIONS)
  const [spendLimits, setSpendLimits] = useState<GiftTypeSpendLimit[]>(MOCK_SPEND_LIMITS)

  const topUp = useCallback((amount: number) => {
    setWallet((prev) => ({ ...prev, available: prev.available + amount }))
    setTransactions((prev) => [
      {
        id: `tx-${txCounter++}`,
        date: 'Just now',
        description: 'Wallet Top-Up via Bank Transfer',
        type: 'Credit',
        amount,
        status: 'Completed',
      },
      ...prev,
    ])
  }, [])

  const setBudgetCap = useCallback((amount: number, period: 'monthly' | 'annual') => {
    setWallet((prev) => ({ ...prev, budgetCap: amount, budgetPeriod: period }))
  }, [])

  const setLowBalanceThreshold = useCallback((amount: number) => {
    setWallet((prev) => ({ ...prev, lowBalanceThreshold: amount }))
  }, [])

  const setSpendLimit = useCallback((typeKey: string, maxPerGift: number) => {
    setSpendLimits((prev) => prev.map((s) => (s.typeKey === typeKey ? { ...s, maxPerGift } : s)))
  }, [])

  const setSpendLimitsBulk = useCallback((limits: { typeKey: string; label: string; maxPerGift: number }[]) => {
    setSpendLimits((prev) => {
      const next = [...prev]
      limits.forEach((limit) => {
        const idx = next.findIndex((s) => s.typeKey === limit.typeKey)
        if (idx >= 0) next[idx] = { ...next[idx], maxPerGift: limit.maxPerGift }
        else next.push(limit)
      })
      return next
    })
  }, [])

  const recordGiftSpend = useCallback((description: string, amount: number) => {
    let result: { success: boolean; reason?: string } = { success: true }
    setWallet((prev) => {
      if (amount > prev.available) {
        result = { success: false, reason: `Insufficient budget: this gift needs ₦${amount.toLocaleString()} but only ₦${prev.available.toLocaleString()} is available.` }
        return prev
      }
      return { ...prev, available: prev.available - amount, spent: prev.spent + amount }
    })
    if (result.success) {
      setTransactions((prev) => [
        { id: `tx-${txCounter++}`, date: 'Just now', description, type: 'Debit', amount, status: 'Completed' },
        ...prev,
      ])
    }
    return result
  }, [])

  const value = useMemo(
    () => ({
      wallet,
      transactions,
      spendLimits,
      topUp,
      setBudgetCap,
      setLowBalanceThreshold,
      setSpendLimit,
      setSpendLimits: setSpendLimitsBulk,
      recordGiftSpend,
    }),
    [wallet, transactions, spendLimits, topUp, setBudgetCap, setLowBalanceThreshold, setSpendLimit, setSpendLimitsBulk, recordGiftSpend]
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export const useWallet = () => {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
