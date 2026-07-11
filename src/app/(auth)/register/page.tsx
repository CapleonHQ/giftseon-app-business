'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { ChevronDown, UploadCloud, FileCheck2, X } from 'lucide-react'
import GiftseonLogo from '@/components/Auth/GiftseonLogo'
import BackToHomeLink from '@/components/Auth/BackToHomeLink'
import StepIndicator from '@/components/Auth/StepIndicator'
import OtpInput from '@/components/Auth/OtpInput'
import BusinessInfoIllustration from '@/components/Auth/illustrations/BusinessInfoIllustration'
import EmailVerificationIllustration from '@/components/Auth/illustrations/EmailVerificationIllustration'
import SuccessScreen from '@/components/Auth/SuccessScreen'
import { useAuth } from '@/context/AuthContext'
import type { CompanyProfile } from '@/types/Company'

const BUSINESS_TYPES = ['Startup', 'SME', 'Enterprise', 'NGO / Non-profit']
const INDUSTRIES = ['Technology', 'Finance', 'Retail', 'Manufacturing', 'Healthcare', 'Education', 'Logistics', 'Other']

type VerificationChoice = 'cac' | 'bvn_nin'

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Step 1 — Company & Admin details
  const [companyName, setCompanyName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [industry, setIndustry] = useState('')
  const [adminFirstName, setAdminFirstName] = useState('')
  const [adminLastName, setAdminLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [brandColor, setBrandColor] = useState('#1A1ABC')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Step 2 — Business verification
  const [verificationChoice, setVerificationChoice] = useState<VerificationChoice>('cac')
  const [cacFile, setCacFile] = useState<File | null>(null)
  const [bvn, setBvn] = useState('')
  const [nin, setNin] = useState('')

  // Step 3 — OTP
  const [otpCode, setOtpCode] = useState('')

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
      if (accepted[0]) setCacFile(accepted[0])
    },
  })

  const handleLogoSelect = (file: File) => {
    setLogoPreview(URL.createObjectURL(file))
  }

  const isStep1Valid = companyName && businessType && industry && adminFirstName && adminLastName && email && phone

  const validateStep1 = () => {
    const next: Record<string, string> = {}
    if (!companyName) next.companyName = 'Company name is required'
    if (!businessType) next.businessType = 'Select a business type'
    if (!industry) next.industry = 'Select an industry'
    if (!adminFirstName) next.adminFirstName = 'Admin first name is required'
    if (!adminLastName) next.adminLastName = 'Admin last name is required'
    if (!email) next.email = 'Admin email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address'
    if (!phone) next.phone = 'Admin phone number is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const validateStep2 = () => {
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
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 500))
    setIsLoading(false)
    setStep(2)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyName, businessType, industry, adminFirstName, adminLastName, email, phone])

  const handleStep2Submit = useCallback(async () => {
    if (!validateStep2()) return
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setIsLoading(false)
    setStep(3)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationChoice, cacFile, bvn, nin])

  const handleVerifyOtp = useCallback(async () => {
    if (otpCode.replace(/\s/g, '').length < 4) return
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setIsLoading(false)
    setStep(4)
  }, [otpCode])

  const handleEnterDashboard = useCallback(() => {
    const profile: CompanyProfile = {
      id: 'company-1',
      companyName,
      businessType,
      industry,
      adminFirstName,
      adminLastName,
      email,
      phone,
      logo: logoPreview || undefined,
      brandColor,
      isVerified: false,
      verificationMethod: verificationChoice,
      walletId: 'wallet-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    login(profile)
    router.push('/dashboard')
  }, [companyName, businessType, industry, adminFirstName, adminLastName, email, phone, logoPreview, brandColor, verificationChoice, login, router])

  if (step === 4) {
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
      title: 'Company & Admin Details',
      subtitle: (
        <>
          Tell us about your company and who&apos;ll be administering gifting,
          <br />
          we&apos;ll set up your company wallet automatically.
        </>
      ),
    },
    2: {
      illustration: <BusinessInfoIllustration className='h-44 w-auto' />,
      title: 'Business Verification',
      subtitle: 'Verify your business with your CAC document, or confirm your identity with BVN/NIN.',
    },
    3: {
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
              <StepIndicator current={step} total={3} />
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
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); handleStep1Submit() }} className='space-y-5'>
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

                <FormField label='Admin Email Address' error={errors.email}>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='admin@yourcompany.com'
                    className={`form-input ${errors.email ? 'border-error-400' : ''}`}
                  />
                </FormField>

                <FormField label='Admin Phone Number' error={errors.phone}>
                  <input
                    type='tel'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder='Enter a valid phone number'
                    className={`form-input ${errors.phone ? 'border-error-400' : ''}`}
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

                <FormField label='Brand Color'>
                  <div className='flex items-center gap-3'>
                    <input
                      type='color'
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className='h-10 w-14 cursor-pointer rounded-lg border border-grey-200'
                    />
                    <span className='text-sm text-grey-500'>{brandColor.toUpperCase()}</span>
                  </div>
                  <p className='mt-1 text-xs text-grey-400'>Applied to branded gift claim pages and notifications. You can change this anytime under Branded Gifting.</p>
                </FormField>

                <button type='submit' disabled={!isStep1Valid || isLoading} className='auth-btn-primary'>
                  {isLoading ? 'Saving...' : 'Save and Continue'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); handleStep2Submit() }} className='space-y-5'>
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
                        <button type='button' onClick={() => setCacFile(null)} className='text-grey-400 hover:text-error-500'>
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
                  <button type='button' onClick={() => setStep(1)} className='flex items-center justify-center gap-2 rounded-xl border border-grey-200 py-3 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'>
                    Go Back
                  </button>
                  <button type='submit' disabled={isLoading} className='auth-btn-primary'>
                    {isLoading ? 'Submitting...' : 'Continue'}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className='space-y-6'>
                <OtpInput value={otpCode} onChange={setOtpCode} />
                <button
                  type='button'
                  onClick={handleVerifyOtp}
                  disabled={otpCode.replace(/\s/g, '').length < 4 || isLoading}
                  className='auth-btn-primary'
                >
                  {isLoading ? 'Verifying...' : 'Verify and Create Account'}
                </button>
                <p className='text-center text-sm text-grey-500'>
                  Didn&apos;t get the OTP?{' '}
                  <button type='button' className='font-medium text-primary-500 hover:text-primary-600 underline'>
                    Resend OTP
                  </button>
                </p>
              </div>
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
