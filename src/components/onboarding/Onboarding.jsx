import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { supabase } from '../../config/supabase';
import {
  Clock, Link, ChevronRight, Check,
  Briefcase, Target, RefreshCw, Paperclip, Star
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const N8N_WEBHOOK = 'https://n8n.srv1192286.hstgr.cloud/webhook/onboarding';
const TOTAL_STEPS = 7;

const INDUSTRIES = [
  'Clinic / Healthcare',
  'Real Estate',
  'Marketing Agency',
  'Salon / Beauty',
  'Fitness / Gym',
  'Home Services',
  'Education',
  'Restaurant / Food',
  'Legal Services',
  'Other',
];

const REVIEW_PLATFORMS = [
  'Google Reviews',
  'Trustpilot',
  'Yelp',
  'Facebook',
  'Tripadvisor',
  'Other'
];

// ─── Base64 helper ────────────────────────────────────────────────────────────
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AgentariaAvatar = ({ pulse = false }) => (
  <div className="relative flex-shrink-0">
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0E3B2E] to-[#38F28D]/30
                    border border-[#38F28D]/40 flex items-center justify-center
                    shadow-[0_0_12px_rgba(56,242,141,0.2)]">
      <span className="text-[#38F28D] text-xs font-bold select-none">A</span>
    </div>
    {pulse && (
      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#38F28D]
                       border-2 border-[#070A0A] shadow-[0_0_8px_rgba(56,242,141,0.6)]" />
    )}
  </div>
);

// ─── Typing bubble ────────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 4 }}
    className="flex items-end gap-3"
  >
    <AgentariaAvatar pulse />
    <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] rounded-bl-[4px] px-5 py-3.5">
      <div className="flex gap-1.5 items-center h-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#38F28D]"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.18 }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// ─── Agentaria message bubble ─────────────────────────────────────────────────
const AgentMessage = ({ text }) => (
  <motion.div
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    className="flex items-end gap-3 max-w-[80%]"
  >
    <AgentariaAvatar />
    <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] rounded-bl-[4px] px-5 py-3.5">
      <p className="text-[#F2F5F4] text-sm leading-relaxed">{text}</p>
    </div>
  </motion.div>
);

// ─── User reply bubble ────────────────────────────────────────────────────────
const UserReply = ({ text }) => (
  <motion.div
    initial={{ opacity: 0, x: 16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="flex justify-end"
  >
    <div className="bg-[#0E3B2E] border border-[#38F28D]/25 rounded-[18px] rounded-br-[4px]
                    px-5 py-3 max-w-[72%]">
      <p className="text-[#F2F5F4] text-sm">{text}</p>
    </div>
  </motion.div>
);

// ─── Progress bar ─────────────────────────────────────────────────────────────
const Progress = ({ step, total }) => {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1A2321]">
      <div className="flex-1 h-1.5 bg-[#1A2321] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#38F28D] rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[#38F28D] text-xs font-semibold tabular-nums w-10 text-right">
        {step}/{total}
      </span>
    </div>
  );
};

// ─── Main Onboarding Component ────────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();

  // ── Session & prefetched data ───────────────────────────────────────────────
  const [user, setUser]                       = useState(null);
  const [userName, setUserName]               = useState('');           // first name
  const [fetchedBusinessName, setFetchedBusinessName] = useState('');  // from DB
  const [userPhone, setUserPhone]             = useState('');           // service_number

  // ── Chat engine state ───────────────────────────────────────────────────────
  const [step, setStep]           = useState(0);
  const [typing, setTyping]       = useState(false);
  const [messages, setMessages]   = useState([]);
  const [inputReady, setInputReady] = useState(false);

  // ── Form data ───────────────────────────────────────────────────────────────
  const [goal, setGoal]                       = useState('');

  // Step 2 — Business Name confirm/edit
  const [useCurrentBiz, setUseCurrentBiz]     = useState(null);  // null | true | false
  const [customBizName, setCustomBizName]     = useState('');

  // Step 3 — Industry
  const [industry, setIndustry]               = useState('');
  const [customIndustry, setCustomIndustry]   = useState('');

  // Step 4 — Phone confirm/edit
  const [useCurrentPhone, setUseCurrentPhone] = useState(null);  // null | true | false
  const [customPhone, setCustomPhone]         = useState('');

  // Step 5 — Hours
  const [openTime, setOpenTime]               = useState('09:00');
  const [closeTime, setCloseTime]             = useState('18:00');

  // Step 6 — PDF
  const [pdfFile, setPdfFile]                 = useState(null);

  // Step 7 — Review link & Platform
  const [reviewPlatform, setReviewPlatform]           = useState('');
  const [customReviewPlatform, setCustomReviewPlatform] = useState('');
  const [reviewLink, setReviewLink]                   = useState('');

  // ── Completion ──────────────────────────────────────────────────────────────
  const [confetti, setConfetti]     = useState(false);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [done, setDone]             = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Refs ────────────────────────────────────────────────────────────────────
  const chatRef = useRef(null);
  const fileRef = useRef(null);
  const initRef = useRef(false); // prevents Strict Mode double-fire

  // ── Window resize for confetti ──────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Auto-scroll to latest message ──────────────────────────────────────────
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing, inputReady]);

  // ── Fetch user data & start chat ────────────────────────────────────────────
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      setUser(user);

      // Fetch subscriber_name, business_name, service_number together
      const { data } = await supabase
        .from('subscribers details')
        .select('subscriber_name, business_name, service_number')
        .eq('subscriber_id', user.id)
        .single();

      // Extract first name only
      const fullName = data?.subscriber_name || '';
      const firstName = fullName.trim().split(' ')[0] || '';
      setUserName(firstName);

      setFetchedBusinessName(data?.business_name || '');
      setUserPhone(data?.service_number || user.email || 'your number');

      setTimeout(() => startStep(1, { firstName: firstName }), 600);
    };
    init();
  }, []);

  // ── Chat engine: typing indicator → message ─────────────────────────────────
  const pushAgentMessage = (text, delay = 1200) =>
    new Promise((resolve) => {
      setTyping(true);
      setInputReady(false);
      setTimeout(() => {
        setTyping(false);
        setMessages((prev) => [...prev, { type: 'agent', text }]);
        setTimeout(resolve, 280);
      }, delay);
    });

  const pushUserReply = (text) =>
    setMessages((prev) => [...prev, { type: 'user', text }]);

  // ── Step script ─────────────────────────────────────────────────────────────
  // NOTE: startStep uses closure values of userName / fetchedBusinessName /
  // confirmedBizName. Because these are set before startStep(1) is called
  // (they're fetched in the same init async), we pass them as args where needed.
  const startStep = async (s, opts = {}) => {
    setStep(s);

    switch (s) {

      // ── 1: Goal ─────────────────────────────────────────────────────────────
      case 1:
        await pushAgentMessage(
          `Hi ${opts.firstName || userName}! I'm Agentaria — your new digital employee. 👋`,
          800
        );
        await pushAgentMessage(
          "I'm excited to start working for you and handling your clients. First — what is your main goal with me?",
          1400
        );
        break;

      // ── 2: Business Name confirm ─────────────────────────────────────────────
      case 2:
        await pushAgentMessage("Great choice! I can absolutely help with that. 💪", 900);
        await pushAgentMessage(
          `I have your business registered as "${opts.bizName || fetchedBusinessName}". Should I use this name?`,
          1400
        );
        break;

      // ── 3: Industry ──────────────────────────────────────────────────────────
      case 3:
        await pushAgentMessage(
          `Got it! And what industry does ${opts.confirmedBiz || customBizName || fetchedBusinessName} belong to?`,
          1300
        );
        break;

      // ── 4: Phone confirm ─────────────────────────────────────────────────────
      case 4:
        await pushAgentMessage(
          `Perfect! One quick question — is ${userPhone} the WhatsApp number you'd like me to manage?`,
          1400
        );
        break;

      // ── 5: Hours ─────────────────────────────────────────────────────────────
      case 5:
        await pushAgentMessage("Understood. Now, what are your standard business hours?", 1000);
        await pushAgentMessage(
          "I need to know when your human team is available so I can handle things smoothly outside those hours too.",
          1400
        );
        break;

      // ── 6: PDF upload ─────────────────────────────────────────────────────────
      case 6:
        await pushAgentMessage(
          "Almost there! 🎯 To represent your business perfectly, I need to know your rules — things like services, prices, what to say and what not to say.",
          1400
        );
        await pushAgentMessage(
          "Upload a PDF with your instructions, or skip and add it from Settings later.",
          1200
        );
        break;

      // ── 7: Review link ────────────────────────────────────────────────────────
      case 7:
        await pushAgentMessage(
          "Last step! 🌟 Paste your Google or Trustpilot review link and I'll start collecting 5-star reviews for you automatically.",
          1400
        );
        await pushAgentMessage(
          "You can skip this and set it up from the Reviews page anytime.",
          1000
        );
        break;

      default:
        break;
    }
    setInputReady(true);
  };

  // ── Step handlers ───────────────────────────────────────────────────────────

  // Step 1
  const handleGoal = (selected) => {
    setGoal(selected);
    pushUserReply(selected);
    setTimeout(() => startStep(2, { bizName: fetchedBusinessName }), 400);
  };

  // Step 2 — Business Name
  const handleBizChoice = (yes) => {
    setUseCurrentBiz(yes);
    if (yes) {
      pushUserReply(`Yes, use "${fetchedBusinessName}"`);
      setTimeout(() => startStep(3, { confirmedBiz: fetchedBusinessName }), 400);
    }
    // 'No' → reveal text input (no step advance yet)
  };

  const handleCustomBiz = () => {
    if (!customBizName.trim()) return;
    pushUserReply(`Use "${customBizName.trim()}"`);
    setTimeout(() => startStep(3, { confirmedBiz: customBizName.trim() }), 400);
  };

  // Step 3 — Industry
  const handleIndustry = () => {
    const finalIndustry = industry === 'Other' ? customIndustry.trim() : industry;
    if (!finalIndustry) return;
    pushUserReply(finalIndustry);
    setTimeout(() => startStep(4), 400);
  };

  // Step 4 — Phone
  const handlePhoneChoice = (yes) => {
    setUseCurrentPhone(yes);
    if (yes) {
      pushUserReply(`Yes, use ${userPhone}`);
      setTimeout(() => startStep(5), 400);
    }
    // 'No' → reveal custom input
  };

  const handleCustomPhone = () => {
    if (!customPhone.trim()) return;
    pushUserReply(`Use ${customPhone}`);
    setTimeout(() => startStep(5), 400);
  };

  // Step 5 — Hours
  const handleHours = () => {
    pushUserReply(`${openTime} – ${closeTime}`);
    setTimeout(() => startStep(6), 400);
  };

  // Step 6 — PDF
  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      pushUserReply(`📎 ${file.name}`);
      setTimeout(() => startStep(7), 400);
    }
  };

  const handleSkipPdf = () => {
    setPdfFile(null);
    pushUserReply("I'll add instructions later.");
    setTimeout(() => startStep(7), 400);
  };

  // Step 7 — Finish
  const handleFinish = async (skip = false) => {
    if (submitting) return;
    setSubmitting(true);

    const finalLink = skip ? '' : reviewLink.trim();
    // Naya logic platform ke liye
    const finalPlatform = skip ? '' : (reviewPlatform === 'Other' ? customReviewPlatform.trim() : reviewPlatform);
    
    pushUserReply(skip ? "I'll set up reviews later." : (finalLink || 'Skipped review link'));

    setInputReady(false);
    await pushAgentMessage("You're all set! 🎉 Setting up your workspace now…", 1000);

    setConfetti(true);
    setDone(true);

    try {
      // Convert PDF to base64 if uploaded
      let pdfBase64 = null;
      if (pdfFile) {
        try { pdfBase64 = await fileToBase64(pdfFile); } catch (_) {}
      }

      const confirmedBizName = useCurrentBiz === false
        ? customBizName.trim()
        : fetchedBusinessName;
      const finalIndustry = industry === 'Other' ? customIndustry.trim() : industry;
      const finalPhone    = useCurrentPhone === false ? customPhone.trim() : userPhone;

      // POST to n8n webhook (Single & Correct Placement)
      await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriber_id:     user.id,
          goal,
          business_name:     confirmedBizName,
          industry:          finalIndustry,
          use_current_phone: useCurrentPhone,
          phone_number:      finalPhone,
          open_time:         openTime,
          close_time:        closeTime,
          pdf_base64:        pdfBase64,
          pdf_name:          pdfFile ? pdfFile.name : null,
          review_platform:   finalPlatform,
          review_link:       finalLink,
        }),
      });

      // Update is_onboarded in Supabase
      await supabase
        .from('subscribers details')
        .update({ is_onboarded: 'true' })
        .eq('subscriber_id', user.id);

    } catch (err) {
      console.error('Onboarding error:', err);
    }

    setTimeout(() => {
      setConfetti(false);
      navigate('/dashboard');
    }, 3500);
  };

  // ── Input renderer ──────────────────────────────────────────────────────────
  const renderInput = () => {
    if (!inputReady) return null;

    switch (step) {

      // ── Step 1: Goal ──────────────────────────────────────────────────────────
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-3 justify-end"
          >
            {[
              { label: 'Automate Support',  icon: Briefcase },
              { label: 'Generate Leads',    icon: Target    },
              { label: 'Re-engage Clients', icon: RefreshCw },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => handleGoal(label)}
                className="flex items-center gap-2 px-5 py-3 bg-[#0D1211] border border-[#1A2321]
                           rounded-[14px] text-sm font-medium text-[#F2F5F4]
                           hover:border-[#38F28D]/50 hover:bg-[#0E3B2E]/40
                           hover:shadow-[0_0_16px_rgba(56,242,141,0.12)]
                           transition-all duration-200"
              >
                <Icon size={15} className="text-[#38F28D]" />
                {label}
              </button>
            ))}
          </motion.div>
        );

      // ── Step 2: Business Name confirm/edit ────────────────────────────────────
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-3"
          >
            {/* Confirm buttons — hide once 'No' is clicked */}
            {useCurrentBiz !== false && (
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => handleBizChoice(false)}
                  className="px-5 py-3 border border-[#1A2321] rounded-[13px] text-sm text-[#A7B0AD]
                             hover:border-[#38F28D]/30 hover:text-[#F2F5F4] transition-all duration-200"
                >
                  No, I'll change it
                </button>
                <button
                  onClick={() => handleBizChoice(true)}
                  className="px-5 py-3 bg-[#38F28D] text-[#070A0A] font-semibold text-sm rounded-[13px]
                             hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(56,242,141,0.4)]
                             transition-all duration-200 flex items-center gap-2"
                >
                  <Check size={15} /> Yes, use this
                </button>
              </div>
            )}

            {/* Custom biz name input — shown only after clicking 'No' */}
            <AnimatePresence>
              {useCurrentBiz === false && (
                <motion.div
                  key="custom-biz"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex gap-3"
                >
                  <input
                    type="text"
                    placeholder="Enter your business name…"
                    value={customBizName}
                    onChange={(e) => setCustomBizName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomBiz()}
                    autoFocus
                    className="flex-1 bg-[#0D1211] border border-[#38F28D]/30 rounded-[13px]
                               px-4 py-3 text-sm text-[#F2F5F4] placeholder-[#A7B0AD]/60
                               focus:outline-none focus:border-[#38F28D]/50 focus:ring-1 focus:ring-[#38F28D]/20
                               transition-all"
                  />
                  <button
                    onClick={handleCustomBiz}
                    disabled={!customBizName.trim()}
                    className="px-5 py-3 bg-[#38F28D] text-[#070A0A] font-semibold text-sm rounded-[13px]
                               disabled:opacity-40 disabled:cursor-not-allowed
                               hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(56,242,141,0.4)]
                               transition-all duration-200 flex items-center gap-1.5"
                  >
                    Next <ChevronRight size={15} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      // ── Step 3: Industry ──────────────────────────────────────────────────────
      case 3: {
        const isNextDisabled = !industry || (industry === 'Other' && !customIndustry.trim());
        return (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-3"
          >
            <div className="flex gap-3">
              <select
                value={industry}
                onChange={(e) => { setIndustry(e.target.value); setCustomIndustry(''); }}
                className="flex-1 bg-[#0D1211] border border-[#1A2321] rounded-[13px]
                           px-4 py-3 text-sm text-[#F2F5F4]
                           focus:outline-none focus:border-[#38F28D]/50 focus:ring-1 focus:ring-[#38F28D]/20
                           transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Select industry…</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              <button
                onClick={handleIndustry}
                disabled={isNextDisabled}
                className="px-5 py-3 bg-[#38F28D] text-[#070A0A] font-semibold text-sm rounded-[13px]
                           disabled:opacity-40 disabled:cursor-not-allowed
                           hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(56,242,141,0.4)]
                           transition-all duration-200 flex items-center gap-1.5"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>

            {/* Custom industry — only when 'Other' selected */}
            <AnimatePresence>
              {industry === 'Other' && (
                <motion.input
                  key="custom-industry"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  type="text"
                  placeholder="Please describe your industry…"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleIndustry()}
                  autoFocus
                  className="w-full bg-[#0D1211] border border-[#38F28D]/30 rounded-[13px]
                             px-4 py-3 text-sm text-[#F2F5F4] placeholder-[#A7B0AD]/60
                             focus:outline-none focus:border-[#38F28D]/50 focus:ring-1 focus:ring-[#38F28D]/20
                             transition-all"
                />
              )}
            </AnimatePresence>
          </motion.div>
        );
      }

      // ── Step 4: Phone confirm/edit ────────────────────────────────────────────
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-3"
          >
            {/* Confirm buttons */}
            {useCurrentPhone !== false && (
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => handlePhoneChoice(false)}
                  className="px-5 py-3 border border-[#1A2321] rounded-[13px] text-sm text-[#A7B0AD]
                             hover:border-[#38F28D]/30 hover:text-[#F2F5F4] transition-all duration-200"
                >
                  No, use another
                </button>
                <button
                  onClick={() => handlePhoneChoice(true)}
                  className="px-5 py-3 bg-[#38F28D] text-[#070A0A] font-semibold text-sm rounded-[13px]
                             hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(56,242,141,0.4)]
                             transition-all duration-200 flex items-center gap-2"
                >
                  <Check size={15} /> Yes, connect this
                </button>
              </div>
            )}

            {/* Custom phone input */}
            <AnimatePresence>
              {useCurrentPhone === false && (
                <motion.div
                  key="custom-phone"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-3"
                >
                  <p className="text-[#A7B0AD] text-xs text-right">
                    Enter your WhatsApp number with country code, no + sign
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="tel"
                      placeholder="e.g. 923001234567"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => e.key === 'Enter' && handleCustomPhone()}
                      maxLength={15}
                      autoFocus
                      className="flex-1 bg-[#0D1211] border border-[#38F28D]/30 rounded-[13px]
                                 px-4 py-3 text-sm text-[#F2F5F4] placeholder-[#A7B0AD]/60
                                 focus:outline-none focus:border-[#38F28D]/50 focus:ring-1 focus:ring-[#38F28D]/20
                                 transition-all tabular-nums tracking-wider"
                    />
                    <button
                      onClick={handleCustomPhone}
                      disabled={customPhone.trim().length < 7}
                      className="px-5 py-3 bg-[#38F28D] text-[#070A0A] font-semibold text-sm rounded-[13px]
                                 disabled:opacity-40 disabled:cursor-not-allowed
                                 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(56,242,141,0.4)]
                                 transition-all duration-200 flex items-center gap-1.5"
                    >
                      Next <ChevronRight size={15} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      // ── Step 5: Business hours ────────────────────────────────────────────────
      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-3"
          >
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <label className="text-[#A7B0AD] text-xs mb-1.5 block">Opening time</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#38F28D]" />
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full bg-[#0D1211] border border-[#1A2321] rounded-[13px]
                               pl-9 pr-4 py-3 text-sm text-[#F2F5F4]
                               focus:outline-none focus:border-[#38F28D]/50 focus:ring-1 focus:ring-[#38F28D]/20
                               transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="text-[#A7B0AD] text-lg mt-5">→</div>
              <div className="flex-1">
                <label className="text-[#A7B0AD] text-xs mb-1.5 block">Closing time</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#38F28D]" />
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full bg-[#0D1211] border border-[#1A2321] rounded-[13px]
                               pl-9 pr-4 py-3 text-sm text-[#F2F5F4]
                               focus:outline-none focus:border-[#38F28D]/50 focus:ring-1 focus:ring-[#38F28D]/20
                               transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleHours}
                className="px-6 py-3 bg-[#38F28D] text-[#070A0A] font-semibold text-sm rounded-[13px]
                           hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(56,242,141,0.4)]
                           transition-all duration-200 flex items-center gap-2"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </motion.div>
        );

      // ── Step 6: PDF upload ────────────────────────────────────────────────────
      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-end gap-3"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 bg-[#38F28D] text-[#070A0A]
                         font-semibold text-sm rounded-[13px]
                         hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(56,242,141,0.4)]
                         transition-all duration-200"
            >
              <Paperclip size={15} /> Upload PDF
            </button>
            <button
              onClick={handleSkipPdf}
              className="text-[#A7B0AD] text-xs hover:text-[#38F28D] transition-colors underline underline-offset-2"
            >
              I'll do this later
            </button>
          </motion.div>
        );

      // ── Step 7: Review Platform & Link ────────────────────────────────────────
      case 7: {
        const isFinishDisabled = submitting || (!reviewPlatform || (reviewPlatform === 'Other' && !customReviewPlatform.trim()) || !reviewLink.trim());
        
        return (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-3"
          >
            <div className="flex gap-3">
              <select
                value={reviewPlatform}
                onChange={(e) => { setReviewPlatform(e.target.value); setCustomReviewPlatform(''); }}
                className="flex-1 bg-[#0D1211] border border-[#1A2321] rounded-[13px]
                           px-4 py-3 text-sm text-[#F2F5F4]
                           focus:outline-none focus:border-[#38F28D]/50 focus:ring-1 focus:ring-[#38F28D]/20
                           transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Select Review Platform…</option>
                {REVIEW_PLATFORMS.map((plat) => (
                  <option key={plat} value={plat}>{plat}</option>
                ))}
              </select>
            </div>

            {/* Custom Platform — only when 'Other' selected */}
            <AnimatePresence>
              {reviewPlatform === 'Other' && (
                <motion.input
                  key="custom-platform"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  type="text"
                  placeholder="Enter platform name…"
                  value={customReviewPlatform}
                  onChange={(e) => setCustomReviewPlatform(e.target.value)}
                  className="w-full bg-[#0D1211] border border-[#38F28D]/30 rounded-[13px]
                             px-4 py-3 text-sm text-[#F2F5F4] placeholder-[#A7B0AD]/60
                             focus:outline-none focus:border-[#38F28D]/50 focus:ring-1 focus:ring-[#38F28D]/20
                             transition-all"
                />
              )}
            </AnimatePresence>

            <div className="relative">
              <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#38F28D]" />
              <input
                type="url"
                placeholder="https://g.page/r/your-review-link"
                value={reviewLink}
                onChange={(e) => setReviewLink(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isFinishDisabled && handleFinish(false)}
                className="w-full bg-[#0D1211] border border-[#1A2321] rounded-[13px]
                           pl-9 pr-4 py-3 text-sm text-[#F2F5F4] placeholder-[#A7B0AD]/60
                           focus:outline-none focus:border-[#38F28D]/50 focus:ring-1 focus:ring-[#38F28D]/20
                           transition-all"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => handleFinish(true)}
                className="text-[#A7B0AD] text-xs hover:text-[#38F28D] transition-colors underline underline-offset-2"
              >
                Skip for now
              </button>
              <button
                onClick={() => handleFinish(false)}
                disabled={isFinishDisabled}
                className="flex items-center gap-2 px-6 py-3 bg-[#38F28D] text-[#070A0A]
                           font-semibold text-sm rounded-[13px] disabled:opacity-40 disabled:cursor-not-allowed
                           hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(56,242,141,0.5)]
                           transition-all duration-200"
              >
                <Star size={14} /> Finish Setup
              </button>
            </div>
          </motion.div>
        );
      }

      default:
        return null;
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#070A0A] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[700px] h-[500px] bg-[#0E3B2E]/12 rounded-full blur-[140px] pointer-events-none" />

      {/* Confetti */}
      {confetti && (
        <Confetti
          width={windowSize.w}
          height={windowSize.h}
          recycle={false}
          numberOfPieces={280}
          colors={['#38F28D', '#0E3B2E', '#F2F5F4', '#38F28D', '#A7B0AD']}
          gravity={0.22}
        />
      )}

      {/* Chat window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[640px] bg-[#070A0A] border border-[#1A2321] rounded-[24px]
                   shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col"
        style={{ maxHeight: '82vh' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1A2321] bg-[#0D1211] flex-shrink-0">
          <AgentariaAvatar pulse={!done} />
          <div>
            <p className="text-[#F2F5F4] text-sm font-semibold">Agentaria</p>
            <p className="text-[#38F28D] text-xs">
              {done ? '✓ Setup complete' : 'Setting up your workspace…'}
            </p>
          </div>
          <div className="ml-auto relative text-xl font-bold tracking-tight select-none">
            <span className="text-[#F2F5F4]">Agentaria</span>
            <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-[#38F28D] to-transparent"></div>
          </div>
        </div>

        {/* Progress — total 7 */}
        {step > 0 && !done && (
          <div className="flex-shrink-0">
            <Progress step={step} total={TOTAL_STEPS} />
          </div>
        )}

        {/* Messages area */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) =>
              msg.type === 'agent'
                ? <AgentMessage key={i} text={msg.text} />
                : <UserReply    key={i} text={msg.text} />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {typing && <TypingIndicator key="typing" />}
          </AnimatePresence>

          {/* Done state */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-[#0E3B2E] border border-[#38F28D]/40
                                flex items-center justify-center
                                shadow-[0_0_32px_rgba(56,242,141,0.25)]">
                  <Check size={28} className="text-[#38F28D]" strokeWidth={2.5} />
                </div>
                <p className="text-[#F2F5F4] font-bold text-lg">You are all set!</p>
                <p className="text-[#A7B0AD] text-sm">Taking you to your dashboard…</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input area */}
        <AnimatePresence mode="wait">
          {inputReady && !done && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="px-5 py-4 border-t border-[#1A2321] bg-[#0D1211] flex-shrink-0"
            >
              {renderInput()}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
