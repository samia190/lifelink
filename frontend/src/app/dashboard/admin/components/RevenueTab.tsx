'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Plus, Loader2, FileText, X } from 'lucide-react';
import { dashboardAPI, paymentAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props {
  analytics: any;
}

export default function RevenueTab({ analytics }: Props) {
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ patientId: '', description: '', amount: '', dueDate: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [growthData, setGrowthData] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      paymentAPI.list({ limit: 20 }).then(r => setPayments(r.data?.data || [])).catch(() => {}),
      dashboardAPI.listInvoices().then(r => setInvoices(r.data?.data || [])).catch(() => {}),
      dashboardAPI.growthForecast().then(r => setGrowthData(r.data?.data)).catch(() => {}),
      dashboardAPI.listPatients({ limit: 100 }).then(r => setPatients(r.data?.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const handleCreateInvoice = async () => {
    setSaving(true);
    try {
      const amount = Number(invoiceForm.amount) || 0;
      await dashboardAPI.createInvoice({
        patientId: invoiceForm.patientId || undefined,
        items: [{ description: invoiceForm.description, amount }],
        subtotal: amount,
        tax: Math.round(amount * 0.16),
        discount: 0,
        dueDate: invoiceForm.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: invoiceForm.notes,
      });
      toast.success('Invoice created');
      setShowInvoice(false);
      setInvoiceForm({ patientId: '', description: '', amount: '', dueDate: '', notes: '' });
      dashboardAPI.listInvoices().then(r => setInvoices(r.data?.data || [])).catch(() => {});
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const rev = analytics?.revenue || {};
  const appts = analytics?.bookings || {};

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Revenue & Billing</h2>
        <button onClick={() => setShowInvoice(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 text-sm font-semibold">
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-4 gap-5">
        {[
          { label: 'Monthly Revenue', value: formatCurrency(rev.monthly || 0), trend: `${rev.growth > 0 ? '+' : ''}${rev.growth || 0}%`, color: 'text-emerald-400' },
          { label: 'Daily Revenue', value: formatCurrency(rev.daily || 0), trend: 'Today', color: 'text-blue-400' },
          { label: 'Yearly Revenue', value: formatCurrency(rev.yearly || 0), trend: 'Year to date', color: 'text-violet-400' },
          { label: 'Growth Rate', value: growthData ? `${growthData.avgGrowthRate || 0}%` : '—', trend: 'Avg monthly', color: 'text-amber-400' },
        ].map((m, i) => (
          <div key={i} className="dash-card">
            <p className="text-xs text-navy-400 mb-1">{m.label}</p>
            <p className="text-2xl font-bold text-white">{m.value}</p>
            <p className={`text-xs mt-2 ${m.color}`}>{m.trend}</p>
          </div>
        ))}
      </div>

      {/* Growth Forecast (if available) */}
      {growthData?.forecast?.length > 0 && (
        <div className="dash-card">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Forecast</h3>
          <div className="flex items-end gap-3 h-32">
            {growthData.forecast.map((f: any, i: number) => {
              const maxVal = Math.max(...growthData.forecast.map((x: any) => x.projected), 1);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative flex flex-col items-center justify-end h-24">
                    <div className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-emerald-400/60 to-emerald-400/20 border border-emerald-400/30 border-dashed transition-all duration-500 cursor-pointer relative group" style={{ height: `${(f.projected / maxVal) * 100}%`, minHeight: '4px' }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-navy-700 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{formatCurrency(f.projected)}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-navy-500">{new Date(f.month).toLocaleDateString('en-KE', { month: 'short' })}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-navy-500 mt-2">Projected based on {growthData.avgGrowthRate}% average monthly growth</p>
        </div>
      )}

      {/* Recent Payments */}
      <div className="dash-card">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Payments</h3>
        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((p: any, i: number) => (
              <div key={p.id || i} className="flex items-center justify-between p-3.5 rounded-xl bg-navy-800/30 border border-navy-700/30">
                <div>
                  <p className="text-sm font-medium text-white">{p.description || 'Payment'}</p>
                  <p className="text-[11px] text-navy-500">{p.method || 'M-Pesa'} • {p.transactionId || p.mpesaReceiptNumber || '-'}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${p.status === 'COMPLETED' ? 'text-emerald-400' : p.status === 'FAILED' ? 'text-red-400' : 'text-amber-400'}`}>{formatCurrency(p.amount || 0)}</p>
                  <p className="text-[11px] text-navy-500">{p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-KE') : p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-KE') : '-'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8"><DollarSign size={32} className="text-navy-600 mx-auto mb-3" /><p className="text-navy-400">No payments recorded yet</p></div>
        )}
      </div>

      {/* Invoices */}
      <div className="dash-card">
        <h3 className="text-lg font-semibold text-white mb-4">Invoices</h3>
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-navy-700/50">
                <th className="text-left py-3 px-4 text-navy-400 font-medium">Invoice #</th>
                <th className="text-left py-3 px-4 text-navy-400 font-medium">Patient / Corporate</th>
                <th className="text-left py-3 px-4 text-navy-400 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-navy-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-navy-400 font-medium">Due Date</th>
              </tr></thead>
              <tbody>
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-navy-700/20 hover:bg-navy-700/20 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-navy-300">{inv.patient?.user?.profile?.firstName ? `${inv.patient.user.profile.firstName} ${inv.patient.user.profile.lastName}` : inv.corporate?.companyName || '-'}</td>
                    <td className="py-3 px-4 text-white font-medium">{formatCurrency(inv.total || 0)}</td>
                    <td className="py-3 px-4"><span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : inv.status === 'OVERDUE' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{inv.status}</span></td>
                    <td className="py-3 px-4 text-navy-300">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-KE') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8"><FileText size={32} className="text-navy-600 mx-auto mb-3" /><p className="text-navy-400">No invoices yet</p></div>
        )}
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInvoice(false)} />
          <div className="relative w-full max-w-md mx-4 bg-navy-800 border border-navy-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Create Invoice</h3>
              <button onClick={() => setShowInvoice(false)} className="p-2 rounded-lg text-navy-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3 mb-6">
              <select value={invoiceForm.patientId} onChange={e => setInvoiceForm(p => ({ ...p, patientId: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white focus:outline-none focus:border-gold-400/50">
                <option value="">Select patient (optional)</option>
                {patients.map((pt: any) => (
                  <option key={pt.id} value={pt.id}>{pt.user?.profile?.firstName} {pt.user?.profile?.lastName} — {pt.user?.email}</option>
                ))}
              </select>
              <input type="text" placeholder="Description" value={invoiceForm.description} onChange={e => setInvoiceForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
              <input type="number" placeholder="Amount (KES)" value={invoiceForm.amount} onChange={e => setInvoiceForm(p => ({ ...p, amount: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
              <input type="date" value={invoiceForm.dueDate} onChange={e => setInvoiceForm(p => ({ ...p, dueDate: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white focus:outline-none focus:border-gold-400/50" />
              <textarea placeholder="Notes (optional)" rows={2} value={invoiceForm.notes} onChange={e => setInvoiceForm(p => ({ ...p, notes: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowInvoice(false)} className="flex-1 py-2.5 rounded-xl border border-navy-700/50 text-navy-400 text-sm">Cancel</button>
              <button onClick={handleCreateInvoice} disabled={saving || !invoiceForm.description || !invoiceForm.amount} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
