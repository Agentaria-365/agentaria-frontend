import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown'; // ✅ Saved your component

const DashboardLayout = ({ children, currentPage = 'dashboard' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // User Fetching Logic
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        navigate('/login');
        return;
      }

      const { data: subscriberData, error: dbError } = await supabase
        .from('subscribers details')
        .select('full_name, email, business_name')
        .eq('subscriber_id', user.id)
        .single();

      if (dbError) {
        setUser({
          name: user.user_metadata?.full_name || 'User',
          email: user.email,
          avatar: (user.user_metadata?.full_name || 'U')[0].toUpperCase()
        });
      } else {
        setUser({
          name: subscriberData.full_name || subscriberData.business_name || 'User',
          email: subscriberData.email || user.email,
          avatar: (subscriberData.full_name || 'U')[0].toUpperCase()
        });
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />, href: '/dashboard', key: 'dashboard' },
    { name: 'WhatsApp Connection', icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor" />, href: '/dashboard/whatsapp', key: 'whatsapp', badge: 'Connect' },
    { name: 'Chat Management', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />, href: '/dashboard/chats', key: 'chats' },
    { name: 'Client Re-Opener', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />, href: '/dashboard/reopener', key: 'reopener' },
    { name: 'Business Settings', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />, href: '/dashboard/settings', key: 'settings' },
    { name: 'Feedback & Reviews', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />, href: '/dashboard/reviews', key: 'reviews' },
    { name: 'Subscription & Billing', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />, href: '/dashboard/billing', key: 'billing' },
    { name: 'Profile Settings', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />, href: '/dashboard/profile', key: 'profile' }
  ];

  // ✅ CRITICAL: This logic removes padding for the Chat page only
  const isFullHeightPage = currentPage === 'chats';

  return (
    <div className="h-screen bg-[#070A0A] text-[#F2F5F4] overflow-hidden flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-[#0D1211] border-b border-[#1A2321] z-50 h-16">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Toggle */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 hover:bg-[#1A2321] rounded-[8px]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            
            {/* Desktop Toggle */}
            <button onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)} className="hidden lg:block p-2 hover:bg-[#1A2321] rounded-[8px] text-[#A7B0AD]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            <div className="text-2xl font-bold">
              <span className="text-[#38F28D]">Agent</span><span className="text-[#F2F5F4]">aria</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* ✅ NOTIFICATION DROPDOWN RESTORED */}
            <NotificationDropdown />

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-[#1A2321]">
              <div className="w-10 h-10 bg-[#0E3B2E] rounded-full flex items-center justify-center text-[#38F28D] font-bold">
                {user ? user.avatar : 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold">{user ? user.name : '...'}</div>
                <div className="text-xs text-[#A7B0AD]">{user ? user.email : ''}</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-[#0D1211] border-r border-[#1A2321] transition-transform duration-300 z-40 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        ${isDesktopSidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-64'}
      `}>
        <nav className="p-4 space-y-2 h-full overflow-y-auto">
          {navigation.map((item) => (
            <a key={item.key} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-300 ${currentPage === item.key ? 'bg-[#0E3B2E] text-[#38F28D]' : 'text-[#A7B0AD] hover:bg-[#1A2321] hover:text-[#F2F5F4]'}`}>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
              <span className="font-medium whitespace-nowrap">{item.name}</span>
              {item.badge && <span className="ml-auto px-2 py-0.5 bg-[#38F28D] text-[#070A0A] text-xs font-bold rounded-full">{item.badge}</span>}
            </a>
          ))}
          
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[#A7B0AD] hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 mt-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* ✅ MAIN CONTENT - FIXED SCROLLING LOGIC */}
      <main className={`pt-16 transition-all duration-300 flex-1 flex flex-col min-h-0 ${isDesktopSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
        {isFullHeightPage ? (
          // For Chat Page: No padding, handled by child
          <div className="flex-1 min-h-0 overflow-hidden relative">
            {children}
          </div>
        ) : (
          // For Normal Pages: Padding + Scroll
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        )}
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        * { font-family: 'Sora', sans-serif; }
      `}</style>
    </div>
  );
};

export default DashboardLayout;