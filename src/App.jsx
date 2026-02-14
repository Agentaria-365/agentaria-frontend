import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages Import
import LandingPage from './components/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import NewPasswordPage from './components/auth/NewPasswordPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardOverview from './components/dashboard/DashboardOverview';
import WhatsAppConnectionPage from './components/dashboard/WhatsAppConnectionPage';
import ChatManagementPage from './components/dashboard/ChatManagementPage2.0';
import ClientReopenerPage from './components/dashboard/ClientReopenerPage';
import FeedbackReviewsPage from './components/dashboard/FeedbackReviewsPage'; // ✅ Phase 4A
import BusinessSettingsPage from './components/dashboard/BusinessSettingsPage'; // ✅ Phase 4B
import ProfileSettingsPage from './components/dashboard/ProfileSettingsPage'; // ✅ Phase 4C
import BillingPage from './components/dashboard/BillingPage'; // ✅ Phase 4D

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/new-password" element={<NewPasswordPage />} />

        {/* Dashboard Pages */}
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
        
        {/* Phase 2 - Chat Management */}
        <Route path="/dashboard/chats" element={
          <DashboardLayout currentPage="chats">
            <ChatManagementPage />
          </DashboardLayout>
        } />
        
        {/* Phase 3 - Client Re-Opener */}
        <Route path="/dashboard/reopener" element={
          <DashboardLayout currentPage="reopener">
            <ClientReopenerPage />
          </DashboardLayout>
        } />
        
        {/* ✅ Phase 4A - Feedback & Reviews */}
        <Route path="/dashboard/reviews" element={
          <DashboardLayout currentPage="reviews">
            <FeedbackReviewsPage />
          </DashboardLayout>
        } />
        
        {/* ✅ Phase 4B - Business Settings */}
        <Route path="/dashboard/settings" element={
          <DashboardLayout currentPage="settings">
            <BusinessSettingsPage />
          </DashboardLayout>
        } />
        
        {/* ✅ Phase 4D - Billing */}
        <Route path="/dashboard/billing" element={
          <DashboardLayout currentPage="billing">
            <BillingPage />
          </DashboardLayout>
        } />
        
        {/* ✅ Phase 4C - Profile Settings */}
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

// Coming Soon Component
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