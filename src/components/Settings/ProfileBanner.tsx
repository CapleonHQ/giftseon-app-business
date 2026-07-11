'use client'

import { useState, useRef } from 'react'
import { Camera } from 'lucide-react'

interface ProfileBannerProps {
  companyName: string
  businessType: string
  isVerified: boolean
  logoUrl?: string
  onLogoChange?: (file: File) => void
}

export default function ProfileBanner({
  companyName,
  businessType,
  isVerified,
  logoUrl,
  onLogoChange,
}: ProfileBannerProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSave = () => {
    if (selectedFile && onLogoChange) {
      onLogoChange(selectedFile)
    }
    setShowUpload(false)
    setSelectedFile(null)
  }

  const handleClose = () => {
    setShowUpload(false)
    setPreview(null)
    setSelectedFile(null)
  }

  return (
    <>
      <div className='relative'>
        <div className='h-28 rounded-t-xl bg-primary-500 overflow-hidden'>
          <svg className='h-full w-full' viewBox='0 0 800 120' preserveAspectRatio='none'>
            <defs>
              <pattern id='zigzag' width='60' height='120' patternUnits='userSpaceOnUse'>
                <path d='M0 60 L30 0 L60 60 L30 120 Z' fill='rgba(255,255,255,0.06)' />
              </pattern>
            </defs>
            <rect width='800' height='120' fill='var(--primary-500)' />
            <rect width='800' height='120' fill='url(#zigzag)' />
          </svg>
        </div>

        <div className='absolute -bottom-10 left-8'>
          <div className='relative'>
            <div className='h-20 w-20 rounded-full border-4 border-white bg-grey-100 overflow-hidden'>
              {(preview || logoUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview || logoUrl}
                  alt={companyName}
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-grey-200 text-2xl font-semibold text-grey-500'>
                  {companyName.charAt(0)}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className='absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white shadow-sm hover:bg-primary-600 transition-colors'
            >
              <Camera className='h-3 w-3' />
            </button>
          </div>
        </div>

        <div className='flex items-start justify-between px-8 pt-2'>
          <div className='pl-24'>
            <h2 className='text-lg font-semibold text-blackish'>{companyName}</h2>
            <p className='text-sm text-grey-500'>{businessType}</p>
          </div>
          {isVerified ? (
            <span className='flex items-center gap-1.5 rounded-full border border-success-200 bg-success-50 px-3 py-1 text-xs font-medium text-success-500'>
              <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
                <path d='M5.25 7L6.41667 8.16667L8.75 5.83333M12.25 7C12.25 9.8995 9.8995 12.25 7 12.25C4.10051 12.25 1.75 9.8995 1.75 7C1.75 4.10051 4.10051 1.75 7 1.75C9.8995 1.75 12.25 4.10051 12.25 7Z' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
              Verified
            </span>
          ) : (
            <span className='flex items-center gap-1.5 rounded-full border border-warning-200 bg-warning-50 px-3 py-1 text-xs font-medium text-warning-500'>
              Verification pending
            </span>
          )}
        </div>
      </div>

      {showUpload && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='w-full max-w-md rounded-xl bg-white p-6 shadow-xl'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-blackish'>Upload Company Logo</h3>
              <button onClick={handleClose} className='text-grey-400 hover:text-blackish'>
                <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
                  <path d='M15 5L5 15M5 5L15 15' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
                </svg>
              </button>
            </div>

            {preview ? (
              <div className='flex flex-col items-center gap-4'>
                <div className='h-48 w-48 overflow-hidden rounded-lg border border-grey-200'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt='Preview' className='h-full w-full object-cover' />
                </div>
                <div className='flex w-full gap-3'>
                  <button
                    onClick={handleClose}
                    className='flex-1 rounded-lg border border-grey-200 py-2.5 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className='flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-all'
                    style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
                  >
                    Save Logo
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center'>
                <div
                  className='flex w-full flex-col items-center rounded-lg border-2 border-dashed border-grey-200 py-10 cursor-pointer hover:border-primary-300 transition-colors'
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) handleFileSelect(file)
                  }}
                >
                  <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-50'>
                    <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
                      <path d='M10 4V16M4 10H16' stroke='var(--primary-500)' strokeWidth='1.5' strokeLinecap='round' />
                    </svg>
                  </div>
                  <p className='text-sm text-grey-600'>
                    <span className='font-medium text-primary-500'>Click to upload</span> or drag and drop
                  </p>
                  <p className='mt-1 text-xs text-grey-400'>SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </div>
                <p className='my-3 text-xs text-grey-400'>Or</p>
                <button
                  onClick={() => fileRef.current?.click()}
                  className='rounded-lg px-6 py-2 text-sm font-medium text-white transition-all'
                  style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
                >
                  Browse Files
                </button>
              </div>
            )}

            <input
              ref={fileRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
