import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Check, X, ChevronDown, ChevronRight, Zap,
  Shield, Star, MessageSquare, RefreshCw, ThumbsUp,
  Bell, BarChart3, Headphones, Building2
} from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';

// ─── Animation helper ─────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const BASIC_FEATURES = [
  { icon: MessageSquare, label: 'AI Chat Assistant',       included: true  },
  { icon: RefreshCw,    label: 'Client Re-Opener',        included: true  },
  { icon: ThumbsUp,     label: 'Feedback & Reviews',      included: true  },
  { icon: Bell,         label: 'Real-Time Handover Alerts',included: true  },
  { icon: BarChart3,    label: 'Campaign Analytics',      included: true  }, // ✅ Ab dono mein milega
  { icon: Headphones,   label: 'Priority WhatsApp Support',included: false },
];

const PRO_FEATURES = BASIC_FEATURES.map((f) => ({ ...f, included: true }));

const BILLING_FAQ = [
  {
    q: 'Does the 3-day trial require a credit card?',
    a: 'No. You can start your free trial with just your email address. We will only ask for payment when you decide to subscribe after the trial ends.',
  },
  {
    q: 'What happens when the trial expires?',
    a: 'Your account is paused — not deleted. All your settings, conversations, and data are preserved. You can pick up exactly where you left off when you subscribe.',
  },
  {
    q: 'How much do I save with yearly billing?',
    a: 'Yearly billing gives you 2 months completely free — a saving of roughly 17% compared to paying monthly. The discount is applied automatically at checkout.',
  },
  {
    q: 'Can I switch between Basic and Pro plans?',
    a: 'Yes, anytime. Upgrades take effect immediately and are prorated. Downgrades take effect at the start of your next billing cycle.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Absolutely. Cancel from your dashboard with one click. You keep access until the end of your current billing period — no questions asked.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 7-day money-back guarantee from the date of your first paid charge. Contact support and we will process your refund within 24 hours.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe. Bank transfers are available for annual Enterprise plans.',
  },
  {
    q: 'Is there an Enterprise plan?',
    a: 'Yes. Enterprise is available for teams needing multiple WhatsApp numbers, custom integrations, or dedicated support. Contact us for a custom quote.',
  },
];

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function BillingToggle({ yearly, onToggle }) {
  return (
    <div className="flex items-center gap-4 justify-center">
      <span className={`text-sm font-medium transition-colors duration-200 ${!yearly ? 'text-[#F2F5F4]' : 'text-[#A7B0AD]'}`}>
        Monthly
      </span>

      <button
        onClick={onToggle}
        aria-label="Toggle billing period"
        className="relative w-14 h-7 rounded-full bg-[#1A2321] border border-[#2A3330]
                   focus:outline-none focus:ring-2 focus:ring-[#38F28D]/40 transition-all"
      >
        <motion.div
          layout
          animate={{ x: yearly ? 28 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className="absolute top-1 w-5 h-5 rounded-full bg-[#38F28D]
                     shadow-[0_0_10px_rgba(56,242,141,0.6)]"
        />
      </button>

      <span className={`text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${yearly ? 'text-[#F2F5F4]' : 'text-[#A7B0AD]'}`}>
        Yearly
        <span className="text-[10px] font-bold bg-[#0E3B2E] text-[#38F28D] border border-[#38F28D]/30
                         px-2 py-0.5 rounded-full">
          2 Months FREE
        </span>
      </span>
    </div>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full text-left bg-[#0D1211] border rounded-[16px] px-6 py-5
                    transition-all duration-300 group
                    ${open
                      ? 'border-[#38F28D]/30 shadow-[0_0_24px_rgba(56,242,141,0.06)]'
                      : 'border-[#1A2321] hover:border-[#38F28D]/20'}`}
      >
        <div className="flex items-start justify-between gap-4">
          <span className={`font-semibold text-base leading-snug transition-colors duration-200
                            ${open ? 'text-[#38F28D]' : 'text-[#F2F5F4]'}`}>
            {q}
          </span>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 mt-0.5"
          >
            <ChevronDown
              size={18}
              className={`transition-colors duration-200 ${open ? 'text-[#38F28D]' : 'text-[#A7B0AD]'}`}
            />
          </motion.div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="text-[#A7B0AD] text-sm leading-relaxed pt-4">{a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

// ─── Price display ────────────────────────────────────────────────────────────
function Price({ monthly, yearly, isYearly, highlight }) {
  const displayed = isYearly ? yearly : monthly;
  const perMonth  = isYearly ? (yearly / 12).toFixed(0) : monthly;

  return (
    <div className="mb-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${isYearly}-${displayed}`}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25 }}
        >
          {displayed === 0 ? (
            <span className={`text-5xl font-bold ${highlight ? 'text-[#F2F5F4]' : 'text-[#F2F5F4]'}`}>
              Free
            </span>
          ) : (
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold text-[#F2F5F4]">
                ${isYearly ? perMonth : displayed}
              </span>
              <span className="text-[#A7B0AD] text-sm mb-1.5">/mo</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {isYearly && displayed > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[#A7B0AD] text-xs mt-1"
        >
          Billed ${displayed}/year
        </motion.p>
      )}
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, isYearly, navigate, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col rounded-[22px] p-8 border transition-all duration-300
                  ${plan.highlight
                    ? 'bg-gradient-to-b from-[#0E3B2E]/70 to-[#0D1211] border-[#38F28D] shadow-[0_0_60px_rgba(56,242,141,0.14)]'
                    : 'bg-[#0D1211] border-[#1A2321] hover:border-[#38F28D]/25 hover:shadow-[0_8px_40px_rgba(56,242,141,0.06)]'
                  }`}
    >
      {/* Popular badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <div className="bg-[#38F28D] text-[#070A0A] text-xs font-bold px-4 py-1.5 rounded-full
                          shadow-[0_4px_16px_rgba(56,242,141,0.4)] whitespace-nowrap">
            {plan.badge}
          </div>
        </div>
      )}

      {/* Plan label */}
      <p className="text-[#38F28D] text-xs font-bold tracking-widest uppercase mb-4">{plan.label}</p>

      {/* Price */}
      <Price
        monthly={plan.monthly}
        yearly={plan.yearly}
        isYearly={isYearly}
        highlight={plan.highlight}
      />

      <p className="text-[#A7B0AD] text-sm mb-8 mt-2 leading-relaxed">{plan.desc}</p>

      {/* CTA */}
      <button
        onClick={() => navigate(plan.cta.route)}
        className={`w-full py-3.5 rounded-[14px] font-semibold text-sm mb-8 transition-all duration-300
                    ${plan.highlight
                      ? 'bg-[#38F28D] text-[#070A0A] hover:scale-[1.03] hover:shadow-[0_0_28px_rgba(56,242,141,0.5)]'
                      : 'border-2 border-[#38F28D] text-[#38F28D] hover:bg-[#38F28D] hover:text-[#070A0A]'
                    }`}
      >
        {plan.cta.label}
      </button>

      {/* Divider */}
      <div className="w-full h-px bg-[#1A2321] mb-6" />

      {/* Features */}
      <ul className="space-y-3.5 flex-1">
        {plan.features.map((f) => (
          <li key={f.label} className="flex items-center gap-3">
            {f.included ? (
              <div className="w-5 h-5 rounded-full bg-[#0E3B2E] flex items-center justify-center flex-shrink-0">
                <Check size={11} className="text-[#38F28D]" strokeWidth={3} />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#1A2321] flex items-center justify-center flex-shrink-0">
                <X size={11} className="text-[#A7B0AD]" strokeWidth={2.5} />
              </div>
            )}
            <span className={`text-sm ${f.included ? 'text-[#F2F5F4]' : 'text-[#A7B0AD]/50 line-through'}`}>
              {f.label}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ─── Pricing Page ─────────────────────────────────────────────────────────────
export default function Pricing() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);

  const PLANS = [
    {
      label:     'Basic Trial',
      badge:     null,
      highlight: false,
      monthly:   0,
      yearly:    0,
      desc:      'Experience the full power of Agentaria free for 3 days. No card required.',
      cta:       { label: 'Start Free Trial', route: '/signup' },
      features:  BASIC_FEATURES,
    },
    {
      label:     'Pro Business',
      badge:     '⭐ Most Popular',
      highlight: true,
      monthly:   59,
      yearly:    590,
      desc:      'Everything you need to automate your WhatsApp and grow your business.',
      cta:       { label: 'Get Started', route: '/signup' },
      features:  PRO_FEATURES,
    },
    {
      label:     'Enterprise',
      badge:     null,
      highlight: false,
      monthly:   null,
      yearly:    null,
      desc:      'Multiple numbers, custom integrations, and a dedicated success manager.',
      cta:       { label: 'Contact Us', route: '/#contact' },
      features:  [
        { label: 'Everything in Pro',          included: true  },
        { label: 'Done-For-You Setup',         included: true  },
        { label: 'Custom CRM Integrations',    included: true  },
        { label: 'Dedicated Account Manager',  included: true  },
        { label: 'Volume Discount for Numbers',included: true  },
      ],
    },
  ];

  return (
    <div className="bg-[#070A0A] text-[#F2F5F4] min-h-screen overflow-x-hidden">
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-20 px-6 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px]
                        bg-[#0E3B2E]/15 rounded-full blur-[130px] -z-10 pointer-events-none" />

        <div className="max-w-[1200px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D1211]
                       border border-[#1A2321] rounded-full text-sm text-[#38F28D] mb-6"
          >
            <Zap size={14} /> Simple, honest pricing
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08 }}
            className="text-5xl md:text-6xl lg:text-[64px] font-bold leading-[1.05] tracking-tight mb-5"
          >
            Start free.<br />
            Scale when ready.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16 }}
            className="text-[#A7B0AD] text-lg max-w-[440px] mx-auto mb-10"
          >
            No hidden fees. No per-message charges. One flat rate, unlimited automation.
          </motion.p>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
          >
            <BillingToggle yearly={yearly} onToggle={() => setYearly((v) => !v)} />
          </motion.div>
        </div>
      </section>

      {/* ══ PLAN CARDS ════════════════════════════════════════════════════════ */}
      <section className="px-6 pb-24">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan, i) => (
              plan.monthly === null ? (
                // Enterprise custom card
                <EnterpriseCard key={plan.label} plan={plan} navigate={navigate} delay={i * 0.1} />
              ) : (
                <PlanCard
                  key={plan.label}
                  plan={plan}
                  isYearly={yearly}
                  navigate={navigate}
                  delay={i * 0.1}
                />
              )
            ))}
          </div>

          {/* Bottom trust note */}
          <Reveal delay={0.3} className="text-center mt-10">
            <p className="text-[#A7B0AD] text-sm flex flex-wrap items-center justify-center gap-6">
              {['7-day money-back guarantee', 'Cancel anytime', 'Secured by Stripe', 'No setup fees'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={13} className="text-[#38F28D]" /> {t}
                </span>
              ))}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ FEATURE COMPARISON TABLE ══════════════════════════════════════════ */}
      <section className="px-6 pb-24">
        <div className="max-w-[900px] mx-auto">
          <Reveal className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Compare Plans</h2>
            <p className="text-[#A7B0AD] text-sm">Everything you get in each tier at a glance.</p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="bg-[#0D1211] border border-[#1A2321] rounded-[22px] overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-4 px-6 py-4 border-b border-[#1A2321] bg-[#0A0F0E]">
                <div className="col-span-2 text-[#A7B0AD] text-xs font-semibold uppercase tracking-wider">Feature</div>
                <div className="text-center text-[#A7B0AD] text-xs font-semibold uppercase tracking-wider">Basic</div>
                <div className="text-center text-[#38F28D] text-xs font-semibold uppercase tracking-wider">Pro</div>
              </div>

              {/* Rows */}
              {[
                { label: 'AI Chat Assistant',          basic: true,  pro: true  },
                { label: 'Client Re-Opener (CSV)',      basic: true,  pro: true  },
                { label: 'Feedback & Reviews',          basic: true,  pro: true  },
                { label: 'Real-Time Handover Alerts',   basic: true,  pro: true  },
                { label: 'Campaign Analytics',          basic: true,  pro: true  }, // ✅ Trial aur Pro dono mein
                { label: 'Priority WhatsApp Support',   basic: false, pro: true  },
                { label: 'Done-For-You Setup',          basic: false, pro: false, enterprise: true },
                { label: 'Custom CRM Integrations',     basic: false, pro: false, enterprise: true },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-4 px-6 py-4 transition-colors ${
                    i % 2 === 0 ? '' : 'bg-[#070A0A]/40'
                  } hover:bg-[#0E3B2E]/10`}
                >
                  <div className="col-span-2 text-sm text-[#F2F5F4]">{row.label}</div>
                  <div className="flex justify-center">
                    {row.basic
                      ? <Check size={16} className="text-[#38F28D]" strokeWidth={2.5} />
                      : <X size={16} className="text-[#1A2321]" strokeWidth={2} />
                    }
                  </div>
                  <div className="flex justify-center">
                    {row.pro
                      ? <Check size={16} className="text-[#38F28D]" strokeWidth={2.5} />
                      : row.enterprise
                        ? <span className="text-[10px] text-[#A7B0AD] font-medium">Enterprise</span>
                        : <X size={16} className="text-[#1A2321]" strokeWidth={2} />
                    }
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ BILLING FAQ ═══════════════════════════════════════════════════════ */}
      <section className="px-6 pb-28">
        <div className="max-w-[780px] mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-[#38F28D] text-xs font-bold tracking-widest uppercase mb-3">Billing & Accounts</p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Questions answered.
            </h2>
            <p className="text-[#A7B0AD] mt-3 max-w-[380px] mx-auto text-sm">
              Everything about plans, payments, and account management.
            </p>
          </Reveal>

          <div className="space-y-3">
            {BILLING_FAQ.map((item, i) => (
              <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
            ))}
          </div>

          {/* Still have questions? */}
          <Reveal delay={0.2} className="mt-10">
            <div className="text-center p-8 bg-[#0D1211] border border-[#1A2321] rounded-[20px]">
              <p className="text-[#F2F5F4] font-semibold mb-2">Still have questions?</p>
              <p className="text-[#A7B0AD] text-sm mb-5">
                Our team responds within a few hours during business hours.
              </p>
              <button
                className="bg-[#38F28D] text-[#070A0A] px-7 py-3 rounded-[12px] font-semibold text-sm
                           hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(56,242,141,0.4)] transition-all duration-300"
              >
                Contact Support
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ─── Enterprise Card (special layout) ────────────────────────────────────────
function EnterpriseCard({ plan, navigate, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col rounded-[22px] p-8 border border-[#1A2321] bg-[#0D1211]
                 hover:border-[#38F28D]/25 hover:shadow-[0_8px_40px_rgba(56,242,141,0.06)]
                 transition-all duration-300"
    >
      <p className="text-[#38F28D] text-xs font-bold tracking-widest uppercase mb-4">{plan.label}</p>

      <div className="mb-2">
        <span className="text-4xl font-bold text-[#F2F5F4]">Custom</span>
      </div>
      <p className="text-[#A7B0AD] text-sm mb-8 mt-2 leading-relaxed">{plan.desc}</p>

      <button
        onClick={() => navigate(plan.cta.route)}
        className="w-full py-3.5 rounded-[14px] font-semibold text-sm mb-8 border-2 border-[#38F28D]
                   text-[#38F28D] hover:bg-[#38F28D] hover:text-[#070A0A] transition-all duration-300
                   flex items-center justify-center gap-2"
      >
        {plan.cta.label} <ChevronRight size={15} />
      </button>

      <div className="w-full h-px bg-[#1A2321] mb-6" />

      <ul className="space-y-3.5 flex-1">
        {plan.features.map((f) => (
          <li key={f.label} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-[#0E3B2E] flex items-center justify-center flex-shrink-0">
              <Check size={11} className="text-[#38F28D]" strokeWidth={3} />
            </div>
            <span className="text-sm text-[#F2F5F4]">{f.label}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
