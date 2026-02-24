'use client';

import { useState, useEffect } from 'react';
import { FadeUp, AnimateInView } from '@/components/ui/LazyMotion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { publicAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicAPI.services()
      .then(({ data }) => setServices(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fallback services for when API isn't available
  const fallbackServices = [
    { name: 'Individual Therapy', slug: 'individual-therapy', description: 'One-on-one sessions tailored to your unique needs and goals.', category: 'therapy', price: 4500, duration: 50 },
    { name: 'Psychiatric Consultation', slug: 'psychiatric-consultation', description: 'Expert psychiatric assessment and medication management.', category: 'psychiatry', price: 5000, duration: 60 },
    { name: 'Couples Therapy', slug: 'couples-therapy', description: 'Strengthen your relationship through guided couples therapy.', category: 'therapy', price: 6000, duration: 60 },
    { name: 'Family Therapy', slug: 'family-therapy', description: 'Improve family dynamics and resolve complex family issues.', category: 'therapy', price: 6000, duration: 60 },
    { name: 'Child & Adolescent Therapy', slug: 'child-adolescent-therapy', description: 'Specialized therapy for children and teens.', category: 'child', price: 4000, duration: 45 },
    { name: 'Trauma & PTSD Therapy', slug: 'trauma-ptsd-therapy', description: 'Specialized treatment for trauma and PTSD recovery.', category: 'therapy', price: 5000, duration: 50 },
    { name: 'Addiction Counseling', slug: 'addiction-counseling', description: 'Professional support for substance use and behavioral addictions.', category: 'therapy', price: 4500, duration: 50 },
    { name: 'Online Therapy', slug: 'online-therapy', description: 'Secure telehealth sessions from the comfort of your home.', category: 'telehealth', price: 3500, duration: 50 },
    { name: 'Group Therapy', slug: 'group-therapy', description: 'Supportive group sessions for shared healing experiences.', category: 'therapy', price: 2000, duration: 90 },
    { name: 'Corporate Wellness', slug: 'corporate-wellness', description: 'Comprehensive mental health programs for organizations.', category: 'corporate', price: null, duration: null },
  ];

  const displayServices = services.length > 0 ? services : fallbackServices;

  return (
    <div className="pt-32">
      <section className="container-custom pb-8">
        <FadeUp>
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Our Services</span>
          <h1 className="heading-1 text-navy-800 mt-3 mb-4">
            Comprehensive <span className="text-gold-500">Healthcare</span>
          </h1>
          <p className="text-lg text-charcoal-600 max-w-2xl">
            From individual therapy to corporate wellness, we offer a full spectrum of mental
            and medical healthcare services designed for Kenya.
          </p>
        </FadeUp>
      </section>

      <section className="container-custom section-padding pt-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayServices.map((svc, i) => (
            <AnimateInView
              key={svc.slug}
              delay={i}
            >
              <Link href={`/services/${svc.slug}`} className="card p-6 block group h-full">
                <span className="text-xs font-medium text-gold-600 uppercase tracking-wider">{svc.category}</span>
                <h3 className="text-lg font-semibold text-navy-800 mt-2 mb-3 group-hover:text-gold-600 transition-colors">
                  {svc.name}
                </h3>
                <p className="text-charcoal-500 text-sm mb-4 flex-1">{svc.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    {svc.price ? (
                      <p className="font-semibold text-navy-800">{formatCurrency(svc.price)}<span className="text-charcoal-400 text-xs font-normal"> / session</span></p>
                    ) : (
                      <p className="text-sm text-gold-600 font-medium">Custom Pricing</p>
                    )}
                    {svc.duration && <p className="text-xs text-charcoal-400">{svc.duration} minutes</p>}
                  </div>
                  <span className="text-navy-600 group-hover:text-gold-500 transition-colors">
                    <ArrowRight size={18} />
                  </span>
                </div>
              </Link>
            </AnimateInView>
          ))}
        </div>
      </section>
    </div>
  );
}
