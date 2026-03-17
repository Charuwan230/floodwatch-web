import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import HomePage      from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage   from './pages/ProfilePage'
import './index.css'

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
        <div style={{ width:8, height:8, borderRadius:4,
          background:'var(--safe)' }} />
        <span style={{ fontSize:12, color:'var(--safe)' }}>LIVE</span>
      </div>
    </nav>
  )
}

export default function App() {
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