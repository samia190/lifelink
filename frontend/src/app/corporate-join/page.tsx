'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Building2, ArrowRight, CheckCircle, Loader2,
  Users, Shield, Video, Calendar, Zap
} from 'lucide-react';
import { publicAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function CorporateJoinPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    industry: '',
    contactFirstName: '',
    contactLastName: '',
    contactEmail: '',
    contactPhone: '',
    password: '',
    address: '',
    maxEmployees: '50',
  });

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.companyName || !form.contactEmail || !form.contactFirstName || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await publicAPI.corporateJoin({
        ...form,
        maxEmployees: parseInt(form.maxEmployees) || 50,
      });
      if (data.data?.accessToken) {
        localStorage.setItem('lifelink_token', data.data.accessToken);
        localStorage.setItem('lifelink_refresh', data.data.refreshToken);
        setUser(data.data.user);
      }
      setSuccess(true);
      toast.success('Welcome to LIFELINK Corporate!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setSubmitting(false);
  };

  const benefits = [
    { icon: Users, title: 'Employee Wellness', desc: 'Comprehensive mental health support for your entire team' },
    { icon: Video, title: 'Telehealth Access', desc: 'Virtual therapy sessions from anywhere in Kenya' },
    { icon: Shield, title: 'KDPA Compliant', desc: 'Data protection and confidentiality guaranteed' },
    { icon: Calendar, title: 'Flexible Programs', desc: 'Customizable wellness programs for your organization' },
    { icon: Zap, title: 'AI-Powered Insights', desc: 'Anonymous analytics and wellness trend reports' },
    { icon: Building2, title: 'Dedicated Dashboard', desc: 'Full corporate management and reporting portal' },
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-[#1e1b4b] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-400/20">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-3">Welcome Aboard!</h1>
          <p className="text-navy-400 mb-2">
            <span className="text-gold-400 font-semibold">{form.companyName}</span> has been successfully registered.
          </p>
          <p className="text-sm text-navy-500 mb-8">Your corporate wellness dashboard is ready. Start adding employees and setting up wellness programs.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push('/dashboard/corporate')} className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 font-semibold text-sm hover:shadow-lg hover:shadow-gold-400/20 transition-all flex items-center justify-center gap-2">
              Go to Dashboard <ArrowRight size={16} />
            </button>
            <Link href="/" className="text-sm text-navy-400 hover:text-gold-400 transition-colors">Back to Homepage</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1b4b]">
      {/* Header */}
      <header className="border-b border-navy-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-gold-400/20">
              <Image src="/logo.jpeg" alt="LifeLink Logo" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-display font-bold text-white tracking-tight">LIFE<span className="text-gold-400">LINK</span></span>
          </Link>
          <Link href="/login" className="text-sm text-navy-400 hover:text-gold-400 transition-colors">Already have an account? Sign in</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: Info */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium mb-6">
              <Building2 size={16} /> Corporate Wellness Partnership
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight mb-6">
              Invest in your team&apos;s <span className="text-gold-400">mental wellness</span>
            </h1>
            <p className="text-lg text-navy-300 mb-10 leading-relaxed">
              Join Kenya&apos;s leading mental health platform and provide your employees with world-class therapy, counseling, and wellness resources — all managed from a single dashboard.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((b, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl bg-navy-800/30 border border-navy-700/20">
                  <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                    <b.icon size={18} className="text-gold-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{b.title}</p>
                    <p className="text-xs text-navy-400 mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-navy-800/40 border border-navy-700/30 rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              {[1, 2].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-gold-400 text-navy-900' : 'bg-navy-700/50 text-navy-400'}`}>{s}</div>
                  <span className={`text-sm ${step >= s ? 'text-white' : 'text-navy-500'}`}>{s === 1 ? 'Company' : 'Account'}</span>
                  {s === 1 && <div className={`w-12 h-0.5 rounded ${step > 1 ? 'bg-gold-400' : 'bg-navy-700/50'}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-1">Company Information</h2>
                <p className="text-sm text-navy-400 mb-4">Tell us about your organization</p>
                <div>
                  <label className="block text-sm text-navy-300 mb-1.5">Company Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.companyName} onChange={e => update('companyName', e.target.value)} placeholder="e.g. Safaricom PLC" className="w-full px-4 py-3 rounded-xl bg-navy-900/50 border border-navy-700/30 text-white text-sm placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-navy-300 mb-1.5">Industry</label>
                  <select value={form.industry} onChange={e => update('industry', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-navy-900/50 border border-navy-700/30 text-white text-sm focus:outline-none focus:border-gold-400/50">
                    <option value="">Select industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance & Banking">Finance & Banking</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Media & Communications">Media & Communications</option>
                    <option value="Government">Government</option>
                    <option value="Non-Profit">Non-Profit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-navy-300 mb-1.5">Office Address</label>
                  <input type="text" value={form.address} onChange={e => update('address', e.target.value)} placeholder="Nairobi, Kenya" className="w-full px-4 py-3 rounded-xl bg-navy-900/50 border border-navy-700/30 text-white text-sm placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
                </div>
                <div>
                  <label className="block text-sm text-navy-300 mb-1.5">Number of Employees</label>
                  <select value={form.maxEmployees} onChange={e => update('maxEmployees', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-navy-900/50 border border-navy-700/30 text-white text-sm focus:outline-none focus:border-gold-400/50">
                    <option value="25">1 - 25</option>
                    <option value="50">26 - 50</option>
                    <option value="100">51 - 100</option>
                    <option value="250">101 - 250</option>
                    <option value="500">251 - 500</option>
                    <option value="1000">500+</option>
                  </select>
                </div>
                <button onClick={() => { if (!form.companyName) { toast.error('Company name is required'); return; } setStep(2); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 font-semibold text-sm hover:shadow-lg hover:shadow-gold-400/20 transition-all flex items-center justify-center gap-2 mt-2">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-1">Contact & Account</h2>
                <p className="text-sm text-navy-400 mb-4">Set up your administrator account</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-navy-300 mb-1.5">First Name <span className="text-red-400">*</span></label>
                    <input type="text" value={form.contactFirstName} onChange={e => update('contactFirstName', e.target.value)} placeholder="John" className="w-full px-4 py-3 rounded-xl bg-navy-900/50 border border-navy-700/30 text-white text-sm placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-navy-300 mb-1.5">Last Name <span className="text-red-400">*</span></label>
                    <input type="text" value={form.contactLastName} onChange={e => update('contactLastName', e.target.value)} placeholder="Kamau" className="w-full px-4 py-3 rounded-xl bg-navy-900/50 border border-navy-700/30 text-white text-sm placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-navy-300 mb-1.5">Work Email <span className="text-red-400">*</span></label>
                  <input type="email" value={form.contactEmail} onChange={e => update('contactEmail', e.target.value)} placeholder="john@company.co.ke" className="w-full px-4 py-3 rounded-xl bg-navy-900/50 border border-navy-700/30 text-white text-sm placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
                </div>
                <div>
                  <label className="block text-sm text-navy-300 mb-1.5">Phone Number</label>
                  <input type="tel" value={form.contactPhone} onChange={e => update('contactPhone', e.target.value)} placeholder="+254 7XX XXX XXX" className="w-full px-4 py-3 rounded-xl bg-navy-900/50 border border-navy-700/30 text-white text-sm placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
                </div>
                <div>
                  <label className="block text-sm text-navy-300 mb-1.5">Password <span className="text-red-400">*</span></label>
                  <input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min 8 characters" className="w-full px-4 py-3 rounded-xl bg-navy-900/50 border border-navy-700/30 text-white text-sm placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-navy-700/50 text-navy-400 text-sm font-medium hover:text-white hover:border-navy-600 transition-colors">Back</button>
                  <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 font-semibold text-sm hover:shadow-lg hover:shadow-gold-400/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Building2 size={16} />} Join LIFELINK
                  </button>
                </div>
              </div>
            )}

            <p className="text-[11px] text-navy-500 mt-6 text-center">
              By joining, you agree to our <Link href="/terms" className="text-gold-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-gold-400 hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
