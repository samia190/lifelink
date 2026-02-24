'use client';

import { useState, useEffect } from 'react';
import { FadeUp, AnimateInView } from '@/components/ui/LazyMotion';
import Link from 'next/link';
import { Calendar, ArrowRight, Search, Tag } from 'lucide-react';
import { publicAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    publicAPI.blogPosts()
      .then(({ data }) => setPosts(data.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fallbackPosts = [
    { title: 'Understanding Depression in Kenya: A Comprehensive Guide', slug: 'understanding-depression-in-kenya', excerpt: 'Depression affects millions of Kenyans. Learn about the signs, causes, and treatment options available.', category: 'Mental Health', publishedAt: new Date().toISOString(), tags: ['depression', 'mental health'] },
    { title: 'The Rise of Telehealth in East Africa', slug: 'rise-of-telehealth-east-africa', excerpt: 'How digital health solutions are transforming mental healthcare access across the region.', category: 'Technology', publishedAt: new Date().toISOString(), tags: ['telehealth', 'digital health'] },
    { title: '5 Mental Health Tips for Corporate Professionals', slug: 'mental-health-tips-corporate-professionals', excerpt: 'Practical strategies for managing stress and maintaining wellness in the workplace.', category: 'Workplace Wellness', publishedAt: new Date().toISOString(), tags: ['corporate', 'stress management'] },
  ];

  const displayPosts = posts.length > 0 ? posts : fallbackPosts;
  const filteredPosts = displayPosts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.excerpt?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-32">
      <section className="container-custom pb-8">
        <FadeUp>
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Blog & Resources</span>
          <h1 className="heading-1 text-navy-800 mt-3 mb-4">
            Mental Health <span className="text-gold-500">Insights</span>
          </h1>
          <p className="text-lg text-charcoal-600 max-w-2xl mb-8">
            Expert articles, research, and guidance on mental health, wellness, and healthcare in Kenya.
          </p>
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input type="text" placeholder="Search articles..." className="input-field pl-11" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </FadeUp>
      </section>

      <section className="container-custom section-padding pt-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, i) => (
            <AnimateInView key={post.slug} delay={i}>
              <Link href={`/blog/${post.slug}`} className="card block group h-full overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-navy-600 to-navy-700 flex items-center justify-center">
                  <span className="text-3xl font-display font-bold text-gold-400/30">{post.title[0]}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium text-gold-600 bg-gold-50 px-2 py-1 rounded-full">{post.category}</span>
                    <span className="text-xs text-charcoal-400 flex items-center gap-1">
                      <Calendar size={12} /> {formatDate(post.publishedAt)}
                    </span>
                  </div>
                  <h2 className="font-semibold text-navy-800 mb-2 group-hover:text-gold-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-charcoal-500 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                  <span className="text-navy-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ArrowRight size={14} />
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
