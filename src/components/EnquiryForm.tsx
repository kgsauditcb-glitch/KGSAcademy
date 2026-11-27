
'use client';

import { useState, useEffect, type FormEvent } from 'react';

export function EnquiryForm() {
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'sent' | 'error'
  >('idle');

  const [whatsappUrl, setWhatsappUrl] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

   
    if (data['bot-field']) return;

    
    const whatsappWindow = window.open('about:blank', '_blank');

    setStatus('sending');
    setWhatsappUrl('');

    try {
      
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to save enquiry');
      }

      
      const message = `
*KGS ACADEMY - NEW ENQUIRY*

Name: ${data.name}
Phone: ${data.phone || 'Not provided'}
Email: ${data.email}
Enquiry Type: ${data.enquiry_type}
Course: ${data.course || 'Not specified'}

Message:
${data.message || 'No message provided'}
      `.trim();

      
      const managementNumber = '919999999999';

      const url = `https://wa.me/${managementNumber}?text=${encodeURIComponent(message)}`;

      setWhatsappUrl(url);

      
      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.location.href = url;
      }

      form.reset();
      setStatus('sent');

    } catch (error) {
      console.error('Enquiry submission error:', error);

    
      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.close();
      }

      setStatus('error');
    }
  }

  useEffect(() => {
  if (status === 'sent') {
    const timer = setTimeout(() => {
      setStatus('idle');
      setWhatsappUrl('');
    }, 5000); 

    return () => clearTimeout(timer);
  }
}, [status]);

  const input =
    'w-full rounded-lg border border-(--border) bg-(--bg-card) px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400';

  const label =
    'block text-xs font-bold mb-1.5 text-(--text-secondary)';

  if (status === 'sent') {
    return (
      <div className="rounded-xl bg-emerald-950 border border-emerald-800 p-6 text-center">
        <p className="font-bold text-emerald-300">
          Thank you!
        </p>

        <p className="text-sm text-emerald-300 mt-1">
          Your enquiry has been received. Our team will be in touch shortly.
        </p>

       
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">

      {/* Honeypot */}
      <input
        type="text"
        name="bot-field"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} htmlFor="enq-name">
            Full name
          </label>
          <input
            id="enq-name"
            name="name"
            required
            className={input}
            autoComplete="name"
          />
        </div>

        <div>
          <label className={label} htmlFor="enq-phone">
            Phone
          </label>
          <input
            id="enq-phone"
            name="phone"
            type="tel"
            className={input}
            autoComplete="tel"
          />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="enq-email">
          Email
        </label>
        <input
          id="enq-email"
          name="email"
          type="email"
          required
          className={input}
          autoComplete="email"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} htmlFor="enq-type">
            Enquiry type
          </label>
          <select
            id="enq-type"
            name="enquiry_type"
            className={input}
            defaultValue="individual"
          >
            <option value="individual">Individual</option>
            <option value="corporate">
              Corporate / group training
            </option>
            <option value="custom_programme">
              Custom programme
            </option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className={label} htmlFor="enq-course">
            Course of interest
          </label>
          <input
            id="enq-course"
            name="course"
            className={input}
            placeholder="e.g. ISO 9001 Lead Auditor"
          />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="enq-msg">
          Message
        </label>
        <textarea
          id="enq-msg"
          name="message"
          rows={4}
          className={input}
          placeholder="How can we help?"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-400">
          Sorry, something went wrong. Please try again.
        </p>
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
