'use client'

interface SupportHomeProps {
  onNavigate: (view: string) => void
}

const SUPPORT_OPTIONS = [
  {
    key: 'self-service',
    title: 'Self-service',
    description: 'Find answers about employees, gifting configuration, budget, and branding without waiting.',
    icon: (
      <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
        <path d='M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z' stroke='var(--primary-500)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    ),
  },
  {
    key: 'ai-chatbot',
    title: 'AI Chatbot',
    description: 'Ask questions about your account and get quick answers, powered by smart assistance.',
    icon: (
      <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
        <path d='M12 3C7.03 3 3 6.58 3 11C3 13.12 4.04 15.03 5.67 16.39L4.5 20.5L9.12 18.76C10.04 18.92 11.01 19 12 19C16.97 19 21 15.42 21 11C21 6.58 16.97 3 12 3Z' stroke='var(--primary-500)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
        <path d='M8 11H8.01M12 11H12.01M16 11H16.01' stroke='var(--primary-500)' strokeWidth='2' strokeLinecap='round' />
      </svg>
    ),
  },
  {
    key: 'chat-agent',
    title: 'Chat with an Agent',
    description: 'Submit your issue with details, and our team will step in to help you resolve it.',
    icon: (
      <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
        <path d='M17 18C17.5523 18 18 17.5523 18 17C18 16.4477 17.5523 16 17 16C16.4477 16 16 16.4477 16 17C16 17.5523 16.4477 18 17 18Z' stroke='var(--primary-500)' strokeWidth='1.5' />
        <path d='M7 18C7.55228 18 8 17.5523 8 17C8 16.4477 7.55228 16 7 16C6.44772 16 6 16.4477 6 17C6 17.5523 6.44772 18 7 18Z' stroke='var(--primary-500)' strokeWidth='1.5' />
        <path d='M12 14V11M12 11C13.6569 11 15 9.65685 15 8V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V8C9 9.65685 10.3431 11 12 11Z' stroke='var(--primary-500)' strokeWidth='1.5' strokeLinecap='round' />
        <path d='M5 14H19C20.1046 14 21 14.8954 21 16V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V16C3 14.8954 3.89543 14 5 14Z' stroke='var(--primary-500)' strokeWidth='1.5' />
      </svg>
    ),
  },
]

export default function SupportHome({ onNavigate }: SupportHomeProps) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      {SUPPORT_OPTIONS.map((option) => (
        <button
          key={option.key}
          onClick={() => onNavigate(option.key)}
          className='flex flex-col items-start rounded-xl border border-grey-100 bg-white p-5 text-left transition-all hover:border-primary-200 hover:shadow-sm'
        >
          <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50'>
            {option.icon}
          </div>
          <h3 className='text-sm font-semibold text-blackish'>{option.title}</h3>
          <p className='mt-1 text-xs text-grey-400 leading-relaxed'>{option.description}</p>
        </button>
      ))}
    </div>
  )
}
