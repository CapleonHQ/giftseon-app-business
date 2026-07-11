'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Plus, Trash2, Sparkles } from 'lucide-react'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import SuccessModal from '@/components/Profile/SuccessModal'
import { useGifting } from '@/context/GiftingContext'
import { GIFTING_TYPE_DEFINITIONS } from '@/lib/mockGiftingTypes'
import type { GiftFormat, GiftingTypeKey, BudgetTier } from '@/types/Gifting'

const GIFT_FORMATS: GiftFormat[] = ['Cash', 'Voucher', 'Marketplace Item', 'Custom Gift Pack']

const STEP_LABELS = ['Gifting Type', 'Gift Format', 'Budget', 'Message', 'Distribution', 'Review']

let tierCounter = 1

export default function GiftingSetupFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { rules, addRule, updateRule } = useGifting()

  const editRuleId = searchParams.get('edit')
  const presetType = searchParams.get('type') as GiftingTypeKey | null
  const existingRule = editRuleId ? rules.find((r) => r.id === editRuleId) : undefined

  const [step, setStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)

  const [typeKey, setTypeKey] = useState<GiftingTypeKey | ''>('')
  const [customLabel, setCustomLabel] = useState('')
  const [customTriggerDate, setCustomTriggerDate] = useState('')
  const [giftFormat, setGiftFormat] = useState<GiftFormat | ''>('')
  const [budget, setBudget] = useState('')
  const [message, setMessage] = useState('')
  const [variesByTier, setVariesByTier] = useState(false)
  const [tiers, setTiers] = useState<BudgetTier[]>([{ id: 'tier-init', label: 'Junior', amount: 0 }])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (existingRule) {
      setTypeKey(existingRule.typeKey)
      setCustomLabel(existingRule.typeKey === 'custom' ? existingRule.label : '')
      setCustomTriggerDate(existingRule.customTriggerDate || '')
      setGiftFormat(existingRule.giftFormat)
      setBudget(String(existingRule.budget))
      setMessage(existingRule.message)
      setVariesByTier(existingRule.variesByTier)
      setTiers(existingRule.tiers.length > 0 ? existingRule.tiers : [{ id: 'tier-init', label: 'Junior', amount: 0 }])
    } else if (presetType) {
      setTypeKey(presetType)
    }
  }, [existingRule, presetType])

  const selectedDef = useMemo(() => GIFTING_TYPE_DEFINITIONS.find((d) => d.key === typeKey), [typeKey])

  const goNext = () => {
    const next: Record<string, string> = {}
    if (step === 1) {
      if (!typeKey) next.typeKey = 'Select a gifting type'
      if (typeKey === 'custom' && !customLabel.trim()) next.customLabel = 'Name this occasion'
      if (typeKey === 'custom' && !customTriggerDate) next.customTriggerDate = 'Pick a trigger date'
    }
    if (step === 2 && !giftFormat) next.giftFormat = 'Choose a gift format'
    if (step === 3) {
      const n = Number(budget)
      if (!budget || Number.isNaN(n) || n <= 0) next.budget = 'Enter a valid budget amount'
    }
    if (step === 4 && !message.trim()) next.message = 'Write a message for the gift notification'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    setStep((s) => Math.min(6, s + 1))
  }

  const goBack = () => setStep((s) => Math.max(1, s - 1))

  const addTier = () => {
    tierCounter += 1
    setTiers((prev) => [...prev, { id: `tier-${tierCounter}`, label: '', amount: 0 }])
  }

  const removeTier = (id: string) => setTiers((prev) => prev.filter((t) => t.id !== id))

  const updateTier = (id: string, updates: Partial<BudgetTier>) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const insertToken = () => setMessage((m) => `${m}${m.endsWith(' ') || m === '' ? '' : ' '}{{employeeName}}`)

  const handleSave = useCallback(() => {
    if (!typeKey || !giftFormat) return
    const label = typeKey === 'custom' ? customLabel.trim() || 'Custom Occasion' : selectedDef?.label || typeKey
    const trigger = typeKey === 'custom'
      ? `Custom occasion on ${customTriggerDate}`
      : selectedDef?.trigger || ''

    const payload = {
      typeKey,
      label,
      trigger,
      customTriggerDate: typeKey === 'custom' ? customTriggerDate : undefined,
      giftFormat,
      budget: Number(budget) || 0,
      message,
      variesByTier,
      tiers: variesByTier ? tiers.filter((t) => t.label.trim()) : [],
      enabled: existingRule ? existingRule.enabled : true,
    }

    if (existingRule) {
      updateRule(existingRule.id, payload)
    } else {
      addRule(payload)
    }
    setShowSuccess(true)
  }, [typeKey, giftFormat, customLabel, customTriggerDate, selectedDef, budget, message, variesByTier, tiers, existingRule, addRule, updateRule])

  return (
    <div className='flex flex-col'>
      <DashboardHeader title={existingRule ? 'Edit Gifting Rule' : 'New Gifting Rule'} />
      <div className='p-6 lg:p-8'>
        <div className='mx-auto max-w-2xl'>
          {/* Step progress */}
          <div className='mb-6 flex items-center gap-2 overflow-x-auto pb-1'>
            {STEP_LABELS.map((label, i) => {
              const n = i + 1
              const active = n === step
              const done = n < step
              return (
                <div key={label} className='flex items-center gap-2 shrink-0'>
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    active ? 'bg-primary-500 text-white' : done ? 'bg-success-500 text-white' : 'bg-grey-100 text-grey-400'
                  }`}>
                    {n}
                  </div>
                  <span className={`text-xs font-medium ${active ? 'text-blackish' : 'text-grey-400'}`}>{label}</span>
                  {n < STEP_LABELS.length && <div className='h-px w-4 bg-grey-100' />}
                </div>
              )
            })}
          </div>

          <div className='rounded-xl border border-grey-100 bg-white p-6'>
            {step === 1 && (
              <div className='space-y-5'>
                <p className='text-sm font-semibold text-blackish'>Choose a gifting type</p>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  {GIFTING_TYPE_DEFINITIONS.map((def) => (
                    <button
                      key={def.key}
                      type='button'
                      onClick={() => setTypeKey(def.key)}
                      className={`rounded-xl border-2 p-4 text-left transition-colors ${
                        typeKey === def.key ? 'border-primary-400 bg-primary-50/30' : 'border-grey-100 hover:border-grey-200'
                      }`}
                    >
                      <p className='text-sm font-semibold text-blackish'>{def.label}</p>
                      <p className='mt-1 text-xs text-grey-500'>{def.trigger}</p>
                    </button>
                  ))}
                </div>
                {errors.typeKey && <p className='text-xs text-error-500'>{errors.typeKey}</p>}

                {typeKey === 'custom' && (
                  <div className='space-y-4 rounded-lg border border-grey-100 bg-grey-50/40 p-4'>
                    <div className='space-y-1.5'>
                      <label className='block text-sm font-medium text-blackish'>Occasion Name</label>
                      <input
                        type='text'
                        value={customLabel}
                        onChange={(e) => setCustomLabel(e.target.value)}
                        placeholder='e.g. Team Milestone Celebration'
                        className={`form-input ${errors.customLabel ? 'border-error-400' : ''}`}
                      />
                      {errors.customLabel && <p className='text-xs text-error-500'>{errors.customLabel}</p>}
                    </div>
                    <div className='space-y-1.5'>
                      <label className='block text-sm font-medium text-blackish'>Trigger Date</label>
                      <input
                        type='date'
                        value={customTriggerDate}
                        onChange={(e) => setCustomTriggerDate(e.target.value)}
                        className={`form-input ${errors.customTriggerDate ? 'border-error-400' : ''}`}
                      />
                      {errors.customTriggerDate && <p className='text-xs text-error-500'>{errors.customTriggerDate}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className='space-y-5'>
                <p className='text-sm font-semibold text-blackish'>Choose a gift format</p>
                <div className='grid grid-cols-2 gap-3'>
                  {GIFT_FORMATS.map((format) => (
                    <button
                      key={format}
                      type='button'
                      onClick={() => setGiftFormat(format)}
                      className={`rounded-xl border-2 p-4 text-center transition-colors ${
                        giftFormat === format ? 'border-primary-400 bg-primary-50/30' : 'border-grey-100 hover:border-grey-200'
                      }`}
                    >
                      <p className='text-sm font-medium text-blackish'>{format}</p>
                    </button>
                  ))}
                </div>
                {errors.giftFormat && <p className='text-xs text-error-500'>{errors.giftFormat}</p>}
              </div>
            )}

            {step === 3 && (
              <div className='space-y-5'>
                <p className='text-sm font-semibold text-blackish'>Set the gift value / budget per employee</p>
                <div className='space-y-1.5'>
                  <label className='block text-sm font-medium text-blackish'>Budget (₦)</label>
                  <input
                    type='number'
                    min={0}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder='e.g. 25000'
                    className={`form-input ${errors.budget ? 'border-error-400' : ''}`}
                  />
                  {errors.budget && <p className='text-xs text-error-500'>{errors.budget}</p>}
                  <p className='text-xs text-grey-400'>This is the default per-employee amount for this gifting type. You can vary it by tier in a later step.</p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className='space-y-5'>
                <p className='text-sm font-semibold text-blackish'>Write the company message</p>
                <div className='space-y-1.5'>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder='Happy Birthday, {{employeeName}}! From all of us at the company.'
                    className={`form-input min-h-[120px] resize-none ${errors.message ? 'border-error-400' : ''}`}
                  />
                  {errors.message && <p className='text-xs text-error-500'>{errors.message}</p>}
                  <button type='button' onClick={insertToken} className='inline-flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-600'>
                    <Sparkles className='h-3.5 w-3.5' /> Insert employee name token
                  </button>
                  <p className='text-xs text-grey-400'>Use <code className='rounded bg-grey-100 px-1 py-0.5'>{'{{employeeName}}'}</code> — we&apos;ll personalize it automatically when the gift is sent.</p>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className='space-y-5'>
                <p className='text-sm font-semibold text-blackish'>How should this gift be distributed?</p>
                <div className='grid grid-cols-2 gap-3'>
                  <button type='button' onClick={() => setVariesByTier(false)} className={`rounded-xl border-2 p-4 text-left transition-colors ${!variesByTier ? 'border-primary-400 bg-primary-50/30' : 'border-grey-100 hover:border-grey-200'}`}>
                    <p className='text-sm font-medium text-blackish'>Same for everyone</p>
                    <p className='mt-1 text-xs text-grey-500'>All employees get ₦{Number(budget || 0).toLocaleString()}.</p>
                  </button>
                  <button type='button' onClick={() => setVariesByTier(true)} className={`rounded-xl border-2 p-4 text-left transition-colors ${variesByTier ? 'border-primary-400 bg-primary-50/30' : 'border-grey-100 hover:border-grey-200'}`}>
                    <p className='text-sm font-medium text-blackish'>Varies by role / seniority</p>
                    <p className='mt-1 text-xs text-grey-500'>Set a different budget per tier.</p>
                  </button>
                </div>

                {variesByTier && (
                  <div className='space-y-3 rounded-lg border border-grey-100 bg-grey-50/40 p-4'>
                    {tiers.map((tier) => (
                      <div key={tier.id} className='flex items-center gap-2'>
                        <input
                          type='text'
                          value={tier.label}
                          onChange={(e) => updateTier(tier.id, { label: e.target.value })}
                          placeholder='Tier name (e.g. Senior)'
                          className='form-input'
                        />
                        <input
                          type='number'
                          min={0}
                          value={tier.amount || ''}
                          onChange={(e) => updateTier(tier.id, { amount: Number(e.target.value) })}
                          placeholder='₦ amount'
                          className='form-input'
                        />
                        <button type='button' onClick={() => removeTier(tier.id)} className='text-grey-400 hover:text-error-500'>
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    ))}
                    <button type='button' onClick={addTier} className='flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-primary-600'>
                      <Plus className='h-4 w-4' /> Add tier
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 6 && (
              <div className='space-y-5'>
                <p className='text-sm font-semibold text-blackish'>Review & save</p>
                <div className='space-y-3 rounded-lg border border-grey-100 bg-grey-50/40 p-4 text-sm'>
                  <Row label='Gifting Type' value={typeKey === 'custom' ? customLabel : selectedDef?.label || ''} />
                  <Row label='Trigger' value={typeKey === 'custom' ? `Custom date: ${customTriggerDate}` : selectedDef?.trigger || ''} />
                  <Row label='Gift Format' value={giftFormat} />
                  <Row label='Budget' value={`₦${Number(budget || 0).toLocaleString()} per employee`} />
                  <Row label='Distribution' value={variesByTier ? `Varies by tier (${tiers.filter((t) => t.label.trim()).length} tiers)` : 'Same for everyone'} />
                  <div>
                    <p className='text-grey-400'>Message</p>
                    <p className='mt-1 text-blackish'>{message}</p>
                  </div>
                </div>
              </div>
            )}

            <div className='mt-8 flex gap-3'>
              {step > 1 && (
                <button type='button' onClick={goBack} className='flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-grey-200 py-2.5 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'>
                  <ArrowLeft className='h-4 w-4' /> Back
                </button>
              )}
              {step < 6 ? (
                <button type='button' onClick={goNext} className='flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-white transition-all' style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}>
                  Continue <ArrowRight className='h-4 w-4' />
                </button>
              ) : (
                <button type='button' onClick={handleSave} className='flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-all' style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}>
                  Save gifting rule
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        open={showSuccess}
        onClose={() => { setShowSuccess(false); router.push('/gifting') }}
        message="Gifting rule saved. It'll trigger automatically from now on."
      />
    </div>
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
