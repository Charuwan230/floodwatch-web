import { useState, useEffect } from 'react'
import { getAllDistricts } from '../services/api'

const COLOR = { flood:'#EF4444', risk:'#F97316', safe:'#22C55E' }
const LABEL = { flood:'น้ำท่วมวิกฤต', risk:'เฝ้าระวัง', safe:'ปกติ' }

export default function DashboardPage() {
  const [districts, setDistricts] = useState([])

  useEffect(() => { getAllDistricts().then(setDistricts) }, [])

  const counts = {
    safe:  districts.filter(d=>d.status==='safe').length,
    risk:  districts.filter(d=>d.status==='risk').length,
    flood: districts.filter(d=>d.status==='flood').length,
  }
  const maxWater = Math.max(...districts.map(d=>d.waterLevel||0), 1)
  const avgWater = districts.length
    ? (districts.reduce((s,d)=>s+(d.waterLevel||0),0)/districts.length).toFixed(1) : 0

  return (
    <div style={{ padding:20, maxWidth:960, margin:'0 auto' }}>
      <h2 style={{ fontFamily:'Rajdhani', color:'var(--accent)',
        fontSize:24, marginBottom:20, letterSpacing:1 }}>
        สถิติ
      </h2>

      <div style={{ display:'grid',
        gridTemplateColumns: window.innerWidth <= 768 ? '1fr 1fr' : 'repeat(4,1fr)',
        gap:12, marginBottom:24 }}>
        {[
          ['🏘️', districts.length, 'อำเภอทั้งหมด', 'var(--accent)'],
          ['✅', counts.safe,  'ปกติ',      COLOR.safe],
          ['⚠️', counts.risk,  'เฝ้าระวัง', COLOR.risk],
          ['🚨', counts.flood, 'น้ำท่วม',   COLOR.flood],
        ].map(([icon,val,label,color])=>(
          <div key={label} style={{ background:'var(--panel)',
            border:`1px solid ${color}40`, borderRadius:16,
            padding:20, textAlign:'center' }}>
            <div style={{ fontSize:28 }}>{icon}</div>
            <div style={{ color, fontSize:42, fontFamily:'Rajdhani',
              fontWeight:700, lineHeight:1.1 }}>{val}</div>
            <div style={{ color:'var(--text-secondary)', fontSize:14,
              marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ background:'var(--panel)', border:'1px solid var(--border)',
        borderRadius:16, padding:20, marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between',
          alignItems:'center', marginBottom:20 }}>
          <span style={{ color:'var(--accent)', fontSize:15,
            fontFamily:'Rajdhani', fontWeight:700, letterSpacing:1 }}>
            ระดับน้ำแต่ละอำเภอ
          </span>
          <span style={{ color:'var(--text-muted)', fontSize:14 }}>
            เฉลี่ย {avgWater} ซม.
          </span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {[...districts]
            .sort((a,b)=>(b.waterLevel||0)-(a.waterLevel||0))
            .map(d => {
              const pct   = ((d.waterLevel||0)/maxWater)*100
              const color = COLOR[d.status] || COLOR.safe
              return (
                <div key={d.districtId}>
                  <div style={{ display:'flex', justifyContent:'space-between',
                    marginBottom:6, fontSize:15 }}>
                    <span style={{ fontWeight:600 }}>{d.districtName}</span>
                    <span style={{ color, fontSize:14 }}>
                      {d.waterLevel?.toFixed(0)} ซม. — {LABEL[d.status]}
                    </span>
                  </div>
                  <div style={{ background:'var(--border)', borderRadius:6, height:12 }}>
                    <div style={{ width:`${pct}%`, height:'100%',
                      borderRadius:6, background:color,
                      transition:'width 0.8s ease',
                      boxShadow:`0 0 8px ${color}60` }} />
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      <div style={{ background:'var(--panel)', border:'1px solid var(--border)',
        borderRadius:16, padding:20 }}>
        <div style={{ color:'var(--accent)', fontSize:15, fontFamily:'Rajdhani',
          fontWeight:700, letterSpacing:1, marginBottom:16 }}>
          ปริมาณฝน (มม.)
        </div>
        <div style={{ display:'grid',
          gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:10 }}>
          {districts.map(d => (
            <div key={d.districtId} style={{ background:'rgba(0,212,255,0.05)',
              border:'1px solid var(--border)', borderRadius:10, padding:'14px' }}>
              <div style={{ fontSize:13, color:'var(--text-secondary)',
                marginBottom:6 }}>{d.districtName}</div>
              <div style={{ fontSize:24, fontFamily:'Rajdhani', fontWeight:700,
                color:'var(--accent)' }}>{d.rainfall?.toFixed(1)}</div>
              <div style={{ fontSize:13, color:'var(--text-muted)' }}>มม.</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}