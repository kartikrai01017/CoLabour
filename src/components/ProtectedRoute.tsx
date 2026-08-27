import { Navigate } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4EFE6] px-4">
        <div className="rounded-3xl border-2 sm:border-[2.5px] border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#000000] flex flex-col items-center gap-3 text-center max-w-xs w-full">
          <div className="h-12 w-12 rounded-2xl border-2 border-black bg-[#FEF3C7] flex items-center justify-center shadow-[2px_2px_0px_#000000]">
            <Loader2 size={24} className="animate-spin text-neutral-900" />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase text-neutral-900">Verifying Session</h3>
            <p className="text-[11px] font-bold text-neutral-500 mt-0.5">Checking secure credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'worker') return <Navigate to="/worker/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <>{children}</>;
}

