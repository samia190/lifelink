'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { dashboardAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Props {
  alerts: any[];
  setAlerts: (fn: (prev: any[]) => any[]) => void;
}

export default function AlertsTab({ alerts, setAlerts }: Props) {
  const handleResolve = async (id: string) => {
    try {
      await dashboardAPI.resolveAlert(id, { resolution: 'Resolved by admin' });
      setAlerts((prev: any[]) => prev.filter(a => a.id !== id));
      toast.success('Alert resolved');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <AlertTriangle size={22} className="text-red-400" /> Risk Alert Center
      </h2>
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert: any) => {
            const level = alert.severity || alert.riskLevel || 'MODERATE';
            const patient = alert.patient?.user?.profile;
            const borderColor = level === 'CRITICAL' ? '!border-l-red-500' : level === 'HIGH' ? '!border-l-orange-500' : '!border-l-amber-500';
            const badgeColor = level === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : level === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400';
            return (
              <div key={alert.id} className={`dash-card border-l-4 ${borderColor}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${badgeColor}`}>{level}</span>
                    <span className="text-xs text-navy-400">{alert.alertType}</span>
                  </div>
                  <span className="text-[11px] text-navy-500">{alert.createdAt ? new Date(alert.createdAt).toLocaleDateString('en-KE') : ''}</span>
                </div>
                <p className="text-sm text-navy-300 mb-2">{alert.description || alert.message}</p>
                {patient && (
                  <p className="text-xs text-navy-400 mb-3">Patient: {patient.firstName} {patient.lastName}</p>
                )}
                <button onClick={() => handleResolve(alert.id)} className="text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                  Mark Resolved
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="dash-card text-center py-12">
          <AlertTriangle size={32} className="text-navy-600 mx-auto mb-3" />
          <p className="text-navy-300">No active risk alerts</p>
          <p className="text-xs text-navy-500 mt-1">All clear — the system is monitoring continuously</p>
        </div>
      )}
    </div>
  );
}
