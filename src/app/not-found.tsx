import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4'>
      <h1 className='text-4xl font-bold text-blackish'>404</h1>
      <p className='text-grey-600'>Page not found</p>
      <Link
        href='/dashboard'
        className='rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors'
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
