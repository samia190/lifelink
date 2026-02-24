'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { notificationAPI } from '@/lib/api';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  id: string;
  badge?: number;
}

interface DashboardShellProps {
  portalLabel: string;
  sidebarItems: SidebarItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export default function DashboardShell({
  portalLabel,
  sidebarItems,
  activeTab,
  onTabChange,
  children,
}: DashboardShellProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationAPI.unreadCount()
      .then(r => setUnread(r.data?.data?.count ?? 0))
      .catch(() => {});
  }, [activeTab]);

  const handleLogout = () => { logout(); router.push('/'); };

  const initials = [user?.profile?.firstName?.[0], user?.profile?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  return (
    <div className="dash-shell">
      {/* Desktop sidebar */}
      <aside className={`dash-sidebar ${collapsed ? 'dash-sidebar--collapsed' : ''}`}>
        <div className="dash-sidebar__brand">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-gold-400/20 group-hover:shadow-gold-400/40 transition-shadow">
              <Image src="/logo.jpeg" alt="LifeLink Logo" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-lg font-display font-bold text-white tracking-tight">LIFE<span className="text-gold-400">LINK</span></span>
                <p className="text-[10px] text-navy-400 tracking-widest uppercase">{portalLabel}</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-navy-400 hover:text-white hover:bg-navy-700/50 transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <nav className="dash-sidebar__nav">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`dash-sidebar__link ${activeTab === item.id ? 'dash-sidebar__link--active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.badge != null && item.badge > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="dash-sidebar__footer">
          <button onClick={handleLogout} className="dash-sidebar__link text-navy-400 hover:text-red-400">
            <LogOut size={20} />{!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="dash-mobile-header lg:hidden">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-navy-300 hover:bg-navy-700/50"><Menu size={22} /></button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden">
            <Image src="/logo.jpeg" alt="LifeLink" width={28} height={28} className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-bold text-white">LIFE<span className="text-gold-400">LINK</span></span>
        </div>
        <button className="p-2 rounded-lg text-navy-300 hover:bg-navy-700/50 relative" onClick={() => onTabChange('notifications')}>
          <Bell size={20} />
          {unread > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="dash-sidebar !fixed !translate-x-0 w-72">
            <div className="dash-sidebar__brand">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden">
                  <Image src="/logo.jpeg" alt="LifeLink Logo" width={40} height={40} className="w-full h-full object-cover" />
                </div>
                <span className="text-lg font-display font-bold text-white">LIFE<span className="text-gold-400">LINK</span></span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-navy-400 hover:text-white"><X size={20} /></button>
            </div>
            <nav className="dash-sidebar__nav">
              {sidebarItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
                  className={`dash-sidebar__link ${activeTab === item.id ? 'dash-sidebar__link--active' : ''}`}
                >
                  <item.icon size={20} /><span>{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">{item.badge}</span>
                  )}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className={`dash-main ${collapsed ? 'dash-main--expanded' : ''}`}>
        <header className="dash-topbar">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white capitalize">
              {sidebarItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="dash-topbar__icon-btn relative" onClick={() => onTabChange('notifications')}>
              <Bell size={20} />
              {unread > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{unread > 9 ? '9+' : unread}</span>}
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-navy-700/50">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                <p className="text-[11px] text-navy-400">{portalLabel}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 text-navy-900 flex items-center justify-center font-bold text-sm">
                {initials}
              </div>
            </div>
          </div>
        </header>
        <div className="dash-content">
          {children}
        </div>
      </main>
    </div>
  );
}
