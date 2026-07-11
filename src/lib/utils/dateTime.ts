import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const formatDate = (date: string | Date, pattern = 'MMM d, yyyy') => {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return format(parsed, pattern)
}

export const formatDateTime = (date: string | Date) => {
  return formatDate(date, 'MMM d, yyyy h:mm a')
}

export const timeAgo = (date: string | Date) => {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(parsed, { addSuffix: true })
}
