import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Handshake, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NeonButton } from '@/components/ui/NeonButton';

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const dashboardLink = user?.role === 'worker' ? '/worker/dashboard' : user?.role === 'admin' ? '/admin' : '/customer/dashboard';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/[0.04]">
      <div className="absolute inset-0 bg-gradient-to-r from-brass/[0.02] via-transparent to-sage/[0.02] pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between relative z-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brass/10 border border-brass/15 group-hover:bg-brass/15 transition-colors duration-300">
              <Handshake size={14} className="text-brass" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-display">
              Co<span className="text-brass">Labour</span>
            </span>
            <span className="hidden sm:inline-flex ml-1 rounded-full bg-brass/10 border border-brass/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brass/70">Co-op</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavLink to="/" active={isActive('/')}>Home</NavLink>
            <NavLink to="/workers" active={isActive('/workers')}>Find Workers</NavLink>
            {user && <NavLink to={dashboardLink} active={isActive(dashboardLink)}>Dashboard</NavLink>}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link to={dashboardLink} className="flex items-center gap-2 rounded-xl glass px-3.5 py-1.5 text-sm hover:border-brass/20 transition-all duration-300">
                  <LayoutDashboard size={14} className="text-brass" />
                  <span className="text-muted-light">{user.role === 'worker' ? 'Worker Hub' : user.role === 'admin' ? 'Admin' : 'My Dashboard'}</span>
                </Link>
                <button onClick={handleSignOut} className="rounded-xl p-2 text-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-300" title="Sign out">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login"><NeonButton variant="ghost" size="sm">Sign In</NeonButton></Link>
                <Link to="/signup"><NeonButton size="sm">Join the Co-op</NeonButton></Link>
              </>
            )}
          </div>

          <button className="md:hidden rounded-xl p-2 text-muted-light" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-white/[0.04] px-4 py-3 space-y-1 animate-fade-in">
          <MobileLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
          <MobileLink to="/workers" onClick={() => setMobileOpen(false)}>Find Workers</MobileLink>
          {user && <MobileLink to={dashboardLink} onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>}
          {user ? (
            <button onClick={() => { setMobileOpen(false); handleSignOut(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10">
              <LogOut size={16} /> Sign Out
            </button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}><NeonButton variant="ghost" fullWidth>Sign In</NeonButton></Link>
              <Link to="/signup" className="flex-1" onClick={() => setMobileOpen(false)}><NeonButton fullWidth>Join the Co-op</NeonButton></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link to={to} className={`relative px-3 py-1.5 text-sm font-medium transition-all duration-300 rounded-xl ${active ? 'text-brass bg-brass/10 shadow-[0_0_15px_rgba(197,160,89,0.08)]' : 'text-muted hover:text-muted-light hover:bg-white/[0.04]'}`}>
      {children}
    </Link>
  );
}

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link to={to} onClick={onClick} className="block rounded-xl px-3 py-2.5 text-sm text-muted-light hover:bg-white/[0.04] hover:text-brass transition-all duration-300">
      {children}
    </Link>
  );
}
