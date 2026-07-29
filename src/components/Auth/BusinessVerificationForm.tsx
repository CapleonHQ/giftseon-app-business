'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ChevronDown, UploadCloud, FileCheck2, X, Plus, Trash2 } from 'lucide-react'
import type {
  BackendCompanyAddress,
  BackendCompanyOfficer,
  BackendRegistrationType,
  SubmitBusinessKycPayload,
  SubmitIndividualKycPayload,
} from '@/lib/api/company'

/** The company's own general profile fields (registrationNumber, address,
 * industry) aren't part of the KYC DTO — they belong to `PUT companies/profile`
 * — but this form collects them alongside the KYC-specific fields since
 * nothing else in the app collects them accurately today (the general
 * "industry" dropdown used at registration holds plain labels like
 * "Technology", not Anchor's own required classification — see
 * ANCHOR_INDUSTRIES below, confirmed against the live sandbox API). Callers
 * must persist these three via updateCompanyProfile before/alongside calling
 * submitCompanyKyc. */
export interface BusinessVerificationSubmission extends SubmitBusinessKycPayload {
  registrationNumber: string
  address: BackendCompanyAddress
  industry: string
}

/** Same reasoning as BusinessVerificationSubmission — the individual/BVN
 * path also needs the company's general `address` persisted, which nothing
 * else in the app collects. */
export interface IndividualVerificationSubmission extends SubmitIndividualKycPayload {
  address: BackendCompanyAddress
}

/** Anchor's own business classification, required verbatim on BusinessCustomer
 * creation (https://docs.getanchor.co/docs/business-customer-creation, confirmed
 * against the live sandbox API) — distinct from the app's own free-text
 * "industry" field used elsewhere for display/reporting. */
const ANCHOR_INDUSTRIES: { group: string; value: string; label: string }[] = [
  { group: 'Agriculture', value: 'Agriculture_AgriculturalCooperatives', label: 'Agricultural Cooperatives' },
  { group: 'Agriculture', value: 'Agriculture_AgriculturalServices', label: 'Agricultural Services' },
  { group: 'Commerce', value: 'Commerce_Automobiles', label: 'Automobiles' },
  { group: 'Commerce', value: 'Commerce_DigitalGoods', label: 'Digital Goods' },
  { group: 'Commerce', value: 'Commerce_PhysicalGoods', label: 'Physical Goods' },
  { group: 'Commerce', value: 'Commerce_RealEstate', label: 'Real Estate' },
  { group: 'Commerce', value: 'Commerce_DigitalServices', label: 'Digital Services' },
  { group: 'Commerce', value: 'Commerce_LegalServices', label: 'Legal Services' },
  { group: 'Commerce', value: 'Commerce_PhysicalServices', label: 'Physical Services' },
  { group: 'Commerce', value: 'Commerce_ProfessionalServices', label: 'Professional Services' },
  { group: 'Commerce', value: 'Commerce_OtherProfessionalServices', label: 'Other Professional Services' },
  { group: 'Education', value: 'Education_NurserySchools', label: 'Nursery Schools' },
  { group: 'Education', value: 'Education_PrimarySchools', label: 'Primary Schools' },
  { group: 'Education', value: 'Education_SecondarySchools', label: 'Secondary Schools' },
  { group: 'Education', value: 'Education_TertiaryInstitutions', label: 'Tertiary Institutions' },
  { group: 'Education', value: 'Education_VocationalTraining', label: 'Vocational Training' },
  { group: 'Education', value: 'Education_VirtualLearning', label: 'Virtual Learning' },
  { group: 'Education', value: 'Education_OtherEducationalServices', label: 'Other Educational Services' },
  { group: 'Gaming', value: 'Gaming_Betting', label: 'Betting' },
  { group: 'Gaming', value: 'Gaming_Lotteries', label: 'Lotteries' },
  { group: 'Gaming', value: 'Gaming_PredictionServices', label: 'Prediction Services' },
  { group: 'Financial Services', value: 'FinancialServices_FinancialCooperatives', label: 'Financial Cooperatives' },
  { group: 'Financial Services', value: 'FinancialServices_CorporateServices', label: 'Corporate Services' },
  { group: 'Financial Services', value: 'FinancialServices_PaymentSolutionServiceProviders', label: 'Payment Solution Service Providers' },
  { group: 'Financial Services', value: 'FinancialServices_Insurance', label: 'Insurance' },
  { group: 'Financial Services', value: 'FinancialServices_Investments', label: 'Investments' },
  { group: 'Financial Services', value: 'FinancialServices_AgriculturalInvestments', label: 'Agricultural Investments' },
  { group: 'Financial Services', value: 'FinancialServices_Lending', label: 'Lending' },
  { group: 'Financial Services', value: 'FinancialServices_BillPayments', label: 'Bill Payments' },
  { group: 'Financial Services', value: 'FinancialServices_Payroll', label: 'Payroll' },
  { group: 'Financial Services', value: 'FinancialServices_Remittances', label: 'Remittances' },
  { group: 'Financial Services', value: 'FinancialServices_Savings', label: 'Savings' },
  { group: 'Financial Services', value: 'FinancialServices_MobileWallets', label: 'Mobile Wallets' },
  { group: 'Health', value: 'Health_Gyms', label: 'Gyms' },
  { group: 'Health', value: 'Health_Hospitals', label: 'Hospitals' },
  { group: 'Health', value: 'Health_Pharmacies', label: 'Pharmacies' },
  { group: 'Health', value: 'Health_HerbalMedicine', label: 'Herbal Medicine' },
  { group: 'Health', value: 'Health_Telemedicine', label: 'Telemedicine' },
  { group: 'Health', value: 'Health_MedicalLaboratories', label: 'Medical Laboratories' },
  { group: 'Hospitality', value: 'Hospitality_Hotels', label: 'Hotels' },
  { group: 'Hospitality', value: 'Hospitality_Restaurants', label: 'Restaurants' },
  { group: 'Nonprofits & Leisure', value: 'Nonprofits_ProfessionalAssociations', label: 'Professional Associations' },
  { group: 'Nonprofits & Leisure', value: 'Nonprofits_GovernmentAgencies', label: 'Government Agencies' },
  { group: 'Nonprofits & Leisure', value: 'Nonprofits_NGOs', label: 'NGOs' },
  { group: 'Nonprofits & Leisure', value: 'Nonprofits_PoliticalParties', label: 'Political Parties' },
  { group: 'Nonprofits & Leisure', value: 'Nonprofits_ReligiousOrganizations', label: 'Religious Organizations' },
  { group: 'Nonprofits & Leisure', value: 'Nonprofits_Leisure_Entertainment', label: 'Leisure & Entertainment' },
  { group: 'Nonprofits & Leisure', value: 'Nonprofits_Cinemas', label: 'Cinemas' },
  { group: 'Nonprofits & Leisure', value: 'Nonprofits_Nightclubs', label: 'Nightclubs' },
  { group: 'Nonprofits & Leisure', value: 'Nonprofits_Events', label: 'Events' },
  { group: 'Nonprofits & Leisure', value: 'Nonprofits_Press_Media', label: 'Press & Media' },
  { group: 'Nonprofits & Leisure', value: 'Nonprofits_RecreationCentres', label: 'Recreation Centres' },
  { group: 'Nonprofits & Leisure', value: 'Nonprofits_StreamingServices', label: 'Streaming Services' },
  { group: 'Logistics', value: 'Logistics_CourierServices', label: 'Courier Services' },
  { group: 'Logistics', value: 'Logistics_FreightServices', label: 'Freight Services' },
  { group: 'Travel', value: 'Travel_Airlines', label: 'Airlines' },
  { group: 'Travel', value: 'Travel_Ridesharing', label: 'Ridesharing' },
  { group: 'Travel', value: 'Travel_TourServices', label: 'Tour Services' },
  { group: 'Travel', value: 'Travel_Transportation', label: 'Transportation' },
  { group: 'Travel', value: 'Travel_TravelAgencies', label: 'Travel Agencies' },
  { group: 'Utilities', value: 'Utilities_CableTelevision', label: 'Cable Television' },
  { group: 'Utilities', value: 'Utilities_Electricity', label: 'Electricity' },
  { group: 'Utilities', value: 'Utilities_Garbage_Disposal', label: 'Garbage Disposal' },
  { group: 'Utilities', value: 'Utilities_Internet', label: 'Internet' },
  { group: 'Utilities', value: 'Utilities_Telecoms', label: 'Telecoms' },
  { group: 'Utilities', value: 'Utilities_Water', label: 'Water' },
  { group: 'Other', value: 'Retail', label: 'Retail' },
  { group: 'Other', value: 'Wholesale', label: 'Wholesale' },
  { group: 'Other', value: 'Restaurants', label: 'Restaurants' },
  { group: 'Other', value: 'Construction', label: 'Construction' },
  { group: 'Other', value: 'Unions', label: 'Unions' },
  { group: 'Other', value: 'RealEstate', label: 'Real Estate' },
  { group: 'Other', value: 'FreelanceProfessional', label: 'Freelance Professional' },
  { group: 'Other', value: 'OtherProfessionalServices', label: 'Other Professional Services' },
  { group: 'Other', value: 'OtherEducationServices', label: 'Other Education Services' },
]

const ANCHOR_INDUSTRY_GROUPS = Array.from(new Set(ANCHOR_INDUSTRIES.map((i) => i.group)))

const REGISTRATION_TYPES: { value: BackendRegistrationType; label: string }[] = [
  { value: 'Private_Incorporated', label: 'Private Limited Company (Ltd)' },
  { value: 'Business_Name', label: 'Business Name' },
  { value: 'Incorporated_Trustees', label: 'Incorporated Trustees (NGO)' },
  { value: 'Free_Zone', label: 'Free Zone Enterprise' },
  { value: 'Gov', label: 'Government' },
  { value: 'Private_Incorporated_Gov', label: 'Government-owned Company' },
  { value: 'Cooperative_Society', label: 'Cooperative Society' },
  { value: 'Public_Incorporated', label: 'Public Limited Company (Plc)' },
]

type VerificationChoice = 'cac' | 'bvn_nin'

type OfficerRow = {
  role: 'OWNER' | 'DIRECTOR'
  firstName: string
  lastName: string
  middleName: string
  nationality: string
  addressLine1: string
  city: string
  state: string
  postalCode: string
  dateOfBirth: string
  email: string
  phoneNumber: string
  bvn: string
  percentageOwned: string
  title: string
}

const emptyOfficer = (role: OfficerRow['role']): OfficerRow => ({
  role,
  firstName: '',
  lastName: '',
  middleName: '',
  nationality: 'NG',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  dateOfBirth: '',
  email: '',
  phoneNumber: '',
  bvn: '',
  percentageOwned: '',
  title: '',
})

interface BusinessVerificationFormProps {
  onSubmitBusiness: (payload: BusinessVerificationSubmission) => Promise<void>
  onSubmitIndividual: (payload: IndividualVerificationSubmission) => Promise<void>
  isLoading: boolean
  submitLabel?: string
  onBack?: () => void
  formError?: string
}

export default function BusinessVerificationForm({
  onSubmitBusiness,
  onSubmitIndividual,
  isLoading,
  submitLabel = 'Submit for Review',
  onBack,
  formError,
}: BusinessVerificationFormProps) {
  const [verificationChoice, setVerificationChoice] = useState<VerificationChoice>('cac')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // CAC / business KYB path
  const [cacFile, setCacFile] = useState<File | null>(null)
  const [cacFilePreview, setCacFilePreview] = useState<string | null>(null)
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [anchorIndustry, setAnchorIndustry] = useState('')
  const [businessBvn, setBusinessBvn] = useState('')
  const [businessPhoneNumber, setBusinessPhoneNumber] = useState('')
  const [registrationType, setRegistrationType] = useState<BackendRegistrationType | ''>('')
  const [dateOfRegistration, setDateOfRegistration] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [officers, setOfficers] = useState<OfficerRow[]>([emptyOfficer('OWNER')])

  // BVN/NIN / individual path
  const [ownerFirstName, setOwnerFirstName] = useState('')
  const [ownerLastName, setOwnerLastName] = useState('')
  const [ownerMiddleName, setOwnerMiddleName] = useState('')
  const [ownerDateOfBirth, setOwnerDateOfBirth] = useState('')
  const [ownerGender, setOwnerGender] = useState<'Male' | 'Female' | ''>('')
  const [ownerBvn, setOwnerBvn] = useState('')
  const [ownerNin, setOwnerNin] = useState('')
  const [individualPhoneNumber, setIndividualPhoneNumber] = useState('')
  const [individualDescription, setIndividualDescription] = useState('')
  const [individualAddressLine1, setIndividualAddressLine1] = useState('')
  const [individualCity, setIndividualCity] = useState('')
  const [individualState, setIndividualState] = useState('')
  const [individualPostalCode, setIndividualPostalCode] = useState('')

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

  const updateOfficer = (index: number, updates: Partial<OfficerRow>) => {
    setOfficers((prev) => prev.map((o, i) => (i === index ? { ...o, ...updates } : o)))
  }

  const addOfficer = () => setOfficers((prev) => [...prev, emptyOfficer('DIRECTOR')])
  const removeOfficer = (index: number) =>
    setOfficers((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))

  const validateBusiness = (): Record<string, string> => {
    const next: Record<string, string> = {}
    if (!cacFile) next.cacFile = 'Upload your CAC certificate to continue'
    if (!registrationNumber) next.registrationNumber = 'Enter your CAC registration number (RC/BN)'
    if (!businessBvn || businessBvn.length !== 11) next.businessBvn = 'Enter a valid 11-digit BVN'
    if (!businessPhoneNumber || businessPhoneNumber.length !== 11)
      next.businessPhoneNumber = 'Enter a valid 11-digit phone number'
    if (!registrationType) next.registrationType = 'Select your registration type'
    if (!anchorIndustry) next.anchorIndustry = 'Select your business category'
    if (!dateOfRegistration) next.dateOfRegistration = 'Enter your registration date'
    if (!businessDescription) next.businessDescription = 'Briefly describe what your business does'
    if (!addressLine1) next.addressLine1 = 'Enter your registered address'
    if (!city) next.city = 'Enter a city'
    if (!state) next.state = 'Enter a state'
    if (!postalCode) next.postalCode = 'Enter a postal code'
    officers.forEach((o, i) => {
      if (!o.firstName || !o.lastName) next[`officer-${i}-name`] = 'Enter the officer’s full name'
      if (!o.dateOfBirth) next[`officer-${i}-dob`] = 'Enter a date of birth'
      if (!o.email) next[`officer-${i}-email`] = 'Enter an email address'
      if (!o.phoneNumber || o.phoneNumber.length !== 11) next[`officer-${i}-phone`] = 'Enter a valid 11-digit phone number'
      if (!o.bvn || o.bvn.length !== 11) next[`officer-${i}-bvn`] = 'Enter a valid 11-digit BVN'
      if (!o.addressLine1 || !o.city || !o.state || !o.postalCode) next[`officer-${i}-address`] = 'Enter a complete address'
    })
    return next
  }

  const validateIndividual = (): Record<string, string> => {
    const next: Record<string, string> = {}
    if (!ownerFirstName) next.ownerFirstName = 'Enter your first name'
    if (!ownerLastName) next.ownerLastName = 'Enter your last name'
    if (!ownerDateOfBirth) next.ownerDateOfBirth = 'Enter your date of birth'
    if (!ownerGender) next.ownerGender = 'Select a gender'
    if (!ownerBvn || ownerBvn.length !== 11) next.ownerBvn = 'Enter a valid 11-digit BVN'
    if (!ownerNin || ownerNin.length !== 11) next.ownerNin = 'Enter a valid 11-digit NIN'
    if (!individualPhoneNumber || individualPhoneNumber.length !== 11)
      next.individualPhoneNumber = 'Enter a valid 11-digit phone number'
    if (!individualAddressLine1) next.individualAddressLine1 = 'Enter your address'
    if (!individualCity) next.individualCity = 'Enter a city'
    if (!individualState) next.individualState = 'Enter a state'
    if (!individualPostalCode) next.individualPostalCode = 'Enter a postal code'
    return next
  }

  const handleSubmit = useCallback(async () => {
    if (verificationChoice === 'cac') {
      const validationErrors = validateBusiness()
      setErrors(validationErrors)
      if (Object.keys(validationErrors).length > 0) return

      await onSubmitBusiness({
        // No document-storage service exists yet in business-service, so the
        // CAC file's local blob URL is passed through — only resolvable in
        // this browser session. Anchor's own KYB doesn't consume this file
        // directly (see officers/business detail below), it's kept for our
        // own internal admin review record.
        verificationDocuments: cacFilePreview ? [cacFilePreview] : [],
        businessBvn,
        businessPhoneNumber,
        registrationType: registrationType as BackendRegistrationType,
        dateOfRegistration,
        businessDescription,
        registeredAddress: {
          addressLine1,
          addressLine2: addressLine2 || undefined,
          city,
          state,
          postalCode,
          country: 'NG',
        },
        // The company's own general profile fields — not part of the KYC
        // DTO, but nothing else in the app collects them accurately, and
        // Anchor's customer-creation call needs a general address + its own
        // industry classification too.
        registrationNumber,
        address: { street: addressLine1, city, state, postalCode, country: 'NG' },
        industry: anchorIndustry,
        officers: officers.map<BackendCompanyOfficer>((o) => ({
          role: o.role,
          firstName: o.firstName,
          lastName: o.lastName,
          middleName: o.middleName || undefined,
          nationality: o.nationality || 'NG',
          addressLine1: o.addressLine1,
          city: o.city,
          state: o.state,
          postalCode: o.postalCode,
          country: 'NG',
          dateOfBirth: o.dateOfBirth,
          email: o.email,
          phoneNumber: o.phoneNumber,
          bvn: o.bvn,
          percentageOwned: o.percentageOwned ? Number(o.percentageOwned) : undefined,
          title: o.title || undefined,
        })),
      })
    } else {
      const validationErrors = validateIndividual()
      setErrors(validationErrors)
      if (Object.keys(validationErrors).length > 0) return

      // NIN isn't consumed by Anchor's own identity check (BVN-only) — kept
      // here for the app's own record only, not sent to this endpoint.
      await onSubmitIndividual({
        ownerFirstName,
        ownerLastName,
        ownerMiddleName: ownerMiddleName || undefined,
        ownerDateOfBirth,
        ownerGender: ownerGender as 'Male' | 'Female',
        ownerBvn,
        businessPhoneNumber: individualPhoneNumber,
        businessDescription: individualDescription || undefined,
        address: {
          street: individualAddressLine1,
          city: individualCity,
          state: individualState,
          postalCode: individualPostalCode,
          country: 'NG',
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    verificationChoice,
    cacFile,
    cacFilePreview,
    businessBvn,
    businessPhoneNumber,
    registrationType,
    dateOfRegistration,
    businessDescription,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    officers,
    ownerFirstName,
    ownerLastName,
    ownerMiddleName,
    ownerDateOfBirth,
    ownerGender,
    ownerBvn,
    ownerNin,
    individualPhoneNumber,
    individualDescription,
  ])

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className='space-y-5'>
      {formError && (
        <div className='rounded-lg border border-error-200 bg-error-50 px-3.5 py-2.5 text-sm text-error-600'>
          {formError}
        </div>
      )}

      <div className='grid grid-cols-2 gap-4'>
        <button
          type='button'
          onClick={() => setVerificationChoice('cac')}
          className={`rounded-xl border-2 p-4 text-left transition-colors ${
            verificationChoice === 'cac' ? 'border-primary-400 bg-primary-50/30' : 'border-grey-100 hover:border-grey-200'
          }`}
        >
          <p className='text-sm font-semibold text-blackish'>CAC-Registered Business</p>
          <p className='mt-1 text-xs text-grey-500'>Upload your CAC certificate and business details.</p>
        </button>
        <button
          type='button'
          onClick={() => setVerificationChoice('bvn_nin')}
          className={`rounded-xl border-2 p-4 text-left transition-colors ${
            verificationChoice === 'bvn_nin' ? 'border-primary-400 bg-primary-50/30' : 'border-grey-100 hover:border-grey-200'
          }`}
        >
          <p className='text-sm font-semibold text-blackish'>No CAC Registration Yet</p>
          <p className='mt-1 text-xs text-grey-500'>Verify with your own BVN and NIN instead.</p>
        </button>
      </div>

      {verificationChoice === 'cac' && (
        <div className='space-y-6'>
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

          <div>
            <h3 className='text-sm font-semibold text-blackish'>Business Details</h3>
            <p className='text-xs text-grey-400'>Confirmed against your CAC registration.</p>
            <div className='mt-3 space-y-4'>
              <FormField label='CAC Registration Number (RC/BN)' error={errors.registrationNumber}>
                <input
                  type='text'
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder='e.g. RC1234567'
                  className='form-input'
                />
              </FormField>

              <FormField label='Registration Type' error={errors.registrationType}>
                <div className='relative'>
                  <select
                    value={registrationType}
                    onChange={(e) => setRegistrationType(e.target.value as BackendRegistrationType)}
                    className='form-input appearance-none pr-10'
                  >
                    <option value=''>Select an option</option>
                    {REGISTRATION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-400' />
                </div>
              </FormField>

              <FormField label='Business Category' error={errors.anchorIndustry}>
                <div className='relative'>
                  <select
                    value={anchorIndustry}
                    onChange={(e) => setAnchorIndustry(e.target.value)}
                    className='form-input appearance-none pr-10'
                  >
                    <option value=''>Select the closest match</option>
                    {ANCHOR_INDUSTRY_GROUPS.map((group) => (
                      <optgroup key={group} label={group}>
                        {ANCHOR_INDUSTRIES.filter((i) => i.group === group).map((i) => (
                          <option key={i.value} value={i.value}>{i.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-400' />
                </div>
              </FormField>

              <div className='grid grid-cols-2 gap-4'>
                <FormField label='Date of Registration' error={errors.dateOfRegistration}>
                  <input
                    type='date'
                    value={dateOfRegistration}
                    onChange={(e) => setDateOfRegistration(e.target.value)}
                    className='form-input'
                  />
                </FormField>
                <FormField label='Business BVN' error={errors.businessBvn}>
                  <input
                    type='text'
                    inputMode='numeric'
                    maxLength={11}
                    value={businessBvn}
                    onChange={(e) => setBusinessBvn(e.target.value.replace(/\D/g, ''))}
                    placeholder='11-digit BVN'
                    className='form-input'
                  />
                </FormField>
              </div>

              <FormField label='Business Phone Number' error={errors.businessPhoneNumber}>
                <input
                  type='text'
                  inputMode='numeric'
                  maxLength={11}
                  value={businessPhoneNumber}
                  onChange={(e) => setBusinessPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder='08012345678'
                  className='form-input'
                />
              </FormField>

              <FormField label='What does your business do?' error={errors.businessDescription}>
                <textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder='Briefly describe your business activities'
                  rows={2}
                  className='form-input resize-none'
                />
              </FormField>
            </div>
          </div>

          <div>
            <h3 className='text-sm font-semibold text-blackish'>Registered Address</h3>
            <p className='text-xs text-grey-400'>Your address on file with the CAC.</p>
            <div className='mt-3 space-y-4'>
              <FormField label='Address Line 1' error={errors.addressLine1}>
                <input type='text' value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder='Street address' className='form-input' />
              </FormField>
              <FormField label='Address Line 2 (optional)'>
                <input type='text' value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder='Apartment, suite, etc.' className='form-input' />
              </FormField>
              <div className='grid grid-cols-3 gap-4'>
                <FormField label='City' error={errors.city}>
                  <input type='text' value={city} onChange={(e) => setCity(e.target.value)} className='form-input' />
                </FormField>
                <FormField label='State' error={errors.state}>
                  <input type='text' value={state} onChange={(e) => setState(e.target.value)} className='form-input' />
                </FormField>
                <FormField label='Postal Code' error={errors.postalCode}>
                  <input type='text' value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className='form-input' />
                </FormField>
              </div>
            </div>
          </div>

          <div>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-semibold text-blackish'>Owners &amp; Directors</h3>
                <p className='text-xs text-grey-400'>At least one owner or director is required.</p>
              </div>
              <button
                type='button'
                onClick={addOfficer}
                className='flex items-center gap-1 rounded-lg border border-grey-200 px-3 py-1.5 text-xs font-medium text-grey-600 hover:bg-grey-50 transition-colors'
              >
                <Plus className='h-3.5 w-3.5' />
                Add another
              </button>
            </div>

            <div className='mt-3 space-y-4'>
              {officers.map((officer, index) => (
                <div key={index} className='rounded-xl border border-grey-100 p-4'>
                  <div className='mb-3 flex items-center justify-between'>
                    <div className='relative w-40'>
                      <select
                        value={officer.role}
                        onChange={(e) => updateOfficer(index, { role: e.target.value as OfficerRow['role'] })}
                        className='form-input appearance-none pr-8 py-1.5 text-xs'
                      >
                        <option value='OWNER'>Owner</option>
                        <option value='DIRECTOR'>Director</option>
                      </select>
                      <ChevronDown className='pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-grey-400' />
                    </div>
                    {officers.length > 1 && (
                      <button type='button' onClick={() => removeOfficer(index)} className='text-grey-400 hover:text-error-500'>
                        <Trash2 className='h-4 w-4' />
                      </button>
                    )}
                  </div>

                  <div className='space-y-3'>
                    <div className='grid grid-cols-2 gap-3'>
                      <FormField label='First Name' error={errors[`officer-${index}-name`]}>
                        <input type='text' value={officer.firstName} onChange={(e) => updateOfficer(index, { firstName: e.target.value })} className='form-input' />
                      </FormField>
                      <FormField label='Last Name'>
                        <input type='text' value={officer.lastName} onChange={(e) => updateOfficer(index, { lastName: e.target.value })} className='form-input' />
                      </FormField>
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                      <FormField label='Date of Birth' error={errors[`officer-${index}-dob`]}>
                        <input type='date' value={officer.dateOfBirth} onChange={(e) => updateOfficer(index, { dateOfBirth: e.target.value })} className='form-input' />
                      </FormField>
                      <FormField label='Nationality'>
                        <input type='text' value={officer.nationality} onChange={(e) => updateOfficer(index, { nationality: e.target.value })} className='form-input' />
                      </FormField>
                    </div>

                    <FormField label='Email' error={errors[`officer-${index}-email`]}>
                      <input type='email' value={officer.email} onChange={(e) => updateOfficer(index, { email: e.target.value })} className='form-input' />
                    </FormField>

                    <div className='grid grid-cols-2 gap-3'>
                      <FormField label='Phone Number' error={errors[`officer-${index}-phone`]}>
                        <input
                          type='text'
                          inputMode='numeric'
                          maxLength={11}
                          value={officer.phoneNumber}
                          onChange={(e) => updateOfficer(index, { phoneNumber: e.target.value.replace(/\D/g, '') })}
                          placeholder='08012345678'
                          className='form-input'
                        />
                      </FormField>
                      <FormField label='BVN' error={errors[`officer-${index}-bvn`]}>
                        <input
                          type='text'
                          inputMode='numeric'
                          maxLength={11}
                          value={officer.bvn}
                          onChange={(e) => updateOfficer(index, { bvn: e.target.value.replace(/\D/g, '') })}
                          placeholder='11-digit BVN'
                          className='form-input'
                        />
                      </FormField>
                    </div>

                    <FormField label='Residential Address' error={errors[`officer-${index}-address`]}>
                      <input type='text' value={officer.addressLine1} onChange={(e) => updateOfficer(index, { addressLine1: e.target.value })} placeholder='Street address' className='form-input mb-2' />
                      <div className='grid grid-cols-3 gap-2'>
                        <input type='text' value={officer.city} onChange={(e) => updateOfficer(index, { city: e.target.value })} placeholder='City' className='form-input' />
                        <input type='text' value={officer.state} onChange={(e) => updateOfficer(index, { state: e.target.value })} placeholder='State' className='form-input' />
                        <input type='text' value={officer.postalCode} onChange={(e) => updateOfficer(index, { postalCode: e.target.value })} placeholder='Postal code' className='form-input' />
                      </div>
                    </FormField>

                    {officer.role === 'OWNER' && (
                      <FormField label='Percentage Owned (optional)'>
                        <input
                          type='text'
                          inputMode='numeric'
                          value={officer.percentageOwned}
                          onChange={(e) => updateOfficer(index, { percentageOwned: e.target.value.replace(/\D/g, '') })}
                          placeholder='e.g. 100'
                          className='form-input'
                        />
                      </FormField>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {verificationChoice === 'bvn_nin' && (
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <FormField label='First Name' error={errors.ownerFirstName}>
              <input type='text' value={ownerFirstName} onChange={(e) => setOwnerFirstName(e.target.value)} className='form-input' />
            </FormField>
            <FormField label='Last Name' error={errors.ownerLastName}>
              <input type='text' value={ownerLastName} onChange={(e) => setOwnerLastName(e.target.value)} className='form-input' />
            </FormField>
          </div>

          <FormField label='Middle Name (optional)'>
            <input type='text' value={ownerMiddleName} onChange={(e) => setOwnerMiddleName(e.target.value)} className='form-input' />
          </FormField>

          <div className='grid grid-cols-2 gap-4'>
            <FormField label='Date of Birth' error={errors.ownerDateOfBirth}>
              <input type='date' value={ownerDateOfBirth} onChange={(e) => setOwnerDateOfBirth(e.target.value)} className='form-input' />
            </FormField>
            <FormField label='Gender' error={errors.ownerGender}>
              <div className='relative'>
                <select value={ownerGender} onChange={(e) => setOwnerGender(e.target.value as 'Male' | 'Female')} className='form-input appearance-none pr-10'>
                  <option value=''>Select an option</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                </select>
                <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-400' />
              </div>
            </FormField>
          </div>

          <FormField label='BVN (Bank Verification Number)' error={errors.ownerBvn}>
            <input
              type='text'
              inputMode='numeric'
              maxLength={11}
              value={ownerBvn}
              onChange={(e) => setOwnerBvn(e.target.value.replace(/\D/g, ''))}
              placeholder='Enter your 11-digit BVN'
              className='form-input'
            />
          </FormField>

          <FormField label='NIN (National Identification Number)' error={errors.ownerNin}>
            <input
              type='text'
              inputMode='numeric'
              maxLength={11}
              value={ownerNin}
              onChange={(e) => setOwnerNin(e.target.value.replace(/\D/g, ''))}
              placeholder='Enter your 11-digit NIN'
              className='form-input'
            />
          </FormField>

          <FormField label='Phone Number' error={errors.individualPhoneNumber}>
            <input
              type='text'
              inputMode='numeric'
              maxLength={11}
              value={individualPhoneNumber}
              onChange={(e) => setIndividualPhoneNumber(e.target.value.replace(/\D/g, ''))}
              placeholder='08012345678'
              className='form-input'
            />
          </FormField>

          <FormField label='What does your business do? (optional)'>
            <textarea
              value={individualDescription}
              onChange={(e) => setIndividualDescription(e.target.value)}
              placeholder='Briefly describe what you sell or do'
              rows={2}
              className='form-input resize-none'
            />
          </FormField>

          <FormField label='Address' error={errors.individualAddressLine1}>
            <input
              type='text'
              value={individualAddressLine1}
              onChange={(e) => setIndividualAddressLine1(e.target.value)}
              placeholder='Street address'
              className='form-input mb-2'
            />
            <div className='grid grid-cols-3 gap-2'>
              <div>
                <input type='text' value={individualCity} onChange={(e) => setIndividualCity(e.target.value)} placeholder='City' className='form-input' />
                {errors.individualCity && <p className='mt-1 text-xs text-error-500'>{errors.individualCity}</p>}
              </div>
              <div>
                <input type='text' value={individualState} onChange={(e) => setIndividualState(e.target.value)} placeholder='State' className='form-input' />
                {errors.individualState && <p className='mt-1 text-xs text-error-500'>{errors.individualState}</p>}
              </div>
              <div>
                <input type='text' value={individualPostalCode} onChange={(e) => setIndividualPostalCode(e.target.value)} placeholder='Postal code' className='form-input' />
                {errors.individualPostalCode && <p className='mt-1 text-xs text-error-500'>{errors.individualPostalCode}</p>}
              </div>
            </div>
          </FormField>
        </div>
      )}

      <div className={onBack ? 'grid grid-cols-2 gap-4' : ''}>
        {onBack && (
          <button
            type='button'
            onClick={onBack}
            className='flex items-center justify-center gap-2 rounded-xl border border-grey-200 py-3 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'
          >
            Go Back
          </button>
        )}
        <button type='submit' disabled={isLoading} className='auth-btn-primary'>
          {isLoading ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </form>
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
