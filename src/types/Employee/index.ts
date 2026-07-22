export type ProfileCompletionStatus = 'Complete' | 'Incomplete'

export interface EmployeeGiftHistoryItem {
  id: string
  occasion: string
  date: string
  amount: number
  status: 'Delivered' | 'Claimed' | 'Pending' | 'Failed'
}

export interface Employee {
  id: string
  name: string
  tag?: string
  email: string
  phone: string
  department: string
  role: string
  dateOfJoining: string
  dateOfBirth: string
  profileCompletion: ProfileCompletionStatus
  interestsSet: boolean
  giftHistory: EmployeeGiftHistoryItem[]
  source: 'spreadsheet' | 'tag' | 'manual'
}

export interface DirectoryUser {
  tag: string
  name: string
  phone: string
  email: string
}

export type ParsedRow = {
  name: string
  phone: string
  email: string
  role: string
  department: string
  dateOfJoining: string
  dateOfBirth: string
  error?: string
}
