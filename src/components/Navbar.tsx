import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Zap, Menu, X, LogOut, LayoutDashboard, Languages } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, type Language } from '@/context/LanguageContext';
import { NeonButton } from '@/components/ui/NeonButton';

export function Navbar() {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
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
            <NavLink to="/" active={isActive('/')}>{t('nav.home')}</NavLink>
            <NavLink to="/workers" active={isActive('/workers')}>{t('nav.workers')}</NavLink>
            {user && <NavLink to={dashboardLink} active={isActive(dashboardLink)}>{t('nav.dashboard')}</NavLink>}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSelector language={language} setLanguage={setLanguage} label={t('language.select')} />
            {user ? (
              <>
                <Link to={dashboardLink} className="flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm hover:border-neon-emerald/30 transition-all">
                  <LayoutDashboard size={16} className="text-neon-cyan" />
                  <span className="text-gray-300">{user.role === 'worker' ? t('nav.worker') : user.role === 'admin' ? t('nav.admin') : t('nav.myDashboard')}</span>
                </Link>
                <button onClick={handleSignOut} className="rounded-xl p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title={t('nav.signOut')}>
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login"><NeonButton variant="ghost" size="sm">{t('nav.signIn')}</NeonButton></Link>
                <Link to="/signup"><NeonButton size="sm">{t('nav.getStarted')}</NeonButton></Link>
              </>
            )}
          </div>

          <button className="md:hidden rounded-lg p-2 text-gray-300" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-white/5 px-4 py-4 space-y-2 animate-fade-in">
          <MobileLink to="/" onClick={() => setMobileOpen(false)}>{t('nav.home')}</MobileLink>
          <MobileLink to="/workers" onClick={() => setMobileOpen(false)}>{t('nav.workers')}</MobileLink>
          {user && <MobileLink to={dashboardLink} onClick={() => setMobileOpen(false)}>{t('nav.dashboard')}</MobileLink>}
          <LanguageSelector language={language} setLanguage={setLanguage} label={t('language.select')} mobile />
          {user ? (
            <button onClick={() => { setMobileOpen(false); handleSignOut(); }} className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-red-400 hover:bg-red-500/10">
              <LogOut size={18} /> {t('nav.signOut')}
            </button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}><NeonButton variant="ghost" fullWidth>{t('nav.signIn')}</NeonButton></Link>
              <Link to="/signup" className="flex-1" onClick={() => setMobileOpen(false)}><NeonButton fullWidth>{t('nav.getStarted')}</NeonButton></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function LanguageSelector({
  language,
  setLanguage,
  label,
  mobile = false,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  label: string;
  mobile?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <label className={`flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-gray-400 ${mobile ? 'w-full' : ''}`}>
      <Languages size={16} className="text-neon-cyan" />
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="w-full cursor-pointer appearance-none bg-transparent text-sm text-gray-300 outline-none"
      >
        <option value="en" className="bg-base-800">{t('language.english')}</option>
        <option value="hi" className="bg-base-800">{t('language.hindi')}</option>
        <option value="mr" className="bg-base-800">{t('language.marathi')}</option>
      </select>
    </label>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link to={to} className={`relative px-4 py-2 text-sm font-medium transition-colors ${active ? 'text-neon-emeraldGlow' : 'text-gray-400 hover:text-gray-200'}`}>
      {children}
      {active && <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-neon-emerald" />}
    </Link>
  );
}

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link to={to} onClick={onClick} className="block rounded-xl px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-neon-emeraldGlow">
      {children}
    </Link>
  );
}
