'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FadeUp } from '@/components/ui/LazyMotion';
import Link from 'next/link';
import { Clock, DollarSign, CheckCircle, Calendar, ArrowLeft } from 'lucide-react';
import { publicAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      publicAPI.serviceBySlug(slug as string)
        .then(({ data }) => setService(data.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 container-custom min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-charcoal-200 rounded w-64" />
          <div className="h-4 bg-charcoal-200 rounded w-full max-w-lg" />
          <div className="h-4 bg-charcoal-200 rounded w-full max-w-md" />
        </div>
      </div>
    );
  }

  const svc = service || {
    name: String(slug).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: 'Professional mental health service provided by our expert team.',
    longDescription: 'Our experienced professionals provide evidence-based care in a supportive, confidential environment. Each session is tailored to your unique needs and goals.',
    category: 'therapy',
    price: 4500,
    duration: 50,
  };

  return (
    <div className="pt-32">
      <section className="container-custom pb-16">
        <Link href="/services" className="inline-flex items-center gap-2 text-navy-600 hover:text-navy-800 mb-6 transition-colors">
          <ArrowLeft size={18} /> Back to Services
        </Link>
        <div className="grid lg:grid-cols-3 gap-12">
          <FadeUp className="lg:col-span-2">
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">{svc.category}</span>
            <h1 className="heading-2 text-navy-800 mt-2 mb-6">{svc.name}</h1>
            <p className="text-charcoal-600 text-lg mb-8 leading-relaxed">{svc.longDescription || svc.description}</p>

            <h3 className="font-semibold text-navy-800 text-lg mb-4">What to Expect</h3>
            <div className="space-y-3 mb-8">
              {[
                'Confidential, judgment-free environment',
                'Evidence-based treatment approaches',
                'Personalized care plans tailored to you',
                'Progress tracking and regular reviews',
                'Flexible scheduling (in-person or online)',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-gold-500 mt-0.5 flex-shrink-0" />
                  <p className="text-charcoal-600 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* Sidebar */}
          <FadeUp delay={2}>
            <div className="card p-6 sticky top-28">
              <h3 className="font-semibold text-navy-800 text-lg mb-4">Session Details</h3>
              {svc.price && (
                <div className="flex items-center gap-3 mb-3 p-3 bg-charcoal-50 rounded-lg">
                  <DollarSign size={18} className="text-gold-500" />
                  <div>
                    <p className="text-sm text-charcoal-500">Price</p>
                    <p className="font-semibold text-navy-800">{formatCurrency(svc.price)}</p>
                  </div>
                </div>
              )}
              {svc.duration && (
                <div className="flex items-center gap-3 mb-6 p-3 bg-charcoal-50 rounded-lg">
                  <Clock size={18} className="text-gold-500" />
                  <div>
                    <p className="text-sm text-charcoal-500">Duration</p>
                    <p className="font-semibold text-navy-800">{svc.duration} minutes</p>
                  </div>
                </div>
              )}
              <Link href="/book" className="btn-gold w-full justify-center gap-2">
                <Calendar size={18} /> Book This Service
              </Link>
              <p className="text-xs text-charcoal-400 text-center mt-3">
                Free cancellation up to 24 hours before
              </p>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
