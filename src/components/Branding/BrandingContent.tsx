'use client'

import { useState, useRef } from 'react'
import { UploadCloud, Gift, Sparkles, Package } from 'lucide-react'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import SuccessModal from '@/components/Profile/SuccessModal'
import PackagingGallery from '@/components/Branding/PackagingMockups'
import { useBranding } from '@/context/BrandingContext'
import { useAuth } from '@/context/AuthContext'

const SWATCHES = ['#1A1ABC', '#099137', '#CB1A14', '#DD900D', '#1671D9', '#121212']

const WRAPPERS = [
  { id: 'classic', label: 'Classic Ribbon', preview: 'linear-gradient(135deg, #1A1ABC 0%, #4848C9 100%)' },
  { id: 'confetti', label: 'Confetti Burst', preview: 'linear-gradient(135deg, #DD900D 0%, #F4CC90 100%)' },
  { id: 'minimal', label: 'Minimal Frame', preview: 'linear-gradient(135deg, #121212 0%, #4a4746 100%)' },
  { id: 'floral', label: 'Floral Wrap', preview: 'linear-gradient(135deg, #099137 0%, #8ecc9a 100%)' },
]

export default function BrandingContent() {
  const { company } = useAuth()
  const { branding, updateBranding, isSaving, saveError } = useBranding()
  const [showSuccess, setShowSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [customHex, setCustomHex] = useState(branding.brandColor)

  const previewName = 'Adaeze'
  const personalizedMessage = branding.messageTemplate.replace(/{{\s*employeeName\s*}}/gi, previewName)

  const handleLogoChange = (file: File) => {
    updateBranding({ logo: URL.createObjectURL(file) })
  }

  const handleSave = () => {
    if (!saveError) setShowSuccess(true)
  }

  return (
    <div className='flex flex-col'>
      <DashboardHeader title='Branded Gifting' />
      <div className='p-6 lg:p-8'>
        <p className='mb-6 max-w-2xl text-xs text-grey-500'>
          When a recipient opens a gift notification or claim page from {company?.companyName || 'your company'}, they&apos;ll see your branding — not generic Giftseon branding.
        </p>
        {saveError && (
          <div className='mb-6 max-w-2xl rounded-lg border border-error-200 bg-error-50 px-3.5 py-2.5 text-sm text-error-600'>
            {saveError}
          </div>
        )}

        <div className='grid grid-cols-1 gap-6 xl:grid-cols-5'>
          {/* Controls */}
          <div className='space-y-6 xl:col-span-3'>
            <div className='rounded-xl border border-grey-100 bg-white p-5'>
              <p className='text-sm font-semibold text-blackish'>Company Logo</p>
              <div className='mt-3 flex items-center gap-4'>
                <div className='flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-grey-200 bg-grey-50'>
                  {branding.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={branding.logo} alt='Company logo' className='h-full w-full object-cover' />
                  ) : (
                    <UploadCloud className='h-6 w-6 text-grey-300' />
                  )}
                </div>
                <button onClick={() => fileRef.current?.click()} className='rounded-lg border border-grey-200 px-4 py-2 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'>
                  Upload logo
                </button>
                <input ref={fileRef} type='file' accept='image/*' className='hidden' onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleLogoChange(file)
                }} />
              </div>
            </div>

            <div className='rounded-xl border border-grey-100 bg-white p-5'>
              <p className='text-sm font-semibold text-blackish'>Brand Color</p>
              <div className='mt-3 flex flex-wrap items-center gap-2'>
                {SWATCHES.map((color) => (
                  <button
                    key={color}
                    onClick={() => { updateBranding({ brandColor: color }); setCustomHex(color) }}
                    className={`h-8 w-8 rounded-full border-2 transition-transform ${branding.brandColor === color ? 'border-blackish scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    aria-label={color}
                  />
                ))}
                <div className='flex items-center gap-2'>
                  <input
                    type='color'
                    value={customHex}
                    onChange={(e) => { setCustomHex(e.target.value); updateBranding({ brandColor: e.target.value }) }}
                    className='h-8 w-10 cursor-pointer rounded border border-grey-200'
                  />
                  <span className='text-xs text-grey-500'>{branding.brandColor.toUpperCase()}</span>
                </div>
              </div>
              <p className='mt-2 text-xs text-grey-400'>Applied to the claim page header and CTA buttons.</p>
            </div>

            <div className='rounded-xl border border-grey-100 bg-white p-5'>
              <p className='text-sm font-semibold text-blackish'>Company Message</p>
              <textarea
                value={branding.messageTemplate}
                onChange={(e) => updateBranding({ messageTemplate: e.target.value })}
                className='form-input mt-3 min-h-[100px] resize-none'
              />
              <button
                type='button'
                onClick={() => updateBranding({ messageTemplate: `${branding.messageTemplate}${branding.messageTemplate.endsWith(' ') || !branding.messageTemplate ? '' : ' '}{{employeeName}}` })}
                className='mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-600'
              >
                <Sparkles className='h-3.5 w-3.5' /> Insert employee name token
              </button>
            </div>

            <div className='rounded-xl border border-grey-100 bg-white p-5'>
              <p className='text-sm font-semibold text-blackish'>Gift Packaging Style</p>
              <div className='mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4'>
                {WRAPPERS.map((wrapper) => (
                  <button
                    key={wrapper.id}
                    onClick={() => updateBranding({ wrapperStyle: wrapper.id })}
                    className={`overflow-hidden rounded-xl border-2 transition-colors ${branding.wrapperStyle === wrapper.id ? 'border-primary-400' : 'border-grey-100 hover:border-grey-200'}`}
                  >
                    <div className='h-16 w-full' style={{ background: wrapper.preview }} />
                    <p className='px-2 py-2 text-center text-xs font-medium text-blackish'>{wrapper.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className='rounded-xl border border-grey-100 bg-white p-5'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Package className='h-4 w-4 text-primary-500' />
                  <p className='text-sm font-semibold text-blackish'>Brand every physical gift</p>
                </div>
                <button
                  onClick={() => updateBranding({ brandAllItems: !branding.brandAllItems })}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${branding.brandAllItems ? 'bg-primary-500' : 'bg-grey-200'}`}
                  aria-label='Toggle brand all items'
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${branding.brandAllItems ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <p className='mt-1 text-xs text-grey-500'>
                {branding.brandAllItems
                  ? 'Every physical item — boxes, bottles, apparel, and books — ships with your logo and brand color applied.'
                  : 'Physical gifts ship in Giftseon\'s standard packaging, unbranded.'}
              </p>
              <div className='mt-4'>
                <PackagingGallery
                  brandColor={branding.brandColor}
                  logo={branding.logo}
                  companyName={company?.companyName || 'Your Company'}
                  dimmed={!branding.brandAllItems}
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className='w-full rounded-xl py-3 text-sm font-medium text-white transition-all disabled:opacity-60 sm:w-auto sm:px-8'
              style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
            >
              {isSaving ? 'Saving...' : 'Save branding'}
            </button>
          </div>

          {/* Live preview */}
          <div className='xl:col-span-2'>
            <div className='sticky top-6 rounded-2xl border border-grey-100 bg-grey-50/40 p-6'>
              <p className='mb-4 text-center text-xs font-medium uppercase tracking-wide text-grey-400'>Live Claim Page Preview</p>
              <div className='mx-auto max-w-[300px] overflow-hidden rounded-[2rem] border-8 border-blackish bg-white shadow-xl'>
                <div className='flex items-center justify-center py-3' style={{ backgroundColor: branding.brandColor }}>
                  {branding.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={branding.logo} alt='Logo' className='h-8 w-8 rounded object-cover' />
                  ) : (
                    <span className='text-sm font-semibold text-white'>{company?.companyName || 'Your Company'}</span>
                  )}
                </div>
                <div className='px-5 py-6 text-center'>
                  <div
                    className='mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl'
                    style={{ background: WRAPPERS.find((w) => w.id === branding.wrapperStyle)?.preview }}
                  >
                    <Gift className='h-10 w-10 text-white' />
                  </div>
                  <p className='text-sm font-semibold text-blackish'>You&apos;ve received a gift!</p>
                  <p className='mt-2 text-xs leading-relaxed text-grey-500'>{personalizedMessage}</p>
                  <button
                    className='mt-5 w-full rounded-xl py-2.5 text-sm font-medium text-white'
                    style={{ backgroundColor: branding.brandColor }}
                  >
                    Claim your gift
                  </button>
                  <p className='mt-3 text-[10px] text-grey-300'>Powered by Giftseon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} message='Your branded gifting settings have been saved.' />
    </div>
  )
}
