import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './config/supabase';

// ─── Public / Marketing Pages ───────────────────────────────────────────────
import Home    from './components/pages/Home';
import Pricing from './components/pages/Pricing';
import Academy from './components/pages/Academy';

// ─── Auth Pages ──────────────────────────────────────────────────────────────
import LoginPage         from './components/auth/LoginPage';
import SignupPage        from './components/auth/SignupPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import NewPasswordPage   from './components/auth/NewPasswordPage';

// ─── Onboarding ───────────────────────────────────────────────────────────────
import Onboarding from './components/onboarding/Onboarding';

// ─── Dashboard Pages ──────────────────────────────────────────────────────────
import DashboardLayout        from './components/dashboard/DashboardLayout';
import DashboardOverview      from './components/dashboard/DashboardOverview';
import WhatsAppConnectionPage from './components/dashboard/WhatsAppConnectionPage';
import ChatManagementPage     from './components/dashboard/ChatManagementPage2.0';
import ClientReopenerPage     from './components/dashboard/ClientReopenerPage';
import FeedbackReviewsPage    from './components/dashboard/FeedbackReviewsPage';
import BusinessSettingsPage   from './components/dashboard/BusinessSettingsPage';
import ProfileSettingsPage    from './components/dashboard/ProfileSettingsPage';
import BillingPage            from './components/dashboard/BillingPage';


// ─── Splash loader (shown while checking session) ─────────────────────────────
const SplashLoader = () => (
  <div className="min-h-screen bg-[#070A0A] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="text-2xl font-bold">
        <span className="text-[#38F28D]">Agent</span>
        <span className="text-[#F2F5F4]">aria</span>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#38F28D] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ─── Auth Guard: checks session + is_onboarded ───────────────────────────────
/**
 * Wraps ALL dashboard routes.
 * - Not logged in           → /login
 * - Logged in, not onboarded → /onboarding
 * - Logged in + onboarded   → render children
 */
const DashboardGuard = ({ children }) => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus('login'); return; }

      const { data } = await supabase
        .from('subscribers details')
        .select('is_onboarded')
        .eq('subscriber_id', session.user.id)
        .single();

      setStatus(data?.is_onboarded === 'true' ? 'ok' : 'onboard');
    };
    check();
  }, []);

  if (status === 'loading') return <SplashLoader />;
  if (status === 'login')   return <Navigate to="/login"      replace />;
  if (status === 'onboard') return <Navigate to="/onboarding" replace />;
  return children;
};

/**
 * Wraps /onboarding route.
 * - Not logged in        → /login
 * - Already onboarded    → /dashboard (skip re-running onboarding)
 * - Not yet onboarded    → render children
 */
const OnboardingGuard = ({ children }) => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus('login'); return; }

      const { data } = await supabase
        .from('subscribers details')
        .select('is_onboarded')
        .eq('subscriber_id', session.user.id)
        .single();

      setStatus(data?.is_onboarded === 'true' ? 'done' : 'ok');
    };
    check();
  }, []);

  if (status === 'loading') return <SplashLoader />;
  if (status === 'login')   return <Navigate to="/login"     replace />;
  if (status === 'done')    return <Navigate to="/dashboard" replace />;
  return children;
};


// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public / Marketing ── */}
        <Route path="/"        element={<Home />}    />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/academy" element={<Academy />} />

        {/* ── Auth ── */}
        <Route path="/login"          element={<LoginPage />}         />
        <Route path="/signup"         element={<SignupPage />}        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/new-password"   element={<NewPasswordPage />}   />

        {/* ── Onboarding ── */}
        <Route path="/onboarding" element={
          <OnboardingGuard>
            <Onboarding />
          </OnboardingGuard>
        } />

        {/* ── Dashboard (all routes protected) ── */}
        <Route path="/dashboard" element={
          <DashboardGuard>
            <DashboardLayout currentPage="dashboard">
              <DashboardOverview />
            </DashboardLayout>
          </DashboardGuard>
        } />

        <Route path="/dashboard/whatsapp" element={
          <DashboardGuard>
            <DashboardLayout currentPage="whatsapp">
              <WhatsAppConnectionPage />
            </DashboardLayout>
          </DashboardGuard>
        } />

        <Route path="/dashboard/chats" element={
          <DashboardGuard>
            <DashboardLayout currentPage="chats">
              <ChatManagementPage />
            </DashboardLayout>
          </DashboardGuard>
        } />

        <Route path="/dashboard/reopener" element={
          <DashboardGuard>
            <DashboardLayout currentPage="reopener">
              <ClientReopenerPage />
            </DashboardLayout>
          </DashboardGuard>
        } />

        <Route path="/dashboard/reviews" element={
          <DashboardGuard>
            <DashboardLayout currentPage="reviews">
              <FeedbackReviewsPage />
            </DashboardLayout>
          </DashboardGuard>
        } />

        <Route path="/dashboard/settings" element={
          <DashboardGuard>
            <DashboardLayout currentPage="settings">
              <BusinessSettingsPage />
            </DashboardLayout>
          </DashboardGuard>
        } />

        <Route path="/dashboard/billing" element={
          <DashboardGuard>
            <DashboardLayout currentPage="billing">
              <BillingPage />
            </DashboardLayout>
          </DashboardGuard>
        } />

        <Route path="/dashboard/profile" element={
          <DashboardGuard>
            <DashboardLayout currentPage="profile">
              <ProfileSettingsPage />
            </DashboardLayout>
          </DashboardGuard>
        } />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

// ─── Coming Soon Component ───
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
