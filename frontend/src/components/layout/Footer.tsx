import Link from 'next/link';
import Image from 'next/image';
import {
  Heart, Phone, Mail, MapPin,
  Facebook, Twitter, Instagram, Linkedin, Youtube
} from 'lucide-react';

const footerLinks = {
  services: [
    { label: 'Individual Therapy', href: '/services/individual-therapy' },
    { label: 'Couples Therapy', href: '/services/couples-therapy' },
    { label: 'Psychiatric Consultation', href: '/services/psychiatric-consultation' },
    { label: 'Online Therapy', href: '/services/online-therapy' },
    { label: 'Corporate Wellness', href: '/corporate' },
    { label: 'Group Therapy', href: '/services/group-therapy' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Team', href: '/about#team' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Webinars', href: '/webinars' },
    { label: 'Contact', href: '/contact' },
    { label: 'Corporate — Join Us', href: '/corporate-join' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'AI Disclaimer', href: '/ai-disclaimer' },
    { label: 'Data Protection', href: '/data-protection' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-navy-700 text-white">
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-navy-600 to-navy-700 border-b border-navy-500/50">
        <div className="container-custom py-16 text-center">
          <h2 className="heading-2 text-white mb-4">
            Ready to Start Your <span className="text-gold-400">Healing Journey</span>?
          </h2>
          <p className="text-navy-300 text-lg mb-8 max-w-2xl mx-auto">
            Take the first step towards better mental health. Our team of experienced
            professionals is here to support you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/book" className="btn-gold text-base px-8 py-4">
              Book a Session Today
            </Link>
            <Link href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-navy-900 text-base px-8 py-4">
              Talk to Us
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <Image src="/logo.jpeg" alt="LifeLink Logo" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xl font-display font-bold text-white">
                  LIFE<span className="text-gold-400">LINK</span>
                </span>
                <p className="text-[10px] tracking-wider uppercase text-navy-400">
                  Mental Medical Center
                </p>
              </div>
            </Link>
            <p className="text-navy-300 mb-6 max-w-sm leading-relaxed">
              Kenya&apos;s premier mental and medical healthcare center. We combine clinical
              excellence with compassionate care to transform lives across East Africa.
            </p>
            <div className="space-y-3">
              <a href="tel:+254700000000" className="flex items-center gap-3 text-navy-300 hover:text-gold-400 transition-colors">
                <Phone size={16} /> +254 700 000 000
              </a>
              <a href="mailto:info@lifelink.co.ke" className="flex items-center gap-3 text-navy-300 hover:text-gold-400 transition-colors">
                <Mail size={16} /> info@lifelink.co.ke
              </a>
              <div className="flex items-center gap-3 text-navy-300">
                <MapPin size={16} /> Nairobi, Kenya
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-navy-300 hover:text-gold-400 transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-navy-300 hover:text-gold-400 transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-navy-300 hover:text-gold-400 transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social & Bottom */}
        <div className="border-t border-navy-700/50 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-navy-400 text-sm">
            &copy; {new Date().getFullYear()} LifeLink Mental Wellness Solution. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { Icon: Facebook, href: '#' },
              { Icon: Twitter, href: '#' },
              { Icon: Instagram, href: '#' },
              { Icon: Linkedin, href: '#' },
              { Icon: Youtube, href: '#' },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="w-9 h-9 rounded-full border border-navy-700 flex items-center justify-center text-navy-400 hover:bg-gold-400 hover:text-navy-900 hover:border-gold-400 transition-all"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Corporate CTA Banner */}
        <div className="mt-8 p-4 rounded-xl bg-gold-400/10 border border-gold-400/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-navy-300 text-sm">
            <strong className="text-gold-400">🏢 Corporate Wellness Partner</strong>{' '}
            — Empower your workforce with professional mental health support.
          </p>
          <Link href="/corporate-join" className="whitespace-nowrap text-sm font-semibold px-5 py-2 rounded-lg bg-gold-400 text-navy-900 hover:bg-gold-500 transition-colors">
            Join Us
          </Link>
        </div>

        {/* Emergency Banner */}
        <div className="mt-4 p-4 rounded-xl bg-red-900/20 border border-red-800/30 text-center">
          <p className="text-red-300 text-sm">
            <strong>🆘 In a mental health crisis?</strong>{' '}
            Call our 24/7 helpline: <a href="tel:+254700000000" className="text-red-200 underline font-semibold">+254 700 000 000</a>{' '}
            or visit our <Link href="/emergency" className="text-red-200 underline font-semibold">Emergency Help Page</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
