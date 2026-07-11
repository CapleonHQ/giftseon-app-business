'use client'

import { useState, useMemo } from 'react'
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'
import GiftseonLogo from '@/components/Auth/GiftseonLogo'
import { getOnboardingCompany, INTEREST_CATEGORIES } from '@/lib/mockCompanyBranding'

const STEP_LABELS = ['Account', 'Delivery Address', 'Gift Preferences', 'Confirm']

export default function EmployeeOnboardingContent({ token }: { token: string }) {
  const company = useMemo(() => getOnboardingCompany(token), [token])

  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<'create' | 'login'>('create')

  // Step 1 — account
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Step 2 — address
  const [addressLine, setAddressLine] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  // Step 3 — interests
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set())

  const [errors, setErrors] = useState<Record<string, string>>({})

  const toggleInterest = (option: string) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev)
      if (next.has(option)) next.delete(option)
      else next.add(option)
      return next
    })
  }

  const validateStep = () => {
    const next: Record<string, string> = {}
    if (step === 1) {
      if (!fullName.trim() && mode === 'create') next.fullName = 'Enter your full name'
      if (!email.trim()) next.email = 'Enter your email address'
      if (!password.trim()) next.password = mode === 'create' ? 'Create a password' : 'Enter your password'
    }
    if (step === 2) {
      if (!addressLine.trim()) next.addressLine = 'Enter your delivery address'
      if (!city.trim()) next.city = 'Enter your city'
      if (!state.trim()) next.state = 'Enter your state'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const goNext = () => {
    if (!validateStep()) return
    setStep((s) => Math.min(4, s + 1))
  }

  const goBack = () => setStep((s) => Math.max(1, s - 1))

  if (step === 5) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-grey-50/40 px-6 py-12'>
        <div className='w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-sm border border-grey-50'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full' style={{ backgroundColor: `${company.brandColor}1A` }}>
            <CheckCircle2 className='h-9 w-9' style={{ color: company.brandColor }} />
          </div>
          <h2 className='text-xl font-semibold text-blackish'>You&apos;re all set!</h2>
          <p className='mt-2 text-sm leading-relaxed text-grey-600'>
            {company.companyName} will now be able to celebrate you on Giftseon — birthdays, work anniversaries, and more, sent straight to your preferences.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col bg-grey-50/40'>
      <header className='flex items-center justify-between px-6 py-5 lg:px-12' style={{ backgroundColor: company.brandColor }}>
        <div className='flex items-center gap-3'>
          {company.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logo} alt={company.companyName} className='h-8 w-8 rounded object-cover' />
          ) : (
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white'>
              {company.companyName.charAt(0)}
            </div>
          )}
          <span className='text-sm font-semibold text-white'>{company.companyName}</span>
        </div>
        <GiftseonLogo className='h-6 w-auto brightness-0 invert' />
      </header>

      <div className='flex flex-1 items-start justify-center px-6 py-10 sm:items-center'>
        <div className='w-full max-w-lg'>
          <div className='mb-6 text-center'>
            <h1 className='text-xl font-bold text-blackish sm:text-2xl'>
              {company.companyName} invited you to Giftseon
            </h1>
            <p className='mt-1.5 text-sm text-grey-500'>
              Set up your profile so they can celebrate your birthdays, anniversaries, and milestones automatically.
            </p>
          </div>

          <div className='mb-6 flex items-center justify-center gap-2'>
            {STEP_LABELS.map((label, i) => {
              const n = i + 1
              return (
                <div key={label} className='flex items-center gap-2'>
                  <div
                    className='flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white'
                    style={{ backgroundColor: n <= step ? company.brandColor : 'var(--grey-200)' }}
                  >
                    {n}
                  </div>
                  {n < STEP_LABELS.length && <div className='h-px w-4 bg-grey-200' />}
                </div>
              )
            })}
          </div>

          <div className='rounded-xl border border-grey-100 bg-white p-6'>
            {step === 1 && (
              <div className='space-y-5'>
                <div className='flex gap-2 rounded-lg bg-grey-50 p-1'>
                  <button
                    onClick={() => setMode('create')}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === 'create' ? 'bg-white shadow-sm text-blackish' : 'text-grey-500'}`}
                  >
                    Create account
                  </button>
                  <button
                    onClick={() => setMode('login')}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white shadow-sm text-blackish' : 'text-grey-500'}`}
                  >
                    I already have an account
                  </button>
                </div>

                {mode === 'create' && (
                  <div className='space-y-1.5'>
                    <label className='block text-sm font-medium text-blackish'>Full Name</label>
                    <input type='text' value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder='Enter your full name' className={`form-input ${errors.fullName ? 'border-error-400' : ''}`} />
                    {errors.fullName && <p className='text-xs text-error-500'>{errors.fullName}</p>}
                  </div>
                )}
                <div className='space-y-1.5'>
                  <label className='block text-sm font-medium text-blackish'>Email Address</label>
                  <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Enter your email address' className={`form-input ${errors.email ? 'border-error-400' : ''}`} />
                  {errors.email && <p className='text-xs text-error-500'>{errors.email}</p>}
                </div>
                <div className='space-y-1.5'>
                  <label className='block text-sm font-medium text-blackish'>{mode === 'create' ? 'Create Password' : 'Password'}</label>
                  <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Enter a password' className={`form-input ${errors.password ? 'border-error-400' : ''}`} />
                  {errors.password && <p className='text-xs text-error-500'>{errors.password}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className='space-y-5'>
                <div className='space-y-1.5'>
                  <label className='block text-sm font-medium text-blackish'>Delivery Address</label>
                  <input type='text' value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder='Street address' className={`form-input ${errors.addressLine ? 'border-error-400' : ''}`} />
                  {errors.addressLine && <p className='text-xs text-error-500'>{errors.addressLine}</p>}
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <label className='block text-sm font-medium text-blackish'>City</label>
                    <input type='text' value={city} onChange={(e) => setCity(e.target.value)} placeholder='City' className={`form-input ${errors.city ? 'border-error-400' : ''}`} />
                    {errors.city && <p className='text-xs text-error-500'>{errors.city}</p>}
                  </div>
                  <div className='space-y-1.5'>
                    <label className='block text-sm font-medium text-blackish'>State</label>
                    <input type='text' value={state} onChange={(e) => setState(e.target.value)} placeholder='State' className={`form-input ${errors.state ? 'border-error-400' : ''}`} />
                    {errors.state && <p className='text-xs text-error-500'>{errors.state}</p>}
                  </div>
                </div>
                <p className='text-xs text-grey-400'>Used to deliver any physical gifts sent to you.</p>
              </div>
            )}

            {step === 3 && (
              <div className='space-y-5'>
                <p className='text-sm text-grey-500'>Pick what you&apos;d love to receive — this stays private to you and is never shared with {company.companyName}.</p>
                {INTEREST_CATEGORIES.map((cat) => (
                  <div key={cat.category}>
                    <p className='mb-2 text-sm font-semibold text-blackish'>{cat.category}</p>
                    <div className='flex flex-wrap gap-2'>
                      {cat.options.map((option) => {
                        const active = selectedInterests.has(option)
                        return (
                          <button
                            key={option}
                            type='button'
                            onClick={() => toggleInterest(option)}
                            className='rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors'
                            style={
                              active
                                ? { backgroundColor: `${company.brandColor}1A`, borderColor: company.brandColor, color: company.brandColor }
                                : { borderColor: 'var(--grey-200)', color: 'var(--grey-600)' }
                            }
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className='space-y-5'>
                <p className='text-sm font-semibold text-blackish'>Confirm your details</p>
                <div className='space-y-3 rounded-lg border border-grey-100 bg-grey-50/40 p-4 text-sm'>
                  <div className='flex justify-between'><span className='text-grey-400'>Name</span><span className='font-medium text-blackish'>{fullName || '—'}</span></div>
                  <div className='flex justify-between'><span className='text-grey-400'>Email</span><span className='font-medium text-blackish'>{email || '—'}</span></div>
                  <div className='flex justify-between'><span className='text-grey-400'>Delivery Address</span><span className='text-right font-medium text-blackish'>{addressLine}, {city}, {state}</span></div>
                  <div className='flex justify-between'><span className='text-grey-400'>Interests selected</span><span className='font-medium text-blackish'>{selectedInterests.size}</span></div>
                </div>
                <p className='text-xs text-grey-400'>By confirming, you allow {company.companyName} to send you gifts via Giftseon for birthdays, anniversaries, and company occasions.</p>
              </div>
            )}

            <div className='mt-8 flex gap-3'>
              {step > 1 && (
                <button onClick={goBack} className='flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-grey-200 py-2.5 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'>
                  <ArrowLeft className='h-4 w-4' /> Back
                </button>
              )}
              {step < 4 ? (
                <button onClick={goNext} className='flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-white transition-all' style={{ backgroundColor: company.brandColor }}>
                  Continue <ArrowRight className='h-4 w-4' />
                </button>
              ) : (
                <button onClick={() => setStep(5)} className='flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-all' style={{ backgroundColor: company.brandColor }}>
                  Confirm & Finish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
