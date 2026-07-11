import { request } from './client'
import type { CompanyWallet } from '@/types/Company'
import type { WalletTransaction, GiftTypeSpendLimit } from '@/types/Wallet'

interface BackendVirtualAccount {
  accountNumber: string | null
  accountName: string | null
  bankName: string | null
  currency: string
  status: 'pending' | 'active' | 'deactivated'
}

interface BackendWalletResponse {
  balance: number
  topupBalance: number
  receivedBalance: number
  withdrawableBalance: number
  currency: string
  virtualAccount: BackendVirtualAccount | null
  budgetCap?: number
  budgetPeriod: 'monthly' | 'annual'
  lowBalanceThreshold?: number
  spendLimits: GiftTypeSpendLimit[]
}

/**
 * Backend's wallet overview has no "spent"/"escrow" concept and no virtual
 * account reference field — defaulted here (known display gap; spent/escrow
 * would need a dedicated aggregation endpoint that doesn't exist yet).
 */
const toCompanyWallet = (res: BackendWalletResponse): CompanyWallet => ({
  available: Number(res.withdrawableBalance ?? res.balance ?? 0),
  spent: 0,
  escrow: 0,
  budgetCap: Number(res.budgetCap ?? 0),
  budgetPeriod: res.budgetPeriod ?? 'monthly',
  lowBalanceThreshold: Number(res.lowBalanceThreshold ?? 0),
  virtualAccountNumber: res.virtualAccount?.accountNumber ?? '',
  virtualAccountBank: res.virtualAccount?.bankName ?? '',
  virtualAccountReference: '',
})

interface BackendTransaction {
  id: string
  reference: string
  amount: number
  currency: string
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'reversed'
  type: 'credit' | 'debit'
  source: string
  description?: string
  createdAt: string
}

const STATUS_MAP: Record<BackendTransaction['status'], WalletTransaction['status']> = {
  success: 'Completed',
  pending: 'Pending',
  failed: 'Failed',
  cancelled: 'Failed',
  reversed: 'Failed',
}

const toWalletTransaction = (tx: BackendTransaction): WalletTransaction => ({
  id: tx.id,
  date: new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  description: tx.description || tx.source,
  type: tx.type === 'credit' ? 'Credit' : 'Debit',
  amount: Number(tx.amount),
  status: STATUS_MAP[tx.status],
})

export interface WalletOverview {
  wallet: CompanyWallet
  spendLimits: GiftTypeSpendLimit[]
}

export const getWallet = async (): Promise<WalletOverview> => {
  const res = await request<BackendWalletResponse>({ method: 'GET', url: '/company/wallet' })
  return { wallet: toCompanyWallet(res), spendLimits: res.spendLimits ?? [] }
}

export interface TransactionListResult {
  data: WalletTransaction[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export const getWalletTransactions = async (query?: {
  page?: number
  limit?: number
}): Promise<TransactionListResult> => {
  const res = await request<{
    transactions: BackendTransaction[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }>({ method: 'GET', url: '/company/wallet/transactions', params: query })
  return { data: res.transactions.map(toWalletTransaction), pagination: res.pagination }
}

export interface UpdateBudgetPayload {
  budgetCap?: number
  budgetPeriod?: 'monthly' | 'annual'
  lowBalanceThreshold?: number
  spendLimits?: GiftTypeSpendLimit[]
}

export const updateBudget = async (payload: UpdateBudgetPayload): Promise<WalletOverview['wallet']> => {
  const res = await request<{
    budgetCap?: number
    budgetPeriod: 'monthly' | 'annual'
    lowBalanceThreshold?: number
  }>({ method: 'PUT', url: '/company/wallet/budget', data: payload })
  return {
    available: 0,
    spent: 0,
    escrow: 0,
    budgetCap: Number(res.budgetCap ?? 0),
    budgetPeriod: res.budgetPeriod,
    lowBalanceThreshold: Number(res.lowBalanceThreshold ?? 0),
    virtualAccountNumber: '',
    virtualAccountBank: '',
    virtualAccountReference: '',
  }
}
