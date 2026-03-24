import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Search, Play, PlayCircle, Clock, BookOpen, Zap, Link2, Star,
  ChevronRight, GraduationCap, BookMarked, ArrowRight, X
} from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';

// ─── Animation helper ─────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 26 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',           label: 'All',               icon: BookOpen },
  { id: 'getting-started', label: 'Getting Started', icon: GraduationCap },
  { id: 'chat-agent',    label: 'Chat Agent',         icon: Star },
  { id: 'advanced',      label: 'Advanced Bots',      icon: Zap },
  { id: 'integrations',  label: 'Integrations',       icon: Link2 },
];

const VIDEOS = [
  // ── Getting Started ──────────────────────────────────────────────────────
  {
    id: 1,
    title:    'Welcome to Agentaria: Platform Overview',
    desc:     'Understand your dashboard, live stats, and the overall workspace.',
    category: 'getting-started',
    duration: '2:05',
    level:    'Beginner',
    thumbnail: 'overview',
    youtubeId: 'tCyBdNKbuBE',
    new:      false,
  },
  {
    id: 2,
    title:    'The 2-Minute Setup',
    desc:     'Learn how to complete the chat onboarding and scan your WhatsApp QR code.',
    category: 'getting-started',
    duration: '2:29',
    level:    'Beginner',
    thumbnail: 'connect',
    youtubeId: 'kmOKf2d_HII',
    new:      false,
  },
  {
    id: 3,
    title:    "Uploading Your Agentaria's Brain",
    desc:     'How to properly format, upload, and update your business PDF in Settings.',
    category: 'getting-started',
    duration: '1:50',
    level:    'Beginner',
    thumbnail: 'instructions',
    youtubeId: 'V7_GaReZWik',
    new:      false,
  },

  // ── Chat Agent ───────────────────────────────────────────────────────────
  {
    id: 4,
    title:    'Mastering the Smart Inbox',
    desc:     'Navigate through the All, Open, Handover, Campaigns, and Reviews tabs.',
    category: 'chat-agent',
    duration: '1:57',
    level:    'Beginner',
    thumbnail: 'inbox',
    youtubeId: 'txcKolVioz0',
    new:      false,
  },
  {
    id: 5,
    title:    "Conversation Style & 'Human Handover'",
    desc:     'See how the Agentaria response and automatically stops at final bookings or payments and alerts you to close the deal.',
    category: 'chat-agent',
    duration: '4:47',
    level:    'Intermediate',
    thumbnail: 'handover',
    youtubeId: 'BjW1mUrFAYY',
    new:      false,
  },
  {
    id: 6,
    title:    'Taking Over Chats & Handing Back',
    desc:     "Learn how to use the 'Take Over' button to reply manually and 'Handback' to resume the AI.",
    category: 'chat-agent',
    duration: '3:05',
    level:    'Intermediate',
    thumbnail: 'ai-flow',
    youtubeId: 'aljPPAYFDVg',
    new:      true,
  },

  // ── Advanced Bots ────────────────────────────────────────────────────────
  {
    id: 7,
    title:    'Client Re-Opener Campaigns',
    desc:     'Understand the difference between Bulk AI-managed and Personalized Human-managed campaigns.',
    category: 'advanced',
    duration: '14:34',
    level:    'Advanced',
    thumbnail: 'csv',
    youtubeId: 'ymbtjSmRdgs',
    new:      false,
  },
  {
    id: 8,
    title:    "The 'Gated' Review System",
    desc:     'Discover how the AI asks for feedback first and only sends your review link to happy customers.',
    category: 'advanced',
    duration: '15:37',
    level:    'Advanced',
    thumbnail: 'reviews',
    youtubeId: 'CzuHlx0luU0',
    new:      true,
  },

  // ── Integrations & Settings ───────────────────────────────────────────────
  {
    id: 9,
    title:    'Managing Business Hours',
    desc:     'Set your staff timings so the AI knows exactly when to take full control of the chats.',
    category: 'integrations',
    duration: '3:19',
    level:    'Beginner',
    thumbnail: 'schedule',
    youtubeId: 'xxorFifSOsk',
    new:      false,
  },
  {
    id: 10,
    title:    'Profile & Security Settings',
    desc:     'Update your personal name, business name, service phone, and account password safely.',
    category: 'integrations',
    duration: '1:56',
    level:    'Beginner',
    thumbnail: 'tone',
    youtubeId: 'ytJuE6RlDW0',
    new:      false,
  },
];

// ─── Gradient palettes per thumbnail key ─────────────────────────────────────
const THUMB_STYLES = {
  overview:     'from-[#0E3B2E] to-[#070A0A]',
  connect:      'from-[#1A2E1E] to-[#0A1210]',
  instructions: 'from-[#0E2B3B] to-[#070A0A]',
  inbox:        'from-[#1B2E1A] to-[#070A0A]',
  'ai-flow':    'from-[#0E3B2E] to-[#0D1211]',
  handover:     'from-[#2E1A0E] to-[#070A0A]',
  tone:         'from-[#1A0E2E] to-[#070A0A]',
  csv:          'from-[#0E3B2E] to-[#0A1210]',
  schedule:     'from-[#2E2A0E] to-[#070A0A]',
  reviews:      'from-[#0E3B2E] to-[#0D1211]',
  google:       'from-[#1A2E12] to-[#070A0A]',
  n8n:          'from-[#0E1B3B] to-[#070A0A]',
};

const LEVEL_COLOR = {
  Beginner:     'text-[#38F28D] bg-[#0E3B2E]',
  Intermediate: 'text-[#F2C838] bg-[#2E280E]',
  Advanced:     'text-[#F2584E] bg-[#2E150E]',
};

// ─── Video Card ───────────────────────────────────────────────────────────────
function VideoCard({ video, index, onPlay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (index % 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onPlay(video)}
      className="flex flex-col bg-[#0D1211] border border-[#1A2321] rounded-[18px] overflow-hidden
                 hover:border-[#38F28D]/25 hover:-translate-y-1.5
                 hover:shadow-[0_12px_48px_rgba(56,242,141,0.08)]
                 transition-all duration-300 cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className={`relative aspect-video bg-gradient-to-br ${THUMB_STYLES[video.thumbnail] || 'from-[#0E3B2E] to-[#070A0A]'} overflow-hidden`}>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(56,242,141,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56,242,141,0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0E3B2E]/70 border border-[#38F28D]/20
                          flex items-center justify-center
                          group-hover:scale-90 transition-transform duration-300">
            <PlayCircle size={24} className="text-[#38F28D]/60" strokeWidth={1.5} />
          </div>
        </div>

        {/* Play overlay — appears on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-[#070A0A]/60 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.7 }}
                transition={{ duration: 0.2, ease: 'backOut' }}
                className="w-16 h-16 rounded-full bg-[#38F28D] flex items-center justify-center
                           shadow-[0_0_32px_rgba(56,242,141,0.7)]"
              >
                <Play size={22} className="text-[#070A0A] ml-1" fill="#070A0A" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1
                        bg-[#070A0A]/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <Clock size={10} className="text-[#38F28D]" />
          <span className="text-[#F2F5F4] text-[10px] font-medium">{video.duration}</span>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {video.new && (
            <span className="bg-[#0E3B2E] border border-[#38F28D]/40 text-[#38F28D] text-[9px] font-bold px-2 py-0.5 rounded-full">
              NEW
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${LEVEL_COLOR[video.level]}`}>
            {video.level}
          </span>
        </div>

        <h3 className="text-[#F2F5F4] font-semibold text-sm leading-snug mb-2
                       group-hover:text-[#38F28D] transition-colors duration-200 flex-1">
          {video.title}
        </h3>
        <p className="text-[#A7B0AD] text-xs leading-relaxed line-clamp-2">
          {video.desc}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Academy Page ─────────────────────────────────────────────────────────────
export default function Academy() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedVideo, setSelectedVideo]   = useState(null); // Nayi State Modal ke liye
  const navigate = useNavigate();

  // Scroll lock jab video chal rahi ho
  useEffect(() => {
    if (selectedVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedVideo]);

  const filtered = useMemo(() => {
    return VIDEOS.filter((v) => {
      const matchCat    = activeCategory === 'all' || v.category === activeCategory;
      const q           = searchQuery.toLowerCase();
      const matchSearch = !q || v.title.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const stats = [
    { value: `${VIDEOS.length}`,  label: 'Video tutorials'    },
    { value: '100%',              label: 'Free to watch'      },
    { value: '4',                 label: 'Topic categories'   },
    { value: '50+',               label: 'Minutes of content' },
  ];

  return (
    <div className="bg-[#070A0A] text-[#F2F5F4] min-h-screen overflow-x-hidden">
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]
                        bg-[#0E3B2E]/14 rounded-full blur-[120px] -z-10" />

        <div className="max-w-[1200px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D1211]
                       border border-[#1A2321] rounded-full text-sm text-[#38F28D] mb-6"
          >
            <GraduationCap size={14} /> Agentaria Academy
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08 }}
            className="text-5xl md:text-6xl lg:text-[64px] font-bold leading-[1.05] tracking-tight mb-5"
          >
            Learn everything.<br />
            <span className="text-[#38F28D]">Master it fast.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="text-[#A7B0AD] text-lg max-w-[460px] mx-auto mb-12"
          >
            Short, practical video guides covering every feature — from setup to advanced automation.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22 }}
            className="flex flex-wrap gap-6 justify-center"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-[#38F28D]">{s.value}</p>
                <p className="text-xs text-[#A7B0AD] mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ INTERACTIVE GUIDE BANNER ═════════════════════════════════════════ */}
      <section className="px-6 pb-8">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[20px] border border-[#1A2321]
                       bg-[#0D1211] px-7 py-5 flex flex-col sm:flex-row items-start
                       sm:items-center justify-between gap-5"
          >
            {/* Ambient glow */}
            <div className="absolute right-0 top-0 w-[300px] h-full
                            bg-[#38F28D]/5 blur-[70px] pointer-events-none" />
            {/* Decorative grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(56,242,141,1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,242,141,1) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            {/* Left — icon + copy */}
            <div className="relative flex items-center gap-4">
              <div className="w-11 h-11 rounded-[13px] bg-[#0E3B2E] border border-[#38F28D]/25
                              flex items-center justify-center flex-shrink-0
                              shadow-[0_0_18px_rgba(56,242,141,0.15)]">
                <BookMarked size={18} className="text-[#38F28D]" />
              </div>
              <div>
                <p className="text-[#F2F5F4] font-semibold text-sm leading-tight">
                  Prefer reading? Check out our Interactive Setup Guide.
                </p>
                <p className="text-[#A7B0AD] text-xs mt-0.5">
                  All 4 chapters • Step-by-step • Screenshots included
                </p>
              </div>
            </div>

            {/* Right — CTA button */}
            <button
              onClick={() => navigate('/academy/guide')}
              className="relative flex-shrink-0 flex items-center gap-2
                         bg-[#38F28D] text-[#070A0A] font-semibold text-sm
                         px-5 py-2.5 rounded-[13px] whitespace-nowrap
                         hover:scale-[1.03] hover:shadow-[0_0_22px_rgba(56,242,141,0.45)]
                         transition-all duration-200 group"
            >
              Read Guide
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ══ SEARCH + FILTERS ══════════════════════════════════════════════════ */}
      <section className="px-6 pb-10 sticky top-[65px] z-30">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[#0D1211]/90 backdrop-blur-xl border border-[#1A2321] rounded-[20px]
                       p-4 flex flex-col md:flex-row gap-4 items-start md:items-center"
          >
            {/* Search */}
            <div className="relative flex-1 min-w-0 w-full md:w-auto">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A7B0AD]" />
              <input
                type="text"
                placeholder="Search tutorials…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070A0A] border border-[#1A2321] rounded-[12px]
                           pl-9 pr-4 py-2.5 text-sm text-[#F2F5F4] placeholder-[#A7B0AD]/60
                           focus:outline-none focus:border-[#38F28D]/40 focus:ring-1 focus:ring-[#38F28D]/20
                           transition-all duration-200"
              />
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-semibold
                              transition-all duration-200 whitespace-nowrap
                              ${activeCategory === cat.id
                                ? 'bg-[#38F28D] text-[#070A0A] shadow-[0_0_16px_rgba(56,242,141,0.35)]'
                                : 'bg-[#070A0A] border border-[#1A2321] text-[#A7B0AD] hover:border-[#38F28D]/30 hover:text-[#F2F5F4]'
                              }`}
                >
                  <cat.icon size={12} />
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ VIDEO GRID ════════════════════════════════════════════════════════ */}
      <section className="px-6 pb-28">
        <div className="max-w-[1200px] mx-auto">

          {/* Result count */}
          <div className="flex items-center justify-between mb-7">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${activeCategory}-${searchQuery}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.25 }}
                className="text-[#A7B0AD] text-sm"
              >
                <span className="text-[#F2F5F4] font-semibold">{filtered.length}</span>
                {' '}tutorial{filtered.length !== 1 ? 's' : ''}
                {activeCategory !== 'all' && (
                  <> in <span className="text-[#38F28D]">
                    {CATEGORIES.find(c => c.id === activeCategory)?.label}
                  </span></>
                )}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div
                key={`${activeCategory}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              >
                {filtered.map((video, i) => (
                  <VideoCard key={video.id} video={video} index={i} onPlay={setSelectedVideo} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 text-center"
              >
                <div className="w-16 h-16 bg-[#0D1211] border border-[#1A2321] rounded-2xl
                                flex items-center justify-center mx-auto mb-5">
                  <Search size={24} className="text-[#A7B0AD]" />
                </div>
                <p className="text-[#F2F5F4] font-semibold mb-2">No tutorials found</p>
                <p className="text-[#A7B0AD] text-sm">
                  Try a different search term or category.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="mt-6 text-[#38F28D] text-sm font-medium hover:underline"
                >
                  Clear filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ══ START FREE TRIAL STRIP ══════════════════════════════════════════════════ */}
      <section className="px-6 pb-24">
        <div className="max-w-[1200px] mx-auto">
          <Reveal>
            <div className="relative bg-[#0D1211] border border-[#1A2321] rounded-[24px]
                            px-8 md:px-14 py-12 overflow-hidden
                            flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="absolute top-0 right-0 w-[400px] h-[200px]
                              bg-[#38F28D]/5 blur-[80px] pointer-events-none" />

              <div className="relative">
                <p className="text-[#38F28D] text-xs font-bold tracking-widest uppercase mb-2">
                  Ready to Automate?
                </p>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Start your 3-day free trial today
                </h2>
                <p className="text-[#A7B0AD] text-sm max-w-[420px]">
                  Build your digital employee in just 2 minutes. No credit card required to get started. 
                </p>
              </div>

              <div className="relative flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-[#38F28D] text-[#070A0A] px-7 py-3.5 rounded-[14px] font-semibold text-sm
                             hover:scale-[1.03] hover:shadow-[0_0_28px_rgba(56,242,141,0.5)]
                             transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                >
                  Start Free Trial <ChevronRight size={15} />
                </button>
                <button
                   onClick={() => navigate('/pricing')}
                  className="border-2 border-[#1A2321] text-[#A7B0AD] px-7 py-3.5 rounded-[14px]
                             font-semibold text-sm hover:border-[#38F28D]/30 hover:text-[#F2F5F4]
                             transition-all duration-300 whitespace-nowrap"
                >
                  See Pricing
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />

      {/* ══ CINEMATIC VIDEO MODAL ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#070A0A]/90 backdrop-blur-md"
            onClick={() => setSelectedVideo(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-6 right-6 z-[60] p-2.5 bg-[#0D1211] border border-[#1A2321] text-[#F2F5F4] 
                         rounded-full hover:bg-[#1A2321] hover:text-[#38F28D] transition-all"
            >
              <X size={24} />
            </button>

            {/* Video Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[1000px] aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[#1A2321]"
              onClick={(e) => e.stopPropagation()} 
            >
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}