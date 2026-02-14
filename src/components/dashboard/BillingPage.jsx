import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import {
  CreditCard,
  Zap,
  Crown,
  Check,
  Calendar,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Clock,
  Sparkles,
  MessageSquare,
  Bot,
  HeadphonesIcon,
  Building2,
  Shield,
  ArrowRight,
  Receipt
} from 'lucide-react';

// ============================================================
// DUMMY BILLING HISTORY (For UI Demo)
// ============================================================
const DUMMY_INVOICES = [
  {
    id: 'inv_001',
    date: '2026-01-15',
    amount: 59,
    status: 'paid',
    invoice_url: '#'
  },
  {
    id: 'inv_002',
    date: '2025-12-15',
    amount: 59,
    status: 'paid',
    invoice_url: '#'
  }
];

// ============================================================
// PLAN FEATURES
// ============================================================
const TRIAL_FEATURES = [
  { icon: Bot, text: 'Basic AI Access' },
  { icon: MessageSquare, text: 'Test Conversations' },
  { icon: Clock, text: '3 Days Validity' },
];

const PRO_FEATURES = [
  { icon: MessageSquare, text: 'Unlimited Conversations' },
  { icon: Bot, text: 'Full AI Access' },
  { icon: HeadphonesIcon, text: 'Priority Support' },
  { icon: Building2, text: 'Commercial Usage' },
  { icon: Shield, text: 'Advanced Security' },
  { icon: Zap, text: 'All Future Updates' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const getDaysRemaining = (endDate) => {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

// ============================================================
// STATUS CONFIG
// ============================================================
const STATUS_CONFIG = {
  active: { 
    label: 'Active', 
    color: '#38F28D', 
    bg: 'rgba(56,242,141,0.12)',
    border: 'rgba(56,242,141,0.3)'
  },
  trialing: { 
    label: 'Trial', 
    color: '#F2A838', 
    bg: 'rgba(242,168,56,0.12)',
    border: 'rgba(242,168,56,0.3)'
  },
  past_due: { 
    label: 'Past Due', 
    color: '#FF6B6B', 
    bg: 'rgba(255,107,107,0.12)',
    border: 'rgba(255,107,107,0.3)'
  },
  canceled: { 
    label: 'Canceled', 
    color: '#A7B0AD', 
    bg: 'rgba(167,176,173,0.12)',
    border: 'rgba(167,176,173,0.3)'
  },
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const BillingPage = () => {
  // User State
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Subscription State
  const [subscription, setSubscription] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('trial'); // trial | pro
  const [status, setStatus] = useState('trialing');
  
  // UI State
  const [upgrading, setUpgrading] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // ============================================================
  // TOAST HELPER
  // ============================================================
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
  };

  // ============================================================
  // FETCH SUBSCRIPTION DATA
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }
        
        setUserId(user.id);
        
        // Fetch subscription
        const { data: subData, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('subscriber_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Subscription fetch error:', error);
        }
        
        if (subData) {
          setSubscription(subData);
          setStatus(subData.status || 'trialing');
          setCurrentPlan(subData.status === 'active' ? 'pro' : 'trial');
        } else {
          // No subscription record = Free Trial
          setSubscription(null);
          setStatus('trialing');
          setCurrentPlan('trial');
        }
        
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // ============================================================
  // UPGRADE HANDLER
  // ============================================================
  const handleUpgrade = async () => {
    setUpgrading(true);
    
    // Simulate redirect delay
    setTimeout(() => {
      showToast('success', 'Redirecting to secure checkout...');
      setUpgrading(false);
      
      // TODO: Replace with actual Stripe Checkout redirect
      // window.location.href = 'https://checkout.stripe.com/...';
    }, 1500);
  };

  // ============================================================
  // RENDER - LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#38F28D] animate-spin mx-auto mb-4" />
          <p className="text-[#A7B0AD]">Loading billing information...</p>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.trialing;
  const daysRemaining = subscription?.current_period_end 
    ? getDaysRemaining(subscription.current_period_end)
    : 3; // Default 3 days for new trials

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#F2F5F4] mb-2 flex items-center gap-3">
          <CreditCard className="w-10 h-10 text-[#38F28D]" />
          Subscription & Billing
        </h1>
        <p className="text-[#A7B0AD] text-lg">
          Manage your subscription and view billing history
        </p>
      </div>

      {/* Subscription Status Card */}
      <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#38F28D]/10 rounded-full flex items-center justify-center">
              {currentPlan === 'pro' ? (
                <Crown className="w-7 h-7 text-[#38F28D]" />
              ) : (
                <Zap className="w-7 h-7 text-[#F2A838]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-[#F2F5F4]">
                  {currentPlan === 'pro' ? 'Agentaria Pro' : 'Free Trial'}
                </h2>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: statusConfig.bg,
                    color: statusConfig.color,
                    border: `1px solid ${statusConfig.border}`
                  }}
                >
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-[#A7B0AD] text-sm">
                {currentPlan === 'pro' 
                  ? `Next billing: ${formatDate(subscription?.current_period_end)}`
                  : status === 'trialing' && daysRemaining > 0
                    ? `Trial ends in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`
                    : 'Trial period ended'
                }
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-6">
            {currentPlan === 'pro' && (
              <div className="text-center">
                <div className="text-2xl font-bold text-[#38F28D]">$59</div>
                <div className="text-xs text-[#A7B0AD]">per month</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl font-bold text-[#F2F5F4]">
                {currentPlan === 'pro' ? '∞' : daysRemaining}
              </div>
              <div className="text-xs text-[#A7B0AD]">
                {currentPlan === 'pro' ? 'Unlimited' : 'Days Left'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Free Trial Card */}
        <div className={`bg-[#0D1211] border rounded-[18px] p-6 transition-all ${
          currentPlan === 'trial' 
            ? 'border-[#F2A838]/50 shadow-[0_0_30px_rgba(242,168,56,0.1)]' 
            : 'border-[#1A2321]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F2A838]/10 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#F2A838]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F2F5F4]">Free Trial</h3>
                <p className="text-xs text-[#A7B0AD]">3 Days</p>
              </div>
            </div>
            {currentPlan === 'trial' && (
              <span className="px-3 py-1 bg-[#F2A838]/10 text-[#F2A838] rounded-full text-xs font-semibold border border-[#F2A838]/30">
                Current Plan
              </span>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-[#F2F5F4]">Free</span>
            </div>
            <p className="text-sm text-[#A7B0AD]">No credit card required</p>
          </div>

          <div className="space-y-3 mb-6">
            {TRIAL_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="flex items-center gap-3 text-sm text-[#A7B0AD]">
                  <div className="w-5 h-5 rounded-full bg-[#F2A838]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3 h-3 text-[#F2A838]" />
                  </div>
                  {feature.text}
                </div>
              );
            })}
          </div>

          {currentPlan === 'trial' ? (
            <div className="py-3 text-center text-[#A7B0AD] text-sm bg-[#070A0A] rounded-[12px] border border-[#1A2321]">
              Currently Active
            </div>
          ) : (
            <div className="py-3 text-center text-[#4A5553] text-sm">
              Trial Completed
            </div>
          )}
        </div>

        {/* Pro Plan Card */}
        <div className={`relative bg-gradient-to-br from-[#0E3B2E] to-[#0D1211] border-2 rounded-[18px] p-6 transition-all ${
          currentPlan === 'pro' 
            ? 'border-[#38F28D] shadow-[0_0_40px_rgba(56,242,141,0.15)]' 
            : 'border-[#38F28D]/50'
        }`}>
          {/* Popular Badge */}
          {currentPlan !== 'pro' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-[#38F28D] text-[#070A0A] rounded-full text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                RECOMMENDED
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#38F28D]/20 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#38F28D]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F2F5F4]">Agentaria Pro</h3>
                <p className="text-xs text-[#A7B0AD]">Full Access</p>
              </div>
            </div>
            {currentPlan === 'pro' && (
              <span className="px-3 py-1 bg-[#38F28D]/20 text-[#38F28D] rounded-full text-xs font-semibold border border-[#38F28D]/30">
                Current Plan
              </span>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-[#F2F5F4]">$59</span>
              <span className="text-[#A7B0AD]">/month</span>
            </div>
            <p className="text-sm text-[#A7B0AD]">Cancel anytime</p>
          </div>

          <div className="space-y-3 mb-6">
            {PRO_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="flex items-center gap-3 text-sm text-[#F2F5F4]">
                  <div className="w-5 h-5 rounded-full bg-[#38F28D]/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#38F28D]" />
                  </div>
                  {feature.text}
                </div>
              );
            })}
          </div>

          {currentPlan === 'pro' ? (
            <button
              disabled
              className="w-full py-3 bg-[#38F28D]/20 text-[#38F28D] rounded-[12px] font-semibold border border-[#38F28D]/30 cursor-not-allowed"
            >
              <Check className="w-5 h-5 inline mr-2" />
              Current Plan
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full py-3 bg-[#38F28D] text-[#070A0A] rounded-[12px] font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(56,242,141,0.4)] hover:scale-[1.02] transition-all disabled:opacity-70"
            >
              {upgrading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Upgrade to Pro
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#6B8AFF]/10 rounded-full flex items-center justify-center">
            <Receipt className="w-5 h-5 text-[#6B8AFF]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F2F5F4]">Billing History</h3>
            <p className="text-sm text-[#A7B0AD]">View and download past invoices</p>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-hidden rounded-[12px] border border-[#1A2321]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#070A0A]">
                <th className="text-left px-4 py-3 text-sm font-semibold text-[#A7B0AD]">Date</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-[#A7B0AD]">Description</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-[#A7B0AD]">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-[#A7B0AD]">Status</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-[#A7B0AD]">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {currentPlan === 'pro' ? (
                DUMMY_INVOICES.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-[#1A2321] hover:bg-[#070A0A]/50 transition-colors">
                    <td className="px-4 py-4 text-sm text-[#F2F5F4]">{formatDate(invoice.date)}</td>
                    <td className="px-4 py-4 text-sm text-[#A7B0AD]">Agentaria Pro - Monthly</td>
                    <td className="px-4 py-4 text-sm text-[#F2F5F4] font-medium">{formatCurrency(invoice.amount)}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-[#38F28D]/10 text-[#38F28D] rounded text-xs font-medium">
                        Paid
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button className="p-2 text-[#A7B0AD] hover:text-[#38F28D] hover:bg-[#38F28D]/10 rounded-[8px] transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <div className="text-[#A7B0AD]">
                      <Receipt className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No billing history yet</p>
                      <p className="text-xs text-[#4A5553] mt-1">Invoices will appear here after your first payment</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {currentPlan === 'pro' ? (
            DUMMY_INVOICES.map((invoice) => (
              <div key={invoice.id} className="bg-[#070A0A] border border-[#1A2321] rounded-[12px] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-[#F2F5F4]">{formatDate(invoice.date)}</p>
                    <p className="text-xs text-[#A7B0AD]">Agentaria Pro</p>
                  </div>
                  <span className="px-2 py-1 bg-[#38F28D]/10 text-[#38F28D] rounded text-xs font-medium">
                    Paid
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#F2F5F4]">{formatCurrency(invoice.amount)}</span>
                  <button className="p-2 text-[#A7B0AD] hover:text-[#38F28D] hover:bg-[#38F28D]/10 rounded-[8px] transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#070A0A] border border-[#1A2321] rounded-[12px] p-6 text-center">
              <Receipt className="w-10 h-10 mx-auto mb-3 text-[#A7B0AD] opacity-50" />
              <p className="text-sm text-[#A7B0AD]">No billing history yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-[#070A0A] border border-[#1A2321] rounded-[14px] p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#6B8AFF] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[#F2F5F4] text-sm font-medium mb-1">Need help with billing?</p>
            <p className="text-[#A7B0AD] text-xs">
              Contact our support team at{' '}
              <a href="mailto:support@agentaria.com" className="text-[#38F28D] hover:underline">
                support@agentaria.com
              </a>
              {' '}for any billing questions or issues.
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3 rounded-[12px] shadow-lg z-50 animate-slide-up ${
          toast.type === 'success' 
            ? 'bg-[#0E3B2E] border border-[#38F28D]/30 text-[#38F28D]'
            : 'bg-[#3B1A1A] border border-[#FF6B6B]/30 text-[#FF6B6B]'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast({ show: false, type: '', message: '' })} className="ml-2 opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        * { font-family: 'Sora', system-ui, sans-serif; }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default BillingPage;