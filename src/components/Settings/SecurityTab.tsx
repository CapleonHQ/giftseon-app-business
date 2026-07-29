'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import SuccessModal from '@/components/Profile/SuccessModal'

export default function SecurityTab() {
  const [twoFaEnabled, setTwoFaEnabled] = useState(false)
  const [show2faModal, setShow2faModal] = useState(false)
  const [twoFaMethod, setTwoFaMethod] = useState<'email' | 'phone'>('email')
  const [twoFaValue, setTwoFaValue] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false)

  const handle2faToggle = () => {
    if (!twoFaEnabled) setShow2faModal(true)
    else setTwoFaEnabled(false)
  }

  const confirm2fa = () => {
    setTwoFaEnabled(true)
    setShow2faModal(false)
    setTwoFaValue('')
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    setPasswordError('')
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    setShowPasswordSuccess(true)
  }

  return (
    <>
      <div className='space-y-8'>
        <div>
          <h3 className='text-base font-semibold text-blackish'>Two-Factor Authentication (2FA)</h3>
          <p className='text-sm text-grey-400'>
            Keep your company account safe by managing your authentication settings.
          </p>
          <div className='mt-4 flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-blackish'>Enable Two-Factor Authentication</p>
              <p className='text-xs text-grey-400'>
                Add an extra layer of security by requiring a code when logging in.
              </p>
            </div>
            <button
              onClick={handle2faToggle}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${twoFaEnabled ? 'bg-primary-500' : 'bg-grey-300'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${twoFaEnabled ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        <div>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-base font-semibold text-blackish'>Account Password</h3>
              <p className='text-sm text-grey-400'>
                Keep your admin account safe by managing your password.
              </p>
            </div>
          </div>
          <div className='mt-4 max-w-sm space-y-4'>
            {([
              { label: 'Current Password', placeholder: 'Enter your current password', key: 'current', value: currentPassword, setter: setCurrentPassword },
              { label: 'New Password', placeholder: 'Enter your new password', key: 'new', value: newPassword, setter: setNewPassword },
              { label: 'Confirm Password', placeholder: 'Confirm your new password', key: 'confirm', value: confirmPassword, setter: setConfirmPassword },
            ] as const).map(({ label, placeholder, key, value, setter }) => (
              <div key={key}>
                <label className='mb-1.5 block text-sm font-medium text-grey-600'>{label}</label>
                <div className='relative'>
                  <input
                    type={showPasswords[key] ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className='form-input pr-10'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPasswords((p) => ({ ...p, [key]: !p[key] }))}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 hover:text-grey-600'
                  >
                    {showPasswords[key] ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                  </button>
                </div>
              </div>
            ))}
            {passwordError && <p className='text-xs text-error-500'>{passwordError}</p>}
            <button
              onClick={handleChangePassword}
              className='rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all'
              style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {show2faModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='w-full max-w-sm rounded-xl bg-white p-6 shadow-xl'>
            <div className='flex items-center justify-between mb-1'>
              <h3 className='text-lg font-semibold text-blackish'>Set Up 2FA</h3>
              <button onClick={() => setShow2faModal(false)} className='text-grey-400 hover:text-blackish'>
                <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
                  <path d='M15 5L5 15M5 5L15 15' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
                </svg>
              </button>
            </div>
            <p className='text-sm text-grey-400 mb-5'>Admin actions will need to be confirmed with a one-time code.</p>

            <p className='mb-3 text-sm font-medium text-blackish'>Select Authentication Means</p>
            <div className='flex gap-4 mb-4'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input type='radio' name='2fa-method' checked={twoFaMethod === 'email'} onChange={() => setTwoFaMethod('email')} className='h-4 w-4 accent-primary-500' />
                <span className='text-sm text-grey-700'>Email address</span>
              </label>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input type='radio' name='2fa-method' checked={twoFaMethod === 'phone'} onChange={() => setTwoFaMethod('phone')} className='h-4 w-4 accent-primary-500' />
                <span className='text-sm text-grey-700'>Phone number</span>
              </label>
            </div>

            <div className='mb-5'>
              <label className='mb-1.5 block text-sm font-medium text-grey-600'>
                {twoFaMethod === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <input
                type={twoFaMethod === 'email' ? 'email' : 'tel'}
                placeholder={twoFaMethod === 'email' ? 'Enter your email address' : 'Enter your phone number'}
                value={twoFaValue}
                onChange={(e) => setTwoFaValue(e.target.value)}
                className='form-input'
              />
            </div>

            <div className='flex gap-3'>
              <button onClick={() => setShow2faModal(false)} className='flex-1 rounded-lg border border-grey-200 py-2.5 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'>Cancel</button>
              <button onClick={confirm2fa} className='flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-all' style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal open={showPasswordSuccess} onClose={() => setShowPasswordSuccess(false)} message='Your password has been changed successfully.' />
    </>
  )
}
