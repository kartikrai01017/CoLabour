import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { GlobalWorkerAlert } from '@/components/GlobalWorkerAlert';

import { LandingPage } from '@/pages/LandingPage';
import { WorkersDirectoryPage } from '@/pages/WorkersDirectoryPage';
import { WorkerProfilePage } from '@/pages/WorkerProfilePage';
import { BookingPage } from '@/pages/BookingPage';
import { PaymentPage } from '@/pages/PaymentPage';
import { WorkerDashboardPage } from '@/pages/WorkerDashboardPage';
import { CustomerDashboardPage } from '@/pages/CustomerDashboardPage';
import { AdminPage } from '@/pages/AdminPage';
import { LoginPage, SignupPage } from '@/pages/AuthPages';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalWorkerAlert />

        <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-neon-emerald/30">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/workers" element={<WorkersDirectoryPage />} />
            <Route path="/workers/:id" element={<WorkerProfilePage />} />
            
            {/* Dono route aliases taaki koi bhi link miss na ho */}
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/book/:id" element={<BookingPage />} />

            <Route path="/payment/:id" element={<PaymentPage />} />
            
            <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />
            <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
