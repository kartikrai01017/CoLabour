/**
 * Book Service Page - MOCK (not connected)
 * TODO: Connect to POST /api/bookings + POST /api/matching
 * Currently stores bookings in localStorage as demo.
 */

import { useState } from 'react'

export default function BookService({ user }) {
  const [form, setForm] = useState({ service:'Plumbing', date:'', time:'', address:'', notes:'' })
  const [done, setDone] = useState(false)
  const [match, setMatch] = useState(null)

  const submit = (e) => {
    e.preventDefault()
    // Mock matching engine: pick nearest worker by skill (just random mock)
    const mockWorkers = {
      Plumbing: 'Arun (Plumber) — 1.2km away ★4.9',
      Electrical: 'Priya Electrician — 0.8km away ★4.7',
      Cleaning: 'Team CleanCo — 2.1km away ★4.8',
      Carpentry: 'Manoj — 1.5km away ★4.6',
      Painting: 'Sunita Painters — 0.9km away ★4.9',
      'Appliance Repair': 'Ravi — 1.8km away ★4.5'
    }
    const m = mockWorkers[form.service] || 'Verified worker nearby'
    setMatch(m)

    // Save to localStorage as mock bookings
    const bookings = JSON.parse(localStorage.getItem('colabour_bookings') || '[]')
    bookings.unshift({ id: Date.now(), ...form, status:'matched', worker:m, customer: user?.name || 'Guest', createdAt: new Date().toLocaleString() })
    localStorage.setItem('colabour_bookings', JSON.stringify(bookings))
    setDone(true)
  }

  if (done) return (
    <div style={{marginTop:20}}>
      <div className="alert alert-success">✓ Booking created! (mock — stored in localStorage)</div>
      <div className="card">
        <h3>Matched! — Basic matching engine (mock)</h3>
        <p>Service: {form.service} • {form.date} {form.time}</p>
        <p style={{marginTop:8}}><strong>Assigned:</strong> {match}</p>
        <p style={{fontSize:12, color:'#6b7280', marginTop:8}}>In production this would be <code>POST /matching</code> returning best worker by skill+location distance filter.</p>
        <button className="btn" style={{marginTop:12}} onClick={()=>setDone(false)}>Book another</button> <a href="/bookings" className="btn btn-outline" style={{marginLeft:8, display:'inline-block', padding:'10px 18px', borderRadius:8}}>View My Jobs →</a>
      </div>
    </div>
  )

  return (
    <div style={{marginTop:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
      <form onSubmit={submit} className="form" style={{maxWidth:'none'}}>
        <h2>Book a service</h2>
        <p style={{fontSize:13, color:'#6b7280', marginBottom:16}}>Mock form — will become <code>POST /bookings</code> later</p>
        <div className="input-group">
          <label>Service type</label>
          <select value={form.service} onChange={e=>setForm({...form, service:e.target.value})}>
            <option>Plumbing</option><option>Electrical</option><option>Cleaning</option><option>Carpentry</option><option>Painting</option><option>Appliance Repair</option>
          </select>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <div className="input-group"><label>Date</label><input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} required /></div>
          <div className="input-group"><label>Time</label><input type="time" value={form.time} onChange={e=>setForm({...form, time:e.target.value})} required /></div>
        </div>
        <div className="input-group"><label>Address / Location</label><input value={form.address} onChange={e=>setForm({...form, address:e.target.value})} placeholder="e.g. Pune, Kothrud" required /></div>
        <div className="input-group"><label>Notes (optional)</label><input value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Leak in kitchen..." /></div>
        <button className="btn" style={{width:'100%'}}>Request & Match Worker (mock)</button>
      </form>
      <div>
        <div className="card">
          <h3>What happens next?</h3>
          <ol style={{fontSize:13, color:'#4b5563', paddingLeft:18, lineHeight:2}}>
            <li>We match by skill + location (mock distance filter now)</li>
            <li>Worker sees offer → accepts</li>
            <li>Status: matched → in_progress → completed</li>
            <li>You rate worker — builds trust</li>
          </ol>
          <p style={{fontSize:12, color:'#6b7280', marginTop:12}}>Emergency booking? Mark as urgent — will flag to on-call workers (future <code>isEmergency</code> field).</p>
        </div>
      </div>
    </div>
  )
}
