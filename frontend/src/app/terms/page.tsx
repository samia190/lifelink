import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="container-custom max-w-3xl">
        <h1 className="heading-2 text-navy-800 mb-8">Terms of Service</h1>
        <div className="prose prose-lg max-w-none text-charcoal-700 space-y-6">
          <p className="text-sm text-charcoal-400">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-xl font-semibold text-navy-800">1. Acceptance of Terms</h2>
          <p>By accessing or using LifeLink Mental Wellness Solution&apos;s services, you agree to be bound by these Terms of Service and our Privacy Policy.</p>

          <h2 className="text-xl font-semibold text-navy-800">2. Services</h2>
          <p>LifeLink provides mental and medical healthcare services including therapy, psychiatric consultations, telehealth sessions, corporate wellness programs, and educational webinars.</p>

          <h2 className="text-xl font-semibold text-navy-800">3. Appointments & Cancellations</h2>
          <p>Appointments may be cancelled or rescheduled with at least 24 hours notice. Late cancellations or no-shows may be subject to charges.</p>

          <h2 className="text-xl font-semibold text-navy-800">4. Telehealth</h2>
          <p>Telehealth services are provided via secure, encrypted video conferencing. You are responsible for ensuring a private, stable internet connection.</p>

          <h2 className="text-xl font-semibold text-navy-800">5. Payments</h2>
          <p>Payments are processed via M-Pesa and card payments. All fees are in Kenyan Shillings (KES). Insurance claims support is available for select providers.</p>

          <h2 className="text-xl font-semibold text-navy-800">6. Limitation of Liability</h2>
          <p>LifeLink provides professional healthcare services but is not liable for outcomes beyond our reasonable control. In emergencies, please call 999 or visit your nearest hospital.</p>

          <h2 className="text-xl font-semibold text-navy-800">7. Contact</h2>
          <p>For inquiries: <a href="mailto:legal@lifelink.co.ke" className="text-gold-600">legal@lifelink.co.ke</a></p>
        </div>
      </div>
    </div>
  );
}
