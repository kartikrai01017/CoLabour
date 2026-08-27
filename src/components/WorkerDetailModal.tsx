import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Star,
  MapPin,
  ShieldCheck,
  X,
  ArrowRight,
  Sparkles,
  Send,
  MessageSquare,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { type WorkerWithUser, type Review } from '@/lib/supabase';
import { CATEGORY_ICONS, getCategoryStyle } from '@/lib/categories';
import { calculateDynamicRating, getTradeMedia } from '@/lib/ratings';
import { useLanguage, type TranslationKey } from '@/context/LanguageContext';

interface WorkerDetailModalProps {
  isOpen: boolean;
  worker: WorkerWithUser | null;
  onClose: () => void;
  onReviewAdded?: (workerId: string, newReview: Review) => void;
}

export function WorkerDetailModal({
  isOpen,
  worker,
  onClose,
  onReviewAdded,
}: WorkerDetailModalProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeWorkerId, setActiveWorkerId] = useState<string | null>(null);

  // Review Form State
  const [reviewerName, setReviewerName] = useState('');
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);

  // Synchronize initial reviews when a worker is opened
  useEffect(() => {
    if (worker && worker.id !== activeWorkerId) {
      setActiveWorkerId(worker.id || 'default');
      if (worker.reviews && worker.reviews.length > 0) {
        setReviews(worker.reviews);
      } else {
        setReviews([]);
      }
      setReviewSuccessMsg(false);
      setReviewerName('');
      setReviewComment('');
      setRatingScore(5);
    }
  }, [worker, activeWorkerId]);

  // Dynamic Rating calculation from the reviews array
  const ratingData = useMemo(() => {
    return calculateDynamicRating(
      reviews,
      worker?.rating || 4.9,
      worker?.total_ratings || (reviews.length > 0 ? reviews.length : 24)
    );
  }, [reviews, worker]);

  if (!isOpen || !worker) return null;

  const CategoryIcon = CATEGORY_ICONS[worker.category] || Sparkles;
  const categoryStyle = getCategoryStyle(worker.category);
  const media = getTradeMedia(worker.category);
  const heroImage = worker.photo_url || media.heroImage;
  const gallery = worker.gallery_urls
    ? worker.gallery_urls.map((url, idx) => ({ title: `Project Item ${idx + 1}`, imageUrl: url }))
    : media.projectGallery;

  const localizedCategory = t(worker.category as TranslationKey, worker.category);
  const specKey = `spec${worker.category}` as TranslationKey;
  const verifiedSpecialty = t(specKey, media.verifiedSpecialty);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    setIsSubmitting(true);

    const newRev: Review = {
      id: `rev-usr-${Date.now()}`,
      user_name: reviewerName.trim(),
      rating: ratingScore,
      comment: reviewComment.trim(),
      date: 'Just now',
    };

    setTimeout(() => {
      const updatedList = [newRev, ...reviews];
      setReviews(updatedList);
      if (worker.id && onReviewAdded) {
        onReviewAdded(worker.id, newRev);
      }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl my-6 overflow-hidden rounded-3xl border-2 border-stone-900 bg-white shadow-[8px_8px_0px_0px_#1c1917]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 h-9 w-9 rounded-xl border-2 border-stone-900 bg-white/95 text-stone-900 hover:bg-rose-100 flex items-center justify-center shadow-[2px_2px_0px_0px_#1c1917] cursor-pointer transition-transform active:translate-x-[2px] active:translate-y-[2px]"
          aria-label={t('closeModal')}
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* HERO BANNER & TRADE AVATAR */}
        <div className="relative h-44 sm:h-52 w-full bg-stone-900 overflow-hidden border-b-2 border-stone-900">
          <img
            src={heroImage}
            alt={worker.category}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Top category chip */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 border-stone-900 ${categoryStyle.bg} text-stone-900 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#1c1917]`}>
              <CategoryIcon size={14} />
              {localizedCategory}
            </span>
            {worker.is_verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border-2 border-stone-900 bg-teal-300 text-stone-900 font-black text-xs shadow-[2px_2px_0px_0px_#1c1917]">
                <ShieldCheck size={13} className="text-teal-950" /> {t('verifiedDirect')}
              </span>
            )}
          </div>

          {/* Bottom Hero Info */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                {worker.users?.name || 'Verified Professional'}
              </h2>
              <p className="text-xs font-bold text-stone-200 flex items-center gap-1 mt-0.5">
                <MapPin size={13} className="text-teal-400" />
                {worker.location || 'Bengaluru, Karnataka'}
              </p>
            </div>

            {/* DYNAMIC RATING BADGE (HERO) */}
            <div className="rounded-2xl border-2 border-stone-900 bg-amber-300 px-3.5 py-2 text-stone-900 shadow-[3px_3px_0px_0px_#1c1917] text-right shrink-0">
              <div className="flex items-center gap-1 text-sm sm:text-base font-black">
                <Star size={18} className="fill-amber-950 text-amber-950" />
                <span>{ratingData.formattedRating}</span>
              </div>
              <p className="text-[10px] font-extrabold text-amber-950/80">
                ({ratingData.totalReviews} {ratingData.totalReviews === 1 ? t('reviewSingular') : t('reviewsLabel')})
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[calc(85vh-180px)] overflow-y-auto">
          
          {/* PRICING & SPECIALTY BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border-2 border-stone-900 bg-teal-50 shadow-[3px_3px_0px_0px_#1c1917]">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-900 block">
                {t('verifiedSpecialty')}
              </span>
              <p className="text-xs sm:text-sm font-black text-stone-950 mt-0.5">
                {verifiedSpecialty}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-stone-600 block">
                {t('transparentDirectRate')}
              </span>
              <span className="text-xl font-black text-stone-900">₹{worker.hourly_rate}</span>
              <span className="text-xs font-bold text-stone-600">{t('perHourSuffix')}</span>
            </div>
          </div>

          {/* PROJECT PHOTO THUMBNAILS GALLERY */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <ImageIcon size={15} className="text-teal-700" />
                {t('verifiedPortfolios')}
              </h3>
              <span className="text-[10px] font-bold text-stone-500">
                {t('verifiedPhotosCount')}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {gallery.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className="group relative h-24 sm:h-28 rounded-2xl border-2 border-stone-900 overflow-hidden shadow-[2px_2px_0px_0px_#1c1917] bg-stone-100"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[9px] sm:text-[10px] font-black text-white leading-tight line-clamp-1">
                      {item.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RATING BREAKDOWN & STAR DISTRIBUTION */}
          <div className="rounded-2xl border-2 border-stone-900 bg-white p-4 sm:p-5 shadow-[4px_4px_0px_0px_#1c1917]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-stone-900/10">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-2xl bg-amber-300 border-2 border-stone-900 flex flex-col items-center justify-center shadow-[2px_2px_0px_0px_#1c1917]">
                  <span className="text-2xl font-black text-stone-900 leading-none">{ratingData.formattedRating}</span>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={8}
                        className={s <= Math.round(ratingData.averageRating) ? 'fill-stone-900 text-stone-900' : 'text-stone-300'}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-black text-stone-900">{t('customerRatingSummary')}</h4>
                  <p className="text-xs font-semibold text-stone-600">
                    {t('calculatedDynamically')} {ratingData.totalReviews} {t('verifiedReviewsCount')}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-200 border-2 border-stone-900 text-xs font-black text-stone-900 shadow-[2px_2px_0px_0px_#1c1917] self-start sm:self-auto">
                <ShieldCheck size={14} className="text-teal-900" />
                {t('genuineSihFeedback')}
              </div>
            </div>

            {/* Visual Star Breakdown Bars */}
            <div className="mt-4 space-y-2">
              {ratingData.starBreakdown.map((item) => (
                <div key={item.star} className="flex items-center gap-2 text-xs">
                  <span className="w-10 font-bold text-stone-700 flex items-center gap-0.5">
                    {item.star} <Star size={11} className="fill-amber-500 text-amber-500" />
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-stone-100 border border-stone-900 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-amber-400 rounded-full"
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-[11px] font-black text-stone-700">
                    {item.percentage}%
                  </span>
                  <span className="w-12 text-right text-[10px] font-semibold text-stone-400">
                    ({item.count})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT CUSTOMER REVIEWS */}
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900 mb-3 flex items-center gap-1.5">
              <MessageSquare size={15} className="text-teal-700" />
              {t('recentCustomerReviews')} ({reviews.length})
            </h3>
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="p-4 rounded-2xl border-2 border-dashed border-stone-300 bg-white text-center">
                  <p className="text-xs font-bold text-stone-500">
                    {t('noReviewsYet')}
                  </p>
                </div>
              ) : (
                reviews.slice(0, 3).map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl border-2 border-stone-900 bg-white shadow-[3px_3px_0px_0px_#1c1917]"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-teal-200 border border-stone-900 flex items-center justify-center font-black text-xs text-stone-900">
                          {rev.user_name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-black text-xs text-stone-900 leading-none">{rev.user_name}</h5>
                          <span className="text-[10px] font-semibold text-stone-500">{rev.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 border border-stone-900 text-xs font-black text-amber-950">
                        <Star size={12} className="fill-amber-500 text-amber-500" />
                        <span>{Number(rev.rating).toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-stone-800 leading-relaxed pl-9">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SUBMIT REVIEW FORM */}
          <div className="rounded-2xl border-2 border-stone-900 bg-amber-50 p-4 sm:p-5 shadow-[4px_4px_0px_0px_#1c1917]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                <Sparkles size={15} className="text-amber-800" />
                {t('submitCustomerReview')}
              </h4>
              <span className="text-[10px] font-bold text-stone-600">{t('updatesScoreDynamically')}</span>
            </div>

            {reviewSuccessMsg && (
              <div className="mb-3 p-3 rounded-xl bg-teal-200 border-2 border-stone-900 text-xs font-black text-stone-900 flex items-center gap-2 shadow-[2px_2px_0px_0px_#1c1917]">
                <CheckCircle2 size={16} className="text-teal-900" />
                {t('reviewSuccess')}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-3">
              {/* Interactive Star Picker */}
              <div>
                <label className="text-[11px] font-black uppercase text-stone-700 block mb-1">
                  {t('ratingScorePrompt')}
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
                            size={22}
                            className={
                              isActive
                                ? 'fill-amber-500 text-amber-600 scale-110 transition-transform'
                                : 'text-stone-300'
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-black text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-900">
                    {ratingScore}{t('starsCountSuffix')}
                  </span>
                </div>
              </div>

              {/* Name input */}
              <div>
                <label className="text-[11px] font-black uppercase text-stone-700 block mb-1">
                  {t('yourFullName')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('fullNamePlaceholder')}
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full rounded-xl border-2 border-stone-900 bg-white px-3 py-2 text-xs font-bold text-stone-900 placeholder:text-stone-400 outline-none shadow-[2px_2px_0px_0px_#1c1917] focus:shadow-[3px_3px_0px_0px_#1c1917]"
                />
              </div>

              {/* Comment text */}
              <div>
                <label className="text-[11px] font-black uppercase text-stone-700 block mb-1">
                  {t('detailedFeedback')}
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder={t('feedbackPlaceholder')}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full rounded-xl border-2 border-stone-900 bg-white px-3 py-2 text-xs font-medium text-stone-900 placeholder:text-stone-400 outline-none shadow-[2px_2px_0px_0px_#1c1917] focus:shadow-[3px_3px_0px_0px_#1c1917]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-stone-900 bg-amber-400 hover:bg-amber-300 text-stone-900 font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#1c1917] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>{t('submittingScore')}</>
                ) : (
                  <>
                    <Send size={14} /> {t('submitReviewBtn')}
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 border-t-2 border-stone-900 bg-stone-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border-2 border-stone-900 bg-white text-stone-900 font-black text-xs hover:bg-stone-100 shadow-[2px_2px_0px_0px_#1c1917] cursor-pointer"
          >
            {t('closeModal')}
          </button>

          {user?.role !== 'worker' ? (
            <Link to={`/book/${worker.id}`} className="flex-1 max-w-xs">
              <button
                type="button"
                className="w-full py-3 px-4 rounded-xl border-2 border-stone-900 bg-teal-400 hover:bg-teal-300 text-stone-900 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_#1c1917] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {t('bookNowBtn')} <ArrowRight size={16} />
              </button>
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex-1 max-w-xs py-3 px-4 rounded-xl border-2 border-stone-900 bg-stone-200 text-stone-500 font-black text-xs sm:text-sm uppercase tracking-wider cursor-not-allowed opacity-70"
            >
              {t('bookingDisabled')}
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
}
