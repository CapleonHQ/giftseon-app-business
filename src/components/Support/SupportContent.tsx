'use client'

import { useState } from 'react'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import SupportHome from '@/components/Support/SupportHome'
import SelfServiceView from '@/components/Support/SelfServiceView'
import AiChatbotView from '@/components/Support/AiChatbotView'
import ChatAgentView from '@/components/Support/ChatAgentView'

type SupportView = 'home' | 'self-service' | 'ai-chatbot' | 'chat-agent'

export default function SupportContent() {
  const [view, setView] = useState<SupportView>('home')

  return (
    <div className='flex flex-col'>
      <DashboardHeader title='Support' />
      <div className='p-6 lg:p-8'>
        {view === 'home' && (
          <SupportHome onNavigate={(v) => setView(v as SupportView)} />
        )}
        {view === 'self-service' && (
          <SelfServiceView onBack={() => setView('home')} />
        )}
        {view === 'ai-chatbot' && (
          <AiChatbotView onBack={() => setView('home')} />
        )}
        {view === 'chat-agent' && (
          <ChatAgentView onBack={() => setView('home')} />
        )}
      </div>
    </div>
  )
}
