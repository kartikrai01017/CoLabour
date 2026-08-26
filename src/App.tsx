import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
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
    <AuthProvider>
      <BrowserRouter>
        <GlobalWorkerAlert />
        <CoLabourAIWidget />
        <div className="min-h-screen bg-base text-gray-100">
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
