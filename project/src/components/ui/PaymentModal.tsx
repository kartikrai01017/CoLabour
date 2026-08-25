import { CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';

interface PaymentModalProps {
  isOpen: boolean;
  status: 'loading' | 'success' | 'failed';
  title?: string;
  message?: string;
  amount?: number | string;
  utrNumber?: string;
  onClose: () => void;
  onAction?: () => void;
}

export function PaymentModal({
  isOpen,
  status,
  title,
  message,
  amount,
  utrNumber,
  onClose,
  onAction,
}: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in">
      <GlassCard className="relative w-full max-w-md border border-white/10 p-6 text-center shadow-2xl">
        {status === 'loading' && (
          <div className="py-8 flex flex-col items-center gap-4">
            <Loader2 size={48} className="animate-spin text-neon-cyan" />
            <h3 className="text-xl font-bold text-white">Verifying Transaction...</h3>
            <p className="text-xs text-gray-400">Payment details process ho rahi hain, kripya intezar karein.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neon-emerald/20 border border-neon-emerald/50">
              <CheckCircle2 size={36} className="text-neon-emeraldGlow" />
            </div>
            <h3 className="text-2xl font-bold text-white">{title || 'Payment Submitted!'}</h3>
            <p className="mt-1 text-sm text-gray-300">{message || 'Payment request worker verification ke liye bhej di gayi hai.'}</p>

            {amount && (
              <div className="my-5 w-full rounded-xl border border-white/10 bg-base-800/60 p-4 text-left space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Amount:</span>
                  <span className="font-bold text-white text-sm">₹{Number(amount).toFixed(2)}</span>
                </div>
                {utrNumber && (
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>UTR / Ref No:</span>
                    <span className="font-mono text-neon-cyan">{utrNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Status:</span>
                  <span className="text-amber-400 font-semibold">Under Verification</span>
                </div>
              </div>
            )}

            <NeonButton fullWidth variant="emerald" onClick={onAction || onClose}>
              Dashboard Par Jayein <ArrowRight size={16} />
            </NeonButton>
          </div>
        )}

        {status === 'failed' && (
          <div className="py-4 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 border border-red-500/50">
              <XCircle size={36} className="text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{title || 'Payment Failed'}</h3>
            <p className="mt-1 text-sm text-gray-300">{message || 'Payment submit nahi ho paya. Dobara koshish karein.'}</p>

            <div className="mt-6 flex w-full gap-3">
              <NeonButton fullWidth variant="danger" onClick={onClose}>
                Try Again
              </NeonButton>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
