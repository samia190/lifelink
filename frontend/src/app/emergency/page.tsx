'use client';

import { FadeUp } from '@/components/ui/LazyMotion';
import Link from 'next/link';
import { Phone, AlertTriangle, Heart, Shield, ExternalLink } from 'lucide-react';

const emergencyContacts = [
  { name: 'LifeLink Crisis Helpline', phone: '+254724 927304', available: '24/7', primary: true },
  { name: 'Kenya Red Cross', phone: '1199', available: '24/7' },
  { name: 'Befrienders Kenya', phone: '+254 722 178 177', available: '24/7' },
  { name: 'Kenya National Police', phone: '999 / 112', available: '24/7' },
  { name: 'GBV Helpline (FIDA Kenya)', phone: '0800 720 990', available: '24/7' },
];

export default function EmergencyPage() {
  return (
    <div className="pt-24 min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Urgent Banner */}
      <div className="bg-red-600 text-white py-4">
        <div className="container-custom text-center">
          <p className="font-semibold flex items-center justify-center gap-2">
            <AlertTriangle size={20} />
            If you are in immediate danger, call 999 or go to your nearest hospital
          </p>
        </div>
      </div>

      <section className="container-custom section-padding">
        <FadeUp className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="heading-1 text-red-700 mb-4">
              🆘 Emergency Help
            </h1>
            <p className="text-lg text-charcoal-600">
              You are not alone. Help is available right now. If you or someone you know
              is in a mental health crisis, please reach out immediately.
            </p>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-4 mb-12">
            {emergencyContacts.map((contact, i) => (
              <FadeUp
                key={i}
                delay={i}
              >
              <a
                href={`tel:${contact.phone.replace(/\s/g, '')}`}
                className={`block p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                  contact.primary
                    ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                    : 'bg-white border-red-200 hover:border-red-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Phone size={24} className={contact.primary ? 'text-white' : 'text-red-600'} />
                    <div>
                      <h3 className={`font-semibold text-lg ${contact.primary ? 'text-white' : 'text-navy-800'}`}>
                        {contact.name}
                      </h3>
                      <p className={`text-2xl font-bold ${contact.primary ? 'text-red-100' : 'text-red-600'}`}>
                        {contact.phone}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    contact.primary ? 'bg-red-500 text-white' : 'bg-green-100 text-green-700'
                  }`}>
                    {contact.available}
                  </span>
                </div>
              </a>
              </FadeUp>
            ))}
          </div>

          {/* Safety Tips */}
          <div className="card p-8 mb-8">
            <h2 className="heading-3 text-navy-800 mb-6 flex items-center gap-2">
              <Shield size={24} className="text-gold-500" /> While You Wait
            </h2>
            <div className="space-y-4">
              {[
                'Stay in a safe place — move away from anything that could harm you',
                'Call or text someone you trust — a friend, family member, or counselor',
                'Practice deep breathing: inhale 4 seconds, hold 4 seconds, exhale 4 seconds',
                'Remember: this feeling is temporary. You have survived difficult moments before',
                'Do not use alcohol or drugs to cope',
                'If someone else is in danger, stay with them and call for help',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Heart size={16} className="text-red-500 mt-1 flex-shrink-0" />
                  <p className="text-charcoal-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reassurance */}
          <div className="text-center p-8 bg-navy-50 rounded-2xl">
            <h3 className="font-display text-xl font-semibold text-navy-800 mb-3">
              You Matter. You Are Not Alone.
            </h3>
            <p className="text-charcoal-600 mb-6">
              Reaching out for help is a sign of strength. Our professional team at LifeLink
              is ready to support you through this moment and beyond.
            </p>
            <Link href="/book" className="btn-primary">
              Schedule a Confidential Session
            </Link>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
