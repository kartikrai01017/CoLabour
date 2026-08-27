import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Menu, X, LogOut, LayoutDashboard, Briefcase, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b-2 border-black transition-all">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-[#F59E0B] shadow-[2px_2px_0px_#000000] group-hover:rotate-6 transition-transform">
              <Zap className="h-5 w-5 text-black fill-black" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 uppercase">
              Co<span className="text-[#F59E0B]">Labour</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-2 md:flex">
            <NavLink to="/" active={isActive('/')}>Home</NavLink>
            <NavLink to="/workers" active={isActive('/workers')}>Find Workers</NavLink>
            {user && <NavLink to={dashboardLink} active={isActive(dashboardLink)}>Dashboard</NavLink>}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to={dashboardLink}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3.5 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-neutral-50 transition-all cursor-pointer"
                  >
                    <LayoutDashboard size={14} className="text-[#F59E0B]" />
                    <span>{user.role === 'worker' ? 'Worker Pro' : user.role === 'admin' ? 'Admin Portal' : 'My Dashboard'}</span>
                  </motion.div>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-xl border-2 border-black bg-[#FEE2E2] p-1.5 text-red-700 hover:bg-[#FECACA] shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    className="rounded-xl border-2 border-black bg-white hover:bg-neutral-100 px-3.5 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    className="rounded-xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] px-4 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="md:hidden rounded-xl border-2 border-black bg-white p-2 text-black shadow-[2px_2px_0px_#000000]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#FAF7F2] border-t-2 border-black px-4 py-4 space-y-2.5 overflow-hidden"
          >
            <MobileLink to="/" onClick={() => setMobileOpen(false)} active={isActive('/')}>Home</MobileLink>
            <MobileLink to="/workers" onClick={() => setMobileOpen(false)} active={isActive('/workers')}>Find Workers</MobileLink>
            {user && (
              <MobileLink to={dashboardLink} onClick={() => setMobileOpen(false)} active={isActive(dashboardLink)}>
                Dashboard
              </MobileLink>
            )}

            {user ? (
              <button
                type="button"
                onClick={() => { setMobileOpen(false); handleSignOut(); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#FEE2E2] px-4 py-2.5 text-xs font-black uppercase text-red-700 shadow-[2px_2px_0px_#000000]"
              >
                <LogOut size={16} /> Sign Out
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <button type="button" className="w-full rounded-xl border-2 border-black bg-white py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000]">
                    Sign In
                  </button>
                </Link>
                <Link to="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <button type="button" className="w-full rounded-xl border-2 border-black bg-[#F59E0B] py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000]">
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
        active
          ? 'bg-[#F59E0B] text-black border-2 border-black shadow-[2px_2px_0px_#000000]'
          : 'text-neutral-700 hover:text-black hover:bg-neutral-200/60'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileLink({ to, onClick, active, children }: { to: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block rounded-xl border-2 border-black px-4 py-2.5 text-xs font-black uppercase ${
        active ? 'bg-[#F59E0B] text-black shadow-[2px_2px_0px_#000000]' : 'bg-white text-neutral-800'
      }`}
    >
      {children}
    </Link>
  );
}

