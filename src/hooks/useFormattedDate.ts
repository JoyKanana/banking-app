import { useState } from 'react'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

/**
 * Returns today's date formatted for the dashboard header.
 */
export function useFormattedDate(): string {
  const [today] = useState(() => dateFormatter.format(new Date()))

  return today
}
