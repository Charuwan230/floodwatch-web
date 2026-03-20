import { useState, useEffect } from 'react'
import { simulateFlood } from '../services/api'
import { sendLineBot } from '../services/lineNotify'

const BASE = 'https://floodwatch-final-production.up.railway.app/api'

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
  padding:'12px 16px', color:'var(--text-primary)',
  fontSize:16, outline:'none', fontFamily:'Sarabun',
}

const Card = ({title, children}) => (
  <div style={{ background:'var(--panel)', border:'1px solid var(--border)',
    borderRadius:16, padding:20, marginBottom:16 }}>
    <div style={{ color:'var(--accent)', fontSize:15, fontFamily:'Rajdhani',
      fontWeight:700, letterSpacing:1, marginBottom:16 }}>{title}</div>
    {children}
  </div>
)

const Toggle = ({value, onChange, label, desc}) => (
  <div style={{ display:'flex', justifyContent:'space-between',
    alignItems:'center', padding:'12px 0' }}>
    <div>
      <div style={{ fontSize:16, fontWeight:600 }}>{label}</div>
      <div style={{ fontSize:14, color:'var(--text-muted)', marginTop:2 }}>{desc}</div>
    </div>
    <div onClick={()=>onChange(!value)} style={{
      width:52, height:28, borderRadius:14, cursor:'pointer',
      background: value ? 'var(--accent)' : 'var(--border)',
      position:'relative', transition:'background 0.2s', flexShrink:0,
    }}>
      <div style={{
        position:'absolute', top:4,
        left: value ? 26 : 4, width:20, height:20,
        borderRadius:10, background:'white', transition:'left 0.2s',
      }}/>
    </div>
  </div>
)

export default function ProfilePage({ user }) {
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
    if (!districtId) return showMsg('กรุณาเลือกอำเภอก่อนครับ')
    setSaving(true)
    localStorage.setItem('districtId',  districtId)
    localStorage.setItem('subdistrict', subdistrict)
    localStorage.setItem('village',     village)
    localStorage.setItem('houseDetail', houseDetail)
    localStorage.setItem('lineUserId',  lineUserId)
    localStorage.setItem('notifyFlood', notifyFlood)
    localStorage.setItem('notifyRisk',  notifyRisk)
    localStorage.setItem('notifySafe',  notifySafe)
    if (lineUserId) {
      try {
        await fetch(`${BASE}/user/line-userid`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ lineUserId }),
        })
      } catch (e) { console.error(e) }
    }
    setSaving(false)
    showMsg('บันทึกสำเร็จ!')
  }

  const handleTest = async (status) => {
    if (!testDistrict) return showMsg('เลือกอำเภอที่จะจำลองก่อนครับ')
    if (!lineUserId)   return showMsg('ใส่ Line User ID ก่อนครับ')
    setTesting(true)
    const name = DISTRICTS.find(d=>d.id===testDistrict)?.name || testDistrict
    await simulateFlood(testDistrict, status)
    const ok = await sendLineBot(lineUserId, name, status)
    setTesting(false)
    showMsg(ok ? 'ส่ง Line Bot สำเร็จ! เช็คไลน์ได้เลยครับ' : 'ส่งไม่สำเร็จ ตรวจสอบ User ID อีกครั้ง')
  }

  const isSuccess = msg?.startsWith('บันทึก') || msg?.startsWith('ส่ง Line')

  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:20 }}>
      <h2 style={{ fontFamily:'Rajdhani', color:'var(--accent)',
        fontSize:24, marginBottom:20, letterSpacing:1 }}>
        ตั้งค่า
      </h2>

      {msg && (
        <div style={{
          background: isSuccess ? '#22C55E20' : '#F9731620',
          border: `1px solid ${isSuccess?'#22C55E60':'#F9731660'}`,
          borderRadius:10, padding:'14px 16px', marginBottom:16, fontSize:16,
        }}>{msg}</div>
      )}

      {/* ข้อมูลผู้ใช้ */}
      {user && (
        <Card title="ข้อมูลผู้ใช้">
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <img src={user.photoURL} style={{ width:56, height:56,
              borderRadius:28, border:'2px solid var(--accent)' }} />
            <div>
              <div style={{ fontWeight:700, fontSize:17 }}>{user.displayName}</div>
              <div style={{ color:'var(--text-muted)', fontSize:14, marginTop:2 }}>{user.email}</div>
              <div style={{ color:'var(--safe)', fontSize:13, marginTop:4 }}>
                เชื่อมต่อผ่าน Google
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ที่อยู่ */}
      <Card title="ที่อยู่อาศัย">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <select value={districtId} onChange={e=>setDistrictId(e.target.value)}
            style={{ ...inputStyle, cursor:'pointer' }}>
            <option value="">เลือกอำเภอที่คุณอาศัยอยู่ *</option>
            {DISTRICTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:16, lineHeight:1.6 }}>
          สแกน QR Code แล้วพิมพ์ข้อความใดก็ได้ใน Line — ระบบจะส่ง User ID ให้อัตโนมัติ
        </p>
        <div style={{ display:'flex', gap:16, alignItems:'flex-start',
          marginBottom:16, padding:16, background:'rgba(0,212,255,0.05)',
          border:'1px solid rgba(0,212,255,0.15)', borderRadius:12 }}>
          <div style={{ flexShrink:0, textAlign:'center' }}>
            <img src="https://qr-official.line.me/sid/L/741gdkza.png"
              alt="Line Bot QR"
              style={{ width:120, height:120, borderRadius:12,
                background:'white', padding:4 }} />
            <div style={{ color:'var(--text-muted)', fontSize:12, marginTop:6 }}>
              สแกนเพื่อเพิ่มเพื่อน
            </div>
          </div>
          <div style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:2 }}>
            <div style={{ color:'var(--accent)', fontWeight:700, marginBottom:4 }}>วิธีใช้งาน</div>
            <div>1. สแกน QR Code</div>
            <div>2. กด เพิ่มเพื่อน</div>
            <div>3. Bot ส่ง User ID มาให้</div>
            <div>4. วาง ID ในช่องด้านล่าง</div>
            <div>5. กด บันทึก</div>
          </div>
        </div>
        <input value={lineUserId} onChange={e=>setLineUserId(e.target.value)}
          placeholder="Line User ID"
          style={inputStyle}/>
      </Card>

      {/* การแจ้งเตือน */}
      <Card title="การแจ้งเตือน">
        <Toggle value={notifyFlood} onChange={setNotifyFlood}
          label="น้ำท่วมวิกฤต" desc="แจ้งด่วนเมื่อน้ำท่วมรุนแรง"/>
        <hr style={{ border:'none', borderTop:'1px solid var(--border)' }}/>
        <Toggle value={notifyRisk} onChange={setNotifyRisk}
          label="เฝ้าระวัง" desc="แจ้งเมื่อมีความเสี่ยงน้ำท่วม"/>
        <hr style={{ border:'none', borderTop:'1px solid var(--border)' }}/>
        <Toggle value={notifySafe} onChange={setNotifySafe}
          label="สถานะปกติ" desc="แจ้งเมื่อพื้นที่กลับมาปกติ"/>
      </Card>

      <button onClick={save} disabled={saving} style={{
        width:'100%', padding:16, borderRadius:12, border:'none',
        background:'var(--accent)', color:'var(--bg)',
        fontSize:17, fontWeight:700, cursor:'pointer',
        marginBottom:16, fontFamily:'Sarabun',
        opacity: saving ? 0.7 : 1,
      }}>
        {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
      </button>

      {/* ทดสอบ */}
      <Card title="ทดสอบแจ้งเตือนผ่าน Line Bot">
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:12, lineHeight:1.6 }}>
          จำลองสถานการณ์น้ำท่วมและส่งแจ้งเตือนไป Line ทันที
        </p>
        <select value={testDistrict} onChange={e=>setTestDistrict(e.target.value)}
          style={{ ...inputStyle, cursor:'pointer', marginBottom:12 }}>
          <option value="">เลือกอำเภอที่จะจำลอง</option>
          {DISTRICTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[
            ['เฝ้าระวัง', '#F97316', 'risk'],
            ['น้ำท่วม',   '#EF4444', 'flood'],
            ['ปกติ',      '#22C55E', 'safe'],
          ].map(([label, color, status]) => (
            <button key={status} onClick={() => handleTest(status)}
              disabled={testing}
              style={{ padding:'12px 0', borderRadius:10, cursor:'pointer',
                border:`1px solid ${color}60`, background:`${color}20`,
                color, fontSize:15, fontWeight:700, fontFamily:'Sarabun',
                opacity: testing ? 0.6 : 1 }}>
              {testing ? '...' : label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}