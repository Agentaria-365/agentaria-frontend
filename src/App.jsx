import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ─── NEW Public Pages (Marketing) ───
import Home from './components/pages/Home';
import Pricing from './components/pages/Pricing';
import Academy from './components/pages/Academy';

// ─── Auth Pages ───
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import NewPasswordPage from './components/auth/NewPasswordPage';

// ─── Dashboard Pages ───
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardOverview from './components/dashboard/DashboardOverview';
import WhatsAppConnectionPage from './components/dashboard/WhatsAppConnectionPage';
import ChatManagementPage from './components/dashboard/ChatManagementPage2.0';
import ClientReopenerPage from './components/dashboard/ClientReopenerPage';
import FeedbackReviewsPage from './components/dashboard/FeedbackReviewsPage'; 
import BusinessSettingsPage from './components/dashboard/BusinessSettingsPage'; 
import ProfileSettingsPage from './components/dashboard/ProfileSettingsPage'; 
import BillingPage from './components/dashboard/BillingPage'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ─── Naye Public Pages ─── */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/academy" element={<Academy />} />

        {/* ─── Auth Pages ─── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/new-password" element={<NewPasswordPage />} />

        {/* ─── Dashboard Pages (Aapke Purane Saare Routes) ─── */}
        <Route path="/dashboard" element={
          <DashboardLayout currentPage="dashboard">
            <DashboardOverview />
          </DashboardLayout>
        } />
        
        <Route path="/dashboard/whatsapp" element={
          <DashboardLayout currentPage="whatsapp">
            <WhatsAppConnectionPage />
          </DashboardLayout>
        } />
        
        <Route path="/dashboard/chats" element={
          <DashboardLayout currentPage="chats">
            <ChatManagementPage />
          </DashboardLayout>
        } />
        
        <Route path="/dashboard/reopener" element={
          <DashboardLayout currentPage="reopener">
            <ClientReopenerPage />
          </DashboardLayout>
        } />
        
        <Route path="/dashboard/reviews" element={
          <DashboardLayout currentPage="reviews">
            <FeedbackReviewsPage />
          </DashboardLayout>
        } />
        
        <Route path="/dashboard/settings" element={
          <DashboardLayout currentPage="settings">
            <BusinessSettingsPage />
          </DashboardLayout>
        } />
        
        <Route path="/dashboard/billing" element={
          <DashboardLayout currentPage="billing">
            <BillingPage />
          </DashboardLayout>
        } />
        
        <Route path="/dashboard/profile" element={
          <DashboardLayout currentPage="profile">
            <ProfileSettingsPage />
          </DashboardLayout>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

// ─── Coming Soon Component (Aapka Purana Wala) ───
const ComingSoon = ({ title, description }) => (
  <div className="max-w-[800px] mx-auto text-center py-20">
    <div className="w-24 h-24 bg-[#38F28D]/10 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg className="w-12 h-12 text-[#38F28D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h1 className="text-3xl font-bold text-[#F2F5F4] mb-3">{title}</h1>
    <p className="text-[#A7B0AD] text-lg mb-2">Coming Soon!</p>
    {description && (
      <p className="text-[#A7B0AD] text-sm max-w-md mx-auto opacity-70">
        {description}
      </p>
    )}
  </div>
);

export default App;