'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const SESSION_STATUSES = [
  'scheduled',
  'open',
  'full',
  'completed',
  'cancelled',
] as const;

type SessionStatus = (typeof SESSION_STATUSES)[number];

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/admin/login');
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc('is_admin');

  if (adminError || !isAdmin) {
    redirect('/admin/login');
  }

  return supabase;
}

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getSessionValues(formData: FormData) {
  const course_id = textValue(formData, 'course_id');
  const start_date = textValue(formData, 'start_date');
  const endDate = textValue(formData, 'end_date');
  const startTime = textValue(formData, 'start_time');
  const location = textValue(formData, 'location');
  const meetingUrl = textValue(formData, 'meeting_url');

  const capacityValue = textValue(formData, 'capacity');
  const seatsValue = textValue(formData, 'seats_filled') || '0';
  const statusValue = textValue(formData, 'status') || 'scheduled';

  const capacity =
    capacityValue === '' ? null : Number(capacityValue);

  const seats_filled = Number(seatsValue);

  if (!course_id) {
    throw new Error('Please select a course.');
  }

  if (!start_date) {
    throw new Error('Start date is required.');
  }

  if (endDate && endDate < start_date) {
    throw new Error('End date cannot be before start date.');
  }

  if (
    capacity !== null &&
    (!Number.isInteger(capacity) || capacity < 1)
  ) {
    throw new Error('Capacity must be a positive whole number.');
  }

  if (!Number.isInteger(seats_filled) || seats_filled < 0) {
    throw new Error(
      'Seats filled must be zero or a positive whole number.',
    );
  }

  if (capacity !== null && seats_filled > capacity) {
    throw new Error('Seats filled cannot exceed total capacity.');
  }

  if (!SESSION_STATUSES.includes(statusValue as SessionStatus)) {
    throw new Error('Invalid session status.');
  }

  if (meetingUrl) {
    try {
      const url = new URL(meetingUrl);

      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error();
      }
    } catch {
      throw new Error('Please enter a valid meeting URL.');
    }
  }

  let status = statusValue as SessionStatus;

  // Automatically mark the session as full when capacity is reached.
  if (
    capacity !== null &&
    seats_filled >= capacity &&
    status !== 'completed' &&
    status !== 'cancelled'
  ) {
    status = 'full';
  }

  return {
    course_id,
    start_date,
    end_date: endDate || null,
    start_time: startTime || null,
    location: location || null,
    meeting_url: meetingUrl || null,
    capacity,
    seats_filled,
    status,
  };
}

function revalidateSessionPages() {
  revalidatePath('/');
  revalidatePath('/courses');
  revalidatePath('/admin');
  revalidatePath('/admin/sessions');
}

export async function createSession(formData: FormData) {
  const supabase = await requireAdmin();

  try {
    const values = getSessionValues(formData);

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', values.course_id)
      .maybeSingle();

    if (courseError || !course) {
      throw new Error('Please select a valid course.');
    }

    const { error } = await supabase
      .from('course_sessions')
      .insert(values);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Could not create session.';

    redirect(
      `/admin/sessions/new?error=${encodeURIComponent(message)}`,
    );
  }

  revalidateSessionPages();
  redirect('/admin/sessions?success=created');
}

export async function updateSession(
  id: string,
  formData: FormData,
) {
  const supabase = await requireAdmin();

  try {
    const values = getSessionValues(formData);

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', values.course_id)
      .maybeSingle();

    if (courseError || !course) {
      throw new Error('Please select a valid course.');
    }

    const { data, error } = await supabase
      .from('course_sessions')
      .update(values)
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(
        'Session not found or update was not permitted.',
      );
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Could not update session.';

    redirect(
      `/admin/sessions/${id}/edit?error=${encodeURIComponent(message)}`,
    );
  }

  revalidateSessionPages();
  redirect('/admin/sessions?success=updated');
}

export async function deleteSession(formData: FormData) {
  const supabase = await requireAdmin();
  const id = textValue(formData, 'id');

  if (!id) {
    redirect('/admin/sessions?error=Invalid session.');
  }

  const { error } = await supabase
    .from('course_sessions')
    .delete()
    .eq('id', id);

  if (error) {
    redirect(
      `/admin/sessions?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidateSessionPages();
  redirect('/admin/sessions?success=deleted');
}