'use client';

import { useState, useEffect } from 'react';
import { FadeUp, AnimateInView } from '@/components/ui/LazyMotion';
import Link from 'next/link';
import { Calendar, Users, Clock, Video, ArrowRight } from 'lucide-react';
import { webinarAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function WebinarsPage() {
  const [webinars, setWebinars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    webinarAPI.list()
      .then(({ data }) => setWebinars(data.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fallbackWebinars = [
    { id: '1', title: 'Managing Anxiety in the Digital Age', description: 'Learn practical strategies for managing anxiety in our always-connected world.', scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), duration: 60, maxAttendees: 100, registrations: 67, speaker: 'Dr. Wanjiku Kamau', status: 'SCHEDULED', isFree: true },
    { id: '2', title: 'Building Resilient Teams: A Workshop for HR Leaders', description: 'Discover how top organizations build mental health into their workplace culture.', scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), duration: 90, maxAttendees: 50, registrations: 38, speaker: 'Dr. Grace Mwangi', status: 'SCHEDULED', isFree: false, price: 2000 },
    { id: '3', title: 'Parenting Through the Storm: Supporting Children\'s Mental Health', description: 'Expert guidance for parents navigating children\'s emotional well-being.', scheduledAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), duration: 75, maxAttendees: 200, registrations: 145, speaker: 'Dr. Brian Odhiambo', status: 'SCHEDULED', isFree: true },
  ];

  const displayWebinars = webinars.length > 0 ? webinars : fallbackWebinars;

  return (
    <div className="pt-32">
      <section className="container-custom pb-8">
        <FadeUp>
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Learning Hub</span>
          <h1 className="heading-1 text-navy-800 mt-3 mb-4">
            Webinars & <span className="text-gold-500">Workshops</span>
          </h1>
          <p className="text-lg text-charcoal-600 max-w-2xl">
            Join live sessions with our expert professionals. Learn, engage,
            and grow — all from the comfort of your home.
          </p>
        </FadeUp>
      </section>

      <section className="container-custom section-padding pt-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayWebinars.map((webinar, i) => (
            <AnimateInView key={webinar.id} delay={i}>
              <div className="card overflow-hidden h-full flex flex-col">
                <div className="h-40 bg-gradient-to-br from-navy-800 to-navy-900 p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      webinar.isFree ? 'bg-green-400/20 text-green-300' : 'bg-gold-400/20 text-gold-300'
                    }`}>
                      {webinar.isFree ? 'Free' : `KES ${webinar.price}`}
                    </span>
                    <Video size={20} className="text-gold-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg leading-tight">{webinar.title}</h3>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-charcoal-500 text-sm mb-4 flex-1">{webinar.description}</p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-charcoal-600">
                      <Calendar size={14} className="text-gold-500" /> {formatDate(webinar.scheduledAt)}
                    </div>
                    <div className="flex items-center gap-2 text-charcoal-600">
                      <Clock size={14} className="text-gold-500" /> {webinar.duration} minutes
                    </div>
                    <div className="flex items-center gap-2 text-charcoal-600">
                      <Users size={14} className="text-gold-500" /> {webinar.registrations}/{webinar.maxAttendees} registered
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-charcoal-400">by {webinar.speaker}</span>
                    <button className="btn-gold text-sm py-2 px-4 gap-1">
                      Register <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </AnimateInView>
          ))}
        </div>
      </section>
    </div>
  );
}
