import type { ServiceId } from '@/domain/money/types'

export type NavigationItem = {
  label: string
  path: string
  description: string
  services?: ServiceId[]
}
