import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

function resolveInitialValue<T>(initialValue: T | (() => T)): T {
  return typeof initialValue === 'function'
    ? (initialValue as () => T)()
    : initialValue
}

export function usePersistentState<T>(
  key: string,
  initialValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const fallback = resolveInitialValue(initialValue)

    if (typeof window === 'undefined') return fallback

    try {
      const stored = window.localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : fallback
    } catch {
      return fallback
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Persistence is best-effort for the demo; storage can be unavailable.
    }
  }, [key, value])

  return [value, setValue]
}
