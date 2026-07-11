'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import GiftseonLogo from '@/components/Auth/GiftseonLogo'
import BackToHomeLink from '@/components/Auth/BackToHomeLink'
import LoginIllustration from '@/components/Auth/illustrations/LoginIllustration'
import { useAuth } from '@/context/AuthContext'
import type { CompanyProfile } from '@/types/Company'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isValid = email.length > 0 && password.length > 0

  const handleSubmit = useCallback(async () => {
    if (!isValid) return
    setError('')
    setIsLoading(true)

    // Dummy-data app: simulate an auth request, then actually establish a session.
    await new Promise((r) => setTimeout(r, 700))

    if (password.length < 4) {
      setIsLoading(false)
      setError('Incorrect email or password. Please try again.')
      return
    }

    const [localPart] = email.split('@')
    const companyName = localPart
      ? localPart.charAt(0).toUpperCase() + localPart.slice(1).replace(/[._-]/g, ' ')
      : 'Your Company'

    const profile: CompanyProfile = {
      id: 'company-1',
      companyName: `${companyName} Ltd`,
      businessType: 'Company',
      industry: 'Technology',
      adminFirstName: 'Amara',
      adminLastName: 'Bello',
      email,
      phone: '08012345678',
      isVerified: true,
      verificationMethod: 'cac',
      walletId: 'wallet-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    login(profile)
    setIsLoading(false)
    const next = searchParams.get('next')
    router.replace(next && next.startsWith('/') ? next : '/dashboard')
  }, [isValid, email, password, login, router, searchParams])

  return (
    <div className='flex min-h-screen flex-col bg-white'>
      {/* Header */}
      <header className='flex items-center justify-between px-6 py-5 lg:px-12'>
        <GiftseonLogo className='h-8 w-auto' />
        <BackToHomeLink />
      </header>

      {/* Body */}
      <div className='flex flex-1 flex-col lg:flex-row'>
        {/* Left panel */}
        <div className='flex flex-col justify-center px-6 py-8 lg:w-[45%] lg:px-12 lg:py-16'>
          <div className='mx-auto max-w-md lg:mx-0'>
            <LoginIllustration className='h-44 w-auto' />
            <h1 className='mt-6 text-2xl font-bold text-blackish lg:text-3xl'>
              Welcome Back
            </h1>
            <p className='mt-2 text-sm text-grey-600'>
              Log in to manage your company&apos;s employee gifting on Giftseon.
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className='flex flex-1 items-start justify-center px-6 py-8 lg:items-center lg:px-12'>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
            className='w-full max-w-md space-y-5'
          >
            {error && (
              <div className='flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 px-3.5 py-2.5 text-sm text-error-600 animate-shake-x'>
                <AlertCircle className='h-4 w-4 mt-0.5 shrink-0' />
                {error}
              </div>
            )}

            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-blackish'>
                Enter Work Email Address
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your work email address'
                className='form-input'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='block text-sm font-medium text-blackish'>
                Your Password
              </label>
              <div className='flex items-center rounded-lg border border-grey-200 bg-white px-3.5 py-2.5 transition-colors focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400/20'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Enter your account password'
                  className='flex-1 bg-transparent text-sm text-blackish outline-none placeholder:text-grey-400'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='ml-2 text-grey-400 hover:text-grey-600 transition-colors'
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className='h-4.5 w-4.5' /> : <Eye className='h-4.5 w-4.5' />}
                </button>
              </div>
              <div className='flex justify-end'>
                <Link
                  href='/forgot-password'
                  className='text-xs font-medium text-primary-500 hover:text-primary-600'
                >
                  Forgot Password
                </Link>
              </div>
            </div>

            <button
              type='submit'
              disabled={!isValid || isLoading}
              className='auth-btn-primary'
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>

            <p className='text-center text-sm text-grey-500'>
              Don&apos;t have a company account?{' '}
              <Link
                href='/register'
                className='font-medium text-primary-500 hover:text-primary-600 underline'
              >
                Set up your company
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
