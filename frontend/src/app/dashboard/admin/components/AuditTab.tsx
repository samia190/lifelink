'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Search, ChevronLeft, ChevronRight, Loader2, Filter } from 'lucide-react';
import { dashboardAPI } from '@/lib/api';

export default function AuditTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;
      const { data } = await dashboardAPI.auditLogs(params);
      setLogs(data.data?.logs || data.data || []);
      setTotal(data.data?.total || 0);
    } catch { /* empty */ }
    setLoading(false);
  }, [page, search, actionFilter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit) || 1;

  const actionColors: Record<string, string> = {
    CREATE: 'bg-emerald-500/20 text-emerald-400',
    UPDATE: 'bg-blue-500/20 text-blue-400',
    DELETE: 'bg-red-500/20 text-red-400',
    LOGIN: 'bg-purple-500/20 text-purple-400',
    LOGOUT: 'bg-navy-500/20 text-navy-400',
    VIEW: 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Shield size={22} className="text-purple-400" /> Audit Logs
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-navy-500" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by user, action, entity…"
            className="w-full pl-9 pr-3 py-2 bg-navy-800/50 border border-navy-700 rounded-lg text-sm text-navy-200 placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
          />
        </div>
        <select
          value={actionFilter}
          onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-navy-800/50 border border-navy-700 rounded-lg text-sm text-navy-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
        >
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="VIEW">View</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="dash-card text-center py-12"><Loader2 className="animate-spin mx-auto text-gold-400" /></div>
      ) : logs.length === 0 ? (
        <div className="dash-card text-center py-12 text-navy-400">No audit logs found</div>
      ) : (
        <div className="dash-card overflow-x-auto !p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-700 text-navy-400 text-xs uppercase">
                <th className="p-3 text-left">Timestamp</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Action</th>
                <th className="p-3 text-left">Entity</th>
                <th className="p-3 text-left">Details</th>
                <th className="p-3 text-left">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log.id} className="border-b border-navy-700/50 hover:bg-navy-800/30">
                  <td className="p-3 text-navy-300 whitespace-nowrap text-xs">
                    {new Date(log.createdAt).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi', dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="p-3 text-navy-200">
                    {log.user?.profile ? `${log.user.profile.firstName} ${log.user.profile.lastName}` : log.user?.email || 'System'}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${actionColors[log.action] || 'bg-navy-700 text-navy-300'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-navy-300">{log.entityType} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}</td>
                  <td className="p-3 text-navy-400 text-xs max-w-[200px] truncate">{log.details || '—'}</td>
                  <td className="p-3 text-navy-500 text-xs">{log.ipAddress || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-navy-400">{total} total logs</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded border border-navy-700 text-navy-400 hover:text-white disabled:opacity-30">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-navy-300">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded border border-navy-700 text-navy-400 hover:text-white disabled:opacity-30">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
