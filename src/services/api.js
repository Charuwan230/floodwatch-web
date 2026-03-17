// src/services/api.js
const BASE = 'https://floodwatch-backend-production.up.railway.app/api'

export async function getAllDistricts() {
  try {
    const res  = await fetch(`${BASE}/flood`)
    const json = await res.json()
    return json.data || []
  } catch (e) {
    console.error('[API]', e)
    return []
  }
}

export async function simulateFlood(districtId, status) {
  try {
    const res = await fetch(`${BASE}/alerts/simulate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ districtId, status }),
    })
    return res.ok
  } catch (e) {
    return false
  }
}