'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';
import { useChatStore } from '@/lib/store';
import {
  Menu, X, Phone, ChevronDown, User, LogOut,
  Calendar, MessageCircle, LayoutDashboard
} from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/' },
  {
    label: 'Services', href: '/services',
    children: [
      { label: 'Individual Therapy', href: '/services/individual-therapy' },
      { label: 'Couples Therapy', href: '/services/couples-therapy' },
      { label: 'Psychiatric Consultation', href: '/services/psychiatric-consultation' },
      { label: 'Online Therapy', href: '/services/online-therapy' },
      { label: 'All Services', href: '/services' },
    ],
  },
  { label: 'Corporate Wellness', href: '/corporate' },
  { label: 'Webinars', href: '/webinars' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggle: toggleChat } = useChatStore();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardLink = useCallback(() => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SUPER_ADMIN': case 'ADMIN': return '/dashboard/admin';
      case 'DOCTOR': case 'THERAPIST': return '/dashboard/doctor';
      case 'CORPORATE_MANAGER': return '/dashboard/corporate';
      default: return '/dashboard/patient';
    }
  }, [user]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-charcoal-200/20'
          : 'bg-transparent'
      }`}
    >
      {/* Top bar */}
      <div className={`transition-all duration-300 ${isScrolled ? 'h-0 overflow-hidden' : 'h-auto'}`}>
        <div className="bg-navy-700 text-white text-sm">
          <div className="container-custom flex items-center justify-between py-2">
            <div className="flex items-center gap-4">
              <a href="tel:+254724 927304" className="flex items-center gap-1 hover:text-gold-400 transition-colors">
                <Phone size={14} />
                <span>+254724 927304</span>
              </a>
              <span className="hidden sm:inline text-navy-400">|</span>
              <span className="hidden sm:inline text-navy-300">24/7 Crisis Support Available</span>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/emergency" className="text-red-400 hover:text-red-300 font-semibold transition-colors">
                🆘 Emergency Help
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" prefetch={true}>
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <Image src="/logo.jpeg" alt="LifeLink Logo" width={40} height={40} className="w-full h-full object-cover" priority />
            </div>
            <div>
              <span className={`text-xl font-display font-bold ${isScrolled ? 'text-navy-800' : 'text-navy-800'}`}>
                LIFE<span className="text-gold-500">LINK</span>
              </span>
              <p className={`text-[10px] tracking-wider uppercase leading-none ${isScrolled ? 'text-charcoal-500' : 'text-charcoal-500'}`}>
                Mental Wellness Solution
              </p>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.children && setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1
                    ${isScrolled ? 'text-charcoal-700 hover:text-navy-700 hover:bg-navy-50' : 'text-charcoal-700 hover:text-navy-700 hover:bg-navy-50'}`}
                  prefetch={false}
                >
                  {link.label}
                  {link.children && <ChevronDown size={14} />}
                </Link>

                {/* Dropdown — CSS transition instead of AnimatePresence */}
                {link.children && (
                  <div
                    className={`absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl shadow-charcoal-200/40 border border-charcoal-100 overflow-hidden transition-all duration-200 origin-top ${
                      openDropdown === link.label
                        ? 'opacity-100 scale-100 pointer-events-auto'
                        : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-3 text-sm text-charcoal-700 hover:bg-navy-50 hover:text-navy-700 transition-colors"
                        prefetch={false}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button onClick={toggleChat} className="btn-ghost text-sm gap-2" title="AI Chat">
              <MessageCircle size={18} />
              Chat
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href={getDashboardLink()} className="btn-ghost text-sm gap-2">
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-navy-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-navy-700 text-white flex items-center justify-center text-sm font-semibold">
                      {user?.profile?.firstName?.[0] || 'U'}
                    </div>
                    <ChevronDown size={14} />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-charcoal-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link href={getDashboardLink()} className="flex items-center gap-2 px-4 py-3 text-sm text-charcoal-700 hover:bg-navy-50">
                      <User size={16} /> Profile
                    </Link>
                    <Link href="/appointments" className="flex items-center gap-2 px-4 py-3 text-sm text-charcoal-700 hover:bg-navy-50">
                      <Calendar size={16} /> Appointments
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">Log In</Link>
                <Link href="/book" className="btn-gold text-sm" prefetch={true}>Book Session</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-navy-50 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — CSS transition instead of framer-motion */}
      <div
        className={`lg:hidden bg-white border-t border-charcoal-100 shadow-lg overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-custom py-4 space-y-2">
          {navLinks.map((link) => (
            <div key={link.label}>
              <Link
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-lg text-charcoal-700 hover:bg-navy-50 font-medium"
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="pl-8 space-y-1">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-sm text-charcoal-500 hover:text-navy-700"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <hr className="border-charcoal-100" />
          {isAuthenticated ? (
            <>
              <Link href={getDashboardLink()} className="block px-4 py-3 text-navy-700 font-medium" onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
              <button onClick={() => { logout(); setIsOpen(false); }} className="block px-4 py-3 text-red-600 font-medium w-full text-left">
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3 px-4 pt-2">
              <Link href="/login" className="btn-outline flex-1 text-center text-sm" onClick={() => setIsOpen(false)}>Log In</Link>
              <Link href="/book" className="btn-gold flex-1 text-center text-sm" onClick={() => setIsOpen(false)}>Book Session</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
