import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { getAllDistricts } from '../services/api'

const COLOR  = { flood:'#EF4444', risk:'#F97316', safe:'#22C55E' }
const LABEL  = { flood:'น้ำท่วมวิกฤต', risk:'เฝ้าระวัง', safe:'ปกติ' }
const COORDS = {
  mueang:      [13.3611,100.9847], banbueng:    [13.2456,101.1057],
  nongya:      [13.1556,101.2031], banglamung:  [12.9236,100.8775],
  phantong:    [13.4501,101.1155], phanasnikom: [13.4498,101.1842],
  sriracha:    [13.1282,100.9280], kosichang:   [13.1518,100.8044],
  sattahip:    [12.6617,100.9015], borthong:    [13.3045,101.2888],
  kochan:      [13.5201,101.2102],
}

const isMobile = () => window.innerWidth <= 768

export default function HomePage() {
  const [districts, setDistricts] = useState([])
  const [selected,  setSelected]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [showMap,   setShowMap]   = useState(!isMobile())

  const load = async () => {
    const data = await getAllDistricts()
    setDistricts(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [])

  const counts = {
    safe:  districts.filter(d => d.status==='safe').length,
    risk:  districts.filter(d => d.status==='risk').length,
    flood: districts.filter(d => d.status==='flood').length,
  }

  return (
    <div style={{ display:'flex', flexDirection: isMobile() ? 'column' : 'row',
      height:'calc(100vh - 60px)' }}>

      {/* Sidebar */}
      <div style={{ width: isMobile() ? '100%' : 320,
        background:'var(--panel)', borderRight:'1px solid var(--border)',
        display:'flex', flexDirection:'column',
        height: isMobile() ? 'auto' : '100%' }}>

        {/* Summary */}
        <div style={{ padding:16, borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
            {[['safe',counts.safe,'ปกติ'],['risk',counts.risk,'เฝ้าระวัง'],['flood',counts.flood,'น้ำท่วม']].map(([s,c,l])=>(
              <div key={s} style={{ background:`${COLOR[s]}15`,
                border:`1px solid ${COLOR[s]}40`, borderRadius:10,
                padding:'10px 6px', textAlign:'center' }}>
                <div style={{ color:COLOR[s], fontSize:26,
                  fontFamily:'Rajdhani', fontWeight:700 }}>{c}</div>
                <div style={{ color:'var(--text-muted)', fontSize:13 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:'var(--accent)', fontSize:14,
              fontFamily:'Rajdhani', fontWeight:700, letterSpacing:1 }}>
              11 อำเภอชลบุรี
            </span>
            <div style={{ display:'flex', gap:8 }}>
              {isMobile() && (
                <button onClick={() => setShowMap(!showMap)} style={{
                  background:'transparent', border:'1px solid var(--border)',
                  color:'var(--accent)', padding:'4px 10px',
                  borderRadius:8, cursor:'pointer', fontSize:13 }}>
                  {showMap ? 'รายการ' : 'แผนที่'}
                </button>
              )}
              <button onClick={load} style={{ background:'transparent',
                border:'1px solid var(--border)', color:'var(--accent)',
                padding:'4px 10px', borderRadius:8, cursor:'pointer', fontSize:13 }}>
                รีเฟรช
              </button>
            </div>
          </div>
        </div>

        {/* District list */}
        {(!isMobile() || !showMap) && (
          <div style={{ overflowY:'auto', flex:1 }}>
            {loading ? (
              <div style={{ padding:24, color:'var(--text-muted)',
                textAlign:'center', fontSize:15 }}>กำลังโหลด...</div>
            ) : districts.map(d => {
              const color = COLOR[d.status] || COLOR.safe
              const isSelected = selected?.districtId === d.districtId
              return (
                <div key={d.districtId} onClick={() => {
                  setSelected(d)
                  if (isMobile()) setShowMap(true)
                }}
                  style={{ padding:'14px 16px',
                    borderBottom:'1px solid var(--border)',
                    background: isSelected ? `${color}10` : 'transparent',
                    borderLeft: isSelected ? `3px solid ${color}` : '3px solid transparent',
                    cursor:'pointer', transition:'all 0.15s' }}>
                  <div style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', marginBottom:4 }}>
                    <span style={{ fontSize:16, fontWeight:600 }}>{d.districtName}</span>
                    <span style={{ fontSize:13, color, background:`${color}20`,
                      padding:'3px 10px', borderRadius:20 }}>{LABEL[d.status]}</span>
                  </div>
                  <div style={{ color:'var(--text-muted)', fontSize:14 }}>
                    น้ำ {d.waterLevel?.toFixed(0)} ซม. · ฝน {d.rainfall?.toFixed(1)} มม.
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Map */}
      {(!isMobile() || showMap) && (
        <div style={{ flex:1, height: isMobile() ? 'calc(100vh - 300px)' : '100%' }}>
          <MapContainer center={[13.1,101.0]} zoom={9}
            style={{ width:'100%', height:'100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {districts.map(d => {
              const pos = COORDS[d.districtId]
              if (!pos) return null
              const color = COLOR[d.status] || COLOR.safe
              return (
                <CircleMarker key={d.districtId} center={pos}
                  radius={18} color={color} fillColor={color}
                  fillOpacity={0.75} weight={2}
                  eventHandlers={{ click:()=>setSelected(d) }}>
                  <Popup>
                  <div style={{ fontFamily:'Sarabun', minWidth:180, fontSize:14, lineHeight:1.8 }}>
                    <div style={{ fontWeight:700, fontSize:16, marginBottom:6,
                      borderBottom:'1px solid #eee', paddingBottom:6 }}>
                      📍 {d.districtName}
                    </div>
                    <div style={{ color, fontWeight:600, marginBottom:6 }}>
                      {d.status === 'flood' ? '🚨' : d.status === 'risk' ? '⚠️' : '✅'} {LABEL[d.status]}
                    </div>
                    <div>💧 ระดับน้ำ: <b>{d.waterLevel?.toFixed(0)} ซม.</b></div>
                    <div>🌧 ปริมาณฝน: <b>{d.rainfall?.toFixed(1)} มม.</b></div>
                    <div>🌡 อุณหภูมิ: <b>{d.temperature?.toFixed(0)}°C</b></div>
                    <div>💨 ลม: <b>{d.windSpeed?.toFixed(1)} กม./ชม.</b></div>
                    <div>💦 ความชื้น: <b>{d.humidity?.toFixed(0)}%</b></div>
                  </div>
                </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>
      )}
    </div>
  )
}