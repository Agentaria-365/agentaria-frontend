import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabase';

// ============================================================
// CONFIGURATION & WEBHOOKS
// ============================================================
const N8N_WEBHOOKS = {
  startCampaign: 'https://n8n.srv1192286.hstgr.cloud/webhook/Campaign',
  pauseCampaign: 'https://n8n.srv1192286.hstgr.cloud/webhook/campaign/pause',
  resumeCampaign: 'https://n8n.srv1192286.hstgr.cloud/webhook/campaign/resume',
};

// Status Colors & Labels
const CAMPAIGN_STATUS = {
  draft: { label: 'Draft', color: '#A7B0AD', bg: 'rgba(167,176,173,0.1)', icon: '📝' },
  scheduled: { label: 'Scheduled', color: '#6B8AFF', bg: 'rgba(107,138,255,0.1)', icon: '📅' },
  running: { label: 'Running', color: '#38F28D', bg: 'rgba(56,242,141,0.1)', icon: '🚀' },
  active: { label: 'Active', color: '#38F28D', bg: 'rgba(56,242,141,0.1)', icon: '🚀' },
  paused: { label: 'Paused', color: '#F2A838', bg: 'rgba(242,168,56,0.1)', icon: '⏸️' },
  completed: { label: 'Completed', color: '#38F28D', bg: 'rgba(56,242,141,0.1)', icon: '✅' },
  done: { label: 'Done', color: '#38F28D', bg: 'rgba(56,242,141,0.1)', icon: '✅' },
  del: { label: 'Deleted', color: '#FF6B6B', bg: 'rgba(255, 107, 107, 0.1)', icon: '🗑️' }
};

const CLIENT_STATUS = {
  pending: { label: 'Pending', color: '#A7B0AD' },
  sent: { label: 'Sent', color: '#6B8AFF' },
  delivered: { label: 'Delivered', color: '#38F28D' },
  replied: { label: 'Replied', color: '#38F28D' },
  failed: { label: 'Failed', color: '#FF6B6B' },
  paused: { label: 'Paused', color: '#F2A838' },
  delete: { label: 'Stopped', color: '#FF6B6B' }
};

// CSV Templates
const SAMPLE_CSV_PERSONALIZED = `client_name,client_phone,last_action,note
Ahmed Khan,923001234567,Booked AC Service last month,Prefer morning calls
Fatima Ali,923009876543,Inquired about pricing,Very polite`;

const SAMPLE_CSV_BULK = `client_name,client_phone,note
John Doe,14155551234,VIP Client
Jane Smith,14155555678,`;

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

// Helper: Combine Date & Time and convert to UTC ISO String
const getISOString = (date, time) => {
  if (!date || !time) return new Date().toISOString();
  const localDate = new Date(`${date}T${time}`); 
  return localDate.toISOString(); 
};

// Tooltip Component
const Tooltip = ({ text }) => (
  <div className="group relative inline-block ml-2 cursor-help z-50">
    <div className="w-5 h-5 rounded-full border border-[#A7B0AD] text-[#A7B0AD] flex items-center justify-center text-[10px] font-bold hover:border-[#38F28D] hover:text-[#38F28D] transition-colors">i</div>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-4 bg-[#1A2321] text-white text-xs rounded-[10px] shadow-2xl border border-[#38F28D]/20 leading-relaxed z-[100]">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#1A2321]"></div>
    </div>
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
const ClientReopenerPage = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('campaigns');
  const [uploadStep, setUploadStep] = useState(1); 
  const [campaignType, setCampaignType] = useState(null);

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // File Upload State
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  
  // Campaign Config
  const [campaignConfig, setCampaignConfig] = useState({
    name: '',
    scheduleType: 'now',
    scheduleDate: '',
    scheduleTime: '',
    dailyLimit: 50,
    openerMessage: '' 
  });

  const fileInputRef = useRef(null);

  // 1. Load Initial Data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Fetch campaigns (Filter out 'del' status)
    const { data, error } = await supabase
      .from('bulk_campaigns')
      .select('*')
      .eq('subscriber_id', user.id)
      .neq('status', 'del') 
      .order('created_at', { ascending: false });

    if (!error && data) {
      const formattedCampaigns = data.map(camp => ({
        ...camp,
        stats: { 
          total: camp.total_leads || 0, 
          sent: camp.sent_count || 0 
        }
      }));
      setCampaigns(formattedCampaigns);
    }
    setLoading(false);
  };

  // 2. CSV Handling
  const downloadSampleCSV = () => {
    const content = campaignType === 'personalized' ? SAMPLE_CSV_PERSONALIZED : SAMPLE_CSV_BULK;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentaria_${campaignType}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text) => {
    if (!text || !text.trim()) return { data: [], errors: [{ message: 'File is empty' }] };
    const lines = text.trim().split('\n');
    if (lines.length < 2) return { data: [], errors: [{ message: 'No data rows found in CSV' }] };

    const rawHeaders = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/['"]+/g, ''));
    
    const aliases = {
      name: ['client_name', 'name', 'client name', 'full_name', 'full name'],
      phone: ['client_phone', 'phone', 'mobile', 'whatsapp', 'number', 'contact'],
      action: ['last_action', 'action', 'last action', 'history', 'context'],
      note: ['note', 'notes', 'remark', 'comments']
    };

    const getIndex = (key) => rawHeaders.findIndex(h => aliases[key].includes(h));
    const idxName = getIndex('name');
    const idxPhone = getIndex('phone');
    const idxAction = getIndex('action');
    const idxNote = getIndex('note');

    const errors = [];
    if (idxName === -1) return { data: [], errors: [{ message: 'Missing Column: Name' }] };
    if (idxPhone === -1) return { data: [], errors: [{ message: 'Missing Column: Phone' }] };
    if (campaignType === 'personalized' && idxAction === -1) return { data: [], errors: [{ message: 'Missing Column: Last Action (Required for AI)' }] };

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, '')); 

      const rawName = values[idxName] || '';
      const rawPhone = values[idxPhone] || '';
      const rawAction = idxAction !== -1 ? (values[idxAction] || '') : '';
      const rawNote = idxNote !== -1 ? (values[idxNote] || '') : '';

      const cleanPhone = rawPhone.replace(/\D/g, '');
      let hasError = false;

      if (cleanPhone.length < 10) { errors.push({ message: `Row ${i}: Invalid Phone` }); hasError = true; }
      if (rawName.length < 2) { errors.push({ message: `Row ${i}: Invalid Name` }); hasError = true; }

      data.push({
        client_name: rawName,
        client_phone: cleanPhone,
        last_action: rawAction,
        note: rawNote,
        _hasError: hasError,
        _rowIndex: i
      });
    }
    return { data, errors };
  };

  const handleFileUpload = (file) => {
    if (!file?.name.endsWith('.csv')) { alert('CSV only!'); return; }
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const { data, errors } = parseCSV(e.target.result);
        setCsvData(data);
        setCsvErrors(errors);
        setUploadStep(3);
      } catch (err) {
        console.error(err);
        alert("Error parsing CSV");
      }
    };
    reader.readAsText(file);
  };

  // 3. Launch Logic
  const launchCampaign = async () => {
    setLoading(true);
    try {
      const validLeads = csvData.filter(c => !c._hasError);
      
      let scheduledAt = null;
      if (campaignConfig.scheduleType === 'scheduled') {
        scheduledAt = getISOString(campaignConfig.scheduleDate, campaignConfig.scheduleTime);
      } else {
        scheduledAt = new Date().toISOString(); 
      }

      console.log("User Local Time:", `${campaignConfig.scheduleDate} ${campaignConfig.scheduleTime}`);
      console.log("Sent to DB (UTC):", scheduledAt);

      // Create Campaign (Saving bulk_message to DB)
      const { data: campData, error: campError } = await supabase
        .from('bulk_campaigns')
        .insert({
          subscriber_id: userId,
          campaign_name: campaignConfig.name,
          daily_limit: campaignConfig.dailyLimit,
          total_leads: validLeads.length,
          status: campaignConfig.scheduleType === 'now' ? 'active' : 'scheduled',
          scheduled_at: scheduledAt,
          bulk_message: campaignType === 'bulk' ? campaignConfig.openerMessage : null
        })
        .select()
        .single();
        
      if (campError) throw campError;
      const campaignId = campData.id;

      // Insert Leads
      const tableName = campaignType === 'personalized' ? 'opener_sent_clients' : 'bulk_leads';
      const leadsPayload = validLeads.map(lead => ({
        subscriber_id: userId,
        campaign_id: campaignId, 
        client_phone: lead.client_phone,
        client_name: lead.client_name,
        ...(campaignType === 'personalized' && { 
            last_action: lead.last_action,
            opener_message: 'AI_PENDING'
        }),
        ...(campaignType === 'bulk' && { 
            note: lead.note || null 
        }),
        status: 'pending'
      }));

      const { error: leadsError } = await supabase.from(tableName).insert(leadsPayload);
      if (leadsError) throw leadsError;

      // Trigger n8n
      const webhookPayload = {
        campaign_id: campaignId,
        strategy: campaignType,
        subscriber_id: userId,
        daily_limit: campaignConfig.dailyLimit,
        schedule_type: campaignConfig.scheduleType,
        bulk_message_template: campaignType === 'bulk' ? campaignConfig.openerMessage : null
      };

      if (campaignConfig.scheduleType === 'scheduled') {
        webhookPayload.scheduled_at = scheduledAt;
        webhookPayload.user_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }

      const response = await fetch(N8N_WEBHOOKS.startCampaign, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      });

      if (!response.ok) throw new Error(`n8n Webhook Error: ${response.statusText}`);

      alert(campaignConfig.scheduleType === 'now' ? 'Campaign Launched! 🚀' : 'Campaign Scheduled! 📅');
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 4. CAMPAIGN CONTROLS
  // ============================================================
  const handleCampaignAction = async (e, campaign, action) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to ${action.toUpperCase()} this campaign?`)) return;

    setLoading(true);
    try {
        let tableName = 'bulk_leads';
        const { count } = await supabase.from('bulk_leads').select('*', { count: 'exact', head: true }).eq('campaign_id', campaign.id);
        if (count === 0) tableName = 'opener_sent_clients';

        if (action === 'pause') {
            await supabase.from(tableName).update({ status: 'paused' }).eq('campaign_id', campaign.id).eq('status', 'pending');
            await supabase.from('bulk_campaigns').update({ status: 'paused' }).eq('id', campaign.id);
        
        } else if (action === 'resume') {
            await supabase.from(tableName).update({ status: 'pending' }).eq('campaign_id', campaign.id).eq('status', 'paused');
            await supabase.from('bulk_campaigns').update({ status: 'active' }).eq('id', campaign.id);
            
            const strategy = tableName === 'bulk_leads' ? 'bulk' : 'personalized';
            const { data: freshCampData } = await supabase
              .from('bulk_campaigns')
              .select('bulk_message, daily_limit')
              .eq('id', campaign.id)
              .single();

            const resumePayload = {
              campaign_id: campaign.id,
              strategy: strategy, 
              subscriber_id: userId,
              daily_limit: freshCampData?.daily_limit || campaign.daily_limit,
              schedule_type: 'now',
              bulk_message_template: strategy === 'bulk' ? freshCampData?.bulk_message : null
            };
            
            await fetch(N8N_WEBHOOKS.startCampaign, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resumePayload)
            });

        } else if (action === 'stop') {
            await supabase.from(tableName).update({ status: 'delete' }).eq('campaign_id', campaign.id).eq('status', 'pending');
            await supabase.from('bulk_campaigns').update({ status: 'completed' }).eq('id', campaign.id);
        }

        alert(`Campaign ${action}ed!`);
        fetchInitialData();

    } catch (err) {
        console.error(err);
        alert("Action failed: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const deleteCampaign = async (e, campaign) => {
    e.stopPropagation();
    
    let tableName = 'bulk_leads';
    const { count: bulkCount } = await supabase.from('bulk_leads').select('*', { count: 'exact', head: true }).eq('campaign_id', campaign.id);
    if (bulkCount === 0) tableName = 'opener_sent_clients';

    const { count: pendingCount } = await supabase.from(tableName).select('*', { count: 'exact', head: true }).eq('campaign_id', campaign.id).eq('status', 'pending');

    if (pendingCount > 0) {
        if (!confirm(`⚠️ WARNING: ${pendingCount} leads are still PENDING!\nDeleting will STOP them permanently.\n\nContinue?`)) return;
    } else {
        if (!confirm(`Delete this campaign history?`)) return;
    }

    setLoading(true);
    await supabase.from('bulk_campaigns').update({ status: 'del' }).eq('id', campaign.id);
    await supabase.from(tableName).update({ status: 'delete' }).eq('campaign_id', campaign.id).eq('status', 'pending');

    alert("Campaign Deleted.");
    fetchInitialData();
    setLoading(false);
  };

  // 5. Modal Logic
  const openModal = async (campaign) => {
    setSelectedCampaign({ ...campaign, loading: true });
    
    let { data: leads } = await supabase.from('bulk_leads').select('*').eq('campaign_id', campaign.id);
    if (!leads || leads.length === 0) {
       const { data: pData } = await supabase.from('opener_sent_clients').select('*').eq('campaign_id', campaign.id);
       leads = pData || [];
    }
    
    setSelectedCampaign({ ...campaign, clients: leads, loading: false });
  };

  // Validation
  const isLaunchDisabled = () => {
    if (loading) return true;
    if (!campaignConfig.name.trim()) return true;
    if (campaignType === 'bulk' && !campaignConfig.openerMessage.trim()) return true;
    if (campaignConfig.scheduleType === 'scheduled' && (!campaignConfig.scheduleDate || !campaignConfig.scheduleTime)) return true;
    return false;
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 font-sans text-[#F2F5F4]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Client Re-Opener</h1>
          <p className="text-[#A7B0AD]">Re-engage leads with AI or Bulk Offers.</p>
        </div>
        {activeTab === 'campaigns' && (
           <button onClick={() => { setActiveTab('upload'); setUploadStep(1); }} 
           className="bg-[#38F28D] text-[#070A0A] px-6 py-3 rounded-[12px] font-bold hover:shadow-[0_0_20px_rgba(56,242,141,0.3)] transition-all flex items-center gap-2">
             <span>+</span> New Campaign
           </button>
        )}
      </div>

      {/* CAMPAIGN LIST */}
      {activeTab === 'campaigns' && (
        <div className="grid gap-4">
          {campaigns.length === 0 ? (
            <div className="bg-[#0D1211] border border-[#1A2321] rounded-[20px] p-12 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-xl font-bold">No Campaigns Yet</h3>
              <p className="text-[#A7B0AD] mb-6">Start your first AI re-engagement campaign today.</p>
              <button onClick={() => { setActiveTab('upload'); setUploadStep(1); }} className="text-[#38F28D] font-bold hover:underline mt-2">Start Now</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map(camp => {
                 // ✅ FIXED: Case-Insensitive Lookup + Added 'done' Key
                 const statusKey = camp.status ? camp.status.toLowerCase() : 'draft';
                 const statusConfig = CAMPAIGN_STATUS[statusKey] || CAMPAIGN_STATUS.draft;
                 
                 return (
                <div key={camp.id} onClick={() => openModal(camp)}
                  className="bg-[#0D1211] border border-[#1A2321] rounded-[16px] p-6 cursor-pointer hover:border-[#38F28D]/50 transition-all group relative overflow-hidden">
                  
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold group-hover:text-[#38F28D] transition-colors truncate pr-2">{camp.campaign_name}</h3>
                      {/* ✅ CHANGED: Display Scheduled Time instead of Created Time */}
                      <span className="text-xs text-[#A7B0AD]">{formatDate(camp.scheduled_at || camp.created_at)}</span>
                    </div>
                    <span className="px-2 py-1 rounded text-xs border border-white/10" 
                          style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
                          {statusConfig.icon} {statusConfig.label}
                    </span>
                  </div>

                  {/* Progress Stats */}
                  <div className="flex gap-4 text-center mb-4">
                    <div className="bg-[#070A0A] p-2 rounded flex-1">
                      <div className="font-bold">{camp.stats.total}</div>
                      <div className="text-[10px] text-[#A7B0AD]">Leads</div>
                    </div>
                    <div className="bg-[#070A0A] p-2 rounded flex-1">
                      <div className="font-bold text-[#38F28D]">{camp.stats.sent}</div>
                      <div className="text-[10px] text-[#A7B0AD]">Sent</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-[#1A2321] rounded-full overflow-hidden mb-6">
                    <div className="h-full bg-[#38F28D]" style={{ width: `${(camp.stats.sent/camp.stats.total)*100}%` }}></div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="grid grid-cols-3 gap-2 border-t border-[#1A2321] pt-4">
                     {/* Pause/Resume */}
                     {camp.status === 'active' && (
                        <button onClick={(e) => handleCampaignAction(e, camp, 'pause')} 
                        className="bg-[#F2A838]/10 text-[#F2A838] py-2 rounded-[8px] text-xs font-bold hover:bg-[#F2A838] hover:text-black transition-colors">
                           ⏸ Pause
                        </button>
                     )}
                     {camp.status === 'paused' && (
                        <button onClick={(e) => handleCampaignAction(e, camp, 'resume')} 
                        className="bg-[#38F28D]/10 text-[#38F28D] py-2 rounded-[8px] text-xs font-bold hover:bg-[#38F28D] hover:text-black transition-colors">
                           ▶ Resume
                        </button>
                     )}
                     {['completed', 'draft', 'scheduled', 'done', 'Done'].includes(camp.status) && (
                        <div className="flex items-center justify-center text-[#A7B0AD] text-xs opacity-50 cursor-not-allowed">--</div>
                     )}

                     {/* Stop Button */}
                     {['active', 'paused', 'scheduled'].includes(camp.status) ? (
                        <button onClick={(e) => handleCampaignAction(e, camp, 'stop')} 
                        className="bg-[#FF6B6B]/10 text-[#FF6B6B] py-2 rounded-[8px] text-xs font-bold hover:bg-[#FF6B6B] hover:text-black transition-colors">
                           ⏹ Stop
                        </button>
                     ) : (
                        <div className="flex items-center justify-center text-[#A7B0AD] text-xs opacity-50">Stopped</div>
                     )}

                     {/* Delete Button */}
                     <button onClick={(e) => deleteCampaign(e, camp)} 
                     className="bg-[#1A2321] text-[#A7B0AD] py-2 rounded-[8px] text-xs font-bold hover:bg-white hover:text-black transition-colors">
                        🗑 Del
                     </button>
                  </div>

                </div>
              );})}
            </div>
          )}
        </div>
      )}

      {/* VIEW: UPLOAD WIZARD */}
      {activeTab === 'upload' && (
        <div className="max-w-3xl mx-auto">
          <button onClick={() => {
            if(uploadStep === 1) setActiveTab('campaigns');
            else setUploadStep(prev => prev - 1);
          }} className="mb-6 text-[#A7B0AD] hover:text-[#F2F5F4] flex items-center gap-2">← Back</button>

          {/* STEP 1: SELECT STRATEGY */}
          {uploadStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-8 text-center">Choose Strategy</h2>
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* AI CARD */}
                <div onClick={() => { setCampaignType('personalized'); setUploadStep(2); }}
                  className="bg-[#0D1211] border border-[#1A2321] p-8 rounded-[20px] cursor-pointer hover:border-[#38F28D] hover:bg-[#38F28D]/5 transition-all group relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">🧠</span>
                    <Tooltip text="Uses AI to write unique messages based on the 'last_action' column. Best for inactive clients. Replies go to You." />
                  </div>
                  <h3 className="text-xl font-bold text-[#F2F5F4] mb-2 group-hover:text-[#38F28D]">Relationship AI</h3>
                  <p className="text-sm text-[#A7B0AD] mb-6 leading-relaxed">
                    Automatically generates warm, memory-based openers. No template needed.
                  </p>
                  <div className="text-xs font-mono bg-[#1A2321] p-3 rounded border border-[#38F28D]/20 text-[#38F28D]">
                    Req: Name, Phone, Last_Action
                  </div>
                </div>

                {/* BULK CARD */}
                <div onClick={() => { setCampaignType('bulk'); setUploadStep(2); }}
                  className="bg-[#0D1211] border border-[#1A2321] p-8 rounded-[20px] cursor-pointer hover:border-[#6B8AFF] hover:bg-[#6B8AFF]/5 transition-all group relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">📢</span>
                    <Tooltip text="Sends the SAME message (e.g., Offer) to everyone. You define the template. Replies go to Agentaria AI." />
                  </div>
                  <h3 className="text-xl font-bold text-[#F2F5F4] mb-2 group-hover:text-[#6B8AFF]">Bulk Offer</h3>
                  <p className="text-sm text-[#A7B0AD] mb-6 leading-relaxed">
                    Send a standard offer or announcement to a large list.
                  </p>
                  <div className="text-xs font-mono bg-[#1A2321] p-3 rounded border border-[#6B8AFF]/20 text-[#6B8AFF]">
                    Req: Name, Phone
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: UPLOAD CSV */}
          {uploadStep === 2 && (
            <div className="text-center">
               <h2 className="text-2xl font-bold mb-2">Upload {campaignType === 'personalized' ? 'Relationship' : 'Bulk'} List</h2>
               
               <div className="bg-[#0D1211] border-2 border-dashed border-[#1A2321] rounded-[20px] p-10 mt-8 hover:border-[#38F28D]/50 transition-colors">
                 <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0])} />
                 <button onClick={() => fileInputRef.current?.click()} className="bg-[#1A2321] text-[#F2F5F4] px-8 py-3 rounded-[12px] hover:bg-[#25302D] font-semibold">
                   Select CSV File
                 </button>
                 <p className="text-[#A7B0AD] text-sm mt-4">
                   Required: {campaignType === 'personalized' ? 'client_name, client_phone, last_action' : 'client_name, client_phone'}
                 </p>
               </div>

               <div className="mt-6">
                 <button onClick={downloadSampleCSV} className="text-[#38F28D] text-sm hover:underline flex items-center justify-center gap-2 mx-auto">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   Download Sample CSV
                 </button>
               </div>
            </div>
          )}

          {/* STEP 3: CONFIGURATION */}
          {uploadStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Configure Campaign</h2>
              <div className="grid lg:grid-cols-2 gap-8">
                
                {/* FORM */}
                <div className="space-y-6">
                   <div>
                     <label className="block text-sm text-[#A7B0AD] mb-2">Campaign Name</label>
                     <input type="text" placeholder="e.g. Winter Sale" 
                       className="w-full bg-[#0D1211] border border-[#1A2321] p-3 rounded-[10px] text-white focus:border-[#38F28D] outline-none"
                       value={campaignConfig.name} onChange={e => setCampaignConfig({...campaignConfig, name: e.target.value})} />
                   </div>
                   
                   {/* SCHEDULE TOGGLE */}
                   <div>
                     <label className="block text-sm text-[#A7B0AD] mb-2">Start Time</label>
                     <div className="flex gap-4 p-1 bg-[#0D1211] border border-[#1A2321] rounded-[10px]">
                       <button onClick={() => setCampaignConfig({...campaignConfig, scheduleType: 'now'})}
                         className={`flex-1 py-2 rounded-[8px] text-sm font-medium transition-all ${campaignConfig.scheduleType === 'now' ? 'bg-[#38F28D] text-[#070A0A]' : 'text-[#A7B0AD]'}`}>
                         🚀 Immediately
                       </button>
                       <button onClick={() => setCampaignConfig({...campaignConfig, scheduleType: 'scheduled'})}
                         className={`flex-1 py-2 rounded-[8px] text-sm font-medium transition-all ${campaignConfig.scheduleType === 'scheduled' ? 'bg-[#6B8AFF] text-[#070A0A]' : 'text-[#A7B0AD]'}`}>
                         📅 Schedule
                       </button>
                     </div>
                   </div>

                   {/* SCHEDULE INPUTS */}
                   {campaignConfig.scheduleType === 'scheduled' && (
                     <div className="grid grid-cols-2 gap-4 p-4 bg-[#1A2321]/50 rounded-[12px] border border-[#1A2321]">
                       <div>
                         <label className="block text-xs text-[#A7B0AD] mb-1">Date</label>
                         <input type="date" className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[8px] p-2 text-sm text-white focus:border-[#6B8AFF] outline-none"
                           value={campaignConfig.scheduleDate} min={new Date().toISOString().split('T')[0]}
                           onChange={(e) => setCampaignConfig({...campaignConfig, scheduleDate: e.target.value})} />
                       </div>
                       <div>
                         <label className="block text-xs text-[#A7B0AD] mb-1">Time</label>
                         <input type="time" className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[8px] p-2 text-sm text-white focus:border-[#6B8AFF] outline-none"
                           value={campaignConfig.scheduleTime}
                           onChange={(e) => setCampaignConfig({...campaignConfig, scheduleTime: e.target.value})} />
                       </div>
                     </div>
                   )}

                   <div>
                     <label className="block text-sm text-[#A7B0AD] mb-2">Daily Limit: <span className="text-[#38F28D] font-bold">{campaignConfig.dailyLimit}</span></label>
                     <input type="range" min="10" max="200" step="10" className="w-full accent-[#38F28D]"
                       value={campaignConfig.dailyLimit} onChange={e => setCampaignConfig({...campaignConfig, dailyLimit: parseInt(e.target.value)})} />
                   </div>

                   {/* MESSAGE BOX LOGIC */}
                   {campaignType === 'bulk' ? (
                     <div>
                       <label className="block text-sm text-[#A7B0AD] mb-2">
                         Message Template <span className="text-[#FF6B6B]">*</span>
                         <Tooltip text="Use {{client_name}} to personalize."/>
                       </label>
                       <textarea rows="5" 
                         className="w-full bg-[#0D1211] border border-[#1A2321] p-3 rounded-[10px] text-white focus:border-[#6B8AFF] outline-none font-mono text-sm"
                         value={campaignConfig.openerMessage} 
                         onChange={e => setCampaignConfig({...campaignConfig, openerMessage: e.target.value})}
                         placeholder="Hi {{client_name}}, check out our new offer..."
                       />
                     </div>
                   ) : (
                     <div className="bg-[#38F28D]/10 border border-[#38F28D]/20 p-4 rounded-[12px]">
                       <div className="flex items-center gap-2 mb-1">
                         <span className="text-xl">🤖</span>
                         <span className="font-bold text-[#38F28D]">AI Message Generation</span>
                       </div>
                       <p className="text-sm text-[#A7B0AD]">
                         You don't need to write a message. Agentaria AI will generate a unique, friendly opener for each client based on their <strong>Last Action</strong> column.
                       </p>
                     </div>
                   )}

                   <button onClick={() => setUploadStep(4)} disabled={isLaunchDisabled()}
                     className="w-full bg-[#38F28D] text-[#070A0A] py-4 rounded-[12px] font-bold text-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                     Next: Review →
                   </button>
                </div>

                {/* DATA PREVIEW */}
                <div className="bg-[#0D1211] border border-[#1A2321] rounded-[16px] p-6 h-fit">
                   <h3 className="font-bold mb-4 text-[#38F28D]">{csvData.length} Leads Ready</h3>
                   <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                     <table className="w-full text-xs text-left">
                       <thead className="text-[#A7B0AD] sticky top-0 bg-[#0D1211]">
                         <tr><th className="py-2">Name</th><th className="py-2">Phone</th>{campaignType === 'personalized' && <th className="py-2">Action</th>}</tr>
                       </thead>
                       <tbody>
                         {csvData.map((row, i) => (
                           <tr key={i} className="border-b border-[#1A2321]/50">
                             <td className="py-2">{row.client_name}</td>
                             <td className="py-2 font-mono">{row.client_phone}</td>
                             {campaignType === 'personalized' && <td className="py-2 text-[#A7B0AD] truncate max-w-[80px]">{row.last_action}</td>}
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {uploadStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Confirm Launch</h2>
              <div className="bg-gradient-to-br from-[#0E3B2E] to-[#0D1211] border border-[#38F28D]/30 rounded-[18px] p-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">🚀</span>
                  <div>
                    <h3 className="text-xl font-bold text-[#F2F5F4]">{campaignConfig.name}</h3>
                    <p className="text-[#A7B0AD]">
                      {campaignConfig.scheduleType === 'scheduled' 
                        ? `Scheduled for ${campaignConfig.scheduleDate} at ${campaignConfig.scheduleTime}` 
                        : 'Starting Immediately'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#070A0A]/50 p-4 rounded-[12px]">
                    <span className="block text-[#A7B0AD] text-xs">Total Leads</span>
                    <span className="text-xl font-bold text-[#38F28D]">{csvData.filter(c => !c._hasError).length}</span>
                  </div>
                  <div className="bg-[#070A0A]/50 p-4 rounded-[12px]">
                    <span className="block text-[#A7B0AD] text-xs">Daily Limit</span>
                    <span className="text-xl font-bold text-[#6B8AFF]">{campaignConfig.dailyLimit}</span>
                  </div>
                  <div className="bg-[#070A0A]/50 p-4 rounded-[12px] col-span-2">
                    <span className="block text-[#A7B0AD] text-xs">Strategy</span>
                    <span className="text-lg font-bold text-[#F2F5F4]">{campaignType === 'personalized' ? '🧠 AI Personalized' : '📢 Bulk Offer'}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setUploadStep(3)} className="px-6 py-3 border border-[#1A2321] rounded-[12px] text-[#A7B0AD]">Back</button>
                  <button onClick={launchCampaign} disabled={loading}
                    className="flex-1 bg-[#38F28D] text-[#070A0A] py-3 rounded-[12px] font-bold hover:shadow-[0_0_20px_rgba(56,242,141,0.3)] transition-all">
                    {loading ? 'Processing...' : (campaignConfig.scheduleType === 'now' ? 'Confirm & Launch 🚀' : 'Confirm Schedule 📅')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CAMPAIGN DETAILS MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D1211] border border-[#1A2321] w-full max-w-4xl max-h-[90vh] rounded-[24px] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#1A2321] flex justify-between items-center bg-[#070A0A]">
               <h2 className="text-xl font-bold">{selectedCampaign.campaign_name}</h2>
               <button onClick={() => setSelectedCampaign(null)} className="p-2 hover:bg-[#1A2321] rounded-full">✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
               {selectedCampaign.loading ? <div className="text-center py-10">Loading leads...</div> : (
                 <table className="w-full text-sm">
                   <thead>
                     <tr className="text-[#A7B0AD] border-b border-[#1A2321]">
                       <th className="text-left py-3">Client</th>
                       <th className="text-left py-3">Phone</th>
                       <th className="text-left py-3">Status</th>
                       <th className="text-left py-3">Sent At</th>
                     </tr>
                   </thead>
                   <tbody>
                     {selectedCampaign.clients?.map((lead, i) => {
                       // ✅ SAFE STATUS CHECK: Crash Preventer
                       const statusKey = lead.status ? lead.status.toLowerCase() : 'pending';
                       const statusConfig = CLIENT_STATUS[statusKey] || { label: lead.status || 'Unknown', color: '#A7B0AD' };

                       return (
                         <tr key={i} className="border-b border-[#1A2321]/30 hover:bg-[#1A2321]/20">
                           <td className="py-3 font-medium">{lead.client_name}</td>
                           <td className="py-3 font-mono text-[#A7B0AD]">{lead.client_phone}</td>
                           <td className="py-3">
                             <span className={`px-2 py-1 rounded text-xs text-white`}
                               style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}>
                               {statusConfig.label}
                             </span>
                           </td>
                           <td className="py-3 text-[#A7B0AD] text-xs">
                             {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               )}
            </div>
            <div className="p-4 border-t border-[#1A2321] bg-[#070A0A] flex justify-end gap-3">
               <button onClick={() => setSelectedCampaign(null)} className="px-4 py-2 bg-[#1A2321] text-white rounded-[10px]">Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{` .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #1A2321; border-radius: 4px; } `}</style>
    </div>
  );
};

export default ClientReopenerPage;