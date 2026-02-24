'use client';

import Link from 'next/link';
import { FadeUp, AnimateInView } from '@/components/ui/LazyMotion';
import {
  Heart, Shield, Brain, Video, Users, Award,
  ArrowRight, Star, CheckCircle, Phone, Calendar,
  Sparkles, Globe, Clock, HeartHandshake
} from 'lucide-react';

const services = [
  { icon: Brain, title: 'Individual Therapy', desc: 'One-on-one sessions tailored to your unique needs', href: '/services/individual-therapy', color: 'from-cyan-400 to-sky-600' },
  { icon: Users, title: 'Couples & Family', desc: 'Strengthen relationships and family bonds', href: '/services/couples-therapy', color: 'from-violet-400 to-sky-600' },
  { icon: Video, title: 'Online Therapy', desc: 'Secure telehealth sessions from anywhere', href: '/services/online-therapy', color: 'from-teal-400 to-sky-600' },
  { icon: Shield, title: 'Psychiatric Care', desc: 'Expert assessment and medication management', href: '/services/psychiatric-consultation', color: 'from-rose-400 to-sky-600' },
  { icon: HeartHandshake, title: 'Corporate Wellness', desc: 'Comprehensive programs for organizations', href: '/corporate', color: 'from-lime-400 to-sky-600' },
  { icon: Sparkles, title: 'Trauma & PTSD', desc: 'Specialized trauma-focused therapy', href: '/services/trauma-ptsd-therapy', color: 'from-emerald-400 to-sky-600' },
];

const stats = [
  { number: '10,000+', label: 'Lives Transformed' },
  { number: '95%', label: 'Client Satisfaction' },
  { number: '50+', label: 'Expert Therapists' },
  { number: '24/7', label: 'Crisis Support' },
];

const testimonials = [
  { name: 'Sarah M.', role: 'Client', text: 'LifeLink changed my life. After years of struggling with anxiety, I finally found therapists who truly understand. The online sessions made it so accessible.', rating: 5 },
  { name: 'James K.', role: 'Corporate Partner', text: 'Our employee wellness scores improved by 40% after partnering with LifeLink. Their corporate program is world-class and culturally relevant.', rating: 5 },
  { name: 'Grace W.', role: 'Client', text: 'The AI chat helped me realize I needed help. From there, booking was seamless and my therapist has been incredible. Truly premium care.', rating: 5 },
];

export default function HomePage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-700 via-navy-600 to-navy-800">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(163, 230, 53, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(56, 189, 248, 0.25) 0%, transparent 50%)',
          }} />
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold-400/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-navy-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="container-custom relative z-10 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <FadeUp delay={0}>
                <div className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/20 rounded-full px-4 py-2 mb-6">
                  <Sparkles size={16} className="text-gold-400" />
                  <span className="text-gold-300 text-sm font-medium">Kenya&apos;s Premier Mental Health Center</span>
                </div>
              </FadeUp>

              <FadeUp delay={1}>
                <h1 className="heading-1 text-white mb-6">
                  Your Mind Deserves{' '}
                  <span className="text-gold-400">Premium Care</span>
                </h1>
              </FadeUp>

              <FadeUp delay={2}>
                <p className="text-lg text-navy-200 mb-8 max-w-xl leading-relaxed">
                  World-class psychiatrists, therapists, and counselors dedicated to transforming
                  lives across Kenya. Experience healthcare that understands you — culturally,
                  personally, and holistically.
                </p>
              </FadeUp>

              <FadeUp delay={3}>
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link href="/book" className="btn-gold text-base px-8 py-4 gap-2" prefetch={true}>
                    <Calendar size={20} />
                    Book a Session
                  </Link>
                  <Link href="/services" className="btn-outline border-white/30 text-white hover:bg-white hover:text-navy-900 text-base px-8 py-4 gap-2" prefetch={true}>
                    Explore Services
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </FadeUp>

              <FadeUp delay={4}>
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-navy-800 bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center text-navy-900 text-xs font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={14} className="text-gold-400 fill-gold-400" />
                      ))}
                    </div>
                    <p className="text-navy-300 text-sm">Trusted by 10,000+ clients</p>
                  </div>
                </div>
              </FadeUp>
            </div>

            <FadeUp delay={5} className="hidden lg:block">
              <div className="glass-card p-8 space-y-6">
                <h3 className="text-white font-display text-xl font-semibold mb-6">Why Choose LifeLink?</h3>
                {[
                  { icon: Shield, text: 'Board-certified professionals with 10+ years experience' },
                  { icon: Globe, text: 'Culturally sensitive care designed for Kenya' },
                  { icon: Video, text: 'Secure telehealth — therapy from anywhere' },
                  { icon: Clock, text: '24/7 AI support with crisis detection' },
                  { icon: Heart, text: 'Holistic approach: mind, body, and community' },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-gold-400" />
                    </div>
                    <p className="text-navy-200 text-sm">{text}</p>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1 animate-bounce">
            <div className="w-1.5 h-3 rounded-full bg-gold-400" />
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="bg-white py-16 border-b border-charcoal-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <AnimateInView key={i} delay={i}>
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-display font-bold gradient-text">{stat.number}</p>
                  <p className="text-charcoal-500 text-sm mt-1">{stat.label}</p>
                </div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="section-padding bg-charcoal-50">
        <div className="container-custom">
          <AnimateInView className="text-center mb-16">
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Our Services</span>
            <h2 className="heading-2 text-navy-800 mt-3 mb-4">Comprehensive Mental & Medical Care</h2>
            <p className="text-charcoal-500 max-w-2xl mx-auto">
              From therapy and psychiatric care to corporate wellness programs,
              we offer a full spectrum of services designed for Kenya&apos;s unique needs.
            </p>
          </AnimateInView>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <AnimateInView key={i} delay={i}>
                <Link href={service.href} className="card p-6 block group h-full" prefetch={false}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <service.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-navy-800 mb-2 group-hover:text-gold-600 transition-colors">{service.title}</h3>
                  <p className="text-charcoal-500 text-sm mb-4">{service.desc}</p>
                  <span className="text-navy-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn More <ArrowRight size={14} />
                  </span>
                </Link>
              </AnimateInView>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/services" className="btn-primary gap-2">View All Services <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <AnimateInView className="text-center mb-16">
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="heading-2 text-navy-800 mt-3 mb-4">Start Your Journey in 3 Steps</h2>
          </AnimateInView>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Book Online', desc: 'Choose your service, therapist, and preferred time slot. Pay securely via M-Pesa or card.', icon: Calendar },
              { step: '02', title: 'Meet Your Therapist', desc: 'Connect in-person at our Nairobi center or via our secure telehealth platform.', icon: Video },
              { step: '03', title: 'Transform Your Life', desc: 'Experience personalized care with progress tracking and continuous support.', icon: Heart },
            ].map((item, i) => (
              <AnimateInView key={i} delay={i * 1.5}>
                <div className="text-center relative">
                  {i < 2 && <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gold-400 to-transparent" />}
                  <div className="w-20 h-20 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-6 relative">
                    <item.icon size={32} className="text-navy-700" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gold-400 text-navy-900 text-xs font-bold flex items-center justify-center">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-navy-800 mb-2">{item.title}</h3>
                  <p className="text-charcoal-500 text-sm">{item.desc}</p>
                </div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section-padding bg-gradient-to-br from-navy-700 via-navy-600 to-navy-800">
        <div className="container-custom">
          <AnimateInView className="text-center mb-16">
            <span className="text-gold-400 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="heading-2 text-white mt-3 mb-4">Real Stories, Real Transformation</h2>
          </AnimateInView>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <AnimateInView key={i} delay={i}>
                <div className="card-dark p-8 h-full">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={16} className="text-gold-400 fill-gold-400" />
                    ))}
                  </div>
                  <p className="text-navy-200 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-900 font-bold text-sm">{t.name[0]}</div>
                    <div>
                      <p className="text-white font-medium text-sm">{t.name}</p>
                      <p className="text-navy-400 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI & TELEHEALTH ===== */}
      <section className="section-padding bg-charcoal-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimateInView animation="fade-left">
              <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Innovation</span>
              <h2 className="heading-2 text-navy-800 mt-3 mb-6">
                AI-Powered Support, <span className="text-gold-500">Human Touch</span>
              </h2>
              <p className="text-charcoal-600 mb-8 leading-relaxed">
                Our AI assistant provides 24/7 mental health support, intelligent triage,
                and crisis detection — all while maintaining the warmth and cultural sensitivity
                that defines Kenyan hospitality.
              </p>
              <div className="space-y-4">
                {[
                  'Real-time mental health screening & service recommendations',
                  'Crisis detection with automatic alert escalation',
                  'Swahili & English support for inclusive access',
                  'Seamless handoff to human professionals when needed',
                  'HIPAA-compliant data encryption',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-gold-500 mt-0.5 flex-shrink-0" />
                    <p className="text-charcoal-600 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </AnimateInView>

            <AnimateInView animation="fade-right" className="relative">
              <div className="card p-8 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-navy-800 flex items-center justify-center">
                    <Brain size={24} className="text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-800">LifeLink AI</h3>
                    <p className="text-xs text-charcoal-500">Intelligent Mental Health Support</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-navy-50 rounded-xl p-3 text-sm text-navy-700">
                    Hello! I&apos;m here to help you find the right support. How are you feeling today?
                  </div>
                  <div className="bg-gold-50 rounded-xl p-3 text-sm text-charcoal-700 ml-8">
                    I&apos;ve been feeling very anxious about work lately...
                  </div>
                  <div className="bg-navy-50 rounded-xl p-3 text-sm text-navy-700">
                    I hear you. Workplace anxiety is very common. Let me recommend some options tailored to your needs...
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl bg-gold-400/10 -z-0" />
            </AnimateInView>
          </div>
        </div>
      </section>

      {/* ===== CORPORATE ===== */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimateInView animation="fade-left" className="order-2 lg:order-1">
              <div className="card p-8 bg-gradient-to-br from-navy-600 to-navy-700 text-white">
                <h3 className="text-xl font-display font-semibold mb-6">Corporate Dashboard</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Employee Wellness Score', value: '87%' },
                    { label: 'Sessions This Month', value: '156' },
                    { label: 'Employee Engagement', value: '92%' },
                    { label: 'ROI on Wellness', value: '4.2x' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-navy-700/50 rounded-lg">
                      <span className="text-sm text-navy-200">{item.label}</span>
                      <span className="font-bold text-gold-400">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateInView>

            <AnimateInView animation="fade-right" className="order-1 lg:order-2">
              <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">For Organizations</span>
              <h2 className="heading-2 text-navy-800 mt-3 mb-6">
                Corporate <span className="text-gold-500">Wellness</span> Programs
              </h2>
              <p className="text-charcoal-600 mb-6 leading-relaxed">
                Invest in your team&apos;s mental health with our comprehensive corporate wellness
                programs. From EAP services to executive coaching, we help Kenya&apos;s leading
                organizations build resilient, high-performing teams.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Employee Assistance Program (EAP)',
                  'Executive mental health coaching',
                  'Workplace stress management workshops',
                  'HR analytics dashboard with usage reports',
                  'Custom wellness programs for any team size',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-charcoal-600">
                    <Award size={18} className="text-gold-500 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/corporate" className="btn-primary gap-2">Learn More <ArrowRight size={18} /></Link>
            </AnimateInView>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-700 via-navy-600 to-navy-700" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e5ac3e\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />
        <div className="container-custom relative z-10 text-center">
          <AnimateInView>
            <h2 className="heading-1 text-white mb-6">
              Take the First Step <span className="text-gold-400">Today</span>
            </h2>
            <p className="text-navy-200 text-lg max-w-2xl mx-auto mb-10">
              You deserve to feel better. Our team of experienced professionals is ready
              to walk this journey with you. Book your first session today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/book" className="btn-gold text-lg px-10 py-4 gap-2">
                <Calendar size={22} />
                Book Your Session
              </Link>
              <a href="tel:+254700000000" className="btn-outline border-white/30 text-white hover:bg-white hover:text-navy-900 text-lg px-10 py-4 gap-2">
                <Phone size={22} />
                Call Us Now
              </a>
            </div>
          </AnimateInView>
        </div>
      </section>
    </>
  );
}
