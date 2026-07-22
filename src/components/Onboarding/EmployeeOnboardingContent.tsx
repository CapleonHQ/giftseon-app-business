'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'
import GiftseonLogo from '@/components/Auth/GiftseonLogo'
import { INTEREST_CATEGORIES } from '@/lib/mockCompanyBranding'
import { getOnboardingInvite, registerOnboarding, verifyOnboarding } from '@/lib/api/onboarding'
import type { ApiError } from '@/lib/api/client'

const STEP_LABELS = ['Account', 'Delivery Address', 'Gift Preferences', 'Confirm']
const DEFAULT_BRAND_COLOR = '#1A1ABC'

export default function EmployeeOnboardingContent({ token }: { token: string }) {
  const { data: invite, isLoading, error: inviteError } = useQuery({
    queryKey: ['onboarding-invite', token],
    queryFn: () => getOnboardingInvite(token),
    retry: false,
  })

  const [step, setStep] = useState(1)

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

  // Step 5 — OTP
  const [otp, setOtp] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const brandColor = DEFAULT_BRAND_COLOR
  const companyName = invite?.company.businessName ?? 'Your Employer'

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
      if (!fullName.trim()) next.fullName = 'Enter your full name'
      if (!email.trim()) next.email = 'Enter your email address'
      if (!password.trim()) next.password = 'Create a password'
      else if (password.length < 7) next.password = 'Password must be at least 7 characters'
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

  const handleConfirm = async () => {
    setSubmitError('')
    setIsSubmitting(true)
    try {
      await registerOnboarding(token, {
        fullName,
        email,
        password,
        address: { street: addressLine, city, state },
        interests: Array.from(selectedInterests),
      })
      setStep(5)
    } catch (err) {
      setSubmitError((err as ApiError).message || 'Could not create your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerify = async () => {
    if (otp.trim().length !== 6) {
      setSubmitError('Enter the 6-digit code sent to your email')
      return
    }
    setSubmitError('')
    setIsSubmitting(true)
    try {
      await verifyOnboarding(token, otp.trim())
      setStep(6)
    } catch (err) {
      setSubmitError((err as ApiError).message || 'Invalid or expired code. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-grey-50/40'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500' />
      </div>
    )
  }

  if (inviteError || !invite) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-grey-50/40 px-6 text-center'>
        <h1 className='text-lg font-semibold text-blackish'>Invite link invalid</h1>
        <p className='mt-2 max-w-sm text-sm text-grey-400'>
          This invite link is invalid or has expired. Ask your employer to send you a new one.
        </p>
      </div>
    )
  }

  if (step === 6) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-grey-50/40 px-6 py-12'>
        <div className='w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-sm border border-grey-50'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full' style={{ backgroundColor: `${brandColor}1A` }}>
            <CheckCircle2 className='h-9 w-9' style={{ color: brandColor }} />
          </div>
          <h2 className='text-xl font-semibold text-blackish'>You&apos;re all set!</h2>
          <p className='mt-2 text-sm leading-relaxed text-grey-600'>
            {companyName} will now be able to celebrate you on Giftseon — birthdays, work anniversaries, and more, sent straight to your preferences.
          </p>
        </div>
      </div>
    )
  }

  if (step === 5) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-grey-50/40 px-6 py-12'>
        <div className='w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-grey-50'>
          <h2 className='text-xl font-semibold text-blackish'>Verify your email</h2>
          <p className='mt-2 text-sm leading-relaxed text-grey-600'>
            Enter the 6-digit code we sent to {email} to finish setting up your account.
          </p>
          {submitError && <p className='mt-4 rounded-lg border border-error-200 bg-error-50 px-3.5 py-2.5 text-sm text-error-600'>{submitError}</p>}
          <div className='mt-5 space-y-1.5'>
            <label className='block text-sm font-medium text-blackish'>Verification Code</label>
            <input
              type='text'
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder='000000'
              className='form-input text-center tracking-[0.5em]'
              maxLength={6}
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={isSubmitting}
            className='mt-6 w-full rounded-lg py-2.5 text-sm font-medium text-white transition-all disabled:opacity-60'
            style={{ backgroundColor: brandColor }}
          >
            {isSubmitting ? 'Verifying...' : 'Verify & Finish'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col bg-grey-50/40'>
      <header className='flex items-center justify-between px-6 py-5 lg:px-12' style={{ backgroundColor: brandColor }}>
        <div className='flex items-center gap-3'>
          {invite.company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={invite.company.logoUrl} alt={companyName} className='h-8 w-8 rounded object-cover' />
          ) : (
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white'>
              {companyName.charAt(0)}
            </div>
          )}
          <span className='text-sm font-semibold text-white'>{companyName}</span>
        </div>
        <GiftseonLogo className='h-6 w-auto brightness-0 invert' />
      </header>

      <div className='flex flex-1 items-start justify-center px-6 py-10 sm:items-center'>
        <div className='w-full max-w-lg'>
          <div className='mb-6 text-center'>
            <h1 className='text-xl font-bold text-blackish sm:text-2xl'>
              {companyName} invited you to Giftseon
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
                    style={{ backgroundColor: n <= step ? brandColor : 'var(--grey-200)' }}
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
                <div className='space-y-1.5'>
                  <label className='block text-sm font-medium text-blackish'>Full Name</label>
                  <input type='text' value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder='Enter your full name' className={`form-input ${errors.fullName ? 'border-error-400' : ''}`} />
                  {errors.fullName && <p className='text-xs text-error-500'>{errors.fullName}</p>}
                </div>
                <div className='space-y-1.5'>
                  <label className='block text-sm font-medium text-blackish'>Email Address</label>
                  <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Enter your email address' className={`form-input ${errors.email ? 'border-error-400' : ''}`} />
                  {errors.email && <p className='text-xs text-error-500'>{errors.email}</p>}
                </div>
                <div className='space-y-1.5'>
                  <label className='block text-sm font-medium text-blackish'>Create Password</label>
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
                <p className='text-sm text-grey-500'>Pick what you&apos;d love to receive — this stays private to you and is never shared with {companyName}.</p>
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
                                ? { backgroundColor: `${brandColor}1A`, borderColor: brandColor, color: brandColor }
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
                <p className='text-xs text-grey-400'>By confirming, you allow {companyName} to send you gifts via Giftseon for birthdays, anniversaries, and company occasions.</p>
                {submitError && <p className='rounded-lg border border-error-200 bg-error-50 px-3.5 py-2.5 text-sm text-error-600'>{submitError}</p>}
              </div>
            )}

            <div className='mt-8 flex gap-3'>
              {step > 1 && (
                <button onClick={goBack} className='flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-grey-200 py-2.5 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'>
                  <ArrowLeft className='h-4 w-4' /> Back
                </button>
              )}
              {step < 4 ? (
                <button onClick={goNext} className='flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-white transition-all' style={{ backgroundColor: brandColor }}>
                  Continue <ArrowRight className='h-4 w-4' />
                </button>
              ) : (
                <button onClick={handleConfirm} disabled={isSubmitting} className='flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-all disabled:opacity-60' style={{ backgroundColor: brandColor }}>
                  {isSubmitting ? 'Creating account...' : 'Confirm & Finish'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
