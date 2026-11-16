
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

  const status = getFormValue(formData, 'status');
  const internalNotes = getFormValue(formData, 'internal_notes');

  const editUrl = `/admin/enquiries/${enquiryId}/edit`;

  if (!ENQUIRY_STATUSES.includes(status as EnquiryStatus)) {
    redirect(
      `${editUrl}?error=${encodeURIComponent(
        'Please select a valid enquiry status.',
      )}`,
    );
  }

  const { data, error } = await supabase
    .from('enquiries')
    .update({
      status: status as EnquiryStatus,
      internal_notes: internalNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', enquiryId)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Update enquiry error:', error);

    redirect(
      `${editUrl}?error=${encodeURIComponent(error.message)}`,
    );
  }

  if (!data) {
    redirect(
      `${editUrl}?error=${encodeURIComponent(
        'Enquiry was not updated. Check your Supabase permissions.',
      )}`,
    );
  }

  revalidatePath('/admin');
  revalidatePath('/admin/enquiries');
  revalidatePath(editUrl);

  redirect('/admin/enquiries?success=updated');
}
