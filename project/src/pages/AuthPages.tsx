import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Wrench, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { GlowOrb, FloatingShape } from '@/components/ui/Shared';
import { supabase, CATEGORIES } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';

export function SignupPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [role, setRole] = useState<'customer' | 'worker'>('customer');
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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Registration failed');

      if (role === 'worker') {
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_worker_profile', {
          p_name: name,
          p_email: email,
          p_phone: phone,
          p_bio: bio,
          p_category: category,
          p_skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
          p_upi_id: upiId,
          p_hourly_rate: parseFloat(hourlyRate) || 0,
          p_location: location,
        });

        if (rpcError) throw rpcError;
        await refreshProfile();
        navigate('/worker/dashboard');
      } else {
        const { error: rpcError } = await supabase.rpc('create_customer_profile', {
          p_name: name,
          p_email: email,
          p_phone: phone,
        });

        if (rpcError) throw rpcError;
        await refreshProfile();
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
    <div className="relative min-h-screen overflow-hidden pt-24 pb-12 atmosphere">
      <FloatingShape className="top-20 -left-20 h-[400px] w-[400px] animate-drift-slow" color="neon-cyan" />
      <FloatingShape className="bottom-0 -right-20 h-[350px] w-[350px] animate-drift" color="neon-purple" delay={2} />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 relative z-10">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl font-bold gradient-text">Join CoLabour</h1>
          <p className="mt-2 text-muted">Create your account and start your journey</p>
        </div>

        <GlassCard className="p-7 animate-slide-up">
          <div className="mb-5">
            <label className="mb-2.5 block text-sm font-medium text-muted-light">I want to join as a</label>
            <div className="grid grid-cols-2 gap-2.5">
              <RoleButton active={role === 'customer'} onClick={() => setRole('customer')} icon={User} label="Customer" desc="Hire workers" />
              <RoleButton active={role === 'worker'} onClick={() => setRole('worker')} icon={Wrench} label="Worker" desc="Offer services" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Full Name" required>
                <input value={name} onChange={(e) => setName(e.target.value)} required className="input-field" placeholder="John Doe" />
              </Field>
              <Field label="Phone" required>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} required className="input-field" placeholder="+91 98765 43210" />
              </Field>
            </div>

            <Field label="Email" required>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" placeholder="you@example.com" />
            </Field>

            <Field label="Password" required>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" placeholder="Min 6 characters" />
            </Field>

            {role === 'worker' && (
              <div className="space-y-3.5 border-t border-white/[0.04] pt-4 animate-fade-in">
                <h3 className="text-sm font-semibold text-brass text-shadow-neon">Worker Profile Details</h3>

                <Field label="Category" required>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                    {CATEGORIES.map((cat) => {
                      const Icon = CATEGORY_ICONS[cat] ?? User;
                      const style = getCategoryStyle(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`flex flex-col items-center gap-0.5 rounded-xl border p-1.5 text-[10px] transition-all duration-300 ${category === cat ? `${style.bg} ${style.border} shadow-lg` : 'border-white/[0.04] hover:border-white/10'}`}
                        >
                          <Icon size={14} className={category === cat ? style.text : 'text-muted-dark'} />
                          <span className={category === cat ? style.text : 'text-muted-dark'}>{cat.slice(0, 6)}</span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="UPI ID" required>
                  <input value={upiId} onChange={(e) => setUpiId(e.target.value)} required className="input-field" placeholder="yourname@upi" />
                </Field>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Field label="Hourly Rate (₹)">
                    <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="input-field" placeholder="350" min="0" />
                  </Field>
                  <Field label="Location">
                    <input value={location} onChange={(e) => setLocation(e.target.value)} className="input-field" placeholder="Mumbai, Maharashtra" />
                  </Field>
                </div>

                <Field label="Skills (comma-separated)">
                  <input value={skills} onChange={(e) => setSkills(e.target.value)} className="input-field" placeholder="Wiring, Repair, Installation" />
                </Field>

                <Field label="Bio">
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field min-h-[72px] resize-none" placeholder="Tell customers about your experience..." />
                </Field>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-3.5 py-2.5 text-sm text-red-400">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <NeonButton type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : <>Create Account <ArrowRight size={16} /></>}
            </NeonButton>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-brass hover:underline text-shadow-neon">Sign in</Link>
          </p>
        </GlassCard>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.04);
          background: rgba(5,5,8,0.8);
          padding: 0.5rem 0.75rem;
          color: #c4c4d4;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .input-field:focus {
          border-color: rgba(0,240,255,0.3);
          box-shadow: 0 0 0 3px rgba(0,240,255,0.06), 0 0 20px rgba(0,240,255,0.05);
        }
        .input-field::placeholder { color: #5a5a70; }
      `}</style>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function getFriendlyError(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes('invalid login credentials') || lower.includes('invalid email or password')) {
      return 'Invalid email or password. Please try again.';
    }
    if (lower.includes('email not confirmed')) {
      return 'Please confirm your email before signing in.';
    }
    if (lower.includes('too many requests')) {
      return 'Too many login attempts. Please wait a moment and try again.';
    }
    if (lower.includes('network') || lower.includes('fetch')) {
      return 'Network error. Check your internet connection.';
    }
    return msg || 'Login failed. Please try again.';
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (!data.user) throw new Error('Login failed');

      await refreshProfile();

      const { data: userData } = await supabase.from('users').select('role').eq('id', data.user.id).maybeSingle();
      const userRole = userData?.role;
      if (userRole === 'worker') navigate('/worker/dashboard');
      else if (userRole === 'admin') navigate('/admin');
      else navigate('/customer/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(getFriendlyError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden pt-24 pb-12 flex items-center atmosphere">
      <FloatingShape className="top-20 -right-20 h-[400px] w-[400px] animate-drift-slow" color="neon-purple" />
      <FloatingShape className="bottom-0 -left-20 h-[350px] w-[350px] animate-drift" color="neon-cyan" delay={1} />

      <div className="mx-auto max-w-md w-full px-4 sm:px-6 relative z-10">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl font-bold gradient-text">Welcome Back</h1>
          <p className="mt-2 text-muted">Sign in to your CoLabour account</p>
        </div>

        <GlassCard className="p-7 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Field label="Email" required>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" placeholder="you@example.com" />
            </Field>
            <Field label="Password" required>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field pr-9"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-dark hover:text-brass transition-colors duration-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <div className="flex justify-end">
              <Link to="/signup" className="text-xs text-muted-dark hover:text-brass transition-colors duration-300">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-3.5 py-2.5 text-sm text-red-400">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <NeonButton type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={16} /></>}
            </NeonButton>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brass hover:underline text-shadow-neon">Sign up</Link>
          </p>
        </GlassCard>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.04);
          background: rgba(5,5,8,0.8);
          padding: 0.5rem 0.75rem;
          color: #c4c4d4;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .input-field:focus {
          border-color: rgba(0,240,255,0.3);
          box-shadow: 0 0 0 3px rgba(0,240,255,0.06), 0 0 20px rgba(0,240,255,0.05);
        }
        .input-field::placeholder { color: #5a5a70; }
      `}</style>
    </div>
  );
}

function RoleButton({ active, onClick, icon: Icon, label, desc }: { active: boolean; onClick: () => void; icon: typeof User; label: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-xl border p-3 transition-all duration-300 ${active ? 'border-brass/25 bg-brass/[0.06] shadow-brass' : 'border-white/[0.04] hover:border-white/10'}`}
    >
      <div className={`rounded-lg p-1.5 ${active ? 'bg-brass/10' : 'bg-white/[0.03]'}`}>
        <Icon size={16} className={active ? 'text-brass' : 'text-muted-dark'} />
      </div>
      <div className="text-left">
        <p className={`text-sm font-semibold ${active ? 'text-white' : 'text-muted-light'}`}>{label}</p>
        <p className="text-[11px] text-muted-dark">{desc}</p>
      </div>
    </button>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-muted-light">
        {label} {required && <span className="text-brass">*</span>}
      </label>
      {children}
    </div>
  );
}
