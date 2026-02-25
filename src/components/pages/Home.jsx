import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Marquee from 'react-fast-marquee';
import {
  MessageSquare, Users, Star, Zap, Shield, BarChart3,
  ChevronRight, Upload, Bell, ThumbsUp, Bot, RefreshCw, CheckCircle
} from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';

// ─── Animation Helpers ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }
  }),
};

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Connect Your WhatsApp',
    desc: 'Scan a QR code in your dashboard. Your WhatsApp number is live in under 60 seconds. No app install, no extra device.',
    icon: MessageSquare,
    video: true,
    preview: 'whatsapp-connect',
  },
  {
    step: '02',
    title: 'Configure Your AI Agent',
    desc: 'Tell the AI about your business in plain language. Opening lines, services offered, tone — all customised to your brand.',
    icon: Bot,
    video: true,
    preview: 'agent-config',
  },
  {
    step: '03',
    title: 'AI Handles Incoming Chats',
    desc: 'Every new WhatsApp message is answered instantly. The agent qualifies leads and guides them to a decision — then passes the conversation to you.',
    icon: Zap,
    video: true,
    preview: 'ai-chat',
  },
  {
    step: '04',
    title: 'Re-Engage Silent Clients',
    desc: 'Upload a simple 3-column CSV. Agentaria sends safe, personalised re-opener messages and alerts you the moment someone replies.',
    icon: RefreshCw,
    video: true,
    preview: 'reopener',
  },
  {
    step: '05',
    title: 'Collect Reviews Automatically',
    desc: 'After every interaction, the AI asks for feedback first. Positive responses trigger a review link. Negative ones come straight to you.',
    icon: ThumbsUp,
    video: true,
    preview: 'reviews',
  },
  {
    step: '06',
    title: 'You Stay in Control',
    desc: 'Real-time handover alerts. One click to take over any conversation. Full history, no missed leads, no surprises.',
    icon: Shield,
    video: true,
    preview: 'handover',
  },
];

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'AI Chat Assistant',
    desc: 'Handles incoming WhatsApp messages 24/7, qualifies leads, and hands over at the right moment.',
  },
  {
    icon: RefreshCw,
    title: 'Client Re-Opener',
    desc: 'Upload a CSV of old clients and watch Agentaria bring them back — safely and automatically.',
  },
  {
    icon: Star,
    title: 'Feedback & Reviews',
    desc: 'Smart two-step system: collect honest feedback first, then route positive clients to your review platform.',
  },
  {
    icon: Bell,
    title: 'Real-Time Handovers',
    desc: 'Get instant alerts when a conversation needs your attention. Jump in with one click.',
  },
  {
    icon: BarChart3,
    title: 'Campaign Analytics',
    desc: 'Track sent, delivered, replied, and failed messages across every re-opener campaign.',
  },
  {
    icon: Shield,
    title: 'Human-First Safety',
    desc: "AI never finalises deals or payments. You decide — the AI just makes sure you're never starting from zero.",
  },
];

const REVIEWS = [
  { name: 'Ahsan Tariq', role: 'Salon Owner', text: 'Got 4 Google reviews in the first week. Never happened before without asking manually.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=11' },
  { name: 'Sara Mehmood', role: 'Physio Clinic', text: 'Old clients I thought were gone are booking again. The re-opener is insane.', rating: 4, avatar: 'https://i.pravatar.cc/150?img=5' },
  { name: 'Bilal Raza', role: 'Home Services', text: "Dashboard is clean and I get notified before the client even knows I'm there.", rating: 5, avatar: 'https://i.pravatar.cc/150?img=15' },
  { name: 'Nadia Hussain', role: 'Aesthetic Studio', text: 'Setup took 10 minutes. The AI talks exactly like I would — clients can not tell.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=9' },
  { name: 'Usman Sheikh', role: 'Photography Studio', text: "Booked 3 shoots from re-opener in the first campaign. ROI was immediate.", rating: 4, avatar: 'https://i.pravatar.cc/150?img=33' },
  { name: 'Fatima Malik', role: 'Skin Care Clinic', text: 'Review collection alone paid for the subscription 5x over.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=1' },
];

const STATS = [
  { value: '3 min', label: 'Average setup time' },
  { value: '40%',   label: 'More replies vs cold messages' },
  { value: '5×',    label: 'Review collection rate' },
  { value: '24/7',  label: 'AI always online' },
];

// ─── WhatsApp Mock UI ─────────────────────────────────────────────────────────
function WhatsAppMock() {
  const messages = [
    { side: 'left',  text: 'Hi, do you have slots available this week?',      time: '10:31' },
    { side: 'right', text: 'Hey! Yes we do 😊 Looking for morning or evening?', time: '10:31', ai: true },
    { side: 'left',  text: 'Evening preferably, around 6 or 7 PM.',           time: '10:32' },
    { side: 'right', text: 'Perfect. We have Thursday 7 PM open. Want me to confirm your spot?', time: '10:32', ai: true },
    { side: 'left',  text: 'Yes please! 🙌',                                  time: '10:32' },
    { side: 'right', text: "Great! I'll pass you to the team to finalize. One moment.", time: '10:33', ai: true, handover: true },
  ];

  return (
    <div className="relative w-full max-w-[320px] mx-auto">
      {/* Phone frame */}
      <div className="bg-[#111C1A] rounded-[32px] border border-[#1A2321] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Status bar */}
        <div className="bg-[#0D1F1C] px-5 pt-4 pb-2 flex items-center justify-between">
          <span className="text-[10px] text-[#A7B0AD]">9:41</span>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-[#38F28D]" />
            <div className="w-1 h-1 rounded-full bg-[#38F28D]" />
            <div className="w-1 h-1 rounded-full bg-[#38F28D]" />
          </div>
        </div>

        {/* Chat header */}
        <div className="bg-[#0D1F1C] px-4 py-3 flex items-center gap-3 border-b border-[#1A2321]">
          <div className="w-9 h-9 rounded-full bg-[#0E3B2E] flex items-center justify-center flex-shrink-0">
            <span className="text-[#38F28D] text-xs font-bold">SK</span>
          </div>
          <div>
            <p className="text-[#F2F5F4] text-xs font-semibold">SkinGlow Studio</p>
            <p className="text-[#38F28D] text-[10px]">● AI Agent Active</p>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-[#070A0A] px-3 py-4 space-y-2 min-h-[260px]">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.18, duration: 0.4 }}
              className={`flex ${m.side === 'right' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${m.side === 'right'
                ? m.handover
                  ? 'bg-[#0E3B2E] border border-[#38F28D]/30'
                  : 'bg-[#0E3B2E]'
                : 'bg-[#1A2321]'
              } rounded-[12px] px-3 py-2`}>
                {m.ai && (
                  <span className="text-[#38F28D] text-[9px] font-semibold block mb-0.5">🤖 AI Agent</span>
                )}
                <p className="text-[#F2F5F4] text-[11px] leading-relaxed">{m.text}</p>
                <p className="text-[#A7B0AD] text-[9px] mt-1 text-right">{m.time}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input bar */}
        <div className="bg-[#0D1211] px-3 py-3 flex items-center gap-2 border-t border-[#1A2321]">
          <div className="flex-1 bg-[#1A2321] rounded-full px-3 py-1.5">
            <span className="text-[#A7B0AD] text-[11px]">Type a message…</span>
          </div>
          <div className="w-8 h-8 bg-[#38F28D] rounded-full flex items-center justify-center">
            <ChevronRight size={14} className="text-[#070A0A]" />
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="absolute -right-6 top-16 bg-[#0D1211] border border-[#1A2321] rounded-[12px] px-3 py-2 shadow-xl"
      >
        <p className="text-[#38F28D] text-xs font-semibold">⚡ Handover Alert</p>
        <p className="text-[#A7B0AD] text-[10px]">New lead ready for you</p>
      </motion.div>
    </div>
  );
}

// ─── Actual Video Player (UPDATED) ──────────────────────────────────────────────
function VideoPlaceholder({ step }) {
  const videoNumber = parseInt(step, 10);
  const videoSrc = `/videos/step${videoNumber}.mp4`;
  
  // Smart logic: Video sirf tab play hogi jab wo screen par aayegi
  const videoRef = useRef(null);
  const isInView = useInView(videoRef, { margin: "-100px" });

  React.useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView]);

  return (
    <div className="relative w-full aspect-video rounded-[18px] overflow-hidden
                    bg-[#070A0A] border border-[#1A2321]
                    group hover:border-[#38F28D]/50 transition-all duration-500 shadow-2xl flex items-center justify-center">
      
      {/* Auto-playing Video Element */}
      <video 
        ref={videoRef}
        loop 
        muted 
        playsInline
        // ✅ FIX: object-cover ki jagah object-contain lagaya hai taake edges na katein
        className="relative z-10 w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#070A0A] text-[#F2F5F4] min-h-screen overflow-x-hidden">
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-24 md:pt-28 pb-20 md:pb-28 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px]
                        bg-[#0E3B2E]/15 rounded-full blur-[140px] -z-10 pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px]
                        bg-[#38F28D]/4 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16 items-center">

          {/* Left copy */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D1211]
                         border border-[#1A2321] rounded-full text-sm text-[#38F28D]"
            >
              <span className="w-2 h-2 rounded-full bg-[#38F28D] animate-pulse" />
              AI-Powered WhatsApp Automation
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-[68px] font-bold leading-[1.05] tracking-tight"
            >
              Turn Your<br />
              <span className="text-[#38F28D]">WhatsApp</span><br />
              Into a Business<br />
              Engine
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-[#A7B0AD] leading-relaxed max-w-[440px]"
            >
              Automate conversations, re-engage old clients, and collect 5-star reviews — all while keeping human control where it matters.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <button
                onClick={() => navigate('/signup')}
                className="bg-[#38F28D] text-[#070A0A] px-8 py-4 rounded-[14px] font-semibold text-base
                           hover:scale-[1.03] hover:shadow-[0_0_32px_rgba(56,242,141,0.45)]
                           transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start 3-Day Free Trial <ChevronRight size={16} />
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="border-2 border-[#1A2321] text-[#F2F5F4] px-8 py-4 rounded-[14px] font-semibold text-base
                           hover:border-[#38F28D]/40 hover:shadow-[0_0_20px_rgba(56,242,141,0.15)]
                           transition-all duration-300"
              >
                See Pricing
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-5 pt-2"
            >
              {['No credit card needed', '3-day free trial', 'Cancel anytime'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-sm text-[#A7B0AD]">
                  <CheckCircle size={14} className="text-[#38F28D]" /> {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — WhatsApp Mock */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center"
          >
            <WhatsAppMock />
          </motion.div>
        </div>
      </section>

      {/* ══ STATS BAR ══════════════════════════════════════════════════════════ */}
      <section className="px-6 pb-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] px-6 py-5 text-center
                                hover:border-[#38F28D]/20 hover:-translate-y-1 transition-all duration-300">
                  <p className="text-3xl font-bold text-[#38F28D] mb-1">{s.value}</p>
                  <p className="text-sm text-[#A7B0AD]">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section id="features" className="px-6 py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-[#38F28D] text-sm font-semibold mb-3 tracking-widest uppercase">Core Features</p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Everything you need.<br />Nothing you don't.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.07}>
                <div className="bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-7
                                hover:border-[#38F28D]/25 hover:-translate-y-1.5
                                hover:shadow-[0_8px_40px_rgba(56,242,141,0.07)]
                                transition-all duration-300 group h-full">
                  <div className="w-12 h-12 bg-[#0E3B2E]/60 rounded-[14px] flex items-center justify-center mb-5
                                  group-hover:bg-[#0E3B2E] transition-colors duration-300">
                    <f.icon size={22} className="text-[#38F28D]" />
                  </div>
                  <h3 className="text-[#F2F5F4] font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-[#A7B0AD] text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS — ZIG-ZAG TIMELINE ══════════════════════════════════ */}
      <section id="how-it-works" className="px-6 py-20 md:py-28 relative">
        {/* Section ambient */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px]
                        bg-[#0E3B2E]/8 rounded-full blur-[140px] -z-10 pointer-events-none" />

        <div className="max-w-[1200px] mx-auto">
          <Reveal className="text-center mb-16 md:mb-20">
            <p className="text-[#38F28D] text-sm font-semibold mb-3 tracking-widest uppercase">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Six steps. Zero complexity.
            </h2>
            <p className="text-[#A7B0AD] mt-4 max-w-[480px] mx-auto">
              From WhatsApp connection to fully automated business conversations in under 10 minutes.
            </p>
          </Reveal>

          <div className="space-y-20 md:space-y-28">
            {HOW_IT_WORKS.map((step, i) => {
              const isEven = i % 2 === 0;
              return (
                <div
                  key={step.step}
                  className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center
                              ${isEven ? '' : 'md:[&>*:first-child]:order-2'}`}
                >
                  {/* Text side */}
                  <Reveal delay={0.05} className="space-y-5">
                    <div className="flex items-center gap-3">
                      <span className="text-5xl font-bold text-[#1A2321] leading-none">{step.step}</span>
                      <div className="w-px h-8 bg-[#38F28D]/30" />
                      <div className="w-9 h-9 bg-[#0E3B2E]/60 rounded-[10px] flex items-center justify-center">
                        <step.icon size={18} className="text-[#38F28D]" />
                      </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-[#F2F5F4]">{step.title}</h3>
                    <p className="text-[#A7B0AD] text-base leading-relaxed">{step.desc}</p>
                  </Reveal>

                  {/* Video side */}
                  <Reveal delay={0.12}>
                    <VideoPlaceholder step={step.step} icon={step.icon} />
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ REVIEWS MARQUEE ═══════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 overflow-hidden">
        <Reveal className="text-center mb-12 px-6">
          <p className="text-[#38F28D] text-sm font-semibold mb-3 tracking-widest uppercase">What Subscribers Say</p>
          <h2 className="text-4xl md:text-5xl font-bold">Results speak first.</h2>
        </Reveal>

        <Marquee gradient={false} speed={45} pauseOnHover className="gap-0 pb-4">
          {[...REVIEWS, ...REVIEWS].map((r, i) => (
            <div
              key={i}
              className="mx-3 w-[320px] bg-[#0D1211] border border-[#1A2321] rounded-[18px] p-6
                         hover:border-[#38F28D]/25 transition-all duration-300 flex-shrink-0 flex flex-col justify-between min-h-[200px]"
            >
              <div>
                {/* Yellow Stars with mixed ratings */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, si) => (
                    <Star 
                      key={si} 
                      size={14} 
                      // Agar rating 4 hai to 4 stars yellow, 1 star transparent hoga
                      className={si < r.rating ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-[#1A2321]"} 
                    />
                  ))}
                </div>
                <p className="text-[#F2F5F4] text-sm leading-relaxed mb-6">"{r.text}"</p>
              </div>

              {/* Profile Picture & Name */}
              <div className="flex items-center gap-3">
                <img 
                  src={r.avatar} 
                  alt={r.name} 
                  className="w-10 h-10 rounded-full object-cover border border-[#1A2321] opacity-90"
                />
                <div>
                  <p className="text-[#F2F5F4] text-sm font-semibold">{r.name}</p>
                  <p className="text-[#A7B0AD] text-xs">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </Marquee>
      </section>

      {/* ══ CTA STRIP ═════════════════════════════════════════════════════════ */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto">
          <Reveal>
            <div className="relative bg-[#0D1211] border border-[#1A2321] rounded-[24px] px-8 md:px-16 py-14 text-center overflow-hidden">
              {/* Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px]
                              bg-[#38F28D]/8 blur-[80px] pointer-events-none" />
              <p className="text-[#38F28D] text-sm font-semibold mb-3 tracking-widest uppercase relative">
                Get Started Today
              </p>
              <h2 className="text-4xl md:text-5xl font-bold mb-5 relative">
                Your WhatsApp is ready.<br />Is your business?
              </h2>
              <p className="text-[#A7B0AD] mb-8 max-w-[440px] mx-auto relative">
                3-day free trial. No card needed. Cancel anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-[#38F28D] text-[#070A0A] px-10 py-4 rounded-[14px] font-semibold text-base
                             hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(56,242,141,0.5)]
                             transition-all duration-300 inline-flex items-center gap-2 justify-center"
                >
                  Start Free Trial <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="border-2 border-[#1A2321] text-[#F2F5F4] px-10 py-4 rounded-[14px] font-semibold
                             hover:border-[#38F28D]/40 transition-all duration-300"
                >
                  View Pricing
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
