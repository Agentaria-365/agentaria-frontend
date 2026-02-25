import React from 'react';
import { useNavigate } from 'react-router-dom';

const LINKS = {
  Product:  ['Features', 'Pricing', 'Academy', 'Changelog'],
  Company:  ['About', 'Contact', 'Privacy Policy', 'Terms of Service'],
  Dashboard: ['Login', 'Sign Up', 'Reset Password'],
};

const ROUTES = {
  Features: '/#features', Pricing: '/pricing', Academy: '/academy',
  Login: '/login', 'Sign Up': '/signup', 'Reset Password': '/reset-password',
};

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const go = (label) => {
    const route = ROUTES[label];
    if (route) navigate(route);
  };

  return (
    <footer className="border-t border-[#1A2321] bg-[#070A0A] px-6 pt-16 pb-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-2xl font-bold mb-4">
              <span className="text-[#38F28D]">Agent</span>
              <span className="text-[#F2F5F4]">aria</span>
            </div>
            <p className="text-[#A7B0AD] text-sm leading-relaxed max-w-[200px]">
              WhatsApp automation for service businesses. AI-assisted, human-first.
            </p>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p className="text-[#F2F5F4] font-semibold text-sm mb-5">{group}</p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => go(item)}
                      className="text-[#A7B0AD] text-sm hover:text-[#38F28D] transition-colors duration-200"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#1A2321] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#A7B0AD] text-sm">© {year} Agentaria. All rights reserved.</p>
          <p className="text-[#A7B0AD] text-sm">
            Built for <span className="text-[#38F28D]">growing businesses</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
