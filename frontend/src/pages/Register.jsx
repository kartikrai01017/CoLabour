/**
 * Register Page - CONNECTED to backend
 * POST /api/auth/register
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api'

export default function Register({ setUser }) {
  const nav = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'customer', skill:'Plumbing', location:'Pune' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      const data = await register(form)
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
        <h2>Create account</h2>
        <p style={{fontSize:13, color:'#6b7280', marginBottom:16}}>Join as customer or worker — this creates real account on backend</p>
        {err && <div className="alert alert-error">{err}</div>}
        <div className="input-group">
          <label>Full name</label>
          <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required placeholder="Arun Kumar" />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required placeholder="arun@example.com" />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required placeholder="min 4 chars" />
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <div className="input-group">
            <label>Role</label>
            <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
              <option value="customer">Customer</option>
              <option value="worker">Worker</option>
              <option value="admin">Co-op Admin</option>
            </select>
          </div>
          <div className="input-group">
            <label>Location</label>
            <input value={form.location} onChange={e=>setForm({...form, location:e.target.value})} placeholder="Pune" />
          </div>
        </div>
        {form.role === 'worker' && (
          <div className="input-group">
            <label>Skill</label>
            <select value={form.skill} onChange={e=>setForm({...form, skill:e.target.value})}>
              <option>Plumbing</option><option>Electrical</option><option>Cleaning</option><option>Carpentry</option><option>Painting</option>
            </select>
          </div>
        )}
        <button className="btn" style={{width:'100%'}} disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        <p style={{fontSize:13, marginTop:12, textAlign:'center'}}>Already have account? <Link to="/login" style={{color:'#f97316', fontWeight:600}}>Login</Link></p>
      </form>
    </div>
  )
}
