import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, ArrowLeft, ExternalLink, Zap,
  BookOpen, Settings, TrendingUp, LayoutDashboard,
  CheckCircle2, AlertCircle, Lightbulb, Lock, Star,
  FileText, Wifi, Users, BarChart2, Shield
} from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';

// ─── Smart Screenshot Component ───────────────────────────────────────────────
const Screenshot = ({ label, src }) => {
  // Agar aapne image ka link de diya hai, toh ye premium design ke sath image dikhayega
  if (src) {
    return (
      <div className="relative my-8 rounded-[16px] overflow-hidden border border-[#1A2321] bg-[#070A0A] shadow-[0_12px_40px_rgba(0,0,0,0.6)] group">
        <img 
          src={src} 
          alt={label} 
          className="w-full h-auto object-cover group-hover:scale-[1.015] transition-transform duration-500" 
        />
        {/* Chota sa label caption (Optional: agar nahi chahiye toh ye div hata dein) */}
        <div className="absolute bottom-3 right-3 bg-[#070A0A]/80 backdrop-blur-md px-3 py-1.5 rounded-[8px] border border-[#1A2321] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-[#A7B0AD] text-[10px] font-medium">{label}</p>
        </div>
      </div>
    );
  }

  // Agar image ka link nahi diya, toh wahi purana green placeholder dikhayega
  return (
    <div className="relative my-8 rounded-[16px] overflow-hidden border border-dashed border-[#38F28D]/35
                    bg-[#0D1211] aspect-video flex flex-col items-center justify-center gap-3
                    shadow-[inset_0_0_60px_rgba(56,242,141,0.03)]">
      <div className="w-12 h-12 rounded-[12px] bg-[#0E3B2E]/60 border border-[#38F28D]/20
                      flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#38F28D]/70"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
      </div>
      <p className="text-[#A7B0AD] text-sm font-medium">Screenshot: {label}</p>
      <p className="text-[#A7B0AD]/40 text-xs">Add "src" prop to show image</p>
    </div>
  );
};

// ─── Callout boxes ─────────────────────────────────────────────────────────────
const Tip = ({ children }) => (
  <div className="flex gap-3 bg-[#0E3B2E]/30 border border-[#38F28D]/20 rounded-[14px] px-5 py-4 my-5">
    <Lightbulb size={16} className="text-[#38F28D] flex-shrink-0 mt-0.5" />
    <p className="text-[#A7B0AD] text-sm leading-relaxed">{children}</p>
  </div>
);

const Warning = ({ children }) => (
  <div className="flex gap-3 bg-[#2E1A0E]/40 border border-[#F2C838]/20 rounded-[14px] px-5 py-4 my-5">
    <AlertCircle size={16} className="text-[#F2C838] flex-shrink-0 mt-0.5" />
    <p className="text-[#A7B0AD] text-sm leading-relaxed">{children}</p>
  </div>
);

const Note = ({ children }) => (
  <div className="flex gap-3 bg-[#0E1B3B]/40 border border-[#6B8FD4]/20 rounded-[14px] px-5 py-4 my-5">
    <Shield size={16} className="text-[#6B8FD4] flex-shrink-0 mt-0.5" />
    <p className="text-[#A7B0AD] text-sm leading-relaxed">{children}</p>
  </div>
);

// ─── Section heading ───────────────────────────────────────────────────────────
const H2 = ({ children }) => (
  <h2 className="text-[#F2F5F4] text-2xl font-bold mt-12 mb-4 pb-3
                  border-b border-[#1A2321] flex items-center gap-2">
    {children}
  </h2>
);

const H3 = ({ children }) => (
  <h3 className="text-[#F2F5F4] text-lg font-semibold mt-8 mb-3">{children}</h3>
);

const H4 = ({ children }) => (
  <h4 className="text-[#38F28D] text-sm font-bold uppercase tracking-wider mt-6 mb-2">{children}</h4>
);

const P = ({ children }) => (
  <p className="text-[#A7B0AD] text-[15px] leading-[1.8] mb-4">{children}</p>
);

// Ordered list item
const OLI = ({ n, children }) => (
  <div className="flex gap-4 mb-3">
    <span className="w-6 h-6 rounded-full bg-[#0E3B2E] border border-[#38F28D]/30 flex items-center justify-center
                     text-[#38F28D] text-xs font-bold flex-shrink-0 mt-0.5">{n}</span>
    <p className="text-[#A7B0AD] text-[15px] leading-[1.75]">{children}</p>
  </div>
);

// Bullet list item
const BLI = ({ children, accent = false }) => (
  <div className="flex gap-3 mb-2.5">
    <span className={`w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0 ${accent ? 'bg-[#38F28D]' : 'bg-[#A7B0AD]/50'}`} />
    <p className="text-[#A7B0AD] text-[15px] leading-[1.75]">{children}</p>
  </div>
);

// Bold inline helper
const B = ({ children }) => <strong className="text-[#F2F5F4] font-semibold">{children}</strong>;

// ─── Chapter badge ─────────────────────────────────────────────────────────────
const ChapterBadge = ({ label }) => (
  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
                    text-[#38F28D] bg-[#0E3B2E] px-3 py-1 rounded-full mb-4">
    <Zap size={10} /> {label}
  </span>
);

// ─── GUIDE CONTENT ─────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'intro',
    label: 'Introduction',
    icon: BookOpen,
    content: (
      <motion.div key="intro" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22,1,0.36,1] }}>
        <ChapterBadge label="Welcome" />
        <h1 className="text-[#F2F5F4] text-4xl font-bold leading-tight mb-4">
          Welcome to Agentaria 🚀<br />
          <span className="text-[#38F28D]">Your 24/7 Digital Employee for WhatsApp</span>
        </h1>
        <P>
          In today's fast-paced digital world, customers expect instant answers. Agentaria is not just a standard messaging tool — it is a complete <B>Digital Employee</B> designed to deeply understand your business rules, provide human-like responses 24/7, generate new leads, and skyrocket your 5-star reviews.
        </P>
        <P>
          Whether you are sleeping, on vacation, or in a busy meeting, Agentaria gives every single client reaching out on your WhatsApp a true VIP experience.
        </P>
        <P>
          This guide is your complete reference. It covers the full journey — from your very first login to running advanced marketing campaigns on autopilot. Use the navigation on the left to jump to any chapter.
        </P>

        {/* Quick overview cards */}
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          {[
            { icon: Zap,          label: 'Chapter 1', title: 'Initial Setup',      desc: 'Get live in under 2 minutes with a guided chat onboarding and QR code connection.' },
            { icon: LayoutDashboard, label: 'Chapter 2', title: 'Daily Operations', desc: 'Your dashboard, smart inbox, and handover system — the command center.' },
            { icon: TrendingUp,   label: 'Chapter 3', title: 'Growth & Marketing', desc: 'Client Re-Opener campaigns and the Gated Review System.' },
            { icon: Settings,     label: 'Chapter 4', title: 'Settings',           desc: 'Business AI brain, review links, working hours, and profile.' },
          ].map((card) => (
            <div key={card.label}
              className="bg-[#0D1211] border border-[#1A2321] rounded-[16px] p-5
                         hover:border-[#38F28D]/25 transition-all duration-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-[8px] bg-[#0E3B2E] flex items-center justify-center">
                  <card.icon size={14} className="text-[#38F28D]" />
                </div>
                <span className="text-[#38F28D] text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
              </div>
              <p className="text-[#F2F5F4] font-semibold text-sm mb-1">{card.title}</p>
              <p className="text-[#A7B0AD] text-xs leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    ),
  },

  {
    id: 'chapter1',
    label: 'Chapter 1: Initial Setup',
    icon: Zap,
    content: (
      <motion.div key="chapter1" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22,1,0.36,1] }}>
        <ChapterBadge label="Chapter 1" />
        <h1 className="text-[#F2F5F4] text-3xl font-bold mb-2">Initial Setup</h1>
        <p className="text-[#38F28D] text-lg font-medium mb-6">The 2-Minute Onboarding</p>
        <P>Going live with Agentaria requires absolutely zero technical skills. The initial setup is designed to be a frictionless conversation and is broken down into two simple phases.</P>

        <H2><span className="text-[#38F28D] mr-2">Step 1</span> Hire Your Digital Employee</H2>
        <p className="text-[#A7B0AD]/60 text-sm font-medium uppercase tracking-wider mb-4">The Chat Setup</p>

        <P>As soon as you create your account, you will be greeted by a beautiful, interactive chat window. Instead of filling out boring forms, Agentaria will personally chat with you to understand your business.</P>

        <Screenshot label="Onboarding Chat — Step 1/7 Goal Selection" src="/guide-images/step1.png" />

        <P>During this quick conversation, you will simply provide:</P>

        <div className="space-y-3 mb-6">
          {[
            { label: 'Your Goal',        desc: 'Tell Agentaria if your primary focus is to Automate Support, Generate Leads, or Re-engage Clients.' },
            { label: 'Business Identity', desc: 'Provide your business name and select your specific industry.' },
            { label: 'WhatsApp Number',  desc: 'Confirm the exact phone number Agentaria will be managing.' },
            { label: 'Business Hours',   desc: "Set your human staff's opening and closing times so Agentaria knows when to step in." },
          ].map((item) => (
            <div key={item.label} className="flex gap-4 bg-[#0D1211] border border-[#1A2321] rounded-[13px] px-5 py-4">
              <CheckCircle2 size={16} className="text-[#38F28D] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#F2F5F4] text-sm font-semibold mb-0.5">{item.label}</p>
                <p className="text-[#A7B0AD] text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <H3>🧠 Training Your Agent — The Knowledge Base</H3>
        <P>Agentaria will ask you to upload a PDF file. Why is this so important? This document acts as the <B>"brain"</B> of your digital employee.</P>
        <P>To fully train Agentaria to respond exactly like your best sales rep, this PDF should include:</P>
        <div className="mb-4">
          {['Your complete service list', 'Exact pricing', 'Refund and return policies', 'Frequently Asked Questions (FAQs)', 'Instructions on what not to say'].map((item) => (
            <BLI key={item} accent>{item}</BLI>
          ))}
        </div>
        <P>The richer the details in this document, the smarter and more accurate your agent becomes!</P>

        <Screenshot label="Onboarding Chat — Step 6/7 PDF Upload" src="/guide-images/Step 6-7 PDF Upload.png" />

        <Tip>You can skip the PDF step during the chat and upload it later from your <B>Business Settings</B> page. Your agent will still be active — just less informed until you train it.</Tip>

        <H3>⭐ Activating Auto-Reviews — The Review Link</H3>
        <P>Next, Agentaria will ask for your review link. Why add this right now? Because Agentaria has a built-in feedback system.</P>
        <P>When it detects that a customer is highly satisfied at the end of a conversation, it will automatically share this exact link to secure a 5-star review for your business!</P>

        <Tip>Later in this guide (Chapter 3), we reveal how you can completely customize the review process and manage different review platforms exactly the way you want.</Tip>

        <H2><span className="text-[#38F28D] mr-2">Step 2</span> Connect Your WhatsApp</H2>
        <p className="text-[#A7B0AD]/60 text-sm font-medium uppercase tracking-wider mb-4">Going Live</p>

        <P>Once the onboarding chat is complete, you will land on your main Dashboard. Your Agentaria has now learned your rules — it just needs to be connected to your WhatsApp line!</P>

        <div className="space-y-3 mb-6">
          {[
            "From your dashboard's left menu, navigate to the WhatsApp Connection page.",
            'Click the green "Connect WhatsApp" button.',
            'Open the WhatsApp app on your actual mobile phone.',
            'Go to Linked Devices and simply scan the QR Code displayed on your computer screen.',
          ].map((step, i) => (
            <OLI key={i} n={i + 1}>{step}</OLI>
          ))}
        </div>

        <Screenshot label="WhatsApp Connection — QR Code Screen" src="/guide-images/QR Code Screen.png" />
        <Screenshot label="WhatsApp Connection — Connected & Active" src="/guide-images/Connected & Active.png" />

        <div className="mt-8 bg-gradient-to-br from-[#0A1F16] to-[#0D1211] border border-[#38F28D]/25
                        rounded-[18px] px-7 py-6 text-center">
          <div className="text-3xl mb-3">🎉</div>
          <p className="text-[#F2F5F4] font-bold text-lg mb-1">Congratulations! Setup Complete.</p>
          <p className="text-[#A7B0AD] text-sm">As soon as that QR code is scanned, your new Digital Employee is officially live, fully trained, and ready to handle your clients around the clock.</p>
        </div>
      </motion.div>
    ),
  },

  {
    id: 'chapter2',
    label: 'Chapter 2: Daily Operations',
    icon: LayoutDashboard,
    content: (
      <motion.div key="chapter2" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22,1,0.36,1] }}>
        <ChapterBadge label="Chapter 2" />
        <h1 className="text-[#F2F5F4] text-3xl font-bold mb-2">Daily Operations</h1>
        <p className="text-[#38F28D] text-lg font-medium mb-6">Your Command Center & Smart Inbox</p>

        <P>Once Agentaria is live, you no longer need to constantly monitor your WhatsApp. Your <B>Dashboard</B> and <B>Chat Management</B> pages become your new Command Center. Spending just 5 minutes here every morning gives you complete control over your business!</P>

        <H2>1. The Setup Progress Bar</H2>
        <p className="text-[#A7B0AD]/60 text-xs uppercase tracking-wider mb-4">Your Final Steps</p>

        <P>At the very top of your dashboard, you will immediately notice the <B>Setup Progress Bar</B>. This acts as your personal guide. If your setup is not at 100%, it will dynamically display exactly what is missing — like uploading your Knowledge Base PDF or connecting WhatsApp — and provide a direct button to fix it.</P>
        <P>Once you complete all the steps, the bar will transform into a beautiful success banner: <B>"🎉 Your Agentaria is fully set up and ready!"</B></P>

        <Screenshot label="Setup Progress Bar — 60% Completion State" src="/guide-images/60% Completion State.png" />

        <H2>2. Tracking Your Success</H2>
        <p className="text-[#A7B0AD]/60 text-xs uppercase tracking-wider mb-4">The Stats Grid</p>

        <P>Right below the progress bar, you will see four cards that act as a 5-second health check for your business:</P>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {[
            { icon: Users,    label: 'Active Conversations', desc: 'How many clients Agentaria is actively talking to right now.' },
            { icon: BarChart2, label: 'Messages Handled',    desc: 'The total number of messages your AI has replied to (saving you hours of typing!).' },
            { icon: TrendingUp, label: 'Clients Re-opened',  desc: 'The number of past clients who returned after seeing your broadcast campaigns.' },
            { icon: Star,     label: 'Reviews Collected',    desc: 'The total number of new 5-star reviews secured on autopilot.' },
          ].map((item) => (
            <div key={item.label} className="bg-[#0D1211] border border-[#1A2321] rounded-[13px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <item.icon size={14} className="text-[#38F28D]" />
                <p className="text-[#F2F5F4] text-sm font-semibold">{item.label}</p>
              </div>
              <p className="text-[#A7B0AD] text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <Screenshot label="Stats Grid — Active Dashboard" src="/guide-images/Active Dashboard.png" />

        <H2>3. The "Smart Human Handover" & Notifications</H2>

        <P>Agentaria is incredibly smart, but we have intentionally designed it to give <B>YOU</B> 100% control over your business and revenue.</P>
        <P>While Agentaria perfectly handles the heavy lifting — answering FAQs, explaining your services, and warming up potential leads — it is strictly programmed <B>not</B> to handle final bookings or lock in final quotes.</P>

        <div className="bg-[#0D1211] border border-[#1A2321] rounded-[16px] px-6 py-5 my-6">
          <p className="text-[#38F28D] text-sm font-bold mb-1">Why? The Human-First Philosophy</p>
          <p className="text-[#A7B0AD] text-sm leading-relaxed">Your most important deals should be closed by <em>you</em>. Agentaria warms the lead, you seal it.</p>
        </div>

        <P>Whenever a lead is hot, asking for a final price, or ready to get on a call, Agentaria immediately steps back and triggers a <B>"Human Handover"</B>. It will also do this if a client specifically demands to speak to a human or asks a complex question not covered in your PDF.</P>

        <P>You will be instantly notified so you can jump in and close the deal:</P>

        <div className="space-y-3 mb-6">
          <OLI n={1}><B>The Notification Bell:</B> A red alert will appear on the bell icon at the top right of your screen.</OLI>
          <OLI n={2}><B>Dashboard Alerts:</B> The "Recent Handovers" section on your dashboard will display the client's number and their exact request. You can click <B>"View Conversation"</B> to jump right into the chat, or click <B>"Dismiss"</B> if you resolved the issue over a phone call.</OLI>
        </div>

        <Screenshot label="Dashboard — Recent Handovers Section with Notifications" src="/guide-images/Recent Handovers Section with Notifications.png" /> 

        <H2>4. Chat Management</H2>
        <p className="text-[#A7B0AD]/60 text-xs uppercase tracking-wider mb-4">Your Smart Inbox</p>

        <P>When you click on <B>"Chat Management"</B> from the left menu, you enter your Smart Inbox. This is where the magic happens. Your inbox automatically categorizes every single WhatsApp conversation into organized tabs:</P>

        <div className="space-y-2 mb-6">
          {[
            { tab: 'All',       count: '10', desc: 'Every ongoing conversation in your workspace.' },
            { tab: 'Open',      count: '9',  desc: "These are chats currently being handled perfectly by your agent. You don't need to do anything here!" },
            { tab: 'Handover',  count: '1',  desc: 'Your daily to-do list. These are the clients waiting for your human reply.' },
            { tab: 'Campaigns', count: '0',  desc: 'Conversations generated from your bulk marketing broadcasts.' },
            { tab: 'Reviews',   count: '0',  desc: 'Conversations where clients are providing feedback or interacting with your review links.' },
          ].map((item) => (
            <div key={item.tab} className="flex gap-3 bg-[#0D1211] border border-[#1A2321] rounded-[12px] px-4 py-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#38F28D] bg-[#0E3B2E]
                               px-2 py-0.5 rounded-full h-fit mt-0.5 whitespace-nowrap">
                {item.tab}
                <span className="text-[#38F28D]/60">{item.count}</span>
              </span>
              <p className="text-[#A7B0AD] text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <H3>How to Reply as a Human?</H3>
        <P>When you open a "Handover" chat, you can read the entire conversation history between the AI and the client. To reply, simply click the yellow <B>"Take Over"</B> button at the top right. This pauses the AI for that specific client, allowing you to type your response in the chat box at the bottom.</P>

        <Screenshot label="Smart Inbox — Chat Management with Handover Open" src="/guide-images/Chat Management with Handover Open.png" />

        <Tip><B>Daily Pro Tip:</B> "Check your Smart Inbox once in the morning and once in the evening. If your Handover tab is empty, it means Agentaria has successfully managed 100% of your customer support for the day. Sit back and relax!"</Tip>
      </motion.div>
    ),
  },

  {
    id: 'chapter3',
    label: 'Chapter 3: Growth & Marketing',
    icon: TrendingUp,
    content: (
      <motion.div key="chapter3" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22,1,0.36,1] }}>
        <ChapterBadge label="Chapter 3" />
        <h1 className="text-[#F2F5F4] text-3xl font-bold mb-2">Growth & Marketing</h1>
        <p className="text-[#38F28D] text-lg font-medium mb-6">Scaling on Autopilot</p>

        <P>Now that your daily operations are running smoothly, it's time to use Agentaria to actively grow your business and increase your revenue. This chapter covers the two most powerful tools in your workspace: <B>The Client Re-Opener</B> and the <B>Gated Review System</B>.</P>

        <H2>1. The Client Re-Opener</H2>
        <p className="text-[#A7B0AD]/60 text-xs uppercase tracking-wider mb-4">Smart Broadcasts</p>

        <P>Reaching out to past clients is the fastest way to generate new sales. However, Agentaria handles marketing much smarter than a traditional bulk-messaging tool. It splits your marketing into two secure, highly effective categories:</P>

        <H3>A. Bulk Campaigns (AI-Managed)</H3>
        <P>Want to announce a new discount or a holiday sale?</P>

        <div className="space-y-3 mb-5">
          <OLI n={1}>Go to the <B>Client Re-Opener</B> page and upload your CSV file containing client names and numbers.</OLI>
          <OLI n={2}>Draft your message and use the <code className="bg-[#0D1211] border border-[#1A2321] text-[#38F28D] px-2 py-0.5 rounded-md text-sm font-mono">{'{{name}}'}</code> tag. Agentaria will automatically replace this with each client's actual name for a personal touch.</OLI>
          <OLI n={3}><B>Crucial Step:</B> Before hitting send, go to your Business Settings and update your Knowledge Base (PDF) with the details of this new offer.</OLI>
          <OLI n={4}><B>Where do replies go?</B> Since the AI is trained on your new offer, all replies will go straight to the "Open" tab in your Smart Inbox. Agentaria will handle the inquiries and book the leads for you!</OLI>
        </div>

        <Warning><B>Safety Guideline:</B> To keep your WhatsApp number secure and avoid bans, you can send up to 200 messages a day. However, we strongly recommend keeping it to <B>50 messages per day</B> for optimal account health.</Warning>

        <Screenshot label="Client Re-Opener — Choose Strategy (Relationship AI vs Bulk Offer)" src="/guide-images/Choose Strategy (Relationship AI vs Bulk Offer).png" />

        <H3>B. Personalized Campaigns (Human-Managed)</H3>
        <P>Sometimes you want to reach out to specific VIP clients based on your past relationship with them. Because these messages require a delicate, human touch, Agentaria steps back.</P>
        <P>When you launch a Personalized Campaign, any replies from these clients will <B>bypass the AI</B> and go directly to the <B>"Campaigns" tab</B> in your Smart Inbox. This ensures you maintain full control over your most valuable relationships.</P>

        <Screenshot label="Configure Campaign — Name, Schedule, Daily Limit, Message Template" src="/guide-images/Name, Schedule, Daily Limit, Message Template.png" />

        <H2>2. The "Gated" Feedback & Review System</H2>

        <P>Getting 5-star reviews on Google, Trustpilot, or Yelp is critical for your business. But simply blasting review links to everyone is risky. What if a customer is unhappy?</P>
        <P>Agentaria uses a brilliant <B>"Gated" Review System</B> to protect your 5-star reputation:</P>

        <div className="space-y-3 mb-6">
          <OLI n={1}><B>The Setup:</B> Go to the <B>Feedback &amp; Reviews</B> page. Simply select your preferred review platform (you can change this anytime) and set the time delay for when the message should be sent.</OLI>
          <OLI n={2}><B>The Safety Net (Asking for Feedback first):</B> Agentaria will never send the direct review link immediately. Instead, it will politely ask the client about their experience.</OLI>
          <OLI n={3}><B>The Magic Routing:</B> Based on the customer's response, one of two things happens automatically.</OLI>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#0A1F16] border border-[#38F28D]/25 rounded-[14px] p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-[#38F28D]" />
              <p className="text-[#38F28D] font-bold text-sm">Positive Feedback</p>
            </div>
            <p className="text-[#A7B0AD] text-sm leading-relaxed">Agentaria automatically replies with your review link to secure that 5-star rating!</p>
          </div>
          <div className="bg-[#1F0A0A] border border-[#F2584E]/20 rounded-[14px] p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-[#F2584E]" />
              <p className="text-[#F2584E] font-bold text-sm">Negative Feedback</p>
            </div>
            <p className="text-[#A7B0AD] text-sm leading-relaxed">Agentaria immediately apologizes, withholds the review link, and triggers a Human Handover in the Reviews tab.</p>
          </div>
        </div>

        <Screenshot label="Feedback & Reviews — Send Review Request Form" src="/guide-images/Send Review Request Form.png" />
      </motion.div>
    ),
  },

  {
    id: 'chapter4',
    label: 'Chapter 4: Settings',
    icon: Settings,
    content: (
      <motion.div key="chapter4" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22,1,0.36,1] }}>
        <ChapterBadge label="Chapter 4" />
        <h1 className="text-[#F2F5F4] text-3xl font-bold mb-2">Managing Your Settings</h1>
        <p className="text-[#38F28D] text-lg font-medium mb-6">The Control Room</p>

        <P>As your business grows and evolves, your Agentaria workspace should evolve with it. The Settings section is your main control room where you can easily update your AI's brain and your personal account details.</P>
        <P>You will find two main settings areas in your left-hand menu.</P>

        <H2>1. Business Settings</H2>
        <p className="text-[#A7B0AD]/60 text-xs uppercase tracking-wider mb-4">Updating Your AI's Brain</p>

        <P>This section is entirely focused on how your AI interacts with your customers. If you ever change your pricing, add a new service, or change your working schedule, this is where you go!</P>

        <div className="space-y-4 mb-6">
          {[
            {
              tab: 'AI Knowledge',
              desc: 'This is the core intelligence of your digital employee. If you have a new menu, updated policies, or new FAQs, simply come here, click the trash can icon to delete your old PDF, and upload the new one. Agentaria will instantly read and memorize the new document.',
              note: 'Max file size: 10MB.',
            },
            {
              tab: 'Review Links',
              desc: 'Did you switch from Google Reviews to Trustpilot? No problem. You can instantly update the link your AI sends to happy customers here.',
              note: null,
            },
            {
              tab: 'Working Hours',
              desc: "If your human staff's shift timings change (e.g., shorter hours on Fridays or closing on weekends), update your schedule here so Agentaria knows exactly when to take over the chats completely.",
              note: null,
            },
          ].map((item) => (
            <div key={item.tab} className="bg-[#0D1211] border border-[#1A2321] rounded-[14px] p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-[#38F28D] bg-[#0E3B2E] px-2.5 py-0.5 rounded-full">{item.tab}</span>
              </div>
              <p className="text-[#A7B0AD] text-sm leading-relaxed">{item.desc}</p>
              {item.note && <p className="text-[#A7B0AD]/50 text-xs mt-2">{item.note}</p>}
            </div>
          ))}
        </div>

        <Screenshot label="Business Settings — AI Knowledge Tab with Uploaded PDF" src="/guide-images/AI Knowledge Tab with Uploaded PDF.png" />

        <H2>2. Profile Settings</H2>
        <p className="text-[#A7B0AD]/60 text-xs uppercase tracking-wider mb-4">Your Account Identity</p>

        <P>This section is for your core account details and personal security. When you click on Profile Settings, you will see a clean overview of your Personal Information. By clicking the <B>"Edit"</B> button, you can update:</P>

        <div className="space-y-2 mb-6">
          <BLI accent><B>Full Name &amp; Business Name:</B> Update how you and your business are identified in the system.</BLI>
          <BLI accent><B>Service Phone:</B> If you ever need to migrate your AI to a brand new WhatsApp number, you can update the Service Phone here.</BLI>
        </div>

        <Note><B>Security Note:</B> To keep your account highly secure, your core <B>Email Address</B> and <B>Main Phone</B> (used for registration and billing) are set to "Read-only" and cannot be randomly changed.</Note>

        <Screenshot label="Profile Settings — Personal Information Edit View" src="/guide-images/Personal Information Edit View.png" />

        {/* Graduation banner */}
        <div className="mt-10 bg-gradient-to-br from-[#0A1F16] to-[#070A0A] border border-[#38F28D]/25
                        rounded-[22px] px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#38F28D]/3 blur-[60px] pointer-events-none" />
          <div className="relative">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-[#F2F5F4] text-2xl font-bold mb-2">You Are Now an Agentaria Master!</h2>
            <p className="text-[#A7B0AD] text-sm max-w-[480px] mx-auto leading-relaxed">
              You have successfully set up your digital employee, learned how to manage your Smart Inbox, and unlocked the secrets to scaling your marketing safely. Your business is now ready to operate faster, smarter, and 24/7.
            </p>
            <p className="text-[#38F28D] font-semibold mt-4 text-sm">Let's get to work! 🚀</p>
          </div>
        </div>
      </motion.div>
    ),
  },
];

// ─── Interactive Guide Page ────────────────────────────────────────────────────
export default function InteractiveGuide() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('intro');
  const activeSection = SECTIONS.find((s) => s.id === activeId);

  return (
    <div className="bg-[#070A0A] text-[#F2F5F4] min-h-screen overflow-x-hidden">
      <Navbar />

      {/* ── Top breadcrumb bar ── */}
      <div className="border-b border-[#1A2321] bg-[#070A0A]/90 backdrop-blur-sm sticky top-[65px] z-40">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate('/academy')}
            className="flex items-center gap-1.5 text-[#A7B0AD] hover:text-[#38F28D] transition-colors duration-150"
          >
            <ArrowLeft size={14} /> Academy
          </button>
          <ChevronRight size={12} className="text-[#1A2321]" />
          <span className="text-[#F2F5F4] font-medium">Interactive Setup Guide</span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10 flex gap-10 items-start">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────────── */}
        <aside className="w-[230px] flex-shrink-0 sticky top-[120px] hidden lg:block">

          {/* Guide label */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-[8px] bg-[#0E3B2E] flex items-center justify-center">
              <BookOpen size={14} className="text-[#38F28D]" />
            </div>
            <div>
              <p className="text-[#F2F5F4] text-xs font-bold">Setup Guide</p>
              <p className="text-[#A7B0AD] text-[10px]">How to Use Agentaria</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="space-y-1">
            {SECTIONS.map((section) => {
              const isActive = section.id === activeId;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveId(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[11px] text-left
                               transition-all duration-200 group
                               ${isActive
                                 ? 'bg-[#0E3B2E]/60 border border-[#38F28D]/25'
                                 : 'hover:bg-[#0D1211] border border-transparent'
                               }`}
                >
                  {/* Active indicator line */}
                  <div className={`w-0.5 h-full rounded-full transition-all duration-200
                                   ${isActive ? 'bg-[#38F28D]' : 'bg-transparent'}`} />
                  <section.icon
                    size={14}
                    className={`flex-shrink-0 transition-colors duration-200
                                ${isActive ? 'text-[#38F28D]' : 'text-[#A7B0AD]/60 group-hover:text-[#A7B0AD]'}`}
                  />
                  <span className={`text-xs font-medium leading-tight transition-colors duration-200
                                    ${isActive ? 'text-[#F2F5F4]' : 'text-[#A7B0AD]/70 group-hover:text-[#A7B0AD]'}`}>
                    {section.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-[#38F28D]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Progress */}
          <div className="mt-8 bg-[#0D1211] border border-[#1A2321] rounded-[14px] p-4">
            <p className="text-[#A7B0AD] text-[10px] uppercase tracking-wider mb-2">Progress</p>
            <div className="w-full h-1.5 bg-[#1A2321] rounded-full overflow-hidden mb-1.5">
              <motion.div
                className="h-full bg-[#38F28D] rounded-full"
                animate={{ width: `${((SECTIONS.findIndex(s => s.id === activeId) + 1) / SECTIONS.length) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[#A7B0AD] text-[10px]">
              {SECTIONS.findIndex(s => s.id === activeId) + 1} / {SECTIONS.length} sections
            </p>
          </div>
          
        </aside>

        {/* ── MOBILE NAV ────────────────────────────────────────────────────────── */}
        <div className="lg:hidden w-full mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveId(section.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-semibold
                             transition-all duration-200 whitespace-nowrap
                             ${section.id === activeId
                               ? 'bg-[#38F28D] text-[#070A0A]'
                               : 'bg-[#0D1211] border border-[#1A2321] text-[#A7B0AD]'
                             }`}
              >
                <section.icon size={11} />
                {section.id === 'intro' ? 'Intro' : `Ch ${SECTIONS.indexOf(section)}`}
              </button>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT ──────────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 pb-24">
          <AnimatePresence mode="wait">
            <React.Fragment key={activeId}>
              {activeSection?.content}
            </React.Fragment>
          </AnimatePresence>

          {/* ── Bottom chapter navigation ── */}
          <div className="flex items-center justify-between mt-16 pt-8 border-t border-[#1A2321]">
            {/* Prev */}
            {SECTIONS.findIndex(s => s.id === activeId) > 0 ? (
              <button
                onClick={() => {
                  const idx = SECTIONS.findIndex(s => s.id === activeId);
                  setActiveId(SECTIONS[idx - 1].id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 text-[#A7B0AD] hover:text-[#F2F5F4]
                           text-sm transition-colors duration-150 group"
              >
                <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>
                  <span className="block text-[10px] text-[#A7B0AD]/50 mb-0.5">Previous</span>
                  {SECTIONS[SECTIONS.findIndex(s => s.id === activeId) - 1].label}
                </span>
              </button>
            ) : <div />}

            {/* Next */}
            {SECTIONS.findIndex(s => s.id === activeId) < SECTIONS.length - 1 ? (
              <button
                onClick={() => {
                  const idx = SECTIONS.findIndex(s => s.id === activeId);
                  setActiveId(SECTIONS[idx + 1].id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 text-[#A7B0AD] hover:text-[#F2F5F4]
                           text-sm transition-colors duration-150 group text-right"
              >
                <span>
                  <span className="block text-[10px] text-[#A7B0AD]/50 mb-0.5">Next</span>
                  {SECTIONS[SECTIONS.findIndex(s => s.id === activeId) + 1].label}
                </span>
                <ChevronRight size={15} className="text-[#38F28D] group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/academy')}
                className="flex items-center gap-2 bg-[#38F28D] text-[#070A0A] font-semibold text-sm
                           px-5 py-2.5 rounded-[12px] hover:scale-[1.02]
                           hover:shadow-[0_0_20px_rgba(56,242,141,0.4)] transition-all duration-200"
              >
                Back to Academy <ChevronRight size={14} />
              </button>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
