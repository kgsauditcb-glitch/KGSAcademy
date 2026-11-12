import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ENQUIRY_TYPES = ['individual', 'corporate', 'custom_programme', 'other'];

const ENQUIRY_NOTIFY_EMAILS = [
  'ravi@kgsafrica.com',
  'ravi@kgsgbl.com',
  'mehtau@kgsafrica.com',
];

async function notifyEnquiry(details: {
  name: string;
  email: string;
  phone: string | null;
  enquiryType: string;
  course: string | null;
  message: string | null;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  const rows: [string, string | null][] = [
    ['Name', details.name],
    ['Email', details.email],
    ['Phone', details.phone],
    ['Enquiry type', details.enquiryType],
    ['Course of interest', details.course],
    ['Message', details.message],
  ];
  const text = rows.map(([k, v]) => `${k}: ${v ?? '—'}`).join('\n');
  const html = `
    <h2 style="font-family:sans-serif">New KGS Academy enquiry</h2>
    <table style="font-family:sans-serif;border-collapse:collapse">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 12px 4px 0;font-weight:bold">${k}</td><td>${v ?? '—'}</td></tr>`,
        )
        .join('')}
    </table>`;

  try {
    await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: ENQUIRY_NOTIFY_EMAILS,
        subject: `New enquiry: ${details.name}${details.course ? ` — ${details.course}` : ''}`,
        replyTo: details.email,
        text,
        html,
      }),
    });
  } catch (err) {
    console.error('Failed to send enquiry notification email', err);
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Honeypot — bots fill this; pretend success and drop.
  if (body['bot-field']) {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  if (!name || !email || !email.includes('@')) {
    return NextResponse.json({ error: 'Name and a valid email are required' }, { status: 400 });
  }

  const enquiryType = ENQUIRY_TYPES.includes(String(body.enquiry_type))
    ? String(body.enquiry_type)
    : 'individual';
  const phone = body.phone ? String(body.phone) : null;
  const course = body.course ? String(body.course) : null;
  const message = body.message ? String(body.message) : null;

  const supabase = await createClient();
  const { error } = await supabase.from('enquiries').insert({
    name,
    email,
    phone,
    enquiry_type: enquiryType,
    course_interest: course,
    message,
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to save enquiry' }, { status: 500 });
  }

  await notifyEnquiry({ name, email, phone, enquiryType, course, message });

  return NextResponse.json({ ok: true });
}
