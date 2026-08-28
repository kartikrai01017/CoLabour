import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Zap, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-nb-surface border-b-[3px] border-nb-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-nb-accent-yellow border-[2px] border-nb-ink rounded-nb-md p-1.5 shadow-nb-sm group-hover:shadow-nb-md transition-all">
              <Zap className="h-5 w-5 text-nb-ink" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-nb-ink">
              Co<span className="text-nb-accent-orange">Labour</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavLink to="/" active={isActive('/')}>Home</NavLink>
            <NavLink to="/workers" active={isActive('/workers')}>Workers</NavLink>
            {user && <NavLink to={dashboardLink} active={isActive(dashboardLink)}>Dashboard</NavLink>}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link to={dashboardLink} className="flex items-center gap-2 border-[2px] border-nb-ink rounded-nb-md px-4 py-2 text-xs font-semibold bg-nb-surface hover:bg-nb-surface-muted transition-all shadow-nb-sm hover:shadow-nb-md active:shadow-nb-pressed active:translate-x-[3px] active:translate-y-[3px]">
                  <LayoutDashboard size={14} className="text-nb-ink" />
                  <span className="text-nb-ink">{user.role === 'worker' ? 'Worker' : user.role === 'admin' ? 'Admin' : 'My Dashboard'}</span>
                </Link>
                <button onClick={handleSignOut} className="rounded-nb-md border-[2px] border-nb-ink p-2 text-nb-text-muted hover:text-nb-accent-red hover:bg-nb-accent-red/10 transition-all shadow-nb-sm hover:shadow-nb-md" title="Sign out">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login"><NeonButton variant="ghost" size="sm">Sign In</NeonButton></Link>
                <Link to="/signup"><NeonButton variant="amber" size="sm">Join CoLabour</NeonButton></Link>
              </>
            )}
          </div>

          <button className="md:hidden rounded-nb-md border-[2px] border-nb-ink p-2 text-nb-ink shadow-nb-sm" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-nb-surface border-t-[2px] border-nb-ink px-4 py-4 space-y-2 animate-fade-in shadow-nb-lg">
          <MobileLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
          <MobileLink to="/workers" onClick={() => setMobileOpen(false)}>Workers</MobileLink>
          {user && <MobileLink to={dashboardLink} onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>}
          {user ? (
            <button onClick={() => { setMobileOpen(false); handleSignOut(); }} className="flex w-full items-center gap-2 rounded-nb-md border-[2px] border-nb-ink px-4 py-3 text-nb-accent-red font-semibold shadow-nb-sm">
              <LogOut size={16} /> Sign Out
            </button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}><NeonButton variant="ghost" fullWidth>Sign In</NeonButton></Link>
              <Link to="/signup" className="flex-1" onClick={() => setMobileOpen(false)}><NeonButton variant="amber" fullWidth>Join CoLabour</NeonButton></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link to={to} className={`relative px-4 py-2 text-sm font-semibold transition-colors ${active ? 'text-nb-accent-orange' : 'text-nb-text-muted hover:text-nb-ink'}`}>
      {children}
      {active && <span className="absolute bottom-0 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-nb-sm bg-nb-ink" />}
    </Link>
  );
}

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link to={to} onClick={onClick} className="block rounded-nb-md border-[2px] border-transparent px-4 py-3 font-semibold text-nb-ink hover:border-nb-ink hover:bg-nb-surface-muted hover:shadow-nb-sm transition-all">
      {children}
    </Link>
  );
}