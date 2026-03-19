const BASE = 'https://floodwatch-final-production.up.railway.app/api'

export async function getAllDistricts() {
  try {
    const res  = await fetch(`${BASE}/flood`)
    const json = await res.json()
    return Array.isArray(json) ? json : (json.data || [])
  } catch (e) {
    console.error('[API ERROR]', e)
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