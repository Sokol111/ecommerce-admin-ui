import { UTCDate } from '@date-fns/utc'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

export interface FormattedDate {
  date: string
  time: string
}

export function formatDate(dateStr: string): FormattedDate {
  const date = new UTCDate(dateStr)
  return {
    date: format(date, 'MMM d, yyyy'),
    time: format(date, 'h:mm a')
  }
}

export function formatDateTime(dateStr: string): string {
  return format(new UTCDate(dateStr), 'MMM d, yyyy, h:mm a')
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
}
