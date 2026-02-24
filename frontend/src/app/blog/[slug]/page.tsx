'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FadeUp } from '@/components/ui/LazyMotion';
import Link from 'next/link';
import { Calendar, ArrowLeft, Clock, Tag, Share2 } from 'lucide-react';
import { publicAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      publicAPI.blogBySlug(slug as string)
        .then(({ data }) => setPost(data.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 container-custom min-h-screen">
        <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
          <div className="h-8 bg-charcoal-200 rounded w-3/4" />
          <div className="h-4 bg-charcoal-200 rounded w-1/2" />
          <div className="h-64 bg-charcoal-200 rounded mt-8" />
        </div>
      </div>
    );
  }

  const displayPost = post || {
    title: String(slug).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    content: 'Article content loading...',
    category: 'Mental Health',
    publishedAt: new Date().toISOString(),
    tags: ['mental health', 'kenya'],
  };

  return (
    <div className="pt-32">
      <article className="container-custom pb-24">
        <Link href="/blog" className="inline-flex items-center gap-2 text-navy-600 hover:text-navy-800 mb-6 transition-colors">
          <ArrowLeft size={18} /> Back to Blog
        </Link>

        <FadeUp className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs font-medium text-gold-600 bg-gold-50 px-3 py-1 rounded-full">{displayPost.category}</span>
            <span className="text-sm text-charcoal-400 flex items-center gap-1">
              <Calendar size={14} /> {formatDate(displayPost.publishedAt)}
            </span>
            <span className="text-sm text-charcoal-400 flex items-center gap-1">
              <Clock size={14} /> 5 min read
            </span>
          </div>

          <h1 className="heading-2 text-navy-800 mb-8">{displayPost.title}</h1>

          <div className="prose prose-lg max-w-none text-charcoal-700 leading-relaxed">
            <p>{displayPost.content}</p>
          </div>

          {/* Tags */}
          {displayPost.tags && (
            <div className="flex items-center gap-2 mt-8 pt-8 border-t border-charcoal-100">
              <Tag size={16} className="text-charcoal-400" />
              {displayPost.tags.map((tag: string, i: number) => (
                <span key={i} className="text-xs bg-charcoal-100 text-charcoal-600 px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 p-8 bg-navy-50 rounded-2xl text-center">
            <h3 className="font-semibold text-navy-800 text-lg mb-2">Need Professional Support?</h3>
            <p className="text-charcoal-500 mb-4">Our team of experts is here to help you on your journey.</p>
            <Link href="/book" className="btn-gold">Book a Session</Link>
          </div>
        </FadeUp>
      </article>
    </div>
  );
}
