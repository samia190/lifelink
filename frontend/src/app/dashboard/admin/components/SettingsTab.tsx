'use client';

import { useState } from 'react';
import { Settings, Shield, Lock, Bell, Globe, Save, Loader2, Eye, EyeOff, Check } from 'lucide-react';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SettingsTab() {
  // Password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // 2FA
  const [twoFAStep, setTwoFAStep] = useState<'idle' | 'setup' | 'verify'>('idle');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  // Notifications prefs (local only – no dedicated backend endpoint yet)
  const [notifPrefs, setNotifPrefs] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushAlerts: true,
    riskAlerts: true,
    appointmentReminders: true,
    weeklyReport: true,
  });

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    if (newPw.length < 8) { toast.error('Minimum 8 characters'); return; }
    setPwLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: currentPw, newPassword: newPw });
      toast.success('Password changed');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed');
    }
    setPwLoading(false);
  };

  const handleSetup2FA = async () => {
    setTwoFALoading(true);
    try {
      const { data } = await authAPI.setup2FA();
      setQrCode(data.data?.qrCode || data.data?.qr || '');
      setSecret(data.data?.secret || '');
      setTwoFAStep('verify');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to setup 2FA');
    }
    setTwoFALoading(false);
  };

  const handleVerify2FA = async () => {
    setTwoFALoading(true);
    try {
      await authAPI.enable2FA({ code: otpCode });
      toast.success('2FA enabled!');
      setTwoFAEnabled(true);
      setTwoFAStep('idle');
      setOtpCode('');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Invalid code');
    }
    setTwoFALoading(false);
  };

  const toggleNotif = (key: string) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !(prev as any)[key] }));
    toast.success('Preference saved');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Settings size={22} className="text-gold-400" /> System Settings
      </h2>

      {/* ── Change Password ── */}
      <div className="dash-card">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Lock size={16} className="text-gold-400" /> Change Password
        </h3>
        <div className="space-y-3 max-w-md">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              placeholder="Current password"
              className="w-full px-3 py-2 bg-navy-800/50 border border-navy-700 rounded-lg text-sm text-navy-200 placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <input
            type={showPw ? 'text' : 'password'}
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            placeholder="New password"
            className="w-full px-3 py-2 bg-navy-800/50 border border-navy-700 rounded-lg text-sm text-navy-200 placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
          />
          <input
            type={showPw ? 'text' : 'password'}
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-3 py-2 bg-navy-800/50 border border-navy-700 rounded-lg text-sm text-navy-200 placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
          />
          <button
            onClick={handleChangePassword}
            disabled={pwLoading || !currentPw || !newPw}
            className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-navy-900 rounded-lg font-semibold text-sm hover:bg-gold-400 disabled:opacity-50 transition-colors"
          >
            {pwLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Update Password
          </button>
        </div>
      </div>

      {/* ── Two-Factor Authentication ── */}
      <div className="dash-card">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Shield size={16} className="text-emerald-400" /> Two-Factor Authentication
        </h3>
        {twoFAEnabled ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <Check size={16} /> 2FA is enabled on your account
          </div>
        ) : twoFAStep === 'idle' ? (
          <div>
            <p className="text-sm text-navy-300 mb-3">Add an extra layer of security to your admin account.</p>
            <button
              onClick={handleSetup2FA}
              disabled={twoFALoading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {twoFALoading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />} Enable 2FA
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-navy-300">Scan this QR code with your authenticator app:</p>
            {qrCode && <img src={qrCode} alt="2FA QR" className="w-48 h-48 rounded-lg bg-white p-2" />}
            {secret && (
              <div>
                <p className="text-xs text-navy-400 mb-1">Manual key:</p>
                <code className="text-xs bg-navy-800 px-2 py-1 rounded text-gold-400 font-mono">{secret}</code>
              </div>
            )}
            <div className="flex gap-2 max-w-xs">
              <input
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
                className="flex-1 px-3 py-2 bg-navy-800/50 border border-navy-700 rounded-lg text-sm text-navy-200 placeholder-navy-500 text-center tracking-widest focus:outline-none focus:ring-1 focus:ring-gold-500/50"
              />
              <button
                onClick={handleVerify2FA}
                disabled={twoFALoading || otpCode.length < 6}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-500 disabled:opacity-50 transition-colors"
              >
                {twoFALoading ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Notification Preferences ── */}
      <div className="dash-card">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Bell size={16} className="text-blue-400" /> Notification Preferences
        </h3>
        <div className="space-y-3">
          {[
            { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive critical alerts via email' },
            { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive alerts via SMS' },
            { key: 'pushAlerts', label: 'Push Notifications', desc: 'Browser push notifications' },
            { key: 'riskAlerts', label: 'Risk Alerts', desc: 'Immediate notification for patient risk flags' },
            { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Reminders for upcoming appointments' },
            { key: 'weeklyReport', label: 'Weekly Report', desc: 'Weekly summary email every Monday' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-navy-700/50 last:border-0">
              <div>
                <p className="text-sm text-navy-200">{item.label}</p>
                <p className="text-xs text-navy-500">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleNotif(item.key)}
                className={`relative w-10 h-5 rounded-full transition-colors ${(notifPrefs as any)[item.key] ? 'bg-emerald-500' : 'bg-navy-600'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${(notifPrefs as any)[item.key] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── System Info ── */}
      <div className="dash-card">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Globe size={16} className="text-cyan-400" /> System Information
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-navy-500">Platform</span><p className="text-navy-200">LifeLink v1.0</p></div>
          <div><span className="text-navy-500">Environment</span><p className="text-navy-200">{process.env.NODE_ENV || 'production'}</p></div>
          <div><span className="text-navy-500">Backend</span><p className="text-navy-200">Express + Prisma</p></div>
          <div><span className="text-navy-500">Database</span><p className="text-navy-200">PostgreSQL</p></div>
          <div><span className="text-navy-500">Timezone</span><p className="text-navy-200">Africa/Nairobi (EAT)</p></div>
          <div><span className="text-navy-500">Currency</span><p className="text-navy-200">KES (Kenyan Shilling)</p></div>
        </div>
      </div>
    </div>
  );
}
