'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Calendar, Clock, MessageCircle, FileText,
  Bell, Settings, LogOut, User, TrendingUp, Video,
  ChevronRight, AlertCircle, Menu, X, Search,
  BookOpen, Activity, Target, Smile, ArrowUpRight, Zap
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { appointmentAPI, notificationAPI } from '@/lib/api';
import { formatDate, getInitials } from '@/lib/utils';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      appointmentAPI.list({ limit: 5 }).then(({ data }) => setAppointments(data.data?.data || [])).catch(() => {});
    }
  }, [isAuthenticated]);

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      notificationAPI.list({ limit: 10 }).then(r => setNotifications(r.data?.data || [])).catch(() => {});
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
    { icon: Calendar, label: 'Appointments', id: 'appointments' },
    { icon: MessageCircle, label: 'Messages', id: 'messages' },
    { icon: FileText, label: 'Records', id: 'records' },
    { icon: Video, label: 'Telehealth', id: 'telehealth' },
    { icon: Activity, label: 'Progress', id: 'progress' },
    { icon: Bell, label: 'Notifications', id: 'notifications', badge: notifications.filter(n => !n.isRead).length || undefined },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  const quickActions = [
    { icon: Calendar, label: 'Book Session', href: '/book', desc: 'Schedule your next therapy session', color: 'from-blue-500/20 to-blue-600/5', iconClr: 'text-blue-400', ring: 'ring-blue-500/20' },
    { icon: MessageCircle, label: 'AI Chat', href: '#', desc: 'Talk to our AI wellness assistant', color: 'from-emerald-500/20 to-emerald-600/5', iconClr: 'text-emerald-400', ring: 'ring-emerald-500/20' },
    { icon: Video, label: 'Telehealth', href: '#', desc: 'Join your virtual session', color: 'from-violet-500/20 to-violet-600/5', iconClr: 'text-violet-400', ring: 'ring-violet-500/20' },
    { icon: FileText, label: 'My Records', href: '#', desc: 'View medical history & notes', color: 'from-amber-500/20 to-amber-600/5', iconClr: 'text-amber-400', ring: 'ring-amber-500/20' },
  ];

  const wellnessMetrics = [
    { label: 'Mood Score', value: 78, icon: Smile, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { label: 'Sleep Quality', value: 65, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { label: 'Stress Level', value: 42, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { label: 'Goal Progress', value: 85, icon: Target, color: 'text-violet-400', bg: 'bg-violet-500/20' },
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
              <p className="text-[10px] text-navy-400 tracking-widest uppercase">Patient Portal</p>
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

      {/* Mobile Header */}
      <div className="dash-mobile-header lg:hidden">
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg text-navy-300 hover:bg-navy-700/50"><Menu size={22} /></button>
        <span className="font-display font-bold text-white">LIFE<span className="text-gold-400">LINK</span></span>
        <button className="p-2 rounded-lg text-navy-300 hover:bg-navy-700/50 relative">
          <Bell size={20} /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
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
            <h1 className="text-xl font-bold text-white">{greeting()}, {user?.profile?.firstName || 'there'} 👋</h1>
            <p className="text-sm text-navy-400">Here&apos;s your wellness overview</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="dash-topbar__icon-btn relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">3</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 text-navy-900 flex items-center justify-center font-bold text-sm">
              {getInitials(user?.profile?.firstName, user?.profile?.lastName)}
            </div>
          </div>
        </header>

        <div className="dash-content">
          {activeTab === 'overview' && (<>
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href} className={`dash-kpi-card bg-gradient-to-br ${action.color} ring-1 ${action.ring} hover:ring-2 group`}>
                <div className={`w-12 h-12 rounded-2xl bg-navy-700/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon size={22} className={action.iconClr} />
                </div>
                <p className="text-base font-semibold text-white mb-1">{action.label}</p>
                <p className="text-xs text-navy-400">{action.desc}</p>
              </Link>
            ))}
          </div>

          {/* Wellness Metrics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {wellnessMetrics.map((m, i) => (
              <div key={i} className="dash-card">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center`}>
                    <m.icon size={18} className={m.color} />
                  </div>
                  <span className="text-2xl font-bold text-white">{m.value}<span className="text-sm text-navy-500">/100</span></span>
                </div>
                <p className="text-xs text-navy-400 mb-2">{m.label}</p>
                <div className="h-1.5 rounded-full bg-navy-700/50 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${
                    m.value > 70 ? 'bg-emerald-400' : m.value > 50 ? 'bg-amber-400' : 'bg-red-400'
                  }`} style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Appointments */}
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 dash-card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">Upcoming Appointments</h2>
                <Link href="/book" className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 font-medium">
                  Book New <ChevronRight size={14} />
                </Link>
              </div>
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.slice(0, 5).map((appt, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-navy-800/30 border border-navy-700/30 hover:border-navy-600/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          appt.type === 'TELEHEALTH' ? 'bg-violet-500/20' : 'bg-blue-500/20'
                        }`}>
                          {appt.type === 'TELEHEALTH' ? <Video size={18} className="text-violet-400" /> : <Calendar size={18} className="text-blue-400" />}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{appt.type?.replace('_', ' ') || 'Therapy Session'}</p>
                          <p className="text-xs text-navy-400 mt-0.5">{formatDate(appt.appointmentDate)}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
                        appt.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' :
                        appt.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                        appt.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-navy-700/50 text-navy-400'
                      }`}>{appt.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-navy-700/30 flex items-center justify-center mx-auto mb-4">
                    <Calendar size={28} className="text-navy-500" />
                  </div>
                  <p className="text-navy-300 mb-1">No appointments yet</p>
                  <p className="text-xs text-navy-500 mb-4">Book your first session and start your wellness journey</p>
                  <Link href="/book" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 text-sm font-semibold hover:shadow-lg hover:shadow-gold-400/20 transition-all">
                    Book Session <ArrowUpRight size={14} />
                  </Link>
                </div>
              )}
            </div>

            {/* Wellness Tips */}
            <div className="dash-card">
              <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <Zap size={18} className="text-gold-400" /> Daily Wellness
              </h2>
              <div className="space-y-3">
                {[
                  { tip: 'Practice 5 minutes of mindful breathing', icon: '🧘', done: true },
                  { tip: 'Take a 15-minute walk outdoors', icon: '🚶', done: true },
                  { tip: 'Write 3 things you are grateful for', icon: '📝', done: false },
                  { tip: 'Drink 8 glasses of water today', icon: '💧', done: false },
                  { tip: 'Connect with a friend or loved one', icon: '💛', done: false },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                    item.done ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-navy-800/30 border-navy-700/30 hover:border-navy-600/50'
                  }`}>
                    <span className="text-lg">{item.icon}</span>
                    <span className={`text-sm flex-1 ${item.done ? 'text-navy-400 line-through' : 'text-navy-200'}`}>{item.tip}</span>
                    {item.done && <span className="text-emerald-400 text-xs">✓</span>}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-gold-400/10 to-transparent border border-gold-400/10">
                <p className="text-xs text-gold-400 font-semibold">Today&apos;s Progress</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 rounded-full bg-navy-700/50 overflow-hidden">
                    <div className="h-full rounded-full bg-gold-400 w-2/5 transition-all" />
                  </div>
                  <span className="text-xs text-navy-400">2/5</span>
                </div>
              </div>
            </div>
          </div>
          </>)}

          {activeTab === 'appointments' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">My Appointments</h2>
                <Link href="/book" className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 text-sm font-semibold">+ Book Session</Link>
              </div>
              <div className="dash-card">
                {appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.map((appt, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-navy-800/30 border border-navy-700/30 hover:border-navy-600/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${appt.type === 'TELEHEALTH' ? 'bg-violet-500/20' : 'bg-blue-500/20'}`}>
                            {appt.type === 'TELEHEALTH' ? <Video size={18} className="text-violet-400" /> : <Calendar size={18} className="text-blue-400" />}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{appt.type?.replace('_', ' ') || 'Session'}</p>
                            <p className="text-xs text-navy-400 mt-0.5">{formatDate(appt.appointmentDate)}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${appt.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' : appt.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>{appt.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar size={32} className="text-navy-500 mx-auto mb-3" />
                    <p className="text-navy-300">No appointments scheduled</p>
                    <Link href="/book" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 text-sm font-semibold">Book Your First Session</Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white">Messages</h2>
              <div className="dash-card">
                <div className="space-y-3">
                  {[
                    { from: 'Dr. Wanjiku', preview: 'Your session notes from today are ready for review...', time: '2 hrs ago', unread: true },
                    { from: 'LIFELINK Support', preview: 'Welcome to LIFELINK! Here are some tips to get started...', time: '1 day ago', unread: false },
                    { from: 'Dr. Odhiambo', preview: 'I have updated your treatment plan. Please review...', time: '3 days ago', unread: false },
                  ].map((msg, i) => (
                    <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${msg.unread ? 'bg-gold-400/5 border-gold-400/20' : 'bg-navy-800/30 border-navy-700/30 hover:border-navy-600/50'}`}>
                      <div className="w-10 h-10 rounded-xl bg-navy-700/50 flex items-center justify-center flex-shrink-0">
                        <MessageCircle size={18} className={msg.unread ? 'text-gold-400' : 'text-navy-400'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${msg.unread ? 'text-white' : 'text-navy-300'}`}>{msg.from}</p>
                          <span className="text-[11px] text-navy-500">{msg.time}</span>
                        </div>
                        <p className="text-xs text-navy-400 mt-1 truncate">{msg.preview}</p>
                      </div>
                      {msg.unread && <span className="w-2 h-2 rounded-full bg-gold-400 flex-shrink-0 mt-2" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white">Medical Records</h2>
              <div className="dash-card">
                <div className="space-y-3">
                  {[
                    { type: 'Session Notes', date: 'Feb 10, 2026', doctor: 'Dr. Wanjiku', desc: 'Individual Therapy — Progress review' },
                    { type: 'Treatment Plan', date: 'Feb 1, 2026', doctor: 'Dr. Wanjiku', desc: 'Updated treatment goals and milestones' },
                    { type: 'Psychiatric Review', date: 'Jan 20, 2026', doctor: 'Dr. Odhiambo', desc: 'Medication review and adjustment' },
                    { type: 'Initial Assessment', date: 'Jan 5, 2026', doctor: 'Dr. Wanjiku', desc: 'Comprehensive intake assessment' },
                  ].map((rec, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-navy-800/30 border border-navy-700/30 hover:border-navy-600/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><FileText size={18} className="text-blue-400" /></div>
                        <div>
                          <p className="text-sm font-medium text-white">{rec.type}</p>
                          <p className="text-xs text-navy-400">{rec.desc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-navy-300">{rec.date}</p>
                        <p className="text-[11px] text-navy-500">{rec.doctor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'telehealth' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white">Telehealth</h2>
              <div className="dash-card text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                  <Video size={32} className="text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Virtual Sessions</h3>
                <p className="text-sm text-navy-400 max-w-md mx-auto mb-6">Join your scheduled telehealth sessions from the comfort of your home. Make sure your camera and microphone are working.</p>
                <Link href="/book" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 text-sm font-semibold">Book Telehealth Session</Link>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white">My Progress</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {wellnessMetrics.map((m, i) => (
                  <div key={i} className="dash-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center`}>
                        <m.icon size={18} className={m.color} />
                      </div>
                      <span className="text-2xl font-bold text-white">{m.value}<span className="text-sm text-navy-500">/100</span></span>
                    </div>
                    <p className="text-xs text-navy-400 mb-2">{m.label}</p>
                    <div className="h-1.5 rounded-full bg-navy-700/50 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${m.value > 70 ? 'bg-emerald-400' : m.value > 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${m.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="dash-card">
                <h3 className="text-lg font-semibold text-white mb-4">Weekly Mood Trend</h3>
                <div className="flex items-end gap-3 h-40">
                  {[65, 70, 60, 75, 78, 82, 78].map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-gold-400 to-gold-400/60" style={{ height: `${v}%` }} />
                      <span className="text-[11px] text-navy-500">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && <NotificationsPanel />}

          {activeTab === 'settings' && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-white">Account Settings</h2>
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="dash-card">
                  <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Name', value: `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}` },
                      { label: 'Email', value: user?.email || '' },
                      { label: 'Phone', value: user?.phone || 'Not set' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-navy-800/30 border border-navy-700/30">
                        <span className="text-sm text-navy-400">{s.label}</span>
                        <span className="text-sm text-white">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="dash-card">
                  <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Language', value: 'English' },
                      { label: 'Notifications', value: 'Email & SMS' },
                      { label: 'Session Reminders', value: '1 hour before' },
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
