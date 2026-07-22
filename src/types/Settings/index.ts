export interface NotificationSetting {
  label: string
  email: boolean
  inApp: boolean
  sms: boolean
}

export interface NotificationCategory {
  title: string
  items: NotificationSetting[]
}
