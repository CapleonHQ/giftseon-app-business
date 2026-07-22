'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Bot } from 'lucide-react'
import type { ChatMessage } from '@/types/Support'
import { INITIAL_MESSAGES } from '@/lib/mockSupport'

const respond = (input: string): string => {
  const q = input.toLowerCase()
  if (q.includes('budget') || q.includes('allocat')) {
    return "The Budget & Wallet page has a Manual and an Auto-allocate mode. Auto-allocate distributes your budget cap across your enabled gifting types based on employee count and your plan — you can review the suggestion before applying it."
  }
  if (q.includes('employee') && (q.includes('add') || q.includes('upload'))) {
    return 'Add employees individually, upload a CSV/Excel spreadsheet, or enter their Giftseon @tags on the Employees page. New employees without an account get an onboarding link automatically.'
  }
  if (q.includes('send') && q.includes('gift')) {
    return 'From Employees, select one or more people (or a whole department) and click "Send a Gift." You can pick a gift type from your configuration, set a custom one, or choose from the marketplace.'
  }
  if (q.includes('gifting') || q.includes('rule') || q.includes('configur')) {
    return 'Gifting Configuration lets you set up automatic rules for Birthdays, Work Anniversaries, and six other occasions — pick a gift format, a budget, and a message, and it triggers automatically from then on.'
  }
  if (q.includes('brand')) {
    return "Branded Gifting lets you set a logo, brand color, and message that show on gift claim pages. Turn on 'Brand all gifts' to apply it across physical packaging too."
  }
  if (q.includes('interest') || q.includes('privacy')) {
    return "Employee interest selections are private — you can only see whether their profile is complete, not what they picked. Giftseon uses it behind the scenes to recommend better gifts."
  }
  if (q.includes('track') || q.includes('deliver')) {
    return "You can follow physical gift deliveries in real time from the Reports page — look for 'Track in real time' under Physical Gift Delivery Status."
  }
  return "I don't have a specific answer for that yet, but I can connect you with a human — try 'Chat with an Agent' from the Support home."
}

export default function AiChatbotView({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    const userMessage: ChatMessage = { id: Date.now(), from: 'user', text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'bot', text: respond(text) }])
      setIsTyping(false)
    }, 700)
  }

  return (
    <div className='mx-auto flex h-[520px] max-w-2xl flex-col rounded-xl border border-grey-100 bg-white'>
      <div className='flex items-center gap-3 border-b border-grey-100 px-5 py-4'>
        <button onClick={onBack} className='text-grey-400 hover:text-blackish transition-colors'>
          <ArrowLeft className='h-4 w-4' />
        </button>
        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary-50'>
          <Bot className='h-4 w-4 text-primary-500' />
        </div>
        <div>
          <p className='text-sm font-semibold text-blackish'>Giftseon Business Assistant</p>
          <p className='text-xs text-success-500'>Online</p>
        </div>
      </div>

      <div ref={scrollRef} className='flex-1 space-y-3 overflow-y-auto px-5 py-4'>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              m.from === 'user' ? 'bg-primary-500 text-white' : 'bg-grey-100 text-blackish'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className='flex justify-start'>
            <div className='rounded-2xl bg-grey-100 px-4 py-2.5 text-sm text-grey-400'>Typing...</div>
          </div>
        )}
      </div>

      <div className='flex items-center gap-2 border-t border-grey-100 p-4'>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSend())}
          placeholder='Ask something...'
          className='form-input flex-1'
        />
        <button
          onClick={handleSend}
          className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition-all'
          style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
        >
          <Send className='h-4 w-4' />
        </button>
      </div>
    </div>
  )
}
