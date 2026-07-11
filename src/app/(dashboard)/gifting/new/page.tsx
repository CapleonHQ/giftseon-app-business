import { Suspense } from 'react'
import GiftingSetupFlow from '@/components/Gifting/GiftingSetupFlow'

export default function NewGiftingRulePage() {
  return (
    <Suspense fallback={null}>
      <GiftingSetupFlow />
    </Suspense>
  )
}
