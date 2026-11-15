import Link from 'next/link';
import type { Enquiry, EnquiryStatus } from '@/types/database';

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
    month: 'short',
    year: 'numeric',
  });
}

export default function EnquiryCard({
  enquiry,
}: {
  enquiry: Enquiry;
}) {
  const status = enquiry.status;

  return (
    <article className="overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card) transition hover:border-(--border-strong)">
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-bold tracking-tight text-(--text-primary)">
                {enquiry.name}
              </h3>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>

            <p className="mt-1 break-all text-sm text-(--text-secondary)">
              {enquiry.email}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <span className="text-xs text-(--text-muted)">
              {formatDate(enquiry.created_at)}
            </span>

            <Link
              href={`/admin/enquiries/${enquiry.id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-4 py-2.5 text-sm font-semibold text-(--text-primary) transition hover:border-orange-500 hover:text-orange-500"
            >
              Edit

              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Contact information */}
        <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-(--border) bg-(--bg-page) p-4 sm:grid-cols-3">
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

        {/* Message */}
        {enquiry.message && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-(--text-muted)">
              Message
            </p>

            <p className="whitespace-pre-wrap text-sm leading-6 text-(--text-secondary)">
              {enquiry.message}
            </p>
          </div>
        )}

        {/* Existing internal notes */}
        {enquiry.internal_notes && (
          <div className="mt-5 rounded-xl border border-amber-500/15 bg-amber-500/5 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-400">
              Internal Notes
            </p>

            <p className="whitespace-pre-wrap text-sm leading-6 text-(--text-secondary)">
              {enquiry.internal_notes}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}