export type TicketStatus = 'Open' | 'In Progress' | 'Resolved'

export interface Ticket {
  id: string
  subject: string
  description: string
  priority: 'Low' | 'Medium' | 'High'
  status: TicketStatus
  createdAt: string
}

export interface ChatMessage {
  id: number
  from: 'bot' | 'user'
  text: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface FaqCategory {
  title: string
  items: FaqItem[]
}
