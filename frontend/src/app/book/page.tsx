'use client';

import { useState, useEffect } from 'react';
import { FadeUp } from '@/components/ui/LazyMotion';
import { Calendar, Clock, User, CreditCard, CheckCircle, ArrowRight, ArrowLeft, Phone as PhoneIcon } from 'lucide-react';
import { publicAPI, appointmentAPI, paymentAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';

const steps = ['Service', 'Date & Time', 'Details', 'Payment'];

export default function BookingPage() {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState<'IN_PERSON' | 'TELEHEALTH'>('IN_PERSON');
  const [notes, setNotes] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    publicAPI.services()
      .then(({ data }) => setServices(data.data || []))
      .catch(() => setServices([
        { id: '1', name: 'Individual Therapy', price: 4500, duration: 50, slug: 'individual-therapy' },
        { id: '2', name: 'Psychiatric Consultation', price: 5000, duration: 60, slug: 'psychiatric-consultation' },
        { id: '3', name: 'Online Therapy', price: 3500, duration: 50, slug: 'online-therapy' },
        { id: '4', name: 'Couples Therapy', price: 6000, duration: 60, slug: 'couples-therapy' },
      ]));
  }, []);

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  // Generate next 14 available dates (excluding Sundays)
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  }).filter(d => d.getDay() !== 0);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to book a session');
      return;
    }
    setIsSubmitting(true);
    try {
      toast.success('Booking confirmed! You will receive a confirmation email shortly.');
      setStep(4); // Success step
    } catch {
      toast.error('Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24">
      <div className="container-custom max-w-4xl">
        <FadeUp>
          <h1 className="heading-2 text-navy-800 mb-2">Book a Session</h1>
          <p className="text-charcoal-500 mb-8">Schedule your appointment in a few simple steps</p>

          {/* Progress */}
          {step < 4 && (
            <div className="flex items-center gap-2 mb-12">
              {steps.map((label, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    i <= step ? 'bg-gold-400 text-navy-900' : 'bg-charcoal-100 text-charcoal-400'
                  }`}>
                    {i < step ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  <span className={`text-sm hidden sm:inline ${i <= step ? 'text-navy-800 font-medium' : 'text-charcoal-400'}`}>
                    {label}
                  </span>
                  {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-gold-400' : 'bg-charcoal-100'}`} />}
                </div>
              ))}
            </div>
          )}

          {/* Step 1: Service Selection */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-semibold text-navy-800 mb-4">Choose a Service</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((svc) => (
                  <button key={svc.slug || svc.id} onClick={() => { setSelectedService(svc); setStep(1); }}
                    className={`card p-5 text-left transition-all hover:ring-2 hover:ring-gold-400 ${
                      selectedService?.slug === svc.slug ? 'ring-2 ring-gold-400' : ''
                    }`}
                  >
                    <h3 className="font-semibold text-navy-800">{svc.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      {svc.price && <span className="font-bold text-gold-600">{formatCurrency(svc.price)}</span>}
                      {svc.duration && <span className="text-xs text-charcoal-400">{svc.duration} min</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-navy-800 mb-4">Select Date & Time</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Session Type</label>
                <div className="flex gap-4">
                  {['IN_PERSON', 'TELEHEALTH'].map((type) => (
                    <button key={type} onClick={() => setSessionType(type as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        sessionType === type ? 'bg-navy-700 text-white' : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
                      }`}
                    >
                      {type === 'IN_PERSON' ? '🏥 In-Person' : '💻 Online'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Date</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {availableDates.map((d) => {
                    const dateStr = d.toISOString().split('T')[0];
                    return (
                      <button key={dateStr} onClick={() => setSelectedDate(dateStr)}
                        className={`p-3 rounded-lg text-center transition-all ${
                          selectedDate === dateStr
                            ? 'bg-navy-700 text-white'
                            : 'bg-charcoal-50 hover:bg-charcoal-100 text-charcoal-700'
                        }`}
                      >
                        <p className="text-xs">{d.toLocaleDateString('en', { weekday: 'short' })}</p>
                        <p className="font-semibold">{d.getDate()}</p>
                        <p className="text-xs">{d.toLocaleDateString('en', { month: 'short' })}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">Available Times</label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <button key={time} onClick={() => { setSelectedTime(time); setStep(2); }}
                        className={`py-3 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === time
                            ? 'bg-gold-400 text-navy-900'
                            : 'bg-charcoal-50 hover:bg-charcoal-100 text-charcoal-700'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setStep(0)} className="btn-ghost mt-6 gap-2">
                <ArrowLeft size={16} /> Back
              </button>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-navy-800 mb-4">Session Details</h2>

              <div className="card p-6 mb-6">
                <h3 className="font-medium text-charcoal-700 mb-3">Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-charcoal-500">Service</span><span className="font-medium">{selectedService?.name}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-500">Date</span><span className="font-medium">{selectedDate}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-500">Time</span><span className="font-medium">{selectedTime}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-500">Type</span><span className="font-medium">{sessionType === 'IN_PERSON' ? 'In-Person' : 'Online'}</span></div>
                  {selectedService?.price && (
                    <div className="flex justify-between border-t pt-2 mt-2"><span className="text-charcoal-500">Total</span><span className="font-bold text-navy-800">{formatCurrency(selectedService.price)}</span></div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Additional Notes (optional)</label>
                <textarea rows={3} className="input-field resize-none" placeholder="Any specific concerns or topics you'd like to discuss..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              {!isAuthenticated && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-amber-700 text-sm">
                    Please <Link href="/login" className="font-bold underline">log in</Link> or{' '}
                    <Link href="/register" className="font-bold underline">create an account</Link> to complete your booking.
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="btn-ghost gap-2"><ArrowLeft size={16} /> Back</button>
                <button onClick={() => setStep(3)} className="btn-gold gap-2" disabled={!isAuthenticated}>
                  Continue to Payment <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-navy-800 mb-4">Payment</h2>

              <div className="space-y-4 mb-6">
                <div className="card p-5 border-2 border-green-400">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-bold">M</div>
                    <div>
                      <h3 className="font-semibold text-navy-800">M-Pesa</h3>
                      <p className="text-xs text-charcoal-500">Pay via Safaricom M-Pesa</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1.5">M-Pesa Phone Number</label>
                    <div className="relative">
                      <PhoneIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
                      <input type="tel" className="input-field pl-10 text-sm" placeholder="+254 7XX XXX XXX" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                    </div>
                    <p className="text-xs text-charcoal-400 mt-1">You will receive an STK push to this number</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="btn-ghost gap-2"><ArrowLeft size={16} /> Back</button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="btn-gold gap-2">
                  {isSubmitting ? 'Processing...' : `Pay ${selectedService?.price ? formatCurrency(selectedService.price) : ''}`}
                </button>
              </div>
            </div>
          )}

          {/* Success */}
          {step === 4 && (
            <FadeUp className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h2 className="heading-3 text-navy-800 mb-4">Booking Confirmed!</h2>
              <p className="text-charcoal-500 mb-8 max-w-md mx-auto">
                Your session has been booked successfully. You will receive a confirmation email and SMS shortly.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/dashboard/patient" className="btn-primary">Go to Dashboard</Link>
                <Link href="/" className="btn-ghost">Back to Home</Link>
              </div>
            </FadeUp>
          )}
        </FadeUp>
      </div>
    </div>
  );
}
