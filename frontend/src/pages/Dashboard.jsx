/**
 * Dashboard - Mock (not connected to backend yet)
 * Shows role-based content. Replace with real API when ready:
 * TODO: GET /api/admin/dashboard, GET /api/bookings, GET /api/workers etc.
 */

export default function Dashboard({ user }) {
  if (!user) return <div className="card" style={{marginTop:20}}>Please <a href="/login" style={{color:'#f97316', textDecoration:'underline'}}>login</a> to see dashboard. (Auth is the only live backend feature)</div>

  const isWorker = user.role === 'worker'
  const isAdmin = user.role === 'admin'

  return (
    <div style={{marginTop:20}}>
      <h2>Dashboard — {user.role}</h2>
      <p style={{color:'#6b7280', fontSize:14}}>Hello {user.name} ({user.email}) • Location: {user.location} {user.skill && `• Skill: ${user.skill}`}</p>

      <div className="grid" style={{marginTop:16}}>
        <div className="card">
          <h3>{isWorker ? 'My Jobs' : isAdmin ? 'Pending Verifications' : 'My Bookings'}</h3>
          <p>{isAdmin ? '3 workers waiting for approval (mock)' : isWorker ? '2 new job offers near you (mock)' : '1 active booking — plumber arriving today (mock)'}</p>
          <span className={`badge ${isAdmin ? 'badge-pending' : 'badge-verified'}`} style={{marginTop:8}}>{isAdmin ? 'Action needed' : 'Live'}</span>
        </div>
        <div className="card">
          <h3>{isWorker ? 'Earnings' : 'Welfare Fund'}</h3>
          <p>{isWorker ? '₹4,200 this week • ₹340 to welfare fund (mock)' : 'Co-op fund: ₹1.2L pooled for insurance & training (mock)'}</p>
        </div>
        <div className="card">
          <h3>Rating</h3>
          <p>4.8 ★ (24 reviews) — mock data. Real ratings will come from <code>POST /ratings</code> later.</p>
        </div>
      </div>

      {isAdmin && (
        <div className="card" style={{marginTop:16}}>
          <h3>Admin: Verify workers (mock table)</h3>
          <p style={{fontSize:13, color:'#6b7280'}}>In MVP, this would call <code>PATCH /admin/workers/:id/verify</code>. Currently mocked.</p>
          <table style={{width:'100%', marginTop:12, fontSize:13, borderCollapse:'collapse'}}>
            <thead><tr style={{textAlign:'left', borderBottom:'1px solid #e5e7eb'}}><th>Name</th><th>Skill</th><th>Status</th><th></th></tr></thead>
            <tbody>
              <tr><td>Manoj — Carpentry</td><td>Carpentry</td><td><span className="badge badge-pending">pending</span></td><td><button className="btn btn-small" onClick={()=>alert('Mock verified! Will call PATCH /admin/workers/:id/verify')}>Verify</button></td></tr>
              <tr><td>Arun — Plumbing</td><td>Plumbing</td><td><span className="badge badge-verified">verified</span></td><td>✓</td></tr>
            </tbody>
          </table>
        </div>
      )}

      <div style={{marginTop:16, padding:12, background:'#fef3c7', borderRadius:8, fontSize:13}}>
        <strong>MVP note:</strong> Dashboard data is mocked. Only login/register hit the backend. To make this live, implement <code>GET /api/admin/dashboard</code> and replace this mock.
      </div>
    </div>
  )
}
