import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { 
  Star, 
  Send, 
  Clock, 
  MessageSquare, 
  User, 
  Phone, 
  FileText, 
  Link2, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Hand,          // Manual Handover Icon
  CheckCheck,    // Done Status Icon
  PartyPopper    // Completed Box Icon
} from 'lucide-react';

// ============================================================
// CONFIGURATION
// ============================================================
const N8N_REVIEW_WEBHOOK = 'https://n8n.srv1192286.hstgr.cloud/webhook/for-review';

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Function to calculate "Time Ago" (e.g., 2 hours ago)
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  
  if (seconds < 60) return 'Just now';
  
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// Function to format date nicely (Restored this function)
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  });
}

// ============================================================
// STATUS CONFIGURATION (The Brain of the UI)
// ============================================================
const STATUS_CONFIG = {
  // 1. Pending: Message scheduled but not sent/replied
  pending: { 
    label: 'Pending', 
    color: '#F2A838', 
    bg: 'rgba(242,168,56,0.12)', 
    icon: Clock 
  },
  
  // 2. Sent: AI sent the first feedback message
  sent: { 
    label: 'Msg Sent', 
    color: '#6B8AFF', 
    bg: 'rgba(107,138,255,0.12)', 
    icon: Send 
  },
  
  // 3. Requested: Good feedback received, Link sent
  requested: { 
    label: 'Requested', 
    color: '#38F28D', 
    bg: 'rgba(56,242,141,0.12)', 
    icon: CheckCircle 
  },
  
  // 4. Forward: Bad feedback or Issues (Manual Check needed)
  forward: { 
    label: 'Forwarded', 
    color: '#FF6B6B', 
    bg: 'rgba(255,107,107,0.12)', 
    icon: AlertCircle 
  },
  
  // 5. Handover: AI couldn't handle, human needed
  manual_handover: { 
    label: 'Handover', 
    color: '#FF6B6B', 
    bg: 'rgba(255,107,107,0.12)', 
    icon: Hand 
  },
  
  // 6. Done: Cycle Completed (Link sent & Client replied)
  done: { 
    label: 'Completed', 
    color: '#8B5CF6', 
    bg: 'rgba(139, 92, 246, 0.12)', 
    icon: CheckCheck 
  }
};

// ============================================================
// DROPDOWN OPTIONS
// ============================================================
const TONE_OPTIONS = [
  { value: 'friendly', label: 'Friendly', emoji: '😊' },
  { value: 'polite', label: 'Polite', emoji: '🤝' },
  { value: 'professional', label: 'Professional', emoji: '💼' },
];

const DELAY_OPTIONS = [
  { value: 60, label: '1 Hour', desc: 'Send after 1 hour' },
  { value: 120, label: '2 Hours', desc: 'Send after 2 hours' },
  { value: 240, label: '4 Hours', desc: 'Send after 4 hours' },
];

// ============================================================
// MAIN COMPONENT START
// ============================================================
const FeedbackReviewsPage = () => {
  
  // ----------------------------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------------------------
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Store fetched review links here
  const [reviewLinks, setReviewLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  
  // Store form input data
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    serviceProvided: '',
    tone: 'friendly',
    platformId: '',
    delayTime: 60,
    specialNote: ''
  });

  // UI States for loading/success/error
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Dashboard Stats & Lists
  const [stats, setStats] = useState({ 
    total: 0, 
    requested: 0, 
    forwarded: 0, 
    completed: 0 
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // ----------------------------------------------------------
  // DATA FETCHING (On Page Load)
  // ----------------------------------------------------------
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      
      // Get Current User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      setUserId(user.id);
      
      // Parallel Fetching for Speed
      await Promise.all([
        fetchReviewLinks(user.id),
        fetchFeedbackData(user.id)
      ]);
      
      setLoading(false);
    };
    
    fetchInitialData();
  }, []);

  // ----------------------------------------------------------
  // FETCH FUNCTION: REVIEW LINKS
  // ----------------------------------------------------------
  const fetchReviewLinks = async (uid) => {
    setLoadingLinks(true);
    try {
      const { data, error } = await supabase
        .from('review_links')
        .select('*')
        .eq('subscriber_id', uid)
        .order('platform_name', { ascending: true });
      
      if (error) throw error;
      setReviewLinks(data || []);
    } catch (err) {
      console.error('Error fetching review links:', err);
    } finally {
      setLoadingLinks(false);
    }
  };

  // ----------------------------------------------------------
  // FETCH FUNCTION: FEEDBACK DATA & STATS
  // ----------------------------------------------------------
  const fetchFeedbackData = async (uid) => {
    setLoadingRequests(true);
    try {
      const { data, error } = await supabase
        .from('feedback_handler')
        .select('*')
        .eq('subscriber_id', uid)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const requests = data || [];
      setRecentRequests(requests.slice(0, 10)); // Keep only top 10
      
      // --- STATS CALCULATION LOGIC ---
      const total = requests.length;
      
      // Box 2: Review Requested (Only status = 'requested')
      const requested = requests.filter(r => r.status === 'requested').length;
      
      // Box 3: Forwarded (Status = 'forward' OR 'manual_handover')
      const forwarded = requests.filter(r => r.status === 'forward' || r.status === 'manual_handover').length;
      
      // Box 4: Completed (Status = 'done')
      const completed = requests.filter(r => r.status === 'done').length;
      
      setStats({ total, requested, forwarded, completed });
      
    } catch (err) {
      console.error('Error fetching feedback data:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // ----------------------------------------------------------
  // FORM HANDLING
  // ----------------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear old messages when user types
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- VALIDATION STEPS ---
    if (!formData.clientName.trim()) {
      setErrorMessage('Please enter client name');
      return;
    }
    if (!formData.clientPhone.trim()) {
      setErrorMessage('Please enter client phone number');
      return;
    }
    if (!formData.serviceProvided.trim()) {
      setErrorMessage('Please enter service provided');
      return;
    }
    if (!formData.platformId) {
      setErrorMessage('Please select a review platform');
      return;
    }
    
    // Find the actual URL for the selected platform
    const selectedPlatform = reviewLinks.find(link => link.id === formData.platformId);
    if (!selectedPlatform) {
      setErrorMessage('Selected platform not found');
      return;
    }
    
    setSending(true);
    setErrorMessage('');
    
    try {
      // Prepare the payload for n8n
      const payload = {
        subscriber_id: userId,
        client_name: formData.clientName.trim(),
        client_phone: formData.clientPhone.replace(/\D/g, ''), // Remove non-digits
        service_provided: formData.serviceProvided.trim(),
        tone: formData.tone,
        review_link: selectedPlatform.review_url,
        delay_time: formData.delayTime,
        special_note: formData.specialNote.trim() || null
      };
      
      // API Call to n8n Webhook
      const response = await fetch(N8N_REVIEW_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send request');
      }
      
      // Success Handling
      setSuccessMessage(`✅ Review request scheduled! Will be sent in ${formData.delayTime} minutes.`);
      
      // Reset Form Fields
      setFormData({
        clientName: '',
        clientPhone: '',
        serviceProvided: '',
        tone: 'friendly',
        platformId: formData.platformId, // Keep platform selected for convenience
        delayTime: 60,
        specialNote: ''
      });
      
      // Refresh Stats after 2 seconds
      setTimeout(() => {
        fetchFeedbackData(userId);
      }, 2000);
      
    } catch (err) {
      console.error('Error sending review request:', err);
      setErrorMessage('Failed to send request. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // ----------------------------------------------------------
  // LOADING VIEW
  // ----------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#38F28D] animate-spin mx-auto mb-4" />
          <p className="text-[#A7B0AD]">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // SUCCESS RATE CALCULATION
  // Formula: (Requests with Link + Requests Completed) / Total Requests
  // ----------------------------------------------------------
  const successRate = stats.total > 0 
    ? Math.round(((stats.requested + stats.completed) / stats.total) * 100) 
    : 0;

  // ----------------------------------------------------------
  // MAIN RENDER
  // ----------------------------------------------------------
  return (
    <div className="max-w-[1400px] mx-auto">
      
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#F2F5F4] mb-2 flex items-center gap-3">
          <Star className="w-10 h-10 text-[#38F28D]" />
          Feedback & Reviews
        </h1>
        <p className="text-[#A7B0AD] text-lg">
          Collect feedback and request reviews from your clients.
        </p>
      </div>

      {/* STATS CARDS GRID (4 BOXES) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Box 1: Total Requests */}
        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[16px] p-5 hover:border-[#38F28D]/30 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#38F28D]/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#38F28D]" />
            </div>
            <span className="text-[#A7B0AD] text-sm">Total Requests</span>
          </div>
          <div className="text-3xl font-bold text-[#F2F5F4]">{stats.total}</div>
        </div>
        
        {/* Box 2: Link Sent (Requested) */}
        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[16px] p-5 hover:border-[#38F28D]/30 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#38F28D]/10 rounded-full flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-[#38F28D]" />
            </div>
            <span className="text-[#A7B0AD] text-sm">Link Sent</span>
          </div>
          <div className="text-3xl font-bold text-[#38F28D]">{stats.requested}</div>
        </div>
        
        {/* Box 3: Forwarded (Issues/Negative) */}
        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[16px] p-5 hover:border-[#FF6B6B]/30 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#FF6B6B]/10 rounded-full flex items-center justify-center">
              <ThumbsDown className="w-5 h-5 text-[#FF6B6B]" />
            </div>
            <span className="text-[#A7B0AD] text-sm">Forwarded (Issues)</span>
          </div>
          <div className="text-3xl font-bold text-[#FF6B6B]">{stats.forwarded}</div>
        </div>

        {/* Box 4: Completed (Done) */}
        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[16px] p-5 hover:border-[#8B5CF6]/30 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#8B5CF6]/10 rounded-full flex items-center justify-center">
              <PartyPopper className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <span className="text-[#A7B0AD] text-sm">Completed</span>
          </div>
          <div className="text-3xl font-bold text-[#8B5CF6]">{stats.completed}</div>
        </div>

      </div>

      {/* CONTENT GRID (FORM + LIST) */}
      <div className="grid lg:grid-cols-5 gap-6">
        
        {/* LEFT SIDE: INPUT FORM (Spans 3 Columns) */}
        <div className="lg:col-span-3">
          <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-6">
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#38F28D]/10 rounded-full flex items-center justify-center">
                <Send className="w-5 h-5 text-[#38F28D]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F2F5F4]">Send Review Request</h2>
                <p className="text-sm text-[#A7B0AD]">AI will first ask for feedback, then send review link</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Row 1: Name & Phone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#F2F5F4] mb-2">
                    <User className="w-4 h-4 text-[#38F28D]" /> Client Name
                  </label>
                  <input 
                    type="text" 
                    name="clientName" 
                    value={formData.clientName} 
                    onChange={handleInputChange} 
                    placeholder="Ahmed Khan" 
                    className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 text-[#F2F5F4] focus:border-[#38F28D] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#F2F5F4] mb-2">
                    <Phone className="w-4 h-4 text-[#38F28D]" /> WhatsApp Number
                  </label>
                  <input 
                    type="tel" 
                    name="clientPhone" 
                    value={formData.clientPhone} 
                    onChange={handleInputChange} 
                    placeholder="923001234567" 
                    className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 text-[#F2F5F4] focus:border-[#38F28D] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Service Provided */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#F2F5F4] mb-2">
                  <FileText className="w-4 h-4 text-[#38F28D]" /> Service Provided
                </label>
                <textarea 
                  name="serviceProvided" 
                  value={formData.serviceProvided} 
                  onChange={handleInputChange} 
                  placeholder="e.g., AC Repair, Deep Cleaning, Plumbing Service..." 
                  rows={2} 
                  className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 text-[#F2F5F4] focus:border-[#38F28D] outline-none resize-none transition-colors"
                />
              </div>

              {/* Row 3: Tone & Platform */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#F2F5F4] mb-2">
                    <MessageSquare className="w-4 h-4 text-[#38F28D]" /> Tone Preference
                  </label>
                  <select 
                    name="tone" 
                    value={formData.tone} 
                    onChange={handleInputChange} 
                    className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 text-[#F2F5F4] outline-none appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23A7B0AD'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                  >
                    {TONE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#F2F5F4] mb-2">
                    <Link2 className="w-4 h-4 text-[#38F28D]" /> Review Platform
                  </label>
                  {loadingLinks ? (
                    <div className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 text-[#A7B0AD] flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                    </div>
                  ) : reviewLinks.length === 0 ? (
                    <div className="w-full bg-[#070A0A] border border-[#F2A838]/30 rounded-[12px] px-4 py-3">
                      <p className="text-[#F2A838] text-sm mb-1">No platforms found</p>
                      <a href="/dashboard/settings" className="text-[#38F28D] text-xs hover:underline flex items-center gap-1">
                        <Settings className="w-3 h-3" /> Go to settings
                      </a>
                    </div>
                  ) : (
                    <select 
                      name="platformId" 
                      value={formData.platformId} 
                      onChange={handleInputChange} 
                      className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 text-[#F2F5F4] outline-none appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23A7B0AD'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                    >
                      <option value="">Select platform...</option>
                      {reviewLinks.map(link => (
                        <option key={link.id} value={link.id}>{link.platform_name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Row 4: Delay Options */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#F2F5F4] mb-2">
                  <Clock className="w-4 h-4 text-[#38F28D]" /> Send After (Delay)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {DELAY_OPTIONS.map(opt => (
                    <button 
                      key={opt.value} 
                      type="button" 
                      onClick={() => setFormData({ ...formData, delayTime: opt.value })} 
                      className={`p-3 rounded-[12px] border-2 text-center transition-all ${formData.delayTime === opt.value ? 'border-[#38F28D] bg-[#38F28D]/10 text-[#38F28D]' : 'border-[#1A2321] bg-[#070A0A] text-[#A7B0AD] hover:border-[#38F28D]/30'}`}
                    >
                      <div className="font-semibold">{opt.label}</div>
                      <div className="text-xs opacity-70">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 5: Special Note */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#F2F5F4] mb-2">
                  <FileText className="w-4 h-4 text-[#A7B0AD]" /> Special Note <span className="text-[#A7B0AD] font-normal">(Optional)</span>
                </label>
                <textarea 
                  name="specialNote" 
                  value={formData.specialNote} 
                  onChange={handleInputChange} 
                  placeholder="Any special instructions for the AI..." 
                  rows={2} 
                  className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 text-[#F2F5F4] outline-none resize-none transition-colors"
                />
              </div>

              {/* Status Messages */}
              {errorMessage && (
                <div className="text-[#FF6B6B] bg-[#FF6B6B]/10 p-3 rounded-[12px] flex items-center gap-2 border border-[#FF6B6B]/30">
                  <AlertCircle className="w-5 h-5"/> {errorMessage}
                </div>
              )}
              
              {successMessage && (
                <div className="text-[#38F28D] bg-[#38F28D]/10 p-3 rounded-[12px] flex items-center gap-2 border border-[#38F28D]/30">
                  <CheckCircle className="w-5 h-5"/> {successMessage}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={sending || reviewLinks.length === 0} 
                className="w-full bg-[#38F28D] text-[#070A0A] py-4 rounded-[14px] font-bold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(56,242,141,0.3)] transition-all flex justify-center items-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Send Review Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE: RECENT REQUESTS LIST (Spans 2 Columns) */}
        <div className="lg:col-span-2">
          <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-6 sticky top-6">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#F2F5F4] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#38F28D]" /> Recent Requests
              </h2>
              <span className="text-xs text-[#A7B0AD] bg-[#070A0A] px-2 py-1 rounded border border-[#1A2321]">Last 10</span>
            </div>

            {loadingRequests ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-[#38F28D] animate-spin" />
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-[#1A2321] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-[#A7B0AD]" />
                </div>
                <p className="text-[#A7B0AD] text-sm">No requests yet</p>
                <p className="text-[#4A5553] text-xs mt-1">Send your first review request!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                {recentRequests.map((request, idx) => {
                  // Determine Status Config safely
                  const statusKey = request.status ? request.status.toLowerCase() : 'pending';
                  const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
                  const StatusIcon = statusCfg.icon;
                  
                  return (
                    <div key={idx} className="bg-[#070A0A] border border-[#1A2321] rounded-[12px] p-4 hover:border-[#1A2321]/80 transition-all">
                      
                      {/* Name & Status Badge */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {/* Avatar Circle */}
                          <div className="w-8 h-8 bg-[#0E3B2E] rounded-full flex items-center justify-center text-[#38F28D] text-sm font-bold">
                            {request.client_name ? request.client_name[0].toUpperCase() : '?'}
                          </div>
                          <div>
                            <p className="text-[#F2F5F4] font-medium text-sm">{request.client_name}</p>
                            <p className="text-[#A7B0AD] text-xs">{request.client_number}</p>
                          </div>
                        </div>
                        
                        {/* Status Label */}
                        <div className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                          <StatusIcon className="w-3 h-3" /> {statusCfg.label}
                        </div>
                      </div>
                      
                      {/* Feedback Message Snippet */}
                      {request.feedback_message && (
                        <p className="text-[#A7B0AD] text-xs mb-3 italic bg-[#0D1211] p-2 rounded border border-[#1A2321]/50 line-clamp-2">
                          "{request.feedback_message}"
                        </p>
                      )}
                      
                      {/* Footer: Time & Link */}
                      <div className="flex justify-between text-xs text-[#4A5553] pt-1 border-t border-[#1A2321]/50 mt-1">
                        <span>{timeAgo(request.created_at)}</span>
                        
                        {request.review_link && (
                          <a 
                            href={request.review_link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[#38F28D] hover:underline flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" /> Link
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* QUICK STATS FOOTER */}
            <div className="mt-6 pt-4 border-t border-[#1A2321]">
              <p className="text-xs text-[#A7B0AD] mb-3 font-semibold uppercase tracking-wider">Performance</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#070A0A] rounded-[10px] p-3 text-center border border-[#1A2321]">
                  <div className="text-lg font-bold text-[#38F28D]">
                    {successRate}%
                  </div>
                  <div className="text-[10px] text-[#A7B0AD]">Success Rate</div>
                </div>
                <div className="bg-[#070A0A] rounded-[10px] p-3 text-center border border-[#1A2321]">
                  <div className="text-lg font-bold text-[#6B8AFF]">
                    {reviewLinks.length}
                  </div>
                  <div className="text-[10px] text-[#A7B0AD]">Platforms Active</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* GLOBAL STYLES FOR SCROLLBAR & FONTS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        * { font-family: 'Sora', system-ui, sans-serif; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1A2321; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #38F28D; }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

    </div>
  );
};

export default FeedbackReviewsPage;