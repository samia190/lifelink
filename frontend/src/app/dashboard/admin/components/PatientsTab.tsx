'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Search, UserPlus, Eye, X, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { dashboardAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props {
  doctors: any[];
}

export default function PatientsTab({ doctors }: Props) {
  const [patients, setPatients] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [assignDoctorId, setAssignDoctorId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const r = await dashboardAPI.listPatients({ page, limit: 15, search: search || undefined });
      setPatients(r.data?.data || []);
      setTotal(r.data?.meta?.total || 0);
    } catch {}
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const loadPatientDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const r = await dashboardAPI.getPatientDetail(id);
      setSelected(r.data?.data);
      setAssignDoctorId(r.data?.data?.assignedDoctorId || '');
    } catch { toast.error('Failed to load patient'); }
    setDetailLoading(false);
  };

  const handleAssign = async () => {
    if (!selected) return;
    setAssigning(true);
    try {
      await dashboardAPI.assignPatient({ patientId: selected.id, doctorId: assignDoctorId || null });
      toast.success(assignDoctorId ? 'Patient assigned' : 'Patient unassigned');
      // Refresh detail
      const r = await dashboardAPI.getPatientDetail(selected.id);
      setSelected(r.data?.data);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    setAssigning(false);
  };

  const totalPages = Math.ceil(total / 15);

  // DETAIL VIEW
  if (selected) {
    const p = selected;
    const profile = p.user?.profile || {};
    return (
      <div className="space-y-5">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-navy-400 hover:text-gold-400 transition-colors">
          <ArrowLeft size={16} /> Back to patients
        </button>

        <div className="dash-card">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/80 to-blue-600/80 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
              {(profile.firstName?.[0] || '')}{(profile.lastName?.[0] || '')}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{profile.firstName} {profile.lastName}</h2>
              <p className="text-sm text-navy-400">{p.user?.email} • Patient #{p.patientNumber}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.riskLevel === 'CRITICAL' ? 'bg-red-500/10 text-red-400' : p.riskLevel === 'HIGH' ? 'bg-orange-500/10 text-orange-400' : p.riskLevel === 'MODERATE' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  Risk: {p.riskLevel}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {p.isActive ? 'Active' : 'Inactive'}
                </span>
                {p.insuranceProvider && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400">
                    {p.insuranceProvider}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm text-right">
              <p className="text-navy-400">Joined: {formatDate(p.createdAt)}</p>
              <p className="text-navy-400">Appointments: {p._count?.appointments || 0}</p>
              <p className="text-navy-400">Records: {p._count?.medicalRecords || 0}</p>
            </div>
          </div>
        </div>

        {/* Assign Doctor */}
        <div className="dash-card">
          <h3 className="text-lg font-semibold text-white mb-4">Assigned Doctor</h3>
          <div className="flex items-center gap-3">
            <select value={assignDoctorId} onChange={e => setAssignDoctorId(e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white focus:outline-none focus:border-gold-400/50">
              <option value="">— Not assigned —</option>
              {doctors.map((doc: any) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.user?.profile?.firstName} {doc.user?.profile?.lastName} — {(doc.specialization || []).join(', ')}
                </option>
              ))}
            </select>
            <button onClick={handleAssign} disabled={assigning} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 font-semibold text-sm disabled:opacity-50 flex items-center gap-2">
              {assigning ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} {assignDoctorId ? 'Assign' : 'Unassign'}
            </button>
          </div>
          {p.assignedDoctor && (
            <p className="text-sm text-navy-300 mt-3">Currently assigned to: <span className="text-gold-400">Dr. {p.assignedDoctor?.user?.profile?.firstName} {p.assignedDoctor?.user?.profile?.lastName}</span></p>
          )}
        </div>

        {/* Medical Info */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="dash-card">
            <h3 className="text-lg font-semibold text-white mb-4">Medical Details</h3>
            <div className="space-y-3">
              {[
                { label: 'Blood Type', value: p.bloodType || 'Unknown' },
                { label: 'Allergies', value: (p.allergies || []).join(', ') || 'None reported' },
                { label: 'Chronic Conditions', value: (p.chronicConditions || []).join(', ') || 'None reported' },
                { label: 'Current Medications', value: (p.currentMedications || []).join(', ') || 'None' },
                { label: 'Preferred Language', value: p.preferredLanguage || 'English' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between p-3 rounded-xl bg-navy-800/30 border border-navy-700/30">
                  <span className="text-sm text-navy-400">{item.label}</span>
                  <span className="text-sm text-white font-medium text-right max-w-[60%] truncate">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-card">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Appointments</h3>
            {(p.appointments || []).length > 0 ? (
              <div className="space-y-2">
                {(p.appointments || []).slice(0, 5).map((appt: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-navy-800/30 border border-navy-700/30">
                    <div>
                      <p className="text-sm text-white">Dr. {appt.doctor?.user?.profile?.firstName || 'Unknown'}</p>
                      <p className="text-[11px] text-navy-500">{formatDate(appt.appointmentDate)} • {appt.type}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${appt.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : appt.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{appt.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-navy-500 text-center py-6">No appointments yet</p>
            )}
          </div>
        </div>

        {/* Risk Alerts */}
        {(p.riskAlerts || []).length > 0 && (
          <div className="dash-card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Active Risk Alerts
            </h3>
            <div className="space-y-2">
              {p.riskAlerts.map((alert: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{alert.riskLevel}</span>
                    <span className="text-[10px] text-navy-500">{alert.alertType}</span>
                  </div>
                  <p className="text-sm text-navy-300">{alert.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Patient Management</h2>
          <p className="text-sm text-navy-400 mt-1">{total} total patients</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800/50 border border-navy-700/50 focus-within:border-gold-400/50 transition-colors">
          <Search size={16} className="text-navy-400" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="bg-transparent text-sm text-white placeholder:text-navy-500 focus:outline-none w-56" />
        </div>
      </div>

      <div className="dash-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-navy-700/50">
              <th className="text-left py-3 px-4 text-navy-400 font-medium">Patient</th>
              <th className="text-left py-3 px-4 text-navy-400 font-medium">Email</th>
              <th className="text-left py-3 px-4 text-navy-400 font-medium">Risk</th>
              <th className="text-left py-3 px-4 text-navy-400 font-medium">Assigned Doctor</th>
              <th className="text-left py-3 px-4 text-navy-400 font-medium">Visits</th>
              <th className="text-left py-3 px-4 text-navy-400 font-medium">Joined</th>
              <th className="text-right py-3 px-4 text-navy-400 font-medium">Action</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center"><Loader2 size={24} className="text-navy-500 animate-spin mx-auto" /></td></tr>
              ) : patients.length > 0 ? patients.map((p: any, i: number) => (
                <tr key={p.id || i} className="border-b border-navy-700/20 hover:bg-navy-700/20 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                        {(p.user?.profile?.firstName?.[0] || '')}{(p.user?.profile?.lastName?.[0] || '')}
                      </div>
                      <div>
                        <p className="font-medium text-white">{p.user?.profile?.firstName} {p.user?.profile?.lastName}</p>
                        <p className="text-[11px] text-navy-500">#{p.patientNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-navy-300">{p.user?.email}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${p.riskLevel === 'CRITICAL' ? 'bg-red-500/10 text-red-400' : p.riskLevel === 'HIGH' ? 'bg-orange-500/10 text-orange-400' : p.riskLevel === 'MODERATE' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {p.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-navy-300 text-xs">
                    {p.assignedDoctor ? `Dr. ${p.assignedDoctor?.user?.profile?.firstName || ''} ${p.assignedDoctor?.user?.profile?.lastName || ''}` : <span className="text-navy-500">Not assigned</span>}
                  </td>
                  <td className="py-3 px-4 text-navy-300">{p._count?.appointments || 0}</td>
                  <td className="py-3 px-4 text-navy-300">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-KE') : '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => loadPatientDetail(p.id)} className="p-2 rounded-lg text-navy-400 hover:text-gold-400 hover:bg-gold-400/10 transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="py-8 text-center text-navy-500">No patients found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-navy-700/30">
            <p className="text-sm text-navy-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-lg border border-navy-700/50 text-sm text-navy-400 hover:text-white disabled:opacity-30 transition-colors"><ArrowLeft size={14} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 rounded-lg border border-navy-700/50 text-sm text-navy-400 hover:text-white disabled:opacity-30 transition-colors"><ArrowRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
