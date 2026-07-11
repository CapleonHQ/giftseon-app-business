'use client'

import { useState } from 'react'
import { ArrowLeft, Search, Plus, Minus } from 'lucide-react'

interface SelfServiceViewProps {
  onBack: () => void
}

interface FaqItem {
  question: string
  answer: string
}

interface FaqCategory {
  title: string
  items: FaqItem[]
}

const FAQ_DATA: FaqCategory[] = [
  {
    title: 'EMPLOYEES',
    items: [
      {
        question: 'How do I add employees to Giftseon?',
        answer: 'From the Employees page, add them individually, upload a spreadsheet (CSV/Excel), or enter their Giftseon @tags directly. Employees without an account receive an onboarding link to set up their profile and delivery address.',
      },
      {
        question: 'Can I see what my employees are interested in?',
        answer: "No — an employee's specific interest selections are private to them. You can only see whether their profile is complete. Giftseon uses their interests behind the scenes to personalize gift recommendations.",
      },
      {
        question: 'How do I send a gift to a group or department?',
        answer: 'From the Employees page, select employees with the checkboxes (or use "Send a Gift" and switch to "By Department") and choose a gift type from your configuration, a custom gift, or something from the marketplace.',
      },
      {
        question: 'What happens when I remove an employee?',
        answer: "They're taken off your gifting list and excluded from future automated rules. Past gift history isn't affected.",
      },
    ],
  },
  {
    title: 'GIFTING & BUDGET',
    items: [
      {
        question: 'What is a gifting rule?',
        answer: 'A gifting rule automates a gift for an occasion — Birthday, Work Anniversary, Welcome, and more — with a trigger, gift format, and budget you configure once. It fires automatically from then on.',
      },
      {
        question: 'What does auto-allocate do on the Budget page?',
        answer: 'It distributes your total budget cap across your enabled gifting types based on how many employees you have and your plan, suggesting a sensible per-gift amount for each. You can review it before applying, or configure limits manually instead.',
      },
      {
        question: "What happens if my budget isn't enough?",
        answer: "You'll see an insufficient-budget warning showing the exact shortfall, with an option to scale the suggested amounts down to fit, or top up your wallet first.",
      },
      {
        question: 'Where does company wallet money come from?',
        answer: 'Top up via bank transfer to your dedicated company virtual account, shown on the Budget & Wallet page. This wallet is separate from any individual employee wallets.',
      },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      {
        question: 'How do I update my company information?',
        answer: 'Go to Settings > Company Information and click Edit. You can update your company name, industry, admin contact, and business details.',
      },
      {
        question: 'How do I change my account password?',
        answer: 'Navigate to Settings > Security. Enter your current password and your new password, then save.',
      },
    ],
  },
]

export default function SelfServiceView({ onBack }: SelfServiceViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleItem = (key: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const filteredData = FAQ_DATA.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.items.length > 0)

  return (
    <div className='mx-auto max-w-3xl'>
      <button
        onClick={onBack}
        className='mb-4 flex items-center gap-2 text-sm font-medium text-grey-600 hover:text-blackish transition-colors'
      >
        <ArrowLeft className='h-4 w-4' />
        Self-service
      </button>

      <div className='rounded-xl border border-grey-100 bg-white'>
        <div className='border-b border-grey-100 px-6 pt-4'>
          <button className='relative px-4 py-3 text-sm font-medium text-primary-500'>
            FAQs
            <span className='absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary-500' />
          </button>
        </div>

        <div className='p-6'>
          <div className='mb-6 text-center'>
            <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center'>
              <svg width='40' height='40' viewBox='0 0 40 40' fill='none'>
                <circle cx='20' cy='20' r='18' stroke='var(--primary-200)' strokeWidth='1.5' />
                <text x='20' y='25' textAnchor='middle' fill='var(--primary-500)' fontSize='18' fontWeight='600'>?</text>
              </svg>
            </div>
            <p className='text-sm text-grey-500'>
              Find answers about employees, gifting configuration, budget, and your account.
            </p>
          </div>

          <div className='mb-6 flex items-center gap-2 rounded-lg border border-grey-200 bg-grey-50/50 px-3 py-2.5'>
            <Search className='h-4 w-4 text-grey-400' />
            <input
              type='text'
              placeholder='Search'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full bg-transparent text-sm text-blackish outline-none placeholder:text-grey-400'
            />
          </div>

          <div className='space-y-6'>
            {filteredData.map((category) => (
              <div key={category.title}>
                <p className='mb-3 text-xs font-semibold tracking-wide text-grey-500'>
                  {category.title}
                </p>
                <div className='space-y-1'>
                  {category.items.map((item) => {
                    const key = `${category.title}-${item.question}`
                    const isExpanded = expandedItems.has(key)
                    return (
                      <div key={key} className='border-b border-grey-50'>
                        <button
                          onClick={() => toggleItem(key)}
                          className='flex w-full items-center justify-between py-3 text-left'
                        >
                          <span className='text-sm text-blackish pr-4'>{item.question}</span>
                          {isExpanded ? (
                            <Minus className='h-4 w-4 shrink-0 text-grey-400' />
                          ) : (
                            <Plus className='h-4 w-4 shrink-0 text-grey-400' />
                          )}
                        </button>
                        {isExpanded && (
                          <div className='pb-3 pr-8'>
                            <p className='text-sm text-grey-500 leading-relaxed'>{item.answer}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {filteredData.length === 0 && (
              <p className='py-8 text-center text-sm text-grey-400'>
                No results found for &quot;{searchQuery}&quot;
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
