'use client';

import { useState } from 'react';
import { FadeUp, AnimateInView } from '@/components/ui/LazyMotion';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(r => setTimeout(r, 1500));
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="pt-32">
      <section className="container-custom pb-16">
        <FadeUp>
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Contact Us</span>
          <h1 className="heading-1 text-navy-800 mt-3 mb-4">
            Get in <span className="text-gold-500">Touch</span>
          </h1>
          <p className="text-lg text-charcoal-600 max-w-2xl">
            We&apos;re here to help. Reach out to us for appointments, inquiries, or partnership opportunities.
          </p>
        </FadeUp>
      </section>

      <section className="container-custom pb-24">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <AnimateInView animation="fade-left" className="space-y-6">
            {[
              { icon: Phone, title: 'Phone', lines: ['+254724 927304', '+254724 927304'], href: 'tel:+254724 927304' },
              { icon: Mail, title: 'Email', lines: ['info@lifelink.co.ke', 'appointments@lifelink.co.ke'], href: 'mailto:info@lifelink.co.ke' },
              { icon: MapPin, title: 'Location', lines: ['LifeLink Mental Wellness Solution', 'Westlands, Nairobi, Kenya'] },
              { icon: Clock, title: 'Hours', lines: ['Mon - Fri: 8:00 AM - 8:00 PM', 'Sat: 9:00 AM - 5:00 PM', 'Sun: Emergency Only'] },
            ].map((item, i) => (
              <div key={i} className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                    <item.icon size={20} className="text-navy-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-800 mb-1">{item.title}</h3>
                    {item.lines.map((line, j) => (
                      <p key={j} className="text-charcoal-500 text-sm">{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Emergency */}
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
              <h3 className="font-semibold text-red-700 mb-2">🆘 Crisis Support</h3>
              <p className="text-red-600 text-sm mb-2">
                If you or someone you know is in immediate danger, please call our 24/7 helpline:
              </p>
              <a href="tel:+254724 927304" className="text-red-700 font-bold text-lg hover:underline">
                +254724 927304
              </a>
            </div>
          </AnimateInView>

          {/* Contact Form */}
          <AnimateInView className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="heading-3 text-navy-800 mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">Full Name *</label>
                    <input type="text" required className="input-field" placeholder="Your name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">Email *</label>
                    <input type="email" required className="input-field" placeholder="your@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">Phone</label>
                    <input type="tel" className="input-field" placeholder="+254 7XX XXX XXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">Subject *</label>
                    <select className="input-field" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                      <option value="">Select subject</option>
                      <option value="appointment">Book Appointment</option>
                      <option value="inquiry">General Inquiry</option>
                      <option value="corporate">Corporate Partnership</option>
                      <option value="feedback">Feedback</option>
                      <option value="careers">Careers</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">Message *</label>
                  <textarea rows={5} required className="input-field resize-none" placeholder="How can we help you?" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-gold gap-2">
                  {isSubmitting ? 'Sending...' : (<><Send size={18} /> Send Message</>)}
                </button>
              </form>
            </div>
          </AnimateInView>
        </div>
      </section>
    </div>
  );
}
