'use client';

import { FadeUp, AnimateInView } from '@/components/ui/LazyMotion';
import Link from 'next/link';
import {
  Building2, Users, BarChart3, Shield, CheckCircle,
  ArrowRight, Phone, Award, TrendingUp, Heart
} from 'lucide-react';

const packages = [
  {
    name: 'Starter',
    employees: 'Up to 50 employees',
    price: 'KES 150,000',
    period: '/month',
    features: [
      'Employee Assistance Program (EAP)',
      'Up to 4 sessions per employee/year',
      'Mental health workshops (quarterly)',
      'Anonymous wellness helpline',
      'Basic usage reports',
    ],
  },
  {
    name: 'Professional',
    employees: 'Up to 200 employees',
    price: 'KES 400,000',
    period: '/month',
    featured: true,
    features: [
      'Everything in Starter',
      'Up to 8 sessions per employee/year',
      'Monthly on-site wellness days',
      'Executive coaching sessions',
      'HR analytics dashboard',
      'Crisis response team',
      'Custom wellness workshops',
    ],
  },
  {
    name: 'Enterprise',
    employees: 'Unlimited employees',
    price: 'Custom',
    period: '',
    features: [
      'Everything in Professional',
      'Unlimited therapy sessions',
      'Dedicated wellness coordinator',
      'Real-time analytics & ROI reports',
      'Custom integration (HRIS/Payroll)',
      'Priority crisis response',
      'Annual wellness strategy review',
      'On-site therapy rooms',
    ],
  },
];

export default function CorporatePage() {
  return (
    <div className="pt-32">
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <span className="text-gold-400 font-semibold text-sm uppercase tracking-wider">Corporate Wellness</span>
              <h1 className="heading-1 text-white mt-3 mb-6">
                Invest in Your Team&apos;s <span className="text-gold-400">Mental Health</span>
              </h1>
              <p className="text-navy-200 text-lg mb-8 leading-relaxed">
                Comprehensive corporate mental health programs designed for Kenya&apos;s leading
                organizations. Boost productivity, reduce burnout, and build a resilient workforce.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className="btn-gold gap-2">
                  <Phone size={18} /> Request a Proposal
                </Link>
                <Link href="#packages" className="btn-outline border-white/30 text-white hover:bg-white hover:text-navy-900 gap-2">
                  View Packages <ArrowRight size={18} />
                </Link>
              </div>
            </FadeUp>

            <FadeUp delay={3} className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: TrendingUp, stat: '40%', label: 'Productivity Increase' },
                  { icon: Heart, stat: '65%', label: 'Reduced Absenteeism' },
                  { icon: Users, stat: '92%', label: 'Employee Satisfaction' },
                  { icon: Award, stat: '4.2x', label: 'ROI on Investment' },
                ].map((item, i) => (
                  <div key={i} className="card-dark p-6 text-center">
                    <item.icon size={24} className="text-gold-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{item.stat}</p>
                    <p className="text-navy-300 text-xs">{item.label}</p>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">What We Offer</span>
            <h2 className="heading-2 text-navy-800 mt-3">Comprehensive Wellness Solutions</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Employee Assistance', desc: 'Confidential counseling, therapy, and crisis support for your entire team.' },
              { icon: BarChart3, title: 'HR Analytics', desc: 'Real-time dashboards with wellness metrics, usage reports, and ROI tracking.' },
              { icon: Building2, title: 'On-Site Programs', desc: 'Workshops, wellness days, and embedded counselors at your offices.' },
            ].map((item, i) => (
              <AnimateInView key={i} delay={i} className="card p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-4">
                  <item.icon size={28} className="text-navy-700" />
                </div>
                <h3 className="font-semibold text-navy-800 text-lg mb-2">{item.title}</h3>
                <p className="text-charcoal-500 text-sm">{item.desc}</p>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section-padding bg-charcoal-50" id="packages">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Pricing</span>
            <h2 className="heading-2 text-navy-800 mt-3">Corporate Packages</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {packages.map((pkg, i) => (
              <AnimateInView key={i} delay={i}
                className={`card p-8 relative ${pkg.featured ? 'ring-2 ring-gold-400 scale-105' : ''}`}
              >
                {pkg.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-400 text-navy-900 text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display text-xl font-bold text-navy-800">{pkg.name}</h3>
                <p className="text-charcoal-500 text-sm mb-4">{pkg.employees}</p>
                <p className="text-3xl font-bold text-navy-800 mb-1">
                  {pkg.price}<span className="text-charcoal-400 text-sm font-normal">{pkg.period}</span>
                </p>
                <hr className="my-6 border-charcoal-100" />
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-charcoal-600">
                      <CheckCircle size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className={`w-full justify-center ${pkg.featured ? 'btn-gold' : 'btn-outline'}`}>
                  Get Started
                </Link>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
