import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../config/supabase';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const currentChatId = searchParams.get('id');

  useEffect(() => {
    // Listener for read/dismiss actions
    const handleHandoverRead = () => fetchHandovers();
    window.addEventListener('handoverUpdated', handleHandoverRead);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('handoverUpdated', handleHandoverRead);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchHandovers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('rag_database')
      .select('id, client_number, conversation, updated_at')
      .eq('subscriber_id', user.id)
      .eq('status', 'human_handle')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      // ✅ READ STATE LOGIC: Filter out IDs stored in localStorage
      const seen = JSON.parse(localStorage.getItem('seenHandovers') || '[]');
      const unreadHandovers = data.filter(h => !seen.includes(String(h.id)));

      const formattedData = unreadHandovers.map(item => {
        const history = Array.isArray(item.conversation) ? item.conversation : [];
        const lastMsgObj = history.length > 0 ? history[history.length - 1] : {};
        const lastMsgText = lastMsgObj.content || lastMsgObj.message || lastMsgObj.text || 'Check chat...';

        return {
          id: item.id,
          contact_name: item.client_number,
          reason: 'Manual Assistance Required',
          last_message_at: item.updated_at,
          preview: lastMsgText
        };
      });
      setHandovers(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHandovers();
    const channel = supabase
      .channel('rag-handover-alerts')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rag_database' }, () => fetchHandovers())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const activeNotifications = handovers.filter(h => String(h.id) !== String(currentChatId));

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[#1A2321] rounded-[8px] transition-colors"
      >
        <svg className="w-6 h-6 text-[#A7B0AD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {activeNotifications.length > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#F2A838] text-[#070A0A] text-[10px] font-bold rounded-full flex items-center justify-center border border-[#070A0A]">
            {activeNotifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#0D1211] border border-[#1A2321] rounded-[14px] shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-[#1A2321] flex justify-between items-center">
            <h3 className="text-[#F2F5F4] font-semibold text-sm">Handover Alerts</h3>
            <span className="text-[#A7B0AD] text-xs">{activeNotifications.length} Pending</span>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {activeNotifications.length === 0 ? (
              <div className="p-6 text-center text-[#A7B0AD] text-sm">
                No new alerts ✅
              </div>
            ) : (
              activeNotifications.map((item) => (
                <div key={item.id} className="p-3 border-b border-[#1A2321] hover:bg-[#1A2321]/50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[#F2F5F4] text-sm font-medium">{item.contact_name}</span>
                    <span className="text-[#A7B0AD] text-[10px]">{new Date(item.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-[#F2A838] text-xs mb-1 line-clamp-1">
                    ⚡ {item.reason}
                  </p>
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/dashboard/chats?id=${item.id}&source=rag`); 
                    }}
                    className="w-full text-center bg-[#38F28D]/10 text-[#38F28D] text-xs py-1.5 rounded-[6px] hover:bg-[#38F28D]/20 transition-colors font-medium"
                  >
                    View Chat
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;