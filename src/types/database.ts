// Database types — regenerate after schema changes with:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
// For now this is a minimal hand-written placeholder covering the core tables.

export type AppRole = 'admin' | 'staff' | 'student';
export type CourseMode = 'classroom' | 'live_online' | 'hybrid' | 'self_paced';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type SessionStatus = 'scheduled' | 'open' | 'full' | 'completed' | 'cancelled';
export type EnquiryStatus = 'new' | 'in_progress' | 'converted' | 'closed';
export type EnquiryType = 'individual' | 'corporate' | 'custom_programme' | 'other';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: AppRole;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Standard {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  category_id: string | null;
  standard_id: string | null;
  duration_days: number | null;
  mode: CourseMode;
  price_inr: number | null;
  mrp_inr: number | null;
  certificate: boolean;
  featured: boolean;
  status: CourseStatus;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseSession {
  id: string;
  course_id: string;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  location: string | null;
  capacity: number | null;
  seats_filled: number;
  status: SessionStatus;
  meeting_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  enquiry_type: EnquiryType;
  course_interest: string | null;
  message: string | null;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
}
