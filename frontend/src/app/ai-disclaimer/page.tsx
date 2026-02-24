import { Metadata } from 'next';

export const metadata: Metadata = { title: 'AI Disclaimer' };

export default function AIDisclaimerPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="container-custom max-w-3xl">
        <h1 className="heading-2 text-navy-800 mb-8">AI Disclaimer</h1>
        <div className="prose prose-lg max-w-none text-charcoal-700 space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
            <p className="font-semibold text-amber-800">Important: Our AI assistant is not a substitute for professional medical advice, diagnosis, or treatment.</p>
          </div>

          <h2 className="text-xl font-semibold text-navy-800">About Our AI Assistant</h2>
          <p>LifeLink uses artificial intelligence to provide initial support, general mental health information, and service recommendations. The AI assistant is designed to complement — not replace — professional care.</p>

          <h2 className="text-xl font-semibold text-navy-800">Limitations</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>AI responses are generated algorithmically and may not always be accurate</li>
            <li>The AI cannot diagnose medical or mental health conditions</li>
            <li>AI interactions do not constitute a doctor-patient relationship</li>
            <li>The AI may not fully understand context, nuance, or cultural specifics</li>
          </ul>

          <h2 className="text-xl font-semibold text-navy-800">Crisis Situations</h2>
          <p>If the AI detects signs of crisis, it will recommend immediate professional help. However, if you are in immediate danger, please call 999, visit your nearest hospital, or call our 24/7 helpline at +254 700 000 000.</p>

          <h2 className="text-xl font-semibold text-navy-800">Data Handling</h2>
          <p>AI conversations are processed securely and may be reviewed by our clinical team to improve care quality. All data handling complies with the Kenya Data Protection Act.</p>
        </div>
      </div>
    </div>
  );
}
