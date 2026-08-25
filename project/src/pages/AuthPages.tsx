import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Wrench, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { GlowOrb } from '@/components/ui/Shared';
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
    <div className="relative min-h-screen overflow-hidden pt-24 pb-12">
      <GlowOrb className="top-20 -left-20 h-96 w-96 bg-neon-emerald/15" />
      <GlowOrb className="bottom-0 right-0 h-80 w-80 bg-neon-cyan/10" />

      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text-emerald-cyan">Join CoLabour</h1>
          <p className="mt-2 text-gray-400">Create your account and start your journey</p>
        </div>

        <GlassCard className="p-8 animate-slide-up">
          {/* Role toggle */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-gray-300">I want to join as a</label>
            <div className="grid grid-cols-2 gap-3">
              <RoleButton active={role === 'customer'} onClick={() => setRole('customer')} icon={User} label="Customer" desc="Hire workers" />
              <RoleButton active={role === 'worker'} onClick={() => setRole('worker')} icon={Wrench} label="Worker" desc="Offer services" />
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

            <Field label="Email" required>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" placeholder="you@example.com" />
            </Field>

            <Field label="Password" required>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" placeholder="Min 6 characters" />
            </Field>

            {role === 'worker' && (
              <div className="space-y-4 border-t border-white/5 pt-4 animate-fade-in">
                <h3 className="text-sm font-semibold text-neon-cyanGlow">Worker Profile Details</h3>

                <Field label="Category" required>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {CATEGORIES.map((cat) => {
                      const Icon = CATEGORY_ICONS[cat] ?? User;
                      const style = getCategoryStyle(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs transition-all ${category === cat ? `${style.bg} ${style.border} ${style.glow}` : 'border-white/10 hover:border-white/20'}`}
                        >
                          <Icon size={18} className={category === cat ? style.text : 'text-gray-500'} />
                          <span className={category === cat ? style.text : 'text-gray-500'}>{cat.slice(0, 6)}</span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="UPI ID" required>
                  <input value={upiId} onChange={(e) => setUpiId(e.target.value)} required className="input-field" placeholder="yourname@upi" />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
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
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field min-h-[80px] resize-none" placeholder="Tell customers about your experience..." />
                </Field>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <NeonButton type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : <>Create Account <ArrowRight size={18} /></>}
            </NeonButton>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-neon-emeraldGlow hover:underline">Sign in</Link>
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
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (!data.user) throw new Error('Login failed');

      await refreshProfile();

      // Route based on role
      const { data: userData } = await supabase.from('users').select('role').eq('id', data.user.id).maybeSingle();
      const userRole = userData?.role;
      if (userRole === 'worker') navigate('/worker/dashboard');
      else if (userRole === 'admin') navigate('/admin');
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
          <p className="mt-2 text-gray-400">Sign in to your CoLabour account</p>
        </div>

        <GlassCard className="p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email" required>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" placeholder="you@example.com" />
            </Field>
            <Field label="Password" required>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" placeholder="Your password" />
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
            <Link to="/signup" className="text-neon-emeraldGlow hover:underline">Sign up</Link>
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

function RoleButton({ active, onClick, icon: Icon, label, desc }: { active: boolean; onClick: () => void; icon: typeof User; label: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${active ? 'border-neon-emerald/40 bg-neon-emerald/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-white/10 hover:border-white/20'}`}
    >
      <div className={`rounded-lg p-2 ${active ? 'bg-neon-emerald/20' : 'bg-white/5'}`}>
        <Icon size={20} className={active ? 'text-neon-emeraldGlow' : 'text-gray-400'} />
      </div>
      <div className="text-left">
        <p className={`font-semibold ${active ? 'text-white' : 'text-gray-300'}`}>{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
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
