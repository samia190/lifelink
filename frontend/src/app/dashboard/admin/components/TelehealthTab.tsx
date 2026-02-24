'use client';

import { useState, useEffect } from 'react';
import { Video, Calendar, TrendingUp, Loader2, Clock } from 'lucide-react';
import { dashboardAPI } from '@/lib/api';

export default function TelehealthTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.telehealthSessions()
      .then(r => { setData(r.data?.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="text-gold-400 animate-spin" /></div>;

  const sessions = data?.sessions || [];
  const active = sessions.filter((s: any) => s.status === 'ACTIVE');
  const scheduled = sessions.filter((s: any) => s.status === 'SCHEDULED');
  const completed = sessions.filter((s: any) => s.status === 'COMPLETED');

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-white">Telehealth Sessions</h2>

      {/* KPIs */}
      <div className="grid sm:grid-cols-4 gap-5">
        <div className="dash-card text-center">
          <Video size={28} className="text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{data?.activeSessions || active.length}</p>
          <p className="text-xs text-navy-400">Active Now</p>
        </div>
        <div className="dash-card text-center">
          <Calendar size={28} className="text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{data?.scheduledToday || scheduled.length}</p>
          <p className="text-xs text-navy-400">Scheduled</p>
        </div>
        <div className="dash-card text-center">
          <TrendingUp size={28} className="text-violet-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{data?.completionRate || 0}%</p>
          <p className="text-xs text-navy-400">Completion Rate</p>
        </div>
        <div className="dash-card text-center">
          <Clock size={28} className="text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{data?.completedTotal || completed.length}</p>
          <p className="text-xs text-navy-400">Total Completed</p>
        </div>
      </div>

      {/* Active Sessions */}
      {active.length > 0 && (
        <div className="dash-card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Sessions
          </h3>
          <div className="space-y-3">
            {active.map((s: any) => {
              const doctor = s.doctor?.user?.profile;
              const patient = s.appointment?.patient?.user?.profile;
              const mins = s.startedAt ? Math.round((Date.now() - new Date(s.startedAt).getTime()) / 60000) : 0;
              return (
                <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">Dr. {doctor?.firstName} {doctor?.lastName} → {patient?.firstName || 'Patient'} {patient?.lastName || ''}</p>
                    <p className="text-xs text-navy-400">Room: {s.roomId} • {mins} min elapsed</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Sessions Table */}
      <div className="dash-card">
        <h3 className="text-lg font-semibold text-white mb-4">All Sessions</h3>
        {sessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-navy-700/50">
                <th className="text-left py-3 px-4 text-navy-400 font-medium">Doctor</th>
                <th className="text-left py-3 px-4 text-navy-400 font-medium">Patient</th>
                <th className="text-left py-3 px-4 text-navy-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-navy-400 font-medium">Duration</th>
                <th className="text-left py-3 px-4 text-navy-400 font-medium">Date</th>
              </tr></thead>
              <tbody>
                {sessions.slice(0, 20).map((s: any) => {
                  const doctor = s.doctor?.user?.profile;
                  const patient = s.appointment?.patient?.user?.profile;
                  const statusColors: Record<string, string> = {
                    ACTIVE: 'bg-emerald-500/10 text-emerald-400',
                    SCHEDULED: 'bg-blue-500/10 text-blue-400',
                    COMPLETED: 'bg-violet-500/10 text-violet-400',
                    CANCELLED: 'bg-red-500/10 text-red-400',
                    WAITING: 'bg-amber-500/10 text-amber-400',
                  };
                  return (
                    <tr key={s.id} className="border-b border-navy-700/20 hover:bg-navy-700/20 transition-colors">
                      <td className="py-3 px-4 text-white">Dr. {doctor?.firstName} {doctor?.lastName}</td>
                      <td className="py-3 px-4 text-navy-300">{patient?.firstName || 'Unknown'} {patient?.lastName || ''}</td>
                      <td className="py-3 px-4"><span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[s.status] || 'bg-navy-700/50 text-navy-400'}`}>{s.status}</span></td>
                      <td className="py-3 px-4 text-navy-300">{s.duration ? `${s.duration} min` : '—'}</td>
                      <td className="py-3 px-4 text-navy-300">{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-KE') : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Video size={32} className="text-navy-600 mx-auto mb-3" />
            <p className="text-navy-400">No telehealth sessions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
