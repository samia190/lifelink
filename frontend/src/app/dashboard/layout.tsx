'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

const ROLE_DASHBOARDS: Record<string, string> = {
  SUPER_ADMIN: '/dashboard/admin',
  RECEPTIONIST: '/dashboard/admin',
  ACCOUNTANT: '/dashboard/admin',
  DOCTOR: '/dashboard/doctor',
  PSYCHIATRIST: '/dashboard/doctor',
  THERAPIST: '/dashboard/doctor',
  CORPORATE_MANAGER: '/dashboard/corporate',
  PATIENT: '/dashboard/patient',
  GUEST: '/dashboard/patient',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user?.role) {
      const correctPath = ROLE_DASHBOARDS[user.role] || '/dashboard/patient';
      const currentBase = '/' + pathname.split('/').slice(1, 3).join('/');
      if (currentBase !== correctPath) {
        router.replace(correctPath);
      }
    }
  }, [isAuthenticated, user, pathname, router]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
