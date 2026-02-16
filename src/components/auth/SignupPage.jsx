import React, { useState } from 'react';
import { supabase } from '../../config/supabase';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    country: '',
    mainPhone: '',
    servicePhone: '',
    industry: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Expanded Country List
  const countries = [
    { code: '+1', name: 'United States' },
    { code: '+1', name: 'Canada' },
    { code: '+44', name: 'United Kingdom' },
    { code: '+92', name: 'Pakistan' },
    { code: '+91', name: 'India' },
    { code: '+971', name: 'United Arab Emirates' },
    { code: '+966', name: 'Saudi Arabia' },
    { code: '+61', name: 'Australia' },
    { code: '+49', name: 'Germany' },
    { code: '+33', name: 'France' },
    { code: '+39', name: 'Italy' },
    { code: '+34', name: 'Spain' },
    { code: '+31', name: 'Netherlands' },
    { code: '+55', name: 'Brazil' },
    { code: '+52', name: 'Mexico' },
    { code: '+27', name: 'South Africa' },
    { code: '+65', name: 'Singapore' },
    { code: '+60', name: 'Malaysia' },
    { code: '+62', name: 'Indonesia' },
    { code: '+81', name: 'Japan' },
    { code: '+82', name: 'South Korea' },
    { code: '+90', name: 'Turkey' },
    { code: '+20', name: 'Egypt' },
  ].sort((a, b) => a.name.localeCompare(b.name));

  const industries = [
    'Cleaning Services', 
    'Healthcare', 
    'Salon & Spa', 
    'Fitness & Gym', 
    'Restaurant', 
    'Real Estate', 
    'Consulting', 
    'Education', 
    'E-commerce',
    'Automotive',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ✅ Validation Logic (Updated for Phone Numbers)
  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^\d+$/; // Sirf Numbers allow karega

    if (!formData.fullName) newErrors.fullName = 'Full Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Min 8 chars required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.businessName) newErrors.businessName = 'Business name is required';
    if (!formData.country) newErrors.country = 'Country is required';
    
    // Main Phone Validation
    if (!formData.mainPhone) {
      newErrors.mainPhone = 'Main phone is required';
    } else if (!phoneRegex.test(formData.mainPhone)) {
      newErrors.mainPhone = "Enter only numbers (Country Code + Number). No '+' or spaces.";
    }

    // Service Phone Validation
    if (!formData.servicePhone) {
      newErrors.servicePhone = 'Service phone is required';
    } else if (!phoneRegex.test(formData.servicePhone)) {
      newErrors.servicePhone = "Enter only numbers (Country Code + Number). No '+' or spaces.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({}); // Clear previous errors

    // ✅ Clean Phone Numbers (Remove + just in case, though regex blocks it)
    const cleanMainPhone = formData.mainPhone.replace(/\+/g, '').trim();
    const cleanServicePhone = formData.servicePhone.replace(/\+/g, '').trim();

    try {
      // 1. Sign Up Call
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin + '/login',
          data: {
            full_name: formData.fullName,
            business_name: formData.businessName,
            main_phone: cleanMainPhone,
            service_phone: cleanServicePhone, 
            business_details: `Industry: ${formData.industry}, Country: ${formData.country}`
          }
        }
      });

      // 2. Strict Error Checking
      if (error) throw error;

      // 3. Duplicate Email Check Check (Safety Net)
      // Agar user pehle se registered ho, to kabhi kabhi Supabase error nahi deta (security reason se).
      // Lekin agar user object null hai aur error bhi nahi hai, to issue hai.
      if (data?.user && data?.user?.identities?.length === 0) {
         throw new Error("This email is already registered. Please log in.");
      }

      setSuccess(true);
      
    } catch (error) {
      console.error('Signup Error:', error);
      setErrors({ submit: error.message || "An error occurred during signup" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#070A0A] text-[#F2F5F4] flex items-center justify-center px-6">
        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#38F28D]/20 text-[#38F28D] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Check your email</h2>
          <p className="text-[#A7B0AD] mb-6">
            We've sent a verification link to <span className="text-white font-medium">{formData.email}</span>. 
            Please verify your email to log in.
          </p>
          <a href="/login" className="text-[#38F28D] font-semibold hover:underline">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0A] text-[#F2F5F4] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[500px]">
        <div className="text-center mb-8">
           <a href="/" className="inline-block text-3xl font-bold"><span className="text-[#38F28D]">Agent</span><span className="text-[#F2F5F4]">aria</span></a>
        </div>

        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-[#A7B0AD] mb-8">Start your 3-day free trial</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none"
                placeholder="John Doe" />
              {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none" placeholder="name@company.com" />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-semibold mb-2">Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange}
                    className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none" placeholder="Min 8 chars" />
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
               </div>
               <div>
                  <label className="block text-sm font-semibold mb-2">Confirm</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none" placeholder="Repeat" />
                  {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
               </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Business Name</label>
              <input type="text" name="businessName" value={formData.businessName} onChange={handleChange}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none" placeholder="Your LLC" />
              {errors.businessName && <p className="text-red-400 text-sm mt-1">{errors.businessName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Country</label>
                  <select name="country" value={formData.country} onChange={handleChange}
                    className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none">
                    <option value="">Select</option>
                    {countries.map(c => <option key={c.name} value={c.code}>{c.name} ({c.code})</option>)}
                  </select>
                  {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Industry</label>
                  <select name="industry" value={formData.industry} onChange={handleChange}
                    className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none">
                    <option value="">Select</option>
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Main Phone Number <span className="text-[#A7B0AD] text-xs font-normal">(Personal/Business Owner)</span>
              </label>
              <input type="tel" name="mainPhone" value={formData.mainPhone} onChange={handleChange}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none" 
                placeholder="14155552671" />
              {errors.mainPhone && <p className="text-red-400 text-sm mt-1">{errors.mainPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Service Phone Number <span className="text-[#A7B0AD] text-xs font-normal">(For Agentaria Activation)</span>
              </label>
              <input type="tel" name="servicePhone" value={formData.servicePhone} onChange={handleChange}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px] px-4 py-3 focus:border-[#38F28D] focus:outline-none" 
                placeholder="14155552671" />
              {errors.servicePhone && <p className="text-red-400 text-sm mt-1">{errors.servicePhone}</p>}
            </div>

             {errors.submit && <div className="bg-red-500/10 text-red-400 p-3 rounded-[12px] text-sm">{errors.submit}</div>}

            <button type="submit" disabled={loading}
              className="w-full bg-[#38F28D] text-[#070A0A] py-3.5 rounded-[12px] font-bold hover:scale-[1.02] transition-all">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-[#1A2321]">
            <p className="text-[#A7B0AD]">Already have an account? <a href="/login" className="text-[#38F28D] font-semibold">Log in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;