'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const CACHE_KEY = 'payment_status'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCached(): boolean | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { isPaid, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(CACHE_KEY); return null }
    return isPaid
  } catch { return null }
}

function setCache(isPaid: boolean) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ isPaid, ts: Date.now() })) } catch {}
}

export function usePaymentGuard() {
  const router = useRouter()
  const cached = getCached()
  const [checked, setChecked] = useState(cached === true)

  useEffect(() => {
    if (cached === true) return // already good, skip fetch
    fetch('/api/payments/status')
      .then(r => r.json())
      .then(data => {
        setCache(data.isPaid)
        if (!data.isPaid) {
          router.replace('/app/payment')
        } else {
          setChecked(true)
        }
      })
      .catch(() => router.replace('/app/payment'))
  }, []) // eslint-disable-line

  return { checked }
}

// Call this after payment approval to bust the cache
export function clearPaymentCache() {
  try { sessionStorage.removeItem(CACHE_KEY) } catch {}
}
