import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Wrench,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  MapPin,
  IndianRupee,
  Briefcase,
  Check,
  Zap,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [role, setRole] = useState<'customer' | 'worker'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError('Password must be at least 6 characters in length');
      return;
    }
    if (role === 'worker' && !upiId.trim()) {
      setError('UPI ID is required for direct settlement routing');
      return;
    }

    setLoading(true);

    try {
      const user = await signUp({
        role,
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        category,
        upi_id: upiId.trim(),
        hourly_rate: parseFloat(hourlyRate) || 0,
        location: location.trim(),
        bio: bio.trim(),
        skills: skills.trim(),
      });

      if (user.role === 'worker') {
        navigate('/worker/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered')) {
        setError('An account with this email address already exists. Please sign in.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0C0B10] text-gray-100 flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Warm Ambient Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[680px] h-[420px] bg-gradient-to-b from-amber-500/12 via-amber-600/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-amber-500/[0.06] rounded-full blur-[100px]" />
        <div className="absolute bottom-10 -left-32 w-96 h-96 bg-orange-600/[0.05] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent border border-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.2)] group-hover:border-amber-400/50 transition-all">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400/40" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-sans">
              Co<span className="text-amber-400">Labour</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Join the verified gig workforce network with real-time settlement
          </p>
        </div>

        {/* Main Card */}
        <div className="relative rounded-3xl bg-[#15141C]/85 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8),0_0_0_1px_rgba(245,158,11,0.06)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/30 before:to-transparent">
          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="select-role-customer"
                onClick={() => setRole('customer')}
                className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-200 ${
                  role === 'customer'
                    ? 'border-amber-500/50 bg-amber-500/[0.08] shadow-[0_0_24px_rgba(245,158,11,0.12)]'
                    : 'border-white/[0.07] bg-[#100F17]/60 hover:border-white/20 hover:bg-[#100F17]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`p-2 rounded-xl ${
                      role === 'customer'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    <User size={18} />
                  </div>
                  {role === 'customer' && (
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <span className="font-semibold text-sm text-white">Customer</span>
                <span className="text-xs text-gray-400 mt-0.5">Hire & book verified services</span>
              </button>

              <button
                type="button"
                id="select-role-worker"
                onClick={() => setRole('worker')}
                className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-200 ${
                  role === 'worker'
                    ? 'border-amber-500/50 bg-amber-500/[0.08] shadow-[0_0_24px_rgba(245,158,11,0.12)]'
                    : 'border-white/[0.07] bg-[#100F17]/60 hover:border-white/20 hover:bg-[#100F17]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`p-2 rounded-xl ${
                      role === 'worker'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    <Wrench size={18} />
                  </div>
                  {role === 'worker' && (
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <span className="font-semibold text-sm text-white">Worker / Pro</span>
                <span className="text-xs text-gray-400 mt-0.5">Offer skills & get instant payouts</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aditi Rao"
                    className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Phone Number <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 12340"
                    className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Email Address <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aditi@example.com"
                    className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Password <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-10 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Worker-Specific Onboarding Information */}
            {role === 'worker' && (
              <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  <ShieldCheck size={16} /> Professional Verification Details
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Service Category <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20 appearance-none"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="bg-[#15141C] text-white">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Direct UPI ID <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="rajesh.kumar@okhdfcbank"
                        className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Hourly Rate (₹) <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="450"
                      className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Operating City / Location <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Indiranagar, Bangalore"
                        className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Skills Summary (comma separated)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Wiring, Inverter Setup, Appliance Repair, Circuit Breakers"
                    className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Professional Bio
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Master technician with 8+ years experience in domestic and commercial electrical repairs."
                    className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20 resize-none"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300 animate-shake">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              id="signup-submit-button"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-semibold rounded-xl py-3 px-6 text-sm shadow-[0_0_24px_rgba(245,158,11,0.25)] hover:shadow-[0_0_32px_rgba(245,158,11,0.4)] hover:brightness-105 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-black" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.07] text-center">
            <p className="text-xs text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const user = await login(email.trim(), password);
      if (user.role === 'worker') {
        navigate('/worker/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0C0B10] text-gray-100 flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Warm Ambient Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[680px] h-[420px] bg-gradient-to-b from-amber-500/12 via-amber-600/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-amber-500/[0.06] rounded-full blur-[100px]" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 bg-orange-600/[0.05] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent border border-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.2)] group-hover:border-amber-400/50 transition-all">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400/40" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-sans">
              Co<span className="text-amber-400">Labour</span>
            </span>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to access your dashboard and active jobs
          </p>
        </div>

        {/* Login Card */}
        <div className="relative rounded-3xl bg-[#15141C]/85 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8),0_0_0_1px_rgba(245,158,11,0.06)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/30 before:to-transparent">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="email"
                  required
                  id="login-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-10 py-3 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-400 hover:text-gray-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30 w-3.5 h-3.5"
                />
                <span>Remember this device</span>
              </label>

              <span className="text-gray-500 hover:text-gray-400 cursor-default">
                Encrypted Session
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300 animate-shake">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              id="login-submit-button"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-semibold rounded-xl py-3.5 px-6 text-sm shadow-[0_0_24px_rgba(245,158,11,0.25)] hover:shadow-[0_0_32px_rgba(245,158,11,0.4)] hover:brightness-105 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-black" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.07] text-center">
            <p className="text-xs text-gray-400">
              Don't have an account yet?{' '}
              <Link to="/signup" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Enterprise Security Subtext */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-amber-400/70" />
            <span>Protected by end-to-end encrypted session tokens & Supabase RLS</span>
          </p>
        </div>
      </div>
    </div>
  );
}
