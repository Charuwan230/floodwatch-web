import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import HomePage      from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage   from './pages/ProfilePage'
import './index.css'

const firebaseConfig = {
  apiKey:            "AIzaSyDWclevjOnc-O58Z9ZfFdA5Pp749sS_s_M",
  authDomain:        "floodchonburi.firebaseapp.com",
  projectId:         "floodchonburi",
  storageBucket:     "floodchonburi.appspot.com",
  messagingSenderId: "301836480927",
  appId:             "1:301836480927:web:ef585c0570637a17c44daa",
}

const app      = initializeApp(firebaseConfig)
const auth     = getAuth(app)
const provider = new GoogleAuthProvider()

function isInAppBrowser() {
  const ua = navigator.userAgent || ''
  return /Line|FBAN|FBAV|Instagram|Twitter|MicroMessenger/i.test(ua)
}

function OpenInBrowser() {
  const url = window.location.href
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'var(--panel)', border:'1px solid var(--border)',
        borderRadius:20, padding:32, maxWidth:360, textAlign:'center' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🌊</div>
        <h2 style={{ fontFamily:'Rajdhani', color:'var(--accent)',
          fontSize:24, marginBottom:12 }}>FLOOD WATCH</h2>
        <p style={{ color:'var(--text-secondary)', fontSize:15,
          marginBottom:24, lineHeight:1.8 }}>
          กรุณาเปิดลิงก์นี้ในเบราว์เซอร์ภายนอก<br/>
          (Chrome, Safari หรือ Edge)
        </p>
        <div style={{ background:'rgba(0,212,255,0.1)',
          border:'1px solid rgba(0,212,255,0.3)',
          borderRadius:10, padding:'12px 16px', marginBottom:20 }}>
          <p style={{ color:'var(--accent)', fontSize:13,
            wordBreak:'break-all' }}>{url}</p>
        </div>
        <p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.8 }}>
          กดปุ่ม <b style={{color:'var(--text-secondary)'}}>...</b> แล้วเลือก
          <b style={{color:'var(--accent)'}}> เปิดในเบราว์เซอร์</b>
        </p>
      </div>
    </div>
  )
}

function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const login = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithPopup(auth, provider)
    } catch (e) {
      setError('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'var(--panel)', border:'1px solid var(--border)',
        borderRadius:24, padding:40, maxWidth:380, width:'100%', textAlign:'center',
        boxShadow:'0 0 60px rgba(0,212,255,0.08)' }}>

        <div style={{ fontSize:64, marginBottom:16 }}>🌊</div>
        <h1 style={{ fontFamily:'Rajdhani', color:'var(--accent)',
          fontSize:32, letterSpacing:3, marginBottom:8 }}>FLOOD WATCH</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:15, marginBottom:8 }}>
          ระบบแจ้งเตือนน้ำท่วม
        </p>
        <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:32 }}>
          จังหวัดชลบุรี
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
          gap:12, marginBottom:32 }}>
          {[['11','อำเภอ'],['24/7','ตรวจสอบ'],['Real','time']].map(([v,l])=>(
            <div key={l} style={{ background:'rgba(0,212,255,0.05)',
              border:'1px solid var(--border)', borderRadius:12, padding:'12px 8px' }}>
              <div style={{ color:'var(--accent)', fontSize:20, fontWeight:700,
                fontFamily:'Rajdhani' }}>{v}</div>
              <div style={{ color:'var(--text-muted)', fontSize:12 }}>{l}</div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background:'#EF444420', border:'1px solid #EF444460',
            borderRadius:10, padding:'10px 16px', marginBottom:16,
            fontSize:14, color:'#EF4444' }}>{error}</div>
        )}

        <button onClick={login} disabled={loading} style={{
          width:'100%', padding:'14px 24px', borderRadius:12,
          background:'white', border:'none', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          gap:10, fontSize:16, fontWeight:600, color:'#1a1a1a',
          opacity: loading ? 0.7 : 1,
        }}>
          <img src="https://www.google.com/favicon.ico" width={20} />
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
        </button>

        <p style={{ color:'var(--text-muted)', fontSize:12, marginTop:16 }}>
          ข้อมูลจาก Open-Meteo API อัปเดตทุก 5 นาที
        </p>
      </div>
    </div>
  )
}

function Navbar({ user }) {
  const linkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    padding: '16px 0',
    fontSize: 15,
    fontWeight: 600,
    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
    borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
    transition: 'all 0.2s',
  })

  return (
    <nav style={{
      background: 'var(--panel)',
      borderBottom: '1px solid var(--border)',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 60,
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <span style={{ fontSize:20 }}>🌊</span>
        <span style={{ fontFamily:'Rajdhani', color:'var(--accent)',
          fontWeight:700, fontSize:16, letterSpacing:1 }}>FLOOD WATCH</span>
      </div>

      <div style={{ display:'flex', gap:20 }}>
        <NavLink to="/"          style={linkStyle}>แผนที่</NavLink>
        <NavLink to="/dashboard" style={linkStyle}>สถิติ</NavLink>
        <NavLink to="/profile"   style={linkStyle}>ตั้งค่า</NavLink>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {user?.photoURL && (
          <img src={user.photoURL} style={{ width:32, height:32,
            borderRadius:16, border:'2px solid var(--accent)' }} />
        )}
        <button onClick={() => signOut(auth)} style={{
          background:'transparent', border:'1px solid var(--border)',
          color:'var(--text-muted)', padding:'4px 10px', borderRadius:8,
          cursor:'pointer', fontSize:13,
        }}>ออก</button>
      </div>
    </nav>
  )
}

export default function App() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  if (isInAppBrowser()) return <OpenInBrowser />
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', background:'var(--bg)', color:'var(--accent)',
      fontSize:20, fontFamily:'Rajdhani' }}>🌊 กำลังโหลด...</div>
  )
  if (!user) return <LoginPage />

  return (
    <BrowserRouter>
      <Navbar user={user} />
      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile"   element={<ProfilePage user={user} />} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}