import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features',    href: '/#features'      },
  { label: 'How It Works',href: '/#how-it-works'  },
  { label: 'Pricing',     href: '/pricing'         },
  { label: 'Academy',     href: '/academy'         },
];

const Logo = ({ onClick }) => (
  <div
    className="relative text-xl md:text-2xl font-bold tracking-tight cursor-pointer select-none group inline-block"
    onClick={onClick}
  >
    <span className="text-[#F2F5F4]">Agentaria</span>
    <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-[#38F28D] to-transparent rounded-full shadow-[0_0_8px_rgba(56,242,141,0.5)]"></div>
  </div>
);

export default function Navbar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [scrolled, setScrolled]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleNavClick = (href) => {
    if (href.startsWith('/#')) {
      // Same-page anchor: go home then scroll
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.querySelector(href.slice(1));
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        const el = document.querySelector(href.slice(1));
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <>
      {/* ── Desktop / Tablet Bar ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#070A0A]/95 backdrop-blur-xl border-b border-[#1A2321] shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <Logo onClick={() => navigate('/')} />

          {/* Center links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-[#A7B0AD] hover:text-[#38F28D] transition-colors duration-300 text-sm font-medium"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-[#A7B0AD] hover:text-[#F2F5F4] transition-colors duration-300 px-4 py-2 text-sm font-medium"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-[#38F28D] text-[#070A0A] px-5 py-2.5 rounded-[14px] font-semibold text-sm
                         hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(56,242,141,0.35)]
                         transition-all duration-300 flex items-center gap-1.5"
            >
              Start Free Trial <ChevronRight size={14} />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-xl border border-[#1A2321] text-[#A7B0AD]
                       hover:text-[#38F28D] hover:border-[#38F28D]/30 transition-all duration-200"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>
      </motion.nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-72 z-50 md:hidden
                         bg-[#0D1211] border-l border-[#1A2321] flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#1A2321]">
                <Logo onClick={() => { navigate('/'); setMobileOpen(false); }} />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl border border-[#1A2321] text-[#A7B0AD] hover:text-[#38F28D]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav links */}
              <div className="flex flex-col gap-1 px-4 pt-6 flex-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.button
                    key={link.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => handleNavClick(link.href)}
                    className="text-left text-[#A7B0AD] hover:text-[#38F28D] hover:bg-[#1A2321]/50
                               px-4 py-3 rounded-[12px] text-sm font-medium transition-all duration-200"
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>

              {/* Auth buttons */}
              <div className="px-4 pb-8 space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-[14px] border border-[#1A2321] text-[#A7B0AD]
                             hover:border-[#38F28D]/30 hover:text-[#F2F5F4] text-sm font-medium transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full py-3 rounded-[14px] bg-[#38F28D] text-[#070A0A] font-semibold text-sm
                             hover:shadow-[0_0_20px_rgba(56,242,141,0.4)] transition-all"
                >
                  Start Free Trial
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
