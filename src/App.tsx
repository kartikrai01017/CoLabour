import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { SplashScreen } from '@/components/SplashScreen';
import { GlobalWorkerAlert } from '@/components/GlobalWorkerAlert';
import { CoLabourAIWidget } from '@/components/CoLabourAIWidget';
import { LandingPage } from '@/pages/LandingPage';
import { SignupPage, LoginPage } from '@/pages/AuthPages';
import { WorkersDirectoryPage } from '@/pages/WorkersDirectoryPage';
import { WorkerProfilePage } from '@/pages/WorkerProfilePage';
import { BookingPage } from '@/pages/BookingPage';
import { PaymentPage } from '@/pages/PaymentPage';
import { WorkerDashboardPage } from '@/pages/WorkerDashboardPage';
import { CustomerDashboardPage } from '@/pages/CustomerDashboardPage';
import { AdminPage } from '@/pages/AdminPage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <SplashScreen />
          <GlobalWorkerAlert />
          <CoLabourAIWidget />
          <div className="relative min-h-screen bg-[#FAF9F5] text-stone-900 selection:bg-teal-300 selection:text-stone-900">
            {/* Subtle Neubrutalist Dot Grid */}
            <div
              className="fixed inset-0 pointer-events-none z-0 bg-[#FAF9F5] bg-[radial-gradient(#1c1917_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-15"
              aria-hidden="true"
            />

            {/* Soft Ambient Mint Glow */}
            <div
              className="fixed -top-24 left-1/2 -translate-x-1/2 w-[720px] max-w-[95vw] h-[360px] rounded-full bg-gradient-to-b from-teal-300/20 via-emerald-400/10 to-transparent blur-[120px] pointer-events-none z-0"
              aria-hidden="true"
            />

            <div className="relative z-10">
              <Navbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/workers" element={<WorkersDirectoryPage />} />
                <Route path="/workers/:id" element={<WorkerProfilePage />} />
                <Route
                  path="/book/:id"
                  element={
                    <ProtectedRoute>
                      <BookingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment/:id"
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/worker/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['worker']}>
                      <WorkerDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CustomerDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
