'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { ChevronDown, UploadCloud, FileCheck2, X, AlertCircle } from 'lucide-react'
import GiftseonLogo from '@/components/Auth/GiftseonLogo'
import BackToHomeLink from '@/components/Auth/BackToHomeLink'
import StepIndicator from '@/components/Auth/StepIndicator'
import OtpInput from '@/components/Auth/OtpInput'
import PasswordInput, { PASSWORD_RULES } from '@/components/Auth/PasswordInput'
import BusinessInfoIllustration from '@/components/Auth/illustrations/BusinessInfoIllustration'
import EmailVerificationIllustration from '@/components/Auth/illustrations/EmailVerificationIllustration'
import SuccessScreen from '@/components/Auth/SuccessScreen'
import { useAuth } from '@/context/AuthContext'
import * as companyApi from '@/lib/api/company'
import type { ApiError } from '@/lib/api/client'

const BUSINESS_TYPES = ['Startup', 'SME', 'Enterprise', 'NGO / Non-profit']
const INDUSTRIES = ['Technology', 'Finance', 'Retail', 'Manufacturing', 'Healthcare', 'Education', 'Logistics', 'Other']
const GENDERS = ['Male', 'Female', 'Other']

type VerificationChoice = 'cac' | 'bvn_nin'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { registerAccount, verifyOtp, resendVerification, setCompany, status, company, user } = useAuth()
  const [step, setStep] = useState(searchParams.get('step') === 'otp' ? 2 : 1)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')

  // Step 1 — Admin account
  const [adminFirstName, setAdminFirstName] = useState('')
  const [adminLastName, setAdminLastName] = useState('')
  const [gender, setGender] = useState('')
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [password, setPassword] = useState('')

  // Step 2 — OTP
  const [otpCode, setOtpCode] = useState('')

  // Step 3 — Company profile
  const [companyName, setCompanyName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Step 4 — Business verification
  const [verificationChoice, setVerificationChoice] = useState<VerificationChoice>('cac')
  const [cacFile, setCacFile] = useState<File | null>(null)
  const [cacFilePreview, setCacFilePreview] = useState<string | null>(null)
  const [bvn, setBvn] = useState('')
  const [nin, setNin] = useState('')

  useEffect(() => {
    if (searchParams.get('step') === 'otp') setStep(2)
  }, [searchParams])

  // Once OTP verification succeeds (or on a page refresh mid-wizard), the
  // user already has an authenticated session but no Company row yet —
  // resume at the company-details step rather than resetting to step 1
  // (which would fail outright since the account already exists).
  useEffect(() => {
    if (status === 'authenticated' && !company) {
      setStep((s) => (s < 3 ? 3 : s))
    }
  }, [status, company])

  // When resuming mid-wizard on a fresh page load, step 1's fields were
  // never filled in on this mount — pre-fill the admin's real name/email
  // from the already-authenticated session so step 3's submission doesn't
  // send empty strings for them.
  useEffect(() => {
    if (!user) return
    setAdminFirstName((v) => v || user.firstName)
    setAdminLastName((v) => v || user.lastName)
    setEmail((v) => v || user.email)
  }, [user])

  const maskedEmail = useMemo(() => {
    if (!email) return ''
    const [local, domain] = email.split('@')
    if (!domain) return email
    const visible = local.slice(0, 1)
    return `${visible}${'*'.repeat(Math.max(local.length - 1, 3))}@${domain}`
  }, [email])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) {
        setCacFile(accepted[0])
        setCacFilePreview(URL.createObjectURL(accepted[0]))
      }
    },
  })

  const handleLogoSelect = (file: File) => {
    setLogoPreview(URL.createObjectURL(file))
  }

  const isPasswordValid = PASSWORD_RULES.every((r) => r.test(password))
  const isStep1Valid = adminFirstName && adminLastName && gender && email && isPasswordValid

  const validateStep1 = () => {
    const next: Record<string, string> = {}
    if (!adminFirstName) next.adminFirstName = 'Admin first name is required'
    if (!adminLastName) next.adminLastName = 'Admin last name is required'
    if (!gender) next.gender = 'Select a gender'
    if (!email) next.email = 'Admin email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address'
    if (!isPasswordValid) next.password = 'Password does not meet the criteria'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const isStep3Valid = companyName && businessType && industry

  const validateStep3 = () => {
    const next: Record<string, string> = {}
    if (!companyName) next.companyName = 'Company name is required'
    if (!businessType) next.businessType = 'Select a business type'
    if (!industry) next.industry = 'Select an industry'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const validateStep4 = () => {
    const next: Record<string, string> = {}
    if (verificationChoice === 'cac' && !cacFile) {
      next.cacFile = 'Upload your CAC certificate to continue'
    }
    if (verificationChoice === 'bvn_nin') {
      if (!bvn || bvn.length !== 11) next.bvn = 'Enter a valid 11-digit BVN'
      if (!nin || nin.length !== 11) next.nin = 'Enter a valid 11-digit NIN'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleStep1Submit = useCallback(async () => {
    if (!validateStep1()) return
    setFormError('')
    setIsLoading(true)
    try {
      await registerAccount({ firstName: adminFirstName, lastName: adminLastName, gender, country: 'NG', email, password })
      setStep(2)
    } catch (err) {
      setFormError((err as ApiError).message || 'Could not create your account. Please try again.')
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminFirstName, adminLastName, gender, email, password, registerAccount])

  const handleVerifyOtp = useCallback(async () => {
    if (otpCode.replace(/\s/g, '').length < 6) return
    setFormError('')
    setIsLoading(true)
    try {
      await verifyOtp(email, otpCode)
      setStep(3)
    } catch (err) {
      setFormError((err as ApiError).message || 'Invalid or expired code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [otpCode, email, verifyOtp])

  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleResendOtp = useCallback(async () => {
    setFormError('')
    setResendMessage('')
    setIsResending(true)
    try {
      await resendVerification(email)
      setResendMessage('A new code has been sent to your email.')
    } catch (err) {
      setFormError((err as ApiError).message || 'Could not resend the code. Please try again.')
    } finally {
      setIsResending(false)
    }
  }, [email, resendVerification])

  const handleStep3Submit = useCallback(async () => {
    if (!validateStep3()) return
    setFormError('')
    setIsLoading(true)
    try {
      const backendCompany = await companyApi.registerCompany({
        businessName: companyName,
        businessType,
        industry,
        website: website || undefined,
        logoUrl: logoPreview || undefined,
      })
      setCompany(companyApi.toCompanyProfile(backendCompany, {
        id: backendCompany.userId,
        firstName: adminFirstName,
        lastName: adminLastName,
        email,
      }))
      setStep(4)
    } catch (err) {
      setFormError((err as ApiError).message || 'Could not save your company profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyName, businessType, industry, website, logoPreview])

  const handleStep4Submit = useCallback(async () => {
    if (!validateStep4()) return
    setFormError('')
    setIsLoading(true)
    try {
      // No document-upload service exists yet in business-service — CAC
      // uploads are passed as their local blob URL (valid URI, but only
      // resolvable in this browser session), and BVN/NIN has no dedicated
      // backend field yet, so it's encoded as a urn: pseudo-document.
      // Known gap: real file storage + BVN/NIN verification are out of scope
      // for Phase 1.
      const documents =
        verificationChoice === 'cac' && cacFilePreview
          ? [cacFilePreview]
          : [`urn:bvn-nin:${bvn}:${nin}`]
      const backendCompany = await companyApi.submitCompanyKyc(documents)
      setCompany(companyApi.toCompanyProfile(backendCompany, {
        id: backendCompany.userId,
        firstName: adminFirstName,
        lastName: adminLastName,
        email,
      }))
      setStep(5)
    } catch (err) {
      setFormError((err as ApiError).message || 'Could not submit verification documents. Please try again.')
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationChoice, cacFilePreview, bvn, nin])

  const handleEnterDashboard = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  if (step === 5) {
    return (
      <SuccessScreen
        message="Your company account has been created and your verification documents are under review. A company wallet has been set up automatically — you can start configuring gifting right away."
        buttonLabel='Go to Company Dashboard'
        onAction={handleEnterDashboard}
      />
    )
  }

  const stepConfig = {
    1: {
      illustration: <BusinessInfoIllustration className='h-44 w-auto' />,
      title: 'Create Your Admin Account',
      subtitle: 'Tell us who will be administering gifting for your company.',
    },
    2: {
      illustration: <EmailVerificationIllustration className='h-44 w-auto' />,
      title: 'Email Verification',
      subtitle: (
        <>
          Please enter the OTP sent to your admin email address
          <br />
          <span className='text-grey-500'>{maskedEmail}</span>
        </>
      ),
    },
    3: {
      illustration: <BusinessInfoIllustration className='h-44 w-auto' />,
      title: 'Company Details',
      subtitle: (
        <>
          Tell us about your company,
          <br />
          we&apos;ll set up your company wallet automatically.
        </>
      ),
    },
    4: {
      illustration: <BusinessInfoIllustration className='h-44 w-auto' />,
      title: 'Business Verification',
      subtitle: 'Verify your business with your CAC document, or confirm your identity with BVN/NIN.',
    },
  } as const

  const current = stepConfig[step as keyof typeof stepConfig]

  return (
    <div className='flex min-h-screen flex-col bg-white'>
      <header className='flex items-center justify-between px-6 py-5 lg:px-12'>
        <GiftseonLogo className='h-8 w-auto' />
        <BackToHomeLink />
      </header>

      <div className='flex flex-1 flex-col lg:flex-row'>
        {/* Left panel — context */}
        <div className='flex flex-col justify-center px-6 py-8 lg:w-[45%] lg:px-12 lg:py-16'>
          <div className='mx-auto max-w-md lg:mx-0'>
            {current.illustration}
            <div className='mt-6'>
              <StepIndicator current={step} total={4} />
            </div>
            <h1 className='mt-3 text-2xl font-bold text-blackish lg:text-3xl'>
              {current.title}
            </h1>
            <p className='mt-2 text-sm leading-relaxed text-grey-600'>
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className='flex flex-1 items-start justify-center px-6 py-8 lg:items-center lg:px-12'>
          <div className='w-full max-w-md'>
            {formError && (
              <div className='mb-5 flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 px-3.5 py-2.5 text-sm text-error-600'>
                <AlertCircle className='h-4 w-4 mt-0.5 shrink-0' />
                {formError}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); handleStep1Submit() }} className='space-y-5'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField label='Admin First Name' error={errors.adminFirstName}>
                    <input
                      type='text'
                      value={adminFirstName}
                      onChange={(e) => setAdminFirstName(e.target.value)}
                      placeholder='First name'
                      className={`form-input ${errors.adminFirstName ? 'border-error-400' : ''}`}
                    />
                  </FormField>
                  <FormField label='Admin Last Name' error={errors.adminLastName}>
                    <input
                      type='text'
                      value={adminLastName}
                      onChange={(e) => setAdminLastName(e.target.value)}
                      placeholder='Last name'
                      className={`form-input ${errors.adminLastName ? 'border-error-400' : ''}`}
                    />
                  </FormField>
                </div>

                <FormField label='Gender' error={errors.gender}>
                  <div className='relative'>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className='form-input appearance-none pr-10'
                    >
                      <option value=''>Select an option</option>
                      {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-400' />
                  </div>
                </FormField>

                <FormField label='Admin Email Address' error={errors.email}>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='admin@yourcompany.com'
                    className={`form-input ${errors.email ? 'border-error-400' : ''}`}
                  />
                </FormField>

                <PasswordInput
                  label='Create Password'
                  value={password}
                  onChange={setPassword}
                  placeholder='Create your password'
                  showRules
                  error={errors.password}
                  name='newPassword'
                />

                <button type='submit' disabled={!isStep1Valid || isLoading} className='auth-btn-primary'>
                  {isLoading ? 'Creating account...' : 'Continue'}
                </button>

                <p className='text-center text-sm text-grey-500'>
                  Already have a company account?{' '}
                  <a href='/login' className='font-medium text-primary-500 hover:text-primary-600 underline'>
                    Log in
                  </a>
                </p>
              </form>
            )}

            {step === 2 && (
              <div className='space-y-6'>
                <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
                <button
                  type='button'
                  onClick={handleVerifyOtp}
                  disabled={otpCode.replace(/\s/g, '').length < 6 || isLoading}
                  className='auth-btn-primary'
                >
                  {isLoading ? 'Verifying...' : 'Verify and Continue'}
                </button>
                <p className='text-center text-sm text-grey-500'>
                  Didn&apos;t get the OTP?{' '}
                  <button
                    type='button'
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className='font-medium text-primary-500 hover:text-primary-600 underline disabled:opacity-60'
                  >
                    {isResending ? 'Resending...' : 'Resend OTP'}
                  </button>
                </p>
                {resendMessage && (
                  <p className='text-center text-sm text-success-500'>{resendMessage}</p>
                )}
              </div>
            )}

            {step === 3 && (
              <form onSubmit={(e) => { e.preventDefault(); handleStep3Submit() }} className='space-y-5'>
                <FormField label='Company Name' error={errors.companyName}>
                  <input
                    type='text'
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder='Enter your registered company name'
                    className={`form-input ${errors.companyName ? 'border-error-400' : ''}`}
                  />
                </FormField>

                <FormField label='Business Type' error={errors.businessType}>
                  <div className='relative'>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className='form-input appearance-none pr-10'
                    >
                      <option value=''>Select an option</option>
                      {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-400' />
                  </div>
                </FormField>

                <FormField label='Industry' error={errors.industry}>
                  <div className='relative'>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className='form-input appearance-none pr-10'
                    >
                      <option value=''>Select an option</option>
                      {INDUSTRIES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-400' />
                  </div>
                </FormField>

                <FormField label='Company Website (optional)'>
                  <input
                    type='url'
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder='https://yourcompany.com'
                    className='form-input'
                  />
                </FormField>

                <FormField label='Company Logo (optional)'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-grey-200 bg-grey-50'>
                      {logoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoPreview} alt='Logo preview' className='h-full w-full object-cover' />
                      ) : (
                        <UploadCloud className='h-5 w-5 text-grey-300' />
                      )}
                    </div>
                    <label className='cursor-pointer rounded-lg border border-grey-200 px-4 py-2 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'>
                      Upload logo
                      <input
                        type='file'
                        accept='image/*'
                        className='hidden'
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleLogoSelect(file)
                        }}
                      />
                    </label>
                  </div>
                  <p className='mt-1 text-xs text-grey-400'>Used on branded gift notifications sent to your employees.</p>
                </FormField>

                <button type='submit' disabled={!isStep3Valid || isLoading} className='auth-btn-primary'>
                  {isLoading ? 'Saving...' : 'Save and Continue'}
                </button>
              </form>
            )}

            {step === 4 && (
              <form onSubmit={(e) => { e.preventDefault(); handleStep4Submit() }} className='space-y-5'>
                <div className='grid grid-cols-2 gap-4'>
                  <button
                    type='button'
                    onClick={() => setVerificationChoice('cac')}
                    className={`rounded-xl border-2 p-4 text-left transition-colors ${
                      verificationChoice === 'cac' ? 'border-primary-400 bg-primary-50/30' : 'border-grey-100 hover:border-grey-200'
                    }`}
                  >
                    <p className='text-sm font-semibold text-blackish'>CAC Document</p>
                    <p className='mt-1 text-xs text-grey-500'>Upload your Corporate Affairs Commission certificate.</p>
                  </button>
                  <button
                    type='button'
                    onClick={() => setVerificationChoice('bvn_nin')}
                    className={`rounded-xl border-2 p-4 text-left transition-colors ${
                      verificationChoice === 'bvn_nin' ? 'border-primary-400 bg-primary-50/30' : 'border-grey-100 hover:border-grey-200'
                    }`}
                  >
                    <p className='text-sm font-semibold text-blackish'>BVN / NIN</p>
                    <p className='mt-1 text-xs text-grey-500'>Confirm the admin&apos;s identity instead.</p>
                  </button>
                </div>

                {verificationChoice === 'cac' && (
                  <div>
                    <label className='mb-1.5 block text-sm font-medium text-blackish'>CAC Certificate</label>
                    {cacFile ? (
                      <div className='flex items-center justify-between rounded-lg border border-grey-200 bg-grey-50/50 px-4 py-3'>
                        <div className='flex items-center gap-2 text-sm text-blackish'>
                          <FileCheck2 className='h-4 w-4 text-success-500' />
                          {cacFile.name}
                        </div>
                        <button type='button' onClick={() => { setCacFile(null); setCacFilePreview(null) }} className='text-grey-400 hover:text-error-500'>
                          <X className='h-4 w-4' />
                        </button>
                      </div>
                    ) : (
                      <div
                        {...getRootProps()}
                        className={`flex flex-col items-center rounded-lg border-2 border-dashed py-8 cursor-pointer transition-colors ${
                          isDragActive ? 'border-primary-400 bg-primary-50/30' : 'border-grey-200 hover:border-primary-300'
                        }`}
                      >
                        <input {...getInputProps()} />
                        <UploadCloud className='mb-2 h-6 w-6 text-primary-400' />
                        <p className='text-sm text-grey-600'>
                          <span className='font-medium text-primary-500'>Click to upload</span> or drag and drop
                        </p>
                        <p className='mt-1 text-xs text-grey-400'>PDF, PNG or JPG (max. 5MB)</p>
                      </div>
                    )}
                    {errors.cacFile && <p className='mt-1.5 text-xs text-error-500'>{errors.cacFile}</p>}
                  </div>
                )}

                {verificationChoice === 'bvn_nin' && (
                  <div className='space-y-5'>
                    <FormField label='BVN (Bank Verification Number)' error={errors.bvn}>
                      <input
                        type='text'
                        inputMode='numeric'
                        maxLength={11}
                        value={bvn}
                        onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                        placeholder='Enter your 11-digit BVN'
                        className={`form-input ${errors.bvn ? 'border-error-400' : ''}`}
                      />
                    </FormField>
                    <FormField label='NIN (National Identification Number)' error={errors.nin}>
                      <input
                        type='text'
                        inputMode='numeric'
                        maxLength={11}
                        value={nin}
                        onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                        placeholder='Enter your 11-digit NIN'
                        className={`form-input ${errors.nin ? 'border-error-400' : ''}`}
                      />
                    </FormField>
                  </div>
                )}

                <div className='grid grid-cols-2 gap-4'>
                  <button type='button' onClick={() => setStep(3)} className='flex items-center justify-center gap-2 rounded-xl border border-grey-200 py-3 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'>
                    Go Back
                  </button>
                  <button type='submit' disabled={isLoading} className='auth-btn-primary'>
                    {isLoading ? 'Submitting...' : 'Submit for Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className='space-y-1.5'>
      <label className='block text-sm font-medium text-blackish'>{label}</label>
      {children}
      {error && <p className='text-xs text-error-500'>{error}</p>}
    </div>
  )
}
