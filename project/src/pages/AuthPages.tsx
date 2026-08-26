import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon, Wrench, Shield, ArrowRight, AlertCircle, Loader2,
  Eye, EyeOff, Sparkles, CheckCircle2
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { GlowOrb } from '@/components/ui/Shared';
import { CATEGORIES } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export function SignupPage() {
  const navigate = useNavigate();
  const { signUp, loginAsDemo } = useAuth();
  const [role, setRole] = useState<'customer' | 'worker' | 'admin'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<string>('Electrician');
  const [upiId, setUpiId] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickFill = (targetRole: 'customer' | 'worker' | 'admin') => {
    if (targetRole === 'worker') {
      setRole('worker');
      setName('Rajesh Kumar');
      setEmail('worker@colabour.com');
      setPhone('+91 98765 43210');
      setPassword('worker1234');
      setCategory('Electrician');
      setUpiId('rajesh.kumar@okhdfcbank');
      setHourlyRate('450');
      setLocation('Indiranagar, Bangalore');
      setBio('Certified master electrician with 8+ years experience.');
      setSkills('Wiring, Inverter Setup, MCB, Appliance Repair');
    } else if (targetRole === 'admin') {
      setRole('admin');
      setName('CoLabour Admin');
      setEmail('admin@colabour.com');
      setPhone('+91 99999 00000');
      setPassword('admin1234');
    } else {
      setRole('customer');
      setName('Aditi Rao');
      setEmail('customer@colabour.com');
      setPhone('+91 98765 12340');
      setPassword('customer1234');
    }
  };

  const handleInstantDemo = (targetRole: 'customer' | 'worker' | 'admin') => {
    loginAsDemo(targetRole);
    if (targetRole === 'worker') navigate('/worker/dashboard');
    else if (targetRole === 'admin') navigate('/admin');
    else navigate('/customer/dashboard');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (role === 'worker' && !upiId) {
      setError('UPI ID is required for workers');
      return;
    }

    setLoading(true);

    try {
      const user = await signUp({
        role: role === 'admin' ? 'customer' : role, // normal signup
        name,
        email,
        password,
        phone,
        category,
        upi_id: upiId,
        hourly_rate: parseFloat(hourlyRate) || 0,
        location,
        bio,
        skills,
      });

      if (user.role === 'worker') {
        navigate('/worker/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      if (msg.includes('already') || msg.includes('registered')) {
        setError('An account with this email already exists. Try signing in.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden pt-24 pb-12">
      <GlowOrb className="top-20 -left-20 h-96 w-96 bg-neon-emerald/15" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-cyan/10" />

      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text-emerald-cyan">Join CoLabour</h1>
          <p className="mt-2 text-gray-400">Create your account and start your journey</p>
        </div>

        <GlassCard className="p-8 animate-slide-up">
          {/* Quick Demo Accounts Card */}
          <div className="mb-6 rounded-2xl border border-neon-cyan/30 bg-neon-cyan/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-neon-cyan uppercase tracking-wider">
                <Sparkles size={14} /> Quick Demo Accounts & Autofill
              </div>
              <span className="text-[10px] text-gray-400">1-Click Setup</span>
            </div>
            <p className="text-xs text-gray-300 mb-3">
              Click a preset below to autofill or bypass manual registration:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('worker')}
                className="rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 p-2 text-xs font-semibold text-neon-cyan hover:bg-neon-cyan/20 transition-all flex flex-col items-center gap-1"
              >
                <Wrench size={16} /> Fill Worker
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('customer')}
                className="rounded-xl border border-neon-emerald/30 bg-neon-emerald/10 p-2 text-xs font-semibold text-neon-emerald hover:bg-neon-emerald/20 transition-all flex flex-col items-center gap-1"
              >
                <UserIcon size={16} /> Fill Customer
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemo('admin')}
                className="rounded-xl border border-neon-violet/30 bg-neon-violet/10 p-2 text-xs font-semibold text-neon-violet hover:bg-neon-violet/20 transition-all flex flex-col items-center gap-1"
              >
                <Shield size={16} /> Instant Admin
              </button>
            </div>
          </div>

          {/* Role selection cards */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-gray-300">Choose your account role</label>
            <div className="grid grid-cols-3 gap-3">
              <RoleButton
                active={role === 'customer'}
                onClick={() => setRole('customer')}
                icon={UserIcon}
                label="Customer"
                desc="Hire & Pay"
              />
              <RoleButton
                active={role === 'worker'}
                onClick={() => setRole('worker')}
                icon={Wrench}
                label="Worker"
                desc="Offer & Earn"
              />
              <RoleButton
                active={role === 'admin'}
                onClick={() => setRole('admin')}
                icon={Shield}
                label="Admin"
                desc="Platform Ops"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" required>
                <input value={name} onChange={(e) => setName(e.target.value)} required className="input-field" placeholder="John Doe" />
              </Field>
              <Field label="Phone" required>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} required className="input-field" placeholder="+91 98765 43210" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email Address" required>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" placeholder="you@example.com" />
              </Field>
              <Field label="Password" required>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" placeholder="At least 6 characters" minLength={6} />
              </Field>
            </div>

            {role === 'worker' && (
              <div className="space-y-4 border-t border-white/10 pt-4 animate-fade-in">
                <h3 className="text-sm font-semibold text-neon-emerald flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Professional Worker Profile Setup
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Category / Skill" required>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-base-900 text-white">{cat}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="UPI ID (for instant direct payments)" required>
                    <input value={upiId} onChange={(e) => setUpiId(e.target.value)} required className="input-field" placeholder="rajesh.kumar@upi" />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Hourly Rate (₹)" required>
                    <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} required className="input-field" placeholder="450" />
                  </Field>
                  <Field label="Operating Location" required>
                    <input value={location} onChange={(e) => setLocation(e.target.value)} required className="input-field" placeholder="Indiranagar, Bangalore" />
                  </Field>
                </div>

                <Field label="Bio / Experience Summary">
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field min-h-[80px] resize-none" placeholder="10+ years experience in domestic and commercial electrical wiring..." />
                </Field>

                <Field label="Skills (comma separated)">
                  <input value={skills} onChange={(e) => setSkills(e.target.value)} className="input-field" placeholder="Wiring, MCB, Inverter Repair, Appliance Setup" />
                </Field>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <NeonButton type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating Account...</> : <>Create Account <ArrowRight size={18} /></>}
            </NeonButton>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-neon-emerald hover:underline">Sign in</Link>
          </p>
        </GlassCard>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(11,15,25,0.6);
          padding: 0.625rem 1rem;
          color: #e5e7eb;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: rgba(16,185,129,0.4);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .input-field::placeholder { color: #6b7280; }
      `}</style>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginAsDemo } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'customer' | 'worker' | 'admin'>('customer');
  const [email, setEmail] = useState('customer@colabour.com');
  const [password, setPassword] = useState('customer1234');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: 'customer' | 'worker' | 'admin') => {
    setSelectedRole(role);
    if (role === 'worker') {
      setEmail('worker@colabour.com');
      setPassword('worker1234');
    } else if (role === 'admin') {
      setEmail('admin@colabour.com');
      setPassword('admin1234');
    } else {
      setEmail('customer@colabour.com');
      setPassword('customer1234');
    }
  };

  const handleDemoInstantLogin = async (role: 'customer' | 'worker' | 'admin') => {
    setError('');
    setLoading(true);
    try {
      loginAsDemo(role);
      if (role === 'worker') navigate('/worker/dashboard');
      else if (role === 'admin') navigate('/admin');
      else navigate('/customer/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password, selectedRole);
      if (user.role === 'worker') navigate('/worker/dashboard');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/customer/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden pt-24 pb-12 flex items-center">
      <GlowOrb className="top-20 right-0 h-96 w-96 bg-neon-cyan/15" />
      <GlowOrb className="bottom-0 -left-20 h-80 w-80 bg-neon-emerald/10" />

      <div className="mx-auto max-w-md w-full px-4 sm:px-6">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text-emerald-cyan">Welcome Back</h1>
          <p className="mt-2 text-gray-400">Sign in to your CoLabour workspace</p>
        </div>

        <GlassCard className="p-8 animate-slide-up">
          {/* Quick Demo Accounts Card */}
          <div className="mb-6 rounded-2xl border border-neon-cyan/30 bg-neon-cyan/5 p-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neon-cyan uppercase tracking-wider">
                <Sparkles size={14} /> Quick Demo Logins
              </div>
              <span className="text-[10px] text-gray-400 font-mono">Instant Access</span>
            </div>
            <p className="text-xs text-gray-300 mb-3">
              One-click instant authentication without typing credentials:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoInstantLogin('worker')}
                className="rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 py-2 px-1 text-xs font-semibold text-neon-cyan hover:bg-neon-cyan/20 transition-all flex flex-col items-center gap-1"
              >
                <Wrench size={16} />
                <span>Worker</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoInstantLogin('customer')}
                className="rounded-xl border border-neon-emerald/40 bg-neon-emerald/10 py-2 px-1 text-xs font-semibold text-neon-emerald hover:bg-neon-emerald/20 transition-all flex flex-col items-center gap-1"
              >
                <UserIcon size={16} />
                <span>Customer</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoInstantLogin('admin')}
                className="rounded-xl border border-neon-violet/40 bg-neon-violet/10 py-2 px-1 text-xs font-semibold text-neon-violet hover:bg-neon-violet/20 transition-all flex flex-col items-center gap-1"
              >
                <Shield size={16} />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Role selector buttons before signing in */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">
              Sign In Role Type
            </label>
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-base-950/60 p-1">
              <button
                type="button"
                onClick={() => handleRoleSelect('customer')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  selectedRole === 'customer'
                    ? 'bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <UserIcon size={13} /> Customer
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('worker')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  selectedRole === 'worker'
                    ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Wrench size={13} /> Worker
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  selectedRole === 'admin'
                    ? 'bg-neon-violet/20 text-neon-violet border border-neon-violet/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shield size={13} /> Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email Address" required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="you@colabour.com"
              />
            </Field>

            <Field label="Password" required>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field pr-10"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <NeonButton type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={18} /></>}
            </NeonButton>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-neon-emerald hover:underline">Sign up</Link>
          </p>
        </GlassCard>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(11,15,25,0.6);
          padding: 0.625rem 1rem;
          color: #e5e7eb;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: rgba(16,185,129,0.4);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .input-field::placeholder { color: #6b7280; }
      `}</style>
    </div>
  );
}

function RoleButton({
  active,
  onClick,
  icon: Icon,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof UserIcon;
  label: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center text-center rounded-xl border p-3 transition-all ${
        active
          ? 'border-neon-emerald/50 bg-neon-emerald/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
          : 'border-white/10 hover:border-white/20 bg-white/5'
      }`}
    >
      <div className={`rounded-lg p-2 mb-1.5 ${active ? 'bg-neon-emerald/20' : 'bg-white/5'}`}>
        <Icon size={20} className={active ? 'text-neon-emerald' : 'text-gray-400'} />
      </div>
      <p className={`text-xs font-bold ${active ? 'text-white' : 'text-gray-300'}`}>{label}</p>
      <p className="text-[10px] text-gray-500">{desc}</p>
    </button>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-300">
        {label} {required && <span className="text-neon-emerald">*</span>}
      </label>
      {children}
    </div>
  );
}
