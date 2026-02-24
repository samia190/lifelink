'use client';

import { useState, useEffect } from 'react';
import { Calendar, Loader2, Check, X, Clock, RefreshCcw } from 'lucide-react';
import { appointmentAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AppointmentsTab() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [cancelling, setCancelling] = useState('');
  const [confirming, setConfirming] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 30 };
      if (filter) params.status = filter;
      const r = await appointmentAPI.list(params);
      setAppointments(r.data?.data || []);
    } catch {}
    setLoading(false);
  };

  const handleConfirm = async (id: string) => {
    setConfirming(id);
    try {
      await appointmentAPI.confirm(id);
      toast.success('Appointment confirmed');
      loadAppointments();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    setConfirming('');
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    setCancelling(id);
    try {
      await appointmentAPI.cancel(id, { reason: 'Cancelled by admin' });
      toast.success('Appointment cancelled');
      loadAppointments();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    setCancelling('');
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-500/10 text-amber-400',
    CONFIRMED: 'bg-emerald-500/10 text-emerald-400',
    IN_PROGRESS: 'bg-blue-500/10 text-blue-400',
    COMPLETED: 'bg-blue-500/10 text-blue-400',
    CANCELLED: 'bg-red-500/10 text-red-400',
    NO_SHOW: 'bg-red-500/10 text-red-400',
    RESCHEDULED: 'bg-violet-500/10 text-violet-400',
  };

  const filters = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Appointments</h2>
        <div className="flex gap-2">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-gold-400/20 text-gold-400 border border-gold-400/30' : 'border border-navy-700/50 text-navy-400 hover:text-white'}`}>
              {f || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-card">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 size={24} className="text-gold-400 animate-spin" /></div>
        ) : appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((appt: any) => {
              const patient = appt.patient?.user?.profile;
              const doctor = appt.doctor?.user?.profile;
              const isPending = appt.status === 'PENDING';
              const isConfirmed = appt.status === 'CONFIRMED';
              return (
                <div key={appt.id} className="flex items-center gap-4 p-4 rounded-xl bg-navy-800/30 border border-navy-700/30 hover:border-navy-600/50 transition-colors">
                  <div className="w-14 text-center flex-shrink-0">
                    <p className="text-sm font-bold text-white">{appt.startTime ? new Date(appt.startTime).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                    <p className="text-[10px] text-navy-500">{appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }) : ''}</p>
                  </div>
                  <div className="w-0.5 h-12 rounded-full bg-navy-700 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">
                      {patient?.firstName || 'Patient'} {patient?.lastName || ''} <span className="text-navy-500">→</span> Dr. {doctor?.firstName || ''} {doctor?.lastName || ''}
                    </p>
                    <p className="text-xs text-navy-400">{appt.type?.replace('_', ' ') || 'Session'} {appt.reason ? `• ${appt.reason}` : ''}</p>
                    {appt.isEmergency && <span className="text-[10px] font-bold text-red-400 uppercase">Emergency</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${statusColors[appt.status] || 'bg-navy-700/50 text-navy-400'}`}>{appt.status}</span>
                    {isPending && (
                      <button onClick={() => handleConfirm(appt.id)} disabled={confirming === appt.id} className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50" title="Confirm">
                        {confirming === appt.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                    )}
                    {(isPending || isConfirmed) && (
                      <button onClick={() => handleCancel(appt.id)} disabled={cancelling === appt.id} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50" title="Cancel">
                        {cancelling === appt.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar size={32} className="text-navy-600 mx-auto mb-3" />
            <p className="text-navy-400">No appointments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
