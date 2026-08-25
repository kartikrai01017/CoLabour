/**
 * Home Page - Service Catalogue + Hero
 * Fully mocked (no backend). Just static categories.
 * Edit services array to add/remove categories.
 */

import { Link } from 'react-router-dom'

const services = [
  { id: 'plumbing', name: 'Plumbing', icon: '🔧', desc: 'Leaks, pipes, fittings', workers: 12 },
  { id: 'electrical', name: 'Electrical', icon: '⚡', desc: 'Wiring, short circuit', workers: 9 },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹', desc: 'Home & office cleaning', workers: 18 },
  { id: 'carpentry', name: 'Carpentry', icon: '🪚', desc: 'Furniture & repairs', workers: 7 },
  { id: 'painting', name: 'Painting', icon: '🎨', desc: 'Interior & exterior', workers: 5 },
  { id: 'appliance', name: 'Appliance Repair', icon: '🔌', desc: 'AC, fridge, washing', workers: 6 },
]

export default function Home({ user }) {
  return (
    <>
      <section className="hero">
        <div>
          <h1>Local services, <br/>owned by workers.</h1>
          <p>Verified co-op workers in your neighbourhood. Fair pay, no commission. Book in 30 seconds — just like Urban Company but community-owned.</p>
          <div style={{display:'flex', gap:12}}>
            <Link to="/book" className="btn btn-accent">Book a service</Link>
            <Link to="/workers" className="btn btn-outline" style={{background:'#fff'}}>Browse workers</Link>
          </div>
          <div className="hero-stats">
            <div><strong>150+</strong> Verified workers</div>
            <div><strong>1.2k</strong> Jobs done</div>
            <div><strong>4.8★</strong> Avg rating</div>
          </div>
        </div>
        <div style={{background:'#fff', borderRadius:12, padding:16, color:'#111827'}}>
          <h4 style={{marginBottom:8}}>How it works (MVP Loop)</h4>
          <ol style={{fontSize:13, color:'#4b5563', paddingLeft:18, lineHeight:2}}>
            <li>Worker registers → co-op verifies</li>
            <li>Customer books service</li>
            <li>Platform matches by skill + location</li>
            <li>Worker accepts → completes</li>
            <li>Customer rates → trust builds</li>
          </ol>
          {user ? <p style={{marginTop:12, fontSize:13, background:'#f0fdf4', padding:8, borderRadius:8}}>👋 Welcome {user.name} ({user.role}) — try booking a service!</p> : <p style={{marginTop:12, fontSize:13, background:'#fef3c7', padding:8, borderRadius:8}}>Demo login: demo@colabour.com / demo123</p>}
        </div>
      </section>

      <h2 style={{margin:'12px 0'}}>Service catalogue</h2>
      <p style={{color:'#6b7280', fontSize:14, marginBottom:14}}>Pick a service — this list drives matching later. Edit in Home.jsx:20</p>
      <div className="grid">
        {services.map(s => (
          <Link key={s.id} to="/book" className="card" style={{cursor:'pointer'}}>
            <div style={{fontSize:28}}>{s.icon}</div>
            <h3>{s.name}</h3>
            <p>{s.desc}</p>
            <span style={{fontSize:12, color:'#6b7280', marginTop:8, display:'block'}}>{s.workers} verified workers nearby</span>
          </Link>
        ))}
      </div>

      <div className="card" style={{marginTop:20, background:'#111827', color:'#fff'}}>
        <h3>For Co-operative Admin</h3>
        <p style={{color:'#cbd5e1'}}>Lakshmi’s view: verify workers, see ratings, manage welfare fund. Admin dashboard is mocked at <Link to="/dashboard" style={{color:'#f97316', textDecoration:'underline'}}>Dashboard →</Link></p>
      </div>
    </>
  )
}
