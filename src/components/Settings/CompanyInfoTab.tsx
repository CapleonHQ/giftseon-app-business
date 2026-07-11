'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import SuccessModal from '@/components/Profile/SuccessModal'
import { useAuth } from '@/context/AuthContext'

type EditableFields = {
  companyName: string
  businessType: string
  industry: string
  adminFirstName: string
  adminLastName: string
  email: string
  phone: string
}

export default function CompanyInfoTab() {
  const { company, updateCompany } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

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
    { label: 'Admin First Name', key: 'adminFirstName' },
    { label: 'Admin Last Name', key: 'adminLastName' },
    { label: 'Admin Email Address', key: 'email' },
    { label: 'Admin Phone Number', key: 'phone' },
  ]

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
          <p className='text-sm text-grey-400'>The document used to verify your company on Giftseon.</p>
          <div className='mt-3 flex items-center justify-between rounded-lg border border-grey-100 px-4 py-3'>
            <div className='flex items-center gap-2'>
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                <path d='M9.33333 1.33334H4C3.64638 1.33334 3.30724 1.47381 3.05719 1.72386C2.80714 1.97391 2.66667 2.31305 2.66667 2.66668V13.3333C2.66667 13.687 2.80714 14.0261 3.05719 14.2762C3.30724 14.5262 3.64638 14.6667 4 14.6667H12C12.3536 14.6667 12.6928 14.5262 12.9428 14.2762C13.1929 14.0261 13.3333 13.687 13.3333 13.3333V5.33334L9.33333 1.33334Z' stroke='#87817f' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
              <span className='text-sm text-blackish'>
                {company?.verificationMethod === 'bvn_nin' ? 'BVN / NIN Confirmation' : 'CAC Certificate'}
              </span>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${company?.isVerified ? 'bg-success-50 text-success-500' : 'bg-warning-50 text-warning-500'}`}>
              {company?.isVerified ? 'Verified' : 'Under review'}
            </span>
          </div>
        </div>
      </div>

      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        message='Your company information has been successfully updated.'
      />
    </>
  )
}
