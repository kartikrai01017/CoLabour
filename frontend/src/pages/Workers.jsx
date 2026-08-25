/**
 * Workers List - MOCK
 * TODO: GET /api/workers (with verification filter)
 */

const mockWorkers = [
  { id:1, name:'Arun', skill:'Plumbing', location:'Pune - Kothrud', rating:4.9, jobs:42, verified:true },
  { id:2, name:'Priya', skill:'Electrical', location:'Pune - Baner', rating:4.7, jobs:31, verified:true },
  { id:3, name:'CleanCo Team', skill:'Cleaning', location:'Pune - Hadapsar', rating:4.8, jobs:88, verified:true },
  { id:4, name:'Manoj', skill:'Carpentry', location:'Pune - Shivaji Nagar', rating:4.6, jobs:20, verified:false },
  { id:5, name:'Sunita', skill:'Painting', location:'Pune - Viman Nagar', rating:4.9, jobs:15, verified:true },
]

export default function Workers() {
  return (
    <div style={{marginTop:20}}>
      <h2>Verified Workers</h2>
      <p style={{color:'#6b7280', fontSize:13}}>Mock data — replace with <code>GET /api/workers</code>. Verified badge = co-op approved.</p>
      <div className="grid" style={{marginTop:16}}>
        {mockWorkers.map(w => (
          <div key={w.id} className="card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
              <h3>{w.name}</h3>
              <span className={`badge ${w.verified ? 'badge-verified' : 'badge-pending'}`}>{w.verified ? '✓ verified' : 'pending'}</span>
            </div>
            <p>{w.skill} • {w.location}</p>
            <p style={{marginTop:6}}>⭐ {w.rating} • {w.jobs} jobs completed</p>
            <button className="btn btn-outline btn-small" style={{marginTop:10}} onClick={()=>alert(`Mock: View profile would be GET /workers/${w.id}`)}>View profile</button>
          </div>
        ))}
      </div>
    </div>
  )
}
