import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';

const NewPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setValidToken(true);
      } else {
        setError('This password reset link is invalid or has expired.');
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      alert('✅ Password updated successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  if (!validToken && !error) {
    return (
      <div className="min-h-screen bg-[#070A0A] text-[#F2F5F4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38F28D]"></div>
      </div>
    );
  }

  if (error && !validToken) {
    return (
      <div className="min-h-screen bg-[#070A0A] text-[#F2F5F4] flex items-center justify-center px-6">
        <div className="w-full max-w-[450px]">
          <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-8 text-center">
            <h1 className="text-3xl font-bold mb-4 text-red-400">Invalid Link</h1>
            <p className="text-[#A7B0AD] mb-8">{error}</p>
            {/* 👇 YE LINE ERROR CAUSE KAR RAHI THI, AB FIXED HAI */}
            <a href="/reset-password" className="text-[#38F28D] hover:underline font-semibold">
              Request a new reset link →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0A] text-[#F2F5F4] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[450px]">
        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <div>
              <label className="block text-sm font-semibold mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none"
                placeholder="Min 8 chars"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none"
                placeholder="Re-enter password"
              />
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#38F28D] text-[#070A0A] py-3.5 rounded-[12px] font-bold hover:scale-[1.02] transition-all"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPasswordPage;