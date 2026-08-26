import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wrench, User as UserIcon, Shield, LogOut, ChevronUp, ChevronDown,
  Sparkles, Check, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function QuickRoleSwitcher() {
  const { user, loginAsDemo, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoleFeedback, setActiveRoleFeedback] = useState<string | null>(null);

  const handleSwitch = (role: 'worker' | 'customer' | 'admin') => {
    loginAsDemo(role);
    setActiveRoleFeedback(role);
    setTimeout(() => setActiveRoleFeedback(null), 1500);

    if (role === 'worker') {
      navigate('/worker/dashboard');
    } else if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/customer/dashboard');
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="mb-2 w-80 rounded-2xl border border-white/15 bg-base-900/95 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-neon-cyan animate-ping" />
                <span className="text-xs font-mono font-bold tracking-wider text-neon-cyan uppercase">
                  Dev Role Switcher
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">1-Click Fast Auth</span>
            </div>

            {/* Active User Status */}
            {user ? (
              <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Logged in as:</span>
                  <span className="font-bold uppercase text-neon-emerald flex items-center gap-1">
                    {user.role === 'worker' && <Wrench size={12} />}
                    {user.role === 'customer' && <UserIcon size={12} />}
                    {user.role === 'admin' && <Shield size={12} />}
                    {user.role}
                  </span>
                </div>
                <p className="mt-1 font-mono text-gray-300 truncate">{user.name} ({user.email})</p>
              </div>
            ) : (
              <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-300">
                Currently browsing as <span className="font-bold">Guest</span>
              </div>
            )}

            {/* 1-Click Role Switch Buttons */}
            <div className="space-y-2 mb-3">
              <button
                type="button"
                onClick={() => handleSwitch('worker')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs font-medium ${
                  user?.role === 'worker'
                    ? 'border-neon-cyan/50 bg-neon-cyan/15 text-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'border-white/10 bg-base-800/80 text-gray-300 hover:border-neon-cyan/30 hover:bg-neon-cyan/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-neon-cyan/20 p-1.5 text-neon-cyan">
                    <Wrench size={14} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Login as Worker</p>
                    <p className="text-[10px] text-gray-400">Rajesh Kumar (Electrician)</p>
                  </div>
                </div>
                {user?.role === 'worker' ? <Check size={14} className="text-neon-cyan" /> : <ArrowRight size={14} className="text-gray-500" />}
              </button>

              <button
                type="button"
                onClick={() => handleSwitch('customer')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs font-medium ${
                  user?.role === 'customer'
                    ? 'border-neon-emerald/50 bg-neon-emerald/15 text-neon-emerald shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'border-white/10 bg-base-800/80 text-gray-300 hover:border-neon-emerald/30 hover:bg-neon-emerald/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-neon-emerald/20 p-1.5 text-neon-emerald">
                    <UserIcon size={14} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Login as Customer</p>
                    <p className="text-[10px] text-gray-400">Aditi Rao (Client)</p>
                  </div>
                </div>
                {user?.role === 'customer' ? <Check size={14} className="text-neon-emerald" /> : <ArrowRight size={14} className="text-gray-500" />}
              </button>

              <button
                type="button"
                onClick={() => handleSwitch('admin')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs font-medium ${
                  user?.role === 'admin'
                    ? 'border-neon-violet/50 bg-neon-violet/15 text-neon-violet shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                    : 'border-white/10 bg-base-800/80 text-gray-300 hover:border-neon-violet/30 hover:bg-neon-violet/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-neon-violet/20 p-1.5 text-neon-violet">
                    <Shield size={14} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Login as Admin</p>
                    <p className="text-[10px] text-gray-400">Platform Superuser</p>
                  </div>
                </div>
                {user?.role === 'admin' ? <Check size={14} className="text-neon-violet" /> : <ArrowRight size={14} className="text-gray-500" />}
              </button>
            </div>

            {/* Quick Actions */}
            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all"
              >
                <LogOut size={13} /> Sign Out / Clear Session
              </button>
            )}

            {activeRoleFeedback && (
              <div className="mt-2 text-center text-[10px] text-neon-emerald font-mono animate-pulse">
                Switched to {activeRoleFeedback.toUpperCase()} session!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pill Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-base-900 via-base-800 to-base-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_25px_rgba(0,0,0,0.6)] hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
      >
        <Sparkles size={14} className="text-neon-cyan animate-pulse" />
        <span className="hidden sm:inline">Role Switcher:</span>
        <span className="font-bold text-neon-emerald capitalize">
          {user ? user.role : 'Guest'}
        </span>
        {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronUp size={14} className="text-gray-400" />}
      </motion.button>
    </div>
  );
}
