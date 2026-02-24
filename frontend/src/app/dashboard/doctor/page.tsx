'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Calendar, Users, Clock, Video, Bell,
  LogOut, Settings, FileText, MessageCircle,
  TrendingUp, AlertTriangle, Menu, X, Search,
  Activity, CheckCircle, ArrowUpRight, Zap, Stethoscope
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { appointmentAPI, dashboardAPI } from '@/lib/api';
import { getInitials, formatDate, formatTime } from '@/lib/utils';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import toast from 'react-hot-toast';

export default function DoctorDashboard() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [myPatients, setMyPatients] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      Promise.all([
        appointmentAPI.list({ limit: 20 }).catch(() => null),
        dashboardAPI.riskAlerts({ resolved: 'false' }).catch(() => null),
        dashboardAPI.doctorPatients().catch(() => null),
      ]).then(([apptRes, alertRes, patRes]) => {
        if (apptRes?.data?.data) setAppointments(Array.isArray(apptRes.data.data) ? apptRes.data.data : apptRes.data.data.data || []);
        if (alertRes?.data?.data) setAlerts(alertRes.data.data);
        if (patRes?.data?.data) setMyPatients(patRes.data.data);
      }).finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

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

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const sidebarItems = [
    { icon: TrendingUp, label: 'Overview', id: 'overview' },
    { icon: Calendar, label: 'Schedule', id: 'schedule' },
    { icon: Users, label: 'My Patients', id: 'patients' },
    { icon: FileText, label: 'Session Notes', id: 'notes' },
    { icon: Video, label: 'Telehealth', id: 'telehealth' },
    { icon: MessageCircle, label: 'Messages', id: 'messages' },
    { icon: AlertTriangle, label: 'Risk Alerts', id: 'alerts', badge: alerts.length || undefined },
    { icon: Bell, label: 'Notifications', id: 'notifications' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  const todaySchedule = appointments.length > 0
    ? appointments.slice(0, 8).map(a => ({
        time: a.appointmentDate ? new Date(a.appointmentDate).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--',
        patient: a.patient ? `${a.patient.profile?.firstName || ''} ${(a.patient.profile?.lastName || '').charAt(0)}.` : 'Patient',
        type: a.type?.replace('_', ' ') || 'Session',
        mode: a.type === 'TELEHEALTH' ? 'Telehealth' : 'In-Person',
        status: a.status === 'COMPLETED' ? 'completed' : a.status === 'IN_PROGRESS' ? 'in-progress' : 'upcoming',
      }))
    : [
        { time: '09:00', patient: 'No appointments', type: 'Schedule is clear', mode: 'In-Person', status: 'upcoming' as const },
      ];

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
              <p className="text-[10px] text-navy-400 tracking-widest uppercase">Doctor Portal</p>
            </div>
          </Link>
        </div>
        <nav className="dash-sidebar__nav">
          {sidebarItems.map((item) => (
            <button key={item.label} onClick={() => setActiveTab(item.id)} className={`dash-sidebar__link ${activeTab === item.id ? 'dash-sidebar__link--active' : ''}`}>
              <item.icon size={20} /><span>{item.label}</span>
              {item.badge && <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">{item.badge}</span>}
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
            <h1 className="text-xl font-bold text-white">{greeting()}, Dr. {user?.profile?.lastName || 'Doctor'} 🩺</h1>
            <p className="text-sm text-navy-400">You have {todaySchedule.filter(s => s.status === 'upcoming').length} sessions remaining today</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="dash-topbar__icon-btn relative">
              <Bell size={20} /><span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">2</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 text-navy-900 flex items-center justify-center font-bold text-sm">
              {getInitials(user?.profile?.firstName, user?.profile?.lastName)}
            </div>
          </div>
        </header>

        <div className="dash-content">
          {activeTab === 'overview' && (<>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {[
              { label: "Today's Sessions", value: String(todaySchedule.length), sub: `${todaySchedule.filter(s => s.status === 'completed').length} completed`, icon: Calendar, gradient: 'from-blue-500/20 to-blue-600/5', iconBg: 'bg-blue-500/20', iconClr: 'text-blue-400', ring: 'ring-blue-500/20' },
              { label: 'This Week', value: String(appointments.length), sub: `${appointments.filter(a => a.type === 'TELEHEALTH').length} telehealth`, icon: Clock, gradient: 'from-violet-500/20 to-violet-600/5', iconBg: 'bg-violet-500/20', iconClr: 'text-violet-400', ring: 'ring-violet-500/20' },
              { label: 'Active Patients', value: String(myPatients.length || 0), sub: 'Under your care', icon: Users, gradient: 'from-emerald-500/20 to-emerald-600/5', iconBg: 'bg-emerald-500/20', iconClr: 'text-emerald-400', ring: 'ring-emerald-500/20' },
              { label: 'Risk Alerts', value: String(alerts.length), sub: alerts.length > 0 ? `${alerts.filter(a => a.severity === 'CRITICAL').length} critical` : 'All clear', icon: AlertTriangle, gradient: 'from-red-500/20 to-red-600/5', iconBg: 'bg-red-500/20', iconClr: 'text-red-400', ring: 'ring-red-500/20' },
            ].map((card, i) => (
              <div key={i} className={`dash-kpi-card bg-gradient-to-br ${card.gradient} ring-1 ${card.ring}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center`}>
                    <card.icon size={22} className={card.iconClr} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
                <p className="text-xs text-navy-400">{card.label}</p>
                <p className="text-[11px] text-navy-500 mt-2">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Schedule + Alerts */}
          <div className="grid lg:grid-cols-3 gap-5 mb-8">
            <div className="lg:col-span-2 dash-card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">Today&apos;s Schedule</h2>
                  <p className="text-xs text-navy-400 mt-1">{currentTime.toLocaleDateString('en-KE', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-navy-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Completed</span>
                  <span className="flex items-center gap-1.5 text-navy-400"><span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" /> Active</span>
                </div>
              </div>
              <div className="space-y-2">
                {todaySchedule.map((session, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    session.status === 'completed' ? 'bg-navy-800/20 border-navy-700/20 opacity-60' :
                    session.status === 'in-progress' ? 'bg-gold-400/5 border-gold-400/20' :
                    'bg-navy-800/30 border-navy-700/30 hover:border-navy-600/50'
                  }`}>
                    <div className="text-center w-14 flex-shrink-0">
                      <p className={`text-lg font-bold ${session.status === 'in-progress' ? 'text-gold-400' : 'text-white'}`}>{session.time}</p>
                    </div>
                    <div className={`w-0.5 h-10 rounded-full flex-shrink-0 ${
                      session.status === 'completed' ? 'bg-emerald-400/30' :
                      session.status === 'in-progress' ? 'bg-gold-400' : 'bg-navy-700'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{session.patient}</p>
                      <p className="text-xs text-navy-400">{session.type}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-lg flex-shrink-0 ${
                      session.mode === 'Telehealth' ? 'bg-violet-500/10 text-violet-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {session.mode === 'Telehealth' ? '💻' : '🏥'} {session.mode}
                    </span>
                    {session.status === 'in-progress' && (
                      <span className="flex items-center gap-1 text-xs text-gold-400 font-semibold bg-gold-400/10 px-2.5 py-1 rounded-lg">
                        <Activity size={12} /> Active
                      </span>
                    )}
                    {session.status === 'completed' && <CheckCircle size={18} className="text-emerald-400/50 flex-shrink-0" />}
                    {session.status === 'upcoming' && session.mode === 'Telehealth' && (
                      <button className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 font-semibold hover:shadow-lg hover:shadow-gold-400/20">
                        <Video size={12} className="inline mr-1" /> Start
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Alerts */}
            <div className="dash-card">
              <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-400" /> Active Alerts
              </h2>
              <div className="space-y-3 mb-5">
                <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/5">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">CRITICAL</span>
                  <p className="text-sm text-navy-200 mt-2">Patient requires immediate follow-up — elevated risk score detected</p>
                  <p className="text-[11px] text-navy-500 mt-1">3 hours ago</p>
                </div>
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">MODERATE</span>
                  <p className="text-sm text-navy-200 mt-2">Patient missed 2 consecutive sessions — outreach recommended</p>
                  <p className="text-[11px] text-navy-500 mt-1">1 day ago</p>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-white mb-3 mt-6">Recent Notes</h3>
              <div className="space-y-2">
                {['Sarah M.', 'James K.', 'Grace W.'].map((name, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-navy-800/30 border border-navy-700/30 hover:border-navy-600/50 transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-white">{name}</p>
                      <p className="text-[11px] text-navy-500">Session notes • AI summary ready</p>
                    </div>
                    <span className="text-[11px] text-navy-500">{i + 1}d ago</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </>)}

          {activeTab === 'schedule' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Weekly Schedule</h2>
                <div className="flex gap-2">
                  {['Today', 'This Week', 'This Month'].map(f => (
                    <button key={f} className="text-xs px-3 py-1.5 rounded-lg border border-navy-700/50 text-navy-400 hover:text-gold-400 hover:border-gold-400/30 transition-colors">{f}</button>
                  ))}
                </div>
              </div>
              <div className="dash-card">
                <div className="space-y-2">
                  {todaySchedule.map((session, i) => (
                    <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                      session.status === 'completed' ? 'bg-navy-800/20 border-navy-700/20 opacity-60' :
                      session.status === 'in-progress' ? 'bg-gold-400/5 border-gold-400/20' :
                      'bg-navy-800/30 border-navy-700/30 hover:border-navy-600/50'
                    }`}>
                      <div className="text-center w-14 flex-shrink-0">
                        <p className={`text-lg font-bold ${session.status === 'in-progress' ? 'text-gold-400' : 'text-white'}`}>{session.time}</p>
                      </div>
                      <div className={`w-0.5 h-10 rounded-full flex-shrink-0 ${
                        session.status === 'completed' ? 'bg-emerald-400/30' :
                        session.status === 'in-progress' ? 'bg-gold-400' : 'bg-navy-700'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm">{session.patient}</p>
                        <p className="text-xs text-navy-400">{session.type}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-lg flex-shrink-0 ${
                        session.mode === 'Telehealth' ? 'bg-violet-500/10 text-violet-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>{session.mode}</span>
                      {session.status === 'completed' && <CheckCircle size={18} className="text-emerald-400/50 flex-shrink-0" />}
                      {session.status === 'in-progress' && <span className="text-xs text-gold-400 font-semibold bg-gold-400/10 px-2.5 py-1 rounded-lg"><Activity size={12} className="inline mr-1" />Active</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white">My Patients</h2>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {myPatients.length > 0 ? myPatients.map((p: any, i: number) => (
                  <div key={p.id || i} className="dash-card hover:border-gold-400/20 cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-white">{p.profile?.firstName} {p.profile?.lastName}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">{p.status || 'Active'}</span>
                    </div>
                    <p className="text-xs text-navy-400 mb-3">{p.email}</p>
                    <p className="text-[11px] text-navy-500">Joined: {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</p>
                  </div>
                )) : (
                  <div className="dash-card col-span-full text-center py-8">
                    <Users size={32} className="text-navy-600 mx-auto mb-3" />
                    <p className="text-navy-400">No patients assigned yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white">Session Notes</h2>
              <div className="dash-card">
                <div className="space-y-3">
                  {[
                    { patient: 'Sarah M.', date: 'Today', type: 'Individual Therapy', summary: 'Patient shows improved coping mechanisms. Discussed workplace stress triggers.', aiReady: true },
                    { patient: 'James K.', date: 'Today', type: 'Follow-up', summary: 'Medication adjustment discussed. Patient reports better sleep quality.', aiReady: true },
                    { patient: 'Grace W.', date: 'Today', type: 'Initial Assessment', summary: 'Comprehensive intake completed. Presenting concerns: anxiety, work-life balance.', aiReady: false },
                    { patient: 'Daniel O.', date: 'Yesterday', type: 'Couples Therapy', summary: 'Communication exercises assigned. Both partners engaged positively.', aiReady: true },
                  ].map((note, i) => (
                    <div key={i} className="p-4 rounded-xl bg-navy-800/30 border border-navy-700/30 hover:border-navy-600/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{note.patient}</p>
                          <span className="text-xs px-2 py-0.5 rounded bg-navy-700/50 text-navy-400">{note.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {note.aiReady && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 font-semibold">🤖 AI Summary</span>}
                          <span className="text-[11px] text-navy-500">{note.date}</span>
                        </div>
                      </div>
                      <p className="text-xs text-navy-300">{note.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'telehealth' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white">Telehealth Sessions</h2>
              <div className="grid sm:grid-cols-3 gap-5 mb-5">
                <div className="dash-card text-center">
                  <Video size={28} className="text-violet-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">1</p>
                  <p className="text-xs text-navy-400">Active Now</p>
                </div>
                <div className="dash-card text-center">
                  <Calendar size={28} className="text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">3</p>
                  <p className="text-xs text-navy-400">Scheduled Today</p>
                </div>
                <div className="dash-card text-center">
                  <Clock size={28} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">45 min</p>
                  <p className="text-xs text-navy-400">Avg Session Length</p>
                </div>
              </div>
              <div className="dash-card">
                <h3 className="text-lg font-semibold text-white mb-4">Upcoming Virtual Sessions</h3>
                <div className="space-y-3">
                  {todaySchedule.filter(s => s.mode === 'Telehealth').map((s, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-navy-800/30 border border-navy-700/30">
                      <div className="w-12 text-center"><p className="text-lg font-bold text-white">{s.time}</p></div>
                      <div className="flex-1"><p className="text-sm font-medium text-white">{s.patient}</p><p className="text-xs text-navy-400">{s.type}</p></div>
                      {s.status === 'upcoming' && (
                        <button className="text-xs px-4 py-2 rounded-lg bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 font-semibold">
                          <Video size={14} className="inline mr-1" /> Start Session
                        </button>
                      )}
                      {s.status === 'completed' && <CheckCircle size={18} className="text-emerald-400/50" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white">Messages</h2>
              <div className="dash-card">
                <div className="space-y-3">
                  {[
                    { from: 'Sarah M.', preview: 'Thank you for today\'s session, I feel much better...', time: '1 hr ago', unread: true },
                    { from: 'Admin Office', preview: 'New patient referral: Daniel O. has been assigned to you', time: '3 hrs ago', unread: true },
                    { from: 'James K.', preview: 'Can we reschedule Thursday\'s session to 3 PM?', time: '1 day ago', unread: false },
                    { from: 'Dr. Odhiambo', preview: 'Patient case discussion — can we meet this week?', time: '2 days ago', unread: false },
                  ].map((msg, i) => (
                    <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${msg.unread ? 'bg-gold-400/5 border-gold-400/20' : 'bg-navy-800/30 border-navy-700/30 hover:border-navy-600/50'}`}>
                      <div className="w-10 h-10 rounded-xl bg-navy-700/50 flex items-center justify-center flex-shrink-0">
                        <MessageCircle size={18} className={msg.unread ? 'text-gold-400' : 'text-navy-400'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between"><p className={`text-sm font-medium ${msg.unread ? 'text-white' : 'text-navy-300'}`}>{msg.from}</p><span className="text-[11px] text-navy-500">{msg.time}</span></div>
                        <p className="text-xs text-navy-400 mt-1 truncate">{msg.preview}</p>
                      </div>
                      {msg.unread && <span className="w-2 h-2 rounded-full bg-gold-400 flex-shrink-0 mt-2" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><AlertTriangle size={22} className="text-red-400" /> Patient Risk Alerts</h2>
              {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert: any, i: number) => (
                  <div key={alert.id || i} className={`dash-card border-l-4 ${alert.severity === 'CRITICAL' ? '!border-l-red-500' : alert.severity === 'HIGH' ? '!border-l-orange-500' : '!border-l-amber-500'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'}`}>{alert.severity}</span>
                      <span className="text-[11px] text-navy-500">{alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                    <p className="text-sm text-navy-200 mb-3">{alert.message}</p>
                  </div>
                ))}
              </div>
              ) : (
                <div className="dash-card text-center py-12">
                  <AlertTriangle size={32} className="text-navy-600 mx-auto mb-3" />
                  <p className="text-navy-300">No active risk alerts</p>
                  <p className="text-xs text-navy-500 mt-1">All patients are within normal parameters</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && <NotificationsPanel />}

          {activeTab === 'settings' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="dash-card">
                  <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Name', value: `Dr. ${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}` },
                      { label: 'Email', value: user?.email || '' },
                      { label: 'Specialty', value: 'Clinical Psychology' },
                      { label: 'License', value: 'KPC/2024/XXXX' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-navy-800/30 border border-navy-700/30">
                        <span className="text-sm text-navy-400">{s.label}</span>
                        <span className="text-sm text-white">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="dash-card">
                  <h3 className="text-lg font-semibold text-white mb-4">Availability</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Working Hours', value: '9:00 AM - 5:00 PM' },
                      { label: 'Working Days', value: 'Mon - Fri' },
                      { label: 'Session Duration', value: '50 minutes' },
                      { label: 'Telehealth', value: 'Enabled' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-navy-800/30 border border-navy-700/30">
                        <span className="text-sm text-navy-400">{s.label}</span>
                        <span className="text-sm text-white">{s.value}</span>
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
