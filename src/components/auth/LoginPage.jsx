import React, { useState } from 'react';
import { supabase } from '../../config/supabase'; // Supabase Import
import { useNavigate } from 'react-router-dom';   // Redirect Import

const LoginPage = () => {
  const navigate = useNavigate(); // Navigation hook

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (errors[name] || errors.submit) {
      setErrors(prev => ({ ...prev, [name]: '', submit: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // 1. Asli Supabase Login Call
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // 2. Success! Redirect to Dashboard
      console.log('Login Successful:', data);
      navigate('/dashboard/whatsapp'); // Yahan user ko bhej rahe hain
      
    } catch (error) {
      console.error('Login Error:', error.message);
      
      // User ko saaf error dikhana zaroori hai
      let errorMessage = 'Invalid email or password.';
      if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please verify your email before logging in.";
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0A] text-[#F2F5F4] flex items-center justify-center px-6 py-12">
      {/* Background Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#0E3B2E]/20 rounded-full blur-[120px] -z-10"></div>

      <div className="w-full max-w-[450px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block text-3xl font-bold">
            <span className="text-[#38F28D]">Agent</span>
            <span className="text-[#F2F5F4]">aria</span>
          </a>
        </div>

        {/* Login Card */}
        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-[#A7B0AD] mb-8">Log in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none transition-colors"
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none transition-colors"
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="w-4 h-4 bg-[#070A0A] border border-[#1A2321] rounded accent-[#38F28D]"
                />
                <span className="text-sm text-[#A7B0AD]">Remember me</span>
              </label>
              <a href="/reset-password" className="text-sm text-[#38F28D] hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit Error (Login Failed Message) */}
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-[12px] p-3 text-red-400 text-sm text-center">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#38F28D] text-[#070A0A] py-3.5 rounded-[12px] font-semibold hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(56,242,141,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Signup Link */}
          <div className="text-center mt-6 pt-6 border-t border-[#1A2321]">
            <p className="text-[#A7B0AD]">
              Don't have an account?{' '}
              <a href="/signup" className="text-[#38F28D] font-semibold hover:underline">
                Sign up free
              </a>
            </p>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-8 text-sm text-[#A7B0AD]">
          🔒 Your data is secure and encrypted
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Sora', system-ui, -apple-system, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;