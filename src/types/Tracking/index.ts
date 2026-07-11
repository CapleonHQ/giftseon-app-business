export type DeliveryStatus = 'Processing' | 'Dispatched' | 'In Transit' | 'Out for Delivery' | 'Delivered'

export interface TrackingStep {
  label: string
  timestamp: string
  completed: boolean
}

export interface PhysicalDelivery {
  id: string
  employee: string
  item: string
  status: DeliveryStatus
  courier: string
  trackingRef: string
  eta: string
  steps: TrackingStep[]
}
