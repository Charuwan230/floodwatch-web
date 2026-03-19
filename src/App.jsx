import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import HomePage      from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage   from './pages/ProfilePage'
import './index.css'

function isInAppBrowser() {
  const ua = navigator.userAgent || ''
  return /Line|FBAN|FBAV|Instagram|Twitter|MicroMessenger/i.test(ua)
}

function OpenInBrowser() {
  const url = window.location.href
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 32, maxWidth: 360, textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🌊</div>
        <h2 style={{ fontFamily: 'Rajdhani', color: 'var(--accent)',
          fontSize: 24, marginBottom: 12 }}>FLOOD WATCH</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14,
          marginBottom: 24, lineHeight: 1.6 }}>
          กรุณาเปิดลิงก์นี้ในเบราว์เซอร์ภายนอก<br/>
          (Chrome, Safari หรือ Edge)
        </p>
        <div style={{
          background: 'rgba(0,212,255,0.1)',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
        }}>
          <p style={{ color: 'var(--accent)', fontSize: 12,
            wordBreak: 'break-all' }}>{url}</p>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6 }}>
          วิธีเปิด: กดปุ่ม <b style={{color:'var(--text-secondary)'}}>...</b> หรือ
          <b style={{color:'var(--text-secondary)'}}> เมนู</b> แล้วเลือก
          <b style={{color:'var(--accent)'}}> เปิดในเบราว์เซอร์</b>
        </p>
      </div>
    </div>
  )
}

function Navbar() {
  const linkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    padding: '18px 0',
    fontSize: 14,
    fontWeight: 600,
    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
    borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
    transition: 'all 0.2s',
  })

  return (
    <nav style={{
      background: 'var(--panel)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 56,
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:22 }}>🌊</span>
        <span style={{ fontFamily:'Rajdhani', color:'var(--accent)',
          fontWeight:700, fontSize:18, letterSpacing:1 }}>FLOOD WATCH</span>
        <span style={{ color:'var(--text-muted)', fontSize:12 }}>จังหวัดชลบุรี</span>
      </div>
      <div style={{ display:'flex', gap:28 }}>
        <NavLink to="/"          style={linkStyle}>แผนที่</NavLink>
        <NavLink to="/dashboard" style={linkStyle}>สถิติ</NavLink>
        <NavLink to="/profile"   style={linkStyle}>ตั้งค่า</NavLink>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:8, height:8, borderRadius:4, background:'var(--safe)' }} />
        <span style={{ fontSize:12, color:'var(--safe)' }}>LIVE</span>
      </div>
    </nav>
  )
}

export default function App() {
  if (isInAppBrowser()) {
    return <OpenInBrowser />
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile"   element={<ProfilePage />} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}