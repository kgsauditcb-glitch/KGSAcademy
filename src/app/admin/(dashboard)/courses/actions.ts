
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { CourseMode, CourseStatus } from '@/types/database';

const COURSE_MODES: CourseMode[] = [
  'classroom',
  'live_online',
  'hybrid',
  'self_paced',
];

const COURSE_STATUSES: CourseStatus[] = [
  'draft',
  'published',
  'archived',
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

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function nullableText(value: string) {
  return value || null;
}

function nullableNumber(value: string) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string,
  requestedSlug: string,
  excludeId?: string,
) {
  const baseSlug = makeSlug(requestedSlug || title) || 'course';

  for (let attempt = 1; attempt <= 100; attempt++) {
    const candidate =
      attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;

    let query = supabase
      .from('courses')
      .select('id')
      .eq('slug', candidate);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Could not check course slug: ${error.message}`);
    }

    if (!data) return candidate;
  }

  throw new Error('Could not generate a unique course slug.');
}

async function uploadThumbnail(
  supabase: Awaited<ReturnType<typeof createClient>>,
  formData: FormData,
) {
  const file = formData.get('thumbnail');

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload an image file.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Thumbnail must be 5 MB or smaller.');
  }

  const safeName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/-+/g, '-');

  const filePath = `${crypto.randomUUID()}-${safeName}`;

  const { error } = await supabase.storage
    .from('course-thumbnails')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Thumbnail upload failed: ${error.message}`);
  }

  const { data } = supabase.storage
    .from('course-thumbnails')
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: data.publicUrl,
  };
}

function getCourseValues(formData: FormData) {
  const title = textValue(formData, 'title');

  const modeValue = textValue(formData, 'mode');
  const statusValue = textValue(formData, 'status');

  if (!title) {
    throw new Error('Course title is required.');
  }

  if (!COURSE_MODES.includes(modeValue as CourseMode)) {
    throw new Error('Please select a valid course mode.');
  }

  if (!COURSE_STATUSES.includes(statusValue as CourseStatus)) {
    throw new Error('Please select a valid course status.');
  }

  const price = textValue(formData, 'price_inr');
  const mrp = textValue(formData, 'mrp_inr');
  const duration = textValue(formData, 'duration_days');

  const priceValue = nullableNumber(price);
  const mrpValue = nullableNumber(mrp);
  const durationValue = nullableNumber(duration);

  if (
    (price && (priceValue === null || priceValue < 0)) ||
    (mrp && (mrpValue === null || mrpValue < 0))
  ) {
    throw new Error('Please enter valid non-negative prices.');
  }

  if (
    duration &&
    (durationValue === null ||
      !Number.isInteger(durationValue) ||
      durationValue < 1)
  ) {
    throw new Error('Duration must be a positive whole number of days.');
  }

  return {
    title,
    requestedSlug: textValue(formData, 'slug'),
    summary: nullableText(textValue(formData, 'summary')),
    description: nullableText(textValue(formData, 'description')),
    category_id: nullableText(textValue(formData, 'category_id')),
    standard_id: nullableText(textValue(formData, 'standard_id')),
    duration_days: durationValue,
    mode: modeValue as CourseMode,
    price_inr: priceValue,
    mrp_inr: mrpValue,
    certificate: formData.get('certificate') === 'on',
    featured: formData.get('featured') === 'on',
    status: statusValue as CourseStatus,
  };
}

function revalidateCoursePages(slug?: string) {
  revalidatePath('/');
  revalidatePath('/courses');
  revalidatePath('/admin');
  revalidatePath('/admin/courses');

  if (slug) {
    revalidatePath(`/courses/${slug}`);
  }
}

export async function createCourseAction(formData: FormData) {
  const supabase = await requireAdmin();
  let uploadedPath: string | null = null;
  let slug = '';

  try {
    const values = getCourseValues(formData);

    slug = await getUniqueSlug(
      supabase,
      values.title,
      values.requestedSlug,
    );

    const thumbnail = await uploadThumbnail(supabase, formData);
    uploadedPath = thumbnail?.path ?? null;

    const { error } = await supabase.from('courses').insert({
      title: values.title,
      slug,
      summary: values.summary,
      description: values.description,
      category_id: values.category_id,
      standard_id: values.standard_id,
      duration_days: values.duration_days,
      mode: values.mode,
      price_inr: values.price_inr,
      mrp_inr: values.mrp_inr,
      certificate: values.certificate,
      featured: values.featured,
      status: values.status,
      thumbnail_url: thumbnail?.url ?? null,
    });

    if (error) throw new Error(error.message);
  } catch (error) {
    if (uploadedPath) {
      await supabase.storage
        .from('course-thumbnails')
        .remove([uploadedPath]);
    }

    const message =
      error instanceof Error ? error.message : 'Could not create course.';

    redirect(
      `/admin/courses/new?error=${encodeURIComponent(message)}`,
    );
  }

  revalidateCoursePages(slug);
  redirect('/admin/courses?success=created');
}

export async function updateCourseAction(
  courseId: string,
  formData: FormData,
) {
  const supabase = await requireAdmin();
  let uploadedPath: string | null = null;
  let slug = '';

  try {
    const values = getCourseValues(formData);

    slug = await getUniqueSlug(
      supabase,
      values.title,
      values.requestedSlug,
      courseId,
    );

    const thumbnail = await uploadThumbnail(supabase, formData);
    uploadedPath = thumbnail?.path ?? null;

    const updateValues = {
      title: values.title,
      slug,
      summary: values.summary,
      description: values.description,
      category_id: values.category_id,
      standard_id: values.standard_id,
      duration_days: values.duration_days,
      mode: values.mode,
      price_inr: values.price_inr,
      mrp_inr: values.mrp_inr,
      certificate: values.certificate,
      featured: values.featured,
      status: values.status,
      ...(thumbnail ? { thumbnail_url: thumbnail.url } : {}),
    };

    const { data, error } = await supabase
      .from('courses')
      .update(updateValues)
      .eq('id', courseId)
      .select('id')
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (!data) {
      throw new Error('Course not found or update was not permitted.');
    }
  } catch (error) {
    if (uploadedPath) {
      await supabase.storage
        .from('course-thumbnails')
        .remove([uploadedPath]);
    }

    const message =
      error instanceof Error ? error.message : 'Could not update course.';

    redirect(
      `/admin/courses/${courseId}/edit?error=${encodeURIComponent(message)}`,
    );
  }

  revalidateCoursePages(slug);
  redirect('/admin/courses?success=updated');
}

