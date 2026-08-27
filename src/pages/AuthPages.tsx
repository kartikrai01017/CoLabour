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
    <div className="relative min-h-screen bg-[#F6F4EE] text-black flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-400 border-2 border-black shadow-[3px_3px_0px_0px_#000] group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-all">
              <Zap className="w-6 h-6 text-black fill-black" />
            </div>
            <span className="text-3xl font-black tracking-tight text-black font-sans">
              Co<span className="text-emerald-700 underline decoration-black">Labour</span>
            </span>
          </Link>

          <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
            Create your account
          </h1>
          <p className="mt-2 text-sm font-semibold text-gray-700">
            Join the verified gig workforce network with real-time 0% fee settlement
          </p>
        </div>

        {/* Main Card */}
        <div className="relative rounded-2xl bg-white border-2 border-black p-6 sm:p-10 shadow-[6px_6px_0px_0px_#000]">
          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-3">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                id="select-role-customer"
                onClick={() => setRole('customer')}
                className={`relative flex flex-col items-start p-4 rounded-xl border-2 border-black text-left transition-all duration-200 cursor-pointer ${
                  role === 'customer'
                    ? 'bg-amber-200 shadow-[4px_4px_0px_0px_#000]'
                    : 'bg-gray-50 hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`p-2 rounded-lg border-2 border-black ${
                      role === 'customer'
                        ? 'bg-amber-400 text-black'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    <User size={18} />
                  </div>
                  {role === 'customer' && (
                    <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <span className="font-black text-sm text-black">Customer</span>
                <span className="text-xs font-semibold text-gray-700 mt-0.5">Hire & book verified services</span>
              </button>

              <button
                type="button"
                id="select-role-worker"
                onClick={() => setRole('worker')}
                className={`relative flex flex-col items-start p-4 rounded-xl border-2 border-black text-left transition-all duration-200 cursor-pointer ${
                  role === 'worker'
                    ? 'bg-emerald-200 shadow-[4px_4px_0px_0px_#000]'
                    : 'bg-gray-50 hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`p-2 rounded-lg border-2 border-black ${
                      role === 'worker'
                        ? 'bg-emerald-400 text-black'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    <Wrench size={18} />
                  </div>
                  {role === 'worker' && (
                    <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <span className="font-black text-sm text-black">Worker / Pro</span>
                <span className="text-xs font-semibold text-gray-700 mt-0.5">Offer skills & get instant payouts</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Full Name <span className="text-emerald-700 font-black">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aditi Rao"
                    className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Phone Number <span className="text-emerald-700 font-black">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 12340"
                    className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Email Address <span className="text-emerald-700 font-black">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aditi@example.com"
                    className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Password <span className="text-emerald-700 font-black">*</span>
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
                    className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-10 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Worker-Specific Onboarding Information */}
            {role === 'worker' && (
              <div className="mt-4 pt-4 border-t-2 border-black/10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider bg-emerald-100 p-2 rounded-lg border-2 border-black">
                  <ShieldCheck size={16} className="text-emerald-800" /> Professional Verification Details
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Service Category <span className="text-emerald-700 font-black">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white border-2 border-black text-black font-semibold rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Direct UPI ID <span className="text-emerald-700 font-black">*</span>
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="rajesh.kumar@okhdfcbank"
                        className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Hourly Rate (₹) <span className="text-emerald-700 font-black">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="450"
                      className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Operating City / Location <span className="text-emerald-700 font-black">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Indiranagar, Bangalore"
                        className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    Skills Summary (comma separated)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Wiring, Inverter Setup, Appliance Repair, Circuit Breakers"
                    className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    Professional Bio
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Master technician with 8+ years experience in domestic and commercial electrical repairs."
                    className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border-2 border-black bg-red-100 p-3.5 text-xs font-bold text-red-900 shadow-[3px_3px_0px_0px_#000]">
                <AlertCircle size={16} className="text-red-700 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              id="signup-submit-button"
              disabled={loading}
              className="w-full mt-4 bg-emerald-400 border-2 border-black text-black font-black rounded-xl py-3.5 px-6 text-sm shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
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

          <div className="mt-6 pt-6 border-t-2 border-black/10 text-center">
            <p className="text-xs font-bold text-gray-700">
              Already have an account?{' '}
              <Link to="/login" className="font-black text-black underline decoration-emerald-500 hover:text-emerald-800 transition-colors">
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
    <div className="relative min-h-screen bg-[#F6F4EE] text-black flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-400 border-2 border-black shadow-[3px_3px_0px_0px_#000] group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-all">
              <Zap className="w-6 h-6 text-black fill-black" />
            </div>
            <span className="text-3xl font-black tracking-tight text-black font-sans">
              Co<span className="text-emerald-700 underline decoration-black">Labour</span>
            </span>
          </Link>

          <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm font-semibold text-gray-700">
            Sign in to access your dashboard and live workforce ledger
          </p>
        </div>

        {/* Login Card */}
        <div className="relative rounded-2xl bg-white border-2 border-black p-6 sm:p-10 shadow-[6px_6px_0px_0px_#000]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
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
                  className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-800">
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
                  className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-10 py-3 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-800 font-bold">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-2 border-black text-emerald-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Remember this device</span>
              </label>

              <span className="text-gray-600 font-bold">
                🔒 256-Bit Encrypted
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border-2 border-black bg-red-100 p-3.5 text-xs font-bold text-red-900 shadow-[3px_3px_0px_0px_#000]">
                <AlertCircle size={16} className="text-red-700 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              id="login-submit-button"
              disabled={loading}
              className="w-full mt-2 bg-emerald-400 border-2 border-black text-black font-black rounded-xl py-3.5 px-6 text-sm shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
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

          <div className="mt-8 pt-6 border-t-2 border-black/10 text-center">
            <p className="text-xs font-bold text-gray-700">
              Don't have an account yet?{' '}
              <Link to="/signup" className="font-black text-black underline decoration-emerald-500 hover:text-emerald-800 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Enterprise Security Subtext */}
        <div className="mt-8 text-center text-xs font-bold text-gray-600">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-700" />
            <span>Protected by end-to-end encrypted session tokens & Supabase RLS</span>
          </p>
        </div>
      </div>
    </div>
  );
}
