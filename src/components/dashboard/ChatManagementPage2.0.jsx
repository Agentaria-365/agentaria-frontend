import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import {
  MessageSquare,
  Search,
  X,
  Send,
  Loader2,
  Star,
  Megaphone,
  Inbox,
  AlertCircle,
  Users,
  HandMetal,
  Bot,
  User,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

// ============================================================
// N8N WEBHOOK URL
// ============================================================
const N8N_SEND_WEBHOOK = 'https://n8n.srv1192286.hstgr.cloud/webhook/send-message';

// ============================================================
// SOURCE CONFIG (For Badges & Icons)
// ============================================================
const SOURCE_CONFIG = {
  rag: { 
    label: 'Chat', 
    icon: MessageSquare, 
    color: '#38F28D', 
    bg: 'rgba(56,242,141,0.12)' 
  },
  opener: { 
    label: 'Campaign', 
    icon: Megaphone, 
    color: '#6B8AFF', 
    bg: 'rgba(107,138,255,0.12)' 
  },
  feedback: { 
    label: 'Review', 
    icon: Star, 
    color: '#F2A838', 
    bg: 'rgba(242,168,56,0.12)' 
  },
  bulk: { 
    label: 'Bulk', 
    icon: Users, 
    color: '#A7B0AD', 
    bg: 'rgba(167,176,173,0.12)' 
  }
};

// ============================================================
// STATUS CONFIG
// ============================================================
const STATUS_CONFIG = {
  // --- Standard Chat Statuses ---
  open: { label: 'Open', color: '#38F28D', bg: 'rgba(56,242,141,0.12)', border: 'rgba(56,242,141,0.3)' },
  handover: { label: 'Handover', color: '#F2A838', bg: 'rgba(242,168,56,0.12)', border: 'rgba(242,168,56,0.3)' },
  human_handle: { label: 'Handover', color: '#F2A838', bg: 'rgba(242,168,56,0.12)', border: 'rgba(242,168,56,0.3)' },
  closed: { label: 'Closed', color: '#6B8AFF', bg: 'rgba(107,138,255,0.12)', border: 'rgba(107,138,255,0.3)' },
  resolved: { label: 'Resolved', color: '#6B8AFF', bg: 'rgba(107,138,255,0.12)', border: 'rgba(107,138,255,0.3)' },
  agent: { label: 'AI Agent', color: '#38F28D', bg: 'rgba(56,242,141,0.12)', border: 'rgba(56,242,141,0.3)' }, 
  
  // --- Review/Feedback Specific Statuses ---
  sent: { label: 'Sent', color: '#F2A838', bg: 'rgba(242,168,56,0.12)', border: 'rgba(242,168,56,0.3)' },
  requested: { label: 'Requested', color: '#6B8AFF', bg: 'rgba(107,138,255,0.12)', border: 'rgba(107,138,255,0.3)' },
  forward: { label: 'Forwarded', color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)', border: 'rgba(255,107,107,0.3)' },
  done: { label: 'Completed', color: '#38F28D', bg: 'rgba(56,242,141,0.12)', border: 'rgba(56,242,141,0.3)' },
};

// ============================================================
// TAB CONFIG
// ============================================================
const TABS = [
  { key: 'all', label: 'All', icon: Inbox, description: 'Unified inbox' },
  { key: 'open', label: 'Open', icon: MessageSquare, description: 'Active chats' },
  { key: 'handover', label: 'Handover', icon: HandMetal, description: 'Needs attention' },
  { key: 'campaigns', label: 'Campaigns', icon: Megaphone, description: 'Re-opener leads' },
  { key: 'reviews', label: 'Reviews', icon: Star, description: 'Feedback & reviews' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'Just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function getLastMessageFromConversation(conversation) {
  if (!conversation) return { text: 'No messages', timestamp: null };
  const history = Array.isArray(conversation) ? conversation : [];
  if (history.length === 0) return { text: 'Start of conversation', timestamp: null };
  const lastMsg = history[history.length - 1];
  return {
    text: lastMsg?.text || lastMsg?.content || lastMsg?.message || 'Message',
    timestamp: lastMsg?.timestamp || lastMsg?.ts || lastMsg?.created_at || null
  };
}

function getLatestTimestamp(item) {
  const timestamps = [
    item.updated_at,
    item.last_message_at,
    item.created_at,
    item.opener_sent_at
  ].filter(Boolean);
  
  if (timestamps.length === 0) return new Date(0);
  return new Date(Math.max(...timestamps.map(t => new Date(t).getTime())));
}

// ============================================================
// MAIN COMPONENT
// ============================================================
const ChatManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [userId, setUserId] = useState(null);
  const [instanceName, setInstanceName] = useState(null);
  
  const [allChats, setAllChats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [sourceTable, setSourceTable] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  // ============================================================
  // FETCH USER & INSTANCE
  // ============================================================
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from('subscribers details')
          .select('instance_name')
          .eq('subscriber_id', user.id)
          .single();
        if (data) setInstanceName(data.instance_name);
      }
    };
    fetchUser();
  }, []);

  // ============================================================
  // FETCH ALL CHATS FROM 3 TABLES
  // ============================================================
  const fetchAllChats = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const [ragResult, openerResult, feedbackResult] = await Promise.all([
        supabase
          .from('rag_database')
          .select('*')
          .eq('subscriber_id', userId)
          .order('updated_at', { ascending: false }),
        
        supabase
          .from('opener_sent_clients')
          .select('*')
          .eq('subscriber_id', userId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('feedback_handler')
          .select('*')
          .eq('subscriber_id', userId)
          .order('created_at', { ascending: false })
      ]);

      const unified = [];

      // 1. RAG DATABASE
      if (ragResult.data) {
        ragResult.data.forEach(item => {
          if (!item.conversation || !Array.isArray(item.conversation) || item.conversation.length === 0) {
            return; 
          }

          const lastMsg = getLastMessageFromConversation(item.conversation);
          const tags = Array.isArray(item.tags) ? item.tags : [];
          const isBulk = tags.includes('bulk');
          
          let uiStatus = 'open';
          if (item.status === 'human_handle' || item.status === 'handover') uiStatus = 'handover';
          if (item.status === 'closed' || item.status === 'resolved') uiStatus = 'closed';
          // Fix: Agent status should show as Open in UI to avoid confusion
          if (item.status === 'agent') uiStatus = 'open';

          unified.push({
            id: item.id,
            uniqueKey: `rag_${item.id}`,
            sourceTable: 'rag',
            phoneNumber: item.phone_number || item.client_number,
            contactName: item.contact_name || item.phone_number || item.client_number || 'Unknown',
            lastMessage: lastMsg.text,
            lastMessageAt: item.updated_at || item.created_at,
            status: uiStatus,
            handoverRequired: uiStatus === 'handover',
            isBulk,
            tags,
            rawData: item
          });
        });
      }

      // 2. OPENER (CAMPAIGNS)
      if (openerResult.data) {
        openerResult.data.forEach(item => {
          if (!item.conversation || !Array.isArray(item.conversation) || item.conversation.length === 0) {
            return;
          }

          const lastMsg = getLastMessageFromConversation(item.conversation);
          
          unified.push({
            id: item.id,
            uniqueKey: `opener_${item.id}`,
            sourceTable: 'opener',
            phoneNumber: item.client_phone,
            contactName: item.client_name || item.client_phone || 'Campaign Lead',
            lastMessage: lastMsg.text || item.opener_message || 'Campaign message sent',
            lastMessageAt: item.last_message_at || item.opener_sent_at || item.created_at,
            status: item.status || 'open',
            handoverRequired: false,
            isBulk: false,
            tags: item.tag ? [item.tag] : [],
            rawData: item
          });
        });
      }

      // 3. FEEDBACK (REVIEWS)
      if (feedbackResult.data) {
        feedbackResult.data.forEach(item => {
          if (!item.conversation || !Array.isArray(item.conversation) || item.conversation.length === 0) {
            return;
          }

          const lastMsg = getLastMessageFromConversation(item.conversation);
          
          unified.push({
            id: item.id,
            uniqueKey: `feedback_${item.id}`,
            sourceTable: 'feedback',
            phoneNumber: item.client_number,
            contactName: item.client_name || item.client_number || 'Review Lead',
            lastMessage: lastMsg.text || item.feedback_message || 'Feedback request sent',
            lastMessageAt: item.updated_at || item.created_at,
            status: item.status || 'sent',
            handoverRequired: item.status === 'forward',
            isBulk: false,
            tags: item.tag ? [item.tag] : [],
            rawData: item
          });
        });
      }

      unified.sort((a, b) => getLatestTimestamp(b.rawData) - getLatestTimestamp(a.rawData));
      setAllChats(unified);

      // ✅ FIX 1: Robust URL Logic for Notification Clicks
      const urlId = searchParams.get('id');
      const urlSource = searchParams.get('source') || 'rag'; // Default to 'rag' if source is missing
      
      if (urlId) {
        // String conversion ensure comparison works (db id is int, url id is string)
        const target = unified.find(c => String(c.id) === String(urlId) && c.sourceTable === urlSource);
        if (target) {
          handleSelectChat(target);
        }
      }

    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAllChats();
    }
  }, [userId]);

  // ============================================================
  // REALTIME SUBSCRIPTION
  // ============================================================
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('smart_inbox_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rag_database' }, () => fetchAllChats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opener_sent_clients' }, () => fetchAllChats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback_handler' }, () => fetchAllChats())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // ============================================================
  // SELECT CHAT HANDLER & MAP MESSAGES
  // ============================================================
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setSourceTable(chat.sourceTable);
    setSearchParams({ id: chat.id, source: chat.sourceTable });
    
    // ✅ NEW LOGIC: Mark as "Read" locally so it disappears from alerts
    if (chat.handoverRequired || chat.status === 'handover' || chat.status === 'human_handle') {
      const seen = JSON.parse(localStorage.getItem('seenHandovers') || '[]');
      if (!seen.includes(String(chat.id))) {
        const newSeen = [...seen, String(chat.id)];
        localStorage.setItem('seenHandovers', JSON.stringify(newSeen));
        // 🔥 Trigger event so NotificationDropdown & Dashboard update instantly
        window.dispatchEvent(new Event('handoverUpdated'));
      }
    }

    const conversation = chat.rawData?.conversation;
    mapConversationToMessages(conversation, chat.sourceTable);
  };

  const mapConversationToMessages = (conversation, source) => {
    if (!conversation || !Array.isArray(conversation)) {
      setMessages([]);
      return;
    }

    const mapped = conversation.map((msg, idx) => {
      let direction = 'inbound';
      
      if (
        msg.role === 'agent' || 
        msg.role === 'assistant' || 
        msg.sender === 'ai' || 
        msg.sender === 'human' || 
        msg.direction === 'outbound'
      ) {
        direction = 'outbound';
      }
      
      let senderType = 'client';
      if (msg.sender === 'human') {
        senderType = 'human'; 
      } else if (msg.role === 'agent' || msg.sender === 'ai' || msg.role === 'assistant') {
        senderType = 'ai'; 
      }

      return {
        id: msg.id || idx,
        direction,
        content: msg.text || msg.content || msg.message || '',
        sender: senderType, 
        created_at: msg.ts || msg.timestamp || msg.created_at || new Date().toISOString()
      };
    });

    setMessages(mapped);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ============================================================
  // FILTER CHATS BASED ON ACTIVE TAB
  // ============================================================
  const getFilteredChats = () => {
    let filtered = [...allChats];

    switch (activeTab) {
      case 'open':
        filtered = filtered.filter(c => c.sourceTable === 'rag' && c.status === 'open');
        break;
      case 'handover':
        filtered = filtered.filter(c => c.sourceTable === 'rag' && (c.status === 'handover' || c.handoverRequired));
        break;
      case 'campaigns':
        filtered = filtered.filter(c => c.sourceTable === 'opener');
        break;
      case 'reviews':
        filtered = filtered.filter(c => c.sourceTable === 'feedback');
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.contactName?.toLowerCase().includes(q) ||
        c.phoneNumber?.includes(q) ||
        c.lastMessage?.toLowerCase().includes(q)
      );
    }

    return filtered;
  };

  const filteredChats = getFilteredChats();

  // ============================================================
  // SEND REPLY
  // ============================================================
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedChat || sending) return;

    setSending(true);
    const messageContent = replyText.trim();
    setReplyText('');

    try {
      const newMessage = {
        id: Date.now(),
        direction: 'outbound',
        content: messageContent,
        sender: 'human',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);

      await fetch(N8N_SEND_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instance_name: instanceName,
          phone_number: selectedChat.phoneNumber,
          message: messageContent,
          subscriber_id: userId,
          source_table: sourceTable,
          record_id: selectedChat.id
        })
      });

      const updatedConversation = [
        ...(selectedChat.rawData?.conversation || []),
        {
          role: 'assistant',
          sender: 'human',
          text: messageContent,
          content: messageContent,
          timestamp: new Date().toISOString(),
          direction: 'outbound'
        }
      ];

      let updateResult;
      
      switch (sourceTable) {
        case 'rag':
          updateResult = await supabase
            .from('rag_database')
            .update({ 
              conversation: updatedConversation,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedChat.id);
          break;
          
        case 'opener':
          updateResult = await supabase
            .from('opener_sent_clients')
            .update({ 
              conversation: updatedConversation,
              last_message_at: new Date().toISOString()
            })
            .eq('id', selectedChat.id);
          break;
          
        case 'feedback':
          updateResult = await supabase
            .from('feedback_handler')
            .update({ 
              conversation: updatedConversation,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedChat.id);
          break;
      }

      if (updateResult?.error) {
        console.error('Update error:', updateResult.error);
      }

    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // TAKEOVER / HANDBACK HANDLERS
  // ============================================================
  const handleTakeover = async () => {
    if (!selectedChat || sourceTable !== 'rag') return;
    
    try {
      await supabase
        .from('rag_database')
        .update({ status: 'human_handle' })
        .eq('id', selectedChat.id);
      
      setSelectedChat(prev => ({ ...prev, status: 'handover', handoverRequired: true }));
      fetchAllChats();
    } catch (err) {
      console.error('Takeover error:', err);
    }
  };

  // ✅ FIX 2: Handback sets status to 'agent' so n8n AI resumes
  const handleHandback = async () => {
    if (!selectedChat || sourceTable !== 'rag') return;
    
    try {
      await supabase
        .from('rag_database')
        .update({ status: 'agent' }) // Changed from 'open' to 'agent'
        .eq('id', selectedChat.id);
      
      setSelectedChat(prev => ({ ...prev, status: 'open', handoverRequired: false }));
      fetchAllChats();
    } catch (err) {
      console.error('Handback error:', err);
    }
  };

  // ============================================================
  // GET TAB COUNTS
  // ============================================================
  const getTabCount = (tabKey) => {
    switch (tabKey) {
      case 'all': return allChats.length;
      case 'open': return allChats.filter(c => c.sourceTable === 'rag' && c.status === 'open').length;
      case 'handover': return allChats.filter(c => c.sourceTable === 'rag' && (c.status === 'handover' || c.handoverRequired)).length;
      case 'campaigns': return allChats.filter(c => c.sourceTable === 'opener').length;
      case 'reviews': return allChats.filter(c => c.sourceTable === 'feedback').length;
      default: return 0;
    }
  };

  // ============================================================
  // RENDER SOURCE BADGE
  // ============================================================
  const renderSourceBadge = (chat) => {
    const badges = [];
    
    const sourceConfig = SOURCE_CONFIG[chat.sourceTable];
    if (sourceConfig && chat.sourceTable !== 'rag') {
      const Icon = sourceConfig.icon;
      badges.push(
        <span
          key="source"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            background: sourceConfig.bg,
            color: sourceConfig.color,
            borderRadius: '6px',
            padding: '2px 6px',
            fontSize: '9px',
            fontWeight: 600
          }}
        >
          <Icon size={10} />
          {sourceConfig.label}
        </span>
      );
    }
    
    if (chat.sourceTable === 'feedback' && chat.tags && chat.tags.length > 0) {
        const tag = chat.tags[0]; 
        
        if (tag === 'forwarded' || tag === 'forward') {
            badges.push(
                <span
                  key="tag-fwd"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    background: 'rgba(255,107,107,0.12)', 
                    color: '#FF6B6B', 
                    borderRadius: '6px',
                    padding: '2px 6px',
                    fontSize: '9px',
                    fontWeight: 600
                  }}
                >
                  <AlertTriangle size={10} />
                  Forwarded
                </span>
            );
        } else if (tag === 'done' || tag === 'completed') {
            badges.push(
                <span
                  key="tag-done"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    background: 'rgba(56,242,141,0.12)',
                    color: '#38F28D', 
                    borderRadius: '6px',
                    padding: '2px 6px',
                    fontSize: '9px',
                    fontWeight: 600
                  }}
                >
                  <CheckCircle size={10} />
                  Completed
                </span>
            );
        }
    }

    if (chat.isBulk) {
      badges.push(
        <span
          key="bulk"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            background: SOURCE_CONFIG.bulk.bg,
            color: SOURCE_CONFIG.bulk.color,
            borderRadius: '6px',
            padding: '2px 6px',
            fontSize: '9px',
            fontWeight: 600
          }}
        >
          <Users size={10} />
          Bulk
        </span>
      );
    }
    
    return badges;
  };

  // ============================================================
  // RENDER - LOADING
  // ============================================================
  if (loading && allChats.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 100px)' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={40} style={{ color: '#38F28D', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#A7B0AD', marginTop: 16 }}>Loading conversations...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div style={{ 
      display: 'flex', 
      height: 'calc(100vh - 70px)', 
      fontFamily: "'Sora', sans-serif",
      overflow: 'hidden'
    }}>
      
      {/* ========== LEFT SIDEBAR ========== */}
      <div style={{
        width: '380px',
        minWidth: '300px',
        maxWidth: '400px',
        background: '#070A0A',
        borderRight: '1px solid #1A2321',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}>
        
        {/* FIXED HEADER WRAPPER */}
        <div style={{ flexShrink: 0 }}> 
          {/* Header */}
          <div style={{ padding: '20px 16px 12px' }}>
            <h2 style={{ color: '#F2F5F4', fontSize: '20px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Inbox size={24} style={{ color: '#38F28D' }} />
              Smart Inbox
            </h2>
            <p style={{ color: '#A7B0AD', fontSize: '12px', margin: '4px 0 0' }}>
              {allChats.length} total conversations
            </p>
          </div>

          {/* Search */}
          <div style={{ padding: '0 16px 12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#0D1211',
              border: '1px solid #1A2321',
              borderRadius: '10px',
              padding: '10px 12px'
            }}>
              <Search size={16} style={{ color: '#A7B0AD' }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#F2F5F4',
                  fontSize: '13px'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A7B0AD', padding: 0 }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ padding: '0 12px 12px' }}>
            <div style={{
              display: 'flex',
              gap: '4px',
              background: '#0D1211',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid #1A2321'
            }}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.key;
                const count = getTabCount(tab.key);
                const Icon = tab.icon;
                
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      background: isActive ? '#38F28D' : 'transparent',
                      color: isActive ? '#070A0A' : '#A7B0AD',
                      transition: 'all 0.2s',
                      fontFamily: "'Sora', sans-serif"
                    }}
                  >
                    <Icon size={16} />
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>{tab.label}</span>
                    <span style={{
                      fontSize: '9px',
                      background: isActive ? 'rgba(0,0,0,0.2)' : '#1A2321',
                      borderRadius: '10px',
                      padding: '1px 6px',
                      fontWeight: 600
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SCROLLABLE CHAT LIST */}
        <div style={{ 
          flex: 1, 
          minHeight: 0, 
          overflowY: 'auto', 
          padding: '0 8px',
          display: 'flex',            
          flexDirection: 'column' 
        }}>
          {filteredChats.length === 0 ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#A7B0AD',
              textAlign: 'center',
              padding: '20px'
            }}>
              <Inbox size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <p style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 4px' }}>No conversations found</p>
              <p style={{ fontSize: '12px', color: '#4A5553', margin: 0 }}>Try a different filter</p>
            </div>
          ) : (
            filteredChats.map(chat => {
              const isSelected = selectedChat?.uniqueKey === chat.uniqueKey;
              const statusCfg = STATUS_CONFIG[chat.status] || STATUS_CONFIG.open;
              
              return (
                <div
                  key={chat.uniqueKey}
                  onClick={() => handleSelectChat(chat)}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    padding: '14px 12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    background: isSelected ? '#0D1211' : 'transparent',
                    border: isSelected ? '1px solid #38F28D30' : '1px solid transparent',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: chat.sourceTable === 'feedback' 
                        ? '#3B2E0E' 
                        : chat.sourceTable === 'opener' 
                          ? '#1A2B4A' 
                          : '#0E3B2E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: chat.sourceTable === 'feedback' 
                        ? '#F2A838' 
                        : chat.sourceTable === 'opener' 
                          ? '#6B8AFF' 
                          : '#38F28D',
                      fontSize: '16px',
                      fontWeight: 600
                    }}>
                      {chat.contactName?.[0]?.toUpperCase() || '#'}
                    </div>
                    
                    {chat.sourceTable !== 'rag' && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#0D1211',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #070A0A'
                      }}>
                        {chat.sourceTable === 'feedback' ? (
                          <Star size={10} style={{ color: '#F2A838' }} />
                        ) : (
                          <Megaphone size={10} style={{ color: '#6B8AFF' }} />
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{
                        color: '#F2F5F4',
                        fontSize: '13px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {chat.contactName}
                      </span>
                      <span style={{ color: '#A7B0AD', fontSize: '10px', flexShrink: 0 }}>
                        {timeAgo(chat.lastMessageAt)}
                      </span>
                    </div>
                    
                    <p style={{
                      color: '#A7B0AD',
                      fontSize: '12px',
                      margin: '0 0 6px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {chat.lastMessage}
                    </p>
                    
                    
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {chat.sourceTable !== 'feedback' && (
                           <span style={{
                            background: statusCfg.bg,
                            color: statusCfg.color,
                            border: `1px solid ${statusCfg.border}`,
                            borderRadius: '6px',
                            padding: '2px 6px',
                            fontSize: '9px',
                            fontWeight: 600
                         }}>
                            {statusCfg.label}
                          </span>
                        )}
  
  {renderSourceBadge(chat)}
</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========== RIGHT PANEL - CHAT VIEW ========== */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#070A0A',
        minWidth: 0,
        height: '100%',
        overflow: 'hidden'
      }}>
        {selectedChat ? (
          <>
            {/* FIXED HEADER */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #1A2321',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#0D1211',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: sourceTable === 'feedback' 
                    ? '#3B2E0E' 
                    : sourceTable === 'opener' 
                      ? '#1A2B4A' 
                      : '#0E3B2E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: sourceTable === 'feedback' 
                    ? '#F2A838' 
                    : sourceTable === 'opener' 
                      ? '#6B8AFF' 
                      : '#38F28D',
                  fontSize: '16px',
                  fontWeight: 600
                }}>
                  {selectedChat.contactName?.[0]?.toUpperCase() || '#'}
                </div>
                <div>
                  <div style={{ color: '#F2F5F4', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedChat.contactName}
                    {renderSourceBadge(selectedChat)}
                  </div>
                  <div style={{ color: '#A7B0AD', fontSize: '12px' }}>{selectedChat.phoneNumber}</div>
                </div>
              </div>

              {sourceTable === 'rag' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedChat.status !== 'handover' ? (
                    <button
                      onClick={handleTakeover}
                      style={{
                        background: '#F2A838',
                        color: '#070A0A',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: "'Sora', sans-serif"
                      }}
                    >
                      <HandMetal size={14} />
                      Take Over
                    </button>
                  ) : (
                    <button
                      onClick={handleHandback}
                      style={{
                        background: 'transparent',
                        color: '#38F28D',
                        border: '1px solid rgba(56,242,141,0.3)',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: "'Sora', sans-serif"
                      }}
                    >
                      <Bot size={14} />
                      Handback to AI
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Handover Alert */}
            {selectedChat.handoverRequired && sourceTable === 'rag' && (
              <div style={{
                margin: '12px 20px 0',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(242,168,56,0.08)',
                border: '1px solid rgba(242,168,56,0.2)',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} style={{ color: '#F2A838' }} />
                  <span style={{ color: '#F2A838', fontSize: '12px', fontWeight: 600 }}>
                    Handover Required - Manual intervention needed
                  </span>
                </div>
              </div>
            )}

            {/* SCROLLABLE MESSAGES */}
            <div style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {messages.length === 0 ? (
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#A7B0AD'
                }}>
                  <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p style={{ margin: 0 }}>No messages yet</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOutbound = msg.direction === 'outbound';
                  const isAI = msg.sender === 'ai';
                  
                  return (
                    <div
                      key={msg.id || idx}
                      style={{
                        display: 'flex',
                        justifyContent: isOutbound ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{ maxWidth: '70%' }}>
                        {isOutbound && (
                          <div style={{ textAlign: 'right', marginBottom: '4px' }}>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: isAI ? '#38F28D' : '#6B8AFF',
                              background: isAI ? 'rgba(56,242,141,0.1)' : 'rgba(107,138,255,0.1)',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {isAI ? <Bot size={10} /> : <User size={10} />}
                              {isAI ? 'AI Agent' : 'You'}
                            </span>
                          </div>
                        )}
                        
                        <div style={{
                          background: isOutbound
                            ? (isAI ? '#0E3B2E' : '#1A2B4A')
                            : '#0D1211',
                          border: `1px solid ${isOutbound
                            ? (isAI ? 'rgba(56,242,141,0.2)' : 'rgba(107,138,255,0.2)')
                            : '#1A2321'}`,
                          borderRadius: isOutbound ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          padding: '12px 16px'
                        }}>
                          <p style={{
                            color: '#F2F5F4',
                            fontSize: '13px',
                            margin: 0,
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap'
                          }}>
                            {msg.content}
                          </p>
                        </div>
                        
                        <div style={{ marginTop: '4px', textAlign: isOutbound ? 'right' : 'left' }}>
                          <span style={{ color: '#A7B0AD', fontSize: '10px' }}>
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* FIXED REPLY INPUT */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #1A2321',
              background: '#0D1211',
              flexShrink: 0
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: sourceTable === 'rag' && selectedChat.status === 'handover' ? '#6B8AFF' : '#38F28D',
                  background: sourceTable === 'rag' && selectedChat.status === 'handover'
                    ? 'rgba(107,138,255,0.1)'
                    : 'rgba(56,242,141,0.1)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {sourceTable === 'rag' && selectedChat.status === 'handover' ? (
                    <><User size={12} /> Manual Mode</>
                  ) : (
                    <><Bot size={12} /> AI Mode</>
                  )}
                </span>
                
                <span style={{
                  fontSize: '10px',
                  color: '#A7B0AD',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: sourceTable === 'rag' ? '#38F28D' : sourceTable === 'opener' ? '#6B8AFF' : '#F2A838'
                  }} />
                  {sourceTable === 'rag' ? 'Main Chat' : sourceTable === 'opener' ? 'Campaign' : 'Review'}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  placeholder="Type your reply..."
                  rows={2}
                  style={{
                    flex: 1,
                    background: '#070A0A',
                    border: '1px solid #1A2321',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: '#F2F5F4',
                    fontSize: '13px',
                    resize: 'none',
                    fontFamily: "'Sora', sans-serif",
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sending}
                  style={{
                    background: '#38F28D',
                    color: '#070A0A',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: (!replyText.trim() || sending) ? 0.4 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    fontFamily: "'Sora', sans-serif"
                  }}
                >
                  {sending ? (
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Send size={16} />
                  )}
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty Chat View */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#0E3B2E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <MessageSquare size={36} style={{ color: '#38F28D' }} />
            </div>
            <h3 style={{ color: '#F2F5F4', fontSize: '18px', fontWeight: 600, margin: '0 0 8px' }}>
              Select a Conversation
            </h3>
            <p style={{ color: '#A7B0AD', fontSize: '14px', textAlign: 'center', maxWidth: '300px' }}>
              Choose a chat from the left panel to view messages and reply
            </p>
          </div>
        )}
      </div>

      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        * { font-family: 'Sora', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1A2321; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #2A3B38; }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        textarea::placeholder { color: #4A5553; }
        input::placeholder { color: #4A5553; }
      `}</style>
    </div>
  );
};

export default ChatManagementPage;