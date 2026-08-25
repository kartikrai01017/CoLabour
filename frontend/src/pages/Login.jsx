/**
 * Login Page - CONNECTED to backend
 * POST /api/auth/login
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api'

export default function Login({ setUser }) {
  const nav = useNavigate()
  const [form, setForm] = useState({ email: 'demo@colabour.com', password: 'demo123' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      const data = await login(form)
      localStorage.setItem('colabour_token', data.token)
      setUser(data.user)
      nav('/dashboard')
    } catch (e) {
      setErr(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div style={{display:'flex', justifyContent:'center', marginTop:30}}>
      <form onSubmit={submit} className="form" style={{width:'100%'}}>
        <h2>Welcome back</h2>
        <p style={{fontSize:13, color:'#6b7280', marginBottom:16}}>Login to CoLabour — connected to Node backend</p>
        {err && <div className="alert alert-error">{err}</div>}
        <div className="input-group">
          <label>Email</label>
          <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="you@example.com" required />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
        </div>
        <button className="btn" style={{width:'100%'}} disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        <p style={{fontSize:13, marginTop:12, textAlign:'center'}}>No account? <Link to="/register" style={{color:'#f97316', fontWeight:600}}>Register</Link></p>
        <p style={{fontSize:12, color:'#6b7280', marginTop:8, background:'#f9fafb', padding:8, borderRadius:8}}>Try demo: demo@colabour.com / demo123 <br/>Or register a new worker/customer account.</p>
      </form>
    </div>
  )
}
