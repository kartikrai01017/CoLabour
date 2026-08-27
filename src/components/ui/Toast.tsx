import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl border border-neon-emerald/40 bg-base-900/90 px-4 py-3 text-sm font-semibold text-neon-emerald shadow-[0_0_30px_rgba(16,185,129,0.3)] backdrop-blur-xl animate-slide-down">
      <CheckCircle size={18} className="text-neon-emerald" />
      <span>{message}</span>
    </div>
  );
}
