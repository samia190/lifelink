'use client';

import { useState, useEffect } from 'react';
import { Building2, Users, Loader2, TrendingUp } from 'lucide-react';
import { dashboardAPI, corporateAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CorporateTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.corporateAnalytics()
      .then(r => { setData(r.data?.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="text-gold-400 animate-spin" /></div>;

  const corporates = data?.corporates || [];

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-white">Corporate Accounts</h2>

      {/* KPIs */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="dash-card">
          <p className="text-xs text-navy-400 mb-1">Active Corporates</p>
          <p className="text-2xl font-bold text-white">{data?.totalCorporates || 0}</p>
        </div>
        <div className="dash-card">
          <p className="text-xs text-navy-400 mb-1">Total Employees</p>
          <p className="text-2xl font-bold text-white">{data?.totalEmployees || 0}</p>
        </div>
        <div className="dash-card">
          <p className="text-xs text-navy-400 mb-1">Contract Value</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(data?.totalContractValue || 0)}</p>
        </div>
      </div>

      {/* Corporate List */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {corporates.length > 0 ? corporates.map((c: any) => {
          const employeeCount = c._count?.employees || 0;
          const utilization = c.maxEmployees > 0 ? Math.round((employeeCount / c.maxEmployees) * 100) : 0;
          return (
            <div key={c.id} className="dash-card hover:border-gold-400/20 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Building2 size={18} className="text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white">{c.companyName}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.contractStatus === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {c.contractStatus}
                </span>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-navy-400">Industry</span>
                  <span className="text-navy-300">{c.industry || 'General'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-navy-400">Employees</span>
                  <span className="text-navy-300">{employeeCount} / {c.maxEmployees}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-navy-400">Contract Value</span>
                  <span className="text-emerald-400 font-medium">{formatCurrency(c.contractValue || 0)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-navy-400">Services</span>
                  <span className="text-navy-300 text-right max-w-[60%] truncate">{(c.servicesIncluded || []).join(', ')}</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-navy-700/50 overflow-hidden">
                <div className="h-full rounded-full bg-gold-400 transition-all" style={{ width: `${utilization}%` }} />
              </div>
              <p className="text-[11px] text-navy-500 mt-1.5">{utilization}% capacity used</p>
            </div>
          );
        }) : (
          <div className="dash-card col-span-full text-center py-12">
            <Building2 size={40} className="text-navy-600 mx-auto mb-3" />
            <p className="text-navy-400">No corporate accounts yet</p>
            <p className="text-xs text-navy-500 mt-1">Companies can join via the corporate registration page</p>
          </div>
        )}
      </div>
    </div>
  );
}
