export type WalletTransactionType = 'Credit' | 'Debit'
export type WalletTransactionStatus = 'Completed' | 'Pending' | 'Failed'

export interface WalletTransaction {
  id: string
  date: string
  description: string
  type: WalletTransactionType
  amount: number
  status: WalletTransactionStatus
}

export interface GiftTypeSpendLimit {
  typeKey: string
  label: string
  maxPerGift: number
}
