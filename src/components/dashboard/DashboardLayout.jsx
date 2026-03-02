import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

const DashboardLayout = ({ children, currentPage = 'dashboard' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [isWhatsappConnected, setIsWhatsappConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { navigate('/login'); return; }
      const { data: subscriberData, error: dbError } = await supabase
        .from('subscribers details')
        .select('full_name, email, business_name')
        .eq('subscriber_id', user.id)
        .single();
      if (dbError) {
        setUser({ name: user.user_metadata?.full_name || 'User', email: user.email, avatar: (user.user_metadata?.full_name || 'U')[0].toUpperCase() });
      } else {
        setUser({ name: subscriberData.full_name || subscriberData.business_name || 'User', email: subscriberData.email || user.email, avatar: (subscriberData.full_name || 'U')[0].toUpperCase() });
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    document.documentElement.style.fontSize = '13.5px';
    return () => { document.documentElement.style.fontSize = '16px'; };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // ✅ TASK 1: Flat list — active features only
  const mainNavigation = [
    { name: 'Dashboard',             key: 'dashboard', href: '/dashboard',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { name: 'WhatsApp Connection',   key: 'whatsapp',  href: '/dashboard/whatsapp', isFilled: true,
      icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor" /> },
    { name: 'Chat Management',       key: 'chats',     href: '/dashboard/chats',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /> },
    { name: 'Client Re-Opener',      key: 'reopener',  href: '/dashboard/reopener',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> },
    { name: 'Business Settings',     key: 'settings',  href: '/dashboard/settings',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /> },
    { name: 'Feedback & Reviews',    key: 'reviews',   href: '/dashboard/reviews',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /> },
    { name: 'Subscription & Billing',key: 'billing',   href: '/dashboard/billing',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /> },
    { name: 'Profile Settings',      key: 'profile',   href: '/dashboard/profile',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
  ];

  // ✅ TASK 2: Upcoming features — locked
  const upcomingFeatures = [
    { name: 'FB & Insta Inbox',      key: 'fb-insta',    href: '/dashboard/coming-soon',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
    { name: 'Smart Bookings',        key: 'bookings',    href: '/dashboard/coming-soon',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
    { name: 'Missed Call Recovery',  key: 'missed-call', href: '/dashboard/coming-soon',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /> },
    { name: 'Smart Payments',        key: 'payments',    href: '/dashboard/coming-soon',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /> },
  ];

  const isFullHeightPage = currentPage === 'chats';

  return (
    <div className="h-screen bg-[#070A0A] text-[#F2F5F4] overflow-hidden flex flex-col">

      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 bg-[#0D1211] border-b border-[#1A2321] z-50 h-16">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 hover:bg-[#1A2321] rounded-[8px]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)} className="hidden lg:block p-2 hover:bg-[#1A2321] rounded-[8px] text-[#A7B0AD]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="relative text-xl md:text-2xl font-bold tracking-tight select-none inline-block min-w-max">
              <span className="text-[#F2F5F4]">Agentaria</span>
              <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-[#38F28D] to-transparent rounded-full shadow-[0_0_8px_rgba(56,242,141,0.5)]" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationDropdown />
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

      {/* Sidebar — w-72 */}
      <aside className={`fixed left-0 top-16 bottom-0 w-72 bg-[#0D1211] border-r border-[#1A2321] transition-transform duration-300 z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isDesktopSidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-72'}`}>
        <nav className="p-3 h-full overflow-y-auto overflow-x-hidden pb-20 scrollbar-hide">

          {/* ✅ TASK 3: Active nav items */}
          <div className="space-y-0.5">
            {mainNavigation.map((item) => {
              const isActive = currentPage === item.key;
              return (
                <a key={item.key} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[11px] transition-all duration-200 w-full
                    ${isActive
                      ? 'bg-[#0E3B2E] text-[#38F28D]'
                      : 'text-[#A7B0AD] hover:bg-[#1A2321] hover:text-[#F2F5F4]'
                    }`}
                >
                  <svg className="w-[18px] h-[18px] flex-shrink-0"
                    fill={item.isFilled ? 'currentColor' : 'none'}
                    stroke={item.isFilled ? 'none' : 'currentColor'}
                    viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                  <span className="font-medium text-[13px] flex-1 leading-none">{item.name}</span>

                  {/* Dynamic WhatsApp badge */}
                  {item.key === 'whatsapp' && !isWhatsappConnected && currentPage !== 'whatsapp' && (
                    <span className="px-1.5 py-0.5 bg-[#38F28D] text-[#070A0A] text-[9px] font-bold rounded-full whitespace-nowrap">
                      Connect
                    </span>
                  )}
                  {item.key === 'whatsapp' && isWhatsappConnected && (
                    <span className="w-2 h-2 rounded-full bg-[#38F28D] shadow-[0_0_5px_rgba(56,242,141,0.8)]" />
                  )}
                </a>
              );
            })}
          </div>

          {/* ✅ TASK 3: Divider + Upcoming section */}
          <div className="border-t border-[#1A2321] my-4 pt-4">
            <p className="px-3 pb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#A7B0AD]/40 select-none">
              Upcoming Features
            </p>
            <div className="space-y-0.5">
              {upcomingFeatures.map((item) => (
                <a key={item.key} href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[11px] w-full pointer-events-none text-[#A7B0AD]/35"
                >
                  <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                  <span className="font-medium text-[13px] flex-1 leading-none">{item.name}</span>
                  <span className="px-1.5 py-0.5 bg-[#1A2321]/80 text-[#A7B0AD]/40 text-[9px] font-semibold rounded-full whitespace-nowrap">
                    🔒 Soon
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-[#1A2321] mt-2 pt-2">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[11px] text-[#A7B0AD] hover:bg-red-500/10 hover:text-red-400 transition-all duration-200">
              <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium text-[13px]">Logout</span>
            </button>
          </div>

        </nav>
      </aside>

      {/* Main Content — pl-72 */}
      <main className={`pt-16 transition-all duration-300 flex-1 flex flex-col min-h-0 ${isDesktopSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'}`}>
        {isFullHeightPage ? (
          <div className="flex-1 min-h-0 overflow-hidden relative">{children}</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        )}
      </main>

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