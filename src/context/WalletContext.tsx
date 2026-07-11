'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CompanyWallet } from '@/types/Company'
import type { WalletTransaction, GiftTypeSpendLimit } from '@/types/Wallet'
import * as walletApi from '@/lib/api/wallet'

const DEFAULT_WALLET: CompanyWallet = {
  available: 0,
  spent: 0,
  escrow: 0,
  budgetCap: 0,
  budgetPeriod: 'monthly',
  lowBalanceThreshold: 0,
  virtualAccountNumber: '',
  virtualAccountBank: '',
  virtualAccountReference: '',
}

type WalletContextValue = {
  wallet: CompanyWallet
  transactions: WalletTransaction[]
  spendLimits: GiftTypeSpendLimit[]
  isLoading: boolean
  /** Re-fetches the real balance from the funding webhook path — there's no client-side credit action. */
  refresh: () => void
  setBudgetCap: (amount: number, period: 'monthly' | 'annual') => void
  setLowBalanceThreshold: (amount: number) => void
  setSpendLimit: (typeKey: string, maxPerGift: number) => void
  setSpendLimits: (limits: { typeKey: string; label: string; maxPerGift: number }[]) => void
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

const WALLET_QUERY_KEY = ['wallet'] as const
const TRANSACTIONS_QUERY_KEY = ['wallet', 'transactions'] as const

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()

  const { data: overview, isLoading: walletLoading } = useQuery({
    queryKey: WALLET_QUERY_KEY,
    queryFn: walletApi.getWallet,
  })
  const { data: txResult, isLoading: txLoading } = useQuery({
    queryKey: TRANSACTIONS_QUERY_KEY,
    queryFn: () => walletApi.getWalletTransactions({ limit: 50 }),
  })

  const wallet = overview?.wallet ?? DEFAULT_WALLET
  const spendLimits = overview?.spendLimits ?? []
  const transactions = txResult?.data ?? []

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
  }

  const budgetMutation = useMutation({
    mutationFn: walletApi.updateBudget,
    onSuccess: invalidate,
  })

  const refresh = () => invalidate()

  const setBudgetCap = (amount: number, period: 'monthly' | 'annual') => {
    budgetMutation.mutate({ budgetCap: amount, budgetPeriod: period })
  }

  const setLowBalanceThreshold = (amount: number) => {
    budgetMutation.mutate({ lowBalanceThreshold: amount })
  }

  const setSpendLimit = (typeKey: string, maxPerGift: number) => {
    const next = spendLimits.map((s) => (s.typeKey === typeKey ? { ...s, maxPerGift } : s))
    if (!next.some((s) => s.typeKey === typeKey)) {
      next.push({ typeKey, label: typeKey, maxPerGift })
    }
    budgetMutation.mutate({ spendLimits: next })
  }

  const setSpendLimits = (limits: { typeKey: string; label: string; maxPerGift: number }[]) => {
    const next = [...spendLimits]
    limits.forEach((limit) => {
      const idx = next.findIndex((s) => s.typeKey === limit.typeKey)
      if (idx >= 0) next[idx] = { ...next[idx], maxPerGift: limit.maxPerGift }
      else next.push(limit)
    })
    budgetMutation.mutate({ spendLimits: next })
  }

  const value = useMemo<WalletContextValue>(
    () => ({
      wallet,
      transactions,
      spendLimits,
      isLoading: walletLoading || txLoading,
      refresh,
      setBudgetCap,
      setLowBalanceThreshold,
      setSpendLimit,
      setSpendLimits,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wallet, transactions, spendLimits, walletLoading, txLoading]
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export const useWallet = () => {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
