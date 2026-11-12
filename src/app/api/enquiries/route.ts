import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ENQUIRY_TYPES = ['individual', 'corporate', 'custom_programme', 'other'];

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

  const supabase = await createClient();
  const { error } = await supabase.from('enquiries').insert({
    name,
    email,
    phone: body.phone ? String(body.phone) : null,
    enquiry_type: enquiryType,
    course_interest: body.course ? String(body.course) : null,
    message: body.message ? String(body.message) : null,
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to save enquiry' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
