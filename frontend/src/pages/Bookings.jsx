/**
 * Bookings / My Jobs - MOCK with localStorage
 * Demonstrates full MVP loop: book → match → accept → complete → rate
 * TODO: Replace with PATCH /bookings/:id/accept, /complete, POST /ratings
 */

import { useEffect, useState } from 'react'

export default function Bookings({ user }) {
  const [bookings, setBookings] = useState([])
  const [ratings, setRatings] = useState({})

  useEffect(() => {
    setBookings(JSON.parse(localStorage.getItem('colabour_bookings') || '[]'))
  }, [])

  const updateStatus = (id, status) => {
    const updated = bookings.map(b => b.id === id ? {...b, status} : b)
    setBookings(updated)
    localStorage.setItem('colabour_bookings', JSON.stringify(updated))
  }

  const rate = (id, stars) => {
    setRatings({...ratings, [id]: stars})
    // In production: POST /ratings { bookingId, workerId, score, comment }
  }

  if (bookings.length === 0) return (
    <div style={{marginTop:20}}>
      <h2>My Jobs</h2>
      <div className="card" style={{marginTop:12}}>
        <p>No bookings yet. <a href="/book" style={{color:'#f97316', fontWeight:600}}>Book a service</a> to see the MVP loop in action.</p>
        <p style={{fontSize:12, color:'#6b7280', marginTop:8}}>Bookings are stored in localStorage (mock). Will move to DB via <code>POST /bookings</code> later.</p>
      </div>
    </div>
  )

  return (
    <div style={{marginTop:20}}>
      <h2>My Jobs — Job tracking demo</h2>
      <p style={{color:'#6b7280', fontSize:13}}>Tap status to move forward: pending → matched → in_progress → completed → rate</p>
      {bookings.map(b => (
        <div key={b.id} className="card" style={{marginTop:12}}>
          <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8}}>
            <div>
              <h3>{b.service} — {b.date} {b.time}</h3>
              <p>{b.address} • {b.worker}</p>
              <p style={{fontSize:12, color:'#6b7280'}}>{b.createdAt} • Customer: {b.customer}</p>
            </div>
            <span className={`status status-${b.status}`}>{b.status}</span>
          </div>
          <div style={{display:'flex', gap:8, marginTop:12, flexWrap:'wrap'}}>
            {b.status === 'matched' && <button className="btn btn-small" onClick={()=>updateStatus(b.id, 'in_progress')}>Accept job (worker)</button>}
            {b.status === 'in_progress' && <button className="btn btn-small" style={{background:'#16a34a'}} onClick={()=>updateStatus(b.id, 'completed')}>Mark completed</button>}
            {b.status === 'completed' && !ratings[b.id] && (
              <span style={{display:'flex', gap:6, alignItems:'center'}}>
                Rate: {[1,2,3,4,5].map(n=> <button key={n} onClick={()=>rate(b.id,n)} style={{background:'none', border:'1px solid #e5e7eb', borderRadius:6, padding:'4px 8px', cursor:'pointer'}}>★{n}</button>)}
              </span>
            )}
            {ratings[b.id] && <span className="alert alert-success" style={{padding:'4px 8px', margin:0}}>Rated {ratings[b.id]}★ — thanks! (mock POST /ratings)</span>}
            <button className="btn btn-outline btn-small" onClick={()=>{ if(confirm('Cancel/delete booking?')){ const f=bookings.filter(x=>x.id!==b.id); setBookings(f); localStorage.setItem('colabour_bookings', JSON.stringify(f)) }}}>Cancel</button>
          </div>
        </div>
      ))}
    </div>
  )
}
