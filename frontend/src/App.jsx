/**
 * CoLabour Frontend - MVP App Router
 * 
 * Simple architecture for easy editing:
 * - React Router for navigation
 * - Auth state stored in localStorage (token) + React context via prop drilling (minimal)
 * - All mock data lives in pages (replace with API calls later)
 * 
 * UI is intentionally simple (cards, clean typography) so it can be
 * re-skinned to match any competitor in < 30 minutes by editing index.css variables.
 */

import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchMe } from './api'

// Pages
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import BookService from './pages/BookService.jsx'
import Workers from './pages/Workers.jsx'
import Bookings from './pages/Bookings.jsx'

function Header({ user, onLogout }) {
  const location = useLocation();
  const isActive = (p) => location.pathname === p ? 'active' : '';
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">Co<span>Labour</span> <span style={{fontWeight:400, fontSize:13, color:'#6b7280'}}>Co-op</span></Link>
        <nav className="nav">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/workers" className={isActive('/workers')}>Workers</Link>
          <Link to="/book" className={isActive('/book')}>Book Service</Link>
          <Link to="/bookings" className={isActive('/bookings')}>My Jobs</Link>
          {user ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
              <span style={{fontSize:13, color:'#374151'}}>{user.name} · {user.role}</span>
              <button onClick={onLogout} className="btn btn-outline btn-small">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')}>Login</Link>
              <Link to="/register" className="btn btn-small">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session from token (connected to backend)
  useEffect(() => {
    const token = localStorage.getItem('colabour_token');
    if (!token) { setLoading(false); return; }
    fetchMe().then(d => setUser(d.user)).catch(() => {
      localStorage.removeItem('colabour_token');
    }).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('colabour_token');
    setUser(null);
  };

  if (loading) return <div style={{padding:40, textAlign:'center'}}>Loading CoLabour...</div>;

  return (
    <BrowserRouter>
      <Header user={user} onLogout={handleLogout} />
      <main className="container" style={{paddingTop:12}}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/book" element={<BookService user={user} />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/bookings" element={<Bookings user={user} />} />
        </Routes>
        <footer className="footer">
          CoLabour MVP — Co-operative owned. Fair pay. Local trust. <br/>
          MVP note: Only <strong>Auth (login/register)</strong> is live via backend. Other flows are mocked for editing.
        </footer>
      </main>
    </BrowserRouter>
  )
}
