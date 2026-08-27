import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Briefcase,
  Wallet,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { type WorkerWithUser, type Review } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { useAuth } from '@/context/AuthContext';
import { fetchWorkerProfile } from '@/lib/dataService';
import { calculateDynamicRating, getTradeMedia } from '@/lib/ratings';

export function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [worker, setWorker] = useState<WorkerWithUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Reviews state for dynamic updates
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewerName, setReviewerName] = useState('');
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchWorker() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchWorkerProfile(id);
        if (mounted) {
          setWorker(data);
          if (data?.reviews && data.reviews.length > 0) {
            setReviews(data.reviews);
          } else {
            setReviews([]);
          }
        }
      } catch {
        if (mounted) setWorker(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchWorker();

    return () => {
      mounted = false;
    };
  }, [id]);

  // Dynamic Rating calculation
  const ratingData = useMemo(() => {
    return calculateDynamicRating(
      reviews,
      worker?.rating || 4.9,
      worker?.total_ratings || (reviews.length > 0 ? reviews.length : 24)
    );
  }, [reviews, worker]);

  const handleBook = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'worker') {
      alert('Workers cannot book other workers. Please sign in as a customer.');
      return;
    }
    navigate(`/book/${id}`);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    setIsSubmitting(true);

    const newRev: Review = {
      id: `rev-profile-${Date.now()}`,
      user_name: reviewerName.trim(),
      rating: ratingScore,
      comment: reviewComment.trim(),
      date: 'Just now',
    };

    setTimeout(() => {
      setReviews((prev) => [newRev, ...prev]);
      setIsSubmitting(false);
      setReviewSuccessMsg(true);
      setReviewerName('');
      setReviewComment('');
      setRatingScore(5);

      setTimeout(() => {
        setReviewSuccessMsg(false);
      }, 4000);
    }, 400);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16 bg-transparent">
        <Loader2 size={36} className="animate-spin text-black" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-16 gap-4 bg-transparent">
        <p className="text-base font-bold text-gray-700">Worker not found.</p>
        <Link to="/workers">
          <button className="px-5 py-2.5 rounded-xl border-2 border-black bg-amber-300 font-black text-black shadow-[3px_3px_0px_0px_#000]">
            Browse Workers
          </button>
        </Link>
      </div>
    );
  }

  const Icon = CATEGORY_ICONS[worker.category] ?? Star;
  const style = getCategoryStyle(worker.category);
  const media = getTradeMedia(worker.category);

  return (
    <div className="relative min-h-screen bg-transparent text-black pt-20 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link to="/workers" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-emerald-800 transition-colors">
          <ArrowLeft size={16} /> Back to Workers Directory
        </Link>

        {/* Hero Card with Dynamic Rating */}
        <div className="rounded-3xl border-2 border-black bg-white p-6 sm:p-8 mb-6 shadow-[6px_6px_0px_0px_#000]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className={`h-24 w-24 rounded-2xl border-2 border-black ${style.bg} shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0`}>
              <Icon className="text-black" size={48} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-black">{worker.users?.name ?? 'Unknown Worker'}</h1>
                {worker.is_verified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-200 border-2 border-stone-900 font-black text-xs text-stone-900 shadow-[2px_2px_0px_0px_#1c1917]">
                    <ShieldCheck size={14} className="text-teal-950" /> ⚡ Verified Direct Pro
                  </span>
                )}
              </div>
              <p className="text-base font-bold text-gray-700 mb-3">{worker.category} • {media.verifiedSpecialty}</p>
              
              {/* Dynamic Rating Badge */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-amber-200 border-2 border-black px-3 py-1 rounded-xl shadow-[2px_2px_0px_0px_#000]">
                  <Star size={16} className="fill-amber-600 text-amber-700" />
                  <span className="font-black text-black text-sm">
                    {ratingData.formattedRating}
                  </span>
                  <span className="text-xs font-bold text-gray-800">
                    ({ratingData.totalReviews} reviews)
                  </span>
                </div>
                {worker.location && (
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 border border-black px-2.5 py-1 rounded-lg">
                    <MapPin size={14} className="text-black" /> {worker.location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:items-end justify-between">
              <div className="text-left sm:text-right">
                <span className="text-3xl font-black text-black">₹{worker.hourly_rate}</span>
                <span className="text-gray-600 text-sm font-bold"> /hr</span>
              </div>
              {user?.role !== 'worker' ? (
                <button
                  onClick={handleBook}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-black bg-emerald-400 px-6 py-3 text-sm font-black text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer uppercase tracking-wider"
                >
                  Book Service <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  disabled
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-black bg-gray-200 px-6 py-3 text-sm font-black text-gray-500 cursor-not-allowed opacity-70 uppercase tracking-wider"
                >
                  Booking Disabled for Workers
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Project Photo Gallery */}
        <div className="mb-6 rounded-3xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-black flex items-center gap-2 uppercase tracking-wider">
              <ImageIcon size={18} className="text-emerald-800" /> Verified On-Site Project Work
            </h2>
            <span className="text-xs font-bold text-gray-500">3 Project Samples</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {media.projectGallery.map((item, idx) => (
              <div key={idx} className="group relative h-36 rounded-2xl border-2 border-black overflow-hidden shadow-[3px_3px_0px_0px_#000] bg-gray-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-xs font-black text-white leading-tight">
                    {item.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          {/* Bio */}
          <div className="rounded-3xl border-2 border-black bg-white p-6 md:col-span-2 shadow-[5px_5px_0px_0px_#000]">
            <h2 className="text-lg font-black text-black mb-3 flex items-center gap-2">
              <Briefcase size={18} className="text-emerald-800" /> About Professional
            </h2>
            <p className="text-gray-800 leading-relaxed text-sm font-medium">
              {worker.bio || 'Experienced and verified service provider registered on the CoLabour gig network.'}
            </p>

            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 mt-6 mb-3">Skills & Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {worker.skills && worker.skills.length > 0 ? (
                worker.skills.map((skill) => (
                  <span key={skill} className="rounded-lg bg-gray-100 border-2 border-black px-3 py-1.5 text-xs font-bold text-black shadow-[2px_2px_0px_0px_#000]">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs font-semibold text-gray-500">General service specialist</span>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="space-y-6">
            <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000]">
              <h2 className="text-base font-black text-black mb-4 uppercase tracking-wider">Network Highlights</h2>
              <div className="space-y-3 text-xs font-bold">
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-50 border border-black">
                  <ShieldCheck size={16} className="text-emerald-800 shrink-0" />
                  <span>100% Background Verified</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-cyan-50 border border-black">
                  <Wallet size={16} className="text-cyan-800 shrink-0" />
                  <span>Direct UPI (0% Commission)</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-amber-50 border border-black">
                  <Clock size={16} className="text-amber-800 shrink-0" />
                  <span>Prompt Response Rate</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border-2 border-black bg-amber-200 p-6 shadow-[5px_5px_0px_0px_#000]">
              <h2 className="text-base font-black text-black mb-1">Need Custom Work?</h2>
              <p className="text-xs font-semibold text-gray-800 mb-4 leading-relaxed">
                You can specify exact requirements and provide special notes during the booking step.
              </p>
              <button
                onClick={handleBook}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-black bg-white text-black font-black text-xs shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer uppercase tracking-wider"
              >
                Request Service
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Reviews & Star Breakdown Section */}
        <div className="rounded-3xl border-2 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black/10">
            <div>
              <h2 className="text-xl font-black text-black flex items-center gap-2">
                <MessageSquare size={20} className="text-emerald-800" /> Customer Ratings & Reviews
              </h2>
              <p className="text-xs font-semibold text-gray-600 mt-1">
                Dynamic score: {ratingData.formattedRating} out of 5 based on {ratingData.totalReviews} reviews
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-12 w-14 rounded-xl bg-amber-300 border-2 border-black flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_0px_#000]">
                {ratingData.formattedRating}
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className={s <= Math.round(ratingData.averageRating) ? 'fill-amber-500' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="font-bold text-gray-600 mt-0.5 block">{ratingData.totalReviews} verified ratings</span>
              </div>
            </div>
          </div>

          {/* Visual Star Breakdown Bars */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <h3 className="text-xs font-black uppercase text-gray-700 mb-2">Rating Distribution</h3>
            {ratingData.starBreakdown.map((item) => (
              <div key={item.star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-gray-800 flex items-center gap-1">
                  {item.star} <Star size={11} className="fill-amber-500 text-amber-500" />
                </span>
                <div className="flex-1 h-3 rounded-full bg-gray-200 border border-black overflow-hidden relative">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  />
                </div>
                <span className="w-10 text-right font-mono text-xs font-black text-gray-800">
                  {item.percentage}%
                </span>
                <span className="w-12 text-right text-[11px] font-medium text-gray-500">
                  ({item.count})
                </span>
              </div>
            ))}
          </div>

          {/* Recent Comments List */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">Recent Customer Comments ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <div className="p-4 rounded-2xl border-2 border-dashed border-gray-300 bg-white text-center">
                <p className="text-xs font-bold text-gray-500">
                  No customer reviews yet. Be the first to leave verified feedback!
                </p>
              </div>
            ) : (
              reviews.slice(0, 3).map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-emerald-200 border border-black flex items-center justify-center font-black text-xs text-black">
                        {rev.user_name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-black text-black text-sm block">{rev.user_name}</span>
                        <span className="text-[10px] font-semibold text-gray-500">{rev.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 border border-black text-xs font-black text-amber-950">
                      <Star size={12} className="fill-amber-500 text-amber-500" />
                      <span>{Number(rev.rating).toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-800 leading-relaxed pl-10">
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Submit Review Form */}
          <div className="rounded-2xl border-2 border-black bg-amber-50 p-5 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                <Sparkles size={16} className="text-amber-800" /> Write a Customer Review
              </h3>
              <span className="text-[10px] font-bold text-gray-600">Recalculates rating dynamically</span>
            </div>

            {reviewSuccessMsg && (
              <div className="mb-3 p-3 rounded-xl bg-emerald-200 border-2 border-black text-xs font-black text-black flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
                <CheckCircle2 size={16} className="text-emerald-900" />
                Your review has been submitted and the average score has updated!
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-3">
              {/* Star selector */}
              <div>
                <label className="text-[11px] font-black uppercase text-gray-700 block mb-1">
                  Select Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating !== null ? hoverRating : ratingScore) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRatingScore(star)}
                          className="p-1 rounded-md hover:bg-amber-200 transition-colors cursor-pointer"
                        >
                          <Star
                            size={24}
                            className={
                              isActive
                                ? 'fill-amber-500 text-amber-600 scale-110 transition-transform'
                                : 'text-gray-400'
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-black text-black bg-white px-2 py-0.5 rounded-md border border-black">
                    {ratingScore}.0 Stars
                  </span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-[11px] font-black uppercase text-gray-700 block mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold text-black placeholder:text-gray-400 outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="text-[11px] font-black uppercase text-gray-700 block mb-1">
                  Your Review & Service Feedback
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Share details regarding punctuality, quality of repair/service, and direct settlement..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-medium text-black placeholder:text-gray-400 outline-none shadow-[2px_2px_0px_0px_#000]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl border-2 border-black bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={14} /> Submit Review & Update Score
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
