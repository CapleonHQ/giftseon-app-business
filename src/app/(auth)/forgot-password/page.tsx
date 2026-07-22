'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import GiftseonLogo from '@/components/Auth/GiftseonLogo'
import BackToHomeLink from '@/components/Auth/BackToHomeLink'
import PasswordInput, { PASSWORD_RULES } from '@/components/Auth/PasswordInput'
import ForgotPasswordIllustration from '@/components/Auth/illustrations/ForgotPasswordIllustration'
import CreatePasswordIllustration from '@/components/Auth/illustrations/CreatePasswordIllustration'
import SuccessScreen from '@/components/Auth/SuccessScreen'
import { useAuth } from '@/context/AuthContext'
import type { ApiError } from '@/lib/api/client'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { forgotPassword, resetPassword } = useAuth()
  const tokenFromLink = searchParams.get('token')
  const [step, setStep] = useState<'email' | 'sent' | 'password' | 'success'>(
    tokenFromLink ? 'password' : 'email'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (tokenFromLink) setStep('password')
  }, [tokenFromLink])

  const isPasswordValid = PASSWORD_RULES.every((r) => r.test(password))
  const isPasswordFormValid =
    isPasswordValid && confirmPassword === password && confirmPassword.length > 0

  const handleSendEmail = useCallback(async () => {
    if (!email) return
    setError('')
    setIsLoading(true)
    try {
      await forgotPassword(email)
      setStep('sent')
    } catch (err) {
      setError((err as ApiError).message || 'Could not send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [email, forgotPassword])

  const handleCreatePassword = useCallback(async () => {
    if (!isPasswordFormValid || !tokenFromLink) return
    setError('')
    setIsLoading(true)
    try {
      await resetPassword(tokenFromLink, password)
      setStep('success')
    } catch (err) {
      setError((err as ApiError).message || 'Could not reset your password. The link may have expired.')
    } finally {
      setIsLoading(false)
    }
  }, [isPasswordFormValid, tokenFromLink, password, resetPassword])

  if (step === 'success') {
    return (
      <SuccessScreen
        message='Your password has been successfully reset and you can now access your company dashboard.'
        buttonLabel='Go to Login'
        onAction={() => router.push('/login')}
      />
    )
  }

  if (step === 'sent') {
    return (
      <SuccessScreen
        message={`We've sent a password reset link to ${email}. Open it on this device to set a new password.`}
        buttonLabel='Back to Login'
        onAction={() => router.push('/login')}
      />
    )
  }

  const isEmailStep = step === 'email'

  return (
    <div className='flex min-h-screen flex-col bg-white'>
      <header className='flex items-center justify-between px-6 py-5 lg:px-12'>
        <GiftseonLogo className='h-8 w-auto' />
        <BackToHomeLink />
      </header>

      <div className='flex flex-1 flex-col lg:flex-row'>
        <div className='flex flex-col justify-center px-6 py-8 lg:w-[45%] lg:px-12 lg:py-16'>
          <div className='mx-auto max-w-md lg:mx-0'>
            {isEmailStep ? (
              <ForgotPasswordIllustration className='h-44 w-auto' />
            ) : (
              <CreatePasswordIllustration className='h-44 w-auto' />
            )}
            <h1 className='mt-6 text-2xl font-bold text-blackish lg:text-3xl'>
              {isEmailStep ? 'Forgot Password' : 'Create Password'}
            </h1>
            <p className='mt-2 text-sm leading-relaxed text-grey-600'>
              {isEmailStep
                ? "Enter your admin email address and we'll send you a link to reset your password."
                : (
                  <>
                    Almost there!
                    <br />
                    Create a strong password to secure your company account.
                  </>
                )}
            </p>
          </div>
        </div>

        <div className='flex flex-1 items-start justify-center px-6 py-8 lg:items-center lg:px-12'>
          <div className='w-full max-w-md'>
            {error && (
              <p className='mb-4 rounded-lg border border-error-200 bg-error-50 px-3.5 py-2.5 text-sm text-error-600'>
                {error}
              </p>
            )}
            {isEmailStep ? (
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendEmail() }}
                className='space-y-5'
              >
                <div className='space-y-1.5'>
                  <label className='block text-sm font-medium text-blackish'>
                    Enter Email Address
                  </label>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Enter your admin email address'
                    className='form-input'
                  />
                </div>

                <button
                  type='submit'
                  disabled={!email || isLoading}
                  className='auth-btn-primary'
                >
                  {isLoading ? 'Sending...' : 'Continue'}
                </button>
              </form>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); handleCreatePassword() }}
                className='space-y-5'
              >
                <PasswordInput
                  label='Create Password'
                  value={password}
                  onChange={setPassword}
                  placeholder='Create your password'
                  showRules
                  name='newPassword'
                />

                <PasswordInput
                  label='Confirm Password'
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder='Confirm your password'
                  error={
                    confirmPassword.length > 0 && confirmPassword !== password
                      ? 'Passwords do not match'
                      : undefined
                  }
                  name='confirmNewPassword'
                />

                <button
                  type='submit'
                  disabled={!isPasswordFormValid || isLoading}
                  className='auth-btn-primary'
                >
                  {isLoading ? 'Resetting...' : 'Create Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
