const BASE = 'https://floodwatch-backend-production.up.railway.app/api'

export async function sendLineBot(userId, districtName, status) {
  const emoji    = status === 'flood' ? '🚨' : status === 'risk' ? '⚠️' : '✅'
  const statusTH = status === 'flood' ? 'น้ำท่วมวิกฤต'
                 : status === 'risk'  ? 'เฝ้าระวัง'
                 : 'กลับสู่ภาวะปกติ'
  const message = `${emoji} แจ้งเตือน: ${districtName}\nสถานะ: ${statusTH}\nเวลา: ${new Date().toLocaleString('th-TH')}`
  try {
    const res = await fetch(`${BASE}/alerts/line-bot`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId, message }),
    })
    return res.ok
  } catch (e) {
    return false
  }
}