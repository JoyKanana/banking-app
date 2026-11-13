import type { CountryAvailability, ServiceState } from '../account/types'
import type { ServiceId } from '../money/types'

export type EntitlementReason =
  | 'allowed'
  | 'service_not_found'
  | 'service_disabled'
  | 'country_unavailable'
  | 'age_verification_required'
  | 'provider_approval_required'
  | 'service_unavailable'

export type EntitlementDecision = {
  allowed: boolean
  reason: EntitlementReason
}

const countryFeatureByService: Record<ServiceId, keyof CountryAvailability> = {
  personal: 'personalMoney',
  creator: 'creator',
  business: 'business',
  commerce: 'business',
  professional: 'professional',
}

export function getServiceEntitlement(input: {
  serviceId: ServiceId
  services: ServiceState[]
  country: CountryAvailability | undefined
  ageVerified: boolean
  providerApproved?: boolean
}): EntitlementDecision {
  const service = input.services.find((item) => item.id === input.serviceId)

  if (!service) {
    return { allowed: false, reason: 'service_not_found' }
  }

  if (service.eligibility === 'unavailable') {
    return { allowed: false, reason: 'service_unavailable' }
  }

  if (!input.country || !input.country.registration) {
    return { allowed: false, reason: 'country_unavailable' }
  }

  if (!input.country[countryFeatureByService[service.id]]) {
    return { allowed: false, reason: 'country_unavailable' }
  }

  if (!service.enabled) {
    return { allowed: false, reason: 'service_disabled' }
  }

  if (service.requiresAgeVerification && !input.ageVerified) {
    return { allowed: false, reason: 'age_verification_required' }
  }

  if (service.requiresProviderApproval && !input.providerApproved) {
    return { allowed: false, reason: 'provider_approval_required' }
  }

  return { allowed: true, reason: 'allowed' }
}

export function isServiceAllowed(input: {
  serviceId: ServiceId
  services: ServiceState[]
  country: CountryAvailability | undefined
  ageVerified: boolean
  providerApproved?: boolean
}): boolean {
  return getServiceEntitlement(input).allowed
}
