import { describe, expect, it } from 'vitest'
import { countryAvailability, initialServices } from '../account/data'
import type { CountryAvailability, ServiceState } from '../account/types'
import { getServiceEntitlement, isServiceAllowed } from './entitlements'

const kenya = countryAvailability.find((item) => item.country === 'Kenya')

function serviceWith(
  serviceId: ServiceState['id'],
  patch: Partial<ServiceState> = {},
): ServiceState[] {
  return initialServices.map((service) =>
    service.id === serviceId ? { ...service, ...patch } : service,
  )
}

function countryWith(
  country: string,
  patch: Partial<CountryAvailability> = {},
): CountryAvailability {
  const base = countryAvailability.find((item) => item.country === country)

  if (!base) {
    throw new Error(`Missing test country: ${country}`)
  }

  return { ...base, ...patch }
}

describe('getServiceEntitlement', () => {
  it('allows an enabled service in an active country', () => {
    const decision = getServiceEntitlement({
      serviceId: 'personal',
      services: initialServices,
      country: kenya,
      ageVerified: false,
    })

    expect(decision).toEqual({ allowed: true, reason: 'allowed' })
  })

  it('blocks a disabled service', () => {
    const decision = getServiceEntitlement({
      serviceId: 'professional',
      services: initialServices,
      country: countryWith('Kenya', { professional: true }),
      ageVerified: true,
      providerApproved: true,
    })

    expect(decision.reason).toBe('service_disabled')
  })

  it('blocks services in countries without financial activation', () => {
    const uganda = countryAvailability.find((item) => item.country === 'Uganda')

    const decision = getServiceEntitlement({
      serviceId: 'personal',
      services: initialServices,
      country: uganda,
      ageVerified: false,
    })

    expect(decision.reason).toBe('country_unavailable')
  })

  it('requires age verification for restricted services', () => {
    const decision = getServiceEntitlement({
      serviceId: 'professional',
      services: serviceWith('professional', { enabled: true }),
      country: countryWith('Kenya', { professional: true }),
      ageVerified: false,
      providerApproved: true,
    })

    expect(decision.reason).toBe('age_verification_required')
  })

  it('requires provider approval for restricted services', () => {
    const decision = getServiceEntitlement({
      serviceId: 'professional',
      services: serviceWith('professional', { enabled: true }),
      country: countryWith('Kenya', { professional: true }),
      ageVerified: true,
      providerApproved: false,
    })

    expect(decision.reason).toBe('provider_approval_required')
  })

  it('allows a fully approved restricted service', () => {
    const decision = getServiceEntitlement({
      serviceId: 'professional',
      services: serviceWith('professional', { enabled: true }),
      country: countryWith('Kenya', { professional: true }),
      ageVerified: true,
      providerApproved: true,
    })

    expect(decision).toEqual({ allowed: true, reason: 'allowed' })
  })

  it('maps commerce availability to the business country flag', () => {
    const decision = getServiceEntitlement({
      serviceId: 'commerce',
      services: initialServices,
      country: countryWith('Kenya', { business: false }),
      ageVerified: false,
    })

    expect(decision.reason).toBe('country_unavailable')
  })

  it('returns false for missing services', () => {
    expect(
      isServiceAllowed({
        serviceId: 'personal',
        services: [],
        country: kenya,
        ageVerified: false,
      }),
    ).toBe(false)
  })
})
