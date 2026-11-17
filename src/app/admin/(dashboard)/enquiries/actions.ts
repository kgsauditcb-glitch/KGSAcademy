
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { EnquiryStatus } from '@/types/database';

const ENQUIRY_STATUSES: EnquiryStatus[] = [
  'new',
  'in_progress',
  'converted',
  'closed',
];

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

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}


export async function updateEnquiry(
  enquiryId: string,
  formData: FormData,
) {
  const supabase = await requireAdmin();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const status = getFormValue(formData, 'status');
  const internalNotes = getFormValue(
    formData,
    'internal_notes',
  );

  const closureComment = getFormValue(
  formData,
  'closure_comment',
);

  const editUrl = `/admin/enquiries/${enquiryId}/edit`;

  if (!ENQUIRY_STATUSES.includes(status as EnquiryStatus)) {
    redirect(
      `${editUrl}?error=${encodeURIComponent(
        'Please select a valid enquiry status.',
      )}`,
    );
  }

  
  const { data: existing, error: fetchError } = await supabase
    .from('enquiries')
    .select('id, status, internal_notes')
    .eq('id', enquiryId)
    .maybeSingle();

  if (fetchError || !existing) {
    redirect(
      `${editUrl}?error=${encodeURIComponent(
        'Unable to find this enquiry.',
      )}`,
    );
  }

 const newStatus = status as EnquiryStatus;

const statusChanged = existing.status !== newStatus;

const isClosingConvertedEnquiry =
  existing.status === 'converted' &&
  newStatus === 'closed';


if (isClosingConvertedEnquiry && !closureComment) {
  redirect(
    `${editUrl}?error=${encodeURIComponent(
      'Please provide a closure comment before closing this enquiry.',
    )}`,
  );
}
  const notesChanged =
    (existing.internal_notes ?? '') !== internalNotes;

  if (!statusChanged && !notesChanged) {
    redirect('/admin/enquiries');
  }

  
  const { data, error } = await supabase
    .from('enquiries')
    .update({
      status: newStatus,
      internal_notes: internalNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', enquiryId)
    .select('id')
    .maybeSingle();

  if (error || !data) {
    console.error('Update enquiry error:', error);

    redirect(
      `${editUrl}?error=${encodeURIComponent(
        error?.message || 'Enquiry could not be updated.',
      )}`,
    );
  }

  
  const actorName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    'Admin';

 
 const activityNote = [
  closureComment
    ? `Closure Comment: ${closureComment}`
    : '',
  internalNotes
    ? `Internal Notes: ${internalNotes}`
    : '',
]
  .filter(Boolean)
  .join('\n\n');

const { error: historyError } = await supabase
  .from('enquiry_activity_history')
  .insert({
    enquiry_id: enquiryId,
    from_status: existing.status,
    to_status: newStatus,
    note: activityNote || null,
    actor_id: user.id,
    actor_name: actorName,
  });

  if (historyError) {
    console.error('Enquiry history error:', historyError);

    redirect(
      `${editUrl}?error=${encodeURIComponent(
        'Enquiry updated, but activity history could not be saved.',
      )}`,
    );
  }

  
  revalidatePath('/admin');
  revalidatePath('/admin/enquiries');
  revalidatePath(editUrl);

  redirect('/admin/enquiries?success=updated');
}


export async function convertEnquiry(
  enquiryId: string,
  formData: FormData,
) {
  const supabase = await requireAdmin();

  const courseId = getFormValue(formData, 'course_id');
  const sessionId = getFormValue(formData, 'session_id');
  const meetingLink = getFormValue(formData, 'meeting_link');
  const additionalMessage = getFormValue(
    formData,
    'additional_message',
  );

  const editUrl = `/admin/enquiries/${enquiryId}/edit`;

  const { data: enquiry, error: enquiryError } = await supabase
    .from('enquiries')
    .select('id, name, email, status')
    .eq('id', enquiryId)
    .maybeSingle();

  if (enquiryError || !enquiry) {
    redirect(`${editUrl}?error=Enquiry not found`);
  }

  if (enquiry.status !== 'in_progress') {
    redirect(`${editUrl}?error=Only in-progress enquiries can be converted`);
  }

  if (!courseId) {
    redirect(`${editUrl}?error=Please select a course`);
  }

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, mode, duration_days')
    .eq('id', courseId)
    .eq('status', 'published')
    .maybeSingle();

  if (courseError || !course) {
    redirect(`${editUrl}?error=Invalid course selected`);
  }

  let session = null;

  if (sessionId) {
    const { data, error } = await supabase
      .from('course_sessions')
      .select('id, start_date, end_date, start_time, location, meeting_url')
      .eq('id', sessionId)
      .eq('course_id', courseId)
      .in('status', ['scheduled', 'open'])
      .maybeSingle();

    if (error || !data) {
      redirect(`${editUrl}?error=Invalid training session`);
    }

    session = data;
  }

const finalMeetingLink = meetingLink || session?.meeting_url || '';

  if (finalMeetingLink) {
    try {
      const url = new URL(finalMeetingLink);

      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid URL');
      }
    } catch {
      redirect(`${editUrl}?error=Invalid meeting link`);
    }
  }

  if (!enquiry.email) {
    redirect(`${editUrl}?error=Student email is missing`);
  }

  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[char]!);

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#333;line-height:1.6">
      <h2 style="color:#e87524">Welcome to KGS Academy!</h2>

      <p>Dear ${escapeHtml(enquiry.name)},</p>

      <p>Your enquiry has been successfully converted.
      Here are your course details:</p>

      <h3>Course Details</h3>

      <p><strong>Course:</strong> ${escapeHtml(course.title)}</p>
      <p><strong>Mode:</strong> ${escapeHtml(course.mode)}</p>
      <p><strong>Duration:</strong> ${course.duration_days ?? 'To be confirmed'} days</p>

      ${
        session
          ? `
            <h3>Training Schedule</h3>
            <p><strong>Start:</strong> ${escapeHtml(session.start_date)}</p>
            <p><strong>End:</strong> ${escapeHtml(session.end_date || 'To be confirmed')}</p>
            <p><strong>Time:</strong> ${escapeHtml(session.start_time || 'To be confirmed')}</p>
            <p><strong>Location:</strong> ${escapeHtml(session.location || 'To be confirmed')}</p>
          `
          : '<p>Our team will share the training schedule separately.</p>'
      }

      ${
        finalMeetingLink
          ? `<p><strong>Meeting:</strong>
             <a href="${escapeHtml(finalMeetingLink)}">Join Meeting</a></p>`
          : ''
      }

      ${
        additionalMessage
          ? `<h3>Additional Instructions</h3>
             <p>${escapeHtml(additionalMessage).replace(/\n/g, '<br />')}</p>`
          : ''
      }

      <p>Thank you for choosing KGS Academy.</p>

      <p>Regards,<br/><strong>KGS Academy Team</strong></p>
    </div>
  `;

  // Send email using existing Edge Function.
  const { data: emailData, error: emailError } =
    await supabase.functions.invoke('send-email', {
      body: {
        to: enquiry.email,
        subject: `Your Course Details - ${course.title} | KGS Academy`,
        html,
      },
    });

if (emailError || !emailData?.success) {
  console.error('Enquiry converted, but email could not be sent:', {
    error: emailError?.message,
    data: emailData,
  });
}

  // Update enquiry status only after successful email delivery.
  const { data: updated, error: updateError } = await supabase
    .from('enquiries')
    .update({ status: 'converted' })
    .eq('id', enquiryId)
    .eq('status', 'in_progress')
    .select('id')
    .maybeSingle();

  if (updateError || !updated) {
    console.error('Conversion update error:', updateError);

    redirect(
      `${editUrl}?error=${encodeURIComponent('Email sent, but enquiry status could not be updated. Check before retrying.')}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const actorName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    'Admin';

  const { error: historyError } = await supabase
    .from('enquiry_activity_history')
    .insert({
      enquiry_id: enquiryId,
      from_status: 'in_progress',
      to_status: 'converted',
      note: `Course: ${course.title}. ${additionalMessage}`.trim(),
      actor_id: user?.id ?? null,
      actor_name: actorName,
    });

  if (historyError) {
    console.error('Conversion history error:', historyError);
  }

  revalidatePath('/admin');
  revalidatePath('/admin/enquiries');
  revalidatePath(editUrl);

  redirect('/admin/enquiries?success=updated');
}


