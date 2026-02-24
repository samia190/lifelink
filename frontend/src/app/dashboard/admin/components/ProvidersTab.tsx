'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Users, Heart, Loader2, Check, Copy, Eye, X, Edit, RefreshCcw } from 'lucide-react';
import { dashboardAPI } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProvidersTab() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', phone: '', specialization: '', licenseNumber: '', consultationFee: '', teleHealthFee: '' });
  const [saving, setSaving] = useState(false);
  const [creds, setCreds] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    dashboardAPI.listDoctors().then(r => { setDoctors(r.data?.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        specialization: form.specialization ? form.specialization.split(',').map(s => s.trim()) : [],
        consultationFee: Number(form.consultationFee) || 0,
        teleHealthFee: Number(form.teleHealthFee) || 0,
      };
      const { data } = await dashboardAPI.createDoctor(payload);
      setCreds({ email: form.email, password: data.data.generatedPassword });
      // refresh list
      dashboardAPI.listDoctors().then(r => setDoctors(r.data?.data || [])).catch(() => {});
      toast.success('Doctor account created');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create doctor');
    }
    setSaving(false);
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Reset this doctor\'s password?')) return;
    try {
      const { data } = await dashboardAPI.resetUserPassword(userId);
      toast.success(`New password: ${data.data.generatedPassword}`);
      setCreds({ email: data.data.email, password: data.data.generatedPassword });
      setShowAdd(true); // reuse the modal to show creds
    } catch { toast.error('Failed to reset password'); }
  };

  const handleToggleActive = async (userId: string) => {
    try {
      await dashboardAPI.toggleUserActive(userId);
      dashboardAPI.listDoctors().then(r => setDoctors(r.data?.data || [])).catch(() => {});
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  const loadDetail = async (id: string) => {
    try {
      const r = await dashboardAPI.getDoctorDetail(id);
      setShowDetail(r.data?.data);
    } catch { toast.error('Failed to load doctor details'); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-gold-400 animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Healthcare Providers</h2>
          <p className="text-sm text-navy-400 mt-1">{doctors.length} registered providers</p>
        </div>
        <button onClick={() => { setShowAdd(true); setCreds(null); setForm({ email: '', firstName: '', lastName: '', phone: '', specialization: '', licenseNumber: '', consultationFee: '', teleHealthFee: '' }); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 text-sm font-semibold hover:shadow-lg hover:shadow-gold-400/20 transition-all">
          <UserPlus size={16} /> Add Doctor
        </button>
      </div>

      {/* Doctor Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {doctors.length > 0 ? doctors.map((doc: any) => {
          const profile = doc.user?.profile || {};
          const isActive = doc.user?.isActive !== false;
          return (
            <div key={doc.id} className="dash-card hover:border-gold-400/20 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400/80 to-gold-500/80 text-navy-900 flex items-center justify-center font-bold text-sm">
                  {getInitials(profile.firstName, profile.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">Dr. {profile.firstName} {profile.lastName}</p>
                  <p className="text-xs text-navy-400 truncate">{(doc.specialization || []).join(', ') || 'General'}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-navy-400">{doc.user?.email}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-navy-400">License</span>
                  <span className="text-navy-300">{doc.licenseNumber}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-navy-400">Fee</span>
                  <span className="text-navy-300">KES {doc.consultationFee?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-navy-400">Patients</span>
                  <span className="text-navy-300">{doc._count?.appointments || 0} appointments</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-navy-700/30">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => loadDetail(doc.id)} className="p-1.5 rounded-lg text-navy-400 hover:text-gold-400 hover:bg-gold-400/10 transition-colors" title="View details"><Eye size={14} /></button>
                  <button onClick={() => handleResetPassword(doc.user?.id || doc.userId)} className="p-1.5 rounded-lg text-navy-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors" title="Reset password"><RefreshCcw size={14} /></button>
                  <button onClick={() => handleToggleActive(doc.user?.id || doc.userId)} className="p-1.5 rounded-lg text-navy-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Toggle active">
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="dash-card col-span-full text-center py-12">
            <Users size={40} className="text-navy-600 mx-auto mb-3" />
            <p className="text-navy-400 mb-2">No providers registered yet</p>
            <button onClick={() => setShowAdd(true)} className="text-sm text-gold-400 hover:text-gold-300">+ Add your first doctor</button>
          </div>
        )}
      </div>

      {/* Doctor Detail Drawer */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetail(null)} />
          <div className="relative w-full max-w-lg mx-4 bg-navy-800 border border-navy-700/50 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Doctor Details</h3>
              <button onClick={() => setShowDetail(null)} className="p-2 rounded-lg text-navy-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-400/80 to-gold-500/80 text-navy-900 flex items-center justify-center font-bold text-lg">
                  {getInitials(showDetail.user?.profile?.firstName, showDetail.user?.profile?.lastName)}
                </div>
                <div>
                  <p className="font-bold text-white text-lg">Dr. {showDetail.user?.profile?.firstName} {showDetail.user?.profile?.lastName}</p>
                  <p className="text-sm text-navy-400">{showDetail.user?.email}</p>
                </div>
              </div>
              {[
                { label: 'Specialization', value: (showDetail.specialization || []).join(', ') || 'General' },
                { label: 'License', value: showDetail.licenseNumber },
                { label: 'Consultation Fee', value: `KES ${showDetail.consultationFee?.toLocaleString() || 0}` },
                { label: 'TeleHealth Fee', value: `KES ${showDetail.teleHealthFee?.toLocaleString() || 0}` },
                { label: 'Assigned Patients', value: showDetail._count?.assignedPatients || 0 },
                { label: 'Total Appointments', value: showDetail._count?.appointments || 0 },
                { label: 'Rating', value: showDetail.rating || 'No ratings yet' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between p-3 rounded-xl bg-navy-900/50 border border-navy-700/30">
                  <span className="text-sm text-navy-400">{item.label}</span>
                  <span className="text-sm text-white font-medium">{item.value}</span>
                </div>
              ))}
              {(showDetail.assignedPatients || []).length > 0 && (
                <>
                  <h4 className="text-sm font-semibold text-white mt-4">Assigned Patients</h4>
                  <div className="space-y-2">
                    {showDetail.assignedPatients.map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-navy-800/50 border border-navy-700/20">
                        <span className="text-sm text-navy-300">{p.user?.profile?.firstName} {p.user?.profile?.lastName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{p.riskLevel}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowAdd(false); setCreds(null); }} />
          <div className="relative w-full max-w-lg mx-4 bg-navy-800 border border-navy-700/50 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            {creds ? (
              <>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Check size={20} className="text-emerald-400" /> Credentials Ready</h3>
                <div className="space-y-3 mb-6">
                  <div className="p-4 rounded-xl bg-navy-900/50 border border-navy-700/30">
                    <p className="text-xs text-navy-400 mb-1">Email</p>
                    <p className="text-sm font-medium text-white">{creds.email}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-navy-900/50 border border-navy-700/30">
                    <p className="text-xs text-navy-400 mb-1">Password</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono font-medium text-gold-400">{creds.password}</p>
                      <button onClick={() => { navigator.clipboard.writeText(creds.password); toast.success('Copied!'); }} className="p-1.5 rounded-lg text-navy-400 hover:text-gold-400"><Copy size={14} /></button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-navy-500 mb-4">These credentials have been sent to the doctor&apos;s email.</p>
                <button onClick={() => { setShowAdd(false); setCreds(null); }} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 font-semibold text-sm">Done</button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><UserPlus size={20} className="text-gold-400" /> Add New Doctor</h3>
                <p className="text-sm text-navy-400 mb-5">The system will auto-generate a secure, memorable password and email it to the doctor.</p>
                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="First name *" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
                    <input type="text" placeholder="Last name *" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
                  </div>
                  <input type="email" placeholder="Email address *" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
                  <input type="tel" placeholder="Phone number" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
                  <input type="text" placeholder="Specializations (comma separated)" value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
                  <input type="text" placeholder="License number (auto-generated if blank)" value={form.licenseNumber} onChange={e => setForm(p => ({ ...p, licenseNumber: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Consultation fee (KES)" value={form.consultationFee} onChange={e => setForm(p => ({ ...p, consultationFee: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
                    <input type="number" placeholder="TeleHealth fee (KES)" value={form.teleHealthFee} onChange={e => setForm(p => ({ ...p, teleHealthFee: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-navy-700/50 text-navy-400 text-sm hover:text-white hover:border-navy-600 transition-colors">Cancel</button>
                  <button onClick={handleCreate} disabled={saving || !form.email || !form.firstName || !form.lastName} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Create & Generate Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
