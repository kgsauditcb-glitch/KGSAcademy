'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function str(v: FormDataEntryValue | null) {
  const s = String(v ?? '').trim();
  return s === '' ? null : s;
}

function toIso(v: FormDataEntryValue | null) {
  const s = String(v ?? '').trim();
  return s === '' ? null : new Date(s).toISOString();
}

async function offerPayload(formData: FormData) {
  const discountType = String(formData.get('discount_type')) === 'fixed' ? 'fixed' : 'percent';
  const discountValue = Number(formData.get('discount_value'));
  if (!discountValue || discountValue <= 0) {
    throw new Error('Discount value must be greater than 0');
  }
  return {
    title: String(formData.get('title') ?? '').trim(),
    description: str(formData.get('description')),
    code: str(formData.get('code')),
    discount_type: discountType,
    discount_value: discountValue,
    banner_text: str(formData.get('banner_text')),
    course_id: str(formData.get('course_id')),
    starts_at: toIso(formData.get('starts_at')),
    ends_at: toIso(formData.get('ends_at')),
    is_active: formData.get('is_active') === 'on',
    sort_order: Number(formData.get('sort_order') ?? 0) || 0,
  };
}

export async function createOffer(formData: FormData) {
  const supabase = await createClient();
  const payload = await offerPayload(formData);
  if (!payload.title) throw new Error('Title is required');
  const { error } = await supabase.from('offers').insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/offers');
  revalidatePath('/');
  redirect('/admin/offers');
}

export async function updateOffer(id: string, formData: FormData) {
  const supabase = await createClient();
  const payload = await offerPayload(formData);
  if (!payload.title) throw new Error('Title is required');
  const { error } = await supabase.from('offers').update(payload).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/offers');
  revalidatePath('/');
  redirect('/admin/offers');
}

export async function deleteOffer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('offers').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/offers');
  revalidatePath('/');
}

export async function toggleOffer(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from('offers').update({ is_active: isActive }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/offers');
  revalidatePath('/');
}
