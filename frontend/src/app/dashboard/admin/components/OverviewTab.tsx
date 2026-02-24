'use client';

import { useEffect, useState } from 'react';
import {
  Users, Calendar, DollarSign, TrendingUp,
  AlertTriangle, Heart, Zap, ArrowUpRight,
  ArrowDownRight, Video
} from 'lucide-react';
import { dashboardAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface Props {
  analytics: any;
  alerts: any[];
  health: any;
  onViewAlerts: () => void;
}

export default function OverviewTab({ analytics, alerts, health, onViewAlerts }: Props) {
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);

  useEffect(() => {
    dashboardAPI.recentActivity().then(r => setRecentActivity(r.data?.data || [])).catch(() => {});
    dashboardAPI.revenueChart({ period: 'monthly' }).then(r => setRevenueChart(r.data?.data || [])).catch(() => {});
    dashboardAPI.geoDistribution().then(r => setGeoData(r.data?.data || [])).catch(() => {});
  }, []);

  const stats = analytics || {};
  const rev = stats.revenue || {};
  const pts = stats.patients || {};
  const appts = stats.bookings || {};
  const docs = stats.doctors || {};

  const iconMap: Record<string, any> = {
    Calendar, DollarSign, Users, AlertTriangle, Video
  };

  // Build weekly chart from revenue data or fall back to bookings
  const chartData = revenueChart.length > 0
    ? revenueChart.slice(-7).map((r: any) => ({
        label: new Date(r.date).toLocaleDateString('en-KE', { weekday: 'short' }),
        value: r.amount || 0,
      }))
    : [
        { label: 'Mon', value: rev.daily || 0 },
        { label: 'Tue', value: Math.round((rev.monthly || 0) / 4.3) },
        { label: 'Wed', value: Math.round((rev.monthly || 0) / 5) },
        { label: 'Thu', value: Math.round((rev.monthly || 0) / 3.5) },
        { label: 'Fri', value: Math.round((rev.monthly || 0) / 4) },
        { label: 'Sat', value: Math.round((rev.monthly || 0) / 8) },
        { label: 'Sun', value: Math.round((rev.monthly || 0) / 12) },
      ];
  const maxChart = Math.max(...chartData.map(d => d.value), 1);

  const dbLatency = health?.dbLatency ? parseInt(health.dbLatency) : 45;
  const uptimeHrs = health?.uptime ? Math.round(health.uptime / 3600) : 0;
  const memUsed = health?.memoryUsage?.heapUsed ? Math.round(health.memoryUsage.heapUsed / 1024 / 1024) : 0;
  const memTotal = health?.memoryUsage?.heapTotal ? Math.round(health.memoryUsage.heapTotal / 1024 / 1024) : 1;
  const memPct = Math.round((memUsed / memTotal) * 100);

  const healthMetrics = [
    { label: 'DB Latency', value: `${dbLatency}ms`, pct: Math.min(100, 100 - dbLatency) },
    { label: 'Uptime', value: `${uptimeHrs}h`, pct: 99 },
    { label: 'Memory', value: `${memUsed}/${memTotal} MB`, pct: memPct },
    { label: 'Active Users', value: String(health?.counts?.users || pts.total || 0), pct: 60 },
    { label: 'Open Alerts', value: String(health?.counts?.unresolvedAlerts || alerts.length), pct: alerts.length > 0 ? Math.min(100, alerts.length * 20) : 5 },
  ];

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Monthly Revenue', value: formatCurrency(rev.monthly || 0), change: rev.growth || 0, sub: `${formatCurrency(rev.daily || 0)} today`, icon: DollarSign, gradient: 'from-emerald-500/20 to-emerald-600/5', iconBg: 'bg-emerald-500/20', iconClr: 'text-emerald-400', ring: 'ring-emerald-500/20' },
          { label: 'Active Patients', value: (pts.active || 0).toLocaleString(), change: pts.new ? Math.round((pts.new / Math.max(pts.total, 1)) * 100) : 0, sub: `${pts.new || 0} new this month`, icon: Users, gradient: 'from-blue-500/20 to-blue-600/5', iconBg: 'bg-blue-500/20', iconClr: 'text-blue-400', ring: 'ring-blue-500/20' },
          { label: 'Appointments', value: (appts.total || 0).toLocaleString(), change: stats.metrics?.conversionRate || 0, sub: `${appts.pending || 0} pending`, icon: Calendar, gradient: 'from-violet-500/20 to-violet-600/5', iconBg: 'bg-violet-500/20', iconClr: 'text-violet-400', ring: 'ring-violet-500/20' },
          { label: 'Providers', value: String(docs.available || 0), change: 0, sub: `${docs.total || 0} total • ${docs.utilizationRate || 0}% utilization`, icon: Heart, gradient: 'from-amber-500/20 to-amber-600/5', iconBg: 'bg-amber-500/20', iconClr: 'text-amber-400', ring: 'ring-amber-500/20' },
        ].map((card, i) => (
          <div key={i} className={`dash-kpi-card bg-gradient-to-br ${card.gradient} ring-1 ${card.ring}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center`}>
                <card.icon size={22} className={card.iconClr} />
              </div>
              {card.change !== 0 && (
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${card.change > 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                  {card.change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {Math.abs(card.change).toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-xs text-navy-400">{card.label}</p>
            <p className="text-[11px] text-navy-500 mt-2">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2 dash-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Revenue Trend</h2>
              <p className="text-xs text-navy-400 mt-1">{revenueChart.length > 0 ? 'From actual records' : 'Estimated from totals'}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-navy-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gold-400" /> Revenue</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-52">
            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative flex flex-col items-center justify-end h-40">
                  <div className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-gold-400 to-gold-400/60 transition-all duration-500 hover:from-gold-300 hover:to-gold-400 cursor-pointer relative group" style={{ height: `${(d.value / maxChart) * 100}%`, minHeight: '4px' }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-navy-700 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{formatCurrency(d.value)}</div>
                  </div>
                </div>
                <span className="text-xs text-navy-500 font-medium">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-400" /> Risk Alerts
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-bold">{alerts.length} Active</span>
          </div>
          <div className="space-y-3">
            {(alerts.length > 0 ? alerts.slice(0, 4).map(a => ({
              id: a.id,
              level: a.severity || a.riskLevel || 'MODERATE',
              message: a.description || a.message || 'Unresolved alert',
              patient: a.patient?.user?.profile ? `${a.patient.user.profile.firstName} ${a.patient.user.profile.lastName}` : '',
              time: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-KE') : '',
              color: ((a.severity || a.riskLevel) === 'CRITICAL' ? 'border-red-500/30 bg-red-500/5' : (a.severity || a.riskLevel) === 'HIGH' ? 'border-orange-500/30 bg-orange-500/5' : 'border-amber-500/30 bg-amber-500/5'),
              badge: ((a.severity || a.riskLevel) === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : (a.severity || a.riskLevel) === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'),
            })) : [
              { id: '0', level: 'INFO', message: 'No active risk alerts — all clear', patient: '', time: '', color: 'border-emerald-500/30 bg-emerald-500/5', badge: 'bg-emerald-500/20 text-emerald-400' },
            ]).map((alert) => (
              <div key={alert.id} className={`p-3.5 rounded-xl border ${alert.color} hover:bg-navy-700/30 transition-colors cursor-pointer`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${alert.badge}`}>{alert.level}</span>
                  <span className="text-[10px] text-navy-500">{alert.time}</span>
                </div>
                <p className="text-sm text-navy-200">{alert.message}</p>
                {alert.patient && <p className="text-[11px] text-navy-500 mt-1">Patient: {alert.patient}</p>}
              </div>
            ))}
          </div>
          <button onClick={onViewAlerts} className="mt-4 w-full py-2.5 rounded-xl border border-navy-700/50 text-sm text-navy-400 hover:text-gold-400 hover:border-gold-400/30 transition-colors">View All Alerts</button>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Geo Distribution */}
        <div className="dash-card">
          <h2 className="text-lg font-semibold text-white mb-5">Patient Distribution</h2>
          {geoData.length > 0 ? (
            <div className="space-y-4">
              {geoData.slice(0, 6).map((g: any, i: number) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-navy-200 group-hover:text-white transition-colors">{g.county || 'Unknown'}</span>
                    <span className="text-xs font-semibold text-gold-400">{g._count?.county || 0}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-navy-700/50 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-500 transition-all duration-700" style={{ width: `${((g._count?.county || 0) / Math.max(geoData[0]?._count?.county || 1, 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'].map((county, i) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-navy-200">{county}</span>
                    <span className="text-xs text-navy-500">—</span>
                  </div>
                  <div className="h-2 rounded-full bg-navy-700/50" />
                </div>
              ))}
              <p className="text-[11px] text-navy-500 mt-2">No patient location data yet</p>
            </div>
          )}
        </div>

        {/* Live Activity */}
        <div className="dash-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Live Activity</h2>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live</span>
          </div>
          <div className="space-y-1">
            {(recentActivity.length > 0 ? recentActivity.slice(0, 6) : [
              { type: 'info', message: 'No recent activity yet', time: new Date().toISOString(), icon: 'Calendar' },
            ]).map((item: any, i: number) => {
              const IconComp = iconMap[item.icon] || Calendar;
              const colorMap: Record<string, string> = { appointment: 'text-blue-400', payment: 'text-emerald-400', registration: 'text-violet-400', alert: 'text-red-400' };
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-navy-700/30 transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-xl bg-navy-700/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <IconComp size={16} className={colorMap[item.type] || 'text-navy-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-navy-200 leading-snug truncate">{item.message}</p>
                    <p className="text-[11px] text-navy-500 mt-0.5">{item.time ? timeAgo(new Date(item.time)) : ''}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Health */}
        <div className="dash-card">
          <h2 className="text-lg font-semibold text-white mb-5">System Health</h2>
          <div className="space-y-4">
            {healthMetrics.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-navy-300">{item.label}</span>
                  <span className="text-sm font-semibold text-white">{item.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-navy-700/50 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${item.pct > 80 ? 'bg-red-400' : item.pct > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min(item.pct, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className={`mt-5 p-3.5 rounded-xl border ${health?.status === 'operational' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
            <div className="flex items-center gap-2">
              <Zap size={16} className={health?.status === 'operational' ? 'text-emerald-400' : 'text-amber-400'} />
              <span className={`text-sm font-medium ${health?.status === 'operational' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {health?.status === 'operational' ? 'All Systems Operational' : 'Checking...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
