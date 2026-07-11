'use client'

import GiftseonLogo from './GiftseonLogo'

type SuccessScreenProps = {
  title?: string
  message: string
  buttonLabel: string
  onAction: () => void
}

const SuccessScreen = ({
  title = 'Success!',
  message,
  buttonLabel,
  onAction,
}: SuccessScreenProps) => (
  <div className='flex min-h-screen flex-col'>
    <header className='flex items-center justify-between px-8 py-6 lg:px-12'>
      <GiftseonLogo className='h-8 w-auto' />
    </header>
    <div className='flex flex-1 items-center justify-center px-6'>
      <div className='w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-sm border border-grey-50'>
        <div className='mx-auto mb-4 flex h-40 w-40 items-center justify-center'>
          <img src='/assets/illustrations/success.svg' alt='Success' className='h-full w-auto' />
        </div>
        <h2 className='text-xl font-semibold text-blackish'>{title}</h2>
        <p className='mt-2 text-sm text-grey-600 leading-relaxed'>{message}</p>
        <button
          type='button'
          onClick={onAction}
          className='mt-6 w-full rounded-xl bg-blackish py-3.5 text-sm font-medium text-white hover:bg-blackish/90 transition-colors'
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  </div>
)

export default SuccessScreen
