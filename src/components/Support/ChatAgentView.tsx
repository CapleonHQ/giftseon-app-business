'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import SuccessModal from '@/components/Profile/SuccessModal'
import type { TicketStatus } from '@/types/Support'
import * as supportApi from '@/lib/api/support'
import type { ApiError } from '@/lib/api/client'
import { useAuth } from '@/context/AuthContext'

const STATUS_STYLES: Record<TicketStatus, string> = {
  Open: 'bg-warning-50 text-warning-500',
  'In Progress': 'bg-information-50 text-information-500',
  Resolved: 'bg-success-50 text-success-500',
}

const TICKETS_QUERY_KEY = ['support-tickets'] as const

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xaqrvqkb'

/** Best-effort — the ticket is already persisted via the backend; this just
 * makes sure a human sees it show up as an email too. Never blocks the UI. */
const notifyFormspree = async (fields: Record<string, string>) => {
  try {
    await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(fields),
    })
  } catch {
    // swallow — the real ticket record already exists via the backend
  }
}

export default function ChatAgentView({ onBack }: { onBack: () => void }) {
  const queryClient = useQueryClient()
  const { user, company } = useAuth()
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: TICKETS_QUERY_KEY,
    queryFn: supportApi.listTickets,
  })

  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const createMutation = useMutation({ mutationFn: supportApi.createTicket })

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      setError('Fill in both the subject and description.')
      return
    }
    setError('')
    setIsSubmitting(true)
    try {
      await createMutation.mutateAsync({ subject, description, priority })
      notifyFormspree({
        _subject: `[Business Support] ${subject}`,
        email: user?.email ?? '',
        name: user ? `${user.firstName} ${user.lastName}` : '',
        company: company?.companyName ?? '',
        subject,
        priority,
        message: description,
      })
      queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY })
      setSubject('')
      setDescription('')
      setPriority('Medium')
      setShowSuccess(true)
    } catch (err) {
      setError((err as ApiError).message || 'Could not create ticket. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className='mx-auto max-w-2xl'>
        <button onClick={onBack} className='mb-5 flex items-center gap-2 text-sm text-grey-500 hover:text-blackish transition-colors'>
          <ArrowLeft className='h-4 w-4' />
          Back to Support
        </button>

        <div className='rounded-xl border border-grey-100 bg-white p-6'>
          <h3 className='mb-1 text-sm font-semibold text-blackish'>Chat with an agent</h3>
          <p className='mb-5 text-xs text-grey-400'>Submit your issue with details and our team will step in to help you resolve it.</p>
          <div className='space-y-4'>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-grey-600'>Subject</label>
              <input type='text' value={subject} onChange={(e) => setSubject(e.target.value)} className='form-input' placeholder='What is this about?' />
            </div>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-grey-600'>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')} className='form-input'>
                <option value='Low'>Low</option>
                <option value='Medium'>Medium</option>
                <option value='High'>High</option>
              </select>
            </div>
            <div>
              <label className='mb-1.5 block text-sm font-medium text-grey-600'>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className='form-input min-h-[100px] resize-none' placeholder='Give as much detail as you can...' />
            </div>
            {error && <p className='text-sm text-error-500'>{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className='w-full rounded-lg py-2.5 text-sm font-medium text-white transition-all disabled:opacity-60'
              style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit ticket'}
            </button>
          </div>
        </div>

        <div className='mt-6'>
          <h4 className='mb-3 text-sm font-semibold text-blackish'>Your tickets</h4>
          {isLoading ? (
            <p className='text-sm text-grey-400'>Loading tickets…</p>
          ) : tickets.length === 0 ? (
            <p className='rounded-lg border border-dashed border-grey-200 py-6 text-center text-sm text-grey-400'>
              No tickets yet.
            </p>
          ) : (
            <div className='space-y-2'>
              {tickets.map((ticket) => (
                <div key={ticket.id} className='rounded-lg border border-grey-100 bg-white p-4'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-medium text-blackish'>{ticket.subject}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[ticket.status]}`}>{ticket.status}</span>
                  </div>
                  <p className='mt-1 text-xs text-grey-400'>
                    {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {ticket.priority} priority
                  </p>
                  <p className='mt-2 text-sm text-grey-600'>{ticket.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} message="Your ticket has been created. We'll get back to you shortly." />
    </>
  )
}
