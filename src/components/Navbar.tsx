<<<<<<< HEAD
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, Menu, X, LogOut, LayoutDashboard, Sparkles, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export function Navbar() {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
=======
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Zap, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NeonButton } from '@/components/ui/NeonButton';

export function Navbar() {
  const { user, signOut } = useAuth();
>>>>>>> origin/main
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

<<<<<<< HEAD
  const dashboardLink =
    user?.role === 'worker'
      ? '/worker/dashboard'
      : user?.role === 'admin'
      ? '/admin'
      : '/customer/dashboard';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F5]/95 backdrop-blur-md border-b-2 border-stone-900">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Top-Left: Logo Badge + 8px Gap + Compact Neubrutalist Language Switcher */}
          <div className="flex items-center gap-2">
            {/* Logo Badge */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-teal-300 border-2 border-stone-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#1c1917] group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-transform">
                <Zap className="h-5 w-5 text-stone-900" fill="currentColor" />
              </div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-stone-900 flex items-center gap-1">
                Co<span className="bg-teal-300 px-1.5 py-0.5 rounded border border-stone-900 text-xs sm:text-sm">Labour</span>
              </span>
            </Link>

            {/* Language Switcher: Compact Neubrutalist Pill [ EN | हिंदी | मराठी ] */}
            <div
              id="header-language-switcher"
              className="inline-flex items-center gap-1 px-1.5 py-1 rounded-xl bg-white border-2 border-stone-900 shadow-[2px_2px_0px_0px_#1c1917]"
              title="Select Language / भाषा निवडा"
            >
              <Globe size={13} className="text-stone-700 ml-0.5 shrink-0" />
              <div className="flex items-center text-[11px] font-black">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-teal-300 text-stone-900 border border-stone-900'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  EN
                </button>
                <span className="text-stone-300 px-0.5">|</span>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                    language === 'hi'
                      ? 'bg-teal-300 text-stone-900 border border-stone-900'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  हिंदी
                </button>
                <span className="text-stone-300 px-0.5">|</span>
                <button
                  type="button"
                  onClick={() => setLanguage('mr')}
                  className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                    language === 'mr'
                      ? 'bg-teal-300 text-stone-900 border border-stone-900'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  मराठी
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-2 md:flex">
            <NavLink to="/" active={isActive('/')} data-i18n="home">
              {t('home')}
            </NavLink>
            <NavLink to="/workers" active={isActive('/workers')} data-i18n="findWorkers">
              {t('findWorkers')}
            </NavLink>
            {user && (
              <NavLink to={dashboardLink} active={isActive(dashboardLink)} data-i18n="dashboard">
                {t('dashboard')}
              </NavLink>
            )}
          </div>

          {/* User Auth Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link
                  to={dashboardLink}
                  className="flex items-center gap-2 rounded-xl bg-white border-2 border-stone-900 px-3.5 py-1.5 text-xs font-black text-stone-900 shadow-[3px_3px_0px_0px_#1c1917] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  <LayoutDashboard size={15} className="text-stone-900" />
                  <span>
                    {user.role === 'worker'
                      ? t('workerDashboard')
                      : user.role === 'admin'
                      ? t('adminPanel')
                      : t('customerDashboard')}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="rounded-xl border-2 border-stone-900 bg-rose-200 p-2 text-stone-900 font-black shadow-[2px_2px_0px_0px_#1c1917] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                  title="Sign out"
                >
                  <LogOut size={16} />
=======
  const dashboardLink = user?.role === 'worker' ? '/worker/dashboard' : user?.role === 'admin' ? '/admin' : '/customer/dashboard';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Zap className="h-8 w-8 text-neon-emerald transition-transform group-hover:scale-110" fill="currentColor" />
              <div className="absolute inset-0 blur-md text-neon-emerald opacity-50">
                <Zap className="h-8 w-8" fill="currentColor" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Co<span className="gradient-text-emerald-cyan">Laber</span>
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
                <Link to={dashboardLink} className="flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm hover:border-neon-emerald/30 transition-all">
                  <LayoutDashboard size={16} className="text-neon-cyan" />
                  <span className="text-gray-300">{user.role === 'worker' ? 'Worker' : user.role === 'admin' ? 'Admin' : 'My Dashboard'}</span>
                </Link>
                <button onClick={handleSignOut} className="rounded-xl p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Sign out">
                  <LogOut size={18} />
>>>>>>> origin/main
                </button>
              </>
            ) : (
              <>
<<<<<<< HEAD
                <Link to="/login">
                  <button className="px-4 py-2 rounded-xl border-2 border-stone-900 bg-white text-stone-900 font-black text-xs shadow-[3px_3px_0px_0px_#1c1917] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer">
                    {t('signIn')}
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-4 py-2 rounded-xl border-2 border-stone-900 bg-teal-300 text-stone-900 font-black text-xs shadow-[3px_3px_0px_0px_#1c1917] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer">
                    <Sparkles size={14} /> {t('getStarted')}
                  </button>
                </Link>
=======
                <Link to="/login"><NeonButton variant="ghost" size="sm">Sign In</NeonButton></Link>
                <Link to="/signup"><NeonButton size="sm">Get Started</NeonButton></Link>
>>>>>>> origin/main
              </>
            )}
          </div>

<<<<<<< HEAD
          {/* Mobile Menu Button */}
          <button
            className="md:hidden rounded-xl border-2 border-stone-900 bg-white p-2 text-stone-900 font-black shadow-[2px_2px_0px_0px_#1c1917]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
=======
          <button className="md:hidden rounded-lg p-2 text-gray-300" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
>>>>>>> origin/main
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#FAF9F5] border-t-2 border-stone-900 px-4 py-4 space-y-2 shadow-lg">
          <MobileLink to="/" onClick={() => setMobileOpen(false)}>
            {t('home')}
          </MobileLink>
          <MobileLink to="/workers" onClick={() => setMobileOpen(false)}>
            {t('findWorkers')}
          </MobileLink>
          {user && (
            <MobileLink to={dashboardLink} onClick={() => setMobileOpen(false)}>
              {t('dashboard')}
            </MobileLink>
          )}
          {user ? (
            <button
              onClick={() => {
                setMobileOpen(false);
                handleSignOut();
              }}
              className="flex w-full items-center gap-2 rounded-xl border-2 border-stone-900 bg-rose-100 px-4 py-3 text-xs font-black text-rose-950 shadow-[2px_2px_0px_0px_#1c1917]"
            >
              <LogOut size={16} /> {t('signOut')}
            </button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <button className="w-full py-2.5 rounded-xl border-2 border-stone-900 bg-white text-stone-900 font-black text-xs shadow-[2px_2px_0px_0px_#1c1917]">
                  {t('signIn')}
                </button>
              </Link>
              <Link to="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                <button className="w-full py-2.5 rounded-xl border-2 border-stone-900 bg-teal-300 text-stone-900 font-black text-xs shadow-[2px_2px_0px_0px_#1c1917] flex items-center justify-center gap-1">
                  <Sparkles size={14} /> {t('getStarted')}
                </button>
              </Link>
=======
      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-white/5 px-4 py-4 space-y-2 animate-fade-in">
          <MobileLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
          <MobileLink to="/workers" onClick={() => setMobileOpen(false)}>Workers</MobileLink>
          {user && <MobileLink to={dashboardLink} onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>}
          {user ? (
            <button onClick={() => { setMobileOpen(false); handleSignOut(); }} className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-red-400 hover:bg-red-500/10">
              <LogOut size={18} /> Sign Out
            </button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}><NeonButton variant="ghost" fullWidth>Sign In</NeonButton></Link>
              <Link to="/signup" className="flex-1" onClick={() => setMobileOpen(false)}><NeonButton fullWidth>Get Started</NeonButton></Link>
>>>>>>> origin/main
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

<<<<<<< HEAD
function NavLink({
  to,
  children,
  active,
  'data-i18n': dataI18n,
}: {
  to: string;
  children: React.ReactNode;
  active?: boolean;
  'data-i18n'?: string;
}) {
  return (
    <Link
      to={to}
      data-i18n={dataI18n}
      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
        active
          ? 'bg-teal-300 text-stone-900 border-2 border-stone-900 shadow-[2px_2px_0px_0px_#1c1917]'
          : 'text-stone-800 hover:bg-stone-100 hover:text-stone-900'
      }`}
    >
      {children}
=======
function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link to={to} className={`relative px-4 py-2 text-sm font-medium transition-colors ${active ? 'text-neon-emeraldGlow' : 'text-gray-400 hover:text-gray-200'}`}>
      {children}
      {active && <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-neon-emerald" />}
>>>>>>> origin/main
    </Link>
  );
}

<<<<<<< HEAD
function MobileLink({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-xl border-2 border-stone-900 bg-white px-4 py-2.5 text-xs font-black text-stone-900 shadow-[2px_2px_0px_0px_#1c1917]"
    >
=======
function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link to={to} onClick={onClick} className="block rounded-xl px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-neon-emeraldGlow">
>>>>>>> origin/main
      {children}
    </Link>
  );
}
