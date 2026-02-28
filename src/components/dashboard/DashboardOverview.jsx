import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, FileText, Star, CheckCircle2, ChevronRight, Zap, PartyPopper } from 'lucide-react';

// ─── Setup Progress Widget ─────────────────────────────────────────────────────
const SetupProgressWidget = ({ userId }) => {
  const navigate = useNavigate();
  const [checks, setChecks] = useState({ whatsapp: null, pdf: null, review: null });
  const [barAnimated, setBarAnimated] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchChecks = async () => {
      const [waRes, pdfRes, revRes] = await Promise.all([
        // WhatsApp: instance_status === 'active'?
        supabase
          .from('subscribers details')
          .select('instance_status')
          .eq('subscriber_id', userId)
          .single(),

        // PDF: at least 1 row in doc_chunks?
        supabase
          .from('doc_chunks')
          .select('id', { count: 'exact', head: true })
          .eq('subscriber_id', userId),

        // Review link: at least 1 row in review_links?
        supabase
          .from('review_links')
          .select('id', { count: 'exact', head: true })
          .eq('subscriber_id', userId),
      ]);

      setChecks({
        whatsapp: waRes.data?.instance_status === 'active',
        pdf:      (pdfRes.count ?? 0) > 0,
        review:   (revRes.count ?? 0) > 0,
      });

      // Tiny delay so the bar animates visibly on mount
      setTimeout(() => setBarAnimated(true), 150);
    };

    fetchChecks();
  }, [userId]);

  const isLoading = checks.whatsapp === null;

  // Score
  const score = 40
    + (checks.whatsapp ? 20 : 0)
    + (checks.pdf      ? 20 : 0)
    + (checks.review   ? 20 : 0);

  const isComplete = score === 100;

  // Dynamic bar colour
  const barColor = score === 100 ? '#38F28D'
                 : score >= 60   ? '#38F28D'
                 :                 '#F2C838';

  // Action items shown when step is missing
  const actions = [
    !checks.whatsapp && {
      key:   'whatsapp',
      icon:  Wifi,
      label: 'Connect WhatsApp',
      desc:  'Your agent needs a live number to operate.',
      route: '/dashboard/whatsapp',
      pts:   '+20%',
    },
    !checks.pdf && {
      key:   'pdf',
      icon:  FileText,
      label: 'Upload Knowledge Base',
      desc:  'Give your agent your business rules & FAQs.',
      route: '/dashboard/settings',
      pts:   '+20%',
    },
    !checks.review && {
      key:   'review',
      icon:  Star,
      label: 'Add Review Link',
      desc:  'Enable automatic 5-star review collection.',
      route: '/dashboard/reviews',
      pts:   '+20%',
    },
  ].filter(Boolean);

  // Step dots config
  const dots = [
    { label: 'Signed up',  done: true              },
    { label: 'WhatsApp',   done: checks.whatsapp   },
    { label: 'Knowledge',  done: checks.pdf        },
    { label: 'Reviews',    done: checks.review     },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`relative mb-8 rounded-[22px] overflow-hidden border
                  ${isComplete
                    ? 'bg-gradient-to-br from-[#071A11] to-[#0D1211] border-[#38F28D]/30'
                    : 'bg-[#0D1211] border-[#1A2321]'
                  }`}
    >
      {/* Glow overlay when complete */}
      {isComplete && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[600px] h-[140px]
                          bg-[#38F28D]/6 blur-[70px] rounded-full" />
        </div>
      )}

      <div className="relative px-6 py-5">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon badge */}
            <div className={`w-10 h-10 rounded-[11px] flex items-center justify-center flex-shrink-0 transition-all duration-500
                            ${isComplete
                              ? 'bg-[#38F28D] shadow-[0_0_18px_rgba(56,242,141,0.45)]'
                              : 'bg-[#0E3B2E]'}`}>
              {isComplete
                ? <PartyPopper size={18} className="text-[#070A0A]" />
                : <Zap size={18} className="text-[#38F28D]" />
              }
            </div>
            <div>
              <p className="text-[#F2F5F4] font-semibold text-sm leading-tight">
                {isComplete ? 'Agentaria is fully set up!' : 'Complete Your Setup'}
              </p>
              <p className="text-[#A7B0AD] text-xs mt-0.5">
                {isComplete
                  ? 'Your agent is live and working for you.'
                  : 'Finish the steps below to unlock your agent\'s full power.'}
              </p>
            </div>
          </div>

          {/* Percentage badge */}
          <motion.span
            key={score}
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl font-bold tabular-nums flex-shrink-0"
            style={{ color: barColor }}
          >
            {isLoading ? '…' : `${score}%`}
          </motion.span>
        </div>

        {/* ── Progress bar ────────────────────────────────────────────────────── */}
        <div className="w-full h-2 bg-[#1A2321] rounded-full overflow-hidden mb-2">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: barColor }}
            initial={{ width: '40%' }}
            animate={{ width: barAnimated ? `${score}%` : '40%' }}
            transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* ── Step dots ───────────────────────────────────────────────────────── */}
        {!isLoading && (
          <div className="flex items-start justify-between mb-5 px-0.5">
            {dots.map((dot, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <motion.div
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.35 }}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-500
                              ${dot.done
                                ? 'bg-[#38F28D] border-[#38F28D] shadow-[0_0_8px_rgba(56,242,141,0.55)]'
                                : 'bg-[#070A0A] border-[#2A3331]'}`}
                >
                  {dot.done && (
                    <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3.5 6L6.5 2" stroke="#070A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </motion.div>
                <span className={`text-[9px] font-medium leading-none
                                  ${dot.done ? 'text-[#38F28D]' : 'text-[#A7B0AD]/55'}`}>
                  {dot.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Loading shimmer ─────────────────────────────────────────────────── */}
        {isLoading && (
          <div className="flex gap-3 mt-3 mb-1">
            {[1, 2, 3].map((i) => (
              <div key={i}
                className="flex-1 h-[56px] bg-[#1A2321] rounded-[12px] animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}

        {/* ── Action items (missing steps) ────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {!isLoading && !isComplete && actions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {actions.map((action, i) => (
                <motion.button
                  key={action.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.09, duration: 0.4 }}
                  onClick={() => navigate(action.route)}
                  className="group flex items-center gap-3 bg-[#070A0A] border border-[#1A2321]
                             rounded-[14px] px-4 py-3 text-left w-full
                             hover:border-[#38F28D]/35 hover:-translate-y-0.5
                             hover:shadow-[0_6px_24px_rgba(56,242,141,0.09)]
                             transition-all duration-200"
                >
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-[9px] bg-[#0E3B2E]/70 flex items-center justify-center
                                  flex-shrink-0 group-hover:bg-[#0E3B2E] transition-colors duration-200">
                    <action.icon size={14} className="text-[#38F28D]" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F2F5F4] text-xs font-semibold leading-tight truncate">
                      {action.label}
                    </p>
                    <p className="text-[#A7B0AD] text-[10px] mt-0.5 leading-tight truncate">
                      {action.desc}
                    </p>
                  </div>

                  {/* Points + arrow */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[9px] font-bold text-[#38F28D] bg-[#0E3B2E]
                                     px-1.5 py-0.5 rounded-full leading-none">
                      {action.pts}
                    </span>
                    <ChevronRight size={12} className="text-[#A7B0AD] group-hover:text-[#38F28D]
                                                       group-hover:translate-x-0.5 transition-all duration-200" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* ── 100% Complete success banner ─────────────────────────────────── */}
          {!isLoading && isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 bg-[#0E3B2E]/40 border border-[#38F28D]/20
                         rounded-[14px] px-5 py-3.5"
            >
              <CheckCircle2 size={17} className="text-[#38F28D] flex-shrink-0" />
              <p className="text-[#F2F5F4] text-sm font-medium">
                🎉 Your Agentaria is fully set up and ready!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
};


// ─── Dashboard Overview ────────────────────────────────────────────────────────
const DashboardOverview = () => {
  const [userId, setUserId] = useState(null);
  const [stats, setStats] = useState({
    activeConversations: 0,
    messagesHandled: 0,
    clientsReopened: 0,
    reviewsCollected: 0
  });
  const [recentHandovers, setRecentHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleHandoverRead = () => fetchDashboardData();
    window.addEventListener('handoverUpdated', handleHandoverRead);

    fetchDashboardData();

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rag_database' }, () => fetchDashboardData())
      .subscribe();

    return () => {
      window.removeEventListener('handoverUpdated', handleHandoverRead);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Store userId for the progress widget
    setUserId(user.id);

    // 1. Fetch Stats
    const { count: activeCount } = await supabase
      .from('rag_database')
      .select('*', { count: 'exact', head: true })
      .eq('subscriber_id', user.id);

    setStats({
      activeConversations: activeCount || 0,
      messagesHandled: (activeCount || 0) * 12,
      clientsReopened: 0,
      reviewsCollected: 0
    });

    // 2. Fetch Recent Handovers
    const { data: handoverData } = await supabase
      .from('rag_database')
      .select('*')
      .eq('subscriber_id', user.id)
      .eq('status', 'human_handle')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (handoverData) {
      const seen = JSON.parse(localStorage.getItem('seenHandovers') || '[]');
      const unreadHandovers = handoverData.filter(h => !seen.includes(String(h.id)));

      const formattedHandovers = unreadHandovers.map(item => {
        const history = Array.isArray(item.conversation) ? item.conversation : [];
        const lastMsg = history.length > 0 ? history[history.length - 1] : {};
        return {
          id: item.id,
          client: item.client_number,
          reason: lastMsg.content || 'Manual intervention required',
          time: new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });
      setRecentHandovers(formattedHandovers);
    }

    setLoading(false);
  };

  const handleViewConversation = (id) => {
    navigate(`/dashboard/chats?id=${id}&source=rag`);
  };

  const handleDismiss = (id) => {
    const seen = JSON.parse(localStorage.getItem('seenHandovers') || '[]');
    if (!seen.includes(String(id))) {
      const newSeen = [...seen, String(id)];
      localStorage.setItem('seenHandovers', JSON.stringify(newSeen));
      fetchDashboardData();
      window.dispatchEvent(new Event('handoverUpdated'));
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-[#A7B0AD] text-lg">Welcome back! Here's your overview.</p>
      </div>

      {/* ── Setup Progress Widget (injected at top) ── */}
      <SetupProgressWidget userId={userId} />

      {/* ── Stats Grid ── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Active Conversations', value: stats.activeConversations, iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: '#38F28D' },
          { label: 'Messages Handled', value: stats.messagesHandled, iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: '#F2F5F4' },
          { label: 'Clients Re-opened', value: stats.clientsReopened, iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', color: '#F2F5F4' },
          { label: 'Reviews Collected', value: stats.reviewsCollected, iconPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: '#F2F5F4' }
        ].map((stat, i) => (
          <div key={i} className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-6 hover:border-[#38F28D]/30 hover:shadow-[0_8px_30px_rgba(56,242,141,0.1)] transition-all duration-500">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-[#38F28D]/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#38F28D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.iconPath} />
                </svg>
              </div>
              {i === 1 && <span className="text-xs text-[#38F28D]">+23% today</span>}
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-sm text-[#A7B0AD]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Handovers */}
        <div className="lg:col-span-2 bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Handovers</h2>
            <button onClick={() => navigate('/dashboard/chats')} className="text-[#38F28D] text-sm hover:underline">
              View all →
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-[#A7B0AD] py-4">Loading...</div>
            ) : recentHandovers.length === 0 ? (
              <div className="text-center text-[#A7B0AD] py-8 bg-[#1A2321]/30 rounded-[12px]">
                🎉 No pending handovers!
              </div>
            ) : (
              recentHandovers.map((handover) => (
                <div key={handover.id} className="bg-[#070A0A] border border-[#1A2321] rounded-[14px] p-4 hover:border-[#38F28D]/30 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#0E3B2E] rounded-full flex items-center justify-center text-[#38F28D] font-bold">!</div>
                      <div>
                        <div className="font-semibold mb-1 text-[#F2F5F4]">{handover.client}</div>
                        <div className="text-sm text-[#A7B0AD] line-clamp-1">{handover.reason}</div>
                      </div>
                    </div>
                    <div className="text-xs text-[#A7B0AD]">{handover.time}</div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleViewConversation(handover.id)}
                      className="flex-1 bg-[#38F28D] text-[#070A0A] px-4 py-2 rounded-[10px] text-sm font-semibold hover:scale-[1.02] transition-all duration-300"
                    >
                      View Conversation
                    </button>
                    <button
                      onClick={() => handleDismiss(handover.id)}
                      className="px-4 py-2 border border-[#1A2321] rounded-[10px] text-sm hover:border-[#38F28D]/30 transition-all duration-300"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-6">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button onClick={() => navigate('/dashboard/reopener')} className="w-full block bg-[#070A0A] border border-[#1A2321] rounded-[14px] p-4 hover:border-[#38F28D]/30 hover:shadow-[0_4px_20px_rgba(56,242,141,0.1)] transition-all duration-300 group text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#38F28D]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-[#38F28D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                <div><div className="font-semibold">Upload CSV</div><div className="text-xs text-[#A7B0AD]">Start new campaign</div></div>
              </div>
            </button>
            <button onClick={() => navigate('/dashboard/settings')} className="w-full block bg-[#070A0A] border border-[#1A2321] rounded-[14px] p-4 hover:border-[#38F28D]/30 hover:shadow-[0_4px_20px_rgba(56,242,141,0.1)] transition-all duration-300 group text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#38F28D]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-[#38F28D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <div><div className="font-semibold">Edit AI Instructions</div><div className="text-xs text-[#A7B0AD]">Customize responses</div></div>
              </div>
            </button>
            <button onClick={() => navigate('/dashboard/reviews')} className="w-full block bg-[#070A0A] border border-[#1A2321] rounded-[14px] p-4 hover:border-[#38F28D]/30 hover:shadow-[0_4px_20px_rgba(56,242,141,0.1)] transition-all duration-300 group text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#38F28D]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-[#38F28D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <div><div className="font-semibold">View Feedback</div><div className="text-xs text-[#A7B0AD]">Check responses</div></div>
              </div>
            </button>
          </div>
          <div className="mt-6 bg-gradient-to-br from-[#0E3B2E] to-[#070A0A] border border-[#38F28D]/30 rounded-[14px] p-4">
            <div className="text-sm font-semibold mb-1">Free Trial Active</div>
            <div className="text-xs text-[#A7B0AD] mb-3">2 days remaining</div>
            <button onClick={() => navigate('/dashboard/billing')} className="inline-block text-xs text-[#38F28D] font-semibold hover:underline">Upgrade Now →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
