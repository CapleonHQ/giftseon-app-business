import { request } from './client'
import type { PhysicalDelivery, DeliveryStatus, TrackingStep } from '@/types/Tracking'

interface BackendTrackingStep {
  label: string
  timestamp: string | null
  completed: boolean
}

interface BackendDelivery {
  id: string
  employee: string
  item: string
  status: DeliveryStatus
  courier: string | null
  trackingRef: string | null
  eta: string | null
  steps: BackendTrackingStep[]
}

const toStep = (step: BackendTrackingStep): TrackingStep => ({
  label: step.label,
  timestamp: step.timestamp ?? '',
  completed: step.completed,
})

const toDelivery = (d: BackendDelivery): PhysicalDelivery => ({
  id: d.id,
  employee: d.employee,
  item: d.item,
  status: d.status,
  courier: d.courier ?? 'Not yet assigned',
  trackingRef: d.trackingRef ?? '',
  eta: d.eta ?? '',
  steps: d.steps.map(toStep),
})

export const getDeliveries = async (): Promise<PhysicalDelivery[]> => {
  const result = await request<BackendDelivery[]>({ method: 'GET', url: '/deliveries' })
  return result.map(toDelivery)
}
