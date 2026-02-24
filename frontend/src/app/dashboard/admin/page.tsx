'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Users, Calendar, DollarSign,
  AlertTriangle, Building2, Settings,
  Bell, Shield, FileText, Video, Search,
  Layers, Loader2, Menu, LogOut, X, Presentation, Heart
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { dashboardAPI, notificationAPI } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';

// Tab components
import OverviewTab from './components/OverviewTab';
import PatientsTab from './components/PatientsTab';
import ProvidersTab from './components/ProvidersTab';
import AppointmentsTab from './components/AppointmentsTab';
import RevenueTab from './components/RevenueTab';
import AlertsTab from './components/AlertsTab';
import CorporateTab from './components/CorporateTab';
import TelehealthTab from './components/TelehealthTab';
import ContentTab from './components/ContentTab';
import WebinarsTab from './components/WebinarsTab';
import AuditTab from './components/AuditTab';
import SettingsTab from './components/SettingsTab';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, alertsRes, healthRes, doctorsRes, unreadRes] = await Promise.all([
        dashboardAPI.analytics().catch(() => null),
        dashboardAPI.riskAlerts({ resolved: 'false' }).catch(() => null),
        dashboardAPI.systemHealth().catch(() => null),
        dashboardAPI.listDoctors().catch(() => null),
        notificationAPI.unreadCount().catch(() => null),
      ]);
      if (analyticsRes?.data?.data) setAnalytics(analyticsRes.data.data);
      if (alertsRes?.data?.data) setAlerts(Array.isArray(alertsRes.data.data) ? alertsRes.data.data : []);
      if (healthRes?.data?.data) setHealth(healthRes.data.data);
      if (doctorsRes?.data?.data) setDoctors(Array.isArray(doctorsRes.data.data) ? doctorsRes.data.data : []);
      if (unreadRes?.data?.data?.count != null) setUnreadCount(unreadRes.data.data.count);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const sidebarItems = [
    { icon: Layers, label: 'Overview', id: 'overview' },
    { icon: Users, label: 'Patients', id: 'patients' },
    { icon: Heart, label: 'Providers', id: 'providers' },
    { icon: Calendar, label: 'Appointments', id: 'appointments' },
    { icon: DollarSign, label: 'Revenue', id: 'revenue' },
    { icon: AlertTriangle, label: 'Risk Alerts', id: 'alerts', badge: alerts.length },
    { icon: Building2, label: 'Corporate', id: 'corporate' },
    { icon: Video, label: 'Telehealth', id: 'telehealth' },
    { icon: FileText, label: 'Content', id: 'content' },
    { icon: Presentation, label: 'Webinars', id: 'webinars' },
    { icon: Shield, label: 'Audit Logs', id: 'audit' },
    { icon: Bell, label: 'Notifications', id: 'notifications' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  const renderTabContent = () => {
    if (loading && activeTab === 'overview') {
      return (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-gold-400" />
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewTab analytics={analytics} alerts={alerts} health={health} onViewAlerts={() => setActiveTab('alerts')} />;
      case 'patients':
        return <PatientsTab doctors={doctors} />;
      case 'providers':
        return <ProvidersTab />;
      case 'appointments':
        return <AppointmentsTab />;
      case 'revenue':
        return <RevenueTab analytics={analytics} />;
      case 'alerts':
        return <AlertsTab alerts={alerts} setAlerts={setAlerts} />;
      case 'corporate':
        return <CorporateTab />;
      case 'telehealth':
        return <TelehealthTab />;
      case 'content':
        return <ContentTab />;
      case 'webinars':
        return <WebinarsTab />;
      case 'audit':
        return <AuditTab />;
      case 'notifications':
        return <NotificationsPanel />;
      case 'settings':
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="dash-shell">
      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarCollapsed ? 'dash-sidebar--collapsed' : ''}`}>
        <div className="dash-sidebar__brand">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-gold-400/20 group-hover:shadow-gold-400/40 transition-shadow">
              <Image src="/logo.jpeg" alt="LifeLink Logo" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="text-lg font-display font-bold text-white tracking-tight">LIFE<span className="text-gold-400">LINK</span></span>
                <p className="text-[10px] text-navy-400 tracking-widest uppercase">Admin Console</p>
              </div>
            )}
          </Link>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-navy-400 hover:text-white hover:bg-navy-700/50 transition-colors">
            <Menu size={16} />
          </button>
        </div>

        <nav className="dash-sidebar__nav">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`dash-sidebar__link ${activeTab === item.id ? 'dash-sidebar__link--active' : ''}`} title={sidebarCollapsed ? item.label : undefined}>
              <item.icon size={20} />
              {!sidebarCollapsed && <span>{item.label}</span>}
              {!sidebarCollapsed && item.badge ? (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">{item.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="dash-sidebar__footer">
          {!sidebarCollapsed && (
            <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-gold-400/10 to-transparent border border-gold-400/10 mb-3">
              <p className="text-xs text-gold-400 font-semibold">System Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-navy-300">All services operational</span>
              </div>
            </div>
          )}
          <button onClick={() => { logout(); router.push('/'); }} className="dash-sidebar__link text-navy-400 hover:text-red-400">
            <LogOut size={20} />{!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="dash-mobile-header lg:hidden">
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg text-navy-300 hover:bg-navy-700/50"><Menu size={22} /></button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden">
            <Image src="/logo.jpeg" alt="LifeLink" width={28} height={28} className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-bold text-white">LIFE<span className="text-gold-400">LINK</span></span>
        </div>
        <button onClick={() => setActiveTab('notifications')} className="p-2 rounded-lg text-navy-300 hover:bg-navy-700/50 relative">
          <Bell size={20} />
          {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="dash-sidebar !fixed !translate-x-0 w-72">
            <div className="dash-sidebar__brand">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden"><Image src="/logo.jpeg" alt="LifeLink" width={40} height={40} className="w-full h-full object-cover" /></div>
                <span className="text-lg font-display font-bold text-white">LIFE<span className="text-gold-400">LINK</span></span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg text-navy-400 hover:text-white"><X size={20} /></button>
            </div>
            <nav className="dash-sidebar__nav">
              {sidebarItems.map((item) => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} className={`dash-sidebar__link ${activeTab === item.id ? 'dash-sidebar__link--active' : ''}`}>
                  <item.icon size={20} /><span>{item.label}</span>
                  {item.badge ? <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">{item.badge}</span> : null}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className={`dash-main ${sidebarCollapsed ? 'dash-main--expanded' : ''}`}>
        <header className="dash-topbar">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{greeting()}, {user?.profile?.firstName || 'Admin'}</h1>
            <p className="text-sm text-navy-400">{currentTime.toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800/50 border border-navy-700/50 focus-within:border-gold-400/50 transition-colors">
              <Search size={16} className="text-navy-400" />
              <input type="text" placeholder="Search..." className="bg-transparent text-sm text-white placeholder:text-navy-500 focus:outline-none w-40" />
            </div>
            <button onClick={() => setActiveTab('notifications')} className="dash-topbar__icon-btn relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-navy-700/50">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                <p className="text-[11px] text-navy-400">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 text-navy-900 flex items-center justify-center font-bold text-sm">
                {getInitials(user?.profile?.firstName, user?.profile?.lastName)}
              </div>
            </div>
          </div>
        </header>

        <div className="dash-content">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
