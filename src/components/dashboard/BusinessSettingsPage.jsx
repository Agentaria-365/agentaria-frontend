import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabase';
import {
  Settings,
  FileText,
  Link2,
  Clock,
  Upload,
  Trash2,
  Plus,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  File,
  ExternalLink,
  Globe,
  Calendar
} from 'lucide-react';

// ============================================================
// N8N WEBHOOK URLs
// ============================================================
const N8N_WEBHOOKS = {
  docIngestor: 'https://n8n.srv1192286.hstgr.cloud/webhook/doc-ingestor',
  docDelete: 'https://n8n.srv1192286.hstgr.cloud/webhook/doc-delete',
};

// ============================================================
// DAYS OF WEEK
// ============================================================
const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

// Default working hours
const DEFAULT_WORKING_HOURS = DAYS_OF_WEEK.reduce((acc, day) => {
  acc[day.key] = {
    isOpen: day.key !== 'sunday',
    startTime: '09:00',
    endTime: '18:00'
  };
  return acc;
}, {});

// ============================================================
// PLATFORM SUGGESTIONS
// ============================================================
const PLATFORM_SUGGESTIONS = [
  { name: 'Google', icon: '🔍', placeholder: 'https://g.page/r/your-business/review' },
  { name: 'Facebook', icon: '📘', placeholder: 'https://facebook.com/your-page/reviews' },
  { name: 'Yelp', icon: '⭐', placeholder: 'https://yelp.com/biz/your-business' },
  { name: 'TripAdvisor', icon: '🌍', placeholder: 'https://tripadvisor.com/...' },
  { name: 'Trustpilot', icon: '💚', placeholder: 'https://trustpilot.com/review/...' },
  { name: 'Other', icon: '🔗', placeholder: 'https://...' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
const BusinessSettingsPage = () => {
  // User State
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Tab State
  const [activeTab, setActiveTab] = useState('docs'); // docs | links | hours
  
  // Toast/Alert State
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  
  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

  // ============================================================
  // TAB 1: AI Knowledge Base State
  // ============================================================
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // ============================================================
  // TAB 2: Review Links State
  // ============================================================
  const [reviewLinks, setReviewLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  const [newLink, setNewLink] = useState({ platform_name: '', review_url: '' });
  const [savingLink, setSavingLink] = useState(false);

  // ============================================================
  // TAB 3: Working Hours State
  // ============================================================
  const [workingHours, setWorkingHours] = useState(DEFAULT_WORKING_HOURS);
  const [loadingHours, setLoadingHours] = useState(true);
  const [savingHours, setSavingHours] = useState(false);

  // ============================================================
  // TOAST HELPER
  // ============================================================
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
  };

  // ============================================================
  // FETCH INITIAL DATA
  // ============================================================
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      setUserId(user.id);
      
      // Fetch all data in parallel
      await Promise.all([
        fetchDocuments(user.id),
        fetchReviewLinks(user.id),
        fetchWorkingHours(user.id)
      ]);
      
      setLoading(false);
    };
    
    fetchInitialData();
  }, []);

  // ============================================================
  // TAB 1: DOCUMENTS FUNCTIONS
  // ============================================================
  const fetchDocuments = async (uid) => {
    setLoadingDocs(true);
    try {
      // Fetch unique filenames from doc_chunks via metadata
      const { data, error } = await supabase
        .from('doc_chunks')
        .select('metadata')
        .eq('subscriber_id', uid);
      
      if (error) throw error;
      
      // Extract unique filenames from metadata
      const fileMap = new Map();
      (data || []).forEach(chunk => {
        try {
          const meta = typeof chunk.metadata === 'string' 
            ? JSON.parse(chunk.metadata) 
            : chunk.metadata;
          
          if (meta?.source || meta?.file_name) {
            const fileName = meta.file_name || meta.source || 'Unknown';
            if (!fileMap.has(fileName)) {
              fileMap.set(fileName, {
                name: fileName,
                chunks: 0,
                uploadedAt: meta.uploaded_at || new Date().toISOString()
              });
            }
            fileMap.get(fileName).chunks++;
          }
        } catch (e) {
          // Skip invalid metadata
        }
      });
      
      setDocuments(Array.from(fileMap.values()));
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast('error', 'Please upload a PDF file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showToast('error', 'File size must be less than 10MB');
      return;
    }
    
    setUploading(true);
    setUploadProgress('Uploading document...');
    
    try {
      const formData = new FormData();
      formData.append('subscriber_id', userId);
      formData.append('file', file);
      
      // ✅ Nayi Line: File name alag se bhejna zaroori hai
      formData.append('file_name', file.name); 
      
      setUploadProgress('Processing & ingesting...');
      
      const response = await fetch(N8N_WEBHOOKS.docIngestor, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      showToast('success', `"${file.name}" uploaded and ingested successfully!`);
      
      // Refresh documents list after a short delay
      setTimeout(() => fetchDocuments(userId), 2000);
      
    } catch (err) {
      console.error('Upload error:', err);
      showToast('error', 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleDeleteDocument = (fileName) => {
    setConfirmModal({
      show: true,
      title: 'Delete Document',
      message: `Are you sure you want to delete "${fileName}"? This will remove all associated AI knowledge.`,
      onConfirm: async () => {
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
        
        try {
          const response = await fetch(N8N_WEBHOOKS.docDelete, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscriber_id: userId,
              file_name: fileName
            })
          });
          
          if (!response.ok) throw new Error('Delete failed');
          
          showToast('success', `"${fileName}" deleted successfully!`);
          setDocuments(prev => prev.filter(d => d.name !== fileName));
          
        } catch (err) {
          console.error('Delete error:', err);
          showToast('error', 'Failed to delete document');
        }
      }
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // ============================================================
  // TAB 2: REVIEW LINKS FUNCTIONS
  // ============================================================
  const fetchReviewLinks = async (uid) => {
    setLoadingLinks(true);
    try {
      const { data, error } = await supabase
        .from('review_links')
        .select('*')
        .eq('subscriber_id', uid)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReviewLinks(data || []);
    } catch (err) {
      console.error('Error fetching review links:', err);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleAddLink = async () => {
    if (!newLink.platform_name.trim()) {
      showToast('error', 'Please enter platform name');
      return;
    }
    if (!newLink.review_url.trim()) {
      showToast('error', 'Please enter review URL');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(newLink.review_url);
    } catch {
      showToast('error', 'Please enter a valid URL');
      return;
    }
    
    setSavingLink(true);
    try {
      const { data, error } = await supabase
        .from('review_links')
        .insert({
          subscriber_id: userId,
          platform_name: newLink.platform_name.trim(),
          review_url: newLink.review_url.trim()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setReviewLinks(prev => [data, ...prev]);
      setNewLink({ platform_name: '', review_url: '' });
      setShowAddLinkForm(false);
      showToast('success', 'Review link added!');
      
    } catch (err) {
      console.error('Error adding link:', err);
      showToast('error', 'Failed to add link');
    } finally {
      setSavingLink(false);
    }
  };

  const handleDeleteLink = (linkId, platformName) => {
    setConfirmModal({
      show: true,
      title: 'Delete Review Link',
      message: `Are you sure you want to delete "${platformName}"?`,
      onConfirm: async () => {
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
        
        try {
          const { error } = await supabase
            .from('review_links')
            .delete()
            .eq('id', linkId);
          
          if (error) throw error;
          
          setReviewLinks(prev => prev.filter(l => l.id !== linkId));
          showToast('success', 'Link deleted!');
          
        } catch (err) {
          console.error('Delete error:', err);
          showToast('error', 'Failed to delete link');
        }
      }
    });
  };

  // ============================================================
  // TAB 3: WORKING HOURS FUNCTIONS
  // ============================================================
  const fetchWorkingHours = async (uid) => {
    setLoadingHours(true);
    try {
      const { data, error } = await supabase
        .from('business_settings')
        .select('working_hours')
        .eq('subscriber_id', uid)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      if (data?.working_hours) {
        setWorkingHours(data.working_hours);
      }
    } catch (err) {
      console.error('Error fetching working hours:', err);
    } finally {
      setLoadingHours(false);
    }
  };

  const handleHoursChange = (dayKey, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value
      }
    }));
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try {
      // Check if row exists
      const { data: existing } = await supabase
        .from('business_settings')
        .select('id')
        .eq('subscriber_id', userId)
        .single();
      
      if (existing) {
        // Update
        const { error } = await supabase
          .from('business_settings')
          .update({ working_hours: workingHours, updated_at: new Date().toISOString() })
          .eq('subscriber_id', userId);
        
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('business_settings')
          .insert({
            subscriber_id: userId,
            working_hours: workingHours
          });
        
        if (error) throw error;
      }
      
      showToast('success', 'Working hours saved!');
      
    } catch (err) {
      console.error('Save error:', err);
      showToast('error', 'Failed to save working hours');
    } finally {
      setSavingHours(false);
    }
  };

  // ============================================================
  // RENDER - LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#38F28D] animate-spin mx-auto mb-4" />
          <p className="text-[#A7B0AD]">Loading settings...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER - TAB 1: AI KNOWLEDGE BASE
  // ============================================================
  const renderDocsTab = () => (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-[16px] p-8 text-center transition-all ${
          dragActive
            ? 'border-[#38F28D] bg-[#38F28D]/5'
            : 'border-[#1A2321] hover:border-[#38F28D]/50'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="py-4">
            <Loader2 className="w-10 h-10 text-[#38F28D] animate-spin mx-auto mb-3" />
            <p className="text-[#38F28D] font-medium">{uploadProgress}</p>
            <p className="text-[#A7B0AD] text-sm mt-1">This may take a minute...</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 bg-[#38F28D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7 text-[#38F28D]" />
            </div>
            <h3 className="text-lg font-semibold text-[#F2F5F4] mb-2">
              Upload PDF Document
            </h3>
            <p className="text-[#A7B0AD] text-sm mb-4">
              Drag & drop or click to upload. Max 10MB.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#1A2321] text-[#F2F5F4] px-6 py-2.5 rounded-[10px] font-medium hover:bg-[#1A2321]/80 transition-colors"
            >
              Select PDF
            </button>
          </>
        )}
      </div>

      {/* Documents List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#F2F5F4]">Uploaded Documents</h3>
          <span className="text-xs text-[#A7B0AD] bg-[#070A0A] px-2 py-1 rounded">
            {documents.length} file{documents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loadingDocs ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-[#38F28D] animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-[#070A0A] border border-[#1A2321] rounded-[14px] p-8 text-center">
            <FileText className="w-12 h-12 text-[#A7B0AD] mx-auto mb-3" />
            <p className="text-[#A7B0AD]">No documents uploaded yet</p>
            <p className="text-[#4A5553] text-sm mt-1">Upload PDFs to train your AI assistant</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="bg-[#070A0A] border border-[#1A2321] rounded-[12px] p-4 flex items-center justify-between hover:border-[#1A2321]/80 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF6B6B]/10 rounded-[10px] flex items-center justify-center">
                    <File className="w-5 h-5 text-[#FF6B6B]" />
                  </div>
                  <div>
                    <p className="text-[#F2F5F4] font-medium text-sm">{doc.name}</p>
                    <p className="text-[#A7B0AD] text-xs">{doc.chunks} chunks indexed</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteDocument(doc.name)}
                  className="p-2 text-[#A7B0AD] hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-[8px] transition-colors"
                  title="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-[#070A0A] border border-[#1A2321] rounded-[14px] p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#6B8AFF] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[#F2F5F4] text-sm font-medium mb-1">How it works</p>
            <p className="text-[#A7B0AD] text-xs leading-relaxed">
              Upload PDFs containing your business information, FAQs, service details, pricing, etc.
              The AI will use this knowledge to answer customer questions accurately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER - TAB 2: REVIEW LINKS
  // ============================================================
  const renderLinksTab = () => (
    <div className="space-y-6">
      {/* Add New Link Form */}
      {showAddLinkForm ? (
        <div className="bg-[#070A0A] border border-[#38F28D]/30 rounded-[16px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#F2F5F4]">Add Review Platform</h3>
            <button
              onClick={() => { setShowAddLinkForm(false); setNewLink({ platform_name: '', review_url: '' }); }}
              className="p-1 text-[#A7B0AD] hover:text-[#F2F5F4] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Platform Suggestions */}
          <div className="mb-4">
            <label className="block text-xs text-[#A7B0AD] mb-2">Quick select:</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_SUGGESTIONS.map(p => (
                <button
                  key={p.name}
                  onClick={() => setNewLink(prev => ({ ...prev, platform_name: p.name }))}
                  className={`px-3 py-1.5 rounded-[8px] text-sm transition-all ${
                    newLink.platform_name === p.name
                      ? 'bg-[#38F28D] text-[#070A0A] font-medium'
                      : 'bg-[#1A2321] text-[#A7B0AD] hover:bg-[#1A2321]/80'
                  }`}
                >
                  {p.icon} {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#F2F5F4] mb-2">Platform Name</label>
              <input
                type="text"
                value={newLink.platform_name}
                onChange={(e) => setNewLink(prev => ({ ...prev, platform_name: e.target.value }))}
                placeholder="e.g., Google, Facebook"
                className="w-full bg-[#0D1211] border border-[#1A2321] rounded-[10px] px-4 py-3 text-[#F2F5F4] placeholder-[#4A5553] focus:border-[#38F28D] focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#F2F5F4] mb-2">Review URL</label>
              <input
                type="url"
                value={newLink.review_url}
                onChange={(e) => setNewLink(prev => ({ ...prev, review_url: e.target.value }))}
                placeholder={PLATFORM_SUGGESTIONS.find(p => p.name === newLink.platform_name)?.placeholder || 'https://...'}
                className="w-full bg-[#0D1211] border border-[#1A2321] rounded-[10px] px-4 py-3 text-[#F2F5F4] placeholder-[#4A5553] focus:border-[#38F28D] focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowAddLinkForm(false); setNewLink({ platform_name: '', review_url: '' }); }}
                className="flex-1 py-2.5 border border-[#1A2321] text-[#A7B0AD] rounded-[10px] font-medium hover:border-[#38F28D]/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLink}
                disabled={savingLink}
                className="flex-1 py-2.5 bg-[#38F28D] text-[#070A0A] rounded-[10px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {savingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Link
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddLinkForm(true)}
          className="w-full bg-[#070A0A] border-2 border-dashed border-[#1A2321] rounded-[16px] p-6 text-center hover:border-[#38F28D]/50 transition-all group"
        >
          <Plus className="w-8 h-8 text-[#A7B0AD] mx-auto mb-2 group-hover:text-[#38F28D] transition-colors" />
          <p className="text-[#A7B0AD] font-medium group-hover:text-[#F2F5F4] transition-colors">
            Add Review Platform
          </p>
        </button>
      )}

      {/* Links List */}
      <div>
        <h3 className="text-lg font-semibold text-[#F2F5F4] mb-4">Your Review Links</h3>

        {loadingLinks ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-[#38F28D] animate-spin" />
          </div>
        ) : reviewLinks.length === 0 ? (
          <div className="bg-[#070A0A] border border-[#1A2321] rounded-[14px] p-8 text-center">
            <Link2 className="w-12 h-12 text-[#A7B0AD] mx-auto mb-3" />
            <p className="text-[#A7B0AD]">No review links added yet</p>
            <p className="text-[#4A5553] text-sm mt-1">Add platforms where customers can leave reviews</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviewLinks.map(link => {
              const platformInfo = PLATFORM_SUGGESTIONS.find(p => 
                p.name.toLowerCase() === link.platform_name.toLowerCase()
              ) || { icon: '🔗' };
              
              return (
                <div
                  key={link.id}
                  className="bg-[#070A0A] border border-[#1A2321] rounded-[12px] p-4 flex items-center justify-between hover:border-[#1A2321]/80 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-[#0E3B2E] rounded-[10px] flex items-center justify-center text-lg">
                      {platformInfo.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[#F2F5F4] font-medium text-sm">{link.platform_name}</p>
                      <p className="text-[#A7B0AD] text-xs truncate">{link.review_url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <a
                      href={link.review_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-[#A7B0AD] hover:text-[#38F28D] hover:bg-[#38F28D]/10 rounded-[8px] transition-colors"
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteLink(link.id, link.platform_name)}
                      className="p-2 text-[#A7B0AD] hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-[8px] transition-colors"
                      title="Delete link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ============================================================
  // RENDER - TAB 3: WORKING HOURS (FIXED)
  // ============================================================
  const renderHoursTab = () => (
    <div className="space-y-6">
      {loadingHours ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-[#38F28D] animate-spin" />
        </div>
      ) : (
        <>
          {/* Days List */}
          <div className="space-y-3">
            {DAYS_OF_WEEK.map(day => {
              const dayData = workingHours[day.key] || { isOpen: false, startTime: '09:00', endTime: '18:00' };
              
              return (
                <div
                  key={day.key}
                  className={`bg-[#070A0A] border rounded-[12px] p-4 transition-all ${
                    dayData.isOpen ? 'border-[#38F28D]/30' : 'border-[#1A2321]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Day Name & Toggle */}
                    <div className="flex items-center gap-4">
                      <div className="w-24">
                        <p className="text-[#F2F5F4] font-medium">{day.label}</p>
                      </div>
                      
                      {/* Toggle Switch (Fixed UI) */}
                      <button
                        onClick={() => handleHoursChange(day.key, 'isOpen', !dayData.isOpen)}
                        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 mr-3 ${
                          dayData.isOpen ? 'bg-[#38F28D]' : 'bg-[#1A2321]'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
                            dayData.isOpen ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      
                      <span className={`text-sm font-medium w-12 ${dayData.isOpen ? 'text-[#38F28D]' : 'text-[#A7B0AD]'}`}>
                        {dayData.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>

                    {/* Time Pickers */}
                    {dayData.isOpen && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={dayData.startTime}
                          onChange={(e) => handleHoursChange(day.key, 'startTime', e.target.value)}
                          className="bg-[#0D1211] border border-[#1A2321] rounded-[8px] px-3 py-1.5 text-[#F2F5F4] text-sm focus:border-[#38F28D] focus:outline-none"
                        />
                        <span className="text-[#A7B0AD]">to</span>
                        <input
                          type="time"
                          value={dayData.endTime}
                          onChange={(e) => handleHoursChange(day.key, 'endTime', e.target.value)}
                          className="bg-[#0D1211] border border-[#1A2321] rounded-[8px] px-3 py-1.5 text-[#F2F5F4] text-sm focus:border-[#38F28D] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveHours}
            disabled={savingHours}
            className="w-full bg-[#38F28D] text-[#070A0A] py-3 rounded-[12px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {savingHours ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Working Hours
              </>
            )}
          </button>

          {/* Info Box */}
          <div className="bg-[#070A0A] border border-[#1A2321] rounded-[14px] p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#6B8AFF] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#F2F5F4] text-sm font-medium mb-1">How it's used</p>
                <p className="text-[#A7B0AD] text-xs leading-relaxed">
                  The AI will inform customers about your business hours and avoid scheduling 
                  during closed times. It will also let customers know when you'll be available.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
  
  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="max-w-[900px] mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#F2F5F4] mb-2 flex items-center gap-3">
          <Settings className="w-10 h-10 text-[#38F28D]" />
          Business Settings
        </h1>
        <p className="text-[#A7B0AD] text-lg">
          Configure your AI assistant and business information
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 bg-[#070A0A] p-1.5 rounded-[14px] border border-[#1A2321]">
        {[
          { key: 'docs', label: 'AI Knowledge', icon: FileText },
          { key: 'links', label: 'Review Links', icon: Link2 },
          { key: 'hours', label: 'Working Hours', icon: Clock },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-[10px] font-medium transition-all ${
                isActive
                  ? 'bg-[#38F28D] text-[#070A0A]'
                  : 'text-[#A7B0AD] hover:text-[#F2F5F4] hover:bg-[#1A2321]/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-6">
        {activeTab === 'docs' && renderDocsTab()}
        {activeTab === 'links' && renderLinksTab()}
        {activeTab === 'hours' && renderHoursTab()}
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

      {/* Confirm Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FF6B6B]/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[#FF6B6B]" />
              </div>
              <h3 className="text-lg font-bold text-[#F2F5F4]">{confirmModal.title}</h3>
            </div>
            <p className="text-[#A7B0AD] text-sm mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })}
                className="flex-1 py-2.5 border border-[#1A2321] text-[#A7B0AD] rounded-[10px] font-medium hover:border-[#38F28D]/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 py-2.5 bg-[#FF6B6B] text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        * { font-family: 'Sora', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1A2321; border-radius: 2px; }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default BusinessSettingsPage;
