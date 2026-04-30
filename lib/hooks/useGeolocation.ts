'use client'
import { useEffect, useState } from 'react'

export type GeoStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'out_of_range'
  | 'in_range'

interface SalonLocation {
  lat: number
  lng: number
  radiusKm: number
  name: string
}

interface GeolocationState {
  status: GeoStatus
  distanceKm: number | null
  salonName: string
  errorMsg: string | null
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function useGeolocation() {
  // Always start idle on SSR — real check happens in effect (client-only)
  const [state, setState] = useState<GeolocationState>({
    status: 'idle',
    distanceKm: null,
    salonName: 'el local',
    errorMsg: null,
  })

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      queueMicrotask(() => setState((s) => ({
        ...s,
        status: 'unavailable',
        errorMsg: 'Tu navegador no soporta geolocalización.',
      })))
      return
    }

    queueMicrotask(() => setState((s) => ({ ...s, status: 'requesting' })))

    fetch('/api/salon-location')
      .then((r) => r.json())
      .then((salon: SalonLocation) => {
        setState((s) => ({ ...s, salonName: salon.name }))
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const dist = haversineKm(
              pos.coords.latitude,
              pos.coords.longitude,
              salon.lat,
              salon.lng
            )
            const inRange = dist <= salon.radiusKm
            setState({
              status: inRange ? 'in_range' : 'out_of_range',
              distanceKm: Math.round(dist * 10) / 10,
              salonName: salon.name,
              errorMsg: inRange
                ? null
                : `Estás a ${Math.round(dist * 10) / 10} km del local. El servicio está disponible en un radio de ${salon.radiusKm} km de ${salon.name}.`,
            })
          },
          (err) => {
            setState((s) => ({
              ...s,
              status: 'denied',
              errorMsg:
                err.code === 1
                  ? 'Debes permitir el acceso a tu ubicación para agendar una cita.'
                  : 'No se pudo obtener tu ubicación. Intenta de nuevo.',
            }))
          },
          { timeout: 10000, maximumAge: 60000 }
        )
      })
      .catch(() => {
        setState((s) => ({
          ...s,
          status: 'unavailable',
          errorMsg: 'No se pudo verificar la ubicación del local.',
        }))
      })
  }, [])

  return state
}
