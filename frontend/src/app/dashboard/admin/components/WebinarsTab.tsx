'use client';

import { useState, useEffect } from 'react';
import { Video, Plus, Loader2, Edit, X, Calendar, Users } from 'lucide-react';
import { dashboardAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WebinarsTab() {
  const [webinars, setWebinars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', instructorName: '', instructorBio: '',
    category: 'Mental Health', tags: '', scheduledAt: '', maxAttendees: '',
    isPaid: false, price: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dashboardAPI.listWebinars().then(r => { setWebinars(r.data?.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        instructorName: form.instructorName,
        instructorBio: form.instructorBio || undefined,
        category: form.category,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        scheduledAt: form.scheduledAt || undefined,
        maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
        isPaid: form.isPaid,
        price: form.isPaid ? Number(form.price) || 0 : 0,
      };

      if (editingId) {
        await dashboardAPI.updateWebinar(editingId, payload);
        toast.success('Webinar updated');
      } else {
        await dashboardAPI.createWebinar(payload);
        toast.success('Webinar created');
      }
      setShowForm(false);
      setEditingId(null);
      dashboardAPI.listWebinars().then(r => setWebinars(r.data?.data || [])).catch(() => {});
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleEdit = (w: any) => {
    setEditingId(w.id);
    setForm({
      title: w.title || '',
      description: w.description || '',
      instructorName: w.instructorName || '',
      instructorBio: w.instructorBio || '',
      category: w.category || 'Mental Health',
      tags: (w.tags || []).join(', '),
      scheduledAt: w.scheduledAt ? new Date(w.scheduledAt).toISOString().slice(0, 16) : '',
      maxAttendees: w.maxAttendees ? String(w.maxAttendees) : '',
      isPaid: w.isPaid || false,
      price: w.price ? String(w.price) : '',
    });
    setShowForm(true);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await dashboardAPI.updateWebinar(id, { status });
      toast.success(`Webinar ${status.toLowerCase()}`);
      dashboardAPI.listWebinars().then(r => setWebinars(r.data?.data || [])).catch(() => {});
    } catch { toast.error('Failed'); }
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-navy-700/50 text-navy-400',
    SCHEDULED: 'bg-blue-500/10 text-blue-400',
    LIVE: 'bg-emerald-500/10 text-emerald-400',
    COMPLETED: 'bg-violet-500/10 text-violet-400',
    CANCELLED: 'bg-red-500/10 text-red-400',
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="text-gold-400 animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Webinar Management</h2>
          <p className="text-sm text-navy-400 mt-1">{webinars.length} webinars</p>
        </div>
        <button onClick={() => {
          setShowForm(true);
          setEditingId(null);
          setForm({ title: '', description: '', instructorName: '', instructorBio: '', category: 'Mental Health', tags: '', scheduledAt: '', maxAttendees: '', isPaid: false, price: '' });
        }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 text-sm font-semibold">
          <Plus size={16} /> New Webinar
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {webinars.length > 0 ? webinars.map((w: any) => (
          <div key={w.id} className="dash-card hover:border-gold-400/20 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[w.status] || statusColors.DRAFT}`}>
                {w.status}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(w)} className="p-1.5 rounded-lg text-navy-400 hover:text-gold-400" title="Edit"><Edit size={14} /></button>
                {w.status === 'SCHEDULED' && (
                  <button onClick={() => handleStatusChange(w.id, 'LIVE')} className="p-1.5 rounded-lg text-navy-400 hover:text-emerald-400" title="Start">▶</button>
                )}
                {w.status === 'LIVE' && (
                  <button onClick={() => handleStatusChange(w.id, 'COMPLETED')} className="p-1.5 rounded-lg text-navy-400 hover:text-red-400" title="End">⏹</button>
                )}
              </div>
            </div>
            <h3 className="font-semibold text-white mb-2 truncate">{w.title}</h3>
            <p className="text-xs text-navy-400 mb-3 line-clamp-2">{w.description}</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-navy-400">Instructor</span>
                <span className="text-navy-300">{w.instructorName}</span>
              </div>
              {w.scheduledAt && (
                <div className="flex justify-between">
                  <span className="text-navy-400">Scheduled</span>
                  <span className="text-navy-300">{new Date(w.scheduledAt).toLocaleDateString('en-KE')} {new Date(w.scheduledAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-navy-400">Registrations</span>
                <span className="text-navy-300">{w._count?.registrations || 0} {w.maxAttendees ? `/ ${w.maxAttendees}` : ''}</span>
              </div>
              {w.isPaid && (
                <div className="flex justify-between">
                  <span className="text-navy-400">Price</span>
                  <span className="text-emerald-400 font-medium">{formatCurrency(w.price || 0)}</span>
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="dash-card col-span-full text-center py-12">
            <Video size={40} className="text-navy-600 mx-auto mb-3" />
            <p className="text-navy-400">No webinars created yet</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg mx-4 bg-navy-800 border border-navy-700/50 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Webinar' : 'New Webinar'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg text-navy-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3 mb-6">
              <input type="text" placeholder="Webinar title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
              <textarea placeholder="Description *" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50 resize-none" />
              <input type="text" placeholder="Instructor name *" value={form.instructorName} onChange={e => setForm(p => ({ ...p, instructorName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
              <input type="text" placeholder="Instructor bio" value={form.instructorBio} onChange={e => setForm(p => ({ ...p, instructorBio: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white focus:outline-none focus:border-gold-400/50">
                  <option>Mental Health</option>
                  <option>Wellness</option>
                  <option>Corporate</option>
                  <option>Parenting</option>
                  <option>Addiction</option>
                  <option>Trauma</option>
                </select>
                <input type="text" placeholder="Tags (comma sep)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
              </div>
              <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white focus:outline-none focus:border-gold-400/50" />
              <input type="number" placeholder="Max attendees (optional)" value={form.maxAttendees} onChange={e => setForm(p => ({ ...p, maxAttendees: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPaid} onChange={e => setForm(p => ({ ...p, isPaid: e.target.checked }))} className="rounded border-navy-700 bg-navy-900/50 text-gold-400 focus:ring-gold-400/50" />
                  <span className="text-sm text-navy-300">Paid webinar</span>
                </label>
                {form.isPaid && (
                  <input type="number" placeholder="Price (KES)" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="flex-1 px-3 py-2 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-navy-700/50 text-navy-400 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.description || !form.instructorName} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
