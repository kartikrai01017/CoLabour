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
<<<<<<< HEAD
    <div className="relative min-h-screen bg-[#F6F4EE] text-black flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8">
=======
    <div className="relative min-h-screen bg-[#0C0B10] text-gray-100 flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Warm Ambient Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[680px] h-[420px] bg-gradient-to-b from-amber-500/12 via-amber-600/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-amber-500/[0.06] rounded-full blur-[100px]" />
        <div className="absolute bottom-10 -left-32 w-96 h-96 bg-orange-600/[0.05] rounded-full blur-[100px]" />
      </div>

>>>>>>> origin/main
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
          </p>
        </div>

        {/* Main Card */}
<<<<<<< HEAD
        <div className="relative rounded-2xl bg-white border-2 border-black p-6 sm:p-10 shadow-[6px_6px_0px_0px_#000]">
          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-3">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-4">
=======
        <div className="relative rounded-3xl bg-[#15141C]/85 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8),0_0_0_1px_rgba(245,158,11,0.06)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/30 before:to-transparent">
          {/* Role Selection */}
          <div className="mb-8">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
>>>>>>> origin/main
              <button
                type="button"
                id="select-role-customer"
                onClick={() => setRole('customer')}
<<<<<<< HEAD
                className={`relative flex flex-col items-start p-4 rounded-xl border-2 border-black text-left transition-all duration-200 cursor-pointer ${
                  role === 'customer'
                    ? 'bg-amber-200 shadow-[4px_4px_0px_0px_#000]'
                    : 'bg-gray-50 hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000]'
=======
                className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-200 ${
                  role === 'customer'
                    ? 'border-amber-500/50 bg-amber-500/[0.08] shadow-[0_0_24px_rgba(245,158,11,0.12)]'
                    : 'border-white/[0.07] bg-[#100F17]/60 hover:border-white/20 hover:bg-[#100F17]'
>>>>>>> origin/main
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
<<<<<<< HEAD
                    className={`p-2 rounded-lg border-2 border-black ${
                      role === 'customer'
                        ? 'bg-amber-400 text-black'
                        : 'bg-white text-gray-700'
=======
                    className={`p-2 rounded-xl ${
                      role === 'customer'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-white/5 text-gray-400'
>>>>>>> origin/main
                    }`}
                  >
                    <User size={18} />
                  </div>
                  {role === 'customer' && (
<<<<<<< HEAD
                    <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center">
=======
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center">
>>>>>>> origin/main
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
<<<<<<< HEAD
                <span className="font-black text-sm text-black">Customer</span>
                <span className="text-xs font-semibold text-gray-700 mt-0.5">Hire & book verified services</span>
=======
                <span className="font-semibold text-sm text-white">Customer</span>
                <span className="text-xs text-gray-400 mt-0.5">Hire & book verified services</span>
>>>>>>> origin/main
              </button>

              <button
                type="button"
                id="select-role-worker"
                onClick={() => setRole('worker')}
<<<<<<< HEAD
                className={`relative flex flex-col items-start p-4 rounded-xl border-2 border-black text-left transition-all duration-200 cursor-pointer ${
                  role === 'worker'
                    ? 'bg-emerald-200 shadow-[4px_4px_0px_0px_#000]'
                    : 'bg-gray-50 hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000]'
=======
                className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-200 ${
                  role === 'worker'
                    ? 'border-amber-500/50 bg-amber-500/[0.08] shadow-[0_0_24px_rgba(245,158,11,0.12)]'
                    : 'border-white/[0.07] bg-[#100F17]/60 hover:border-white/20 hover:bg-[#100F17]'
>>>>>>> origin/main
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
<<<<<<< HEAD
                    className={`p-2 rounded-lg border-2 border-black ${
                      role === 'worker'
                        ? 'bg-emerald-400 text-black'
                        : 'bg-white text-gray-700'
=======
                    className={`p-2 rounded-xl ${
                      role === 'worker'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-white/5 text-gray-400'
>>>>>>> origin/main
                    }`}
                  >
                    <Wrench size={18} />
                  </div>
                  {role === 'worker' && (
<<<<<<< HEAD
                    <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center">
=======
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center">
>>>>>>> origin/main
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
<<<<<<< HEAD
                <span className="font-black text-sm text-black">Worker / Pro</span>
                <span className="text-xs font-semibold text-gray-700 mt-0.5">Offer skills & get instant payouts</span>
=======
                <span className="font-semibold text-sm text-white">Worker / Pro</span>
                <span className="text-xs text-gray-400 mt-0.5">Offer skills & get instant payouts</span>
>>>>>>> origin/main
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
<<<<<<< HEAD
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Full Name <span className="text-emerald-700 font-black">*</span>
=======
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Full Name <span className="text-amber-400">*</span>
>>>>>>> origin/main
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aditi Rao"
<<<<<<< HEAD
                    className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
=======
                    className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
>>>>>>> origin/main
                  />
                </div>
              </div>

              <div>
<<<<<<< HEAD
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Phone Number <span className="text-emerald-700 font-black">*</span>
=======
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Phone Number <span className="text-amber-400">*</span>
>>>>>>> origin/main
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 12340"
<<<<<<< HEAD
                    className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
=======
                    className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
>>>>>>> origin/main
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
<<<<<<< HEAD
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Email Address <span className="text-emerald-700 font-black">*</span>
=======
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Email Address <span className="text-amber-400">*</span>
>>>>>>> origin/main
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aditi@example.com"
<<<<<<< HEAD
                    className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
=======
                    className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
>>>>>>> origin/main
                  />
                </div>
              </div>

              <div>
<<<<<<< HEAD
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Password <span className="text-emerald-700 font-black">*</span>
=======
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Password <span className="text-amber-400">*</span>
>>>>>>> origin/main
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
<<<<<<< HEAD
                    className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-10 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
=======
                    className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-10 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
>>>>>>> origin/main
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
<<<<<<< HEAD
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition-colors p-1"
=======
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
>>>>>>> origin/main
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Worker-Specific Onboarding Information */}
            {role === 'worker' && (
<<<<<<< HEAD
              <div className="mt-4 pt-4 border-t-2 border-black/10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider bg-emerald-100 p-2 rounded-lg border-2 border-black">
                  <ShieldCheck size={16} className="text-emerald-800" /> Professional Verification Details
=======
              <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  <ShieldCheck size={16} /> Professional Verification Details
>>>>>>> origin/main
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
<<<<<<< HEAD
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Service Category <span className="text-emerald-700 font-black">*</span>
=======
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Service Category <span className="text-amber-400">*</span>
>>>>>>> origin/main
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
<<<<<<< HEAD
                        className="w-full bg-white border-2 border-black text-black font-semibold rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
=======
                        className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20 appearance-none"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="bg-[#15141C] text-white">
>>>>>>> origin/main
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
<<<<<<< HEAD
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Direct UPI ID <span className="text-emerald-700 font-black">*</span>
=======
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Direct UPI ID <span className="text-amber-400">*</span>
>>>>>>> origin/main
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="rajesh.kumar@okhdfcbank"
<<<<<<< HEAD
                        className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
=======
                        className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
>>>>>>> origin/main
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
<<<<<<< HEAD
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Hourly Rate (₹) <span className="text-emerald-700 font-black">*</span>
=======
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Hourly Rate (₹) <span className="text-amber-400">*</span>
>>>>>>> origin/main
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="450"
<<<<<<< HEAD
                      className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
=======
                      className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
>>>>>>> origin/main
                    />
                  </div>

                  <div>
<<<<<<< HEAD
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Operating City / Location <span className="text-emerald-700 font-black">*</span>
=======
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Operating City / Location <span className="text-amber-400">*</span>
>>>>>>> origin/main
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Indiranagar, Bangalore"
<<<<<<< HEAD
                        className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
=======
                        className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
>>>>>>> origin/main
                      />
                    </div>
                  </div>
                </div>

                <div>
<<<<<<< HEAD
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
=======
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
>>>>>>> origin/main
                    Skills Summary (comma separated)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Wiring, Inverter Setup, Appliance Repair, Circuit Breakers"
<<<<<<< HEAD
                    className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
=======
                    className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
>>>>>>> origin/main
                  />
                </div>

                <div>
<<<<<<< HEAD
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
=======
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
>>>>>>> origin/main
                    Professional Bio
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Master technician with 8+ years experience in domestic and commercial electrical repairs."
<<<<<<< HEAD
                    className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none resize-none"
=======
                    className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20 resize-none"
>>>>>>> origin/main
                  />
                </div>
              </div>
            )}

            {error && (
<<<<<<< HEAD
              <div className="flex items-center gap-2.5 rounded-xl border-2 border-black bg-red-100 p-3.5 text-xs font-bold text-red-900 shadow-[3px_3px_0px_0px_#000]">
                <AlertCircle size={16} className="text-red-700 shrink-0" />
=======
              <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300 animate-shake">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
>>>>>>> origin/main
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              id="signup-submit-button"
              disabled={loading}
<<<<<<< HEAD
              className="w-full mt-4 bg-emerald-400 border-2 border-black text-black font-black rounded-xl py-3.5 px-6 text-sm shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
=======
              className="w-full mt-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-semibold rounded-xl py-3 px-6 text-sm shadow-[0_0_24px_rgba(245,158,11,0.25)] hover:shadow-[0_0_32px_rgba(245,158,11,0.4)] hover:brightness-105 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
>>>>>>> origin/main
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

<<<<<<< HEAD
          <div className="mt-6 pt-6 border-t-2 border-black/10 text-center">
            <p className="text-xs font-bold text-gray-700">
              Already have an account?{' '}
              <Link to="/login" className="font-black text-black underline decoration-emerald-500 hover:text-emerald-800 transition-colors">
=======
          <div className="mt-6 pt-6 border-t border-white/[0.07] text-center">
            <p className="text-xs text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
>>>>>>> origin/main
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
<<<<<<< HEAD
    <div className="relative min-h-screen bg-[#F6F4EE] text-black flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8">
=======
    <div className="relative min-h-screen bg-[#0C0B10] text-gray-100 flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Warm Ambient Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[680px] h-[420px] bg-gradient-to-b from-amber-500/12 via-amber-600/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-amber-500/[0.06] rounded-full blur-[100px]" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 bg-orange-600/[0.05] rounded-full blur-[100px]" />
      </div>

>>>>>>> origin/main
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
          </p>
        </div>

        {/* Login Card */}
<<<<<<< HEAD
        <div className="relative rounded-2xl bg-white border-2 border-black p-6 sm:p-10 shadow-[6px_6px_0px_0px_#000]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
=======
        <div className="relative rounded-3xl bg-[#15141C]/85 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8),0_0_0_1px_rgba(245,158,11,0.06)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/30 before:to-transparent">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
>>>>>>> origin/main
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
<<<<<<< HEAD
                  className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
=======
                  className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
>>>>>>> origin/main
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
<<<<<<< HEAD
                <label className="block text-xs font-bold text-gray-800">
=======
                <label className="block text-xs font-medium text-gray-300">
>>>>>>> origin/main
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
<<<<<<< HEAD
                  className="w-full bg-white border-2 border-black text-black placeholder:text-gray-400 rounded-xl pl-10 pr-10 py-3 text-sm font-semibold transition-all focus:shadow-[3px_3px_0px_0px_#000] focus:outline-none"
=======
                  className="w-full bg-[#0D0C13]/90 border border-white/[0.09] text-gray-100 placeholder:text-gray-500 rounded-xl pl-10 pr-10 py-3 text-sm transition-all focus:border-amber-500/60 focus:bg-[#121019] focus:ring-4 focus:ring-amber-500/10 focus:outline-none hover:border-white/20"
>>>>>>> origin/main
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
<<<<<<< HEAD
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors p-1"
=======
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
>>>>>>> origin/main
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
<<<<<<< HEAD
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-800 font-bold">
=======
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-400 hover:text-gray-300">
>>>>>>> origin/main
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
<<<<<<< HEAD
                  className="rounded border-2 border-black text-emerald-600 focus:ring-0 w-4 h-4 cursor-pointer"
=======
                  className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30 w-3.5 h-3.5"
>>>>>>> origin/main
                />
                <span>Remember this device</span>
              </label>

<<<<<<< HEAD
              <span className="text-gray-600 font-bold">
                🔒 256-Bit Encrypted
=======
              <span className="text-gray-500 hover:text-gray-400 cursor-default">
                Encrypted Session
>>>>>>> origin/main
              </span>
            </div>

            {error && (
<<<<<<< HEAD
              <div className="flex items-center gap-2.5 rounded-xl border-2 border-black bg-red-100 p-3.5 text-xs font-bold text-red-900 shadow-[3px_3px_0px_0px_#000]">
                <AlertCircle size={16} className="text-red-700 shrink-0" />
=======
              <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300 animate-shake">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
>>>>>>> origin/main
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              id="login-submit-button"
              disabled={loading}
<<<<<<< HEAD
              className="w-full mt-2 bg-emerald-400 border-2 border-black text-black font-black rounded-xl py-3.5 px-6 text-sm shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
=======
              className="w-full mt-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-semibold rounded-xl py-3.5 px-6 text-sm shadow-[0_0_24px_rgba(245,158,11,0.25)] hover:shadow-[0_0_32px_rgba(245,158,11,0.4)] hover:brightness-105 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
>>>>>>> origin/main
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

<<<<<<< HEAD
          <div className="mt-8 pt-6 border-t-2 border-black/10 text-center">
            <p className="text-xs font-bold text-gray-700">
              Don't have an account yet?{' '}
              <Link to="/signup" className="font-black text-black underline decoration-emerald-500 hover:text-emerald-800 transition-colors">
=======
          <div className="mt-8 pt-6 border-t border-white/[0.07] text-center">
            <p className="text-xs text-gray-400">
              Don't have an account yet?{' '}
              <Link to="/signup" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
>>>>>>> origin/main
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Enterprise Security Subtext */}
<<<<<<< HEAD
        <div className="mt-8 text-center text-xs font-bold text-gray-600">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-700" />
=======
        <div className="mt-8 text-center text-xs text-gray-500">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-amber-400/70" />
>>>>>>> origin/main
            <span>Protected by end-to-end encrypted session tokens & Supabase RLS</span>
          </p>
        </div>
      </div>
    </div>
  );
}
