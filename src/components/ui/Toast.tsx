import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-nb-md border-[2px] border-nb-ink bg-nb-surface px-4 py-3 text-sm font-bold text-nb-ink shadow-nb-lg animate-slide-up">
      <CheckCircle size={18} className="text-nb-accent-green" />
      <span>{message}</span>
    </div>
  );
}