'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';
import { notificationAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI.list({ limit: 50 })
      .then(r => setNotifications(r.data?.data || []))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { toast.error('Failed'); }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-gold-400" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Bell size={20} className="text-gold-400" /> Notifications
        </h2>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllRead} className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="dash-card text-center py-12">
          <Bell size={40} className="text-navy-600 mx-auto mb-3" />
          <p className="text-navy-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`dash-card flex items-start gap-3 ${n.isRead ? 'opacity-60' : ''}`}>
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.isRead ? 'bg-navy-600' : 'bg-gold-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{n.title}</p>
                <p className="text-xs text-navy-400 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-navy-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && (
                <button onClick={() => markRead(n.id)} className="text-navy-400 hover:text-gold-400 p-1" title="Mark read">
                  <Check size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
