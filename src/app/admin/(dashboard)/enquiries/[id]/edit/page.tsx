export const instant = false;

import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

import { updateEnquiry } from '../../actions';
import type { EnquiryStatus } from '@/types/database';

export const metadata = {
  title: 'Admin — Edit Enquiry',
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

const STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  converted: 'Converted',
  closed: 'Closed',
};

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  in_progress: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  converted: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  closed: 'border-(--border) bg-(--bg-subtle) text-(--text-secondary)',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default async function EditEnquiryPage({
  params,
  searchParams,
}: PageProps) {
  await connection();

  const [{ id }, query] = await Promise.all([
    params,
    searchParams,
  ]);

  const supabase = await createClient();

  // Verify logged-in user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/admin/login');
  }

  // Verify admin role
  const { data: isAdmin, error: adminError } =
    await supabase.rpc('is_admin');

  if (adminError || !isAdmin) {
    redirect('/admin/login');
  }

  // Fetch enquiry
  const { data: enquiry, error } = await supabase
    .from('enquiries')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !enquiry) {
    notFound();
  }

  const status = enquiry.status as EnquiryStatus;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/enquiries"
          className="inline-flex items-center gap-2 text-sm font-semibold text-(--text-secondary) transition hover:text-(--text-primary)"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m15 18-6-6 6-6" />
            <path d="M20 12H9" />
          </svg>

          Back to Enquiries
        </Link>

        <div className="mt-5">
          <h1 className="text-3xl font-black tracking-tight text-(--text-primary)">
            Edit Enquiry
          </h1>

          <p className="mt-2 text-sm text-(--text-secondary)">
            Review enquiry details, update its status and manage internal notes.
          </p>
        </div>
      </div>

      {/* Error feedback */}
      {query.error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {query.error}
        </div>
      )}

      {/* Enquiry information */}
      <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-(--text-primary)">
              {enquiry.name}
            </h2>

            <p className="mt-1 break-all text-sm text-(--text-secondary)">
              {enquiry.email}
            </p>
          </div>

          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
          >
            {STATUS_LABELS[status]}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 border-t border-(--border) pt-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-(--text-muted)">
              Phone
            </p>

            <p className="mt-1 text-sm font-semibold text-(--text-primary)">
              {enquiry.phone || 'Not provided'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-(--text-muted)">
              Enquiry Date
            </p>

            <p className="mt-1 text-sm font-semibold text-(--text-primary)">
              {formatDate(enquiry.created_at)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-(--text-muted)">
              Enquiry Type
            </p>

            <p className="mt-1 text-sm font-semibold capitalize text-(--text-primary)">
              {enquiry.enquiry_type.replaceAll('_', ' ')}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-(--text-muted)">
              Course Interest
            </p>

            <p className="mt-1 text-sm font-semibold text-(--text-primary)">
              {enquiry.course_interest || 'Not specified'}
            </p>
          </div>
        </div>

        {enquiry.message && (
          <div className="mt-6 border-t border-(--border) pt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-(--text-muted)">
              Message
            </p>

            <p className="whitespace-pre-wrap text-sm leading-6 text-(--text-secondary)">
              {enquiry.message}
            </p>
          </div>
        )}
      </section>

      {/* Update form */}
      <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-(--text-primary)">
            Manage Enquiry
          </h2>

          <p className="mt-1 text-sm text-(--text-secondary)">
            Update the enquiry status and add private notes for your team.
          </p>
        </div>

        <form
          action={updateEnquiry.bind(null, enquiry.id)}
          className="space-y-6"
        >
          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-semibold text-(--text-primary)"
            >
              Enquiry Status
            </label>

            <select
              id="status"
              name="status"
              defaultValue={enquiry.status}
              required
              className="w-full rounded-xl border border-(--border) bg-(--bg-page) px-4 py-3 text-sm text-(--text-primary) outline-none transition focus:border-orange-500"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-(--text-muted)">
              Choose the current progress of this enquiry.
            </p>
          </div>

          {/* Internal notes */}
          <div>
            <label
              htmlFor="internal_notes"
              className="mb-2 block text-sm font-semibold text-(--text-primary)"
            >
              Internal Notes
            </label>

            <textarea
              id="internal_notes"
              name="internal_notes"
              rows={5}
              defaultValue={enquiry.internal_notes ?? ''}
              placeholder="Example: Called the student, shared course details, follow-up required next week..."
              className="w-full resize-y rounded-xl border border-(--border) bg-(--bg-page) px-4 py-3 text-sm leading-6 text-(--text-primary) outline-none transition placeholder:text-(--text-muted) focus:border-orange-500"
            />

            <p className="mt-2 text-xs text-(--text-muted)">
              These notes are private and visible only to your admin team.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-3 border-t border-(--border) pt-5">
            <Link
              href="/admin/enquiries"
              className="inline-flex items-center justify-center rounded-xl border border-(--border) px-5 py-2.5 text-sm font-semibold text-(--text-secondary) transition hover:bg-(--bg-subtle)"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-(--text-primary) px-5 py-2.5 text-sm font-bold text-(--bg-page) transition hover:opacity-80"
            >
              Save Changes
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}