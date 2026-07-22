import { request } from './client'
import type { Ticket, TicketStatus } from '@/types/Support'

type BackendPriority = 'low' | 'medium' | 'high'
type BackendStatus = 'open' | 'in_progress' | 'resolved'

interface BackendTicket {
  id: string
  subject: string
  description: string
  priority: BackendPriority
  status: BackendStatus
  createdAt: string
}

const PRIORITY_TO_DISPLAY: Record<BackendPriority, Ticket['priority']> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}
const PRIORITY_TO_BACKEND: Record<Ticket['priority'], BackendPriority> = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
}

const STATUS_TO_DISPLAY: Record<BackendStatus, TicketStatus> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}
const STATUS_TO_BACKEND: Record<TicketStatus, BackendStatus> = {
  Open: 'open',
  'In Progress': 'in_progress',
  Resolved: 'resolved',
}

const toTicket = (t: BackendTicket): Ticket => ({
  id: t.id,
  subject: t.subject,
  description: t.description,
  priority: PRIORITY_TO_DISPLAY[t.priority],
  status: STATUS_TO_DISPLAY[t.status],
  createdAt: t.createdAt,
})

export const listTickets = async (): Promise<Ticket[]> => {
  const result = await request<BackendTicket[]>({ method: 'GET', url: '/support/tickets' })
  return result.map(toTicket)
}

export const createTicket = async (payload: {
  subject: string
  description: string
  priority: Ticket['priority']
}): Promise<Ticket> => {
  const result = await request<BackendTicket>({
    method: 'POST',
    url: '/support/tickets',
    data: { ...payload, priority: PRIORITY_TO_BACKEND[payload.priority] },
  })
  return toTicket(result)
}

export const updateTicketStatus = async (id: string, status: TicketStatus): Promise<Ticket> => {
  const result = await request<BackendTicket>({
    method: 'PUT',
    url: `/support/tickets/${id}`,
    data: { status: STATUS_TO_BACKEND[status] },
  })
  return toTicket(result)
}
