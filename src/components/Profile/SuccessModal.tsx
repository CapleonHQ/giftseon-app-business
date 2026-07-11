'use client'

interface SuccessModalProps {
  open: boolean
  onClose: () => void
  message: string
}

export default function SuccessModal({ open, onClose, message }: SuccessModalProps) {
  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='relative w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-xl'>
        <button
          onClick={onClose}
          className='absolute right-4 top-4 text-grey-400 hover:text-blackish'
        >
          <svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
            <path d='M15 5L5 15M5 5L15 15' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
          </svg>
        </button>

        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center'>
          <svg width='64' height='64' viewBox='0 0 110 110' fill='none'>
            <circle cx='55' cy='55' r='26' fill='#3AA75F' opacity='0.4' />
            <circle cx='55' cy='55' r='21' fill='#3AA75F' />
            <path d='M45 56L51 62L64 49' stroke='white' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </div>

        <h3 className='text-lg font-semibold text-blackish'>Success!</h3>
        <p className='mt-2 text-sm text-grey-400'>{message}</p>

        <button
          onClick={onClose}
          className='mt-6 w-full rounded-lg py-2.5 text-sm font-medium text-white transition-all'
          style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
