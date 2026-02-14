import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';

const DashboardOverview = () => {
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
    // Listener to refresh data if something changes elsewhere
    const handleHandoverRead = () => fetchDashboardData();
    window.addEventListener('handoverUpdated', handleHandoverRead);

    fetchDashboardData();

    // Realtime Subscription
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

    // 1. Fetch Stats (Real Counts)
    const { count: activeCount } = await supabase
      .from('rag_database')
      .select('*', { count: 'exact', head: true })
      .eq('subscriber_id', user.id);

    setStats({
      activeConversations: activeCount || 0,
      messagesHandled: (activeCount || 0) * 12, // Estimate metric
      clientsReopened: 0, // Placeholder
      reviewsCollected: 0 // Placeholder
    });

    // 2. Fetch Recent Handovers
    const { data: handoverData } = await supabase
      .from('rag_database')
      .select('*')
      .eq('subscriber_id', user.id)
      .eq('status', 'human_handle')
      .order('updated_at', { ascending: false })
      .limit(5); // Fetch top 5

    if (handoverData) {
      // ✅ FILTER: LocalStorage se check karo ke user ne dismiss to nahi kiya
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

  // ✅ FIX: View Conversation ab ID aur Source dono bhejta hai
  const handleViewConversation = (id) => {
    navigate(`/dashboard/chats?id=${id}&source=rag`);
  };

  // ✅ FIX: Dismiss Logic Add Ho Gayi Hai
  const handleDismiss = (id) => {
    const seen = JSON.parse(localStorage.getItem('seenHandovers') || '[]');
    if (!seen.includes(String(id))) {
      const newSeen = [...seen, String(id)];
      localStorage.setItem('seenHandovers', JSON.stringify(newSeen));
      fetchDashboardData(); // Refresh UI immediately
      window.dispatchEvent(new Event('handoverUpdated')); // Notify Notifications Dropdown
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-[#A7B0AD] text-lg">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Grid (Optimized Loop) */}
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