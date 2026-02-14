import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#070A0A] text-[#F2F5F4] min-h-screen font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#070A0A]/80 backdrop-blur-xl border-b border-[#1A2321] z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl md:text-2xl font-bold tracking-tight cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-[#38F28D]">Agent</span>
            <span className="text-[#F2F5F4]">aria</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#A7B0AD] hover:text-[#38F28D] transition-colors duration-300 text-sm">Features</a>
            <a href="#how-it-works" className="text-[#A7B0AD] hover:text-[#38F28D] transition-colors duration-300 text-sm">How It Works</a>
            <a href="#pricing" className="text-[#A7B0AD] hover:text-[#38F28D] transition-colors duration-300 text-sm">Pricing</a>
            <a href="#faq" className="text-[#A7B0AD] hover:text-[#38F28D] transition-colors duration-300 text-sm">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/login')}
              className="text-[#A7B0AD] hover:text-[#F2F5F4] transition-colors duration-300 px-4 py-2 text-sm"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-[#38F28D] text-[#070A0A] px-5 py-2 rounded-[14px] font-semibold hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(56,242,141,0.3)] transition-all duration-300 text-sm"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 md:pt-32 pb-16 md:pb-20 px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-[#0E3B2E]/20 rounded-full blur-[120px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <motion.div 
              className="space-y-6 md:space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-4 py-2 bg-[#0D1211] border border-[#1A2321] rounded-full text-xs md:text-sm text-[#38F28D]">
                ✨ AI-Powered WhatsApp Automation
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                Turn Your
                <span className="block text-[#38F28D] mt-2">WhatsApp</span>
                Into a Business
                <span className="block">Engine</span>
              </h1>
              
              <p className="text-base md:text-lg text-[#A7B0AD] leading-relaxed max-w-[500px]">
                Automate conversations, re-engage old clients, and collect reviews—all while keeping human control where it matters.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => navigate('/signup')}
                  className="bg-[#38F28D] text-[#070A0A] px-6 md:px-8 py-3 md:py-4 rounded-[14px] font-semibold text-base md:text-lg hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(56,242,141,0.4)] transition-all duration-300"
                >
                  Start 3-Day Free Trial
                </button>
                <button className="border-2 border-[#1A2321] text-[#F2F5F4] px-6 md:px-8 py-3 md:py-4 rounded-[14px] font-semibold text-base md:text-lg hover:border-[#38F28D] hover:shadow-[0_0_20px_rgba(56,242,141,0.2)] transition-all duration-300">
                  Watch Demo
                </button>
              </div>
              
              <div className="flex items-center gap-6 pt-4 text-xs md:text-sm text-[#A7B0AD]">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#38F28D]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No credit card
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#38F28D]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Setup in 5 minutes
                </div>
              </div>
            </motion.div>
            
            {/* WhatsApp Mock Device */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-[#0D1211] border border-[#1A2321] rounded-[20px] md:rounded-[24px] p-3 md:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                {/* Phone Header */}
                <div className="bg-[#0E3B2E] rounded-t-[16px] md:rounded-t-[20px] px-4 md:px-6 py-3 md:py-4 flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#38F28D]/20 flex items-center justify-center text-[#38F28D] font-bold text-sm md:text-base">
                    A
                  </div>
                  <div>
                    <div className="font-semibold text-xs md:text-sm">Agentaria Assistant</div>
                    <div className="text-[10px] md:text-xs text-[#A7B0AD]">Online</div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="bg-[#070A0A] rounded-b-[16px] md:rounded-b-[20px] p-4 md:p-6 space-y-3 md:space-y-4 min-h-[300px] md:min-h-[400px]">
                  <motion.div 
                    className="flex justify-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <div className="bg-[#0D1211] border border-[#1A2321] rounded-[14px] rounded-tl-none px-3 md:px-4 py-2 md:py-3 max-w-[80%]">
                      <p className="text-xs md:text-sm text-[#A7B0AD]">Hi! I'd like to book a cleaning service for next week.</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-end"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                  >
                    <div className="bg-[#0E3B2E] rounded-[14px] rounded-tr-none px-3 md:px-4 py-2 md:py-3 max-w-[80%]">
                      <p className="text-xs md:text-sm text-[#F2F5F4]">Great! I can help you with that. What type of space needs cleaning?</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    <div className="bg-[#0D1211] border border-[#1A2321] rounded-[14px] rounded-tl-none px-3 md:px-4 py-2 md:py-3 max-w-[80%]">
                      <p className="text-xs md:text-sm text-[#A7B0AD]">It's a 3-bedroom apartment, about 1200 sq ft.</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-end"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                  >
                    <div className="bg-[#0E3B2E] rounded-[14px] rounded-tr-none px-3 md:px-4 py-2 md:py-3 max-w-[80%]">
                      <p className="text-xs md:text-sm text-[#F2F5F4]">Perfect! For a 3-bedroom apartment, our deep cleaning service is $180.</p>
                    </div>
                  </motion.div>
                  
                  <div className="text-center pt-4">
                    <span className="inline-block px-3 md:px-4 py-1 bg-[#38F28D]/10 text-[#38F28D] text-[10px] md:text-xs rounded-full">
                      AI handling conversation automatically
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Pricing */}
      <PricingSection navigate={navigate} />

      {/* FAQ */}
      <FAQSection />

      {/* CTA Section */}
      <CTASection navigate={navigate} />

      {/* Footer */}
      <Footer />

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Sora', system-ui, -apple-system, sans-serif;
        }
      `}</style>
    </div>
  );
};

// Features Section Component
const FeaturesSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: "💬",
      title: "Chat Assistant",
      description: "AI handles incoming messages using your business knowledge. Brings leads to decision point, then hands over to you.",
      features: ["RAG-based responses", "Smart handover detection", "No booking/payment handling"]
    },
    {
      icon: "🔄",
      title: "Client Re-Opener",
      description: "Upload CSV of old clients. Send safe, human-style opener messages. Re-engage lost opportunities automatically.",
      features: ["Simple 3-field CSV", "Timing controls", "No spam, no follow-ups"]
    },
    {
      icon: "⭐",
      title: "Review Handler",
      description: "Ask for feedback first. Positive → review link. Negative → forwarded to you. Protect your reputation.",
      features: ["Feedback-first approach", "Private issue handling", "Clean public reviews"]
    }
  ];

  return (
    <section id="features" className="py-16 md:py-20 px-6 relative" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Three Core Services</h2>
          <p className="text-base md:text-lg lg:text-xl text-[#A7B0AD] max-w-[600px] mx-auto">
            Everything you need to automate WhatsApp while staying in control
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              className="bg-[#0D1211] border border-[#1A2321] rounded-[16px] md:rounded-[18px] p-6 md:p-8 hover:border-[#38F28D]/30 hover:shadow-[0_8px_30px_rgba(56,242,141,0.1)] transition-all duration-500 group"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <div className="text-4xl md:text-5xl mb-4 md:mb-6">{feature.icon}</div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 group-hover:text-[#38F28D] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-sm md:text-base text-[#A7B0AD] mb-4 md:mb-6 leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-2 md:space-y-3">
                {feature.features.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 md:gap-3 text-xs md:text-sm text-[#A7B0AD]">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-[#38F28D] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Section Component
const HowItWorksSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const steps = [
    {
      step: "01",
      title: "Sign Up & Connect",
      description: "Create account, choose your plan, scan QR code to connect WhatsApp. Takes 2 minutes.",
      align: "left"
    },
    {
      step: "02",
      title: "Configure Your Business",
      description: "Upload business instructions, set working hours, customize AI behavior. One-time setup.",
      align: "right"
    },
    {
      step: "03",
      title: "Go Live",
      description: "AI starts handling chats immediately. You get notified for handovers. Stay in control.",
      align: "left"
    },
    {
      step: "04",
      title: "Scale & Optimize",
      description: "Upload old client lists, launch campaigns, collect reviews. Grow on autopilot.",
      align: "right"
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-20 px-6 bg-[#0D1211]" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-base md:text-lg lg:text-xl text-[#A7B0AD] max-w-[600px] mx-auto">
            Get started in minutes, not hours
          </p>
        </motion.div>
        
        <div className="relative">
          {/* Timeline Line */}
          <motion.div 
            className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#38F28D] to-transparent hidden md:block"
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{ transformOrigin: 'top' }}
          />
          
          <div className="space-y-12 md:space-y-16">
            {steps.map((item, idx) => (
              <motion.div
                key={idx}
                className={`flex items-center gap-6 md:gap-8 ${item.align === 'right' ? 'md:flex-row-reverse' : ''}`}
                initial={{ opacity: 0, x: item.align === 'right' ? 50 : -50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
              >
                <div className={`flex-1 ${item.align === 'right' ? 'md:text-right' : ''}`}>
                  <div className="bg-[#070A0A] border border-[#1A2321] rounded-[16px] md:rounded-[18px] p-6 md:p-8 hover:border-[#38F28D]/30 transition-all duration-500">
                    <div className="text-4xl md:text-6xl font-bold text-[#38F28D]/20 mb-3 md:mb-4">{item.step}</div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">{item.title}</h3>
                    <p className="text-sm md:text-base text-[#A7B0AD] leading-relaxed">{item.description}</p>
                  </div>
                </div>
                
                <motion.div 
                  className="hidden md:block w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#38F28D] flex-shrink-0 relative z-10 shadow-[0_0_20px_rgba(56,242,141,0.5)]"
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: idx * 0.15 + 0.3 }}
                >
                  <div className="absolute inset-0 rounded-full bg-[#38F28D] animate-ping opacity-20"></div>
                </motion.div>
                
                <div className="flex-1 hidden md:block"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Pricing Section Component
const PricingSection = ({ navigate }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="pricing" className="py-16 md:py-20 px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-base md:text-lg lg:text-xl text-[#A7B0AD] max-w-[600px] mx-auto">
            Start free, scale when ready
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Starter Trial Card */}
          <motion.div 
            className="bg-[#0D1211] border border-[#1A2321] rounded-[16px] md:rounded-[18px] p-6 md:p-8 hover:border-[#38F28D]/30 hover:shadow-[0_8px_30px_rgba(56,242,141,0.1)] transition-all duration-500"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="text-sm font-semibold text-[#38F28D] mb-2">STARTER TRIAL</div>
            <div className="text-3xl md:text-4xl font-bold mb-2">
              Free
              <span className="text-base md:text-lg text-[#A7B0AD] font-normal"> (3 Days)</span>
            </div>
            <div className="text-xs md:text-sm text-[#A7B0AD] mb-6 md:mb-8">Test the full power of automation</div>
            
            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              {[
                "Full Access to All 3 Agents",
                "1 WhatsApp Number",
                "Unlimited Features for 3 Days",
                "No Credit Card Required"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 md:gap-3 text-sm md:text-base text-[#A7B0AD]">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#38F28D] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            
            <button 
              onClick={() => navigate('/signup')}
              className="w-full border-2 border-[#38F28D] text-[#38F28D] py-3 rounded-[12px] md:rounded-[14px] font-semibold text-sm md:text-base hover:bg-[#38F28D] hover:text-[#070A0A] transition-all duration-300"
            >
              Start Free Trial
            </button>
          </motion.div>
          
          {/* Pro Business Card */}
          <motion.div 
            className="bg-gradient-to-br from-[#0E3B2E] to-[#0D1211] border-2 border-[#38F28D] rounded-[16px] md:rounded-[18px] p-6 md:p-8 relative overflow-hidden shadow-[0_8px_30px_rgba(56,242,141,0.2)]"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="absolute top-4 right-4 bg-[#38F28D] text-[#070A0A] text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full">
              POPULAR
            </div>
            
            <div className="text-sm font-semibold text-[#38F28D] mb-2">PRO BUSINESS</div>
            <div className="text-3xl md:text-4xl font-bold mb-2">
              $59
              <span className="text-base md:text-lg text-[#A7B0AD] font-normal">/month</span>
            </div>
            <div className="text-xs md:text-sm text-[#A7B0AD] mb-6 md:mb-8">For growing service businesses</div>
            
            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              {[
                "Everything in Starter",
                "1 WhatsApp Number",
                "Unlimited Validity (No time limit)",
                "Priority Support",
                "Cancel Anytime"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 md:gap-3 text-sm md:text-base text-[#F2F5F4]">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#38F28D] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            
            <button 
              onClick={() => navigate('/signup')}
              className="w-full bg-[#38F28D] text-[#070A0A] py-3 rounded-[12px] md:rounded-[14px] font-semibold text-sm md:text-base hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(56,242,141,0.4)] transition-all duration-300"
            >
              Get Started
            </button>
          </motion.div>
        </div>
        
        <motion.div 
          className="text-center mt-8 md:mt-12"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-sm md:text-base text-[#A7B0AD]">
            Need more? <a href="#" className="text-[#38F28D] hover:underline">Contact us for Enterprise pricing</a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// FAQ Section Component
const FAQSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const faqs = [
    {
      q: "Does Agentaria replace my team?",
      a: "No. Agentaria handles routine conversations and brings leads to the decision point. You or your team always finalize bookings, payments, and important decisions."
    },
    {
      q: "Will my WhatsApp account get banned?",
      a: "Agentaria follows WhatsApp's policies strictly. We use safe timing, human-like messages, and never spam. Our Client Re-Opener system is specifically designed to avoid violations."
    },
    {
      q: "How does the 3-day trial work?",
      a: "Start completely free for 3 days. Full access to all features. No credit card required. Cancel anytime."
    },
    {
      q: "Can I use my existing WhatsApp Business number?",
      a: "Yes! Connect any WhatsApp number via QR code. Your existing chats and contacts remain untouched."
    },
    {
      q: "What happens when AI can't handle a conversation?",
      a: "The system detects uncertainty and immediately hands over to you with a summary. You never lose control."
    }
  ];

  return (
    <section id="faq" className="py-16 md:py-20 px-6 bg-[#0D1211]" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Common Questions</h2>
        </motion.div>
        
        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, idx) => (
            <motion.details
              key={idx}
              className="bg-[#070A0A] border border-[#1A2321] rounded-[12px] md:rounded-[14px] p-4 md:p-6 group hover:border-[#38F28D]/30 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <summary className="font-semibold text-base md:text-lg cursor-pointer flex justify-between items-center">
                {faq.q}
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#38F28D] group-open:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="text-sm md:text-base text-[#A7B0AD] mt-3 md:mt-4 leading-relaxed">{faq.a}</p>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section Component
const CTASection = ({ navigate }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-16 md:py-20 px-6 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0E3B2E]/30 to-transparent"></div>
      
      <motion.div 
        className="max-w-7xl mx-auto text-center relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
          Ready to Automate Your WhatsApp?
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-[#A7B0AD] mb-6 md:mb-8 max-w-[600px] mx-auto">
          Join service businesses already using Agentaria to handle more conversations with less effort.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/signup')}
            className="bg-[#38F28D] text-[#070A0A] px-8 md:px-10 py-3 md:py-4 rounded-[14px] md:rounded-[16px] font-semibold text-base md:text-lg hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(56,242,141,0.4)] transition-all duration-300"
          >
            Start 3-Day Free Trial
          </button>
          <button className="border-2 border-[#1A2321] text-[#F2F5F4] px-8 md:px-10 py-3 md:py-4 rounded-[14px] md:rounded-[16px] font-semibold text-base md:text-lg hover:border-[#38F28D] hover:shadow-[0_0_20px_rgba(56,242,141,0.2)] transition-all duration-300">
            Schedule Demo
          </button>
        </div>
        
        <p className="text-xs md:text-sm text-[#A7B0AD] mt-4 md:mt-6">
          No credit card required • 3-day free trial • Cancel anytime
        </p>
      </motion.div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  const navigate = useNavigate();
  
  return (
    <footer className="border-t border-[#1A2321] py-10 md:py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="text-xl md:text-2xl font-bold mb-3 md:mb-4 cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-[#38F28D]">Agent</span>
              <span className="text-[#F2F5F4]">aria</span>
            </div>
            <p className="text-[#A7B0AD] text-xs md:text-sm">
              Human-first WhatsApp automation for growing businesses.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Product</h4>
            <ul className="space-y-2 text-xs md:text-sm text-[#A7B0AD]">
              <li><a href="#features" className="hover:text-[#38F28D] transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-[#38F28D] transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-[#38F28D] transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-[#38F28D] transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Company</h4>
            <ul className="space-y-2 text-xs md:text-sm text-[#A7B0AD]">
              <li><a href="#" className="hover:text-[#38F28D] transition-colors">About</a></li>
              <li><a href="#" className="hover:text-[#38F28D] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#38F28D] transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-[#38F28D] transition-colors">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Legal</h4>
            <ul className="space-y-2 text-xs md:text-sm text-[#A7B0AD]">
              <li><a href="#" className="hover:text-[#38F28D] transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-[#38F28D] transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-[#38F28D] transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#1A2321] pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-[#A7B0AD]">
          <p>© 2026 Agentaria. All rights reserved.</p>
          <div className="flex gap-4 md:gap-6">
            <a href="#" className="hover:text-[#38F28D] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[#38F28D] transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-[#38F28D] transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingPage;
