'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FadeUp } from '@/components/ui/LazyMotion';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '', agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuthStore();
  const router = useRouter();

  const updateField = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!formData.agreeTerms) {
      setError('You must agree to the Terms of Service');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      toast.success('Account created successfully! Welcome to LifeLink.');
      router.push('/dashboard/patient');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-6">
            <Image src="/logo.jpeg" alt="LifeLink Logo" width={64} height={64} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Join <span className="text-gold-400">LifeLink</span>
          </h2>
          <p className="text-navy-300 leading-relaxed">
            Create your account to access personalized mental healthcare,
            book sessions with top professionals, and track your wellness journey.
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

          <h1 className="text-2xl font-bold text-navy-800 mb-2">Create Account</h1>
          <p className="text-charcoal-500 mb-8">Begin your journey to better mental health</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">First Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input type="text" required className="input-field pl-10 py-2.5 text-sm" placeholder="First name" value={formData.firstName} onChange={e => updateField('firstName', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Last Name</label>
                <input type="text" required className="input-field py-2.5 text-sm" placeholder="Last name" value={formData.lastName} onChange={e => updateField('lastName', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input type="email" required className="input-field pl-10 py-2.5 text-sm" placeholder="you@example.com" value={formData.email} onChange={e => updateField('email', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input type="tel" className="input-field pl-10 py-2.5 text-sm" placeholder="+254 7XX XXX XXX" value={formData.phone} onChange={e => updateField('phone', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input type={showPassword ? 'text' : 'password'} required minLength={8} className="input-field pl-10 pr-10 py-2.5 text-sm" placeholder="Min. 8 characters" value={formData.password} onChange={e => updateField('password', e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Confirm Password</label>
              <input type="password" required className="input-field py-2.5 text-sm" placeholder="Repeat password" value={formData.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} />
            </div>

            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 rounded border-charcoal-300" checked={formData.agreeTerms} onChange={e => updateField('agreeTerms', e.target.checked)} />
              <span className="text-sm text-charcoal-600">
                I agree to the <Link href="/terms" className="text-gold-600 underline">Terms of Service</Link> and{' '}
                <Link href="/privacy" className="text-gold-600 underline">Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" disabled={isLoading} className="btn-gold w-full justify-center">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-charcoal-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-gold-600 font-semibold hover:text-gold-700">Sign In</Link>
          </p>
        </FadeUp>
      </div>
    </div>
  );
}
