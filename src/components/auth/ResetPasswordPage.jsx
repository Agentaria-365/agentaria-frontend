import React, { useState } from 'react';
import { supabase } from '../../config/supabase';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // ✅ Update: Redirect to the new password page
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:5173/new-password', 
      });

      if (error) throw error;

      setSuccess(true);
    } catch (error) {
      console.error('Reset Password Error:', error.message);
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#070A0A] text-[#F2F5F4] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[450px]">
          <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-[#38F28D]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#38F28D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Check Your Email</h1>
            <p className="text-[#A7B0AD] mb-8">
              We've sent a password reset link to<br />
              <span className="text-[#F2F5F4] font-semibold">{email}</span>
            </p>
            <button onClick={() => setSuccess(false)} className="text-[#38F28D] hover:underline font-semibold">
              try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0A] text-[#F2F5F4] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[450px]">
        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-[#A7B0AD] mb-8">Enter your email address to reset password.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none"
                placeholder="your@email.com"
              />
              {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#38F28D] text-[#070A0A] py-3.5 rounded-[12px] font-semibold hover:scale-[1.02] transition-all"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-[#1A2321]">
            <a href="/login" className="text-[#38F28D] hover:underline">← Back to login</a>
          </div>
        </div>
      </div>
    </div>
  );
};

// 👇 YE LINE MISSING THI, ISLIYE ERROR AA RAHA THA
export default ResetPasswordPage;