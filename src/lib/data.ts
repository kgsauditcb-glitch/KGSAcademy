import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Course, CourseSession, Enquiry, Offer, Profile, Standard, Category } from '@/types/database';

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

// Courses joined with their category & standard for display.
const COURSE_SELECT = `
  *,
  categories ( name, slug ),
  standards ( code, name, slug )
`;

export type CourseWithRelations = Course & {
  categories: Pick<Category, 'name' | 'slug'> | null;
  standards: Pick<Standard, 'code' | 'name' | 'slug'> | null;
};

export async function getFeaturedCourses(): Promise<CourseWithRelations[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select(COURSE_SELECT)
    .eq('status', 'published')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6);
  if (error) throw error;
  return (data ?? []) as CourseWithRelations[];
}

export async function getCourses(filters?: {
  categorySlug?: string;
  standardSlug?: string;
  mode?: string;
  search?: string;
}): Promise<CourseWithRelations[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();

  // Use INNER JOIN when a relation is being filtered.
  const categoryJoin = filters?.categorySlug ? '!inner' : '';
  const standardJoin = filters?.standardSlug ? '!inner' : '';

  const select = `
    *,
    categories${categoryJoin} ( name, slug ),
    standards${standardJoin} ( code, name, slug )
  `;

  let query = supabase
    .from('courses')
    .select(select)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (filters?.categorySlug) {
    query = query.eq('categories.slug', filters.categorySlug);
  }

  if (filters?.standardSlug) {
    query = query.eq('standards.slug', filters.standardSlug);
  }

  if (filters?.mode) {
    query = query.eq('mode', filters.mode);
  }

  if (filters?.search?.trim()) {
    const search = filters.search.trim();

    query = query.or(
      `title.ilike.%${search}%,summary.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }

 return (data ?? []) as unknown as CourseWithRelations[];
}

export async function getCourseBySlug(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select(`${COURSE_SELECT}, course_sessions (*)`)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  if (error) return null;
  return data as CourseWithRelations & { course_sessions: CourseSession[] };
}

export async function getUpcomingSessions(limit = 10): Promise<
  (CourseSession & { courses: Pick<Course, 'title' | 'slug'> | null })[]
> {
  if (!isSupabaseConfigured()) return [];
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course_sessions')
    .select('*, courses!inner ( title, slug, status )')
    .gte('start_date', new Date().toISOString().slice(0, 10))
    .in('status', ['scheduled', 'open'])
    .order('start_date', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as (CourseSession & {
    courses: Pick<Course, 'title' | 'slug'> | null;
  })[];
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getStandards(): Promise<Standard[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('standards')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Admin queries (RLS restricts these to admins)
// ---------------------------------------------------------------------------

export async function getDashboardStats() {
  if (!isSupabaseConfigured()) {
    return { courses: 0, sessions: 0, enquiries: 0, newEnquiries: 0 };
  }
  const supabase = await createClient();

  const [courses, sessions, enquiries, newEnquiries] = await Promise.all([
    supabase.from('courses').select('id', { count: 'exact', head: true }),
    supabase.from('course_sessions').select('id', { count: 'exact', head: true }),
    supabase.from('enquiries').select('id', { count: 'exact', head: true }),
    supabase
      .from('enquiries')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new'),
  ]);

  return {
    courses: courses.count ?? 0,
    sessions: sessions.count ?? 0,
    enquiries: enquiries.count ?? 0,
    newEnquiries: newEnquiries.count ?? 0,
  };
}

export async function getAllCourses(): Promise<CourseWithRelations[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select(COURSE_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CourseWithRelations[];
}

export async function getAllSessions(): Promise<CourseSession[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course_sessions')
    .select('*, courses ( title, slug )')
    .order('start_date', { ascending: true });
  if (error) throw error;
  return (data ?? []) as (CourseSession & { courses: { title: string; slug: string } | null })[];
}

export async function getEnquiries(): Promise<Enquiry[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return data;
}

// ---------------------------------------------------------------------------
// Offers / promotions
// ---------------------------------------------------------------------------

export async function getActiveOffers(): Promise<Offer[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false });
  if (error) throw error;
  // RLS already filters to active + in-date for public reads.
  return (data ?? []) as Offer[];
}

export type OfferWithCourse = Offer & { courses: { title: string; slug: string } | null };

export async function getAllOffers(): Promise<OfferWithCourse[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('offers')
    .select('*, courses ( title, slug )')
    .order('sort_order')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as OfferWithCourse[];
}

// Best offer applicable to a course: course-specific beats global, higher % wins.
export function offerForCourse(offers: Offer[], courseId: string): Offer | null {
  const applicable = offers.filter(
    (o) => o.is_active && (o.course_id === null || o.course_id === courseId),
  );
  if (applicable.length === 0) return null;
  const score = (o: Offer) =>
    (o.course_id === courseId ? 1000 : 0) +
    (o.discount_type === 'percent' ? o.discount_value : 0);
  return applicable.sort((a, b) => score(b) - score(a))[0];
}

export function offerDiscount(offer: Offer, price: number): number {
  const raw =
    offer.discount_type === 'percent'
      ? (price * offer.discount_value) / 100
      : offer.discount_value;
  return Math.min(Math.max(raw, 0), price);
}

export function offerBadgeLabel(offer: Offer): string {
  return offer.discount_type === 'percent'
    ? `${offer.discount_value}% OFF`
    : `₹${offer.discount_value.toLocaleString('en-IN')} OFF`;
}
