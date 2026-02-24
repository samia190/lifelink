'use client';

import { FadeUp, AnimateInView } from '@/components/ui/LazyMotion';
import Link from 'next/link';
import {
  Heart, Shield, Users, Award, Globe, Target,
  CheckCircle, ArrowRight
} from 'lucide-react';

const team = [
  { name: 'Dr. Wanjiku Kamau', role: 'Lead Psychiatrist', specialty: 'Depression & Anxiety', experience: '12 years' },
  { name: 'Dr. Brian Odhiambo', role: 'Clinical Psychologist', specialty: 'Trauma & PTSD', experience: '8 years' },
  { name: 'Dr. Grace Mwangi', role: 'Family Therapist', specialty: 'Family & Child Psychology', experience: '10 years' },
  { name: 'Dr. Amina Hassan', role: 'Addiction Specialist', specialty: 'Substance Use Recovery', experience: '15 years' },
];

const values = [
  { icon: Heart, title: 'Compassion', desc: 'Every interaction is guided by empathy and understanding.' },
  { icon: Shield, title: 'Confidentiality', desc: 'Your privacy is sacred. We protect it with enterprise-grade security.' },
  { icon: Globe, title: 'Cultural Sensitivity', desc: 'Care designed for Kenya\'s diverse cultural landscape.' },
  { icon: Target, title: 'Excellence', desc: 'Evidence-based approaches delivered by board-certified professionals.' },
  { icon: Users, title: 'Community', desc: 'Building a healthier Kenya, one person at a time.' },
  { icon: Award, title: 'Innovation', desc: 'Leveraging AI and technology to make care more accessible.' },
];

export default function AboutPage() {
  return (
    <div className="pt-32">
      {/* Hero */}
      <section className="container-custom pb-16">
        <FadeUp className="max-w-3xl">
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">About Us</span>
          <h1 className="heading-1 text-navy-800 mt-3 mb-6">
            Redefining Mental Healthcare in <span className="text-gold-500">Kenya</span>
          </h1>
          <p className="text-lg text-charcoal-600 leading-relaxed">
            LifeLink Mental Wellness Solution was founded with a simple yet powerful mission:
            to make world-class mental healthcare accessible to every Kenyan. We combine
            clinical excellence, cultural sensitivity, and cutting-edge technology to deliver
            care that truly transforms lives.
          </p>
        </FadeUp>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gradient-to-br from-navy-700 via-navy-600 to-navy-800 section-padding">
        <div className="container-custom grid md:grid-cols-2 gap-12">
          <AnimateInView animation="fade-left" className="card-dark p-8">
            <h3 className="text-gold-400 font-display text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-navy-200 leading-relaxed">
              To provide comprehensive, culturally sensitive mental and medical healthcare
              that empowers individuals, strengthens families, and builds resilient communities
              across Kenya and East Africa.
            </p>
          </AnimateInView>
          <AnimateInView animation="fade-right" className="card-dark p-8">
            <h3 className="text-gold-400 font-display text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-navy-200 leading-relaxed">
              To become East Africa&apos;s leading mental health ecosystem — where technology meets
              compassion, and every person has access to the support they deserve, regardless
              of location or circumstance.
            </p>
          </AnimateInView>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-charcoal-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Our Values</span>
            <h2 className="heading-2 text-navy-800 mt-3">What Guides Us</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <AnimateInView key={i} delay={i} className="card p-6">
                <v.icon size={28} className="text-gold-500 mb-4" />
                <h3 className="font-semibold text-navy-800 text-lg mb-2">{v.title}</h3>
                <p className="text-charcoal-500 text-sm">{v.desc}</p>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding bg-white" id="team">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Our Team</span>
            <h2 className="heading-2 text-navy-800 mt-3 mb-4">Expert Professionals</h2>
            <p className="text-charcoal-500 max-w-2xl mx-auto">
              Board-certified psychiatrists, psychologists, and therapists with decades of combined experience.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <AnimateInView key={i} delay={i} className="card p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 mx-auto mb-4 flex items-center justify-center text-2xl font-display font-bold text-gold-400">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-semibold text-navy-800">{member.name}</h3>
                <p className="text-gold-600 text-sm font-medium">{member.role}</p>
                <p className="text-charcoal-500 text-xs mt-2">{member.specialty}</p>
                <p className="text-charcoal-400 text-xs">{member.experience} experience</p>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-navy-600 to-navy-700 section-padding">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-white mb-4">Join Our Journey</h2>
          <p className="text-navy-300 max-w-xl mx-auto mb-8">
            Whether you need care, want to join our team, or partner with us — we&apos;d love to connect.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/book" className="btn-gold">Book a Session</Link>
            <Link href="/contact" className="btn-outline border-white/30 text-white hover:bg-white hover:text-navy-900">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
