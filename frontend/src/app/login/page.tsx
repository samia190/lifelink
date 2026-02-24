'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FadeUp } from '@/components/ui/LazyMotion';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const { login } = useAuthStore();
  const router = useRouter();

  const getDashboardPath = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
      case 'RECEPTIONIST':
      case 'ACCOUNTANT':
        return '/dashboard/admin';
      case 'DOCTOR':
      case 'THERAPIST':
      case 'PSYCHIATRIST':
        return '/dashboard/doctor';
      case 'CORPORATE_MANAGER':
        return '/dashboard/corporate';
      default:
        return '/dashboard/patient';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result.data?.requires2FA) {
        setNeeds2FA(true);
        setTempToken(result.data.tempToken);
        return;
      }
      toast.success('Welcome back!');
      router.push(getDashboardPath(result.data?.user?.role));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { authAPI } = await import('@/lib/api');
      const { data } = await authAPI.verify2FA({ token: twoFACode, tempToken });
      localStorage.setItem('lifelink_token', data.data.accessToken);
      localStorage.setItem('lifelink_refresh', data.data.refreshToken);
      useAuthStore.getState().setUser(data.data.user);
      toast.success('Welcome back!');
      router.push(getDashboardPath(data.data.user?.role));
    } catch (err: any) {
      setError('Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-700 via-navy-600 to-navy-800 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-6">
            <Image src="/logo.jpeg" alt="LifeLink Logo" width={64} height={64} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Welcome Back to <span className="text-gold-400">LifeLink</span>
          </h2>
          <p className="text-navy-300 leading-relaxed">
            Continue your journey towards better mental health. Your progress, appointments,
            and care team are just a login away.
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <FadeUp className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <Image src="/logo.jpeg" alt="LifeLink" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-display font-bold">LIFE<span className="text-gold-500">LINK</span></span>
          </Link>

          <h1 className="text-2xl font-bold text-navy-800 mb-2">
            {needs2FA ? 'Two-Factor Authentication' : 'Sign In'}
          </h1>
          <p className="text-charcoal-500 mb-8">
            {needs2FA ? 'Enter the 6-digit code from your authenticator app' : 'Enter your credentials to access your account'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {needs2FA ? (
            <form onSubmit={handle2FA} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="000000"
                  value={twoFACode}
                  onChange={e => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <button type="submit" disabled={isLoading || twoFACode.length !== 6} className="btn-gold w-full justify-center">
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type="email"
                    required
                    className="input-field pl-11"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-charcoal-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-gold-600 hover:text-gold-700">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input-field pl-11 pr-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-gold w-full justify-center">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          <p className="text-center text-charcoal-500 text-sm mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-gold-600 font-semibold hover:text-gold-700">Create Account</Link>
          </p>
        </FadeUp>
      </div>
    </div>
  );
}
