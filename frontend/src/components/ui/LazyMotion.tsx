'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * Lightweight wrapper that renders children immediately with CSS,
 * then hydrates with Framer Motion only after the page is interactive.
 * This eliminates framer-motion from the critical rendering path.
 */
export function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 100);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 100);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-opacity duration-500 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * InView animation using IntersectionObserver (no framer-motion needed)
 */
export function AnimateInView({
  children,
  delay = 0,
  className = '',
  animation = 'fade-up',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  animation?: 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'scale';
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 100);
          observer.unobserve(ref);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, delay]);

  const animationClasses: Record<string, string> = {
    'fade-up': isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
    'fade-in': isVisible ? 'opacity-100' : 'opacity-0',
    'fade-left': isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8',
    'fade-right': isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8',
    'scale': isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
  };

  return (
    <div
      ref={setRef}
      className={`transition-all duration-600 ease-out ${animationClasses[animation]} ${className}`}
      style={{ transitionDuration: '600ms' }}
    >
      {children}
    </div>
  );
}
