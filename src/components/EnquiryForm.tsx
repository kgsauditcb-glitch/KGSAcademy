'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function EnquiryForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // Honeypot: bots fill this hidden field — silently accept and drop.
    if (data['bot-field']) {
      setStatus('sent');
      return;
    }

    setStatus('sending');
    const supabase = createClient();

    const { error } = await supabase.from('enquiries').insert({
      name: String(data.name ?? ''),
      email: String(data.email ?? ''),
      phone: data.phone ? String(data.phone) : null,
      enquiry_type: data.enquiry_type ?? 'individual',
      course_interest: data.course ? String(data.course) : null,
      message: data.message ? String(data.message) : null,
    });

    if (error) {
      setStatus('error');
      return;
    }
    setStatus('sent');
    form.reset();
    router.refresh();
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center">
        <p className="font-bold text-emerald-800">Thank you!</p>
        <p className="text-sm text-emerald-700 mt-1">
          Your enquiry has been received. Our team will be in touch shortly.
        </p>
      </div>
    );
  }

  const input =
    'w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400';
  const label = 'block text-xs font-bold mb-1.5 text-blue-900';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Honeypot — hidden from humans */}
      <input type="text" name="bot-field" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} htmlFor="enq-name">Full name</label>
          <input id="enq-name" name="name" required className={input} autoComplete="name" />
        </div>
        <div>
          <label className={label} htmlFor="enq-phone">Phone</label>
          <input id="enq-phone" name="phone" type="tel" className={input} autoComplete="tel" />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="enq-email">Email</label>
        <input id="enq-email" name="email" type="email" required className={input} autoComplete="email" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} htmlFor="enq-type">Enquiry type</label>
          <select id="enq-type" name="enquiry_type" className={input} defaultValue="individual">
            <option value="individual">Individual</option>
            <option value="corporate">Corporate / group training</option>
            <option value="custom_programme">Custom programme</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="enq-course">Course of interest</label>
          <input id="enq-course" name="course" className={input} placeholder="e.g. ISO 9001 Lead Auditor" />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="enq-msg">Message</label>
        <textarea id="enq-msg" name="message" rows={4} className={input} placeholder="How can we help?" />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">Sorry, something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-lg bg-orange-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-800 disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  );
}
