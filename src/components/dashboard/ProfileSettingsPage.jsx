import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabase';
import {
  User,
  Mail,
  Phone,
  Building2,
  Camera,
  Lock,
  Shield,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Calendar,
  Edit3
} from 'lucide-react';

// ============================================================
// MAIN COMPONENT
// ============================================================
const ProfileSettingsPage = () => {
  // User & Auth State
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Profile Data State
  const [profile, setProfile] = useState({
    subscriber_name: '',
    business_name: '',
    service_number: '',
    subscriber_number: '',
    avatar_url: '',
    created_at: ''
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Avatar Upload State
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);
  
  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [savingPassword, setSavingPassword] = useState(false);
  
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
  // FETCH USER & PROFILE DATA
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error('Auth error:', authError);
          setLoading(false);
          return;
        }
        
        setUserId(user.id);
        setUserEmail(user.email || '');
        
        // Fetch profile from "subscribers details" table
        const { data: profileData, error: profileError } = await supabase
          .from('subscribers details')
          .select('*')
          .eq('subscriber_id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
        }
        
        if (profileData) {
          const profileState = {
            subscriber_name: profileData.subscriber_name || '',
            business_name: profileData.business_name || '',
            service_number: profileData.service_number || '',
            subscriber_number: profileData.subscriber_number || '',
            avatar_url: profileData.avatar_url || '',
            created_at: profileData.created_at || ''
          };
          setProfile(profileState);
          setOriginalProfile(profileState);
        }
        
      } catch (err) {
        console.error('Fetch error:', err);
        showToast('error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // ============================================================
  // PROFILE HANDLERS
  // ============================================================
  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleCancelEdit = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!profile.subscriber_name.trim()) {
      showToast('error', 'Full name is required');
      return;
    }
    
    setSavingProfile(true);
    
    try {
      const { error } = await supabase
        .from('subscribers details')
        .update({
          subscriber_name: profile.subscriber_name.trim(),
          business_name: profile.business_name.trim(),
          service_number: profile.service_number.trim()
        })
        .eq('subscriber_id', userId);
      
      if (error) throw error;
      
      setOriginalProfile(profile);
      setIsEditing(false);
      showToast('success', 'Profile updated successfully!');
      
    } catch (err) {
      console.error('Save error:', err);
      showToast('error', 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // ============================================================
  // AVATAR UPLOAD HANDLER
  // ============================================================
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please upload an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Image must be less than 2MB');
      return;
    }
    
    setUploadingAvatar(true);
    
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('subscribers details')
        .update({ avatar_url: publicUrl })
        .eq('subscriber_id', userId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      setOriginalProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      
      showToast('success', 'Avatar updated successfully!');
      
    } catch (err) {
      console.error('Avatar upload error:', err);
      showToast('error', 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  // ============================================================
  // PASSWORD HANDLERS
  // ============================================================
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdatePassword = async () => {
    // Validation
    if (!passwordData.newPassword) {
      showToast('error', 'New password is required');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      showToast('error', 'Password must be at least 8 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }
    
    setSavingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      showToast('success', 'Password updated successfully!');
      
    } catch (err) {
      console.error('Password update error:', err);
      showToast('error', err.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  // ============================================================
  // HELPER - Get initials
  // ============================================================
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // ============================================================
  // HELPER - Format date
  // ============================================================
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  // ============================================================
  // RENDER - LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#38F28D] animate-spin mx-auto mb-4" />
          <p className="text-[#A7B0AD]">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="max-w-[800px] mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#F2F5F4] mb-2 flex items-center gap-3">
          <User className="w-10 h-10 text-[#38F28D]" />
          Profile Settings
        </h1>
        <p className="text-[#A7B0AD] text-lg">
          Manage your account information and security
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-6 mb-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#1A2321] bg-[#0E3B2E]">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#38F28D] text-3xl font-bold">
                  {getInitials(profile.subscriber_name)}
                </div>
              )}
            </div>
            
            {/* Upload Overlay */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </button>
            
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            
            {/* Camera Badge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#38F28D] rounded-full flex items-center justify-center border-3 border-[#0D1211]">
              <Camera className="w-4 h-4 text-[#070A0A]" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#F2F5F4] mb-1">
              {profile.subscriber_name || 'User'}
            </h2>
            <p className="text-[#A7B0AD] flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              {userEmail}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#A7B0AD] flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Member since {formatDate(profile.created_at)}
              </span>
              <span className="px-2 py-0.5 bg-[#38F28D]/10 text-[#38F28D] rounded-full text-xs font-medium">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#38F28D]/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-[#38F28D]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F2F5F4]">Personal Information</h3>
              <p className="text-sm text-[#A7B0AD]">Update your personal details</p>
            </div>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#070A0A] border border-[#1A2321] rounded-[10px] text-[#A7B0AD] hover:text-[#F2F5F4] hover:border-[#38F28D]/30 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-[#1A2321] rounded-[10px] text-[#A7B0AD] hover:text-[#F2F5F4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex items-center gap-2 px-4 py-2 bg-[#38F28D] text-[#070A0A] rounded-[10px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {savingProfile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#F2F5F4] mb-2">
              <User className="w-4 h-4 text-[#38F28D]" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.subscriber_name}
                onChange={(e) => handleProfileChange('subscriber_name', e.target.value)}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 text-[#F2F5F4] focus:border-[#38F28D] focus:outline-none transition-colors"
                placeholder="Enter your full name"
              />
            ) : (
              <div className="bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 text-[#F2F5F4]">
                {profile.subscriber_name || <span className="text-[#4A5553]">Not set</span>}
              </div>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#F2F5F4] mb-2">
              <Mail className="w-4 h-4 text-[#38F28D]" />
              Email Address
              <span className="text-xs text-[#A7B0AD] font-normal">(Cannot be changed)</span>
            </label>
            <div className="bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 text-[#A7B0AD] cursor-not-allowed">
              {userEmail}
            </div>
          </div>

          {/* Business Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#F2F5F4] mb-2">
              <Building2 className="w-4 h-4 text-[#38F28D]" />
              Business Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.business_name}
                onChange={(e) => handleProfileChange('business_name', e.target.value)}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 text-[#F2F5F4] focus:border-[#38F28D] focus:outline-none transition-colors"
                placeholder="Enter your business name"
              />
            ) : (
              <div className="bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 text-[#F2F5F4]">
                {profile.business_name || <span className="text-[#4A5553]">Not set</span>}
              </div>
            )}
          </div>

          {/* Phone Numbers Row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Main Phone (Read-only) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#F2F5F4] mb-2">
                <Phone className="w-4 h-4 text-[#38F28D]" />
                Main Phone
                <span className="text-xs text-[#A7B0AD] font-normal">(Read-only)</span>
              </label>
              <div className="bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 text-[#A7B0AD] cursor-not-allowed">
                {profile.subscriber_number || <span className="text-[#4A5553]">Not set</span>}
              </div>
            </div>

            {/* Service Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#F2F5F4] mb-2">
                <Phone className="w-4 h-4 text-[#38F28D]" />
                Service Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.service_number}
                  onChange={(e) => handleProfileChange('service_number', e.target.value)}
                  className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 text-[#F2F5F4] focus:border-[#38F28D] focus:outline-none transition-colors"
                  placeholder="923001234567"
                />
              ) : (
                <div className="bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 text-[#F2F5F4]">
                  {profile.service_number || <span className="text-[#4A5553]">Not set</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Card - Change Password */}
      <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#6B8AFF]/10 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#6B8AFF]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F2F5F4]">Security</h3>
            <p className="text-sm text-[#A7B0AD]">Update your password</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#F2F5F4] mb-2">
              <Lock className="w-4 h-4 text-[#6B8AFF]" />
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 pr-12 text-[#F2F5F4] focus:border-[#6B8AFF] focus:outline-none transition-colors"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A7B0AD] hover:text-[#F2F5F4] transition-colors"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#F2F5F4] mb-2">
              <Lock className="w-4 h-4 text-[#6B8AFF]" />
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 pr-12 text-[#F2F5F4] focus:border-[#6B8AFF] focus:outline-none transition-colors"
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A7B0AD] hover:text-[#F2F5F4] transition-colors"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-[#F2F5F4] mb-2">
              <Lock className="w-4 h-4 text-[#6B8AFF]" />
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 pr-12 text-[#F2F5F4] focus:border-[#6B8AFF] focus:outline-none transition-colors"
                placeholder="Repeat new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A7B0AD] hover:text-[#F2F5F4] transition-colors"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password Match Indicator */}
          {passwordData.newPassword && passwordData.confirmPassword && (
            <div className={`flex items-center gap-2 text-sm ${
              passwordData.newPassword === passwordData.confirmPassword
                ? 'text-[#38F28D]'
                : 'text-[#FF6B6B]'
            }`}>
              {passwordData.newPassword === passwordData.confirmPassword ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Passwords match
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Passwords do not match
                </>
              )}
            </div>
          )}

          {/* Update Password Button */}
          <button
            onClick={handleUpdatePassword}
            disabled={savingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className="w-full bg-[#6B8AFF] text-white py-3 rounded-[12px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {savingPassword ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Update Password
              </>
            )}
          </button>
        </div>

        {/* Security Info */}
        <div className="mt-6 pt-4 border-t border-[#1A2321]">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#F2A838] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#F2F5F4] text-sm font-medium mb-1">Password Requirements</p>
              <ul className="text-[#A7B0AD] text-xs space-y-1">
                <li>• Minimum 8 characters</li>
                <li>• Use a mix of letters, numbers, and symbols for better security</li>
                <li>• Avoid using common words or personal information</li>
              </ul>
            </div>
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

export default ProfileSettingsPage;