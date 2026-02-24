import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="container-custom max-w-3xl">
        <h1 className="heading-2 text-navy-800 mb-8">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none text-charcoal-700 space-y-6">
          <p className="text-sm text-charcoal-400">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-xl font-semibold text-navy-800">1. Introduction</h2>
          <p>LifeLink Mental Wellness Solution (&ldquo;LifeLink&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is committed to protecting your privacy and personal data in compliance with the Kenya Data Protection Act, 2019. This policy explains how we collect, use, store, and protect your information.</p>

          <h2 className="text-xl font-semibold text-navy-800">2. Information We Collect</h2>
          <p>We collect personal information including: name, email, phone number, medical history, session notes, payment information, and device/usage data. Health data is treated as sensitive personal data under Kenyan law.</p>

          <h2 className="text-xl font-semibold text-navy-800">3. How We Use Your Information</h2>
          <p>Your information is used to: provide healthcare services, process payments, communicate about appointments, improve our services, comply with legal obligations, and protect your safety in crisis situations.</p>

          <h2 className="text-xl font-semibold text-navy-800">4. Data Security</h2>
          <p>We employ AES-256 encryption, secure JWT authentication, HTTPS everywhere, and role-based access controls. All data is stored securely in compliance with international healthcare standards.</p>

          <h2 className="text-xl font-semibold text-navy-800">5. Your Rights</h2>
          <p>Under the Kenya Data Protection Act, you have the right to: access your data, correct inaccuracies, request deletion, restrict processing, data portability, and object to processing.</p>

          <h2 className="text-xl font-semibold text-navy-800">6. Contact Us</h2>
          <p>For privacy inquiries, contact our Data Protection Officer at <a href="mailto:privacy@lifelink.co.ke" className="text-gold-600">privacy@lifelink.co.ke</a></p>
        </div>
      </div>
    </div>
  );
}
