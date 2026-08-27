import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Wrench, ShieldCheck, ArrowRight, AlertCircle, Loader2,
  Eye, EyeOff, Lock, Mail, Phone, MapPin, IndianRupee,
  Briefcase, Check, Zap, Sparkles
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
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match');
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
    <div className="min-h-screen bg-[#F4EFE6] text-neutral-900 flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 selection:bg-[#F59E0B] selection:text-black">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="sm:mx-auto sm:w-full sm:max-w-xl"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-[#F59E0B] shadow-[2px_2px_0px_#000000] group-hover:rotate-6 transition-transform">
              <Zap className="h-5 w-5 text-black fill-black" />
            </div>
            <span className="text-2xl font-black tracking-tight text-neutral-900 uppercase">
              Co<span className="text-[#F59E0B]">Labour</span>
            </span>
          </Link>
        </div>

        {/* Tactile Folder-Tab Card Container (Inspired by Screenshot) */}
        <div className="relative rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-6 sm:p-9 shadow-[6px_6px_0px_#000000]">
          
          {/* Top Folder Header Row with Badges */}
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 uppercase">
                New to CoLabour?
              </h1>
              <p className="text-xs sm:text-sm font-medium text-neutral-600 mt-1">
                Create your direct-access marketplace account
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className="rounded-xl border-2 border-black bg-[#F59E0B] px-3.5 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000]">
                Sign Up
              </span>
              <span className="rounded-md border border-black bg-[#D4E7D0] px-2 py-0.5 text-[10px] font-black uppercase text-black shadow-[1px_1px_0px_#000000]">
                LOCAL
              </span>
            </div>
          </div>

          {/* Role Switcher Pills */}
          <div className="mb-6">
            <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-600 mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="select-role-customer"
                onClick={() => setRole('customer')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border-2 border-black transition-all cursor-pointer ${
                  role === 'customer'
                    ? 'bg-[#FDE68A] text-black shadow-[3px_3px_0px_#000000] -translate-y-0.5'
                    : 'bg-[#F4EFE6] text-neutral-700 shadow-[1px_1px_0px_#000000] hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg border border-black bg-white">
                    <User size={16} className="text-black" />
                  </div>
                  <div className="text-left">
                    <span className="font-black text-xs uppercase block">Customer</span>
                    <span className="text-[10px] font-medium text-neutral-600">Hire Pros</span>
                  </div>
                </div>
                {role === 'customer' && <Check size={16} className="stroke-[3] text-black" />}
              </button>

              <button
                type="button"
                id="select-role-worker"
                onClick={() => setRole('worker')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border-2 border-black transition-all cursor-pointer ${
                  role === 'worker'
                    ? 'bg-[#F59E0B] text-black shadow-[3px_3px_0px_#000000] -translate-y-0.5'
                    : 'bg-[#F4EFE6] text-neutral-700 shadow-[1px_1px_0px_#000000] hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg border border-black bg-white">
                    <Wrench size={16} className="text-black" />
                  </div>
                  <div className="text-left">
                    <span className="font-black text-xs uppercase block">Worker / Pro</span>
                    <span className="text-[10px] font-medium text-neutral-700">Get Booked</span>
                  </div>
                </div>
                {role === 'worker' && <Check size={16} className="stroke-[3] text-black" />}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-black uppercase text-neutral-800 mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aditi Rao"
                className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] px-4 py-2.5 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 outline-none shadow-[2px_2px_0px_#000000] focus:bg-white focus:shadow-[4px_4px_0px_#000000] transition-all"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-black uppercase text-neutral-800 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] px-4 py-2.5 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 outline-none shadow-[2px_2px_0px_#000000] focus:bg-white focus:shadow-[4px_4px_0px_#000000] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-neutral-800 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] px-4 py-2.5 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 outline-none shadow-[2px_2px_0px_#000000] focus:bg-white focus:shadow-[4px_4px_0px_#000000] transition-all"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-black uppercase text-neutral-800 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] pl-4 pr-10 py-2.5 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 outline-none shadow-[2px_2px_0px_#000000] focus:bg-white focus:shadow-[4px_4px_0px_#000000] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-black"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-neutral-800 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] px-4 py-2.5 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 outline-none shadow-[2px_2px_0px_#000000] focus:bg-white focus:shadow-[4px_4px_0px_#000000] transition-all"
                />
              </div>
            </div>

            {/* Worker-Specific Onboarding Information */}
            {role === 'worker' && (
              <div className="mt-4 pt-4 border-t-2 border-dashed border-neutral-300 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#B45309] uppercase tracking-wider">
                  <ShieldCheck size={15} className="stroke-[2.5]" /> Worker Verification Details
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-800 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] px-4 py-2.5 text-xs font-black uppercase text-neutral-900 outline-none shadow-[2px_2px_0px_#000000] cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-800 mb-1">
                      Direct UPI ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. worker@okhdfcbank"
                      className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] px-4 py-2.5 text-xs font-mono font-bold text-neutral-900 outline-none shadow-[2px_2px_0px_#000000]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-800 mb-1">
                      Hourly Rate (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="450"
                      className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] px-4 py-2.5 text-xs font-black text-neutral-900 outline-none shadow-[2px_2px_0px_#000000]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-800 mb-1">
                      Operating City / Locality <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Indiranagar, Bangalore"
                      className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] px-4 py-2.5 text-xs font-semibold text-neutral-900 outline-none shadow-[2px_2px_0px_#000000]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-neutral-800 mb-1">
                    Skills Summary
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Wiring, Inverter Setup, MCB Repair"
                    className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] px-4 py-2 text-xs font-semibold text-neutral-900 outline-none shadow-[2px_2px_0px_#000000]"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-xl border-2 border-red-600 bg-[#FEE2E2] p-3 text-xs font-bold text-red-700 shadow-[2px_2px_0px_#000000]">
                <AlertCircle size={16} className="text-red-700 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Main Submit Button (CTA) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              id="signup-submit-button"
              disabled={loading}
              className="w-full mt-3 rounded-2xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] py-3.5 px-6 text-sm font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-black" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight size={16} className="stroke-[3]" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-4 border-t-2 border-neutral-200 text-center text-xs font-bold text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-black underline decoration-[#F59E0B] decoration-2 hover:text-[#B45309]">
              Log In Instead
            </Link>
          </div>
        </div>
      </motion.div>
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
    <div className="min-h-screen bg-[#F4EFE6] text-neutral-900 flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 selection:bg-[#F59E0B] selection:text-black">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-[#F59E0B] shadow-[2px_2px_0px_#000000] group-hover:rotate-6 transition-transform">
              <Zap className="h-5 w-5 text-black fill-black" />
            </div>
            <span className="text-2xl font-black tracking-tight text-neutral-900 uppercase">
              Co<span className="text-[#F59E0B]">Labour</span>
            </span>
          </Link>
        </div>

        {/* Tactile Folder-Tab Card Container (Inspired by Screenshot) */}
        <div className="relative rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-6 sm:p-9 shadow-[6px_6px_0px_#000000]">
          
          {/* Top Folder Header Row with Badges */}
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 uppercase leading-tight">
                Welcome Back<br />to CoLabour
              </h1>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className="rounded-xl border-2 border-black bg-[#F59E0B] px-3.5 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000]">
                Log In
              </span>
              <span className="rounded-md border border-black bg-[#D4E7D0] px-2 py-0.5 text-[10px] font-black uppercase text-black shadow-[1px_1px_0px_#000000]">
                LOCAL
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-black uppercase text-neutral-800 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                id="login-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] px-4 py-3 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 outline-none shadow-[2px_2px_0px_#000000] focus:bg-white focus:shadow-[4px_4px_0px_#000000] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-black uppercase text-neutral-800">
                  Password
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-bold text-neutral-600 hover:text-black flex items-center gap-1"
                  >
                    <span>Show Password</span>
                    <span className={`inline-block w-6 h-3.5 rounded-full border border-black p-0.5 transition-colors ${showPassword ? 'bg-[#A3C9A8]' : 'bg-neutral-200'}`}>
                      <span className={`block w-2 h-2 rounded-full bg-black transition-transform ${showPassword ? 'translate-x-2.5' : ''}`} />
                    </span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full rounded-xl border-2 border-black bg-[#FAF7F2] px-4 py-3 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 outline-none shadow-[2px_2px_0px_#000000] focus:bg-white focus:shadow-[4px_4px_0px_#000000] transition-all"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-neutral-700">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`relative flex h-5 w-9 items-center rounded-full border border-black p-0.5 transition-all ${
                    rememberMe ? 'bg-[#84B082]' : 'bg-neutral-300'
                  }`}
                >
                  <span className={`h-3.5 w-3.5 rounded-full border border-black bg-white shadow-sm transition-transform ${
                    rememberMe ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
                <span>Remember Me</span>
              </label>

              <span className="text-[11px] font-bold text-neutral-500 underline cursor-pointer">
                Forgot Password?
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border-2 border-red-600 bg-[#FEE2E2] p-3 text-xs font-bold text-red-700 shadow-[2px_2px_0px_#000000]">
                <AlertCircle size={16} className="text-red-700 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* LOG IN Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              id="login-submit-button"
              disabled={loading}
              className="w-full mt-2 rounded-2xl border-2 border-black bg-[#F59E0B] hover:bg-[#E68A00] py-3.5 px-6 text-sm font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-black" />
                  <span>Logging In...</span>
                </>
              ) : (
                <>
                  <span>LOG IN</span>
                  <ArrowRight size={16} className="stroke-[3]" />
                </>
              )}
            </motion.button>
          </form>

          {/* Or Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300" />
            </div>
            <span className="relative bg-white px-3 text-xs font-black uppercase text-neutral-500">
              or
            </span>
          </div>

          {/* Sign in with Google (Matching Screenshot) */}
          <button
            type="button"
            className="w-full rounded-2xl border-2 border-black bg-white hover:bg-neutral-50 py-3 px-4 text-xs sm:text-sm font-black text-black shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Footer Link */}
          <div className="mt-6 pt-4 border-t-2 border-neutral-200 text-center text-xs font-bold text-neutral-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-black text-black underline decoration-[#F59E0B] decoration-2 hover:text-[#B45309]">
              Sign Up Instead
            </Link>
          </div>
        </div>

        {/* Bottom security pill */}
        <div className="mt-6 text-center text-xs font-bold text-neutral-600">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-[#15803D] stroke-[2.5]" />
            <span>Protected by end-to-end encrypted session tokens</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

