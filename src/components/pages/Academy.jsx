import React, { useState, useMemo, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Search, Play, Clock, BookOpen, Zap, Link2, Star,
  ChevronRight, GraduationCap, Lock
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
    title:    'Welcome to Agentaria — Platform Overview',
    desc:     'A complete walkthrough of the dashboard, key features, and where to start.',
    category: 'getting-started',
    duration: '5:12',
    level:    'Beginner',
    thumbnail: 'overview',
    free:     true,
    new:      true,
  },
  {
    id: 2,
    title:    'Connect Your WhatsApp Number in 60 Seconds',
    desc:     'Scan a QR code, verify your number, and go live immediately.',
    category: 'getting-started',
    duration: '3:44',
    level:    'Beginner',
    thumbnail: 'connect',
    free:     true,
    new:      false,
  },
  {
    id: 3,
    title:    'Writing Your First Business Instructions',
    desc:     'Teach the AI your services, tone, and decision rules in plain language.',
    category: 'getting-started',
    duration: '6:30',
    level:    'Beginner',
    thumbnail: 'instructions',
    free:     true,
    new:      false,
  },
  {
    id: 4,
    title:    'Understanding the Smart Inbox',
    desc:     'Filters, handover alerts, and how to take over a live conversation.',
    category: 'getting-started',
    duration: '4:55',
    level:    'Beginner',
    thumbnail: 'inbox',
    free:     false,
    new:      false,
  },

  // ── Chat Agent ───────────────────────────────────────────────────────────
  {
    id: 5,
    title:    'How the AI Handles Incoming Messages',
    desc:     "Watch the agent qualify a lead from first message to handover — live walkthrough.",
    category: 'chat-agent',
    duration: '7:18',
    level:    'Intermediate',
    thumbnail: 'ai-flow',
    free:     true,
    new:      false,
  },
  {
    id: 6,
    title:    'Customising Handover Triggers',
    desc:     'Set keywords and conditions that tell the AI when to call you in.',
    category: 'chat-agent',
    duration: '5:02',
    level:    'Intermediate',
    thumbnail: 'handover',
    free:     false,
    new:      false,
  },
  {
    id: 7,
    title:    'AI Tone & Personality Settings',
    desc:     'Make your agent sound formal, friendly, or anywhere in between.',
    category: 'chat-agent',
    duration: '4:28',
    level:    'Beginner',
    thumbnail: 'tone',
    free:     false,
    new:      true,
  },

  // ── Advanced Bots ────────────────────────────────────────────────────────
  {
    id: 8,
    title:    'Client Re-Opener — Full CSV Walkthrough',
    desc:     'Prepare, upload, validate, and launch a re-engagement campaign step by step.',
    category: 'advanced',
    duration: '9:05',
    level:    'Intermediate',
    thumbnail: 'csv',
    free:     false,
    new:      false,
  },
  {
    id: 9,
    title:    'Scheduling Campaigns With Daily Send Limits',
    desc:     'Avoid WhatsApp flags by spreading messages safely across days.',
    category: 'advanced',
    duration: '6:41',
    level:    'Advanced',
    thumbnail: 'schedule',
    free:     false,
    new:      false,
  },
  {
    id: 10,
    title:    'Review Collection Strategy That Actually Works',
    desc:     'The two-step feedback-first method that protects your brand reputation.',
    category: 'advanced',
    duration: '8:15',
    level:    'Advanced',
    thumbnail: 'reviews',
    free:     false,
    new:      true,
  },

  // ── Integrations ─────────────────────────────────────────────────────────
  {
    id: 11,
    title:    'Connecting Agentaria to Google Reviews',
    desc:     'Auto-send your Google review link after a positive feedback response.',
    category: 'integrations',
    duration: '4:50',
    level:    'Intermediate',
    thumbnail: 'google',
    free:     false,
    new:      false,
  },
  {
    id: 12,
    title:    'n8n Workflow Automation with Agentaria',
    desc:     'Use n8n webhooks to connect Agentaria to any third-party service.',
    category: 'integrations',
    duration: '11:22',
    level:    'Advanced',
    thumbnail: 'n8n',
    free:     false,
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
function VideoCard({ video, index }) {
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
            <BookOpen size={22} className="text-[#38F28D]/60" />
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
          {video.free && (
            <span className="bg-[#38F28D] text-[#070A0A] text-[9px] font-bold px-2 py-0.5 rounded-full">
              FREE
            </span>
          )}
          {video.new && (
            <span className="bg-[#0E3B2E] border border-[#38F28D]/40 text-[#38F28D] text-[9px] font-bold px-2 py-0.5 rounded-full">
              NEW
            </span>
          )}
          {!video.free && (
            <span className="bg-[#070A0A]/70 backdrop-blur-sm border border-[#1A2321]
                             text-[#A7B0AD] text-[9px] font-medium px-2 py-0.5 rounded-full
                             flex items-center gap-1">
              <Lock size={8} /> Pro
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

  const filtered = useMemo(() => {
    return VIDEOS.filter((v) => {
      const matchCat    = activeCategory === 'all' || v.category === activeCategory;
      const q           = searchQuery.toLowerCase();
      const matchSearch = !q || v.title.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const stats = [
    { value: `${VIDEOS.length}`,   label: 'Video tutorials'    },
    { value: `${VIDEOS.filter(v => v.free).length}`,   label: 'Free to watch' },
    { value: '4',                  label: 'Topic categories'   },
    { value: '60+',                label: 'Minutes of content' },
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
                  <VideoCard key={video.id} video={video} index={i} />
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

      {/* ══ PRO UPSELL STRIP ══════════════════════════════════════════════════ */}
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
                  Unlock Everything
                </p>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Get full access to all Pro tutorials
                </h2>
                <p className="text-[#A7B0AD] text-sm max-w-[420px]">
                  Upgrade to Pro and unlock every advanced guide — campaigns, integrations, automation strategies, and more.
                </p>
              </div>

              <div className="relative flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <button
                  className="bg-[#38F28D] text-[#070A0A] px-7 py-3.5 rounded-[14px] font-semibold text-sm
                             hover:scale-[1.03] hover:shadow-[0_0_28px_rgba(56,242,141,0.5)]
                             transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                >
                  Start Free Trial <ChevronRight size={15} />
                </button>
                <button
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
    </div>
  );
}
