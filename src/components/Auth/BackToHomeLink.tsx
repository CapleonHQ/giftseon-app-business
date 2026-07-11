import Link from 'next/link'
import { Home } from 'lucide-react'

const BackToHomeLink = () => (
  <Link
    href='/'
    className='flex items-center gap-1.5 text-sm text-grey-500 hover:text-grey-700 transition-colors'
  >
    <Home className='h-4 w-4' />
    Back to Home
  </Link>
)

export default BackToHomeLink
