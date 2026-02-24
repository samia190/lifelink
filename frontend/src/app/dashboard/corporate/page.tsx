'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Users, TrendingUp, Calendar, BarChart2, Bell,
  LogOut, Settings, FileText, Download, Building2,
  Menu, X, ArrowUpRight, Shield, Activity, Target, Zap
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { getInitials } from '@/lib/utils';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import toast from 'react-hot-toast';

export default function CorporateDashboard() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1e1b4b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden animate-pulse">
            <Image src="/logo.jpeg" alt="LifeLink" width={48} height={48} className="w-full h-full object-cover" />
          </div>
          <div className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { icon: TrendingUp, label: 'Overview', id: 'overview' },
    { icon: Users, label: 'Employees', id: 'employees' },
    { icon: Calendar, label: 'Programs', id: 'programs' },
    { icon: BarChart2, label: 'Analytics', id: 'analytics' },
    { icon: FileText, label: 'Reports', id: 'reports' },
    { icon: Shield, label: 'Compliance', id: 'compliance' },
    { icon: Bell, label: 'Notifications', id: 'notifications' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  const departments = [
    { name: 'Engineering', employees: 45, utilization: 78, color: 'blue' },
    { name: 'Sales & Marketing', employees: 32, utilization: 65, color: 'violet' },
    { name: 'Human Resources', employees: 18, utilization: 92, color: 'emerald' },
    { name: 'Finance', employees: 24, utilization: 54, color: 'amber' },
    { name: 'Operations', employees: 38, utilization: 71, color: 'rose' },
  ];

  const colorMap: Record<string, { bar: string; text: string }> = {
    blue: { bar: 'bg-blue-400', text: 'text-blue-400' },
    violet: { bar: 'bg-violet-400', text: 'text-violet-400' },
    emerald: { bar: 'bg-emerald-400', text: 'text-emerald-400' },
    amber: { bar: 'bg-amber-400', text: 'text-amber-400' },
    rose: { bar: 'bg-rose-400', text: 'text-rose-400' },
  };

  const monthlyUsage = [
    { month: 'Jan', sessions: 45 }, { month: 'Feb', sessions: 62 },
    { month: 'Mar', sessions: 58 }, { month: 'Apr', sessions: 73 },
    { month: 'May', sessions: 85 }, { month: 'Jun', sessions: 91 },
  ];
  const maxSessions = Math.max(...monthlyUsage.map(m => m.sessions));

  return (
    <div className="dash-shell">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar__brand">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-gold-400/20">
              <Image src="/logo.jpeg" alt="LifeLink Logo" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-lg font-display font-bold text-white tracking-tight">LIFE<span className="text-gold-400">LINK</span></span>
              <p className="text-[10px] text-navy-400 tracking-widest uppercase">Corporate</p>
            </div>
          </Link>
        </div>
        <nav className="dash-sidebar__nav">
          {sidebarItems.map((item) => (
            <button key={item.label} onClick={() => setActiveTab(item.id)} className={`dash-sidebar__link ${activeTab === item.id ? 'dash-sidebar__link--active' : ''}`}>
              <item.icon size={20} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="dash-sidebar__footer">
          <button onClick={() => { logout(); router.push('/'); }} className="dash-sidebar__link text-navy-400 hover:text-red-400">
            <LogOut size={20} /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile */}
      <div className="dash-mobile-header lg:hidden">
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg text-navy-300"><Menu size={22} /></button>
        <span className="font-display font-bold text-white">LIFE<span className="text-gold-400">LINK</span></span>
        <button className="p-2 rounded-lg text-navy-300 relative"><Bell size={20} /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /></button>
      </div>

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
                <button key={item.label} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} className={`dash-sidebar__link ${activeTab === item.id ? 'dash-sidebar__link--active' : ''}`}>
                  <item.icon size={20} /><span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="dash-main">
        <header className="dash-topbar">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Corporate Wellness Hub 🏢</h1>
            <p className="text-sm text-navy-400">{user?.profile?.firstName ? `${user.profile.firstName}'s Organization` : 'Wellness Program Overview'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 font-semibold text-sm hover:shadow-lg hover:shadow-gold-400/30 transition-all">
              <Download size={16} /> Export Report
            </button>
            <button className="dash-topbar__icon-btn"><Bell size={20} /></button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 text-navy-900 flex items-center justify-center font-bold text-sm">
              {getInitials(user?.profile?.firstName, user?.profile?.lastName)}
            </div>
          </div>
        </header>

        <div className="dash-content">
          {activeTab === 'overview' && (<>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {[
              { label: 'Total Employees', value: '157', sub: '12 new this quarter', icon: Users, gradient: 'from-blue-500/20 to-blue-600/5', iconBg: 'bg-blue-500/20', iconClr: 'text-blue-400', ring: 'ring-blue-500/20' },
              { label: 'Program Utilization', value: '72%', sub: '↑ 8% from last quarter', icon: TrendingUp, gradient: 'from-emerald-500/20 to-emerald-600/5', iconBg: 'bg-emerald-500/20', iconClr: 'text-emerald-400', ring: 'ring-emerald-500/20' },
              { label: 'Sessions This Month', value: '91', sub: 'Avg 4.2 per employee', icon: Calendar, gradient: 'from-violet-500/20 to-violet-600/5', iconBg: 'bg-violet-500/20', iconClr: 'text-violet-400', ring: 'ring-violet-500/20' },
              { label: 'Wellness Score', value: '8.4', sub: 'Out of 10 • Good range', icon: Target, gradient: 'from-gold-500/20 to-gold-600/5', iconBg: 'bg-gold-500/20', iconClr: 'text-gold-400', ring: 'ring-gold-500/20' },
            ].map((card, i) => (
              <div key={i} className={`dash-kpi-card bg-gradient-to-br ${card.gradient} ring-1 ${card.ring}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center`}>
                    <card.icon size={22} className={card.iconClr} />
                  </div>
                  <ArrowUpRight size={18} className="text-navy-500" />
                </div>
                <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
                <p className="text-xs text-navy-400">{card.label}</p>
                <p className="text-[11px] text-navy-500 mt-2">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Usage Chart + Departments */}
          <div className="grid lg:grid-cols-3 gap-5 mb-8">
            <div className="lg:col-span-2 dash-card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">Session Utilization Trend</h2>
                  <p className="text-xs text-navy-400 mt-1">Monthly session count for 2025</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-navy-400">
                  <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-gold-400 to-gold-500" /> Sessions
                </div>
              </div>
              <div className="flex items-end justify-around gap-3 h-52">
                {monthlyUsage.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs font-semibold text-gold-400">{m.sessions}</span>
                    <div className="w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-gold-400/80 to-gold-500/40 transition-all relative overflow-hidden" style={{ height: `${(m.sessions / maxSessions) * 100}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                    <span className="text-[11px] text-navy-500 font-medium">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="dash-card">
              <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <Building2 size={18} className="text-gold-400" />Department Breakdown
              </h2>
              <div className="space-y-4">
                {departments.map((dept, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-navy-200">{dept.name}</span>
                      <span className={`text-sm font-semibold ${colorMap[dept.color]?.text || 'text-white'}`}>{dept.utilization}%</span>
                    </div>
                    <div className="w-full h-2 bg-navy-800/50 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${colorMap[dept.color]?.bar || 'bg-gold-400'}`} style={{ width: `${dept.utilization}%` }} />
                    </div>
                    <p className="text-[11px] text-navy-500 mt-1">{dept.employees} employees enrolled</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Programs + Quick Actions */}
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="dash-card">
              <h2 className="text-lg font-semibold text-white mb-5">Active Wellness Programs</h2>
              <div className="space-y-3">
                {[
                  { name: 'Stress Management Workshop', enrolled: 89, capacity: 100, status: 'Active', accent: 'emerald' },
                  { name: 'Executive Coaching Program', enrolled: 12, capacity: 15, status: 'Active', accent: 'blue' },
                  { name: 'Mindfulness & Meditation', enrolled: 64, capacity: 80, status: 'Active', accent: 'violet' },
                  { name: 'Financial Wellness Seminars', enrolled: 45, capacity: 50, status: 'Waitlist', accent: 'amber' },
                ].map((prog, i) => {
                  const accentMap: Record<string, { bg: string; text: string; fill: string }> = {
                    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', fill: 'bg-emerald-400' },
                    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', fill: 'bg-blue-400' },
                    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', fill: 'bg-violet-400' },
                    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', fill: 'bg-amber-400' },
                  };
                  const colors = accentMap[prog.accent] || accentMap.emerald;
                  return (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-navy-800/30 border border-navy-700/30 hover:border-navy-600/50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <Zap size={18} className={colors.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{prog.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-navy-800/50 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${colors.fill}`} style={{ width: `${(prog.enrolled / prog.capacity) * 100}%` }} />
                        </div>
                        <span className="text-[11px] text-navy-400">{prog.enrolled}/{prog.capacity}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      prog.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>{prog.status}</span>
                  </div>
                  );
                })}
              </div>
            </div>

            <div className="dash-card">
              <h2 className="text-lg font-semibold text-white mb-5">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Download Report', icon: Download, desc: 'Monthly PDF' },
                  { label: 'Add Employee', icon: Users, desc: 'Enroll new staff' },
                  { label: 'Schedule Program', icon: Calendar, desc: 'New wellness event' },
                  { label: 'View Analytics', icon: BarChart2, desc: 'Full breakdown' },
                ].map((action, i) => (
                  <button key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-navy-800/30 border border-navy-700/30 hover:border-gold-400/30 hover:bg-gold-400/5 transition-all text-center group">
                    <div className="w-10 h-10 rounded-xl bg-navy-800/50 flex items-center justify-center group-hover:bg-gold-400/10 transition-colors">
                      <action.icon size={18} className="text-navy-300 group-hover:text-gold-400 transition-colors" />
                    </div>
                    <span className="text-xs font-medium text-white">{action.label}</span>
                    <span className="text-[10px] text-navy-500">{action.desc}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-gold-400/10 to-gold-500/5 border border-gold-400/20">
                <div className="flex items-center gap-3 mb-2">
                  <Shield size={20} className="text-gold-400" />
                  <h3 className="text-sm font-semibold text-white">Compliance Status</h3>
                </div>
                <p className="text-sm text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> All Compliant
                </p>
                <p className="text-[11px] text-navy-400 mt-1">Mental Health Act (Kenya) — next audit: March 2026</p>
              </div>
            </div>
          </div>
          </>)}

          {activeTab === 'employees' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Employee Directory</h2>
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 text-sm font-semibold">+ Add Employee</button>
              </div>
              <div className="dash-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-navy-700/50">
                      <th className="text-left py-3 px-4 text-navy-400 font-medium">Employee</th>
                      <th className="text-left py-3 px-4 text-navy-400 font-medium">Department</th>
                      <th className="text-left py-3 px-4 text-navy-400 font-medium">Sessions Used</th>
                      <th className="text-left py-3 px-4 text-navy-400 font-medium">Status</th>
                    </tr></thead>
                    <tbody>
                      {[
                        { name: 'John Kamau', dept: 'Engineering', sessions: 4, status: 'Active' },
                        { name: 'Jane Wambui', dept: 'Sales & Marketing', sessions: 6, status: 'Active' },
                        { name: 'Peter Ochieng', dept: 'Human Resources', sessions: 2, status: 'Active' },
                        { name: 'Alice Njoki', dept: 'Finance', sessions: 0, status: 'New' },
                        { name: 'David Maina', dept: 'Operations', sessions: 8, status: 'Active' },
                        { name: 'Susan Akinyi', dept: 'Engineering', sessions: 3, status: 'Active' },
                      ].map((emp, i) => (
                        <tr key={i} className="border-b border-navy-700/20 hover:bg-navy-700/20 transition-colors">
                          <td className="py-3 px-4 text-white font-medium">{emp.name}</td>
                          <td className="py-3 px-4 text-navy-300">{emp.dept}</td>
                          <td className="py-3 px-4 text-navy-300">{emp.sessions}</td>
                          <td className="py-3 px-4"><span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>{emp.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'programs' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Wellness Programs</h2>
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 text-sm font-semibold">+ New Program</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { name: 'Stress Management Workshop', enrolled: 89, capacity: 100, status: 'Active', next: 'Feb 15, 2026', desc: 'Weekly group sessions on managing workplace stress' },
                  { name: 'Executive Coaching Program', enrolled: 12, capacity: 15, status: 'Active', next: 'Feb 12, 2026', desc: 'One-on-one coaching for senior leadership' },
                  { name: 'Mindfulness & Meditation', enrolled: 64, capacity: 80, status: 'Active', next: 'Feb 13, 2026', desc: 'Daily guided meditation and mindfulness exercises' },
                  { name: 'Financial Wellness Seminars', enrolled: 45, capacity: 50, status: 'Waitlist', next: 'Mar 1, 2026', desc: 'Monthly seminars on financial planning and wellness' },
                ].map((prog, i) => (
                  <div key={i} className="dash-card hover:border-gold-400/20 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{prog.name}</h3>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${prog.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{prog.status}</span>
                    </div>
                    <p className="text-xs text-navy-400 mb-3">{prog.desc}</p>
                    <div className="h-1.5 rounded-full bg-navy-700/50 overflow-hidden mb-2">
                      <div className="h-full rounded-full bg-gold-400" style={{ width: `${(prog.enrolled / prog.capacity) * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-navy-500">{prog.enrolled}/{prog.capacity} enrolled</span>
                      <span className="text-[11px] text-navy-500">Next: {prog.next}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white">Wellness Analytics</h2>
              <div className="grid sm:grid-cols-3 gap-5 mb-5">
                <div className="dash-card text-center">
                  <TrendingUp size={28} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">72%</p>
                  <p className="text-xs text-navy-400">Program Utilization</p>
                </div>
                <div className="dash-card text-center">
                  <Target size={28} className="text-gold-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">8.4/10</p>
                  <p className="text-xs text-navy-400">Wellness Score</p>
                </div>
                <div className="dash-card text-center">
                  <Users size={28} className="text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">91%</p>
                  <p className="text-xs text-navy-400">Employee Satisfaction</p>
                </div>
              </div>
              <div className="dash-card">
                <h3 className="text-lg font-semibold text-white mb-4">Department Utilization</h3>
                <div className="space-y-4">
                  {departments.map((dept, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-navy-200">{dept.name}</span>
                        <span className={`text-sm font-semibold ${colorMap[dept.color]?.text || 'text-white'}`}>{dept.utilization}%</span>
                      </div>
                      <div className="w-full h-2 bg-navy-800/50 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colorMap[dept.color]?.bar || 'bg-gold-400'}`} style={{ width: `${dept.utilization}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white">Reports</h2>
              <div className="dash-card">
                <div className="space-y-3">
                  {[
                    { name: 'Monthly Wellness Report — January 2026', format: 'PDF', size: '2.4 MB', date: 'Feb 1, 2026' },
                    { name: 'Q4 2025 Utilization Summary', format: 'PDF', size: '3.1 MB', date: 'Jan 15, 2026' },
                    { name: 'Annual Wellness Review 2025', format: 'PDF', size: '5.8 MB', date: 'Jan 5, 2026' },
                    { name: 'Department Breakdown — December 2025', format: 'XLSX', size: '1.2 MB', date: 'Jan 2, 2026' },
                  ].map((report, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-navy-800/30 border border-navy-700/30 hover:border-navy-600/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><FileText size={18} className="text-blue-400" /></div>
                        <div>
                          <p className="text-sm font-medium text-white">{report.name}</p>
                          <p className="text-[11px] text-navy-500">{report.format} • {report.size} • {report.date}</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-navy-700/50 text-navy-400 hover:text-gold-400 hover:border-gold-400/30 transition-colors">
                        <Download size={14} /> Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Shield size={22} className="text-gold-400" /> Compliance & Legal</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="dash-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Shield size={22} className="text-emerald-400" /></div>
                    <div>
                      <h3 className="font-semibold text-white">KDPA Compliance</h3>
                      <p className="text-xs text-emerald-400 font-semibold">Fully Compliant</p>
                    </div>
                  </div>
                  <p className="text-xs text-navy-400">Kenya Data Protection Act — all employee data is encrypted and handled per KDPA guidelines.</p>
                  <p className="text-[11px] text-navy-500 mt-2">Last audit: January 2026 • Next: March 2026</p>
                </div>
                <div className="dash-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center"><FileText size={22} className="text-blue-400" /></div>
                    <div>
                      <h3 className="font-semibold text-white">Mental Health Act</h3>
                      <p className="text-xs text-emerald-400 font-semibold">Compliant</p>
                    </div>
                  </div>
                  <p className="text-xs text-navy-400">All mental health services provided through licensed practitioners as required by Kenyan law.</p>
                  <p className="text-[11px] text-navy-500 mt-2">All providers verified • 24 active licenses</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && <NotificationsPanel />}

          {activeTab === 'settings' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white">Organization Settings</h2>
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="dash-card">
                  <h3 className="text-lg font-semibold text-white mb-4">Organization</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Company Name', value: user?.profile?.firstName ? `${user.profile.firstName}'s Org` : 'Organization' },
                      { label: 'Plan', value: 'Enterprise' },
                      { label: 'Employees', value: '157' },
                      { label: 'Billing Cycle', value: 'Monthly' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-navy-800/30 border border-navy-700/30">
                        <span className="text-sm text-navy-400">{s.label}</span>
                        <span className="text-sm text-white font-medium">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="dash-card">
                  <h3 className="text-lg font-semibold text-white mb-4">Program Configuration</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Max Sessions/Employee', value: '12/month' },
                      { label: 'Telehealth Access', value: 'Enabled' },
                      { label: 'Anonymous Booking', value: 'Enabled' },
                      { label: 'HR Reports', value: 'Anonymized' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-navy-800/30 border border-navy-700/30">
                        <span className="text-sm text-navy-400">{s.label}</span>
                        <span className="text-sm text-white font-medium">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
