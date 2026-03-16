import { useState, useEffect } from 'react'
import { simulateFlood } from '../services/api'
import { sendLineBot } from '../services/lineNotify'

const DISTRICTS = [
  {id:'mueang',name:'เมืองชลบุรี'},{id:'banbueng',name:'บ้านบึง'},
  {id:'nongya',name:'หนองใหญ่'},{id:'banglamung',name:'บางละมุง'},
  {id:'phantong',name:'พานทอง'},{id:'phanasnikom',name:'พนัสนิคม'},
  {id:'sriracha',name:'ศรีราชา'},{id:'kosichang',name:'เกาะสีชัง'},
  {id:'sattahip',name:'สัตหีบ'},{id:'borthong',name:'บ่อทอง'},
  {id:'kochan',name:'เกาะจันทร์'},
]

const inputStyle = {
  width:'100%', background:'#0A1020',
  border:'1px solid var(--border)', borderRadius:10,
  padding:'10px 14px', color:'var(--text-primary)',
  fontSize:14, outline:'none', fontFamily:'Sarabun',
}

const Card = ({title, children}) => (
  <div style={{ background:'var(--panel)', border:'1px solid var(--border)',
    borderRadius:16, padding:24, marginBottom:16 }}>
    <div style={{ color:'var(--accent)', fontSize:13, fontFamily:'Rajdhani',
      fontWeight:700, letterSpacing:1, marginBottom:16 }}>{title}</div>
    {children}
  </div>
)

const Toggle = ({value, onChange, label, desc}) => (
  <div style={{ display:'flex', justifyContent:'space-between',
    alignItems:'center', padding:'10px 0' }}>
    <div>
      <div style={{ fontSize:14, fontWeight:600 }}>{label}</div>
      <div style={{ fontSize:12, color:'var(--text-muted)' }}>{desc}</div>
    </div>
    <div onClick={()=>onChange(!value)} style={{
      width:48, height:26, borderRadius:13, cursor:'pointer',
      background: value ? 'var(--accent)' : 'var(--border)',
      position:'relative', transition:'background 0.2s', flexShrink:0,
    }}>
      <div style={{
        position:'absolute', top:3,
        left: value ? 25 : 3, width:20, height:20,
        borderRadius:10, background:'white', transition:'left 0.2s',
      }}/>
    </div>
  </div>
)

export default function ProfilePage() {
  const [districtId,   setDistrictId]   = useState('')
  const [subdistrict,  setSubdistrict]  = useState('')
  const [village,      setVillage]      = useState('')
  const [houseDetail,  setHouseDetail]  = useState('')
  const [lineUserId,   setLineUserId]   = useState('')
  const [notifyFlood,  setNotifyFlood]  = useState(true)
  const [notifyRisk,   setNotifyRisk]   = useState(true)
  const [notifySafe,   setNotifySafe]   = useState(false)
  const [testDistrict, setTestDistrict] = useState('')
  const [saving,       setSaving]       = useState(false)
  const [testing,      setTesting]      = useState(false)
  const [msg,          setMsg]          = useState(null)

  useEffect(() => {
    setDistrictId(  localStorage.getItem('districtId')  || '')
    setSubdistrict( localStorage.getItem('subdistrict') || '')
    setVillage(     localStorage.getItem('village')     || '')
    setHouseDetail( localStorage.getItem('houseDetail') || '')
    setLineUserId(  localStorage.getItem('lineUserId')  || '')
    setNotifyFlood( localStorage.getItem('notifyFlood') !== 'false')
    setNotifyRisk(  localStorage.getItem('notifyRisk')  !== 'false')
    setNotifySafe(  localStorage.getItem('notifySafe')  === 'true')
  }, [])

  const showMsg = (text) => {
    setMsg(text)
    setTimeout(() => setMsg(null), 4000)
  }

const save = async () => {
    if (!districtId) return showMsg('⚠️ กรุณาเลือกอำเภอก่อนครับ')
    setSaving(true)

    // บันทึก localStorage
    localStorage.setItem('districtId',  districtId)
    localStorage.setItem('subdistrict', subdistrict)
    localStorage.setItem('village',     village)
    localStorage.setItem('houseDetail', houseDetail)
    localStorage.setItem('lineUserId',  lineUserId)
    localStorage.setItem('notifyFlood', notifyFlood)
    localStorage.setItem('notifyRisk',  notifyRisk)
    localStorage.setItem('notifySafe',  notifySafe)

    // บันทึก Line User ID ไป Backend ด้วย
    if (lineUserId) {
      try {
        await fetch('/api/user/line-userid', {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ lineUserId }),
        })
      } catch (e) {
        console.error('[Save]', e)
      }
    }

    setSaving(false)
    showMsg('✅ บันทึกสำเร็จ!')
  }

  const handleTest = async (status) => {
    if (!testDistrict) return showMsg('⚠️ เลือกอำเภอที่จะจำลองก่อนครับ')
    if (!lineUserId)   return showMsg('⚠️ ใส่ Line User ID ก่อนครับ')
    setTesting(true)
    const name = DISTRICTS.find(d => d.id === testDistrict)?.name || testDistrict
    await simulateFlood(testDistrict, status)
    const ok = await sendLineBot(lineUserId, name, status)
    setTesting(false)
    showMsg(ok
      ? '✅ ส่ง Line Bot สำเร็จ! เช็คไลน์ได้เลยครับ 💚'
      : '❌ ส่งไม่สำเร็จ ตรวจสอบ User ID อีกครั้ง')
  }

  const isSuccess = msg?.startsWith('✅')
  const isWarn    = msg?.startsWith('⚠️')

  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:24 }}>
      <h2 style={{ fontFamily:'Rajdhani', color:'var(--accent)',
        fontSize:22, marginBottom:20, letterSpacing:1 }}>⚙️ ตั้งค่า</h2>

      {/* Toast */}
      {msg && (
        <div style={{
          background: isSuccess ? '#22C55E20' : isWarn ? '#F9731620' : '#EF444420',
          border: `1px solid ${isSuccess?'#22C55E60':isWarn?'#F9731660':'#EF444460'}`,
          borderRadius:10, padding:'12px 16px',
          marginBottom:16, fontSize:14,
        }}>{msg}</div>
      )}

      {/* ที่อยู่ */}
      <Card title="🏠 ที่อยู่อาศัย">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <select value={districtId} onChange={e=>setDistrictId(e.target.value)}
            style={{ ...inputStyle, cursor:'pointer' }}>
            <option value="">เลือกอำเภอที่คุณอาศัยอยู่ *</option>
            {DISTRICTS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <input value={subdistrict} onChange={e=>setSubdistrict(e.target.value)}
            placeholder="ตำบล / แขวง *" style={inputStyle}/>
          <input value={village} onChange={e=>setVillage(e.target.value)}
            placeholder="หมู่บ้าน / ซอย / ถนน" style={inputStyle}/>
          <input value={houseDetail} onChange={e=>setHouseDetail(e.target.value)}
            placeholder="บ้านเลขที่ / อาคาร" style={inputStyle}/>
        </div>
      </Card>

      {/* Line Bot */}
      <Card title="Line Bot แจ้งเตือน">
        <p style={{ color:'var(--text-muted)', fontSize:12, marginBottom:16 }}>
          สแกน QR Code แล้วพิมพ์ข้อความใดก็ได้ใน Line — ระบบจะส่ง User ID ให้อัตโนมัติ
        </p>

        {/* QR Code */}
        <div style={{ display:'flex', gap:16, alignItems:'flex-start',
          marginBottom:16, padding:16, background:'rgba(0,212,255,0.05)',
          border:'1px solid rgba(0,212,255,0.15)', borderRadius:12 }}>
          <div style={{ flexShrink:0, textAlign:'center' }}>
            <img
              src="https://qr-official.line.me/sid/L/741gdkza.png"
              alt="Line Bot QR Code"
              style={{ width:120, height:120, borderRadius:12,
                background:'white', padding:4 }}
            />
            <div style={{ color:'var(--text-muted)', fontSize:11, marginTop:6 }}>
              สแกนเพื่อเพิ่มเพื่อน
            </div>
          </div>
          <div style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:2 }}>
            <div style={{ color:'var(--accent)', fontWeight:700,
              marginBottom:6, fontSize:13 }}>วิธีใช้งาน </div>
            <div>1. สแกน QR Code ด้านซ้าย</div>
            <div>2. กด <b style={{color:'var(--safe)'}}>เพิ่มเพื่อน</b></div>
            <div>3. Bot จะส่ง <b>User ID</b> มาให้ทันที</div>
            <div>4. คัดลอก ID วางในช่องด้านล่าง</div>
            <div>5. กด <b>บันทึก</b> — เสร็จแล้ว!</div>
          </div>
        </div>

        <input
          value={lineUserId}
          onChange={e => setLineUserId(e.target.value)}
          placeholder="Line User ID (Bot จะส่งมาให้อัตโนมัติ)"
          style={inputStyle}
        />
      </Card>

      {/* การแจ้งเตือน */}
      <Card title="🔔 การแจ้งเตือน">
        <Toggle value={notifyFlood} onChange={setNotifyFlood}
          label="🔴 น้ำท่วมวิกฤต" desc="แจ้งด่วนเมื่อน้ำท่วมรุนแรง"/>
        <hr style={{ border:'none', borderTop:'1px solid var(--border)' }}/>
        <Toggle value={notifyRisk} onChange={setNotifyRisk}
          label="🟠 เฝ้าระวัง" desc="แจ้งเมื่อมีความเสี่ยงน้ำท่วม"/>
        <hr style={{ border:'none', borderTop:'1px solid var(--border)' }}/>
        <Toggle value={notifySafe} onChange={setNotifySafe}
          label="🟢 สถานะปกติ" desc="แจ้งเมื่อพื้นที่กลับมาปกติ"/>
      </Card>

      {/* บันทึก */}
      <button onClick={save} disabled={saving} style={{
        width:'100%', padding:14, borderRadius:12, border:'none',
        background:'var(--accent)', color:'var(--bg)',
        fontSize:15, fontWeight:700, cursor:'pointer',
        marginBottom:16, fontFamily:'Sarabun',
        opacity: saving ? 0.7 : 1,
      }}>
        {saving ? 'กำลังบันทึก...' : '💾 บันทึกการตั้งค่า'}
      </button>

      {/* ทดสอบ */}
      <Card title="🧪 ทดสอบแจ้งเตือนผ่าน Line Bot">
        <p style={{ color:'var(--text-muted)', fontSize:12, marginBottom:12 }}>
          จำลองสถานการณ์น้ำท่วมและส่งแจ้งเตือนไป Line ทันที
        </p>
        <select value={testDistrict} onChange={e=>setTestDistrict(e.target.value)}
          style={{ ...inputStyle, cursor:'pointer', marginBottom:10 }}>
          <option value="">เลือกอำเภอที่จะจำลอง</option>
          {DISTRICTS.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[
            ['🟠 เฝ้าระวัง', '#F97316', 'risk'],
            ['🔴 น้ำท่วม',   '#EF4444', 'flood'],
            ['🟢 ปกติ',       '#22C55E', 'safe'],
          ].map(([label, color, status]) => (
            <button key={status} onClick={() => handleTest(status)}
              disabled={testing}
              style={{
                padding:'10px 0', borderRadius:10, cursor:'pointer',
                border:`1px solid ${color}60`, background:`${color}20`,
                color, fontSize:13, fontWeight:700, fontFamily:'Sarabun',
                opacity: testing ? 0.6 : 1,
              }}>
              {testing ? '...' : label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}