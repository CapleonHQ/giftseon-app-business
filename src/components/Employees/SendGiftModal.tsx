'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Sparkles, Users, Building2, X } from 'lucide-react'
import SuccessModal from '@/components/Profile/SuccessModal'
import ProductPicker from '@/components/Marketplace/ProductPicker'
import { useEmployees } from '@/context/EmployeesContext'
import { useGifting } from '@/context/GiftingContext'
import { useBranding } from '@/context/BrandingContext'
import { useAuth } from '@/context/AuthContext'
import { DEPARTMENTS } from '@/lib/departments'
import { MARKETPLACE_PRODUCTS } from '@/lib/mockMarketplace'
import { GIFT_FORMATS, type GiftFormat } from '@/types/Gifting'
import type { MarketplaceProduct } from '@/types/Marketplace'
import * as giftsApi from '@/lib/api/gifts'
import { FORMAT_TO_BACKEND } from '@/lib/api/giftingRules'
import type { ApiError } from '@/lib/api/client'

type RecipientMode = 'employee' | 'department'
type GiftSource = 'configuration' | 'custom' | 'marketplace'

const STEP_LABELS = ['Recipients', 'Gift Type', 'Message', 'Review']

interface SendGiftModalProps {
  open: boolean
  onClose: () => void
  initialEmployeeIds?: string[]
  initialProductId?: string
}

export default function SendGiftModal({ open, onClose, initialEmployeeIds, initialProductId }: SendGiftModalProps) {
  const queryClient = useQueryClient()
  const { employees } = useEmployees()
  const { rules } = useGifting()
  const { branding } = useBranding()
  const { company } = useAuth()

  const enabledRules = rules.filter((r) => r.enabled)

  const [step, setStep] = useState(1)
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('employee')
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set())
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set())
  const [recipientSearch, setRecipientSearch] = useState('')

  const [giftSource, setGiftSource] = useState<GiftSource>('configuration')
  const [ruleId, setRuleId] = useState('')
  const [customFormat, setCustomFormat] = useState<GiftFormat | ''>('')
  const [customBudget, setCustomBudget] = useState('')
  const [product, setProduct] = useState<MarketplaceProduct | null>(null)

  const [occasionLabel, setOccasionLabel] = useState('Just Because')
  const [message, setMessage] = useState(branding.messageTemplate)

  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [sentCount, setSentCount] = useState(0)

  useEffect(() => {
    if (!open) return
    setStep(1)
    setRecipientMode('employee')
    setSelectedEmployeeIds(new Set(initialEmployeeIds ?? []))
    setSelectedDepartments(new Set())
    setRecipientSearch('')
    setGiftSource(initialProductId ? 'marketplace' : 'configuration')
    setRuleId(enabledRules[0]?.id ?? '')
    setCustomFormat('')
    setCustomBudget('')
    setProduct(initialProductId ? MARKETPLACE_PRODUCTS.find((p) => p.id === initialProductId) ?? null : null)
    setOccasionLabel('Just Because')
    setMessage(branding.messageTemplate)
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const recipientIds = useMemo(() => {
    if (recipientMode === 'employee') return Array.from(selectedEmployeeIds)
    return employees.filter((e) => selectedDepartments.has(e.department)).map((e) => e.id)
  }, [recipientMode, selectedEmployeeIds, selectedDepartments, employees])

  const recipients = useMemo(() => employees.filter((e) => recipientIds.includes(e.id)), [employees, recipientIds])

  const filteredEmployees = useMemo(
    () => employees.filter((e) => e.name.toLowerCase().includes(recipientSearch.toLowerCase())),
    [employees, recipientSearch]
  )

  const selectedRule = rules.find((r) => r.id === ruleId)

  const costPerGift = useMemo(() => {
    if (giftSource === 'configuration') return selectedRule?.budget ?? 0
    if (giftSource === 'custom') return Number(customBudget) || 0
    if (giftSource === 'marketplace') return product?.price ?? 0
    return 0
  }, [giftSource, selectedRule, customBudget, product])

  const totalCost = costPerGift * recipients.length

  const toggleEmployee = (id: string) => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleDepartment = (dept: string) => {
    setSelectedDepartments((prev) => {
      const next = new Set(prev)
      if (next.has(dept)) next.delete(dept); else next.add(dept)
      return next
    })
  }

  const goNext = () => {
    if (step === 1 && recipients.length === 0) {
      setError('Select at least one recipient.')
      return
    }
    if (step === 2) {
      if (giftSource === 'configuration' && !ruleId) { setError('Select a configured gifting type.'); return }
      if (giftSource === 'custom' && (!customFormat || !customBudget || Number(customBudget) <= 0)) { setError('Choose a gift format and enter a valid budget.'); return }
      if (giftSource === 'marketplace' && !product) { setError('Choose a product from the marketplace.'); return }
    }
    if (step === 3 && !message.trim()) { setError('Write a message for the gift notification.'); return }
    setError('')
    setStep((s) => Math.min(4, s + 1))
  }

  const goBack = () => { setError(''); setStep((s) => Math.max(1, s - 1)) }

  const giftLabel = giftSource === 'configuration' ? (selectedRule?.label ?? 'Gift') : giftSource === 'marketplace' ? (product?.name ?? 'Gift') : (customFormat || 'Custom Gift')

  const resolvedFormat: GiftFormat = giftSource === 'configuration'
    ? (selectedRule?.giftFormat ?? 'Cash')
    : giftSource === 'marketplace'
      ? 'Marketplace Item'
      : (customFormat || 'Cash')

  const handleSend = async () => {
    setError('')
    setIsSending(true)
    const failures: string[] = []
    for (const employee of recipients) {
      try {
        await giftsApi.sendGift({
          contactId: employee.id,
          amount: costPerGift,
          message,
          occasion: occasionLabel,
          giftFormat: FORMAT_TO_BACKEND[resolvedFormat],
          itemDescription: resolvedFormat !== 'Cash' ? giftLabel : undefined,
          itemReferenceId: giftSource === 'marketplace' ? product?.id : undefined,
        })
      } catch (err) {
        failures.push(`${employee.name}: ${(err as ApiError).message}`)
      }
    }
    setIsSending(false)
    queryClient.invalidateQueries({ queryKey: ['wallet'] })

    if (failures.length === recipients.length) {
      setError(failures[0] ?? 'Could not send this gift. Please try again.')
      return
    }
    if (failures.length > 0) {
      setError(`Sent to ${recipients.length - failures.length} of ${recipients.length} recipients. Failed: ${failures.join('; ')}`)
    }
    setSentCount(recipients.length - failures.length)
    setShowSuccess(true)
  }

  if (!open) return null

  return (
    <>
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'>
        <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl'>
          <div className='mb-1 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-blackish'>Send a Gift</h3>
            <button onClick={onClose} className='text-grey-400 hover:text-blackish'><X className='h-5 w-5' /></button>
          </div>

          <div className='mb-6 flex items-center gap-2 overflow-x-auto pb-1'>
            {STEP_LABELS.map((label, i) => {
              const n = i + 1
              const active = n === step
              const done = n < step
              return (
                <div key={label} className='flex shrink-0 items-center gap-2'>
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    active ? 'bg-primary-500 text-white' : done ? 'bg-success-500 text-white' : 'bg-grey-100 text-grey-400'
                  }`}>{n}</div>
                  <span className={`text-xs font-medium ${active ? 'text-blackish' : 'text-grey-400'}`}>{label}</span>
                  {n < STEP_LABELS.length && <div className='h-px w-4 bg-grey-100' />}
                </div>
              )
            })}
          </div>

          {step === 1 && (
            <div className='space-y-4'>
              <div className='flex gap-2'>
                <button
                  onClick={() => setRecipientMode('employee')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-colors ${recipientMode === 'employee' ? 'border-primary-400 bg-primary-50 text-primary-600' : 'border-grey-200 text-grey-600 hover:bg-grey-50'}`}
                >
                  <Users className='h-4 w-4' /> By Employee
                </button>
                <button
                  onClick={() => setRecipientMode('department')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-colors ${recipientMode === 'department' ? 'border-primary-400 bg-primary-50 text-primary-600' : 'border-grey-200 text-grey-600 hover:bg-grey-50'}`}
                >
                  <Building2 className='h-4 w-4' /> By Department
                </button>
              </div>

              {recipientMode === 'employee' ? (
                <div>
                  <input
                    type='text'
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    placeholder='Search employees'
                    className='form-input mb-2'
                  />
                  <div className='max-h-64 space-y-1 overflow-y-auto rounded-lg border border-grey-100 p-2'>
                    {filteredEmployees.map((employee) => (
                      <label key={employee.id} className='flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 hover:bg-grey-50'>
                        <div className='flex items-center gap-2.5'>
                          <div className='flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600'>{employee.name.charAt(0)}</div>
                          <div>
                            <p className='text-sm font-medium text-blackish'>{employee.name}</p>
                            <p className='text-xs text-grey-400'>{employee.department}</p>
                          </div>
                        </div>
                        <input type='checkbox' checked={selectedEmployeeIds.has(employee.id)} onChange={() => toggleEmployee(employee.id)} className='h-4 w-4 rounded border-grey-300 accent-primary-500' />
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='flex flex-wrap gap-2'>
                  {DEPARTMENTS.map((dept) => {
                    const count = employees.filter((e) => e.department === dept).length
                    return (
                      <button
                        key={dept}
                        onClick={() => toggleDepartment(dept)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${selectedDepartments.has(dept) ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-grey-200 text-grey-600 hover:bg-grey-50'}`}
                      >
                        {dept} ({count})
                      </button>
                    )
                  })}
                </div>
              )}

              <p className='text-xs text-grey-500'>{recipients.length} recipient{recipients.length === 1 ? '' : 's'} selected</p>
            </div>
          )}

          {step === 2 && (
            <div className='space-y-4'>
              <div className='grid grid-cols-3 gap-2'>
                {(['configuration', 'custom', 'marketplace'] as GiftSource[]).map((source) => (
                  <button
                    key={source}
                    onClick={() => setGiftSource(source)}
                    className={`rounded-lg border-2 py-2.5 text-center text-xs font-medium capitalize transition-colors ${giftSource === source ? 'border-primary-400 bg-primary-50/30 text-blackish' : 'border-grey-100 text-grey-600 hover:border-grey-200'}`}
                  >
                    {source === 'configuration' ? 'From Configuration' : source === 'custom' ? 'Custom' : 'From Marketplace'}
                  </button>
                ))}
              </div>

              {giftSource === 'configuration' && (
                enabledRules.length === 0 ? (
                  <p className='rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-600'>
                    No gifting rules are configured yet. Set one up in Gifting Configuration, or choose Custom / Marketplace instead.
                  </p>
                ) : (
                  <div className='space-y-2'>
                    {enabledRules.map((rule) => (
                      <label key={rule.id} className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 ${ruleId === rule.id ? 'border-primary-400 bg-primary-50/30' : 'border-grey-100'}`}>
                        <div>
                          <p className='text-sm font-medium text-blackish'>{rule.label}</p>
                          <p className='text-xs text-grey-500'>{rule.giftFormat} · {rule.variesByTier ? 'Varies by tier' : `₦${rule.budget.toLocaleString()}`}</p>
                        </div>
                        <input type='radio' name='rule' checked={ruleId === rule.id} onChange={() => setRuleId(rule.id)} className='h-4 w-4 accent-primary-500' />
                      </label>
                    ))}
                  </div>
                )
              )}

              {giftSource === 'custom' && (
                <div className='space-y-3'>
                  <div className='grid grid-cols-2 gap-2'>
                    {GIFT_FORMATS.map((format) => (
                      <button key={format} onClick={() => setCustomFormat(format)} className={`rounded-lg border-2 py-2 text-xs font-medium transition-colors ${customFormat === format ? 'border-primary-400 bg-primary-50/30' : 'border-grey-100 hover:border-grey-200'}`}>
                        {format}
                      </button>
                    ))}
                  </div>
                  <input type='number' min={0} value={customBudget} onChange={(e) => setCustomBudget(e.target.value)} placeholder='Budget per recipient (₦)' className='form-input' />
                </div>
              )}

              {giftSource === 'marketplace' && (
                <ProductPicker
                  selectedId={product?.id}
                  onSelect={setProduct}
                  recipientEmployee={recipients.length === 1 ? recipients[0] : null}
                  company={company}
                  occasionLabel={occasionLabel}
                />
              )}
            </div>
          )}

          {step === 3 && (
            <div className='space-y-4'>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-grey-600'>Occasion</label>
                <select value={occasionLabel} onChange={(e) => setOccasionLabel(e.target.value)} className='form-input'>
                  {['Birthday', 'Work Anniversary', 'Promotion', 'Welcome / Onboarding', 'Compensation', 'Holiday & Leave', 'Just Because'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-grey-600'>Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} className='form-input min-h-[100px] resize-none' />
                <button onClick={() => setMessage((m) => `${m}${m.endsWith(' ') || !m ? '' : ' '}{{employeeName}}`)} className='mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-600'>
                  <Sparkles className='h-3.5 w-3.5' /> Insert employee name token
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className='space-y-3 rounded-lg border border-grey-100 bg-grey-50/40 p-4 text-sm'>
              <Row label='Recipients' value={`${recipients.length} (${recipientMode === 'department' ? Array.from(selectedDepartments).join(', ') || '—' : 'selected employees'})`} />
              <Row label='Gift' value={giftLabel} />
              <Row label='Occasion' value={occasionLabel} />
              <Row label='Cost per gift' value={`₦${costPerGift.toLocaleString()}`} />
              <Row label='Total cost' value={`₦${totalCost.toLocaleString()}`} />
              <div>
                <p className='text-grey-400'>Message</p>
                <p className='mt-1 text-blackish'>{message}</p>
              </div>
            </div>
          )}

          {error && <p className='mt-3 text-sm text-error-500'>{error}</p>}

          <div className='mt-6 flex gap-3'>
            {step > 1 && (
              <button onClick={goBack} className='flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-grey-200 py-2.5 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'>
                <ArrowLeft className='h-4 w-4' /> Back
              </button>
            )}
            {step < 4 ? (
              <button onClick={goNext} className='flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-white transition-all' style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}>
                Continue <ArrowRight className='h-4 w-4' />
              </button>
            ) : (
              <button onClick={handleSend} disabled={isSending} className='flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-all disabled:opacity-60' style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}>
                {isSending ? 'Sending...' : 'Send gift'}
              </button>
            )}
          </div>
        </div>
      </div>

      <SuccessModal
        open={showSuccess}
        onClose={() => { setShowSuccess(false); onClose() }}
        message={`Gift sent to ${sentCount} employee${sentCount === 1 ? '' : 's'}. They'll be notified to claim it.`}
      />
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex justify-between gap-4'>
      <span className='text-grey-400'>{label}</span>
      <span className='text-right font-medium text-blackish'>{value}</span>
    </div>
  )
}
