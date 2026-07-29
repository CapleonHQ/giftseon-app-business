'use client'

import { useState } from 'react'
import { Pencil, ShieldCheck, ShieldAlert, Clock, FileWarning } from 'lucide-react'
import SuccessModal from '@/components/Profile/SuccessModal'
import BusinessVerificationForm, {
  type BusinessVerificationSubmission,
  type IndividualVerificationSubmission,
} from '@/components/Auth/BusinessVerificationForm'
import { useAuth } from '@/context/AuthContext'
import * as companyApi from '@/lib/api/company'
import type { ApiError } from '@/lib/api/client'

type EditableFields = {
  companyName: string
  businessType: string
  industry: string
  adminFirstName: string
  adminLastName: string
  email: string
  phone: string
}

const VERIFICATION_STATUS_CONFIG = {
  not_started: { label: 'Not Started', badge: 'bg-grey-100 text-grey-500', icon: FileWarning },
  pending: { label: 'Under Review', badge: 'bg-warning-50 text-warning-500', icon: Clock },
  awaiting_document: { label: 'Action Required', badge: 'bg-warning-50 text-warning-500', icon: ShieldAlert },
  approved: { label: 'Verified', badge: 'bg-success-50 text-success-500', icon: ShieldCheck },
  rejected: { label: 'Rejected', badge: 'bg-error-50 text-error-500', icon: ShieldAlert },
} as const

export default function CompanyInfoTab() {
  const { company, updateCompany, refreshCompany } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false)
  const [verificationError, setVerificationError] = useState('')

  const baseInfo: EditableFields = {
    companyName: company?.companyName || '',
    businessType: company?.businessType || '',
    industry: company?.industry || '',
    adminFirstName: company?.adminFirstName || '',
    adminLastName: company?.adminLastName || '',
    email: company?.email || '',
    phone: company?.phone || '',
  }

  const [editInfo, setEditInfo] = useState<EditableFields>(baseInfo)

  const handleEdit = () => {
    setEditInfo(baseInfo)
    setIsEditing(true)
  }

  const handleSave = () => {
    updateCompany(editInfo)
    setIsEditing(false)
    setShowSuccess(true)
  }

  const handleCancel = () => {
    setEditInfo(baseInfo)
    setIsEditing(false)
  }

  const fields: { label: string; key: keyof EditableFields }[] = [
    { label: 'Company Name', key: 'companyName' },
    { label: 'Business Type', key: 'businessType' },
    { label: 'Industry', key: 'industry' },
    { label: 'First Name', key: 'adminFirstName' },
    { label: 'Last Name', key: 'adminLastName' },
    { label: 'Email Address', key: 'email' },
    { label: 'Phone Number', key: 'phone' },
  ]

  const status = company?.verificationStatus ?? 'not_started'
  const statusConfig = VERIFICATION_STATUS_CONFIG[status]
  const StatusIcon = statusConfig.icon
  const canStartVerification = status === 'not_started' || status === 'rejected'

  const handleVerificationSubmitted = async () => {
    setIsSubmittingVerification(false)
    setShowVerificationModal(false)
    await refreshCompany()
    setShowSuccess(true)
  }

  const handleSubmitBusinessKyc = async (payload: BusinessVerificationSubmission) => {
    setVerificationError('')
    setIsSubmittingVerification(true)
    try {
      const { registrationNumber, address, industry, ...kycPayload } = payload
      await companyApi.updateCompanyProfile({ registrationNumber, address, industry })
      await companyApi.submitCompanyKyc(kycPayload)
      await handleVerificationSubmitted()
    } catch (err) {
      setVerificationError((err as ApiError).message || 'Could not submit verification details. Please try again.')
      setIsSubmittingVerification(false)
    }
  }

  const handleSubmitIndividualKyc = async (payload: IndividualVerificationSubmission) => {
    setVerificationError('')
    setIsSubmittingVerification(true)
    try {
      const { address, ...kycPayload } = payload
      await companyApi.updateCompanyProfile({ address })
      await companyApi.submitIndividualKyc(kycPayload)
      await handleVerificationSubmitted()
    } catch (err) {
      setVerificationError((err as ApiError).message || 'Could not submit verification details. Please try again.')
      setIsSubmittingVerification(false)
    }
  }

  return (
    <>
      <div className='space-y-8'>
        <div>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-base font-semibold text-blackish'>Company Information</h3>
              <p className='text-sm text-grey-400'>These are your registered company details</p>
            </div>
            {isEditing ? (
              <div className='flex items-center gap-2'>
                <button
                  onClick={handleCancel}
                  className='rounded-lg border border-grey-200 px-4 py-2 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className='flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all'
                  style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <button
                onClick={handleEdit}
                className='flex items-center gap-1.5 rounded-lg border border-grey-200 px-4 py-2 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'
              >
                <Pencil className='h-3.5 w-3.5' />
                Edit
              </button>
            )}
          </div>

          <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
            {fields.map(({ label, key }) => (
              <div key={key}>
                <label className='mb-1.5 block text-sm font-medium text-grey-600'>{label}</label>
                {isEditing ? (
                  <input
                    type='text'
                    value={editInfo[key]}
                    onChange={(e) => setEditInfo({ ...editInfo, [key]: e.target.value })}
                    className='form-input'
                  />
                ) : (
                  <div className='rounded-lg border border-grey-100 bg-grey-50/50 px-3.5 py-2.5 text-sm text-blackish'>
                    {baseInfo[key] || '—'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className='text-base font-semibold text-blackish'>Verification</h3>
          <p className='text-sm text-grey-400'>
            Verifying your business unlocks wallet funding by bank transfer.
          </p>
          <div className='mt-3 flex items-center justify-between rounded-lg border border-grey-100 px-4 py-3'>
            <div className='flex items-center gap-2'>
              <StatusIcon className='h-4 w-4 text-grey-500' />
              <span className='text-sm text-blackish'>
                {company?.verificationMethod === 'bvn_nin'
                  ? 'BVN Confirmation (no CAC registration)'
                  : company?.verificationMethod === 'cac'
                    ? 'CAC-Registered Business'
                    : 'Not yet started'}
              </span>
            </div>
            <div className='flex items-center gap-3'>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.badge}`}>
                {statusConfig.label}
              </span>
              {canStartVerification && (
                <button
                  onClick={() => setShowVerificationModal(true)}
                  className='rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all'
                  style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
                >
                  {status === 'rejected' ? 'Resubmit' : 'Complete Verification'}
                </button>
              )}
            </div>
          </div>
          {status === 'awaiting_document' && (
            <p className='mt-2 text-xs text-warning-500'>
              We need additional documents to complete your verification — check your email for details.
            </p>
          )}
        </div>
      </div>

      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        message='Your company information has been successfully updated.'
      />

      {showVerificationModal && (
        <div className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8'>
          <div className='relative w-full max-w-xl rounded-xl bg-white p-6 shadow-xl sm:p-8'>
            <button
              onClick={() => setShowVerificationModal(false)}
              className='absolute right-4 top-4 text-grey-400 hover:text-blackish'
            >
              <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
                <path d='M15 5L5 15M5 5L15 15' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
              </svg>
            </button>

            <h3 className='text-lg font-semibold text-blackish'>Complete Verification</h3>
            <p className='mt-1 text-sm text-grey-400'>
              Verify your business with your CAC document, or confirm your identity with your BVN.
            </p>

            <div className='mt-6'>
              <BusinessVerificationForm
                onSubmitBusiness={handleSubmitBusinessKyc}
                onSubmitIndividual={handleSubmitIndividualKyc}
                isLoading={isSubmittingVerification}
                formError={verificationError}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
